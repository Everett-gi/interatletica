/**
 * O que cada tela é, para que serve e como se usa.
 *
 * <p>Um registro central, e não um texto solto dentro de cada página. Com
 * quarenta telas, a explicação escrita no componente vira a primeira coisa a
 * envelhecer — e a última que alguém revisa. Aqui as quarenta ficam lado a
 * lado, o que torna óbvio quando uma está vaga demais ou repetindo a outra.</p>
 *
 * <p>A regra de escrita: <strong>diga o porquê, não o óbvio</strong>. "Aqui
 * você gerencia seus documentos" não ensina nada. "Guardar o contrato na hora
 * em que ele é assinado é o que evita procurá-lo um ano depois" ensina.</p>
 */

export interface Explicacao {
  /** Título curto da tela, para o cabeçalho da ajuda. */
  titulo: string
  /** Uma frase: o que esta tela é. */
  oQueE: string
  /** Dois a quatro passos concretos de como usar. */
  comoUsar: string[]
  /** O motivo de a tela existir, quando ele não é evidente. */
  porQue?: string
}

/**
 * Chaveado pelo caminho relativo ao hub. A busca é pelo prefixo mais longo,
 * então `financeiro/receitas` ganha de `financeiro`, e uma rota de detalhe
 * herda a explicação da sua lista sem precisar repeti-la.
 */
export const EXPLICACOES: Record<string, Explicacao> = {
  '': {
    titulo: 'Início',
    oQueE: 'O resumo do que exige atenção agora — e ele muda conforme a sua função na atlética.',
    comoUsar: [
      'Os quatro números do topo levam à tela de cada assunto: clicar em "tarefas abertas" abre o quadro.',
      'Em "Minhas pendências" fica o que depende de você: votação em aberto e tarefa com o seu nome.',
      '"Da rede" mostra o que outras atléticas publicaram — é por onde a colaboração começa.',
    ],
    porQue: 'O tesoureiro abre no caixa, o diretor de esportes nos jogos, o membro no que pode fazer. Um painel igual para todos é um painel bom para ninguém.',
  },

  'boas-vindas': {
    titulo: 'Primeiros passos',
    oQueE: 'A lista curta do que fazer para a plataforma começar a servir para alguma coisa.',
    comoUsar: [
      'Cada passo leva à tela onde ele acontece de verdade — não há cadastro paralelo.',
      'Os itens se marcam sozinhos quando você faz a coisa. Não há caixa para marcar à mão.',
      'Dá para fazer aos poucos: a plataforma funciona com o que existir.',
    ],
  },

  // ---------------- Minha atlética ----------------
  atletica: {
    titulo: 'Visão geral',
    oQueE: 'O retrato da organização: quem faz parte, o que está em curso e o que já ficou registrado.',
    comoUsar: [
      'Use para responder "como está a atlética?" — o Início responde "o que eu faço hoje?".',
      'A atividade recente mostra quem fez o quê e quando; é a memória da gestão se formando.',
    ],
  },
  membros: {
    titulo: 'Membros',
    oQueE: 'Quem tem vínculo com a atlética, com que papel, e os convites em aberto.',
    comoUsar: [
      'Convidar é atribuição da presidência: quem controla a entrada controla a atlética.',
      'O convite é endereçado a um e-mail — link encaminhado no grupo não matricula o grupo.',
      'Quem sai continua no histórico. Apagar membro apagaria as inscrições e resultados dele.',
    ],
    porQue: 'O papel mora no vínculo, não na pessoa: a mesma conta preside aqui e é membro comum em outra atlética.',
  },
  diretoria: {
    titulo: 'Diretoria',
    oQueE: 'A estrutura de cargos desta gestão, em organograma ou em lista.',
    comoUsar: [
      'O organograma responde "quem responde a quem"; a lista responde "quem é e como falo com ele".',
      'Os níveis saem do cargo que a própria atlética escreveu — renomear um cargo reorganiza o desenho.',
    ],
    porQue: 'A plataforma não impõe hierarquia fixa porque cada atlética organiza a sua de um jeito.',
  },
  'gestao/transicao': {
    titulo: 'Transição de gestão',
    oQueE: 'O checklist do que precisa passar de uma diretoria para a outra.',
    comoUsar: [
      'Marque cada item conforme ele for realmente entregue — a barra mostra o quanto falta.',
      'Comece pelos acessos: rede social, e-mail e banco são o que mais se perde na troca.',
      'O relatório final e a reunião de passagem fecham o ciclo.',
    ],
    porQue: 'É a tela que existe para tornar impossível a frase "a diretoria nova não sabe como a antiga fazia".',
  },
  gestao: {
    titulo: 'Gestão',
    oQueE: 'Cada diretoria que passou por aqui, o que entregou e o que deixou anotado.',
    comoUsar: [
      'Abrir uma gestão anterior mostra integrantes, conquistas, problemas e recomendações.',
      'A parte mais útil do relatório é a dos problemas — e é a que quase sempre falta.',
    ],
  },
  documentos: {
    titulo: 'Documentos',
    oQueE: 'A biblioteca da atlética: estatuto, atas, contratos, regulamentos e histórico.',
    comoUsar: [
      'Guarde o documento na hora em que ele é assinado; procurar um ano depois é o problema real.',
      'A etiqueta de visibilidade diz o que está aberto à rede e o que é só da diretoria.',
    ],
  },
  patrimonio: {
    titulo: 'Patrimônio',
    oQueE: 'O inventário do que a atlética tem, onde está e com quem.',
    comoUsar: [
      'Comece pelo resumo por categoria; a lista completa vem depois.',
      'Marque item danificado como tal: a baixa registrada é o que a próxima gestão precisa ver.',
    ],
    porQue: 'Sem inventário, o que se perde na troca de gestão não é o item — é saber que ele existia.',
  },
  relatorios: {
    titulo: 'Indicadores',
    oQueE: 'Quem apareceu nos eventos, de onde veio, e como a atlética está em relação à rede.',
    comoUsar: [
      'A taxa de presença é o número que justifica abrir mais vagas do que a capacidade — ou não abrir.',
      'Na comparação, o traço no meio da barra é a média da rede: à direita é acima, à esquerda é abaixo.',
    ],
    porQue: 'A comparação é agregada e anônima. Nenhum dado privado de outra atlética aparece aqui, nem o seu aparece para elas.',
  },

  // ---------------- Gestão ----------------
  tarefas: {
    titulo: 'Tarefas',
    oQueE: 'O quadro da diretoria: quem está com o quê.',
    comoUsar: [
      'Arraste entre as colunas, ou use as setas na ficha — funciona igual pelos dois caminhos.',
      'O filtro "sem responsável" é o mais útil: tarefa sem nome é tarefa de ninguém.',
      'A lista ganha do quadro quando você quer escanear prazo de trinta tarefas de uma vez.',
    ],
    porQue: 'O problema de uma diretoria não é "o que falta" — é "quem está com o quê", e a coluna do meio é o que a lista esconde.',
  },
  'projetos/novo': {
    titulo: 'Novo projeto',
    oQueE: 'Começar um projeto a partir de um roteiro que outra atlética já rodou.',
    comoUsar: [
      'Escolha um modelo e veja as tarefas que ele cria antes de confirmar.',
      'O número de usos diz quantas atléticas já aproveitaram aquele roteiro.',
      'Dá para começar em branco, mas quase nunca compensa.',
    ],
    porQue: 'O roteiro de calourada dos Leões tem três tarefas que só existem porque a edição de 2024 deles deu errado. Usar o modelo é herdar o erro sem pagá-lo.',
  },
  projetos: {
    titulo: 'Projetos',
    oQueE: 'O que a atlética está construindo, com prazo, responsável e orçamento.',
    comoUsar: [
      'O progresso vem das tarefas concluídas, não de digitação manual.',
      'Projeto social é um projeto como outro: o que muda é o que a página de detalhe destaca.',
      'Ao encerrar, escreva o resultado — é o que transforma o projeto em aprendizado da atlética.',
    ],
  },
  reunioes: {
    titulo: 'Reuniões',
    oQueE: 'Pauta antes, ata depois.',
    comoUsar: [
      'Escreva a pauta com responsável e tempo por ponto: reunião sem pauta vira conversa.',
      'A pauta pode gerar uma decisão, e a decisão aponta de volta para a reunião.',
      'Registre a ata na semana. Depois disso ninguém lembra do que foi deliberado.',
    ],
    porQue: 'Ata não é formalidade: é a prova de que a decisão foi coletiva, e é o que existe quando alguém contestar um gasto dois anos depois.',
  },
  decisoes: {
    titulo: 'Decisões',
    oQueE: 'O que a diretoria precisa escolher, e o registro do que já escolheu.',
    comoUsar: [
      'Cada decisão tem opções, votos, quórum e prazo. Trocar de opção move o seu voto.',
      'O voto fica registrado com o seu nome e é visível para a diretoria.',
      'Depois de fechada, a decisão vira histórico: é o que responde "por que decidimos assim?".',
    ],
    porQue: 'Decisão de atlética costuma morrer no grupo de mensagens — discute-se três dias, alguém decide, e seis meses depois ninguém lembra quem escolheu.',
  },
  metas: {
    titulo: 'Metas',
    oQueE: 'O que esta gestão se comprometeu a entregar, com número e prazo.',
    comoUsar: [
      'Três a seis metas bastam. "Melhorar a comunicação" não é meta, é intenção.',
      'Meta com número é o que permite dizer, no fim do ano, se a gestão entregou.',
    ],
  },

  // ---------------- Eventos e esportes ----------------
  calendario: {
    titulo: 'Calendário',
    oQueE: 'Tudo o que tem data em toda a plataforma, num lugar só.',
    comoUsar: [
      'Evento, reunião, jogo, viagem, prazo de tarefa e pagamento previsto aparecem juntos.',
      'Use os filtros por categoria para isolar um assunto sem abrir seis módulos.',
      'A visão "agenda" é melhor no celular; a de "mês" é melhor para planejar.',
    ],
    porQue: 'Nada aqui é cadastrado duas vezes: um campeonato criado nos eventos aparece aqui sozinho.',
  },
  'eventos/novo': {
    titulo: 'Novo evento',
    oQueE: 'Criar um evento — campeonato, jogo, festa, treino ou reunião.',
    comoUsar: [
      'O evento nasce como rascunho. Nada fica visível até você publicar.',
      'A visibilidade decide quem enxerga: público, só a rede, ou só a sua atlética.',
      'Capacidade preenchida liga a lista de espera com promoção automática.',
    ],
  },
  eventos: {
    titulo: 'Eventos',
    oQueE: 'Tudo que a atlética marcou, incluindo o que ainda é rascunho.',
    comoUsar: [
      'O filtro começa em "todos" porque o que mais depende de você é justamente o não publicado.',
      'Cada evento publicado tem um endereço curto para colar no grupo.',
    ],
  },
  campeonatos: {
    titulo: 'Campeonatos',
    oQueE: 'Chaveamento, tabela e classificação dos torneios da atlética.',
    comoUsar: [
      'Registrar o placar de uma partida move o vencedor para o slot certo da próxima, sozinho.',
      'A classificação sai das partidas encerradas: corrigir um resultado reordena a tabela.',
    ],
    porQue: 'Um campeonato é um evento — ele acontece dentro de um. Esta seção é um atalho para quem pensa "quero ver a tabela", não um conceito paralelo.',
  },
  inscricoes: {
    titulo: 'Inscrições',
    oQueE: 'Quantos entraram em cada evento, de onde vieram e quem está na espera.',
    comoUsar: [
      'A promoção da lista de espera é automática quando alguém cancela.',
      '"De onde vieram" é o número que decide se vale repetir um interatlética.',
    ],
  },
  viagens: {
    titulo: 'Viagens',
    oQueE: 'Transporte, hospedagem, pagamentos e documentos de cada deslocamento.',
    comoUsar: [
      'Acompanhe os dois números que dão dor de cabeça na véspera: quem pagou e quem entregou documento.',
      'Registre a viagem cedo — com prazo, dá para orçar transporte com três empresas.',
    ],
  },
  equipes: {
    titulo: 'Equipes',
    oQueE: 'O elenco por modalidade.',
    comoUsar: [
      'A equipe é da atlética e atravessa os eventos: ela se inscreve em torneios, não é criada por evento.',
      'Defina um capitão por equipe, com nome na lista e não só de boca.',
    ],
  },
  atletas: {
    titulo: 'Atletas',
    oQueE: 'Quem defende a atlética, em que modalidade, e se a documentação está em dia.',
    comoUsar: [
      'Use o filtro "documentação pendente" antes de cada campeonato.',
      'Peça matrícula e atestado na inscrição, não na véspera.',
    ],
    porQue: 'Atleta sem matrícula ativa é o motivo número um de recurso — e cobrar na véspera é como equipes perdem atleta por WO.',
  },
  jogos: {
    titulo: 'Jogos',
    oQueE: 'Amistosos, jogos de campeonato e o resultado de cada um.',
    comoUsar: [
      'Inclui o que não está em chaveamento: amistoso, treino contra outra atlética, preparação.',
      'Para achar adversário, use Amistosos na seção Rede.',
    ],
  },
  resultados: {
    titulo: 'Resultados',
    oQueE: 'Como a temporada está indo — para a atlética e para a rede.',
    comoUsar: [
      'O quadro de medalhas é o número que a rede inteira acompanha.',
      'Os rankings são opcionais e cada aba diz o que o número mede.',
    ],
  },

  // ---------------- Financeiro ----------------
  'financeiro/prestacao-de-contas': {
    titulo: 'Prestação de contas',
    oQueE: 'O fechamento de cada mês, com o que dá para mostrar aos membros e à rede.',
    comoUsar: [
      'Uma linha por fato, não por comprovante: cinco notas do mesmo evento viram um lançamento.',
      'Feche todo mês, mesmo o mês sem movimento — é o hábito que evita o buraco.',
      'Escolha a visibilidade: diretoria, membros ou público.',
    ],
    porQue: 'Transparência interna reduz pela metade a pergunta "para onde foi o dinheiro da camisa" — e é a defesa de quem sai da gestão.',
  },
  'financeiro/orcamento': {
    titulo: 'Orçamento',
    oQueE: 'O que foi aprovado no início do ano, contra o que já aconteceu.',
    comoUsar: [
      'A pergunta aqui não é "quanto gastamos" — é "estamos dentro do que planejamos".',
      'Categoria estourada aparece em vermelho antes de a assembleia perguntar.',
    ],
  },
  'financeiro/receitas': {
    titulo: 'Receitas',
    oQueE: 'Tudo o que entrou ou está previsto para entrar.',
    comoUsar: [
      'Marque como "previsto" o que foi combinado e ainda não caiu; ele não entra no saldo.',
      'Anexe o comprovante junto com o lançamento, não depois.',
    ],
  },
  'financeiro/despesas': {
    titulo: 'Despesas',
    oQueE: 'Tudo o que saiu ou está comprometido.',
    comoUsar: [
      'Aponte a despesa para o evento ou projeto: é o que faz o custo real aparecer lá.',
      'O que passou do prazo aparece como atrasado, e entra no alerta do painel.',
    ],
  },
  financeiro: {
    titulo: 'Financeiro',
    oQueE: 'Quanto a atlética tem, de onde veio e para onde foi.',
    comoUsar: [
      'Abre no saldo, não na tabela: o extrato está a um clique, na aba de receitas ou despesas.',
      'Saldo, gráfico e orçamento são calculados dos lançamentos — não há total guardado à parte.',
    ],
    porQue: 'A plataforma não movimenta dinheiro. Ela registra o que entrou e saiu para a prestação de contas existir.',
  },

  // ---------------- Rede ----------------
  'rede/feed': {
    titulo: 'Feed da rede',
    oQueE: 'O que as atléticas publicaram: conquistas, eventos abertos, perguntas e o que aprenderam.',
    comoUsar: [
      'Todo item leva a algum lugar — responder um pedido, ler uma experiência, entrar num evento.',
      'Use "Denunciar" em conteúdo fora do lugar: vai para a administração da rede, não some na hora.',
    ],
    porQue: 'Não é linha do tempo social. Post que só existe para ser curtido vira mural morto.',
  },
  'rede/comunidades': {
    titulo: 'Comunidades',
    oQueE: 'Grupos por região, modalidade, função ou interesse.',
    comoUsar: [
      '"Diretores de Marketing" reúne quem faz o mesmo trabalho em atléticas diferentes.',
      'A resposta chega mais rápido aqui do que num feed geral.',
    ],
  },
  'rede/parcerias': {
    titulo: 'Parcerias',
    oQueE: 'Benefícios abertos à rede e acordos diretos entre duas atléticas.',
    comoUsar: [
      'Demonstrar interesse coloca a sua atlética na lista; a negociação continua fora daqui.',
      'Parceria entre atléticas costuma não envolver dinheiro — emprestar quadra resolve muito.',
    ],
  },
  'rede/ajuda': {
    titulo: 'Pedidos de ajuda',
    oQueE: 'Perguntar para quem já passou por isso — e responder quando você já passou.',
    comoUsar: [
      'Pergunta específica recebe resposta específica: diga o tamanho da atlética e o que já tentou.',
      'Quem perguntou marca a resposta mais útil, e ela passa a aparecer primeiro.',
      'Depois de resolver, registre a experiência: fecha o ciclo para a próxima atlética.',
    ],
    porQue: 'É a porta de entrada do núcleo do produto: quase toda dúvida de atlética já foi resolvida por outra — o problema é que ninguém escreveu.',
  },
  'rede/amistosos': {
    titulo: 'Amistosos',
    oQueE: 'Quem está procurando adversário, em que modalidade, quando e onde.',
    comoUsar: [
      'Declare o nível ao publicar: amistoso 8 a 0 ninguém quer repetir.',
      'Filtre por estado — quem está perto é com quem dá para jogar sem fretar ônibus.',
    ],
  },
  rede: {
    titulo: 'Rede de atléticas',
    oQueE: 'Quem mais está na plataforma, o que abriram para fora e quem está pedindo ajuda.',
    comoUsar: [
      'O mapa agrupa por estado; as vizinhas aparecem primeiro na lista.',
      'É daqui que saem amistoso, parceria e compra coletiva.',
    ],
  },

  // ---------------- Conhecimento ----------------
  'conhecimento/modelos': {
    titulo: 'Modelos',
    oQueE: 'Documentos prontos: estatuto, ata, contrato, regulamento, edital.',
    comoUsar: [
      'Veja a prévia da estrutura antes de usar — ela responde "isso serve para mim?".',
      'Modelo é ponto de partida: revise com quem entende do assunto antes de registrar.',
    ],
    porQue: 'São os documentos que travam uma atlética nova por semanas — não por serem difíceis, mas porque ninguém sabe o que precisa constar.',
  },
  'conhecimento/experiencias': {
    titulo: 'Experiências',
    oQueE: 'Relatos com número: o que deu certo, o que deu errado e quanto custou.',
    comoUsar: [
      'Registre depois do evento, enquanto os números e os problemas ainda estão frescos.',
      'A coluna do "não funcionou" é a mais valiosa, e a que quase nunca é escrita.',
    ],
  },
  'conhecimento/mentoria': {
    titulo: 'Mentoria',
    oQueE: 'Atléticas experientes acompanhando quem está começando.',
    comoUsar: [
      'Pedido de ajuda resolve dúvida pontual; mentoria é acompanhamento por um semestre.',
      'Se a sua atlética domina alguma área, ofereça — é como a rede cresce com qualidade.',
    ],
  },
  'conhecimento/talentos': {
    titulo: 'Banco de talentos',
    oQueE: 'Quem, dentro da rede, faz o que a sua atlética ia contratar fora.',
    comoUsar: [
      'Design, fotografia, vídeo, revisão de estatuto e arbitragem já existem aqui dentro.',
      'Entre no banco se você faz alguma dessas coisas: é como outra atlética te acha.',
    ],
  },
  conhecimento: {
    titulo: 'Base de conhecimento',
    oQueE: 'O que outras atléticas aprenderam, escrito para ser aproveitado.',
    comoUsar: [
      'Guia explica um processo; modelo entrega o documento; experiência conta um caso com número.',
      'Se ninguém escreveu sobre o que você precisa, pergunte — a resposta pode virar o primeiro guia.',
    ],
  },

  // ---------------- Mercado ----------------
  'mercado/fornecedores': {
    titulo: 'Fornecedores',
    oQueE: 'Quem outras atléticas já contrataram, com nota por critério.',
    comoUsar: [
      'Olhe os cinco critérios separados: um fornecedor com nota 4,2 pode ter prazo 3.',
      'Avalie depois de contratar — nota sem contexto não ajuda ninguém.',
    ],
    porQue: 'Saber que a gráfica atendeu doze atléticas e atrasou em duas é informação que nenhuma atlética consegue sozinha.',
  },
  'mercado/compras': {
    titulo: 'Compras coletivas',
    oQueE: 'Juntar o pedido de várias atléticas para chegar na faixa de desconto por volume.',
    comoUsar: [
      'Demonstrar interesse não é pedido pago: a negociação acontece fora da plataforma.',
      'A barra mostra quanto falta para o grupo fechar.',
    ],
    porQue: 'Cem medalhas custam caro; novecentas custam 31% menos por unidade. É a rede virando dinheiro no caixa.',
  },
  'mercado/patrocinios': {
    titulo: 'Patrocínios',
    oQueE: 'O funil da captação, da primeira lista de empresas ao contrato assinado.',
    comoUsar: [
      'Arraste o card entre as etapas. Card parado três semanas é um follow-up que ninguém fez.',
      'Escreva a contrapartida antes de falar em valor.',
    ],
    porQue: 'Patrocínio sem contrapartida definida vira doação — e doação não renova.',
  },
  'mercado/oportunidades': {
    titulo: 'Oportunidades',
    oQueE: 'Editais, parcerias, competições e vagas abertas para atléticas da rede.',
    comoUsar: [
      'A ordem é por prazo: o que fecha antes aparece primeiro.',
    ],
  },
  loja: {
    titulo: 'Loja',
    oQueE: 'O catálogo da atlética: produto, preço, tamanhos e como combinar.',
    comoUsar: [
      'Mantenha o estoque atualizado — é o que responde "tem meu tamanho?" antes de virar direct.',
    ],
    porQue: 'A plataforma não vende nem cobra. Pagamento e entrega são combinados pelos canais que a atlética já usa.',
  },

  // ---------------- Comunicação ----------------
  'comunicacao/campanhas': {
    titulo: 'Campanhas',
    oQueE: 'Uma meta com prazo e um calendário de conteúdo para chegar nela.',
    comoUsar: [
      'Defina o objetivo com número: "vender 300 camisas", não "divulgar a camisa".',
      'Cada conteúdo tem canal, data e responsável. Ideia sem nome vira data que chega e ninguém produziu.',
    ],
  },
  'comunicacao/midia': {
    titulo: 'Biblioteca de mídia',
    oQueE: 'Brasão, fotos, vídeos e artes da atlética.',
    comoUsar: [
      'Comece pelo brasão em alta: é o arquivo que mais se perde e o que mais se procura na véspera.',
    ],
  },
  comunicacao: {
    titulo: 'Notícias',
    oQueE: 'O que a atlética contou para fora, e que fica registrado.',
    comoUsar: [
      'Aviso é operacional e some depois do evento; notícia é registro e fica.',
      'Depois de cada evento, uma notícia com número — é o material do media kit de patrocínio.',
    ],
  },
  avisos: {
    titulo: 'Avisos',
    oQueE: 'O mural da atlética. Cada aviso escolhe quem deve recebê-lo.',
    comoUsar: [
      '"Esgotou" vai para todos; "prestação de contas é quinta" vai só para a diretoria.',
      'Aviso fixado aparece na primeira tela de quem é membro.',
    ],
    porQue: 'Mandar tudo para todos é o caminho mais curto para as pessoas silenciarem a notificação — e aí o aviso que importa também não chega.',
  },
}

/** A explicação da rota atual, pelo prefixo mais longo que casar. */
export function explicacaoDe(caminhoRelativo: string): Explicacao | null {
  const alvo = caminhoRelativo.replace(/^\/+|\/+$/g, '')

  const chave = Object.keys(EXPLICACOES)
    .filter((k) => k === alvo || (k !== '' && alvo.startsWith(`${k}/`)))
    .sort((a, b) => b.length - a.length)[0]

  if (chave !== undefined) {
    return EXPLICACOES[chave]
  }
  return alvo === '' ? EXPLICACOES[''] : null
}
