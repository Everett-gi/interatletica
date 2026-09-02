/** Notícias, campanhas e mídia — o que a atlética diz para fora. */

export type StatusDaPublicacao = 'IDEIA' | 'PRODUCAO' | 'AGENDADO' | 'PUBLICADO'

export interface Noticia {
  id: string
  atleticaSlug: string
  titulo: string
  chamada: string
  corpo: string
  capaUrl: string | null
  autorNome: string
  publicadaEm: string | null
  status: StatusDaPublicacao
  destaque: boolean
  etiquetas: string[]
}

export type CanalDeConteudo = 'INSTAGRAM' | 'STORIES' | 'TIKTOK' | 'YOUTUBE' | 'PRESENCIAL'

export interface ConteudoDaCampanha {
  id: string
  titulo: string
  canal: CanalDeConteudo
  publicarEm: string
  status: StatusDaPublicacao
  responsavelNome: string | null
}

export interface Campanha {
  id: string
  atleticaSlug: string
  nome: string
  objetivo: string
  metaValor: number
  metaUnidade: string
  atual: number
  inicioEm: string
  fimEm: string
  responsavelNome: string | null
  patrocinioId: string | null
  conteudos: ConteudoDaCampanha[]
}

export type PastaDeMidia =
  | 'LOGO'
  | 'UNIFORMES'
  | 'EVENTOS'
  | 'CAMPEONATOS'
  | 'CAMPANHAS'
  | 'PATROCINADORES'
  | 'HISTORICO'

export interface Midia {
  id: string
  atleticaSlug: string
  nome: string
  pasta: PastaDeMidia
  tipo: 'IMAGEM' | 'VIDEO' | 'VETOR'
  /** Cor de fundo da miniatura enquanto não há arquivo real no demo. */
  cor: string
  adicionadaEm: string
  autorNome: string
  tamanhoEmKb: number
}
