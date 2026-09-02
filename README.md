# Interatlética

Plataforma de organização e gestão de eventos entre atléticas universitárias — esportes, e-sports e eventos sociais.

Território comum. Nenhuma atlética é dona da plataforma; cada uma é dona dos seus dados.

---

## Decisões de arquitetura

Registradas aqui porque em um ano ninguém lembra por que a escolha foi feita — e a diretoria terá mudado.

**PWA, não app nativo.** O público chega por link de WhatsApp. Loja de aplicativos é atrito, e atualização por usuário é atrito recorrente. Notificação push a PWA também entrega.

**Multi-tenant desde a primeira linha.** `atletica_id` está em toda tabela de domínio desde a migration inicial. Adicionar coluna de tenant depois exige backfill, revisão de toda query e uma janela de manutenção — e alguma query vai ficar para trás.

**Entrada por convite.** Não existe autocadastro de atlética. Sem essa porta fechada, a moderação vira trabalho da diretoria já na primeira semana.

**Domínio único para API e PWA.** Cookie de sessão same-site, sem preflight de CORS, uma configuração só. Separar em `api.` depois é uma linha no Caddyfile.

**Flyway é o dono do schema.** `ddl-auto: validate`. O Hibernate nunca altera tabela; se a entidade divergir da migration, a aplicação não sobe — e isso é o comportamento desejado.

**Ganchos financeiros inertes.** As colunas `valor` e `status_pagamento` existem em `evento` e `inscricao` mas nada as usa. Custo zero hoje; se a cobrança entrar, não é migration destrutiva.

---

## Estrutura

```
interatletica/
├── docker-compose.yml          topologia completa
├── .env.example                variáveis (copie para .env)
├── api/                        Spring Boot 3 · Java 21
│   ├── Dockerfile              build em duas etapas, usuário não-root
│   ├── pom.xml
│   └── src/main/
│       ├── java/br/com/interatletica/
│       │   ├── comum/tenant/      isolamento entre atléticas
│       │   ├── comum/seguranca/   OAuth, sessão, permissão por papel
│       │   ├── comum/auditoria/   registro de quem fez o quê
│       │   ├── comum/erro/        tratamento global
│       │   ├── identidade/        usuário, convite, sessão
│       │   ├── atletica/          tenant, membros, papéis
│       │   ├── evento/            evento, inscrição, check-in
│       │   ├── torneio/           equipe, chaveamento, partida (Fase 2)
│       │   └── gestao/            tarefa, aviso (Fase 3)
│       └── resources/
│           ├── application.yml
│           └── db/migration/V1__baseline.sql
├── web/                        PWA React + Vite + TypeScript
│   ├── Dockerfile              build em duas etapas, servido por nginx
│   ├── vite.config.ts          PWA, service worker, proxy de dev
│   └── src/
│       ├── api/                cliente HTTP, tipos, mapa de rotas
│       ├── dados/              a fachada: API real ou demonstração
│       ├── demo/               dados fictícios e loja em memória
│       ├── ui/                 design system, ícones, tema por atlética
│       ├── layout/             casca do app: barra lateral, topo, busca
│       ├── sessao/             quem está logado e com que papel
│       ├── RotasDoHub.tsx      as telas de trabalho, carregadas sob demanda
│       └── paginas/            públicas na raiz, hub/ para a diretoria
├── vercel.json                 deploy do front em modo demonstração
└── infra/
    ├── Caddyfile               TLS automático + headers de segurança
    └── scripts/
        ├── deploy.sh           backup → pull → build → health check
        └── backup.sh           pg_dump → gzip → R2
```

**Pacote por domínio, não por camada.** `evento/EventoController` fica ao lado de `evento/EventoService`. Quando o sistema crescer, cada módulo sai inteiro; com pacote por camada, sai espalhado.

---

## Modelo de dados

16 tabelas. Migration validada contra PostgreSQL real, com as regras de negócio testadas contra dados.

| Grupo | Tabelas |
|---|---|
| Identidade | `usuario`, `convite` |
| Tenant | `atletica`, `membro` |
| Eventos | `evento`, `evento_organizador`, `inscricao` |
| Equipes | `equipe`, `equipe_membro` |
| Torneios | `torneio`, `torneio_participante`, `partida`, `partida_parcial` |
| Gestão | `tarefa`, `aviso` |
| Auditoria | `registro_auditoria` |

Pontos que merecem atenção:

- **Permissão mora em `membro`, não em `usuario`.** A mesma pessoa pode ser presidente numa atlética e membro comum em outra. Papel é relativo ao vínculo.
- **`equipe` pertence à atlética, não ao evento.** O time de vôlei é o mesmo o ano todo; ele *se inscreve* em eventos.
- **`inscricao.atletica_id` é a atlética de ORIGEM do inscrito**, não a dona do evento. É o que responde "quantos vieram de cada atlética" sem join extra.
- **`partida.proxima_partida_id` + `slot_proximo`** transformam uma lista de partidas em chaveamento navegável: quem vence a quartas 1 entra automaticamente no slot A da semifinal 1.
- **`torneio_participante.nome_exibicao` é congelado** no momento da inscrição. A tabela do torneio de 2026 não muda se a equipe se renomear em 2027.
- **Reinscrição após cancelamento é permitida** por índice único parcial (`WHERE status <> 'CANCELADA'`), sem abrir brecha para inscrição duplicada.

---

## Isolamento entre atléticas

Três camadas, porque uma só falha em silêncio:

1. `EntidadeDeAtletica` — superclasse com `atletica_id` e definição do filtro do Hibernate.
2. `FiltroContextoAtletica` — resolve o slug da URL (`/api/a/{slug}/...`) e publica no contexto da requisição.
3. `AtivadorFiltroAtletica` — aspecto que liga o filtro na sessão do Hibernate ao abrir cada transação.

O ponto frágil: o Hibernate **não herda** `@Filter` de uma `@MappedSuperclass`. Cada entidade concreta precisa declarar:

```java
@Entity
@Filter(name = EntidadeDeAtletica.FILTRO, condition = "atletica_id = :atleticaId")
public class Evento extends EntidadeDeAtletica { ... }
```

Esquecer isso não gera erro de compilação nem exceção em runtime — a consulta simplesmente devolve dados de todas as atléticas. Por isso `IsolamentoDeAtleticaTest` varre o classpath e **quebra o build** se alguma entidade herdar de `EntidadeDeAtletica` sem o filtro. Não confie em revisão de PR para pegar isso.

**O segundo ponto frágil, e ele já mordeu:** a ordem do aspecto. No Spring AOP, quem tem o menor valor de `order` roda por FORA. O `AtivadorFiltroAtletica` nasceu com `@Order(100)` enquanto o proxy transacional fica em `Integer.MAX_VALUE` por padrão — ou seja, o aspecto rodava por fora da transação. Ele chamava `unwrap(Session.class)` sem transação ativa, o Spring criava uma sessão temporária, o filtro era ligado nela, e ela era descartada. A transação abria em seguida com sessão limpa, **sem filtro**.

O resultado era o pior caso possível: nenhum erro, nenhuma exceção, e o isolamento simplesmente não valendo. O teste arquitetural não via — ele confere se a anotação existe, não se ela chega a valer.

Hoje as ordens são explícitas em `OrdemDosAspectos`, e `OrdemDoFiltroDeAtleticaTest` trava a invariante: mexer nos números sem entender o efeito quebra o build em vez de vazar dado. A cadeia correta, de fora para dentro, é `@PreAuthorize` → transação → filtro de atlética → método.

---

## O front

Dois ambientes, com cascas diferentes e públicos diferentes:

**O público** — topo simples e conteúdo estreito. A página da atlética, a página do evento (o link que circula no WhatsApp), o convite e o quadro de medalhas. Login só no último passo, na hora de se inscrever: pedir conta antes de dizer do que se trata é pedir crachá para quem só quer saber a hora da festa. Quem chega aqui não tem navegação de produto para usar, e oferecer uma só atrapalha.

**O ambiente de trabalho** — barra lateral com onze grupos, topo com pesquisa global, notificações, seletor de organização e ações rápidas. É onde a diretoria passa o tempo, e onde a densidade se paga.

A portaria fica deliberadamente fora dos dois — é tela de tarefa única, sem navegação, porque cada elemento a mais é um toque errado esperando acontecer.

### Os módulos

A navegação agrupa por assunto, não por tela solta. Quarenta itens numa coluna não é navegação, é lista telefônica.

| Grupo | O que resolve |
|---|---|
| **Minha atlética** | visão geral, membros, diretoria em organograma, gestões, documentos, patrimônio |
| **Gestão** | tarefas em quadro e lista, projetos com modelo da rede, reuniões com pauta e ata, decisões com votação, metas |
| **Eventos** | calendário unificado, eventos, campeonatos com chave e tabela, inscrições, viagens |
| **Esportes** | equipes, atletas, jogos, resultados e rankings |
| **Financeiro** | caixa, receitas, despesas, orçamento previsto contra realizado, prestação de contas |
| **Rede** | explorar atléticas com mapa, feed, comunidades, parcerias, pedidos de ajuda, amistosos |
| **Conhecimento** | guias, modelos, banco de experiências, mentoria, banco de talentos |
| **Mercado** | fornecedores avaliados, oportunidades, compras coletivas, funil de patrocínio, loja |
| **Comunicação** | notícias, campanhas com calendário editorial, biblioteca de mídia, mural de avisos |

Três decisões que valem registro:

- **Resumo primeiro, detalhe depois.** Nenhuma página abre com tabela. O financeiro abre no saldo, o patrimônio abre no resumo por categoria, o campeonato abre na fase atual. A tabela existe — em aba, ou depois de rolar.
- **O painel muda com a função.** O tesoureiro abre no caixa, o diretor de esportes abre nos jogos, o membro abre no que pode fazer. A função vem do cargo que a própria atlética escreveu, com o papel como rede de segurança — impor uma lista fechada de cargos quebraria toda atlética que se organiza de outro jeito.
- **Item sem permissão não aparece.** Mostrar e negar no clique é pior que não mostrar, porque promete uma coisa que não vai acontecer.

### Os módulos conversam

Um campeonato criado aparece no calendário, no painel, nos eventos, nas tarefas e no financeiro — sem ninguém cadastrar duas vezes. O saldo, o orçamento realizado e o gráfico de evolução são **derivados dos lançamentos**, e não totais guardados à parte que desandam na primeira correção. A tabela de classificação sai das partidas encerradas: corrigir um placar reordena a tabela sozinho.

É a diferença entre um ecossistema e um conjunto de páginas com o mesmo cabeçalho.

### Peso

O ambiente de trabalho é carregado sob demanda (`RotasDoHub`, via `lazy`). São mais de quarenta telas, e quem abre um link de evento no WhatsApp não usa nenhuma delas — sem a divisão, a página pública pagaria pelo app inteiro antes de mostrar a primeira linha.

Não há biblioteca de ícones nem de gráficos. Os cerca de setenta símbolos são SVG de traço escritos em `ui/icones.tsx`, na mesma grade e com a mesma espessura; os gráficos são `path` calculado à mão. Qualquer pacote custaria mais bytes do que os arquivos inteiros — justamente na primeira visita, que é a que decide se a pessoa espera carregar.

### Datas do demo são relativas

A âncora temporal do modo demonstração é **hoje**, não uma data fixa. Era fixa, e a intenção estava certa mas o efeito era o oposto: com o calendário andando e a âncora parada, todo evento "daqui a três dias" virava "há duas semanas", e uma demonstração aberta um mês depois mostrava um campeonato que já tinha acontecido.

### Cada atlética pinta o hub

`atletica.cor_primaria` já existia no schema e era decorativa. Agora o hub inteiro se pinta com ela: entrar no dos Dragões e no das Corujas é visivelmente entrar em lugares diferentes, sem que nenhuma seja dona da plataforma.

O trabalho de verdade está em `ui/tema.ts`: qualquer cor que a diretoria escolher precisa continuar legível. A luminância relativa da WCAG decide se o texto por cima sai branco ou quase preto — é a conta que evita "amarelo com texto branco" —, e a cor é clareada ou escurecida conforme o tema, porque cor fechada some no fundo escuro e cor aberta some no claro. Ao sair do hub o azul da plataforma volta; sem isso, a cor de uma atlética vazaria para a tela de descoberta e a plataforma passaria a parecer dela.

### Modo demonstração

No Vercel só o front está publicado — a API precisa de um Postgres. `dados/index.ts` é uma fachada: com `VITE_MODO_DEMO=true` os dados vêm de uma loja em memória, senão vêm da API.

A loja é **mutável de propósito**. Dá para criar evento, publicar, convidar, cancelar inscrição, mover tarefa e registrar entrada na portaria — e o efeito persiste enquanto a aba estiver aberta. Um demo só de leitura vira catálogo de telas, e ninguém entende um produto olhando print. Recarregar volta tudo ao início, que é o comportamento desejado: cada visitante recebe o mesmo ponto de partida.

Os dados são fictícios, de instituições fictícias, e uma faixa no topo diz isso. Sem ela, alguém abre o link, vê nomes e telefones nas listas de presença e conclui que a plataforma vaza dado de aluno.

**Fases 2 e 3 são só demonstração por enquanto.** Equipes, torneios, tarefas e avisos têm tabela na migration e tela aqui, mas ainda não têm endpoint — o front está à frente do backend, e isso está explícito em cada método da fachada em vez de escondido atrás de um 404.

### Deploy no Vercel

Importe o repositório. O `vercel.json` na raiz cuida do resto: o install padrão é neutralizado (não há `package.json` na raiz), a instalação acontece dentro do `buildCommand`, e o `VITE_MODO_DEMO=true` liga a demonstração. Não é preciso configurar diretório raiz nem variável de ambiente na interface.

**Não coloque comentários no `vercel.json`.** O schema do Vercel é `additionalProperties: false` em todos os níveis, então a convenção `"//"` — que funciona em `package.json` — derruba o deploy com *"should NOT have additional property"*. O motivo de cada linha do arquivo está aqui nesta seção, que é onde ele pode ser lido sem quebrar nada.

O rewrite é `/(.*)` para tudo, sem exceção para `/assets/`. Não é descuido: o Vercel serve arquivo estático existente **antes** de aplicar rewrite, então os assets nunca chegam nessa regra. Um *negative lookahead* ali seria complexidade a mais defendendo contra um caso que não acontece.

---

## Permissão

Papel é propriedade do **vínculo**, não do usuário — a mesma pessoa é presidente numa atlética e membro comum em outra. Por isso papel não vira `GrantedAuthority` no login: a pergunta "qual é o papel?" só tem resposta com a atlética em mãos.

Quem responde é o bean `Permissoes`, usado nos controllers:

```java
@PreAuthorize("@permissao.diretor()")
```

| Quem | Pode |
|---|---|
| **Operador** | criar atlética, suspender/arquivar. Vem de `app.operadores` no `.env`, não do banco |
| **Presidente** | convidar, promover, desligar · tudo que o diretor pode |
| **Diretor** | criar e gerenciar evento, ver lista de presença, operar portaria |
| **Membro** | ver o que é interno da atlética, inscrever-se |
| **Autenticado** | inscrever-se em evento `PUBLICO` de qualquer atlética |

Duas regras que valem registro:

- **Escrita exige atlética ATIVA.** Suspensa ou arquivada continua legível — o histórico não some — mas não aceita escrita. `membro()`, que é a permissão de leitura, não faz essa checagem.
- **Operador não vira membro de nada.** Ele abre a atlética, convida o primeiro presidente e sai. Território comum.

Uma trava específica: o servidor recusa rebaixar ou desligar a **última presidência ativa**. Atlética sem presidente não tem quem convide nem quem promova — precisaria de intervenção manual no banco para voltar a funcionar, e o caso aparece de verdade na virada de gestão, quando o presidente que sai se desliga antes de promover o sucessor.

---

## Como a plataforma começa

Não existe autocadastro, então a primeira atlética precisa de alguém que abra a porta:

1. Coloque seu e-mail em `APP_OPERADORES` no `.env` e suba a aplicação.
2. `POST /api/atleticas` com nome, instituição e o e-mail de quem presidirá.
3. A resposta traz a atlética **e o link de convite do presidente**. Mande o link.
4. O presidente aceita, entra, e a partir daí convida o resto.

Os passos 2 e 3 são uma transação só: atlética sem presidente é registro morto, e sair com a atlética criada e o convite não criado produziria exatamente esse estado.

---

## Rodando

**Pré-requisitos:** Docker + Docker Compose. Nada mais.

```bash
git clone <repo> interatletica && cd interatletica
cp .env.example .env       # preencha senha do banco e credenciais do Google
docker compose up -d --build
```

A API sobe em `:8080` atrás do Caddy. O Flyway aplica a migration na primeira subida.

**Deploy na EC2:**

```bash
./infra/scripts/deploy.sh main
```

O script faz backup antes de tocar em qualquer coisa e aborta se o backup falhar. Depois valida o health check e só então declara sucesso.

**Google OAuth** — no console, a URI de redirecionamento autorizada é:

```
https://interatletica.com.br/login/oauth2/code/google
```

`server.forward-headers-strategy: framework` já está configurado. Sem ele, o Spring monta o redirect com o host interno do container e o Google recusa com `redirect_uri_mismatch`.

**Desenvolvimento sem Docker** — API e PWA em processos separados:

```bash
cd api && mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

```bash
cd web && npm install && npm run dev
```

O Vite faz proxy de `/api`, `/oauth2` e `/login` para `:8080`. Isso não é conveniência: mantém tudo na mesma origem, como em produção atrás do Caddy. Sem o proxy, o cookie de sessão seria cross-site e o login local se comportaria diferente do de produção — o pior tipo de diferença entre ambientes.

---

## Testes

```bash
cd api && mvn test
```

82 testes. Os que exigem Docker se **pulam sozinhos** quando ele não existe, em vez de derrubar o build — um build que falha por falta de Docker ensina a rodar `-DskipTests`, que é como se perde uma suíte inteira. No CI o Docker existe e eles rodam de verdade.

O que cada grupo pega:

**`IsolamentoDeAtleticaTest`** — varre o classpath e quebra o build se alguma entidade herdar de `EntidadeDeAtletica` sem declarar `@Filter`. Verifica também o caminho de fuga: entidade que declara `atletica_id` por conta própria, sem herdar a superclasse, precisa estar numa lista de exceções **com justificativa escrita** — hoje só `Inscricao` e `EventoOrganizador`, pelos motivos da seção de modelo de dados. E confere que a varredura não voltou vazia: um teste de isolamento que não encontra entidade nenhuma passa sem verificar nada.

**`ContextoDaAplicacaoTest`** — sobe o contexto inteiro do Spring sem banco. Parece um teste que não testa nada; não é. Subir o contexto obriga o Spring Data a **compilar toda `@Query` do projeto** contra o metamodelo do Hibernate. Um `i.usuario.nome` escrito como `i.usuario.name`, um literal de enum com pacote errado, um `join fetch` em associação inexistente — nada disso é erro de compilação Java, e todos derrubam a aplicação no primeiro startup em produção. Aqui derrubam o build, e sem exigir Docker.

**`SlugsTest`** — o contrato protegido não é estético, é o `CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`. Slug fora do formato não vira erro de validação: vira violação de constraint, ou seja, 500 na cara de quem só quis criar um evento.

**`SchemaCompativelTest`** *(exige Docker)* — sobe a aplicação contra um Postgres real e responde a pergunta mais perigosa do projeto: as entidades JPA batem com o schema? Com `ddl-auto: validate`, divergência não é aviso — a aplicação não sobe, e como o Hibernate nunca altera tabela, isso só apareceria no primeiro startup do ambiente que tem banco. Verifica também que a migration criou as 16 tabelas, que `uk_inscricao_usuario` continua **parcial** (é ele que permite reinscrever depois de cancelar) e que a auditoria grava JSONB e INET pelos casts do SQL.

**`EventoTest`, `InscricaoTest`, `ConviteTest`** — ciclo de vida das entidades, sem Spring e sem banco. As regras moram nas entidades justamente para valerem por qualquer caminho de chamada. Vários testes aqui protegem CHECKs do banco: `posicao_espera` que anda junto com o status, token de check-in no formato exato do `DEFAULT` da coluna, convite de uso único.

**`PapelTest`** — a hierarquia usa `ordinal()`, então reordenar as constantes do enum inverteria a permissão sem erro de compilação. O teste transforma isso em build vermelho.

**`ListaDeParticipantesCsvTest`** e **`PropriedadesDaAplicacaoTest`** — o CSV que abre no Excel pt-BR (BOM, ponto e vírgula, fuso de São Paulo, aspas escapadas) e a lista de operadores tolerando caixa e espaço no `.env`, que é o que evita trancar do lado de fora quem deveria criar a primeira atlética.

Ainda não coberto: o isolamento entre atléticas exercitado ponta a ponta contra o banco. O teste arquitetural garante que o filtro está *declarado* em toda entidade; falta um que prove que ele *filtra*.

---

## Roadmap

**Fase 1 — MVP** *(implementada)*
Atléticas, membros e papéis · CRUD de evento · página pública com link curto · inscrição individual · lista exportável de participantes.
Critério de pronto: substitui a planilha e o formulário.

Além do previsto, entraram porque o MVP não fecha sem eles: lista de espera com promoção automática quando alguém desiste, check-in por código na portaria, e a contagem de inscritos por atlética de origem — o número que a diretoria de um interatlética quer ver.

Falta antes de considerar a fase encerrada: testes de integração com Testcontainers (escritos contra Postgres real, exigem Docker) e a leitura do QR pela câmera — hoje a portaria aceita o código digitado ou colado, que é o caminho que funciona no escuro do ginásio quando a câmera falha.

**Fases 2 a 7 — front implementado, API pendente**

O front cobre hoje os módulos de gestão, eventos e esportes, financeiro, rede, conhecimento, mercado e comunicação — navegáveis, com dados fictícios coerentes entre si e um cabeçalho de *prévia* em cada tela que ainda não persiste. A ordem de implementação da API acompanha o valor por esforço:

| Fase | Escopo | Estado |
|---|---|---|
| 2 — Torneios | equipes, chaveamento, resultado, tabela ao vivo | front pronto, API pendente |
| 3 — Gestão | tarefas, projetos, reuniões, decisões, metas, documentos | front pronto, API pendente |
| 4 — Rede | explorar, feed, comunidades, pedidos de ajuda, parcerias, amistosos | front pronto, API pendente |
| 5 — Conhecimento | guias, modelos, experiências, fornecedores avaliados | front pronto, API pendente |
| 6 — Financeiro | caixa, orçamento, prestação de contas, patrimônio, patrocínio | front pronto, API pendente |
| 7 — Inteligência | indicadores, comparação com a rede, conquistas, mentoria | front pronto, API pendente |

**Fora de escopo, por decisão de produto**

A plataforma **não processa pagamento**. A loja é vitrine — produto, preço, estoque e como combinar; a negociação acontece pelos canais que a atlética já usa. O financeiro registra o que entrou e saiu para a prestação de contas existir; ele não movimenta dinheiro. Receber de estudante cria responsabilidade fiscal e de reembolso que uma atlética não tem como assumir por meio de um app de terceiros, e que a plataforma não quer assumir por ela.

---

## Segurança

- Banco sem porta publicada; rede `interna` sem saída para a internet
- Containers com `no-new-privileges`, API rodando como usuário não-root
- Actuator bloqueado na borda (404 no Caddy)
- CSP restritiva; `camera=(self)` é intencional, para o leitor de QR na portaria
- Backup verificado: dump vazio ou gzip corrompido falha o script em vez de reportar sucesso
- `registro_auditoria` guarda quem fez o quê — a diretoria muda todo ano
