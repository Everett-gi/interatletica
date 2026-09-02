/**
 * Dados de demonstração.
 *
 * <p>Existem por uma razão prática: no Vercel só sobe o front. A API em
 * Spring vive num container com Postgres e não está publicada, então sem
 * esta camada o deploy seria um app bonito que não carrega nada.</p>
 *
 * <p>São dados FICTÍCIOS de instituições fictícias. Nenhuma atlética,
 * faculdade ou pessoa real aparece aqui — e não deve passar a aparecer:
 * este arquivo é público, e a plataforma lida com nome, e-mail e telefone
 * de estudantes.</p>
 *
 * <p>O formato espelha exatamente o que a API devolve. Quando o backend
 * estiver no ar, trocar a fonte é mudar uma flag — nenhuma tela sabe de onde
 * o dado veio.</p>
 */

import type {
  AtleticaResumo,
  Convite,
  Evento,
  EventoResumo,
  Membro,
  Participante,
  PerfilDaSessao,
} from '../api/tipos'
import type {
  Aviso,
  Equipe,
  LinhaDoQuadroDeMedalhas,
  Partida,
  Tarefa,
  Torneio,
} from '../api/tipos-rede'

/**
 * A âncora temporal do demo: hoje, às 18h.
 *
 * <p>Era uma data fixa, e a intenção estava certa mas o efeito era o oposto:
 * com o calendário andando e a âncora parada, todo evento "daqui a três
 * dias" virava "há duas semanas". Uma demonstração aberta um mês depois
 * mostrava um campeonato que já tinha acontecido e uma votação que fechou
 * anteontem.</p>
 *
 * <p>Ancorar em <em>hoje</em> preserva as duas propriedades que importam: os
 * intervalos relativos continuam os mesmos — o interatlética é sempre daqui
 * a 23 dias — e a hora fixa mantém o resultado idêntico durante a visita
 * inteira, sem depender do minuto em que a página abriu.</p>
 */
export const AGORA = (() => {
  const hoje = new Date()
  hoje.setHours(18, 0, 0, 0)
  return hoje
})()

export function dias(quantidade: number, hora = 20, minuto = 0): string {
  const data = new Date(AGORA)
  data.setDate(data.getDate() + quantidade)
  data.setHours(hora, minuto, 0, 0)
  return data.toISOString()
}

// ---------------------------------------------------------------------
// Atléticas
// ---------------------------------------------------------------------

export const ATLETICAS: AtleticaResumo[] = [
  {
    slug: 'dragoes',
    nome: 'Atlética Dragões',
    sigla: 'DRG',
    instituicao: 'Faculdade de Engenharia, UniVale',
    cidade: 'São Bento do Vale',
    uf: 'SP',
    brasaoUrl: null,
    corPrimaria: '#C2410C',
  },
  {
    slug: 'leoes',
    nome: 'Atlética Leões',
    sigla: 'LEO',
    instituicao: 'Faculdade de Direito, UniVale',
    cidade: 'São Bento do Vale',
    uf: 'SP',
    brasaoUrl: null,
    corPrimaria: '#B8912B',
  },
  {
    slug: 'furacao',
    nome: 'Atlética Furacão',
    sigla: 'FUR',
    instituicao: 'Faculdade de Medicina, Instituto Serrano',
    cidade: 'Serra Alta',
    uf: 'MG',
    brasaoUrl: null,
    corPrimaria: '#1D4ED8',
  },
  {
    slug: 'corujas',
    nome: 'Atlética Corujas',
    sigla: 'COR',
    instituicao: 'Instituto de Computação, UniVale',
    cidade: 'São Bento do Vale',
    uf: 'SP',
    brasaoUrl: null,
    corPrimaria: '#6D28D9',
  },
  {
    slug: 'panteras',
    nome: 'Atlética Panteras',
    sigla: 'PAN',
    instituicao: 'Escola de Administração, Centro Universitário Aurora',
    cidade: 'Porto Aurora',
    uf: 'PR',
    brasaoUrl: null,
    corPrimaria: '#0F766E',
  },
  {
    slug: 'javalis',
    nome: 'Atlética Javalis',
    sigla: 'JAV',
    instituicao: 'Faculdade de Agronomia, Instituto Serrano',
    cidade: 'Serra Alta',
    uf: 'MG',
    brasaoUrl: null,
    corPrimaria: '#4D7C0F',
  },
]

export function atleticaPorSlug(slug: string): AtleticaResumo | undefined {
  return ATLETICAS.find((a) => a.slug === slug)
}

// ---------------------------------------------------------------------
// Pessoas
// ---------------------------------------------------------------------

interface PessoaDemo {
  id: string
  nome: string
  email: string
}

export const PESSOAS: PessoaDemo[] = [
  { id: 'u-01', nome: 'Marina Alencar', email: 'marina.alencar@univale.exemplo' },
  { id: 'u-02', nome: 'Rafael Bandeira', email: 'rafael.bandeira@univale.exemplo' },
  { id: 'u-03', nome: 'Camila Toledo', email: 'camila.toledo@univale.exemplo' },
  { id: 'u-04', nome: 'Diego Marinho', email: 'diego.marinho@univale.exemplo' },
  { id: 'u-05', nome: 'Beatriz Nogueira', email: 'beatriz.nogueira@serrano.exemplo' },
  { id: 'u-06', nome: 'Thiago Rezende', email: 'thiago.rezende@serrano.exemplo' },
  { id: 'u-07', nome: 'Larissa Prado', email: 'larissa.prado@univale.exemplo' },
  { id: 'u-08', nome: 'Gustavo Peixoto', email: 'gustavo.peixoto@aurora.exemplo' },
  { id: 'u-09', nome: 'Helena Vasques', email: 'helena.vasques@univale.exemplo' },
  { id: 'u-10', nome: 'Bruno Sarmento', email: 'bruno.sarmento@serrano.exemplo' },
  { id: 'u-11', nome: 'Isabela Cunha', email: 'isabela.cunha@aurora.exemplo' },
  { id: 'u-12', nome: 'Pedro Vilanova', email: 'pedro.vilanova@univale.exemplo' },
]

/**
 * Quem está "logado" no demo: presidente dos Dragões, diretora nas Corujas.
 * Dois papéis diferentes de propósito — é o caso que justifica papel morar no
 * vínculo e não no usuário, e o seletor de atlética existir.
 */
export const SESSAO_DEMO: PerfilDaSessao = {
  id: 'u-01',
  nome: 'Marina Alencar',
  email: 'marina.alencar@univale.exemplo',
  avatarUrl: null,
  operador: true,
  atleticas: [
    { atletica: ATLETICAS[0], papel: 'PRESIDENTE', cargo: 'Presidente' },
    { atletica: ATLETICAS[3], papel: 'DIRETOR', cargo: 'Diretora de E-sports' },
  ],
  convitesPendentes: 1,
}

const CARGOS = [
  'Presidente',
  'Vice-presidente',
  'Diretor de Esportes',
  'Diretora de E-sports',
  'Diretor Financeiro',
  'Diretora de Marketing',
  null,
  null,
]

export const MEMBROS: Record<string, Membro[]> = {
  dragoes: PESSOAS.slice(0, 9).map((pessoa, indice) => ({
    id: `m-drg-${indice}`,
    usuarioId: pessoa.id,
    nome: pessoa.nome,
    email: pessoa.email,
    avatarUrl: null,
    papel: indice === 0 ? 'PRESIDENTE' : indice < 4 ? 'DIRETOR' : 'MEMBRO',
    cargo: CARGOS[indice] ?? null,
    situacao: indice === 8 ? 'INATIVO' : 'ATIVO',
    entrouEm: dias(-320 + indice * 12),
    saiuEm: indice === 8 ? dias(-40) : null,
  })),
  corujas: PESSOAS.slice(2, 8).map((pessoa, indice) => ({
    id: `m-cor-${indice}`,
    usuarioId: pessoa.id,
    nome: pessoa.nome,
    email: pessoa.email,
    avatarUrl: null,
    papel: indice === 0 ? 'PRESIDENTE' : indice === 1 ? 'DIRETOR' : 'MEMBRO',
    cargo: indice < 2 ? CARGOS[indice] : null,
    situacao: 'ATIVO',
    entrouEm: dias(-200 + indice * 15),
    saiuEm: null,
  })),
}

export const CONVITES: Record<string, Convite[]> = {
  dragoes: [
    {
      id: 'c-01',
      email: 'novo.calouro@univale.exemplo',
      papel: 'MEMBRO',
      link: 'https://interatletica.com.br/convite/demo-token-nao-funcional',
      expiraEm: dias(5),
      criadoEm: dias(-2),
    },
    {
      id: 'c-02',
      email: 'futura.diretora@univale.exemplo',
      papel: 'DIRETOR',
      link: 'https://interatletica.com.br/convite/demo-token-nao-funcional-2',
      expiraEm: dias(6),
      criadoEm: dias(-1),
    },
  ],
  corujas: [],
}

// ---------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------

interface EventoDemo extends Evento {
  atleticaSlug: string
  organizadoras: string[]
}

function evento(base: Partial<EventoDemo> & Pick<EventoDemo,
  'id' | 'slug' | 'titulo' | 'tipo' | 'inicioEm' | 'atleticaSlug'>): EventoDemo {
  return {
    descricao: null,
    modalidade: null,
    visibilidade: 'PUBLICO',
    status: 'PUBLICADO',
    fimEm: null,
    localNome: null,
    localEndereco: null,
    localMapaUrl: null,
    capacidade: null,
    inscricaoAbreEm: null,
    inscricaoFechaEm: null,
    inscricaoPorEquipe: false,
    capaUrl: null,
    publicadoEm: dias(-20),
    inscritosConfirmados: 0,
    naListaDeEspera: 0,
    organizadoras: [base.atleticaSlug],
    ...base,
  }
}

export const EVENTOS: EventoDemo[] = [
  evento({
    id: 'e-01',
    atleticaSlug: 'dragoes',
    slug: 'interatletica-2026',
    titulo: 'Interatlética 2026',
    descricao:
      'Três dias de competição entre as atléticas do Vale e da Serra. Vôlei, futsal, basquete, handebol e natação, mais a chave de e-sports.\n\nConcentração às 8h no ginásio central. Leve documento com foto e a camisa da sua atlética.',
    tipo: 'ESPORTIVO',
    modalidade: 'Múltiplas modalidades',
    inicioEm: dias(23, 8),
    fimEm: dias(25, 22),
    localNome: 'Ginásio Central, UniVale',
    localEndereco: 'Av. das Palmeiras, 1200, São Bento do Vale/SP',
    localMapaUrl: 'https://maps.google.com/?q=ginasio',
    capacidade: 600,
    inscricaoFechaEm: dias(18),
    inscritosConfirmados: 418,
    naListaDeEspera: 0,
    organizadoras: ['dragoes', 'leoes', 'furacao', 'corujas', 'panteras', 'javalis'],
  }),
  evento({
    id: 'e-02',
    atleticaSlug: 'dragoes',
    slug: 'calourada-engenharia',
    titulo: 'Calourada da Engenharia',
    descricao:
      'A festa de recepção dos calouros. Entrada só com inscrição confirmada. O QR do comprovante é lido na portaria.',
    tipo: 'SOCIAL',
    inicioEm: dias(9, 22),
    fimEm: dias(10, 4),
    localNome: 'Galpão Vale',
    localEndereco: 'Rua do Comércio, 45, São Bento do Vale/SP',
    capacidade: 300,
    inscricaoFechaEm: dias(8),
    inscritosConfirmados: 300,
    naListaDeEspera: 27,
  }),
  evento({
    id: 'e-03',
    atleticaSlug: 'corujas',
    slug: 'copa-valorant',
    titulo: 'Copa Valorant das Corujas',
    descricao:
      'Chave de eliminação simples, MD3 até a final, MD5 na decisão. Regulamento no anexo. Inscrição por equipe.',
    tipo: 'ESPORTS',
    modalidade: 'Valorant',
    inicioEm: dias(4, 19),
    fimEm: dias(6, 23),
    localNome: 'Laboratório 3, Instituto de Computação',
    capacidade: 8,
    inscricaoPorEquipe: true,
    inscricaoFechaEm: dias(1),
    inscritosConfirmados: 8,
  }),
  evento({
    id: 'e-04',
    atleticaSlug: 'dragoes',
    slug: 'treino-aberto-volei',
    titulo: 'Treino aberto de vôlei',
    tipo: 'ESPORTIVO',
    modalidade: 'Vôlei misto',
    inicioEm: dias(2, 19),
    fimEm: dias(2, 21),
    localNome: 'Quadra 2, UniVale',
    capacidade: 24,
    inscritosConfirmados: 19,
  }),
  evento({
    id: 'e-05',
    atleticaSlug: 'dragoes',
    slug: 'reuniao-de-diretoria',
    titulo: 'Reunião de diretoria: prestação de contas',
    tipo: 'INTERNO',
    visibilidade: 'INTERNO',
    inicioEm: dias(1, 19, 30),
    localNome: 'Sala da Atlética',
    inscritosConfirmados: 7,
  }),
  evento({
    id: 'e-06',
    atleticaSlug: 'dragoes',
    slug: 'festa-junina-2026',
    titulo: 'Arraiá dos Dragões',
    tipo: 'SOCIAL',
    status: 'RASCUNHO',
    publicadoEm: null,
    inicioEm: dias(48, 20),
    localNome: 'A definir',
  }),
  evento({
    id: 'e-07',
    atleticaSlug: 'leoes',
    slug: 'torneio-de-futsal',
    titulo: 'Torneio de Futsal: Taça Leões',
    tipo: 'ESPORTIVO',
    modalidade: 'Futsal',
    visibilidade: 'REDE',
    inicioEm: dias(16, 14),
    fimEm: dias(16, 22),
    localNome: 'Ginásio da Faculdade de Direito',
    capacidade: 120,
    inscritosConfirmados: 96,
    organizadoras: ['leoes', 'dragoes'],
  }),
  evento({
    id: 'e-08',
    atleticaSlug: 'furacao',
    slug: 'corrida-da-medicina',
    titulo: 'Corrida da Medicina, 5 km',
    tipo: 'ESPORTIVO',
    modalidade: 'Atletismo',
    inicioEm: dias(30, 7),
    localNome: 'Parque da Serra',
    capacidade: 250,
    inscritosConfirmados: 141,
  }),
  evento({
    id: 'e-09',
    atleticaSlug: 'panteras',
    slug: 'noite-de-jogos',
    titulo: 'Noite de Jogos de Tabuleiro',
    tipo: 'SOCIAL',
    visibilidade: 'REDE',
    inicioEm: dias(11, 19),
    localNome: 'Centro de Convivência Aurora',
    capacidade: 80,
    inscritosConfirmados: 52,
  }),
  evento({
    id: 'e-10',
    atleticaSlug: 'dragoes',
    slug: 'interatletica-2025',
    titulo: 'Interatlética 2025',
    tipo: 'ESPORTIVO',
    status: 'ENCERRADO',
    inicioEm: dias(-280, 8),
    fimEm: dias(-278, 22),
    localNome: 'Ginásio Central, UniVale',
    inscritosConfirmados: 372,
  }),
  evento({
    id: 'e-11',
    atleticaSlug: 'javalis',
    slug: 'trilha-do-javali',
    titulo: 'Trilha do Javali',
    tipo: 'ESPORTIVO',
    modalidade: 'Trekking',
    inicioEm: dias(38, 6),
    localNome: 'Serra do Mirante',
    capacidade: 60,
    inscritosConfirmados: 34,
  }),
]

export function eventosDaAtletica(slug: string): EventoResumo[] {
  return EVENTOS.filter((e) => e.atleticaSlug === slug).map(resumirEvento)
}

export function resumirEvento(e: EventoDemo): EventoResumo {
  return {
    id: e.id,
    slug: e.slug,
    titulo: e.titulo,
    tipo: e.tipo,
    modalidade: e.modalidade,
    status: e.status,
    visibilidade: e.visibilidade,
    inicioEm: e.inicioEm,
    localNome: e.localNome,
    capaUrl: e.capaUrl,
  }
}

// ---------------------------------------------------------------------
// Participantes
// ---------------------------------------------------------------------

const SOBRENOMES = ['Alencar', 'Bandeira', 'Toledo', 'Marinho', 'Nogueira',
  'Rezende', 'Prado', 'Peixoto', 'Vasques', 'Sarmento', 'Cunha', 'Vilanova',
  'Aragão', 'Bastos', 'Queiroz', 'Fontes', 'Meireles', 'Tavares']
const PRENOMES = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Elisa', 'Felipe',
  'Gabriela', 'Henrique', 'Iara', 'João', 'Karen', 'Lucas', 'Mariana',
  'Nícolas', 'Olívia', 'Paulo', 'Renata', 'Sérgio']

/**
 * Tira o acento em vez de trocá-lo por outro caractere: "Nícolas" precisa
 * virar "nicolas", e não "n.colas". Metade dos nomes brasileiros tem acento,
 * então errar isso deixa a lista de presença inteira com cara de defeito.
 */
function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Gerador determinístico: a lista precisa ser a mesma a cada carregamento. */
export function participantesDoEvento(eventoId: string, quantidade: number): Participante[] {
  const alvo = EVENTOS.find((e) => e.id === eventoId)
  const capacidade = alvo?.capacidade ?? null
  const semente = eventoId.charCodeAt(2) * 7

  return Array.from({ length: quantidade }, (_, i) => {
    const n = semente + i
    const nome = `${PRENOMES[n % PRENOMES.length]} ${SOBRENOMES[(n * 3) % SOBRENOMES.length]}`
    const origem = ATLETICAS[n % ATLETICAS.length]
    const excedente = capacidade !== null && i >= capacidade

    return {
      inscricaoId: `i-${eventoId}-${i}`,
      usuarioId: `u-demo-${i}`,
      nome,
      email: `${semAcento(nome).toLowerCase().replace(/\s+/g, '.')}@exemplo.br`,
      telefone: `(1${n % 9}) 9${(10000 + n * 137) % 90000}-${(1000 + n * 31) % 9000}`,
      atleticaDeOrigem: n % 7 === 0 ? null : origem.slug,
      status: excedente ? 'LISTA_ESPERA' : 'CONFIRMADA',
      posicaoEspera: excedente && capacidade !== null ? i - capacidade + 1 : null,
      observacao: n % 11 === 0 ? 'Alergia a amendoim' : null,
      inscritoEm: dias(-14 + (i % 12)),
      checkinEm: !excedente && n % 3 === 0 ? dias(-1, 22, (n * 7) % 60) : null,
    }
  })
}

// ---------------------------------------------------------------------
// Equipes
// ---------------------------------------------------------------------

export const EQUIPES: Equipe[] = [
  {
    id: 'eq-01',
    atleticaSlug: 'dragoes',
    nome: 'Dragões Vôlei Feminino',
    tag: 'DRG',
    modalidade: 'Vôlei feminino',
    escudoUrl: null,
    ativa: true,
    elenco: [
      { usuarioId: 'u-03', nome: 'Camila Toledo', avatarUrl: null, funcao: 'CAPITAO', numero: 7, nick: null },
      // A presidente também joga. É o caso comum numa atlética, e é o que
      // faz "Meu histórico" mostrar algo além de cargos.
      { usuarioId: 'u-01', nome: 'Marina Alencar', avatarUrl: null, funcao: 'TITULAR', numero: 5, nick: null },
      { usuarioId: 'u-07', nome: 'Larissa Prado', avatarUrl: null, funcao: 'TITULAR', numero: 10, nick: null },
      { usuarioId: 'u-09', nome: 'Helena Vasques', avatarUrl: null, funcao: 'TITULAR', numero: 4, nick: null },
      { usuarioId: 'u-11', nome: 'Isabela Cunha', avatarUrl: null, funcao: 'RESERVA', numero: 12, nick: null },
      { usuarioId: 'u-05', nome: 'Beatriz Nogueira', avatarUrl: null, funcao: 'TECNICO', numero: null, nick: null },
    ],
  },
  {
    id: 'eq-02',
    atleticaSlug: 'dragoes',
    nome: 'Dragões Futsal',
    tag: 'DRG',
    modalidade: 'Futsal masculino',
    escudoUrl: null,
    ativa: true,
    elenco: [
      { usuarioId: 'u-02', nome: 'Rafael Bandeira', avatarUrl: null, funcao: 'CAPITAO', numero: 9, nick: null },
      { usuarioId: 'u-04', nome: 'Diego Marinho', avatarUrl: null, funcao: 'TITULAR', numero: 3, nick: null },
      { usuarioId: 'u-12', nome: 'Pedro Vilanova', avatarUrl: null, funcao: 'TITULAR', numero: 1, nick: null },
      { usuarioId: 'u-06', nome: 'Thiago Rezende', avatarUrl: null, funcao: 'RESERVA', numero: 15, nick: null },
    ],
  },
  {
    id: 'eq-03',
    atleticaSlug: 'corujas',
    nome: 'Corujas Valorant',
    tag: 'COR',
    modalidade: 'Valorant',
    escudoUrl: null,
    ativa: true,
    elenco: [
      { usuarioId: 'u-03', nome: 'Camila Toledo', avatarUrl: null, funcao: 'CAPITAO', numero: null, nick: 'kmy#BR1' },
      { usuarioId: 'u-04', nome: 'Diego Marinho', avatarUrl: null, funcao: 'TITULAR', numero: null, nick: 'dgm#LAS' },
      { usuarioId: 'u-06', nome: 'Thiago Rezende', avatarUrl: null, funcao: 'TITULAR', numero: null, nick: 'tzr#001' },
      { usuarioId: 'u-07', nome: 'Larissa Prado', avatarUrl: null, funcao: 'TITULAR', numero: null, nick: 'lari#pro' },
      { usuarioId: 'u-08', nome: 'Gustavo Peixoto', avatarUrl: null, funcao: 'RESERVA', numero: null, nick: 'gp#sub' },
    ],
  },
]

// ---------------------------------------------------------------------
// Torneio com chaveamento de verdade
// ---------------------------------------------------------------------

const TIMES_DO_TORNEIO = [
  { id: 'tp-1', nome: 'Corujas A', slug: 'corujas', seed: 1 },
  { id: 'tp-2', nome: 'Dragões E-sports', slug: 'dragoes', seed: 2 },
  { id: 'tp-3', nome: 'Furacão Gaming', slug: 'furacao', seed: 3 },
  { id: 'tp-4', nome: 'Panteras Squad', slug: 'panteras', seed: 4 },
  { id: 'tp-5', nome: 'Leões Tactical', slug: 'leoes', seed: 5 },
  { id: 'tp-6', nome: 'Javalis Five', slug: 'javalis', seed: 6 },
  { id: 'tp-7', nome: 'Corujas B', slug: 'corujas', seed: 7 },
  { id: 'tp-8', nome: 'Dragões B', slug: 'dragoes', seed: 8 },
]

function partida(
  id: string, rodada: number, ordem: number, rotulo: string,
  a: string | null, b: string | null,
  placarA: number | null, placarB: number | null,
  vencedor: string | null, status: Partida['status'],
  proxima: string | null, slot: 'A' | 'B' | null,
  quandoDias: number, melhorDe = 3,
): Partida {
  return {
    id, rodada, ordem, rotulo, chave: 'PRINCIPAL',
    participanteAId: a, participanteBId: b,
    placarA, placarB, vencedorId: vencedor, melhorDe, status,
    inicioEm: dias(quandoDias, 19, ordem * 30),
    localNome: 'Laboratório 3',
    proximaPartidaId: proxima, slotProximo: slot,
    parciais: placarA !== null && placarB !== null
      ? Array.from({ length: placarA + placarB }, (_, i) => ({
          numero: i + 1,
          rotulo: ['Ascent', 'Bind', 'Haven', 'Split', 'Lotus'][i % 5],
          placarA: i % 2 === 0 ? 13 : 9,
          placarB: i % 2 === 0 ? 9 : 13,
        }))
      : [],
  }
}

export const TORNEIOS: Torneio[] = [
  {
    id: 't-01',
    eventoId: 'e-03',
    atleticaSlug: 'corujas',
    nome: 'Copa Valorant das Corujas',
    modalidade: 'Valorant',
    formato: 'ELIMINACAO_SIMPLES',
    vagas: 8,
    status: 'EM_ANDAMENTO',
    regulamentoUrl: null,
    participantes: TIMES_DO_TORNEIO.map((t) => ({
      id: t.id,
      nomeExibicao: t.nome,
      atleticaSlug: t.slug,
      seed: t.seed,
      situacao: ['tp-5', 'tp-6', 'tp-7', 'tp-8'].includes(t.id) ? 'ELIMINADO' : 'ATIVO',
    })),
    partidas: [
      // Quartas — todas encerradas.
      partida('p-q1', 1, 1, 'Quartas 1', 'tp-1', 'tp-8', 2, 0, 'tp-1', 'ENCERRADA', 'p-s1', 'A', -1),
      partida('p-q2', 1, 2, 'Quartas 2', 'tp-4', 'tp-5', 2, 1, 'tp-4', 'ENCERRADA', 'p-s1', 'B', -1),
      partida('p-q3', 1, 3, 'Quartas 3', 'tp-2', 'tp-7', 2, 0, 'tp-2', 'ENCERRADA', 'p-s2', 'A', -1),
      partida('p-q4', 1, 4, 'Quartas 4', 'tp-3', 'tp-6', 2, 1, 'tp-3', 'ENCERRADA', 'p-s2', 'B', -1),
      // Semis — uma em andamento, uma agendada.
      partida('p-s1', 2, 1, 'Semifinal 1', 'tp-1', 'tp-4', 1, 1, null, 'EM_ANDAMENTO', 'p-f', 'A', 0),
      partida('p-s2', 2, 2, 'Semifinal 2', 'tp-2', 'tp-3', null, null, null, 'AGENDADA', 'p-f', 'B', 1),
      // Final — à espera dos vencedores.
      partida('p-f', 3, 1, 'Final', null, null, null, null, null, 'AGENDADA', null, null, 2, 5),
    ],
  },
]

// ---------------------------------------------------------------------
// Gestão
// ---------------------------------------------------------------------

export const TAREFAS: Tarefa[] = [
  {
    id: 'tf-01', atleticaSlug: 'dragoes', eventoId: 'e-01',
    eventoTitulo: 'Interatlética 2026',
    titulo: 'Fechar contrato do ginásio',
    descricao: 'Confirmar disponibilidade das quadras nos três dias e assinar o termo de uso.',
    responsavelId: 'u-02', responsavelNome: 'Rafael Bandeira', responsavelAvatarUrl: null,
    prazo: dias(3), prioridade: 'ALTA', status: 'EM_ANDAMENTO', concluidaEm: null,
  },
  {
    id: 'tf-02', atleticaSlug: 'dragoes', eventoId: 'e-01',
    eventoTitulo: 'Interatlética 2026',
    titulo: 'Escalar equipe de portaria',
    descricao: 'Seis pessoas por turno, três turnos. Treinar no leitor de QR antes.',
    responsavelId: 'u-03', responsavelNome: 'Camila Toledo', responsavelAvatarUrl: null,
    prazo: dias(12), prioridade: 'ALTA', status: 'ABERTA', concluidaEm: null,
  },
  {
    id: 'tf-03', atleticaSlug: 'dragoes', eventoId: 'e-01',
    eventoTitulo: 'Interatlética 2026',
    titulo: 'Publicar regulamento das modalidades',
    descricao: null,
    responsavelId: 'u-04', responsavelNome: 'Diego Marinho', responsavelAvatarUrl: null,
    // Atrasada de propósito: é o caso que faz o selo da navegação, o alerta
    // do painel e a notificação existirem. Um demo sem nenhuma pendência
    // vencida esconde metade do que a tela sabe fazer.
    prazo: dias(-2), prioridade: 'MEDIA', status: 'ABERTA', concluidaEm: null,
  },
  {
    id: 'tf-04', atleticaSlug: 'dragoes', eventoId: 'e-02',
    eventoTitulo: 'Calourada da Engenharia',
    titulo: 'Contratar segurança',
    descricao: 'Mínimo de quatro seguranças para 300 pessoas.',
    responsavelId: 'u-01', responsavelNome: 'Marina Alencar', responsavelAvatarUrl: null,
    prazo: dias(4), prioridade: 'ALTA', status: 'CONCLUIDA', concluidaEm: dias(-2),
  },
  {
    id: 'tf-05', atleticaSlug: 'dragoes', eventoId: null, eventoTitulo: null,
    titulo: 'Atualizar o brasão no perfil da atlética',
    descricao: 'Subir a versão nova em PNG com fundo transparente.',
    responsavelId: null, responsavelNome: null, responsavelAvatarUrl: null,
    prazo: null, prioridade: 'BAIXA', status: 'ABERTA', concluidaEm: null,
  },
  {
    id: 'tf-06', atleticaSlug: 'dragoes', eventoId: 'e-02',
    eventoTitulo: 'Calourada da Engenharia',
    titulo: 'Fechar lista de espera e avisar promovidos',
    descricao: 'A promoção é automática, mas alguém precisa mandar mensagem.',
    responsavelId: 'u-07', responsavelNome: 'Larissa Prado', responsavelAvatarUrl: null,
    prazo: dias(6), prioridade: 'MEDIA', status: 'EM_ANDAMENTO', concluidaEm: null,
  },
]

export const AVISOS: Aviso[] = [
  {
    id: 'av-01', atleticaSlug: 'dragoes', eventoId: 'e-01',
    titulo: 'Concentração da Interatlética muda para 8h',
    corpo: 'A abertura foi antecipada em uma hora por causa da previsão de chuva à tarde. Quem for de ônibus, o fretado sai às 7h do campus.',
    publicoAlvo: 'INSCRITOS', fixado: true, publicadoEm: dias(-1),
    autorNome: 'Marina Alencar', autorAvatarUrl: null,
  },
  {
    id: 'av-02', atleticaSlug: 'dragoes', eventoId: null,
    titulo: 'Eleição da nova diretoria: inscrições abertas',
    corpo: 'Chapas podem se inscrever até o dia 20. Requisito: vínculo ativo há pelo menos seis meses.',
    publicoAlvo: 'MEMBROS', fixado: true, publicadoEm: dias(-5),
    autorNome: 'Marina Alencar', autorAvatarUrl: null,
  },
  {
    id: 'av-03', atleticaSlug: 'dragoes', eventoId: 'e-02',
    titulo: 'Calourada esgotada: lista de espera aberta',
    corpo: 'As 300 vagas acabaram em quatro horas. Quem entrar na espera é promovido automaticamente se alguém cancelar.',
    publicoAlvo: 'PUBLICO', fixado: false, publicadoEm: dias(-8),
    autorNome: 'Larissa Prado', autorAvatarUrl: null,
  },
]

// ---------------------------------------------------------------------
// Quadro de medalhas
// ---------------------------------------------------------------------

export const QUADRO_DE_MEDALHAS: LinhaDoQuadroDeMedalhas[] = [
  { posicao: 1, atletica: ATLETICAS[0], ouro: 7, prata: 4, bronze: 3, pontos: 38, variacao: 1 },
  { posicao: 2, atletica: ATLETICAS[2], ouro: 6, prata: 5, bronze: 2, pontos: 34, variacao: -1 },
  { posicao: 3, atletica: ATLETICAS[3], ouro: 5, prata: 3, bronze: 6, pontos: 30, variacao: 2 },
  { posicao: 4, atletica: ATLETICAS[1], ouro: 4, prata: 6, bronze: 4, pontos: 28, variacao: 0 },
  { posicao: 5, atletica: ATLETICAS[4], ouro: 2, prata: 3, bronze: 5, pontos: 17, variacao: -2 },
  { posicao: 6, atletica: ATLETICAS[5], ouro: 1, prata: 2, bronze: 4, pontos: 11, variacao: 0 },
]
