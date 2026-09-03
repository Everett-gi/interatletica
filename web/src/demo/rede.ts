/**
 * A camada colaborativa: feed, pedidos de ajuda, comunidades, mentoria,
 * talentos e amistosos.
 *
 * <p>O feed não imita rede social. Todo item aqui tem <strong>destino</strong>
 * — leva a um pedido, a uma experiência, a um evento. Post sem destino vira
 * mural morto, e mural morto é o que faz a rede parecer enfeite.</p>
 */

import type {
  Comunidade,
  OfertaDeMentoria,
  PedidoDeAjuda,
  PostDaComunidade,
  PostDaRede,
  Talento,
} from '../api/tipos-conhecimento'
import type { Amistoso } from '../api/tipos-mercado'
import { ATLETICAS, dias } from './dados'

export const PEDIDOS_DE_AJUDA: PedidoDeAjuda[] = [
  {
    id: 'pa-01',
    titulo: 'Como vocês controlam a elegibilidade dos atletas?',
    corpo:
      'Estamos com 90 atletas em seis modalidades e conferir matrícula um a um '
      + 'na véspera do campeonato virou impossível. Quem já resolveu isso sem '
      + 'planilha manual?',
    area: 'ESPORTES',
    atletica: ATLETICAS[4],
    autorNome: 'Gustavo Peixoto',
    autorAvatarUrl: null,
    abertoEm: dias(-2),
    status: 'RESPONDIDO',
    experienciaId: null,
    respostas: [
      {
        id: 'ra-01',
        autorNome: 'Camila Toledo',
        autorAvatarUrl: null,
        atletica: ATLETICAS[0],
        corpo:
          'A gente pede o comprovante junto com a inscrição, não depois. O atleta '
          + 'só entra na lista da equipe com o documento anexado. Levou duas '
          + 'semanas para as pessoas se acostumarem e desde então não teve WO '
          + 'por documentação.',
        quando: dias(-2, 21),
        util: 14,
        maisUtil: true,
        anexos: ['Ficha de inscrição de atleta.docx'],
      },
      {
        id: 'ra-02',
        autorNome: 'Thiago Rezende',
        autorAvatarUrl: null,
        atletica: ATLETICAS[5],
        corpo:
          'Complementando: definimos uma data de corte, 15 dias antes do evento. '
          + 'Depois disso não entra atleta novo. Isso acabou com a correria de '
          + 'última hora mais do que qualquer sistema.',
        quando: dias(-1, 10),
        util: 9,
        maisUtil: false,
        anexos: [],
      },
    ],
  },
  {
    id: 'pa-02',
    titulo: 'Quanto vocês cobram de cota das atléticas em um interatlética?',
    corpo:
      'Vamos organizar o primeiro com quatro atléticas e não sei se cobro por '
      + 'atlética ou por atleta. Quem já fez os dois consegue comparar?',
    area: 'FINANCEIRO',
    atletica: ATLETICAS[5],
    autorNome: 'Bruno Sarmento',
    autorAvatarUrl: null,
    abertoEm: dias(-6),
    status: 'RESOLVIDO',
    experienciaId: 'ex-02',
    respostas: [
      {
        id: 'ra-03',
        autorNome: 'Marina Alencar',
        autorAvatarUrl: null,
        atletica: ATLETICAS[0],
        corpo:
          'Por atleta, sem dúvida. Em 2025 dividimos em partes iguais e duas '
          + 'atléticas menores quase desistiram na véspera — pagavam o mesmo que '
          + 'quem levava cinco vezes mais gente. Em 2026 mudamos para '
          + 'proporcional e ninguém reclamou. Escrevemos a conta em ata antes de '
          + 'abrir inscrição, o que também ajudou.',
        quando: dias(-6, 20),
        util: 21,
        maisUtil: true,
        anexos: [],
      },
      {
        id: 'ra-04',
        autorNome: 'Beatriz Nogueira',
        autorAvatarUrl: null,
        atletica: ATLETICAS[2],
        corpo:
          'A gente faz um híbrido: taxa fixa baixa por atlética, para cobrir '
          + 'estrutura, e o resto por atleta. Funciona quando tem custo fixo alto '
          + 'como locação de ginásio.',
        quando: dias(-5, 14),
        util: 11,
        maisUtil: false,
        anexos: [],
      },
    ],
  },
  {
    id: 'pa-03',
    titulo: 'Fornecedor de uniforme que entregue em menos de 40 dias no interior de SP',
    corpo:
      'Precisamos de 120 conjuntos antes da Interatlética. Os dois que já '
      + 'usamos dão 60 dias. Alguém tem indicação com prazo curto e qualidade?',
    area: 'ESPORTES',
    atletica: ATLETICAS[0],
    autorNome: 'Helena Vasques',
    autorAvatarUrl: null,
    abertoEm: dias(-4),
    status: 'RESPONDIDO',
    experienciaId: null,
    respostas: [
      {
        id: 'ra-05',
        autorNome: 'Isabela Cunha',
        autorAvatarUrl: null,
        atletica: ATLETICAS[4],
        corpo:
          'Uniformes Vale entregou nosso lote de 80 em 28 dias no ano passado. '
          + 'Preço um pouco acima da média, mas cumpriram. Estão avaliados na '
          + 'aba de fornecedores com nota 4,8.',
        quando: dias(-4, 19),
        util: 8,
        maisUtil: false,
        anexos: [],
      },
    ],
  },
  {
    id: 'pa-04',
    titulo: 'Como vocês lidam com membro que some no meio da gestão?',
    corpo:
      'Dois diretores pararam de aparecer e as áreas ficaram descobertas. '
      + 'Existe algum processo além de conversar e torcer?',
    area: 'PESSOAS',
    atletica: ATLETICAS[3],
    autorNome: 'Larissa Prado',
    autorAvatarUrl: null,
    abertoEm: dias(-9),
    status: 'RESPONDIDO',
    experienciaId: null,
    respostas: [
      {
        id: 'ra-06',
        autorNome: 'Rafael Bandeira',
        autorAvatarUrl: null,
        atletica: ATLETICAS[0],
        corpo:
          'Nosso estatuto tem cláusula de vacância: três faltas seguidas sem '
          + 'justificativa e a diretoria pode declarar o cargo vago em reunião. '
          + 'Não é para punir, é para poder recompor sem ficar refém.',
        quando: dias(-8, 11),
        util: 17,
        maisUtil: true,
        anexos: ['Estatuto de atlética universitária.docx'],
      },
    ],
  },
  {
    id: 'pa-05',
    titulo: 'Vale a pena tirar CNPJ para a atlética?',
    corpo:
      'Somos 60 membros, temos um patrocínio de R$ 5 mil por ano e queremos '
      + 'abrir conta bancária. Compensa o custo contábil?',
    area: 'JURIDICO',
    atletica: ATLETICAS[5],
    autorNome: 'Pedro Vilanova',
    autorAvatarUrl: null,
    abertoEm: dias(-14),
    status: 'RESOLVIDO',
    experienciaId: null,
    respostas: [
      {
        id: 'ra-07',
        autorNome: 'Beatriz Nogueira',
        autorAvatarUrl: null,
        atletica: ATLETICAS[2],
        corpo:
          'Com um patrocínio só, provavelmente não. A conta contábil aqui saía '
          + 'em torno de R$ 200 por mês. Passou a valer quando chegamos a três '
          + 'patrocinadores com nota fiscal e a faculdade passou a exigir CNPJ '
          + 'para liberar espaço.',
        quando: dias(-13, 16),
        util: 26,
        maisUtil: true,
        anexos: [],
      },
    ],
  },
  {
    id: 'pa-06',
    titulo: 'Alguém tem plano de chuva que realmente funcionou?',
    corpo:
      'Quadra descoberta, evento em outubro. Quero deixar por escrito quando '
      + 'aciona o plano B, para não decidir na hora com todo mundo no local.',
    area: 'EVENTOS',
    atletica: ATLETICAS[1],
    autorNome: 'Diego Marinho',
    autorAvatarUrl: null,
    abertoEm: dias(-1),
    status: 'ABERTO',
    experienciaId: null,
    respostas: [],
  },
]

export const FEED_DA_REDE: PostDaRede[] = [
  {
    id: 'fd-01',
    tipo: 'PEDIDO',
    atletica: ATLETICAS[1],
    autorNome: 'Diego Marinho',
    autorAvatarUrl: null,
    titulo: 'Alguém tem plano de chuva que realmente funcionou?',
    corpo:
      'Quadra descoberta, evento em outubro. Quero deixar por escrito quando '
      + 'aciona o plano B.',
    quando: dias(-1),
    destino: 'rede/ajuda/pa-06',
    destinoRotulo: 'Responder',
    util: 3,
    respostas: 0,
    etiquetas: ['Eventos'],
  },
  {
    id: 'fd-02',
    tipo: 'EXPERIENCIA',
    atletica: ATLETICAS[0],
    autorNome: 'Marina Alencar',
    autorAvatarUrl: null,
    titulo: 'Perdemos o Instagram na troca de gestão — e como recuperamos',
    corpo:
      'Nove dias sem a conta, 4 mil seguidores em risco. O que fizemos para '
      + 'recuperar e o que mudamos para não repetir.',
    quando: dias(-2),
    destino: 'conhecimento/experiencias/ex-03',
    destinoRotulo: 'Ler a experiência',
    util: 156,
    respostas: 23,
    etiquetas: ['Gestão', 'Transição'],
  },
  {
    id: 'fd-03',
    tipo: 'EVENTO',
    atletica: ATLETICAS[0],
    autorNome: 'Rafael Bandeira',
    autorAvatarUrl: null,
    titulo: 'Interatlética 2026: inscrições abertas para as seis atléticas',
    corpo:
      'Três dias, onze modalidades, 418 atletas confirmados. Ainda há vaga em '
      + 'handebol e natação.',
    quando: dias(-3),
    destino: 'e/dragoes/interatletica-2026',
    destinoRotulo: 'Ver o evento',
    util: 42,
    respostas: 8,
    etiquetas: ['Interatlética', 'Múltiplas modalidades'],
  },
  {
    id: 'fd-04',
    tipo: 'CONQUISTA',
    atletica: ATLETICAS[2],
    autorNome: 'Beatriz Nogueira',
    autorAvatarUrl: null,
    titulo: 'Furacão é campeã do circuito regional de natação',
    corpo: 'Seis ouros e três pratas em nove provas. Primeira vez desde 2019.',
    quando: dias(-4),
    destino: 'rede/quadro',
    destinoRotulo: 'Ver o quadro',
    util: 87,
    respostas: 14,
    etiquetas: ['Natação'],
  },
  {
    id: 'fd-05',
    tipo: 'OPORTUNIDADE',
    atletica: ATLETICAS[4],
    autorNome: 'Isabela Cunha',
    autorAvatarUrl: null,
    titulo: 'Compra coletiva de uniformes: faltam 3 atléticas para fechar',
    corpo:
      '740 unidades já confirmadas por sete atléticas. Com mil peças o desconto '
      + 'sobe de 18% para 27%.',
    quando: dias(-5),
    destino: 'mercado/compras/cc-01',
    destinoRotulo: 'Participar',
    util: 31,
    respostas: 6,
    etiquetas: ['Compra coletiva', 'Uniformes'],
  },
  {
    id: 'fd-06',
    tipo: 'PARCERIA',
    atletica: ATLETICAS[3],
    autorNome: 'Camila Toledo',
    autorAvatarUrl: null,
    titulo: 'Academia Movimento oferece desconto para atléticas parceiras',
    corpo:
      '40% no plano semestral para membros com vínculo ativo. Oito atléticas já '
      + 'demonstraram interesse.',
    quando: dias(-6),
    destino: 'rede/parcerias',
    destinoRotulo: 'Tenho interesse',
    util: 24,
    respostas: 3,
    etiquetas: ['Parceria', 'Fitness'],
  },
  {
    id: 'fd-07',
    tipo: 'PERGUNTA',
    atletica: ATLETICAS[4],
    autorNome: 'Gustavo Peixoto',
    autorAvatarUrl: null,
    titulo: 'Como vocês controlam a elegibilidade dos atletas?',
    corpo: 'Noventa atletas em seis modalidades e a conferência virou impossível.',
    quando: dias(-2, 9),
    destino: 'rede/ajuda/pa-01',
    destinoRotulo: 'Ver as 2 respostas',
    util: 19,
    respostas: 2,
    etiquetas: ['Esportes', 'Documentação'],
  },
  {
    id: 'fd-08',
    tipo: 'EXPERIENCIA',
    atletica: ATLETICAS[1],
    autorNome: 'Rafael Bandeira',
    autorAvatarUrl: null,
    titulo: 'Como organizamos um evento para 500 pessoas com R$ 12 mil',
    corpo: 'O que funcionou, o que não funcionou e o que faríamos diferente.',
    quando: dias(-8),
    destino: 'conhecimento/experiencias/ex-01',
    destinoRotulo: 'Ler a experiência',
    util: 94,
    respostas: 12,
    etiquetas: ['Eventos', 'Orçamento'],
  },
  {
    id: 'fd-09',
    tipo: 'EVENTO',
    atletica: ATLETICAS[5],
    autorNome: 'Thiago Rezende',
    autorAvatarUrl: null,
    titulo: 'Trilha do Javali: 60 vagas, aberta para toda a rede',
    corpo: 'Trekking de 12 km na Serra do Mirante, com transporte saindo do campus.',
    quando: dias(-9),
    destino: 'e/javalis/trilha-do-javali',
    destinoRotulo: 'Ver o evento',
    util: 18,
    respostas: 2,
    etiquetas: ['Trekking'],
  },
  {
    id: 'fd-10',
    tipo: 'CONQUISTA',
    atletica: ATLETICAS[0],
    autorNome: 'Camila Toledo',
    autorAvatarUrl: null,
    titulo: 'Campanha do agasalho alcançou 312 pessoas',
    corpo: '1.480 peças em cinco semanas, contra 600 na campanha do ano anterior.',
    quando: dias(-12),
    destino: 'conhecimento/experiencias/ex-05',
    destinoRotulo: 'Como fizemos',
    util: 71,
    respostas: 9,
    etiquetas: ['Projeto social'],
  },
]

export const COMUNIDADES: Comunidade[] = [
  { id: 'cm-01', nome: 'Atléticas do Vale', descricao: 'As atléticas da região do Vale e da Serra: calendário comum, caronas e amistosos.', tipo: 'REGIAO', membros: 214, atleticas: 9, participo: true, ultimaAtividade: dias(-1), emblema: null },
  { id: 'cm-02', nome: 'Diretores de Marketing', descricao: 'Quem cuida da comunicação: calendário editorial, ideias de campanha e o que deu certo.', tipo: 'FUNCAO', membros: 143, atleticas: 31, participo: true, ultimaAtividade: dias(-2), emblema: null },
  { id: 'cm-03', nome: 'Futsal Universitário', descricao: 'Regulamento, arbitragem, tabelas e busca de adversário para futsal.', tipo: 'MODALIDADE', membros: 386, atleticas: 52, participo: false, ultimaAtividade: dias(-1, 14), emblema: null },
  { id: 'cm-04', nome: 'Atléticas Iniciantes', descricao: 'Para quem está montando a atlética agora: estatuto, primeiros membros, primeiro evento.', tipo: 'INTERESSE', membros: 271, atleticas: 68, participo: true, ultimaAtividade: dias(-3), emblema: null },
  { id: 'cm-05', nome: 'E-sports Universitário', descricao: 'Valorant, League, CS e FIFA: formatos de torneio, transmissão e regulamento.', tipo: 'MODALIDADE', membros: 412, atleticas: 47, participo: true, ultimaAtividade: dias(-1, 22), emblema: null },
  { id: 'cm-06', nome: 'Tesouraria e prestação de contas', descricao: 'Planilhas, categorias, CNPJ e como fechar o mês sem virar noite.', tipo: 'FUNCAO', membros: 168, atleticas: 39, participo: false, ultimaAtividade: dias(-4), emblema: null },
  { id: 'cm-07', nome: 'Projetos sociais universitários', descricao: 'Campanhas, parceiros e relatório de impacto.', tipo: 'INTERESSE', membros: 97, atleticas: 24, participo: false, ultimaAtividade: dias(-6), emblema: null },
  { id: 'cm-08', nome: 'Vôlei e handebol', descricao: 'Modalidades de quadra fora do futsal: arbitragem, tabela e material.', tipo: 'MODALIDADE', membros: 156, atleticas: 28, participo: false, ultimaAtividade: dias(-5), emblema: null },
]

export const POSTS_DE_COMUNIDADE: PostDaComunidade[] = [
  { id: 'pc-01', comunidadeId: 'cm-01', autorNome: 'Bruno Sarmento', autorAvatarUrl: null, atletica: ATLETICAS[5], corpo: 'Alguém tem ônibus fretado indo para Serra Alta no dia 18? Temos 12 atletas e daria para dividir o custo.', quando: dias(-1), respostas: 4, util: 7 },
  { id: 'pc-02', comunidadeId: 'cm-01', autorNome: 'Marina Alencar', autorAvatarUrl: null, atletica: ATLETICAS[0], corpo: 'Fechamos o calendário da Interatlética. Publicamos a tabela completa hoje — quem quiser marcar amistoso na véspera, tem quadra livre na sexta de manhã.', quando: dias(-3), respostas: 6, util: 12 },
  { id: 'pc-03', comunidadeId: 'cm-02', autorNome: 'Helena Vasques', autorAvatarUrl: null, atletica: ATLETICAS[0], corpo: 'Testamos publicar a tabela de jogos como carrossel em vez de story. Alcance triplicou e o pessoal parou de perguntar horário no direct.', quando: dias(-2), respostas: 9, util: 23 },
  { id: 'pc-04', comunidadeId: 'cm-05', autorNome: 'Camila Toledo', autorAvatarUrl: null, atletica: ATLETICAS[3], corpo: 'Dica para quem vai transmitir: check-in obrigatório 48h antes acabou com o problema de equipe que não aparece. Perdemos metade das equipes na primeira etapa por não fazer isso.', quando: dias(-1, 22), respostas: 11, util: 31 },
  { id: 'pc-05', comunidadeId: 'cm-04', autorNome: 'Pedro Vilanova', autorAvatarUrl: null, atletica: ATLETICAS[5], corpo: 'Estamos montando a atlética do curso agora. Qual a ordem: estatuto primeiro ou juntar membros primeiro?', quando: dias(-3), respostas: 8, util: 5 },
]

export const MENTORIAS: OfertaDeMentoria[] = [
  {
    id: 'mt-01',
    atletica: ATLETICAS[0],
    area: 'EVENTOS',
    titulo: 'Organizar seu primeiro interatlética',
    descricao:
      'Acompanhamos do planejamento ao relatório final. Duas conversas por mês '
      + 'e acesso aos nossos modelos de regulamento e planilha de custo.',
    responsavelNome: 'Rafael Bandeira',
    atleticasAtendidas: 5,
    solicitei: false,
    disponivel: true,
  },
  {
    id: 'mt-02',
    atletica: ATLETICAS[2],
    area: 'FINANCEIRO',
    titulo: 'Colocar a prestação de contas em dia',
    descricao:
      'Para atlética com meses atrasados. Ajudamos a reconstruir o histórico e '
      + 'a montar a rotina de fechamento mensal.',
    responsavelNome: 'Beatriz Nogueira',
    atleticasAtendidas: 8,
    solicitei: false,
    disponivel: true,
  },
  {
    id: 'mt-03',
    atletica: ATLETICAS[4],
    area: 'PATROCINIO',
    titulo: 'Do zero ao primeiro contrato de patrocínio',
    descricao:
      'Montamos o media kit junto, definimos cotas e revisamos a proposta antes '
      + 'de você enviar.',
    responsavelNome: 'Gustavo Peixoto',
    atleticasAtendidas: 11,
    solicitei: false,
    disponivel: true,
  },
  {
    id: 'mt-04',
    atletica: ATLETICAS[1],
    area: 'GESTAO',
    titulo: 'Estatuto, registro e eleição',
    descricao: 'Para atlética que está se formalizando. Revisamos o estatuto e o edital.',
    responsavelNome: 'Diego Marinho',
    atleticasAtendidas: 6,
    solicitei: false,
    disponivel: false,
  },
  {
    id: 'mt-05',
    atletica: ATLETICAS[3],
    area: 'ESPORTES',
    titulo: 'Montar time de e-sports do zero',
    descricao: 'Formato de seletiva, regulamento, transmissão simples e retenção de jogador.',
    responsavelNome: 'Camila Toledo',
    atleticasAtendidas: 3,
    solicitei: false,
    disponivel: true,
  },
]

export const TALENTOS: Talento[] = [
  { usuarioId: 'u-09', nome: 'Helena Vasques', avatarUrl: null, atletica: ATLETICAS[0], habilidades: ['DESIGN', 'MARKETING'], descricao: 'Faço identidade visual de evento e arte para uniforme. Trabalhei nas últimas três Interatléticas.', portfolioUrl: 'https://portfolio.exemplo/helena', disponivel: true, trabalhos: 14 },
  { usuarioId: 'u-06', nome: 'Thiago Rezende', avatarUrl: null, atletica: ATLETICAS[5], habilidades: ['FOTOGRAFIA', 'VIDEO'], descricao: 'Cobertura de jogo e evento. Tenho equipamento próprio e cubro a região da Serra.', portfolioUrl: null, disponivel: true, trabalhos: 22 },
  { usuarioId: 'u-12', nome: 'Pedro Vilanova', avatarUrl: null, atletica: ATLETICAS[0], habilidades: ['PROGRAMACAO', 'ORGANIZACAO'], descricao: 'Monto planilha de chaveamento e automatizo tabela de campeonato.', portfolioUrl: null, disponivel: true, trabalhos: 7 },
  { usuarioId: 'u-05', nome: 'Beatriz Nogueira', avatarUrl: null, atletica: ATLETICAS[2], habilidades: ['JURIDICO', 'ORGANIZACAO'], descricao: 'Estudante de Direito. Reviso estatuto, contrato de patrocínio e edital de eleição.', portfolioUrl: null, disponivel: true, trabalhos: 19 },
  { usuarioId: 'u-08', nome: 'Gustavo Peixoto', avatarUrl: null, atletica: ATLETICAS[4], habilidades: ['ARBITRAGEM'], descricao: 'Árbitro federado de futsal e handebol. Apito eventos universitários na região de Porto Aurora.', portfolioUrl: null, disponivel: false, trabalhos: 31 },
  { usuarioId: 'u-07', nome: 'Larissa Prado', avatarUrl: null, atletica: ATLETICAS[0], habilidades: ['COMUNICACAO', 'MARKETING'], descricao: 'Escrevo release, roteiro de story e organizo calendário editorial.', portfolioUrl: null, disponivel: true, trabalhos: 11 },
  { usuarioId: 'u-04', nome: 'Diego Marinho', avatarUrl: null, atletica: ATLETICAS[1], habilidades: ['ORGANIZACAO'], descricao: 'Produção de evento: cronograma, fornecedores e escala de equipe.', portfolioUrl: null, disponivel: true, trabalhos: 16 },
  { usuarioId: 'u-11', nome: 'Isabela Cunha', avatarUrl: null, atletica: ATLETICAS[4], habilidades: ['DESIGN', 'VIDEO'], descricao: 'Motion e vinheta de transmissão para e-sports.', portfolioUrl: 'https://portfolio.exemplo/isabela', disponivel: true, trabalhos: 9 },
]

export const AMISTOSOS: Amistoso[] = [
  {
    id: 'am-01',
    atletica: ATLETICAS[0],
    modalidade: 'Futsal masculino',
    categoria: 'Livre',
    data: dias(12, 19),
    cidade: 'São Bento do Vale',
    uf: 'SP',
    nivel: 'INTERMEDIARIO',
    observacao: 'Quadra reservada, arbitragem por nossa conta. Só trazer o time.',
    interessadas: [ATLETICAS[1], ATLETICAS[3]],
    fechadoCom: null,
    tenhoInteresse: false,
  },
  {
    id: 'am-02',
    atletica: ATLETICAS[2],
    modalidade: 'Vôlei feminino',
    categoria: 'Livre',
    data: dias(20, 15),
    cidade: 'Serra Alta',
    uf: 'MG',
    nivel: 'AVANCADO',
    observacao: 'Preparação para o circuito regional. Preferência por time que joga alto.',
    interessadas: [ATLETICAS[0]],
    fechadoCom: null,
    tenhoInteresse: false,
  },
  {
    id: 'am-03',
    atletica: ATLETICAS[4],
    modalidade: 'Basquete masculino',
    categoria: 'Sub-23',
    data: dias(8, 18),
    cidade: 'Porto Aurora',
    uf: 'PR',
    nivel: 'INICIANTE',
    observacao: 'Time novo, primeira temporada. Buscamos jogo para pegar ritmo.',
    interessadas: [],
    fechadoCom: null,
    tenhoInteresse: false,
  },
  {
    id: 'am-04',
    atletica: ATLETICAS[5],
    modalidade: 'Handebol misto',
    categoria: 'Livre',
    data: dias(26, 10),
    cidade: 'Serra Alta',
    uf: 'MG',
    nivel: 'INTERMEDIARIO',
    observacao: null,
    interessadas: [ATLETICAS[2]],
    fechadoCom: null,
    tenhoInteresse: false,
  },
  {
    id: 'am-05',
    atletica: ATLETICAS[3],
    modalidade: 'Valorant',
    categoria: 'Livre',
    data: dias(5, 20),
    cidade: 'Online',
    uf: 'SP',
    nivel: 'AVANCADO',
    observacao: 'MD3, servidor nosso. Aquecimento para a Copa.',
    interessadas: [ATLETICAS[1], ATLETICAS[4], ATLETICAS[5]],
    fechadoCom: ATLETICAS[1],
    tenhoInteresse: false,
  },
  {
    id: 'am-06',
    atletica: ATLETICAS[1],
    modalidade: 'Futsal feminino',
    categoria: 'Livre',
    data: dias(17, 19),
    cidade: 'São Bento do Vale',
    uf: 'SP',
    nivel: 'INICIANTE',
    observacao: 'Time em formação, jogo amistoso sem tabela.',
    interessadas: [],
    fechadoCom: null,
    tenhoInteresse: false,
  },
]
