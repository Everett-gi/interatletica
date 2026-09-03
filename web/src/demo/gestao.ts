/**
 * Dados de demonstração da gestão interna: projetos, metas, reuniões,
 * decisões, gestões, transição, documentos e patrimônio.
 *
 * <p>Fictícios, como todo o resto de `demo/`. O que importa aqui é que os
 * números <strong>fecham entre si</strong>: o progresso do projeto bate com
 * as tarefas, a decisão aponta para a reunião que a gerou, e a transição
 * lista exatamente o que os outros módulos têm pendente. Um demo com
 * números que se contradizem denuncia que é maquete.</p>
 */

import type {
  Decisao,
  Documento,
  EventoDoHistorico,
  Gestao,
  ItemDePatrimonio,
  Meta,
  ModeloDeProjeto,
  Projeto,
  Reuniao,
  Transicao,
} from '../api/tipos-gestao'
import { dias } from './dados'

// ---------------------------------------------------------------------
// Projetos
// ---------------------------------------------------------------------

export const PROJETOS: Projeto[] = [
  {
    id: 'pj-01',
    atleticaSlug: 'dragoes',
    nome: 'Interatlética 2026',
    resumo:
      'Três dias de competição entre seis atléticas do Vale e da Serra. '
      + 'Onze modalidades, arbitragem contratada e transmissão da final.',
    tipo: 'CAMPEONATO',
    status: 'EM_ANDAMENTO',
    area: 'Esportes',
    responsavelNome: 'Rafael Bandeira',
    responsavelAvatarUrl: null,
    inicioEm: dias(-95),
    prazo: dias(25),
    progresso: 0.68,
    tarefasTotal: 34,
    tarefasConcluidas: 23,
    orcamentoPrevisto: 28000,
    orcamentoGasto: 17400,
    eventoId: 'e-01',
    gestaoAno: 2026,
    passos: [],
    marcos: [
      { id: 'mc-01', titulo: 'Fechar as seis atléticas participantes', prazo: dias(-60), concluido: true },
      { id: 'mc-02', titulo: 'Contratar ginásio e arbitragem', prazo: dias(-20), concluido: true },
      { id: 'mc-03', titulo: 'Publicar regulamento de todas as modalidades', prazo: dias(7), concluido: false },
      { id: 'mc-04', titulo: 'Fechar escala de portaria e voluntários', prazo: dias(14), concluido: false },
      { id: 'mc-05', titulo: 'Relatório pós-evento e prestação de contas', prazo: dias(35), concluido: false },
    ],
    parceiros: [],
    beneficiados: null,
    resultado: null,
  },
  {
    id: 'pj-02',
    atleticaSlug: 'dragoes',
    nome: 'Calourada da Engenharia',
    resumo: 'Festa de recepção dos calouros, com entrada controlada por QR na portaria.',
    tipo: 'EVENTO',
    status: 'EM_ANDAMENTO',
    area: 'Eventos',
    responsavelNome: 'Larissa Prado',
    responsavelAvatarUrl: null,
    inicioEm: dias(-45),
    prazo: dias(9),
    progresso: 0.82,
    tarefasTotal: 17,
    tarefasConcluidas: 14,
    orcamentoPrevisto: 12000,
    orcamentoGasto: 9800,
    eventoId: 'e-02',
    gestaoAno: 2026,
    passos: [],
    marcos: [
      { id: 'mc-06', titulo: 'Reservar o galpão', prazo: dias(-30), concluido: true },
      { id: 'mc-07', titulo: 'Contratar segurança', prazo: dias(-6), concluido: true },
      { id: 'mc-08', titulo: 'Escalar equipe de portaria', prazo: dias(6), concluido: false },
    ],
    parceiros: [],
    beneficiados: null,
    resultado: null,
  },
  {
    id: 'pj-03',
    atleticaSlug: 'dragoes',
    nome: 'Agasalho Solidário do Vale',
    resumo:
      'Campanha de arrecadação de agasalhos com dois abrigos da cidade, '
      + 'usando os jogos de vôlei como ponto de coleta.',
    tipo: 'SOCIAL',
    status: 'CONCLUIDO',
    area: 'Social',
    responsavelNome: 'Camila Toledo',
    responsavelAvatarUrl: null,
    inicioEm: dias(-140),
    prazo: dias(-70),
    progresso: 1,
    tarefasTotal: 12,
    tarefasConcluidas: 12,
    orcamentoPrevisto: 1500,
    orcamentoGasto: 940,
    eventoId: null,
    gestaoAno: 2026,
    passos: [],
    marcos: [
      { id: 'mc-09', titulo: 'Fechar parceria com os abrigos', prazo: dias(-130), concluido: true },
      { id: 'mc-10', titulo: 'Montar pontos de coleta', prazo: dias(-110), concluido: true },
      { id: 'mc-11', titulo: 'Entrega e relatório', prazo: dias(-70), concluido: true },
    ],
    parceiros: ['Abrigo Vale Verde', 'Casa de Passagem São Bento', 'Cooperativa Recomeço'],
    beneficiados: 312,
    resultado:
      '1.480 peças arrecadadas em cinco semanas, contra 600 na campanha do ano '
      + 'anterior. O que mudou foi usar os jogos como ponto de coleta: quem já '
      + 'estava indo ao ginásio levava a doação junto.',
  },
  {
    id: 'pj-04',
    atleticaSlug: 'dragoes',
    nome: 'Nova identidade visual',
    resumo: 'Redesenho do brasão, uniforme e materiais de divulgação.',
    tipo: 'COMUNICACAO',
    status: 'PLANEJAMENTO',
    area: 'Marketing',
    responsavelNome: 'Helena Vasques',
    responsavelAvatarUrl: null,
    inicioEm: dias(-12),
    prazo: dias(60),
    progresso: 0.15,
    tarefasTotal: 13,
    tarefasConcluidas: 2,
    orcamentoPrevisto: 4200,
    orcamentoGasto: 0,
    eventoId: null,
    gestaoAno: 2026,
    passos: [],
    marcos: [
      { id: 'mc-12', titulo: 'Aprovar direção criativa em assembleia', prazo: dias(20), concluido: false },
      { id: 'mc-13', titulo: 'Fechar fornecedor de uniforme', prazo: dias(40), concluido: false },
    ],
    parceiros: [],
    beneficiados: null,
    resultado: null,
  },
  {
    id: 'pj-05',
    atleticaSlug: 'dragoes',
    nome: 'Captação 2027',
    resumo: 'Prospecção de patrocínio para a próxima temporada, antes da troca de gestão.',
    tipo: 'CAPTACAO',
    status: 'EM_ANDAMENTO',
    area: 'Financeiro',
    responsavelNome: 'Diego Marinho',
    responsavelAvatarUrl: null,
    inicioEm: dias(-30),
    prazo: dias(90),
    progresso: 0.4,
    tarefasTotal: 10,
    tarefasConcluidas: 4,
    orcamentoPrevisto: null,
    orcamentoGasto: null,
    eventoId: null,
    gestaoAno: 2026,
    passos: [],
    marcos: [
      { id: 'mc-14', titulo: 'Montar o material de contrapartidas', prazo: dias(-10), concluido: true },
      { id: 'mc-15', titulo: 'Fechar dois patrocínios anuais', prazo: dias(85), concluido: false },
    ],
    parceiros: [],
    beneficiados: null,
    resultado: null,
  },
  {
    id: 'pj-06',
    atleticaSlug: 'corujas',
    nome: 'Circuito de e-sports das Corujas',
    resumo: 'Três etapas de Valorant e League ao longo do semestre.',
    tipo: 'CAMPEONATO',
    status: 'EM_ANDAMENTO',
    area: 'E-sports',
    responsavelNome: 'Marina Alencar',
    responsavelAvatarUrl: null,
    inicioEm: dias(-40),
    prazo: dias(45),
    progresso: 0.55,
    tarefasTotal: 16,
    tarefasConcluidas: 9,
    orcamentoPrevisto: 6000,
    orcamentoGasto: 2600,
    eventoId: 'e-03',
    gestaoAno: 2026,
    passos: [],
    marcos: [
      { id: 'mc-16', titulo: 'Primeira etapa realizada', prazo: dias(6), concluido: false },
    ],
    parceiros: [],
    beneficiados: null,
    resultado: null,
  },
]

/**
 * Moldes de projeto. Os que vêm de outra atlética são o ponto do produto: o
 * roteiro de calourada dos Leões já tem as tarefas que eles descobriram na
 * prática, incluindo as três que só existem porque deu errado uma vez.
 */
export const MODELOS_DE_PROJETO: ModeloDeProjeto[] = [
  {
    id: 'mp-01',
    nome: 'Campeonato interatlético',
    descricao:
      'Da definição das modalidades ao relatório final. Inclui as etapas que '
      + 'costumam ser esquecidas: seguro, ficha médica e plano de chuva.',
    tipo: 'CAMPEONATO',
    duracaoEmDias: 120,
    tarefas: [
      'Definir modalidades e categorias',
      'Levantar quantas atléticas topam participar',
      'Reservar ginásio e quadras',
      'Orçar arbitragem com três fornecedores',
      'Escrever o regulamento geral',
      'Escrever o regulamento por modalidade',
      'Definir pontuação e critérios de desempate',
      'Abrir inscrição de equipes',
      'Conferir elegibilidade dos atletas',
      'Contratar seguro de evento',
      'Montar plano de chuva',
      'Definir ponto de atendimento médico',
      'Fechar fornecedor de medalhas e troféus',
      'Montar escala de portaria',
      'Montar escala de mesa e súmula',
      'Divulgar tabela de jogos',
      'Preparar transmissão da final',
      'Confirmar alimentação das equipes',
      'Fazer o sorteio das chaves',
      'Preparar kit de arbitragem',
      'Rodar o evento',
      'Registrar resultados e classificação',
      'Publicar galeria de fotos',
      'Fechar prestação de contas',
      'Escrever relatório e recomendações',
    ],
    marcos: ['Modalidades fechadas', 'Inscrições encerradas', 'Chaves sorteadas', 'Evento realizado', 'Relatório entregue'],
    usos: 47,
    origemAtletica: null,
  },
  {
    id: 'mp-02',
    nome: 'Calourada',
    descricao:
      'Roteiro dos Leões, refinado em quatro edições. As três últimas tarefas '
      + 'existem porque a edição de 2024 teve problema com a vizinhança.',
    tipo: 'EVENTO',
    duracaoEmDias: 45,
    tarefas: [
      'Definir data com a coordenação do curso',
      'Reservar o espaço',
      'Estimar público e definir capacidade',
      'Contratar segurança proporcional ao público',
      'Contratar equipe de limpeza',
      'Definir controle de entrada e QR',
      'Fechar atrações',
      'Montar campanha de divulgação',
      'Abrir inscrições',
      'Combinar plano de transporte de volta',
      'Avisar a vizinhança sobre horário e som',
      'Contratar aferição de ruído',
      'Registrar o alvará junto à prefeitura',
    ],
    marcos: ['Espaço reservado', 'Inscrições abertas', 'Evento realizado'],
    usos: 63,
    origemAtletica: 'leoes',
  },
  {
    id: 'mp-03',
    nome: 'Projeto social',
    descricao: 'Campanha de arrecadação com parceiro externo e relatório de impacto.',
    tipo: 'SOCIAL',
    duracaoEmDias: 60,
    tarefas: [
      'Escolher a causa e a instituição parceira',
      'Definir meta de arrecadação',
      'Fechar termo com a instituição',
      'Montar pontos de coleta',
      'Produzir material de divulgação',
      'Engajar as equipes esportivas na campanha',
      'Fazer a triagem do arrecadado',
      'Organizar a entrega',
      'Registrar fotos e depoimentos',
      'Publicar relatório de impacto',
    ],
    marcos: ['Parceria fechada', 'Coleta encerrada', 'Entrega realizada'],
    usos: 29,
    origemAtletica: 'dragoes',
  },
  {
    id: 'mp-04',
    nome: 'Eleição da diretoria',
    descricao: 'Processo eleitoral completo, do edital à posse e transição.',
    tipo: 'ESTRUTURA',
    duracaoEmDias: 50,
    tarefas: [
      'Publicar o edital com prazos',
      'Definir comissão eleitoral',
      'Abrir inscrição de chapas',
      'Homologar chapas',
      'Publicar programa das chapas',
      'Organizar debate',
      'Preparar a votação',
      'Apurar e publicar o resultado',
      'Lavrar a ata da eleição',
      'Iniciar a transição de gestão',
    ],
    marcos: ['Edital publicado', 'Chapas homologadas', 'Resultado apurado', 'Transição iniciada'],
    usos: 38,
    origemAtletica: 'furacao',
  },
  {
    id: 'mp-05',
    nome: 'Captação de patrocínio',
    descricao: 'Da lista de prospects ao contrato assinado, com contrapartidas definidas.',
    tipo: 'CAPTACAO',
    duracaoEmDias: 75,
    tarefas: [
      'Montar o media kit da atlética',
      'Definir cotas e contrapartidas',
      'Levantar empresas próximas ao campus',
      'Primeiro contato por e-mail',
      'Follow-up por telefone',
      'Reunião de apresentação',
      'Enviar proposta formal',
      'Negociar contrapartidas',
      'Redigir contrato',
      'Assinar e registrar no financeiro',
      'Executar as contrapartidas',
      'Enviar relatório de entrega ao patrocinador',
    ],
    marcos: ['Media kit pronto', 'Proposta enviada', 'Contrato assinado', 'Contrapartidas entregues'],
    usos: 41,
    origemAtletica: 'panteras',
  },
  {
    id: 'mp-06',
    nome: 'Viagem para competição',
    descricao: 'Logística de deslocamento, hospedagem e documentação do time.',
    tipo: 'EVENTO',
    duracaoEmDias: 30,
    tarefas: [
      'Levantar quantos vão',
      'Orçar transporte com três empresas',
      'Reservar hospedagem',
      'Definir custo por pessoa',
      'Coletar documentos e autorizações',
      'Montar a lista de embarque',
      'Definir responsável por turno',
      'Combinar alimentação',
      'Fechar contatos de emergência',
      'Prestação de contas da viagem',
    ],
    marcos: ['Transporte fechado', 'Hospedagem confirmada', 'Viagem realizada'],
    usos: 22,
    origemAtletica: 'javalis',
  },
]

// ---------------------------------------------------------------------
// Metas
// ---------------------------------------------------------------------

export const METAS: Meta[] = [
  { id: 'me-01', atleticaSlug: 'dragoes', gestaoAno: 2026, titulo: 'Membros ativos', area: 'Pessoas', alvo: 120, atual: 94, unidade: 'membros', prazo: dias(120) },
  { id: 'me-02', atleticaSlug: 'dragoes', gestaoAno: 2026, titulo: 'Eventos realizados no ano', area: 'Eventos', alvo: 10, atual: 7, unidade: 'eventos', prazo: dias(120) },
  { id: 'me-03', atleticaSlug: 'dragoes', gestaoAno: 2026, titulo: 'Patrocínio captado', area: 'Financeiro', alvo: 30000, atual: 18500, unidade: 'reais', prazo: dias(120) },
  { id: 'me-04', atleticaSlug: 'dragoes', gestaoAno: 2026, titulo: 'Modalidades com equipe ativa', area: 'Esportes', alvo: 8, atual: 6, unidade: 'modalidades', prazo: dias(90) },
  { id: 'me-05', atleticaSlug: 'dragoes', gestaoAno: 2026, titulo: 'Pessoas alcançadas por projeto social', area: 'Social', alvo: 500, atual: 312, unidade: 'pessoas', prazo: dias(120) },
  { id: 'me-06', atleticaSlug: 'dragoes', gestaoAno: 2026, titulo: 'Taxa de presença nos eventos', area: 'Eventos', alvo: 80, atual: 74, unidade: '%', prazo: dias(120) },
  { id: 'me-07', atleticaSlug: 'corujas', gestaoAno: 2026, titulo: 'Equipes de e-sports', area: 'E-sports', alvo: 4, atual: 2, unidade: 'equipes', prazo: dias(100) },
]

// ---------------------------------------------------------------------
// Reuniões
// ---------------------------------------------------------------------

const CONVOCADOS = [
  { nome: 'Marina Alencar', avatarUrl: null, confirmado: true },
  { nome: 'Rafael Bandeira', avatarUrl: null, confirmado: true },
  { nome: 'Camila Toledo', avatarUrl: null, confirmado: true },
  { nome: 'Diego Marinho', avatarUrl: null, confirmado: false },
  { nome: 'Larissa Prado', avatarUrl: null, confirmado: true },
  { nome: 'Helena Vasques', avatarUrl: null, confirmado: true },
  { nome: 'Pedro Vilanova', avatarUrl: null, confirmado: false },
  { nome: 'Thiago Rezende', avatarUrl: null, confirmado: true },
]

export const REUNIOES: Reuniao[] = [
  {
    id: 'rn-01',
    atleticaSlug: 'dragoes',
    titulo: 'Reunião da diretoria — semana da Interatlética',
    inicioEm: dias(1, 19, 0),
    duracaoEmMinutos: 90,
    local: 'Sala da Atlética',
    linkOnline: null,
    status: 'AGENDADA',
    convocados: CONVOCADOS,
    pautas: [
      { id: 'pt-01', titulo: 'Escala de portaria e voluntários', responsavel: 'Camila Toledo', minutos: 20, decisaoId: null },
      { id: 'pt-02', titulo: 'Escolha do fornecedor de uniformes', responsavel: 'Helena Vasques', minutos: 25, decisaoId: 'dc-01' },
      { id: 'pt-03', titulo: 'Prestação de contas do mês', responsavel: 'Diego Marinho', minutos: 25, decisaoId: null },
      { id: 'pt-04', titulo: 'Plano de chuva do interatlética', responsavel: 'Rafael Bandeira', minutos: 20, decisaoId: null },
    ],
    ata: null,
    tarefasGeradas: 0,
    documentos: ['Prévia da prestação de contas do mês.pdf', 'Orçamentos de uniforme.xlsx'],
  },
  {
    id: 'rn-02',
    atleticaSlug: 'dragoes',
    titulo: 'Assembleia geral de membros',
    inicioEm: dias(15, 19, 30),
    duracaoEmMinutos: 120,
    local: 'Auditório B, UniVale',
    linkOnline: 'https://meet.exemplo/assembleia-dragoes',
    status: 'AGENDADA',
    convocados: CONVOCADOS,
    pautas: [
      { id: 'pt-05', titulo: 'Abertura do processo eleitoral 2027', responsavel: 'Marina Alencar', minutos: 30, decisaoId: 'dc-02' },
      { id: 'pt-06', titulo: 'Nova identidade visual: direção criativa', responsavel: 'Helena Vasques', minutos: 40, decisaoId: 'dc-03' },
      { id: 'pt-07', titulo: 'Balanço da temporada esportiva', responsavel: 'Rafael Bandeira', minutos: 30, decisaoId: null },
    ],
    ata: null,
    tarefasGeradas: 0,
    documentos: ['Minuta do edital eleitoral.docx'],
  },
  {
    id: 'rn-03',
    atleticaSlug: 'dragoes',
    titulo: 'Reunião da diretoria — fechamento do mês',
    inicioEm: dias(-14, 19, 0),
    duracaoEmMinutos: 85,
    local: 'Sala da Atlética',
    linkOnline: null,
    status: 'REALIZADA',
    convocados: CONVOCADOS.map((c, i) => ({ ...c, confirmado: i !== 6 })),
    pautas: [
      { id: 'pt-08', titulo: 'Fechamento do orçamento da Interatlética', responsavel: 'Diego Marinho', minutos: 30, decisaoId: 'dc-04' },
      { id: 'pt-09', titulo: 'Contratação da arbitragem', responsavel: 'Rafael Bandeira', minutos: 25, decisaoId: null },
      { id: 'pt-10', titulo: 'Situação do patrimônio esportivo', responsavel: 'Pedro Vilanova', minutos: 30, decisaoId: null },
    ],
    ata:
      'Aprovado o orçamento de R$ 28.000 para a Interatlética 2026, com a ressalva '
      + 'de que a cota de arbitragem seja revista se entrarem menos de seis atléticas.\n\n'
      + 'A arbitragem fica com a Federação Regional, que já atendeu a edição passada '
      + 'sem intercorrência. Diego fecha o contrato até o fim da semana.\n\n'
      + 'O levantamento do patrimônio apontou 11 bolas fora de uso e duas redes de vôlei '
      + 'danificadas. Pedro abre tarefa para dar baixa e orçar reposição.',
    tarefasGeradas: 4,
    documentos: ['Ata da última reunião de diretoria.pdf', 'Orçamento Interatlética 2026.xlsx'],
  },
  {
    id: 'rn-04',
    atleticaSlug: 'dragoes',
    titulo: 'Alinhamento com as atléticas coorganizadoras',
    inicioEm: dias(-6, 20, 0),
    duracaoEmMinutos: 60,
    local: null,
    linkOnline: 'https://meet.exemplo/interatletica-2026',
    status: 'REALIZADA',
    convocados: CONVOCADOS.slice(0, 4),
    pautas: [
      { id: 'pt-11', titulo: 'Divisão de custos entre as seis atléticas', responsavel: 'Marina Alencar', minutos: 30, decisaoId: null },
      { id: 'pt-12', titulo: 'Responsáveis por modalidade', responsavel: 'Rafael Bandeira', minutos: 30, decisaoId: null },
    ],
    ata:
      'A divisão de custos fica proporcional ao número de atletas inscritos por '
      + 'atlética, e não em partes iguais — foi o ponto que travou a edição de 2025.\n\n'
      + 'Cada atlética assume duas modalidades. Dragões ficam com futsal e vôlei.',
    tarefasGeradas: 6,
    documentos: [],
  },
]

// ---------------------------------------------------------------------
// Decisões
// ---------------------------------------------------------------------

export const DECISOES: Decisao[] = [
  {
    id: 'dc-01',
    atleticaSlug: 'dragoes',
    titulo: 'Fornecedor dos uniformes da temporada',
    contexto:
      'Três orçamentos para 120 conjuntos. A diferença entre o mais barato e o '
      + 'mais caro é de R$ 4.200, mas o prazo do mais barato passa da data da '
      + 'Interatlética.',
    status: 'EM_VOTACAO',
    reuniaoId: 'rn-01',
    reuniaoTitulo: 'Reunião da diretoria — semana da Interatlética',
    abertaEm: dias(-3),
    fechaEm: dias(2),
    opcoes: [
      { id: 'op-01', rotulo: 'Tecidos Aurora', detalhe: 'R$ 14.400 · 35 dias · nota 4,6 na rede', votos: 3 },
      { id: 'op-02', rotulo: 'Malharia Serrana', detalhe: 'R$ 10.200 · 60 dias · nota 4,1 na rede', votos: 1 },
      { id: 'op-03', rotulo: 'Uniformes Vale', detalhe: 'R$ 12.800 · 30 dias · nota 4,8 na rede', votos: 3 },
    ],
    escolhidaId: null,
    responsavelNome: 'Helena Vasques',
    quorum: 5,
    votantes: 7,
    meuVoto: null,
  },
  {
    id: 'dc-02',
    atleticaSlug: 'dragoes',
    titulo: 'Abrir o processo eleitoral em outubro ou novembro',
    contexto:
      'Adiantar dá mais tempo de transição, mas cai em cima da semana de provas. '
      + 'A gestão passada abriu em novembro e a transição ficou corrida.',
    status: 'EM_VOTACAO',
    reuniaoId: 'rn-02',
    reuniaoTitulo: 'Assembleia geral de membros',
    abertaEm: dias(-1),
    fechaEm: dias(16),
    opcoes: [
      { id: 'op-04', rotulo: 'Outubro', detalhe: 'Mais tempo de transição, conflito com provas', votos: 4 },
      { id: 'op-05', rotulo: 'Novembro', detalhe: 'Sem conflito, transição de três semanas', votos: 2 },
    ],
    escolhidaId: null,
    responsavelNome: 'Marina Alencar',
    quorum: 5,
    votantes: 6,
    meuVoto: null,
  },
  {
    id: 'dc-03',
    atleticaSlug: 'dragoes',
    titulo: 'Direção criativa da nova identidade visual',
    contexto: 'Três propostas apresentadas pela diretoria de marketing.',
    status: 'RASCUNHO',
    reuniaoId: 'rn-02',
    reuniaoTitulo: 'Assembleia geral de membros',
    abertaEm: dias(15),
    fechaEm: null,
    opcoes: [
      { id: 'op-06', rotulo: 'Manter o brasão, modernizar o traço', detalhe: null, votos: 0 },
      { id: 'op-07', rotulo: 'Redesenho completo', detalhe: null, votos: 0 },
      { id: 'op-08', rotulo: 'Adiar para a próxima gestão', detalhe: null, votos: 0 },
    ],
    escolhidaId: null,
    responsavelNome: 'Helena Vasques',
    quorum: 8,
    votantes: 0,
    meuVoto: null,
  },
  {
    id: 'dc-04',
    atleticaSlug: 'dragoes',
    titulo: 'Orçamento da Interatlética 2026',
    contexto: 'Proposta de R$ 28.000, com R$ 18.000 vindo de patrocínio e cota das atléticas.',
    status: 'APROVADA',
    reuniaoId: 'rn-03',
    reuniaoTitulo: 'Reunião da diretoria — fechamento do mês',
    abertaEm: dias(-14),
    fechaEm: dias(-14),
    opcoes: [
      { id: 'op-09', rotulo: 'Aprovar os R$ 28.000', detalhe: 'Com revisão da cota de arbitragem', votos: 6 },
      { id: 'op-10', rotulo: 'Reduzir para R$ 22.000', detalhe: 'Cortando transmissão e troféus', votos: 1 },
    ],
    escolhidaId: 'op-09',
    responsavelNome: 'Diego Marinho',
    quorum: 5,
    votantes: 7,
    meuVoto: 'op-09',
  },
  {
    id: 'dc-05',
    atleticaSlug: 'dragoes',
    titulo: 'Cobrar taxa de inscrição no interatlética?',
    contexto:
      'A cota das atléticas cobre 60% do custo. A diferença sai do caixa ou de '
      + 'uma taxa por atleta.',
    status: 'REJEITADA',
    reuniaoId: null,
    reuniaoTitulo: null,
    abertaEm: dias(-40),
    fechaEm: dias(-33),
    opcoes: [
      { id: 'op-11', rotulo: 'Cobrar R$ 20 por atleta', detalhe: null, votos: 2 },
      { id: 'op-12', rotulo: 'Não cobrar e buscar mais patrocínio', detalhe: null, votos: 5 },
    ],
    escolhidaId: 'op-12',
    responsavelNome: 'Marina Alencar',
    quorum: 5,
    votantes: 7,
    meuVoto: 'op-12',
  },
]

// ---------------------------------------------------------------------
// Gestões
// ---------------------------------------------------------------------

export const GESTOES: Gestao[] = [
  {
    ano: 2026,
    atleticaSlug: 'dragoes',
    periodo: 'Janeiro de 2026 a dezembro de 2026',
    presidente: 'Marina Alencar',
    encerrada: false,
    integrantes: [
      { nome: 'Marina Alencar', cargo: 'Presidente', avatarUrl: null },
      { nome: 'Rafael Bandeira', cargo: 'Vice-presidente', avatarUrl: null },
      { nome: 'Camila Toledo', cargo: 'Diretora de Esportes', avatarUrl: null },
      { nome: 'Diego Marinho', cargo: 'Diretor Financeiro', avatarUrl: null },
      { nome: 'Helena Vasques', cargo: 'Diretora de Marketing', avatarUrl: null },
      { nome: 'Larissa Prado', cargo: 'Diretora de Eventos', avatarUrl: null },
      { nome: 'Pedro Vilanova', cargo: 'Secretário', avatarUrl: null },
    ],
    eventosRealizados: 7,
    projetosConcluidos: 3,
    membrosAoFinal: 94,
    saldoFinal: null,
    conquistas: [
      'Primeira Interatlética com seis atléticas participantes',
      'Campanha do agasalho alcançou 312 pessoas',
      'Patrimônio inventariado item a item pela primeira vez',
    ],
    problemas: [
      'A prestação de contas de março atrasou seis semanas',
      'Duas equipes ficaram sem técnico no meio da temporada',
    ],
    recomendacoes: [
      'Fechar a arbitragem com 90 dias de antecedência, não 45',
      'Manter a divisão de custos por número de atletas, não em partes iguais',
    ],
    documentos: ['Plano de gestão 2026.pdf', 'Orçamento anual 2026.xlsx'],
  },
  {
    ano: 2025,
    atleticaSlug: 'dragoes',
    periodo: 'Janeiro de 2025 a dezembro de 2025',
    presidente: 'Bruno Sarmento',
    encerrada: true,
    integrantes: [
      { nome: 'Bruno Sarmento', cargo: 'Presidente', avatarUrl: null },
      { nome: 'Marina Alencar', cargo: 'Diretora de Eventos', avatarUrl: null },
      { nome: 'Isabela Cunha', cargo: 'Diretora Financeira', avatarUrl: null },
      { nome: 'Gustavo Peixoto', cargo: 'Diretor de Esportes', avatarUrl: null },
    ],
    eventosRealizados: 9,
    projetosConcluidos: 5,
    membrosAoFinal: 81,
    saldoFinal: 6240,
    conquistas: [
      'Campeã geral da Interatlética 2025',
      'Primeiro patrocínio anual da história da atlética',
    ],
    problemas: [
      'A senha do Instagram se perdeu na troca de gestão e a conta ficou uma semana fora',
      'Nenhum contrato de fornecedor estava arquivado em lugar único',
    ],
    recomendacoes: [
      'Guardar todo acesso em um cofre com dois responsáveis',
      'Arquivar contrato assim que assinar, e não no fim do ano',
    ],
    documentos: ['Relatório final da gestão 2025.pdf', 'Ata de posse 2026.pdf'],
  },
  {
    ano: 2024,
    atleticaSlug: 'dragoes',
    periodo: 'Janeiro de 2024 a dezembro de 2024',
    presidente: 'Isabela Cunha',
    encerrada: true,
    integrantes: [
      { nome: 'Isabela Cunha', cargo: 'Presidente', avatarUrl: null },
      { nome: 'Bruno Sarmento', cargo: 'Vice-presidente', avatarUrl: null },
    ],
    eventosRealizados: 6,
    projetosConcluidos: 2,
    membrosAoFinal: 68,
    saldoFinal: 1180,
    conquistas: ['Retomada das atividades depois de dois anos parados'],
    problemas: ['Caixa fechou o ano quase zerado, sem reserva para a gestão seguinte'],
    recomendacoes: ['Guardar pelo menos um mês de custo fixo como reserva'],
    documentos: ['Relatório final da gestão 2024.pdf'],
  },
]

// ---------------------------------------------------------------------
// Transição
// ---------------------------------------------------------------------

export const TRANSICAO: Transicao = {
  atleticaSlug: 'dragoes',
  deAno: 2026,
  paraAno: 2027,
  entregaEm: dias(140),
  itens: [
    { id: 'tr-01', area: 'DOCUMENTOS', titulo: 'Estatuto vigente arquivado e assinado', detalhe: null, concluido: true, responsavelNome: 'Pedro Vilanova' },
    { id: 'tr-02', area: 'DOCUMENTOS', titulo: 'Atas de todas as reuniões do ano', detalhe: 'Faltam duas de fevereiro.', concluido: false, responsavelNome: 'Pedro Vilanova' },
    { id: 'tr-03', area: 'FINANCEIRO', titulo: 'Prestação de contas fechada até o último mês', detalhe: null, concluido: false, responsavelNome: 'Diego Marinho' },
    { id: 'tr-04', area: 'FINANCEIRO', titulo: 'Extrato e saldo conferidos com a tesouraria', detalhe: null, concluido: false, responsavelNome: 'Diego Marinho' },
    { id: 'tr-05', area: 'FINANCEIRO', titulo: 'Contas a pagar e a receber listadas', detalhe: null, concluido: true, responsavelNome: 'Diego Marinho' },
    { id: 'tr-06', area: 'PROJETOS', titulo: 'Projetos em andamento com responsável definido', detalhe: 'Captação 2027 e identidade visual seguem abertos.', concluido: false, responsavelNome: 'Marina Alencar' },
    { id: 'tr-07', area: 'FORNECEDORES', titulo: 'Contratos de fornecedor arquivados', detalhe: null, concluido: true, responsavelNome: 'Helena Vasques' },
    { id: 'tr-08', area: 'FORNECEDORES', titulo: 'Contatos e histórico de negociação registrados', detalhe: null, concluido: true, responsavelNome: 'Helena Vasques' },
    { id: 'tr-09', area: 'PATRIMONIO', titulo: 'Inventário conferido item a item', detalhe: null, concluido: true, responsavelNome: 'Pedro Vilanova' },
    { id: 'tr-10', area: 'PATRIMONIO', titulo: 'Itens danificados com baixa registrada', detalhe: 'Onze bolas e duas redes.', concluido: false, responsavelNome: 'Pedro Vilanova' },
    { id: 'tr-11', area: 'ACESSOS', titulo: 'Acessos de redes sociais transferidos', detalhe: 'O erro de 2025 que não pode repetir.', concluido: false, responsavelNome: 'Helena Vasques' },
    { id: 'tr-12', area: 'ACESSOS', titulo: 'Acesso ao banco e ao e-mail institucional', detalhe: null, concluido: false, responsavelNome: 'Marina Alencar' },
    { id: 'tr-13', area: 'PENDENCIAS', titulo: 'Relatório final da gestão escrito', detalhe: null, concluido: false, responsavelNome: 'Marina Alencar' },
    { id: 'tr-14', area: 'PENDENCIAS', titulo: 'Reunião de passagem com a nova diretoria', detalhe: null, concluido: false, responsavelNome: 'Marina Alencar' },
  ],
}

// ---------------------------------------------------------------------
// Documentos
// ---------------------------------------------------------------------

export const DOCUMENTOS: Documento[] = [
  { id: 'dm-01', atleticaSlug: 'dragoes', nome: 'Estatuto da Atlética Dragões', pasta: 'ESTATUTO', formato: 'PDF', tamanhoEmKb: 412, visibilidade: 'PUBLICO', atualizadoEm: dias(-620), autorNome: 'Isabela Cunha', gestaoAno: 2024, descricao: 'Versão vigente, registrada em cartório.' },
  { id: 'dm-02', atleticaSlug: 'dragoes', nome: 'Regimento interno', pasta: 'ESTATUTO', formato: 'PDF', tamanhoEmKb: 208, visibilidade: 'REDE', atualizadoEm: dias(-300), autorNome: 'Bruno Sarmento', gestaoAno: 2025, descricao: null },
  { id: 'dm-03', atleticaSlug: 'dragoes', nome: 'Ata da última reunião de diretoria', pasta: 'ATAS', formato: 'PDF', tamanhoEmKb: 96, visibilidade: 'DIRETORIA', atualizadoEm: dias(-13), autorNome: 'Pedro Vilanova', gestaoAno: 2026, descricao: 'Orçamento da Interatlética e arbitragem.' },
  { id: 'dm-04', atleticaSlug: 'dragoes', nome: 'Ata da reunião anterior', pasta: 'ATAS', formato: 'PDF', tamanhoEmKb: 88, visibilidade: 'DIRETORIA', atualizadoEm: dias(-44), autorNome: 'Pedro Vilanova', gestaoAno: 2026, descricao: null },
  { id: 'dm-05', atleticaSlug: 'dragoes', nome: 'Ata de posse da diretoria 2026', pasta: 'ATAS', formato: 'PDF', tamanhoEmKb: 130, visibilidade: 'INTERNO', atualizadoEm: dias(-240), autorNome: 'Bruno Sarmento', gestaoAno: 2025, descricao: null },
  { id: 'dm-06', atleticaSlug: 'dragoes', nome: 'Contrato — Ginásio Central', pasta: 'CONTRATOS', formato: 'PDF', tamanhoEmKb: 322, visibilidade: 'DIRETORIA', atualizadoEm: dias(-20), autorNome: 'Rafael Bandeira', gestaoAno: 2026, descricao: 'Uso das quadras nos três dias da Interatlética.' },
  { id: 'dm-07', atleticaSlug: 'dragoes', nome: 'Contrato — Federação Regional de Arbitragem', pasta: 'CONTRATOS', formato: 'PDF', tamanhoEmKb: 190, visibilidade: 'DIRETORIA', atualizadoEm: dias(-11), autorNome: 'Diego Marinho', gestaoAno: 2026, descricao: null },
  { id: 'dm-08', atleticaSlug: 'dragoes', nome: 'Contrato de patrocínio — Ótica Vale', pasta: 'CONTRATOS', formato: 'PDF', tamanhoEmKb: 245, visibilidade: 'DIRETORIA', atualizadoEm: dias(-150), autorNome: 'Diego Marinho', gestaoAno: 2026, descricao: 'Cota master, vigência de doze meses.' },
  { id: 'dm-09', atleticaSlug: 'dragoes', nome: 'Prestação de contas do mês', pasta: 'FINANCEIRO', formato: 'XLSX', tamanhoEmKb: 64, visibilidade: 'INTERNO', atualizadoEm: dias(-4), autorNome: 'Diego Marinho', gestaoAno: 2026, descricao: null },
  { id: 'dm-10', atleticaSlug: 'dragoes', nome: 'Orçamento anual 2026', pasta: 'FINANCEIRO', formato: 'XLSX', tamanhoEmKb: 118, visibilidade: 'DIRETORIA', atualizadoEm: dias(-210), autorNome: 'Diego Marinho', gestaoAno: 2026, descricao: null },
  { id: 'dm-11', atleticaSlug: 'dragoes', nome: 'Regulamento geral — Interatlética 2026', pasta: 'REGULAMENTOS', formato: 'PDF', tamanhoEmKb: 356, visibilidade: 'PUBLICO', atualizadoEm: dias(-8), autorNome: 'Rafael Bandeira', gestaoAno: 2026, descricao: 'Regras comuns a todas as modalidades.' },
  { id: 'dm-12', atleticaSlug: 'dragoes', nome: 'Regulamento — futsal', pasta: 'REGULAMENTOS', formato: 'PDF', tamanhoEmKb: 142, visibilidade: 'PUBLICO', atualizadoEm: dias(-7), autorNome: 'Camila Toledo', gestaoAno: 2026, descricao: null },
  { id: 'dm-13', atleticaSlug: 'dragoes', nome: 'Ficha de inscrição de atleta', pasta: 'EVENTOS', formato: 'DOCX', tamanhoEmKb: 42, visibilidade: 'REDE', atualizadoEm: dias(-60), autorNome: 'Camila Toledo', gestaoAno: 2026, descricao: 'Modelo usado desde 2024.' },
  { id: 'dm-14', atleticaSlug: 'dragoes', nome: 'Plano de chuva — Interatlética', pasta: 'EVENTOS', formato: 'DOCX', tamanhoEmKb: 38, visibilidade: 'DIRETORIA', atualizadoEm: dias(-2), autorNome: 'Rafael Bandeira', gestaoAno: 2026, descricao: null },
  { id: 'dm-15', atleticaSlug: 'dragoes', nome: 'Plano de gestão 2026', pasta: 'GESTAO', formato: 'PDF', tamanhoEmKb: 520, visibilidade: 'INTERNO', atualizadoEm: dias(-230), autorNome: 'Marina Alencar', gestaoAno: 2026, descricao: 'Metas e prioridades apresentadas na eleição.' },
  { id: 'dm-16', atleticaSlug: 'dragoes', nome: 'Relatório final da gestão 2025', pasta: 'HISTORICO', formato: 'PDF', tamanhoEmKb: 780, visibilidade: 'REDE', atualizadoEm: dias(-235), autorNome: 'Bruno Sarmento', gestaoAno: 2025, descricao: 'O documento que evitou começar 2026 do zero.' },
  { id: 'dm-17', atleticaSlug: 'dragoes', nome: 'Relatório final da gestão 2024', pasta: 'HISTORICO', formato: 'PDF', tamanhoEmKb: 610, visibilidade: 'REDE', atualizadoEm: dias(-600), autorNome: 'Isabela Cunha', gestaoAno: 2024, descricao: null },
  { id: 'dm-18', atleticaSlug: 'dragoes', nome: 'Galeria — Interatlética 2025', pasta: 'HISTORICO', formato: 'LINK', tamanhoEmKb: null, visibilidade: 'PUBLICO', atualizadoEm: dias(-270), autorNome: 'Helena Vasques', gestaoAno: 2025, descricao: null },
]

// ---------------------------------------------------------------------
// Patrimônio
// ---------------------------------------------------------------------

export const PATRIMONIO: ItemDePatrimonio[] = [
  { id: 'pa-01', atleticaSlug: 'dragoes', nome: 'Bolas de futsal', categoria: 'ESPORTIVO', quantidade: 14, estado: 'BOM', localizacao: 'Sala da Atlética — armário 1', responsavelNome: 'Camila Toledo', valorEstimado: 2100, adquiridoEm: dias(-400), fotoUrl: null, observacao: null },
  { id: 'pa-02', atleticaSlug: 'dragoes', nome: 'Bolas de vôlei', categoria: 'ESPORTIVO', quantidade: 9, estado: 'DESGASTADO', localizacao: 'Sala da Atlética — armário 1', responsavelNome: 'Camila Toledo', valorEstimado: 1350, adquiridoEm: dias(-700), fotoUrl: null, observacao: 'Quatro precisam de troca até o fim do ano.' },
  { id: 'pa-03', atleticaSlug: 'dragoes', nome: 'Redes de vôlei', categoria: 'ESPORTIVO', quantidade: 2, estado: 'DANIFICADO', localizacao: 'Ginásio — depósito', responsavelNome: 'Pedro Vilanova', valorEstimado: 0, adquiridoEm: dias(-900), fotoUrl: null, observacao: 'Rasgadas. Baixa aprovada, aguardando registro.' },
  { id: 'pa-04', atleticaSlug: 'dragoes', nome: 'Uniformes de futsal — jogo azul', categoria: 'UNIFORME', quantidade: 22, estado: 'BOM', localizacao: 'Sala da Atlética — armário 2', responsavelNome: 'Rafael Bandeira', valorEstimado: 3300, adquiridoEm: dias(-330), fotoUrl: null, observacao: null },
  { id: 'pa-05', atleticaSlug: 'dragoes', nome: 'Uniformes de vôlei feminino', categoria: 'UNIFORME', quantidade: 16, estado: 'NOVO', localizacao: 'Sala da Atlética — armário 2', responsavelNome: 'Camila Toledo', valorEstimado: 2880, adquiridoEm: dias(-60), fotoUrl: null, observacao: null },
  { id: 'pa-06', atleticaSlug: 'dragoes', nome: 'Camisas de torcida', categoria: 'UNIFORME', quantidade: 120, estado: 'NOVO', localizacao: 'Depósito do centro acadêmico', responsavelNome: 'Helena Vasques', valorEstimado: 4800, adquiridoEm: dias(-90), fotoUrl: null, observacao: 'Lote da campanha da camisa nova.' },
  { id: 'pa-07', atleticaSlug: 'dragoes', nome: 'Caixa de som ativa', categoria: 'ELETRONICO', quantidade: 2, estado: 'BOM', localizacao: 'Sala da Atlética', responsavelNome: 'Helena Vasques', valorEstimado: 2400, adquiridoEm: dias(-500), fotoUrl: null, observacao: null },
  { id: 'pa-08', atleticaSlug: 'dragoes', nome: 'Microfone sem fio', categoria: 'ELETRONICO', quantidade: 2, estado: 'DESGASTADO', localizacao: 'Sala da Atlética', responsavelNome: 'Helena Vasques', valorEstimado: 600, adquiridoEm: dias(-640), fotoUrl: null, observacao: 'Um deles falha quando a bateria cai de 30%.' },
  { id: 'pa-09', atleticaSlug: 'dragoes', nome: 'Notebook da secretaria', categoria: 'ELETRONICO', quantidade: 1, estado: 'BOM', localizacao: 'Com o secretário', responsavelNome: 'Pedro Vilanova', valorEstimado: 3200, adquiridoEm: dias(-380), fotoUrl: null, observacao: null },
  { id: 'pa-10', atleticaSlug: 'dragoes', nome: 'Mesas dobráveis', categoria: 'MOBILIARIO', quantidade: 6, estado: 'BOM', localizacao: 'Ginásio — depósito', responsavelNome: 'Pedro Vilanova', valorEstimado: 1800, adquiridoEm: dias(-450), fotoUrl: null, observacao: null },
  { id: 'pa-11', atleticaSlug: 'dragoes', nome: 'Tendas 3x3', categoria: 'MOBILIARIO', quantidade: 4, estado: 'BOM', localizacao: 'Ginásio — depósito', responsavelNome: 'Rafael Bandeira', valorEstimado: 2600, adquiridoEm: dias(-220), fotoUrl: null, observacao: null },
  { id: 'pa-12', atleticaSlug: 'dragoes', nome: 'Kit de primeiros socorros', categoria: 'OUTRO', quantidade: 3, estado: 'BOM', localizacao: 'Sala da Atlética', responsavelNome: 'Camila Toledo', valorEstimado: 450, adquiridoEm: dias(-120), fotoUrl: null, observacao: 'Conferir validade antes de cada evento.' },
  { id: 'pa-13', atleticaSlug: 'dragoes', nome: 'Bandeiras e faixas', categoria: 'OUTRO', quantidade: 11, estado: 'BOM', localizacao: 'Sala da Atlética', responsavelNome: 'Helena Vasques', valorEstimado: 900, adquiridoEm: dias(-500), fotoUrl: null, observacao: null },
  { id: 'pa-14', atleticaSlug: 'dragoes', nome: 'Bolas de basquete', categoria: 'ESPORTIVO', quantidade: 7, estado: 'BOM', localizacao: 'Sala da Atlética — armário 1', responsavelNome: 'Camila Toledo', valorEstimado: 1050, adquiridoEm: dias(-280), fotoUrl: null, observacao: null },
  { id: 'pa-15', atleticaSlug: 'dragoes', nome: 'Bolas fora de uso', categoria: 'ESPORTIVO', quantidade: 11, estado: 'BAIXADO', localizacao: 'Ginásio — depósito', responsavelNome: 'Pedro Vilanova', valorEstimado: 0, adquiridoEm: dias(-1100), fotoUrl: null, observacao: 'Levantadas no último inventário. Baixa pendente de registro.' },
]

// ---------------------------------------------------------------------
// Histórico
// ---------------------------------------------------------------------

export const HISTORICO: EventoDoHistorico[] = [
  { id: 'h-01', quando: dias(-1, 15, 20), autorNome: 'Marina Alencar', acao: 'publicou o aviso', alvo: 'Concentração da Interatlética muda para 8h', detalhe: null },
  { id: 'h-02', quando: dias(-2, 11, 5), autorNome: 'Rafael Bandeira', acao: 'anexou o documento', alvo: 'Plano de chuva — Interatlética', detalhe: 'pasta Eventos' },
  { id: 'h-03', quando: dias(-3, 18, 40), autorNome: 'Helena Vasques', acao: 'abriu a decisão', alvo: 'Fornecedor dos uniformes da temporada', detalhe: 'três opções, quórum de cinco' },
  { id: 'h-04', quando: dias(-4, 9, 12), autorNome: 'Diego Marinho', acao: 'fechou a prestação de contas', alvo: 'Agosto de 2026', detalhe: 'saldo de R$ 8.420' },
  { id: 'h-05', quando: dias(-6, 21, 30), autorNome: 'Marina Alencar', acao: 'registrou a ata', alvo: 'Alinhamento com as atléticas coorganizadoras', detalhe: 'seis tarefas geradas' },
  { id: 'h-06', quando: dias(-8, 14, 0), autorNome: 'Rafael Bandeira', acao: 'publicou o regulamento', alvo: 'Interatlética 2026', detalhe: 'visível para o público' },
  { id: 'h-07', quando: dias(-11, 16, 45), autorNome: 'Diego Marinho', acao: 'assinou o contrato', alvo: 'Federação Regional de Arbitragem', detalhe: 'R$ 6.400' },
  { id: 'h-08', quando: dias(-13, 10, 0), autorNome: 'Pedro Vilanova', acao: 'concluiu o inventário', alvo: 'Inventário do patrimônio', detalhe: '15 categorias, 11 itens para baixa' },
  { id: 'h-09', quando: dias(-14, 20, 50), autorNome: 'Diego Marinho', acao: 'aprovou a decisão', alvo: 'Orçamento da Interatlética 2026', detalhe: '6 votos a 1' },
  { id: 'h-10', quando: dias(-20, 13, 15), autorNome: 'Camila Toledo', acao: 'mudou o papel de', alvo: 'Larissa Prado', detalhe: 'de Membro para Diretora' },
]
