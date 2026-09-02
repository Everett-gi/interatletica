/**
 * O que uma diretoria administra entre um evento e outro.
 *
 * <p>Tudo aqui existe por causa de uma frase que se repete em toda atlética:
 * <em>"a diretoria nova não sabe como a antiga fazia"</em>. Projeto, reunião,
 * decisão, meta e gestão são as peças que transformam o que aconteceu em algo
 * consultável no ano seguinte — memória institucional, não burocracia.</p>
 */

import type { Visibilidade } from './tipos'

// ---------------------------------------------------------------------
// Projetos
// ---------------------------------------------------------------------

export type StatusDoProjeto =
  | 'IDEIA'
  | 'PLANEJAMENTO'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'PAUSADO'
  | 'CANCELADO'

/**
 * Um projeto social é um projeto como qualquer outro — só muda o que a
 * página de detalhe destaca. Separar em módulo próprio duplicaria tarefas,
 * orçamento e cronograma para não ganhar nada.
 */
export type TipoDeProjeto =
  | 'EVENTO'
  | 'CAMPEONATO'
  | 'SOCIAL'
  | 'ESTRUTURA'
  | 'CAPTACAO'
  | 'COMUNICACAO'

export interface MarcoDoProjeto {
  id: string
  titulo: string
  prazo: string | null
  concluido: boolean
}

export interface Projeto {
  id: string
  atleticaSlug: string
  nome: string
  resumo: string
  tipo: TipoDeProjeto
  status: StatusDoProjeto
  /** Setor responsável, no vocabulário da própria atlética: "Esportes". */
  area: string
  responsavelNome: string | null
  responsavelAvatarUrl: string | null
  inicioEm: string
  prazo: string | null
  /** 0 a 1. Vem da razão de tarefas concluídas, não de digitação manual. */
  progresso: number
  tarefasTotal: number
  tarefasConcluidas: number
  orcamentoPrevisto: number | null
  orcamentoGasto: number | null
  eventoId: string | null
  gestaoAno: number
  marcos: MarcoDoProjeto[]
  /** Só em projetos sociais. Vazio nos demais. */
  parceiros: string[]
  beneficiados: number | null
  resultado: string | null
}

/** Molde de projeto: a resposta a "não quero começar do zero". */
export interface ModeloDeProjeto {
  id: string
  nome: string
  descricao: string
  tipo: TipoDeProjeto
  duracaoEmDias: number
  /** Títulos das tarefas que o modelo cria. A contagem vira a pergunta do wizard. */
  tarefas: string[]
  marcos: string[]
  /** Quantas atléticas já usaram. É o que dá confiança em usar um molde alheio. */
  usos: number
  origemAtletica: string | null
}

// ---------------------------------------------------------------------
// Metas
// ---------------------------------------------------------------------

export interface Meta {
  id: string
  atleticaSlug: string
  gestaoAno: number
  titulo: string
  area: string
  alvo: number
  atual: number
  unidade: string
  prazo: string | null
}

// ---------------------------------------------------------------------
// Reuniões e decisões
// ---------------------------------------------------------------------

export type StatusDaReuniao = 'AGENDADA' | 'EM_ANDAMENTO' | 'REALIZADA' | 'CANCELADA'

export interface PautaDaReuniao {
  id: string
  titulo: string
  responsavel: string | null
  minutos: number
  /** Decisão que saiu desta pauta, quando saiu alguma. */
  decisaoId: string | null
}

export interface Reuniao {
  id: string
  atleticaSlug: string
  titulo: string
  inicioEm: string
  duracaoEmMinutos: number
  local: string | null
  linkOnline: string | null
  status: StatusDaReuniao
  convocados: { nome: string; avatarUrl: string | null; confirmado: boolean }[]
  pautas: PautaDaReuniao[]
  ata: string | null
  tarefasGeradas: number
  documentos: string[]
}

export type StatusDaDecisao = 'RASCUNHO' | 'EM_VOTACAO' | 'APROVADA' | 'REJEITADA' | 'ADIADA'

export interface OpcaoDeDecisao {
  id: string
  rotulo: string
  detalhe: string | null
  votos: number
}

export interface Decisao {
  id: string
  atleticaSlug: string
  titulo: string
  contexto: string
  status: StatusDaDecisao
  reuniaoId: string | null
  reuniaoTitulo: string | null
  abertaEm: string
  fechaEm: string | null
  opcoes: OpcaoDeDecisao[]
  /** Nulo enquanto a votação está aberta. */
  escolhidaId: string | null
  responsavelNome: string | null
  quorum: number
  votantes: number
  /** Meu voto nesta decisão, para a interface não deixar votar duas vezes. */
  meuVoto: string | null
}

// ---------------------------------------------------------------------
// Gestão e transição
// ---------------------------------------------------------------------

export interface IntegranteDaGestao {
  nome: string
  cargo: string
  avatarUrl: string | null
}

export interface Gestao {
  ano: number
  atleticaSlug: string
  periodo: string
  presidente: string
  encerrada: boolean
  integrantes: IntegranteDaGestao[]
  eventosRealizados: number
  projetosConcluidos: number
  membrosAoFinal: number
  saldoFinal: number | null
  conquistas: string[]
  problemas: string[]
  recomendacoes: string[]
  documentos: string[]
}

export type AreaDaTransicao =
  | 'DOCUMENTOS'
  | 'FINANCEIRO'
  | 'PROJETOS'
  | 'FORNECEDORES'
  | 'PATRIMONIO'
  | 'ACESSOS'
  | 'PENDENCIAS'

export interface ItemDaTransicao {
  id: string
  area: AreaDaTransicao
  titulo: string
  detalhe: string | null
  concluido: boolean
  responsavelNome: string | null
}

export interface Transicao {
  atleticaSlug: string
  deAno: number
  paraAno: number
  entregaEm: string
  itens: ItemDaTransicao[]
}

// ---------------------------------------------------------------------
// Documentos e patrimônio
// ---------------------------------------------------------------------

export type PastaDeDocumento =
  | 'ESTATUTO'
  | 'ATAS'
  | 'CONTRATOS'
  | 'FINANCEIRO'
  | 'EVENTOS'
  | 'REGULAMENTOS'
  | 'GESTAO'
  | 'HISTORICO'

export interface Documento {
  id: string
  atleticaSlug: string
  nome: string
  pasta: PastaDeDocumento
  formato: 'PDF' | 'DOCX' | 'XLSX' | 'IMAGEM' | 'LINK'
  tamanhoEmKb: number | null
  visibilidade: Visibilidade | 'DIRETORIA'
  atualizadoEm: string
  autorNome: string
  gestaoAno: number
  descricao: string | null
}

export type EstadoDoItem = 'NOVO' | 'BOM' | 'DESGASTADO' | 'DANIFICADO' | 'BAIXADO'

export type CategoriaDePatrimonio =
  | 'ESPORTIVO'
  | 'UNIFORME'
  | 'ELETRONICO'
  | 'MOBILIARIO'
  | 'OUTRO'

export interface ItemDePatrimonio {
  id: string
  atleticaSlug: string
  nome: string
  categoria: CategoriaDePatrimonio
  quantidade: number
  estado: EstadoDoItem
  localizacao: string | null
  responsavelNome: string | null
  valorEstimado: number | null
  adquiridoEm: string | null
  fotoUrl: string | null
  observacao: string | null
}

// ---------------------------------------------------------------------
// Histórico — a trilha que preserva a memória (§86)
// ---------------------------------------------------------------------

export interface EventoDoHistorico {
  id: string
  quando: string
  autorNome: string
  acao: string
  alvo: string
  detalhe: string | null
}
