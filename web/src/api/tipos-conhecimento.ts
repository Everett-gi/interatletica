/**
 * O núcleo estratégico do produto: o que uma atlética aprendeu e as outras
 * podem aproveitar.
 *
 * <p>Uma atlética não precisa descobrir sozinha o que outra já aprendeu.
 * Guia, modelo, experiência e pergunta são quatro formas do mesmo
 * movimento — alguém já passou por isto e escreveu o que deu certo.</p>
 */

import type { AtleticaResumo } from './tipos'

export type AreaDeConhecimento =
  | 'GESTAO'
  | 'EVENTOS'
  | 'ESPORTES'
  | 'FINANCEIRO'
  | 'MARKETING'
  | 'PATROCINIO'
  | 'PESSOAS'
  | 'DOCUMENTACAO'
  | 'JURIDICO'
  | 'TECNOLOGIA'

export interface Guia {
  id: string
  titulo: string
  resumo: string
  area: AreaDeConhecimento
  minutosDeLeitura: number
  atualizadoEm: string
  autorAtletica: AtleticaResumo | null
  autorNome: string
  /** Seções em markdown simples: título e corpo. Sem editor rico. */
  secoes: { titulo: string; corpo: string }[]
  salvamentos: number
  util: number
}

export type FormatoDeModelo = 'DOCX' | 'XLSX' | 'PDF' | 'TEXTO' | 'CHECKLIST'

export interface Modelo {
  id: string
  nome: string
  descricao: string
  area: AreaDeConhecimento
  formato: FormatoDeModelo
  usos: number
  autorAtletica: AtleticaResumo | null
  atualizadoEm: string
  /** Pré-visualização em texto: o que a pessoa vê antes de usar. */
  previa: string[]
}

export interface Experiencia {
  id: string
  titulo: string
  atletica: AtleticaResumo
  area: AreaDeConhecimento
  quando: string
  contexto: string
  funcionou: string[]
  naoFuncionou: string[]
  custo: number | null
  publico: number | null
  fariaDiferente: string[]
  util: number
  respostas: number
}

export type StatusDoPedido = 'ABERTO' | 'RESPONDIDO' | 'RESOLVIDO' | 'ARQUIVADO'

export interface RespostaDeAjuda {
  id: string
  autorNome: string
  autorAvatarUrl: string | null
  atletica: AtleticaResumo | null
  corpo: string
  quando: string
  util: number
  /** Marcada pelo autor da pergunta. Uma por pedido. */
  maisUtil: boolean
  anexos: string[]
}

export interface PedidoDeAjuda {
  id: string
  titulo: string
  corpo: string
  area: AreaDeConhecimento
  atletica: AtleticaResumo
  autorNome: string
  autorAvatarUrl: string | null
  abertoEm: string
  status: StatusDoPedido
  respostas: RespostaDeAjuda[]
  /** Virou experiência registrada? É o ciclo que fecha o fluxo 4 do plano. */
  experienciaId: string | null
}

// ---------------------------------------------------------------------
// Comunidades, mentoria e talentos
// ---------------------------------------------------------------------

export type TipoDeComunidade = 'REGIAO' | 'MODALIDADE' | 'FUNCAO' | 'INTERESSE'

export interface Comunidade {
  id: string
  nome: string
  descricao: string
  tipo: TipoDeComunidade
  membros: number
  atleticas: number
  participo: boolean
  ultimaAtividade: string
  /** Cor derivada do nome quando não há arte. */
  emblema: string | null
}

export interface PostDaComunidade {
  id: string
  comunidadeId: string
  autorNome: string
  autorAvatarUrl: string | null
  atletica: AtleticaResumo | null
  corpo: string
  quando: string
  respostas: number
  util: number
}

export interface OfertaDeMentoria {
  id: string
  atletica: AtleticaResumo
  area: AreaDeConhecimento
  titulo: string
  descricao: string
  responsavelNome: string
  atleticasAtendidas: number
  disponivel: boolean
}

export type HabilidadeDeTalento =
  | 'DESIGN'
  | 'FOTOGRAFIA'
  | 'VIDEO'
  | 'PROGRAMACAO'
  | 'MARKETING'
  | 'ORGANIZACAO'
  | 'ARBITRAGEM'
  | 'COMUNICACAO'
  | 'JURIDICO'

export interface Talento {
  usuarioId: string
  nome: string
  avatarUrl: string | null
  atletica: AtleticaResumo | null
  habilidades: HabilidadeDeTalento[]
  descricao: string
  portfolioUrl: string | null
  disponivel: boolean
  trabalhos: number
}

// ---------------------------------------------------------------------
// Feed da rede
// ---------------------------------------------------------------------

export type TipoDePostDaRede =
  | 'CONQUISTA'
  | 'EVENTO'
  | 'PERGUNTA'
  | 'PEDIDO'
  | 'EXPERIENCIA'
  | 'OPORTUNIDADE'
  | 'PARCERIA'

export interface PostDaRede {
  id: string
  tipo: TipoDePostDaRede
  atletica: AtleticaResumo
  autorNome: string
  autorAvatarUrl: string | null
  titulo: string
  corpo: string
  quando: string
  /** Para onde o card leva. Feed sem destino vira mural morto. */
  destino: string | null
  destinoRotulo: string | null
  util: number
  respostas: number
  etiquetas: string[]
}
