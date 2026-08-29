/**
 * Espelho dos DTOs da API.
 *
 * <p>Escrito à mão em vez de gerado: o projeto tem uma API só, consumida por
 * um cliente só, e um gerador acrescentaria uma etapa de build para
 * economizar um arquivo. A regra que mantém isso honesto é que os nomes aqui
 * são os mesmos dos records em Java — quando divergirem, é bug, não estilo.</p>
 */

export type Papel = 'PRESIDENTE' | 'DIRETOR' | 'MEMBRO'
export type SituacaoAtletica = 'ATIVA' | 'SUSPENSA' | 'ARQUIVADA'
export type SituacaoMembro = 'ATIVO' | 'INATIVO' | 'PENDENTE'

export type TipoDeEvento = 'ESPORTIVO' | 'ESPORTS' | 'SOCIAL' | 'INTERNO'
export type StatusDoEvento = 'RASCUNHO' | 'PUBLICADO' | 'ENCERRADO' | 'CANCELADO'
export type Visibilidade = 'PUBLICO' | 'REDE' | 'INTERNO'
export type StatusDaInscricao =
  | 'CONFIRMADA'
  | 'LISTA_ESPERA'
  | 'CANCELADA'
  | 'PENDENTE'

export interface AtleticaResumo {
  slug: string
  nome: string
  sigla: string | null
  instituicao: string
  cidade: string | null
  uf: string | null
  brasaoUrl: string | null
  corPrimaria: string | null
}

export interface Atletica {
  id: string
  slug: string
  nome: string
  sigla: string | null
  instituicao: string
  cidade: string | null
  uf: string | null
  brasaoUrl: string | null
  corPrimaria: string | null
  corSecundaria: string | null
  instagram: string | null
  situacao: SituacaoAtletica
  criadoEm: string
}

export interface MinhaAtletica {
  atletica: AtleticaResumo
  papel: Papel
  cargo: string | null
}

/** Resposta de `GET /api/eu`. Ausente (204) significa visitante deslogado. */
export interface PerfilDaSessao {
  id: string
  nome: string
  email: string
  avatarUrl: string | null
  operador: boolean
  atleticas: MinhaAtletica[]
  convitesPendentes: number
}

export interface Membro {
  id: string
  usuarioId: string
  nome: string
  email: string
  avatarUrl: string | null
  papel: Papel
  cargo: string | null
  situacao: SituacaoMembro
  entrouEm: string
  saiuEm: string | null
}

export interface Convite {
  id: string
  email: string
  papel: Papel
  link: string
  expiraEm: string
  criadoEm: string
}

export interface ConvitePendente {
  atleticaNome: string
  atleticaSlug: string
  atleticaBrasaoUrl: string | null
  papel: Papel
  expiraEm: string
}

export interface ResultadoDoAceite {
  atleticaSlug: string
  atleticaNome: string
  papel: Papel
}

/** Corpo de criação e edição de evento. Datas em ISO-8601 com offset. */
export interface DadosDoEvento {
  titulo: string
  descricao: string | null
  tipo: TipoDeEvento
  modalidade: string | null
  visibilidade: Visibilidade
  inicioEm: string
  fimEm: string | null
  localNome: string | null
  localEndereco: string | null
  localMapaUrl: string | null
  capacidade: number | null
  inscricaoAbreEm: string | null
  inscricaoFechaEm: string | null
  inscricaoPorEquipe: boolean
  capaUrl: string | null
}

export interface EventoResumo {
  id: string
  slug: string
  titulo: string
  tipo: TipoDeEvento
  modalidade: string | null
  status: StatusDoEvento
  visibilidade: Visibilidade
  inicioEm: string
  localNome: string | null
  capaUrl: string | null
}

export interface Evento extends DadosDoEvento {
  id: string
  slug: string
  status: StatusDoEvento
  publicadoEm: string | null
  inscritosConfirmados: number
  naListaDeEspera: number
}

export interface EventoPublico {
  /** Exposto para que a página pública consiga montar a inscrição. */
  id: string
  atleticaSlug: string
  atleticaNome: string
  atleticaBrasaoUrl: string | null
  slug: string
  titulo: string
  descricao: string | null
  tipo: TipoDeEvento
  modalidade: string | null
  status: StatusDoEvento
  inicioEm: string
  fimEm: string | null
  localNome: string | null
  localEndereco: string | null
  localMapaUrl: string | null
  capaUrl: string | null
  capacidade: number | null
  vagasRestantes: number | null
  inscritosConfirmados: number
  inscricaoAberta: boolean
  /** Por que o botão não aparece. Nulo quando a inscrição está aberta. */
  motivoDoFechamento: string | null
  inscricaoAbreEm: string | null
  inscricaoFechaEm: string | null
}

export interface Inscricao {
  id: string
  status: StatusDaInscricao
  posicaoEspera: number | null
  /** Conteúdo do QR de entrada. */
  checkinToken: string
  checkinEm: string | null
  criadoEm: string
  eventoTitulo: string
  eventoInicioEm: string
}

export interface Participante {
  inscricaoId: string
  usuarioId: string | null
  nome: string | null
  email: string | null
  telefone: string | null
  atleticaDeOrigem: string | null
  status: StatusDaInscricao
  posicaoEspera: number | null
  observacao: string | null
  inscritoEm: string
  checkinEm: string | null
}

export interface OrigemDosInscritos {
  atleticaId: string | null
  nome: string
  total: number
}

export interface ResultadoDoCheckin {
  liberado: boolean
  mensagem: string
  nome: string | null
  status: StatusDaInscricao | null
  checkinEm: string | null
}
