/**
 * A fachada de dados. Nenhuma tela sabe de onde o dado veio.
 *
 * <p>Duas fontes, uma interface:</p>
 *
 * <ul>
 *   <li><strong>Demonstração</strong> — estado em memória, guardado no
 *       navegador. É o que roda no endereço público de apresentação: mostra a
 *       plataforma inteira sem servidor nenhum.</li>
 *   <li><strong>HTTP</strong> — a API de verdade. É o que roda no app real,
 *       com login do Google e Postgres atrás.</li>
 * </ul>
 *
 * <p><strong>No app real, o que não tem endpoint devolve vazio.</strong> Não
 * dado fictício: vazio. Número inventado ao lado de número real é o jeito
 * mais fácil de alguém tomar decisão errada olhando a própria atlética — e a
 * fachada é o único lugar onde essa distinção cabe, para que nenhuma tela
 * precise saber dela.</p>
 */

import { Api } from '../api/rotas'
import { lojaDemo } from '../demo/loja'
import { lojaDosModulos } from '../demo/lojaDosModulos'
import { descartarDemonstracao, iniciarPersistencia } from '../demo/sincronizacao'
import type {
  DadosDoEvento,
  NovaAtleticaPropria,
  Papel,
  StatusDoEvento,
} from '../api/tipos'
import type { PainelDaAtletica, ResumoDaAtleticaNaRede } from '../api/tipos-rede'
import type { PassoDeOnboarding } from '../api/tipos-plataforma'

/**
 * Ligado por variável de ambiente no build. O endereço de demonstração vem
 * com `true`; o app real, sem ela, e aí tudo fala com o backend.
 */
export const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === 'true'

/**
 * Religa a demonstração ao que ficou guardado no navegador.
 *
 * <p>Antes da primeira leitura de sessão, e só no modo demonstração: com a
 * API de verdade a sessão vem do cookie e não há nada a restaurar.</p>
 */
if (MODO_DEMO) {
  iniciarPersistencia()
}

/**
 * O painel do app real, montado do que a API entrega.
 *
 * <p>Os campos de módulos que ainda não existem vão a zero em vez de sumir:
 * o tipo é o mesmo que a demonstração devolve, e as telas continuam
 * funcionando sem condicional espalhada.</p>
 */
async function painelReal(slug: string): Promise<PainelDaAtletica> {
  const [eventos, membros] = await Promise.all([
    Api.eventos.listar(slug),
    Api.membros.listar(slug),
  ])
  const agora = Date.now()

  return {
    membrosAtivos: membros.filter((m) => m.situacao === 'ATIVO').length,
    eventosPublicados: eventos.filter((e) => e.status === 'PUBLICADO').length,
    inscritosNoMes: 0,
    taxaDePresenca: 0,
    proximosEventos: eventos
      .filter((e) => e.status !== 'CANCELADO' && new Date(e.inicioEm).getTime() >= agora)
      .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm))
      .slice(0, 5),
    tarefasAbertas: 0,
    avisosFixados: [],
    inscricoesPorEvento: [],
    presencaPorEvento: [],
    origemDosInscritos: [],
    distribuicaoPorTipo: [],
  }
}

/**
 * Os primeiros passos, derivados do que a atlética realmente tem.
 *
 * <p>Derivado, e não guardado: uma lista fixa marcaria "convide a diretoria"
 * como pendente para sempre, ou como feita sem ninguém ter convidado
 * ninguém.</p>
 */
async function onboardingReal(slug: string): Promise<PassoDeOnboarding[]> {
  const [membros, eventos, convites] = await Promise.all([
    Api.membros.listar(slug),
    Api.eventos.listar(slug),
    // Listar convite é atribuição de presidente; para o resto da diretoria a
    // API responde 403, e o passo apenas não conta como feito.
    Api.convites.listar(slug).catch(() => []),
  ])

  const ativos = membros.filter((m) => m.situacao === 'ATIVO')

  return [
    {
      id: 'convidar',
      titulo: 'Convide a diretoria',
      descricao: 'Cada convite vai para um e-mail e só quem entrar com ele aceita.',
      concluido: ativos.length > 1 || convites.length > 0,
      destino: 'membros?convidar=1',
      acao: 'Convidar',
    },
    {
      id: 'cargos',
      titulo: 'Diga de que cada um cuida',
      descricao: 'Papel diz o que a pessoa pode fazer; cargo diz do que ela cuida.',
      concluido: ativos.some((m) => m.cargo !== null && m.cargo !== ''),
      destino: 'membros',
      acao: 'Definir cargos',
    },
    {
      id: 'evento',
      titulo: 'Crie o primeiro evento',
      descricao: 'Treino, festa ou campeonato — é a unidade de trabalho da plataforma.',
      concluido: eventos.length > 0,
      destino: 'eventos/novo',
      acao: 'Criar evento',
    },
    {
      id: 'publicar',
      titulo: 'Publique e compartilhe',
      descricao: 'Publicar abre a inscrição e gera a página que circula no WhatsApp.',
      concluido: eventos.some((e) => e.status === 'PUBLICADO'),
      destino: 'eventos',
      acao: 'Abrir eventos',
    },
  ]
}

/** A vitrine da API, no formato que a tela da rede espera. */
async function atleticasDaRedeReal(): Promise<ResumoDaAtleticaNaRede[]> {
  const atleticas = await Api.vitrine()
  return atleticas.map((atletica) => ({
    atletica,
    membros: 0,
    eventosNoAno: 0,
    equipes: 0,
    modalidades: [],
    posicaoNoQuadro: null,
  }))
}

export const Dados = {
  // ------------------------------------------------------------------
  // Módulos de gestão, financeiro, rede, conhecimento, mercado e
  // comunicação. Sem endpoint ainda: na demonstração são completos, e no
  // app real as telas deles ficam fora da navegação.
  //
  // Vem primeiro para que o que está escrito abaixo vença o espalhamento.
  // ------------------------------------------------------------------
  ...lojaDosModulos,

  // ---------------- Sessão ----------------
  sessao: () => (MODO_DEMO ? lojaDemo.sessao() : Api.sessao()),
  entrarDemo: () => lojaDemo.entrar(),
  sairDemo: () => lojaDemo.sair(),
  assumirPapel: lojaDemo.assumirPapel,

  // O cadastro só existe na demonstração: com a API, a conta nasce do
  // primeiro login com o Google, e não de um formulário.
  cadastrarDemo: (nome: string, email: string) => {
    // Conta nova começa sem participação nenhuma na rede. O conteúdo dela
    // continua lá; o que zera é o que eu já teria feito.
    lojaDosModulos.zerarEstadoPessoal()
    return lojaDemo.cadastrar(nome, email)
  },

  /**
   * Cria a atlética de quem está pedindo — que já entra como presidente.
   *
   * <p>No servidor isso é `POST /api/atleticas/minha`, e não a criação do
   * operador: aquela devolve convite para outra pessoa presidir.</p>
   */
  criarAtletica: (dados: NovaAtleticaPropria): Promise<{ slug: string }> =>
    MODO_DEMO ? lojaDemo.criarAtletica(dados) : Api.atletica.criarMinha(dados),

  /** Apaga o que a demonstração guardou no navegador e recomeça do zero. */
  recomecarDemo: async () => {
    await lojaDemo.sair()
    descartarDemonstracao()
  },

  // ---------------- Rede ----------------
  vitrine: () => (MODO_DEMO ? lojaDemo.vitrine() : Api.vitrine()),
  atleticasDaRede: () =>
    MODO_DEMO ? lojaDemo.atleticasDaRede() : atleticasDaRedeReal(),
  // Agenda e quadro de medalhas cruzam dados de várias atléticas, e isso
  // ainda não existe na API.
  agendaDaRede: () => (MODO_DEMO ? lojaDemo.agendaDaRede() : Promise.resolve([])),
  quadroDeMedalhas: lojaDemo.quadroDeMedalhas,
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

  criarEvento: (slug: string, dados: DadosDoEvento) =>
    MODO_DEMO ? lojaDemo.criarEvento(slug, dados) : Api.eventos.criar(slug, dados),
  atualizarEvento: (slug: string, id: string, dados: DadosDoEvento) =>
    MODO_DEMO ? lojaDemo.atualizarEvento(id, dados) : Api.eventos.atualizar(slug, id, dados),

  /**
   * No servidor cada transição é uma rota própria, e não um campo que se
   * grava: publicar abre a inscrição e torna a página pública visível;
   * encerrar congela a lista de presença. Um PUT de status esconderia isso.
   */
  mudarStatusDoEvento: (slug: string, id: string, status: StatusDoEvento) => {
    if (MODO_DEMO) {
      return lojaDemo.mudarStatusDoEvento(id, status)
    }
    switch (status) {
      case 'PUBLICADO':
        return Api.eventos.publicar(slug, id)
      case 'RASCUNHO':
        return Api.eventos.despublicar(slug, id)
      case 'CANCELADO':
        return Api.eventos.cancelar(slug, id)
      case 'ENCERRADO':
        return Api.eventos.encerrar(slug, id)
    }
  },

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
  cancelarParticipante: (slug: string, eventoId: string, inscricaoId: string) =>
    MODO_DEMO
      ? lojaDemo.cancelarParticipante(eventoId, inscricaoId)
      : Api.participantes.cancelarInscricao(slug, eventoId, inscricaoId),
  checkin: (slug: string, eventoId: string, token: string) =>
    MODO_DEMO ? lojaDemo.checkin(eventoId, token) : Api.portaria.checkin(slug, eventoId, token),

  // ---------------- Pessoas ----------------
  membros: (slug: string) => (MODO_DEMO ? lojaDemo.membros(slug) : Api.membros.listar(slug)),
  convites: (slug: string) => (MODO_DEMO ? lojaDemo.convites(slug) : Api.convites.listar(slug)),

  // Papel e cargo são o mesmo PUT no servidor. Por isso os dois métodos
  // pedem o par: alterar um mandando o outro nulo apagaria o que estava lá.
  alterarPapel: (slug: string, membroId: string, papel: Papel, cargo: string | null = null) =>
    MODO_DEMO
      ? lojaDemo.alterarPapel(slug, membroId, papel)
      : Api.membros.alterarPapel(slug, membroId, papel, cargo),
  definirCargo: (slug: string, membroId: string, cargo: string, papel: Papel = 'MEMBRO') =>
    MODO_DEMO
      ? lojaDemo.definirCargo(slug, membroId, cargo)
      : Api.membros.alterarPapel(slug, membroId, papel, cargo.trim() === '' ? null : cargo.trim()),
  desligarMembro: (slug: string, membroId: string) =>
    MODO_DEMO ? lojaDemo.desligarMembro(slug, membroId) : Api.membros.desligar(slug, membroId),
  convidar: (slug: string, email: string, papel: Papel) =>
    MODO_DEMO ? lojaDemo.convidar(slug, email, papel) : Api.convites.criar(slug, email, papel),
  revogarConvite: (slug: string, id: string) =>
    MODO_DEMO ? lojaDemo.revogarConvite(slug, id) : Api.convites.revogar(slug, id),
  // Só existe na demonstração: com a API, quem aceita é o convidado, pelo
  // link que chegou no e-mail dele.
  simularAceite: lojaDemo.simularAceite,

  // ---------------- Painel e primeiros passos ----------------
  painel: (slug: string) => (MODO_DEMO ? lojaDemo.painel(slug) : painelReal(slug)),
  onboarding: (slug: string) =>
    MODO_DEMO ? lojaDosModulos.onboarding(slug) : onboardingReal(slug),

  // ---------------- Fase 2 e 3: só demonstração ----------------
  // Equipe aparece na página pública da atlética e no histórico da pessoa,
  // que existem no app real. Vazia lá, para que nenhuma das duas mostre time
  // inventado a quem abriu o link.
  equipes: (slug: string) => (MODO_DEMO ? lojaDemo.equipes(slug) : Promise.resolve([])),
  criarEquipe: lojaDemo.criarEquipe,
  escalarNaEquipe: lojaDemo.escalarNaEquipe,
  tirarDaEquipe: lojaDemo.tirarDaEquipe,
  torneios: lojaDemo.torneios,
  torneio: lojaDemo.torneio,
  // Nulo no app real: o detalhe do evento só desenha o chaveamento quando
  // ele existe, então a seção inteira some sozinha.
  torneioDoEvento: (eventoId: string) =>
    MODO_DEMO ? lojaDemo.torneioDoEvento(eventoId) : Promise.resolve(null),
  registrarPlacar: lojaDemo.registrarPlacar,
  tarefas: lojaDemo.tarefas,
  moverTarefa: lojaDemo.moverTarefa,
  criarTarefa: lojaDemo.criarTarefa,
  avisos: lojaDemo.avisos,
  publicarAviso: lojaDemo.publicarAviso,

  // Notificação e busca global varrem módulos que o app real ainda não tem.
  // Vazias, a casca continua de pé sem prometer o que não existe.
  notificacoes: (slug: string) =>
    MODO_DEMO ? lojaDosModulos.notificacoes(slug) : Promise.resolve([]),
  // Conquista sai de histórico que o app real ainda não acumula. Os dois
  // repassam os argumentos como vierem: copiar a assinatura da loja à mão
  // seria mais uma coisa para divergir quando ela mudar.
  conquistas: (...args: Parameters<typeof lojaDosModulos.conquistas>) =>
    MODO_DEMO ? lojaDosModulos.conquistas(...args) : Promise.resolve([]),
  buscar: (...args: Parameters<typeof lojaDosModulos.buscar>) =>
    MODO_DEMO ? lojaDosModulos.buscar(...args) : Promise.resolve([]),
}
