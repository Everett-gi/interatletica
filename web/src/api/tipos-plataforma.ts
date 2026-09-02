/**
 * O que atravessa todos os módulos: notificação, busca, conquista,
 * comparação e a administração da rede.
 */

import type { AtleticaResumo } from './tipos'

// ---------------------------------------------------------------------
// Notificações (§59)
// ---------------------------------------------------------------------

export type CategoriaDeNotificacao =
  | 'GESTAO'
  | 'EVENTOS'
  | 'REDE'
  | 'MENSAGENS'
  | 'FINANCEIRO'
  | 'ESPORTES'

export interface Notificacao {
  id: string
  categoria: CategoriaDeNotificacao
  titulo: string
  detalhe: string
  quando: string
  lida: boolean
  destino: string | null
  /** Prazo estourado, convite expirando: muda o tom do item, não a cor toda. */
  urgente: boolean
  atleticaSlug: string | null
}

// ---------------------------------------------------------------------
// Busca global (§60 e §98)
// ---------------------------------------------------------------------

export type TipoDeResultado =
  | 'ATLETICA'
  | 'PESSOA'
  | 'EVENTO'
  | 'CAMPEONATO'
  | 'PROJETO'
  | 'DOCUMENTO'
  | 'FORNECEDOR'
  | 'PERGUNTA'
  | 'GUIA'
  | 'POST'
  | 'EQUIPE'
  | 'PAGINA'

export interface ResultadoDeBusca {
  id: string
  tipo: TipoDeResultado
  titulo: string
  detalhe: string
  destino: string
  /** Quando o resultado pertence ao contexto atual, ele sobe na lista. */
  noContexto: boolean
}

// ---------------------------------------------------------------------
// Conquistas e comparação (§89–§92)
// ---------------------------------------------------------------------

export interface Conquista {
  id: string
  titulo: string
  descricao: string
  icone: string
  conquistadaEm: string | null
}

export interface Indicador {
  rotulo: string
  valor: number
  unidade: string | null
  /** Variação percentual contra o mesmo período anterior. */
  variacao: number | null
  /** Média de atléticas de porte parecido. Nulo quando não há amostra. */
  media: number | null
}

export type TipoDeRanking =
  | 'ESPORTIVO'
  | 'PARTICIPACAO'
  | 'COLABORACAO'
  | 'SOCIAL'
  | 'ORGANIZACAO'

export interface LinhaDeRanking {
  posicao: number
  atletica: AtleticaResumo
  valor: number
  rotuloDoValor: string
  variacao: number
}

// ---------------------------------------------------------------------
// Administração da rede (§95 e §96)
// ---------------------------------------------------------------------

export type SituacaoDeDenuncia = 'ABERTA' | 'EM_ANALISE' | 'PROCEDENTE' | 'IMPROCEDENTE'

export interface Denuncia {
  id: string
  conteudo: string
  motivo: string
  autorAtletica: string
  quando: string
  situacao: SituacaoDeDenuncia
}

export type SeloDeVerificacao = 'NAO_VERIFICADA' | 'VERIFICADA' | 'INSTITUCIONAL'

export interface PainelDaRede {
  atleticas: number
  usuarios: number
  eventos: number
  crescimento: number
  novasAtleticas: number
  atleticasPorMes: { rotulo: string; valor: number }[]
  eventosPorMes: { rotulo: string; valor: number }[]
  denunciasAbertas: number
  aguardandoVerificacao: { atletica: AtleticaResumo; pedidoEm: string }[]
  denuncias: Denuncia[]
}

// ---------------------------------------------------------------------
// Onboarding (§80 e §81)
// ---------------------------------------------------------------------

export interface PassoDeOnboarding {
  id: string
  titulo: string
  descricao: string
  concluido: boolean
  destino: string | null
  acao: string
}
