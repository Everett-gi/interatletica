/**
 * A fachada de dados. Nenhuma tela sabe de onde o dado veio.
 *
 * <p>Duas fontes, uma interface:</p>
 *
 * <ul>
 *   <li><strong>Demonstração</strong> — estado em memória. É o que roda no
 *       Vercel, onde só o front está publicado: a API em Spring precisa de
 *       um Postgres, e sem esta camada o deploy seria um app bonito que não
 *       carrega nada.</li>
 *   <li><strong>HTTP</strong> — a API de verdade, para desenvolvimento local
 *       e produção.</li>
 * </ul>
 *
 * <p><strong>Fases 2 e 3 são sempre demonstração.</strong> O front está à
 * frente do backend: equipes, torneios, tarefas e avisos têm tabela na
 * migration e tela aqui, mas ainda não têm endpoint. Isso está explícito em
 * cada método em vez de escondido atrás de um 404 confuso.</p>
 */

import { Api } from '../api/rotas'
import { lojaDemo } from '../demo/loja'
import { lojaDosModulos } from '../demo/lojaDosModulos'

/**
 * Ligado por variável de ambiente no build. No Vercel vem `true`; local, com
 * a API rodando, vem vazio e o app fala com o backend de verdade.
 */
export const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === 'true'

/** Fase 1: escolhe a fonte. Fase 2 e 3: sempre a loja de demonstração. */
export const Dados = {
  // ---------------- Sessão ----------------
  sessao: () => (MODO_DEMO ? lojaDemo.sessao() : Api.sessao()),
  entrarDemo: () => lojaDemo.entrar(),
  sairDemo: () => lojaDemo.sair(),
  assumirPapel: lojaDemo.assumirPapel,

  // Cadastro e criação de atlética. Só existem na demonstração: com a API
  // conectada, a conta nasce do OAuth e a atlética é criada por um operador
  // — `POST /api/atleticas`, que devolve o convite do primeiro presidente.
  cadastrarDemo: (nome: string, email: string) => {
    // Conta nova começa sem participação nenhuma na rede. O conteúdo dela
    // continua lá; o que zera é o que eu já teria feito.
    lojaDosModulos.zerarEstadoPessoal()
    return lojaDemo.cadastrar(nome, email)
  },
  criarAtleticaDemo: lojaDemo.criarAtletica,

  // ---------------- Rede ----------------
  vitrine: () => (MODO_DEMO ? lojaDemo.vitrine() : Api.vitrine()),
  agendaDaRede: lojaDemo.agendaDaRede,
  quadroDeMedalhas: lojaDemo.quadroDeMedalhas,
  atleticasDaRede: lojaDemo.atleticasDaRede,
  atleticaPublica: (slug: string) =>
    MODO_DEMO ? lojaDemo.atleticaPublica(slug) : Api.atletica.publica(slug),

  // ---------------- Eventos ----------------
  eventosDaAtletica: (slug: string) =>
    MODO_DEMO ? lojaDemo.eventosDaAtletica(slug) : Api.eventos.listar(slug),
  agendaPublica: (slug: string) =>
    MODO_DEMO ? lojaDemo.agendaPublica(slug) : Api.publico.agenda(slug),
  evento: (slug: string, id: string) =>
    MODO_DEMO ? lojaDemo.evento(id) : Api.eventos.porId(slug, id),
  eventoPublico: (atleticaSlug: string, eventoSlug: string) =>
    MODO_DEMO
      ? lojaDemo.eventoPublico(atleticaSlug, eventoSlug)
      : Api.publico.evento(atleticaSlug, eventoSlug),
  criarEvento: lojaDemo.criarEvento,
  atualizarEvento: lojaDemo.atualizarEvento,
  mudarStatusDoEvento: lojaDemo.mudarStatusDoEvento,

  // ---------------- Inscrições ----------------
  minhaInscricao: (slug: string, eventoId: string) =>
    MODO_DEMO ? lojaDemo.minhaInscricao(eventoId) : Api.inscricao.minha(slug, eventoId),
  inscrever: (slug: string, eventoId: string) =>
    MODO_DEMO ? lojaDemo.inscrever(eventoId) : Api.inscricao.criar(slug, eventoId, null, null),
  cancelarInscricao: (slug: string, eventoId: string) =>
    MODO_DEMO ? lojaDemo.cancelarInscricao(eventoId) : Api.inscricao.cancelar(slug, eventoId),
  minhasInscricoes: () =>
    MODO_DEMO ? lojaDemo.minhasInscricoes() : Api.inscricao.minhas(),
  participantes: (slug: string, eventoId: string) =>
    MODO_DEMO ? lojaDemo.participantes(eventoId) : Api.participantes.listar(slug, eventoId),
  cancelarParticipante: lojaDemo.cancelarParticipante,
  checkin: (slug: string, eventoId: string, token: string) =>
    MODO_DEMO ? lojaDemo.checkin(eventoId, token) : Api.portaria.checkin(slug, eventoId, token),

  // ---------------- Pessoas ----------------
  membros: (slug: string) => (MODO_DEMO ? lojaDemo.membros(slug) : Api.membros.listar(slug)),
  alterarPapel: lojaDemo.alterarPapel,
  desligarMembro: lojaDemo.desligarMembro,
  convites: (slug: string) => (MODO_DEMO ? lojaDemo.convites(slug) : Api.convites.listar(slug)),
  convidar: lojaDemo.convidar,
  revogarConvite: lojaDemo.revogarConvite,

  // ---------------- Fase 2 e 3: só demonstração ----------------
  equipes: lojaDemo.equipes,
  torneios: lojaDemo.torneios,
  torneio: lojaDemo.torneio,
  torneioDoEvento: lojaDemo.torneioDoEvento,
  registrarPlacar: lojaDemo.registrarPlacar,
  tarefas: lojaDemo.tarefas,
  moverTarefa: lojaDemo.moverTarefa,
  criarTarefa: lojaDemo.criarTarefa,
  avisos: lojaDemo.avisos,
  publicarAviso: lojaDemo.publicarAviso,
  painel: lojaDemo.painel,

  // ------------------------------------------------------------------
  // Módulos de gestão, financeiro, rede, conhecimento, mercado e
  // comunicação. Todos em demonstração: a migration prevê as tabelas,
  // mas os endpoints ainda não existem. Espalhar essa distinção pelas
  // telas seria pior — a fachada continua sendo o único lugar que sabe
  // de onde o dado vem.
  // ------------------------------------------------------------------
  ...lojaDosModulos,
}
