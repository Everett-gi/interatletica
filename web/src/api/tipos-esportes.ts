/**
 * Atletas, jogos e viagens — o que existe entre o time e o campeonato.
 *
 * <p>Os tipos de torneio e equipe ficam em `tipos-rede.ts`, onde já
 * estavam. Aqui entra o que o planejamento pediu a mais: a ficha do atleta,
 * o calendário de jogos fora de chaveamento e a logística de viagem.</p>
 */

export type SituacaoDoAtleta = 'ATIVO' | 'LESIONADO' | 'SUSPENSO' | 'INATIVO'

export interface Atleta {
  usuarioId: string
  atleticaSlug: string
  nome: string
  avatarUrl: string | null
  curso: string | null
  modalidades: string[]
  equipes: string[]
  numero: number | null
  situacao: SituacaoDoAtleta
  jogos: number
  pontos: number
  /** Documento de elegibilidade entregue: matrícula, atestado. */
  documentacaoEmDia: boolean
  desde: string
}

export type ResultadoDoJogo = 'VITORIA' | 'EMPATE' | 'DERROTA' | 'PENDENTE'

export interface Jogo {
  id: string
  atleticaSlug: string
  modalidade: string
  equipeNome: string
  adversario: string
  adversarioAtleticaSlug: string | null
  inicioEm: string
  local: string | null
  competicao: string | null
  torneioId: string | null
  placarNos: number | null
  placarDeles: number | null
  resultado: ResultadoDoJogo
  destaques: string[]
}

export interface Viagem {
  id: string
  atleticaSlug: string
  destino: string
  motivo: string
  eventoId: string | null
  saidaEm: string
  retornoEm: string
  passageiros: number
  vagas: number
  transporte: string | null
  hospedagem: string | null
  custoPorPessoa: number | null
  responsavelNome: string | null
  pagos: number
  documentosPendentes: number
}

/** Artilharia, cestas, aces: o nome do que se conta muda por modalidade. */
export interface LinhaDeArtilharia {
  atletaNome: string
  equipeNome: string
  atleticaSlug: string | null
  total: number
  jogos: number
}
