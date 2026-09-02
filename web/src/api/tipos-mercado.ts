/**
 * Fornecedores, parcerias e compras coletivas.
 *
 * <p>O valor daqui não é o catálogo: é a <strong>avaliação</strong>. Saber
 * que a gráfica X atendeu doze atléticas e atrasou em duas é a informação
 * que nenhuma atlética consegue sozinha, e é ela que evita repetir o erro
 * que outra já pagou.</p>
 */

import type { AtleticaResumo } from './tipos'

export type CategoriaDeFornecedor =
  | 'UNIFORMES'
  | 'MEDALHAS'
  | 'TROFEUS'
  | 'IMPRESSAO'
  | 'TRANSPORTE'
  | 'ARBITRAGEM'
  | 'FOTOGRAFIA'
  | 'VIDEO'
  | 'ALIMENTACAO'
  | 'EVENTOS'
  | 'SEGURANCA'

/** Os cinco critérios de §41. Cada um de 0 a 5. */
export interface NotasDoFornecedor {
  qualidade: number
  preco: number
  prazo: number
  atendimento: number
  confiabilidade: number
}

export interface AvaliacaoDeFornecedor {
  id: string
  atletica: AtleticaResumo
  autorNome: string
  quando: string
  notas: NotasDoFornecedor
  comentario: string
  /** O que foi comprado. Uma nota sem contexto não ajuda ninguém. */
  contexto: string | null
}

export interface Fornecedor {
  id: string
  nome: string
  categoria: CategoriaDeFornecedor
  cidade: string | null
  uf: string | null
  contato: string | null
  site: string | null
  descricao: string
  /** Média simples dos cinco critérios de todas as avaliações. */
  nota: number
  avaliacoes: number
  atleticasAtendidas: number
  faixaDePreco: 'BAIXA' | 'MEDIA' | 'ALTA' | null
  atendeRemoto: boolean
  ultimaCompra: string | null
  detalheDasNotas: NotasDoFornecedor
}

// ---------------------------------------------------------------------
// Compras coletivas
// ---------------------------------------------------------------------

export type EtapaDaCompra =
  | 'ABERTA'
  | 'FECHANDO'
  | 'FECHADA'
  | 'EM_EXECUCAO'
  | 'CONCLUIDA'
  | 'CANCELADA'

export interface InteresseNaCompra {
  atletica: AtleticaResumo
  quantidade: number
  confirmado: boolean
}

export interface CompraColetiva {
  id: string
  titulo: string
  produto: string
  descricao: string
  organizadora: AtleticaResumo
  etapa: EtapaDaCompra
  quantidadeMinima: number
  quantidadeAtual: number
  prazo: string
  precoEstimado: number | null
  /** Desconto obtido pelo volume, quando a compra já fechou. */
  economiaPercentual: number | null
  fornecedorId: string | null
  fornecedorNome: string | null
  interessados: InteresseNaCompra[]
  participo: boolean
}

// ---------------------------------------------------------------------
// Parcerias e oportunidades
// ---------------------------------------------------------------------

export type TipoDeParceria = 'EMPRESA' | 'ATLETICA' | 'INSTITUICAO'

export type EtapaDaParceria =
  | 'DISPONIVEL'
  | 'INTERESSE'
  | 'NEGOCIACAO'
  | 'ATIVA'
  | 'ENCERRADA'

export interface Parceria {
  id: string
  titulo: string
  tipo: TipoDeParceria
  parceiroNome: string
  parceiroLogoUrl: string | null
  proponente: AtleticaResumo | null
  descricao: string
  beneficio: string
  etapa: EtapaDaParceria
  interessadas: AtleticaResumo[]
  validade: string | null
  cidade: string | null
  uf: string | null
  tenhoInteresse: boolean
}

export type TipoDeOportunidade =
  | 'PATROCINIO'
  | 'PARCERIA'
  | 'FORNECEDOR'
  | 'EVENTO'
  | 'COMPETICAO'
  | 'VAGA'
  | 'PROJETO'

export interface Oportunidade {
  id: string
  tipo: TipoDeOportunidade
  titulo: string
  resumo: string
  origem: string
  prazo: string | null
  destino: string | null
  etiquetas: string[]
}

// ---------------------------------------------------------------------
// Amistosos
// ---------------------------------------------------------------------

export type NivelDoAmistoso = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO'

export interface Amistoso {
  id: string
  atletica: AtleticaResumo
  modalidade: string
  categoria: string
  data: string
  cidade: string
  uf: string
  nivel: NivelDoAmistoso
  observacao: string | null
  interessadas: AtleticaResumo[]
  fechadoCom: AtleticaResumo | null
  tenhoInteresse: boolean
}

// ---------------------------------------------------------------------
// Loja — vitrine, não caixa
// ---------------------------------------------------------------------

/**
 * A loja mostra o que a atlética oferece e quanto custa. A negociação
 * acontece fora: a plataforma não processa pagamento, não emite cobrança e
 * não guarda dado de cartão. Isso é decisão de produto, não limitação
 * técnica — receber dinheiro de estudante exige responsabilidade fiscal que
 * uma atlética não tem como assumir por meio de um app de terceiros.
 */
export interface VarianteDeProduto {
  rotulo: string
  estoque: number
}

export interface Produto {
  id: string
  atleticaSlug: string
  nome: string
  descricao: string
  categoria: string
  preco: number
  imagemUrl: string | null
  disponivel: boolean
  variantes: VarianteDeProduto[]
  /** Como combinar: link do Instagram, WhatsApp da diretoria, ponto físico. */
  comoAdquirir: string
}
