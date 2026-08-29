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
│       ├── sessao/             quem está logado e com que papel
│       ├── componentes/        peças repetidas e o hook de busca
│       └── paginas/            uma por tela
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

**Fase 2 — Torneios**
Equipes · chaveamento · registro de resultado · tabela ao vivo · regulamento anexo · check-in por QR code.

**Fase 3 — Gestão**
Tarefas por evento · avisos com push · painel de presença e engajamento por atlética.

**Fase 4 — Só se houver demanda real**
Sócios e carteirinha digital · financeiro por evento.

---

## Segurança

- Banco sem porta publicada; rede `interna` sem saída para a internet
- Containers com `no-new-privileges`, API rodando como usuário não-root
- Actuator bloqueado na borda (404 no Caddy)
- CSP restritiva; `camera=(self)` é intencional, para o leitor de QR na portaria
- Backup verificado: dump vazio ou gzip corrompido falha o script em vez de reportar sucesso
- `registro_auditoria` guarda quem fez o quê — a diretoria muda todo ano
