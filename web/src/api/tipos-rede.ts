/**
 * Tipos das Fases 2 e 3, e da camada "rede" — o que existe ACIMA de uma
 * atlética só.
 *
 * <p>Separado de `tipos.ts` por assunto, não por fase: aquele arquivo é o
 * espelho do que a API da Fase 1 já entrega; este descreve o que o produto
 * faz quando várias atléticas se olham. Cada tipo aqui tem tabela
 * correspondente em `V1__baseline.sql` — a migration já previa tudo isso.</p>
 */

import type { AtleticaResumo, EventoResumo, Papel, TipoDeEvento } from './tipos'

// ---------------------------------------------------------------------
// Equipes
// ---------------------------------------------------------------------

export type FuncaoNaEquipe = 'CAPITAO' | 'TITULAR' | 'RESERVA' | 'TECNICO'

export interface AtletaDaEquipe {
  usuarioId: string
  nome: string
  avatarUrl: string | null
  funcao: FuncaoNaEquipe
  numero: number | null
  /** Nickname de jogo (Riot ID etc.). Usado nas modalidades de e-sports. */
  nick: string | null
}

export interface Equipe {
  id: string
  atleticaSlug: string
  nome: string
  tag: string | null
  modalidade: string
  escudoUrl: string | null
  ativa: boolean
  elenco: AtletaDaEquipe[]
}

// ---------------------------------------------------------------------
// Torneios
// ---------------------------------------------------------------------

export type FormatoDeTorneio =
  | 'ELIMINACAO_SIMPLES'
  | 'ELIMINACAO_DUPLA'
  | 'GRUPOS'
  | 'PONTOS_CORRIDOS'
  | 'SUICO'

export type StatusDoTorneio =
  | 'INSCRICOES'
  | 'CHAVEADO'
  | 'EM_ANDAMENTO'
  | 'ENCERRADO'
  | 'CANCELADO'

export type StatusDaPartida =
  | 'AGENDADA'
  | 'EM_ANDAMENTO'
  | 'ENCERRADA'
  | 'WO'
  | 'CANCELADA'

export interface ParticipanteDoTorneio {
  id: string
  /**
   * Congelado no momento da inscrição. A tabela do torneio de 2026 não muda
   * se a equipe se renomear em 2027.
   */
  nomeExibicao: string
  atleticaSlug: string | null
  seed: number | null
  situacao: 'ATIVO' | 'ELIMINADO' | 'DESISTENTE' | 'DESCLASSIFICADO'
}

/** Placar por mapa, set ou game. MD3 de Valorant e set de vôlei têm a mesma forma. */
export interface ParcialDaPartida {
  numero: number
  /** Nome do mapa no e-sports, número do set no vôlei. */
  rotulo: string | null
  placarA: number
  placarB: number
}

export interface Partida {
  id: string
  rodada: number
  ordem: number
  rotulo: string | null
  chave: 'PRINCIPAL' | 'REPESCAGEM' | 'DISPUTA_TERCEIRO'
  participanteAId: string | null
  participanteBId: string | null
  placarA: number | null
  placarB: number | null
  vencedorId: string | null
  melhorDe: number
  status: StatusDaPartida
  inicioEm: string | null
  localNome: string | null
  /**
   * O par que transforma uma lista de partidas em chaveamento navegável:
   * quem vence esta entra no slot A ou B da próxima.
   */
  proximaPartidaId: string | null
  slotProximo: 'A' | 'B' | null
  parciais: ParcialDaPartida[]
}

export interface Torneio {
  id: string
  eventoId: string
  atleticaSlug: string
  nome: string
  modalidade: string
  formato: FormatoDeTorneio
  vagas: number
  status: StatusDoTorneio
  regulamentoUrl: string | null
  participantes: ParticipanteDoTorneio[]
  partidas: Partida[]
}

/** Linha da tabela de pontos corridos ou de fase de grupos. */
export interface LinhaDaTabela {
  participanteId: string
  nome: string
  atleticaSlug: string | null
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  pontosPro: number
  pontosContra: number
  pontos: number
}

// ---------------------------------------------------------------------
// Gestão interna
// ---------------------------------------------------------------------

export type PrioridadeDaTarefa = 'BAIXA' | 'MEDIA' | 'ALTA'
export type StatusDaTarefa = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'

export interface Tarefa {
  id: string
  atleticaSlug: string
  eventoId: string | null
  eventoTitulo: string | null
  titulo: string
  descricao: string | null
  responsavelId: string | null
  responsavelNome: string | null
  responsavelAvatarUrl: string | null
  prazo: string | null
  prioridade: PrioridadeDaTarefa
  status: StatusDaTarefa
  concluidaEm: string | null
}

export type PublicoDoAviso = 'MEMBROS' | 'INSCRITOS' | 'DIRETORIA' | 'PUBLICO'

export interface Aviso {
  id: string
  atleticaSlug: string
  eventoId: string | null
  titulo: string
  corpo: string
  publicoAlvo: PublicoDoAviso
  fixado: boolean
  publicadoEm: string | null
  autorNome: string
  autorAvatarUrl: string | null
}

// ---------------------------------------------------------------------
// Rede — o que só existe olhando várias atléticas juntas
// ---------------------------------------------------------------------

/**
 * Quadro de medalhas da temporada. É o número que a rede inteira acompanha,
 * e o motivo de `inscricao.atletica_id` guardar a atlética de ORIGEM.
 */
export interface LinhaDoQuadroDeMedalhas {
  posicao: number
  atletica: AtleticaResumo
  ouro: number
  prata: number
  bronze: number
  pontos: number
  /** Variação de posição desde a rodada anterior. Positivo é subida. */
  variacao: number
}

/** Um item do feed de descoberta: evento de qualquer atlética da rede. */
export interface ItemDaAgendaDaRede {
  evento: EventoResumo
  atletica: AtleticaResumo
  inscritos: number
  vagasRestantes: number | null
  /** Quantas atléticas coorganizam. Maior que 1 é interatlética. */
  organizadoras: number
}

export interface ResumoDaAtleticaNaRede {
  atletica: AtleticaResumo
  membros: number
  eventosNoAno: number
  equipes: number
  modalidades: string[]
  posicaoNoQuadro: number | null
}

// ---------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------

/** Um ponto de série temporal — presença por evento, inscrições por dia. */
export interface Ponto {
  rotulo: string
  valor: number
}

export interface PainelDaAtletica {
  membrosAtivos: number
  eventosPublicados: number
  inscritosNoMes: number
  taxaDePresenca: number
  proximosEventos: EventoResumo[]
  tarefasAbertas: number
  avisosFixados: Aviso[]
  inscricoesPorEvento: Ponto[]
  presencaPorEvento: Ponto[]
  origemDosInscritos: { nome: string; total: number }[]
  distribuicaoPorTipo: { tipo: TipoDeEvento; total: number }[]
}

/** Perfil pessoal: o que a pessoa é dentro da rede inteira. */
export interface PerfilDeAtleta {
  usuarioId: string
  nome: string
  email: string
  avatarUrl: string | null
  vinculos: { atletica: AtleticaResumo; papel: Papel; cargo: string | null }[]
  equipes: { equipe: Equipe; funcao: FuncaoNaEquipe }[]
  eventosInscritos: number
  presencas: number
  modalidades: string[]
}
