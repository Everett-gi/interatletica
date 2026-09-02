/**
 * Dinheiro da atlética.
 *
 * <p>A regra que atravessa o módulo: <strong>nada aqui cobra ninguém.</strong>
 * A plataforma registra o que entrou e o que saiu para que a prestação de
 * contas exista e a transição de gestão não comece com um buraco. Meio de
 * pagamento, cobrança e venda ficam fora de propósito.</p>
 */

export type NaturezaDoLancamento = 'RECEITA' | 'DESPESA'

export type CategoriaFinanceira =
  | 'EVENTO'
  | 'PATROCINIO'
  | 'MENSALIDADE'
  | 'UNIFORME'
  | 'VIAGEM'
  | 'ESTRUTURA'
  | 'MARKETING'
  | 'ARBITRAGEM'
  | 'ALIMENTACAO'
  | 'DOACAO'
  | 'OUTRO'

export type SituacaoDoLancamento = 'PREVISTO' | 'CONFIRMADO' | 'ATRASADO' | 'CANCELADO'

export interface Lancamento {
  id: string
  atleticaSlug: string
  natureza: NaturezaDoLancamento
  descricao: string
  categoria: CategoriaFinanceira
  /** Sempre positivo. A natureza é que diz o sinal. */
  valor: number
  competencia: string
  situacao: SituacaoDoLancamento
  eventoId: string | null
  eventoTitulo: string | null
  projetoId: string | null
  responsavelNome: string | null
  comprovanteNome: string | null
  observacao: string | null
}

export interface LinhaDeOrcamento {
  categoria: CategoriaFinanceira
  previsto: number
  realizado: number
}

export interface ResumoFinanceiro {
  saldoAtual: number
  receitasNoPeriodo: number
  despesasNoPeriodo: number
  aReceber: number
  aPagar: number
  /** Saldo mês a mês, para a linha do tempo do caixa. */
  evolucao: { rotulo: string; valor: number }[]
  porCategoria: { categoria: CategoriaFinanceira; receita: number; despesa: number }[]
  orcamento: LinhaDeOrcamento[]
  ultimosLancamentos: Lancamento[]
}

/** Um mês fechado e publicável. Pode ser aberto à rede ou ao público. */
export interface PrestacaoDeContas {
  id: string
  atleticaSlug: string
  competencia: string
  rotulo: string
  receitas: number
  despesas: number
  saldo: number
  publicada: boolean
  publicaParaMembros: boolean
  publicaParaTodos: boolean
  aprovadaEm: string | null
  documentos: string[]
  linhas: { descricao: string; natureza: NaturezaDoLancamento; valor: number }[]
}

// ---------------------------------------------------------------------
// Patrocínio — pipeline, e não lista
// ---------------------------------------------------------------------

export type EtapaDoPatrocinio =
  | 'PROSPECCAO'
  | 'CONTATO'
  | 'NEGOCIACAO'
  | 'APROVADO'
  | 'CONTRATO'
  | 'ATIVO'
  | 'ENCERRADO'

export interface Patrocinio {
  id: string
  atleticaSlug: string
  empresa: string
  segmento: string
  contatoNome: string | null
  contatoEmail: string | null
  etapa: EtapaDoPatrocinio
  valor: number | null
  /** O que a atlética entrega em troca. Sem isto, patrocínio vira doação. */
  contrapartidas: string[]
  inicioEm: string | null
  fimEm: string | null
  responsavelNome: string | null
  logoUrl: string | null
  observacao: string | null
  /** Renovação em risco quando o contrato vence sem conversa aberta. */
  atualizadoEm: string
}
