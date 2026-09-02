/**
 * A loja do modo demonstração: estado em memória, mutável, com a mesma forma
 * que a API devolve.
 *
 * <p><strong>Mutável de propósito.</strong> Um demo só de leitura vira
 * catálogo de telas; ninguém entende o produto olhando print. Aqui dá para
 * criar evento, publicar, convidar, cancelar inscrição e ler o QR na
 * portaria — e o efeito persiste enquanto a aba estiver aberta. É o mais
 * perto de usar o sistema sem ter um Postgres no ar.</p>
 *
 * <p>O estado vive só na memória da aba. Recarregar volta tudo ao início, o
 * que é o comportamento desejado: cada visitante do link recebe o mesmo
 * ponto de partida, e ninguém consegue sujar a demonstração para o
 * próximo.</p>
 */

import type {
  AtleticaResumo,
  Convite,
  Evento,
  EventoPublico,
  EventoResumo,
  Inscricao,
  Membro,
  Papel,
  Participante,
  PerfilDaSessao,
  ResultadoDoCheckin,
  StatusDoEvento,
} from '../api/tipos'
import type {
  Aviso,
  Equipe,
  ItemDaAgendaDaRede,
  LinhaDoQuadroDeMedalhas,
  PainelDaAtletica,
  Ponto,
  ResumoDaAtleticaNaRede,
  StatusDaTarefa,
  Tarefa,
  Torneio,
} from '../api/tipos-rede'
import {
  AGORA,
  ATLETICAS,
  AVISOS,
  CONVITES,
  EQUIPES,
  EVENTOS,
  MEMBROS,
  QUADRO_DE_MEDALHAS,
  SESSAO_DEMO,
  TAREFAS,
  TORNEIOS,
  atleticaPorSlug,
  registrarAtletica,
  participantesDoEvento,
  resumirEvento,
} from './dados'

/** Cópia profunda do seed: mutações do demo não contaminam o módulo de dados. */
function clonar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T
}

interface Estado {
  sessao: PerfilDaSessao | null
  eventos: (Evento & { atleticaSlug: string; organizadoras: string[] })[]
  membros: Record<string, Membro[]>
  convites: Record<string, Convite[]>
  tarefas: Tarefa[]
  avisos: Aviso[]
  equipes: Equipe[]
  torneios: Torneio[]
  participantes: Record<string, Participante[]>
  minhasInscricoes: Record<string, Inscricao>
}

const estado: Estado = {
  // Ninguém logado na abertura. A porta de entrada é a tela de boas-vindas,
  // que oferece os dois caminhos: começar do zero ou abrir a demonstração
  // já preenchida.
  sessao: null,
  eventos: clonar(EVENTOS),
  membros: clonar(MEMBROS),
  convites: clonar(CONVITES),
  tarefas: clonar(TAREFAS),
  avisos: clonar(AVISOS),
  equipes: clonar(EQUIPES),
  torneios: clonar(TORNEIOS),
  participantes: {},
  minhasInscricoes: {},
}

/** Latência simulada: sem ela o app pisca e ninguém vê os estados de carga. */
function responder<T>(valor: T, ms = 180): Promise<T> {
  return new Promise((resolver) => setTimeout(() => resolver(valor), ms))
}

function participantes(eventoId: string): Participante[] {
  if (!estado.participantes[eventoId]) {
    const evento = estado.eventos.find((e) => e.id === eventoId)
    const total = (evento?.inscritosConfirmados ?? 0) + (evento?.naListaDeEspera ?? 0)
    // O gerador é determinístico, então a lista é a mesma a cada visita —
    // mas passa a ser mutável a partir daqui.
    estado.participantes[eventoId] = participantesDoEvento(eventoId, Math.min(total, 120))
  }
  return estado.participantes[eventoId]
}

function novoId(prefixo: string): string {
  return `${prefixo}-${Math.random().toString(36).slice(2, 9)}`
}

function gerarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Garante que o slug não colida com uma atlética que já existe.
 *
 * <p>O slug é o endereço público (`/a/dragoes`). Duas atléticas com o mesmo
 * levariam a segunda a abrir a página da primeira — e no servidor é chave
 * única, então este é o mesmo tratamento que o backend faz, antecipado.</p>
 */
function slugUnico(base: string): string {
  const raiz = base || 'atletica'
  if (!atleticaPorSlug(raiz)) {
    return raiz
  }
  let n = 2
  while (atleticaPorSlug(`${raiz}-${n}`)) {
    n += 1
  }
  return `${raiz}-${n}`
}

/**
 * Leitura do estado da demonstração por outros módulos de demo.
 *
 * <p>Existe para que conquistas, indicadores e onboarding sejam
 * <strong>derivados</strong> do que a atlética realmente tem, em vez de
 * constantes. Uma atlética recém-criada mostrando "74% de presença" e
 * "primeiro evento conquistado" não é um detalhe cosmético: é a plataforma
 * mentindo sobre o que a pessoa fez.</p>
 */
export const estadoDaDemonstracao = {
  membrosDe: (slug: string) => estado.membros[slug] ?? [],
  equipesDe: (slug: string) => estado.equipes.filter((e) => e.atleticaSlug === slug),
  torneiosDe: (slug: string) => estado.torneios.filter((t) => t.atleticaSlug === slug),

  /** Contagens de evento e presença, que alimentam indicador e conquista. */
  resumoDeEventos(slug: string) {
    const eventos = estado.eventos.filter((e) => e.atleticaSlug === slug)
    const publicados = eventos.filter((e) => e.status === 'PUBLICADO')
    const inscritos = publicados.reduce((s, e) => s + e.inscritosConfirmados, 0)
    const presentes = publicados.reduce(
      (s, e) => s + participantes(e.id).filter((p) => p.checkinEm !== null).length, 0)
    return { total: eventos.length, publicados: publicados.length, inscritos, presentes }
  },
}

// =====================================================================
// Leituras
// =====================================================================

export const lojaDemo = {
  sessao: () => responder(estado.sessao),

  /**
   * Entra na demonstração já preenchida, como presidente dos Dragões.
   *
   * <p>Continua existindo ao lado do caminho do zero porque as duas servem a
   * públicos diferentes: quem vai <em>apresentar</em> a plataforma precisa de
   * uma atlética com dois anos de história em trinta segundos; quem vai
   * <em>experimentar</em> precisa do vazio.</p>
   */
  entrar(): Promise<PerfilDaSessao> {
    estado.sessao = clonar(SESSAO_DEMO)
    return responder(estado.sessao)
  },

  /**
   * Cria uma conta sem vínculo com atlética nenhuma.
   *
   * <p>É o estado que a plataforma real produz depois do primeiro login: a
   * pessoa existe e não pertence a lugar nenhum. Daí ela cria a própria
   * atlética ou espera um convite — não há terceira saída, e é assim de
   * propósito.</p>
   */
  cadastrar(nome: string, email: string): Promise<PerfilDaSessao> {
    estado.sessao = {
      id: novoId('u'),
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      avatarUrl: null,
      operador: false,
      atleticas: [],
      convitesPendentes: 0,
    }
    return responder(estado.sessao)
  },

  /**
   * Cria a atlética da pessoa — vazia, com ela como presidente.
   *
   * <p>Vazia de verdade: sem evento, sem lançamento, sem projeto. Todos os
   * módulos filtram por slug, então um slug novo devolve lista vazia em toda
   * parte, e o que aparece é o estado vazio que cada tela já sabe mostrar.
   * O que <strong>não</strong> fica vazio é a rede: guias, modelos,
   * fornecedores e as outras atléticas existem independentemente de você, e é
   * justamente isso que dá o que fazer no primeiro dia.</p>
   */
  criarAtletica(dados: {
    nome: string
    sigla: string | null
    instituicao: string
    cidade: string | null
    uf: string | null
    corPrimaria: string | null
  }): Promise<AtleticaResumo> {
    const atletica: AtleticaResumo = {
      slug: slugUnico(gerarSlug(dados.nome)),
      nome: dados.nome.trim(),
      sigla: dados.sigla?.trim() || null,
      instituicao: dados.instituicao.trim(),
      cidade: dados.cidade?.trim() || null,
      uf: dados.uf?.trim().toUpperCase() || null,
      brasaoUrl: null,
      corPrimaria: dados.corPrimaria,
    }

    registrarAtletica(atletica)

    const sessao = estado.sessao
    if (sessao) {
      estado.membros[atletica.slug] = [{
        id: novoId('m'),
        usuarioId: sessao.id,
        nome: sessao.nome,
        email: sessao.email,
        avatarUrl: sessao.avatarUrl,
        papel: 'PRESIDENTE',
        cargo: 'Presidente',
        situacao: 'ATIVO',
        entrouEm: new Date().toISOString(),
        saiuEm: null,
      }]
      estado.convites[atletica.slug] = []
      sessao.atleticas = [
        ...sessao.atleticas,
        { atletica, papel: 'PRESIDENTE', cargo: 'Presidente' },
      ]
    }

    return responder(atletica)
  },

  sair(): Promise<null> {
    estado.sessao = null
    return responder(null)
  },

  /**
   * Troca o papel de quem está logado. Só existe no demo, para mostrar o que
   * cada função enxerga.
   *
   * <p>Opera sobre a sessão <em>atual</em>, e não sobre a sessão de exemplo:
   * quem criou a própria atlética e experimenta ser membro precisa continuar
   * na atlética dele. Antes isto substituía a sessão inteira pela da Marina,
   * e a pessoa era teleportada para os Dragões sem entender por quê.</p>
   */
  assumirPapel(papel: Papel | 'VISITANTE'): Promise<PerfilDaSessao | null> {
    if (papel === 'VISITANTE') {
      estado.sessao = null
      return responder(null)
    }
    const base = estado.sessao
      ? clonar(estado.sessao)
      : clonar(SESSAO_DEMO)
    base.atleticas = base.atleticas.map((v, i) =>
      i === 0 ? { ...v, papel, cargo: rotuloDoCargo(papel) } : v)
    base.operador = papel === 'PRESIDENTE'
    estado.sessao = base
    return responder(base)
  },

  vitrine: () => responder(ATLETICAS),

  atleticaPublica: (slug: string) => responder(atleticaPorSlug(slug) ?? null),

  // ------------------------------------------------------------------
  // Rede
  // ------------------------------------------------------------------

  agendaDaRede(): Promise<ItemDaAgendaDaRede[]> {
    const itens = estado.eventos
      .filter((e) => e.status === 'PUBLICADO' && e.visibilidade !== 'INTERNO')
      .filter((e) => new Date(e.inicioEm) >= AGORA)
      .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm))
      .map((e) => ({
        evento: resumirEvento(e),
        atletica: atleticaPorSlug(e.atleticaSlug)!,
        inscritos: e.inscritosConfirmados,
        vagasRestantes: e.capacidade === null
          ? null
          : Math.max(0, e.capacidade - e.inscritosConfirmados),
        organizadoras: e.organizadoras.length,
      }))
    return responder(itens)
  },

  quadroDeMedalhas: (): Promise<LinhaDoQuadroDeMedalhas[]> =>
    responder(QUADRO_DE_MEDALHAS),

  atleticasDaRede(): Promise<ResumoDaAtleticaNaRede[]> {
    const resumos = ATLETICAS.map((atletica) => {
      const eventos = estado.eventos.filter((e) => e.atleticaSlug === atletica.slug)
      const equipes = estado.equipes.filter((e) => e.atleticaSlug === atletica.slug)
      const posicao = QUADRO_DE_MEDALHAS.find((l) => l.atletica.slug === atletica.slug)
      return {
        atletica,
        membros: estado.membros[atletica.slug]?.length ?? 8 + atletica.slug.length,
        eventosNoAno: eventos.length || 3,
        equipes: equipes.length,
        modalidades: [...new Set(equipes.map((e) => e.modalidade))],
        posicaoNoQuadro: posicao?.posicao ?? null,
      }
    })
    return responder(resumos)
  },

  // ------------------------------------------------------------------
  // Eventos
  // ------------------------------------------------------------------

  eventosDaAtletica: (slug: string): Promise<EventoResumo[]> =>
    responder(
      estado.eventos
        .filter((e) => e.atleticaSlug === slug)
        .sort((a, b) => b.inicioEm.localeCompare(a.inicioEm))
        .map(resumirEvento),
    ),

  agendaPublica: (slug: string): Promise<EventoResumo[]> =>
    responder(
      estado.eventos
        .filter((e) => e.atleticaSlug === slug
          && e.status === 'PUBLICADO'
          && e.visibilidade !== 'INTERNO'
          && new Date(e.inicioEm) >= AGORA)
        .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm))
        .map(resumirEvento),
    ),

  evento: (id: string): Promise<Evento | null> =>
    responder(estado.eventos.find((e) => e.id === id) ?? null),

  eventoPublico(atleticaSlug: string, eventoSlug: string): Promise<EventoPublico | null> {
    const evento = estado.eventos.find(
      (e) => e.atleticaSlug === atleticaSlug && e.slug === eventoSlug)
    const atletica = atleticaPorSlug(atleticaSlug)
    if (!evento || !atletica || evento.status === 'RASCUNHO'
        || evento.visibilidade === 'INTERNO') {
      return responder(null)
    }

    const motivo = motivoDeFechamento(evento)
    return responder({
      id: evento.id,
      atleticaSlug: atletica.slug,
      atleticaNome: atletica.nome,
      atleticaBrasaoUrl: atletica.brasaoUrl,
      slug: evento.slug,
      titulo: evento.titulo,
      descricao: evento.descricao,
      tipo: evento.tipo,
      modalidade: evento.modalidade,
      status: evento.status,
      inicioEm: evento.inicioEm,
      fimEm: evento.fimEm,
      localNome: evento.localNome,
      localEndereco: evento.localEndereco,
      localMapaUrl: evento.localMapaUrl,
      capaUrl: evento.capaUrl,
      capacidade: evento.capacidade,
      vagasRestantes: evento.capacidade === null
        ? null
        : Math.max(0, evento.capacidade - evento.inscritosConfirmados),
      inscritosConfirmados: evento.inscritosConfirmados,
      inscricaoAberta: motivo === null,
      motivoDoFechamento: motivo,
      inscricaoAbreEm: evento.inscricaoAbreEm,
      inscricaoFechaEm: evento.inscricaoFechaEm,
    })
  },

  criarEvento(slug: string, dados: Partial<Evento> & { titulo: string }): Promise<Evento> {
    const novo = {
      id: novoId('e'),
      slug: gerarSlug(dados.titulo),
      titulo: dados.titulo,
      descricao: dados.descricao ?? null,
      tipo: dados.tipo ?? 'SOCIAL',
      modalidade: dados.modalidade ?? null,
      status: 'RASCUNHO' as StatusDoEvento,
      visibilidade: dados.visibilidade ?? 'PUBLICO',
      inicioEm: dados.inicioEm ?? new Date().toISOString(),
      fimEm: dados.fimEm ?? null,
      localNome: dados.localNome ?? null,
      localEndereco: dados.localEndereco ?? null,
      localMapaUrl: dados.localMapaUrl ?? null,
      capacidade: dados.capacidade ?? null,
      inscricaoAbreEm: dados.inscricaoAbreEm ?? null,
      inscricaoFechaEm: dados.inscricaoFechaEm ?? null,
      inscricaoPorEquipe: dados.inscricaoPorEquipe ?? false,
      capaUrl: dados.capaUrl ?? null,
      publicadoEm: null,
      inscritosConfirmados: 0,
      naListaDeEspera: 0,
      atleticaSlug: slug,
      organizadoras: [slug],
    }
    estado.eventos.unshift(novo)
    return responder(novo)
  },

  atualizarEvento(id: string, dados: Partial<Evento>): Promise<Evento | null> {
    const evento = estado.eventos.find((e) => e.id === id)
    if (evento) {
      Object.assign(evento, dados)
    }
    return responder(evento ?? null)
  },

  mudarStatusDoEvento(id: string, status: StatusDoEvento): Promise<Evento | null> {
    const evento = estado.eventos.find((e) => e.id === id)
    if (evento) {
      evento.status = status
      evento.publicadoEm = status === 'PUBLICADO' ? new Date().toISOString() : null
    }
    return responder(evento ?? null)
  },

  // ------------------------------------------------------------------
  // Inscrições
  // ------------------------------------------------------------------

  minhaInscricao: (eventoId: string) =>
    responder(estado.minhasInscricoes[eventoId] ?? null),

  inscrever(eventoId: string): Promise<Inscricao> {
    const evento = estado.eventos.find((e) => e.id === eventoId)!
    const lotado = evento.capacidade !== null
      && evento.inscritosConfirmados >= evento.capacidade

    if (lotado) {
      evento.naListaDeEspera += 1
    } else {
      evento.inscritosConfirmados += 1
    }

    const inscricao: Inscricao = {
      id: novoId('i'),
      status: lotado ? 'LISTA_ESPERA' : 'CONFIRMADA',
      posicaoEspera: lotado ? evento.naListaDeEspera : null,
      checkinToken: Array.from({ length: 32 },
        () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
      checkinEm: null,
      criadoEm: new Date().toISOString(),
      eventoTitulo: evento.titulo,
      eventoInicioEm: evento.inicioEm,
    }
    estado.minhasInscricoes[eventoId] = inscricao
    return responder(inscricao)
  },

  cancelarInscricao(eventoId: string): Promise<null> {
    const inscricao = estado.minhasInscricoes[eventoId]
    const evento = estado.eventos.find((e) => e.id === eventoId)
    if (inscricao && evento) {
      if (inscricao.status === 'CONFIRMADA') {
        evento.inscritosConfirmados -= 1
        // Promoção automática: quem está na frente da espera entra na vaga.
        if (evento.naListaDeEspera > 0) {
          evento.naListaDeEspera -= 1
          evento.inscritosConfirmados += 1
        }
      } else {
        evento.naListaDeEspera -= 1
      }
      delete estado.minhasInscricoes[eventoId]
    }
    return responder(null)
  },

  minhasInscricoes: (): Promise<Inscricao[]> =>
    responder(Object.values(estado.minhasInscricoes)),

  participantes: (eventoId: string) => responder(participantes(eventoId)),

  cancelarParticipante(eventoId: string, inscricaoId: string): Promise<null> {
    const lista = participantes(eventoId)
    const alvo = lista.findIndex((p) => p.inscricaoId === inscricaoId)
    if (alvo >= 0) {
      lista.splice(alvo, 1)
      const evento = estado.eventos.find((e) => e.id === eventoId)
      if (evento) {
        evento.inscritosConfirmados = Math.max(0, evento.inscritosConfirmados - 1)
      }
    }
    return responder(null)
  },

  checkin(eventoId: string, token: string): Promise<ResultadoDoCheckin> {
    const lista = participantes(eventoId)
    // No demo qualquer código com 32 caracteres bate no primeiro sem
    // presença registrada, para a portaria ser demonstrável sem QR real.
    const alvo = token.length >= 6
      ? lista.find((p) => p.checkinEm === null && p.status === 'CONFIRMADA')
      : undefined

    if (!alvo) {
      return responder({
        liberado: false,
        mensagem: 'Código não corresponde a nenhuma inscrição deste evento.',
        nome: null, status: null, checkinEm: null,
      })
    }
    alvo.checkinEm = new Date().toISOString()
    return responder({
      liberado: true,
      mensagem: 'Entrada liberada.',
      nome: alvo.nome,
      status: alvo.status,
      checkinEm: alvo.checkinEm,
    })
  },

  // ------------------------------------------------------------------
  // Pessoas
  // ------------------------------------------------------------------

  membros: (slug: string) => responder(estado.membros[slug] ?? []),

  alterarPapel(slug: string, membroId: string, papel: Papel): Promise<Membro | null> {
    const membro = estado.membros[slug]?.find((m) => m.id === membroId)
    if (membro) {
      membro.papel = papel
    }
    return responder(membro ?? null)
  },

  desligarMembro(slug: string, membroId: string): Promise<null> {
    const membro = estado.membros[slug]?.find((m) => m.id === membroId)
    if (membro) {
      membro.situacao = 'INATIVO'
      membro.saiuEm = new Date().toISOString()
    }
    return responder(null)
  },

  convites: (slug: string) => responder(estado.convites[slug] ?? []),

  convidar(slug: string, email: string, papel: Papel): Promise<Convite> {
    const convite: Convite = {
      id: novoId('c'),
      email,
      papel,
      link: `https://interatletica.com.br/convite/${novoId('tk')}`,
      expiraEm: new Date(Date.now() + 7 * 864e5).toISOString(),
      criadoEm: new Date().toISOString(),
    }
    estado.convites[slug] = [convite, ...(estado.convites[slug] ?? [])]
    return responder(convite)
  },

  revogarConvite(slug: string, id: string): Promise<null> {
    estado.convites[slug] = (estado.convites[slug] ?? []).filter((c) => c.id !== id)
    return responder(null)
  },

  // ------------------------------------------------------------------
  // Fase 2 e 3
  // ------------------------------------------------------------------

  equipes: (slug: string) =>
    responder(estado.equipes.filter((e) => e.atleticaSlug === slug)),

  torneios: (slug: string) =>
    responder(estado.torneios.filter((t) => t.atleticaSlug === slug)),

  torneio: (id: string) =>
    responder(estado.torneios.find((t) => t.id === id) ?? null),

  /**
   * O torneio de um evento. Um campeonato NAO e uma entidade paralela ao
   * evento: ele acontece dentro de um. O schema ja dizia isso — torneio
   * tem evento_id obrigatorio — e a interface passa a dizer tambem.
   */
  torneioDoEvento: (eventoId: string) =>
    responder(estado.torneios.find((t) => t.eventoId === eventoId) ?? null),

  registrarPlacar(
    torneioId: string, partidaId: string, placarA: number, placarB: number,
  ): Promise<Torneio | null> {
    const torneio = estado.torneios.find((t) => t.id === torneioId)
    const partida = torneio?.partidas.find((p) => p.id === partidaId)
    if (!torneio || !partida) {
      return responder(null)
    }

    partida.placarA = placarA
    partida.placarB = placarB
    partida.status = 'ENCERRADA'
    partida.vencedorId = placarA > placarB ? partida.participanteAId : partida.participanteBId

    // É isto que transforma a lista de partidas em chaveamento: o vencedor
    // cai automaticamente no slot certo da próxima.
    if (partida.proximaPartidaId && partida.slotProximo) {
      const proxima = torneio.partidas.find((p) => p.id === partida.proximaPartidaId)
      if (proxima) {
        if (partida.slotProximo === 'A') {
          proxima.participanteAId = partida.vencedorId
        } else {
          proxima.participanteBId = partida.vencedorId
        }
      }
    }

    const perdedor = placarA > placarB ? partida.participanteBId : partida.participanteAId
    const eliminado = torneio.participantes.find((p) => p.id === perdedor)
    if (eliminado) {
      eliminado.situacao = 'ELIMINADO'
    }

    return responder(torneio)
  },

  tarefas: (slug: string) =>
    responder(estado.tarefas.filter((t) => t.atleticaSlug === slug)),

  moverTarefa(id: string, status: StatusDaTarefa): Promise<Tarefa | null> {
    const tarefa = estado.tarefas.find((t) => t.id === id)
    if (tarefa) {
      tarefa.status = status
      tarefa.concluidaEm = status === 'CONCLUIDA' ? new Date().toISOString() : null
    }
    return responder(tarefa ?? null, 60)
  },

  criarTarefa(slug: string, titulo: string, prioridade: Tarefa['prioridade']): Promise<Tarefa> {
    const tarefa: Tarefa = {
      id: novoId('tf'), atleticaSlug: slug, eventoId: null, eventoTitulo: null,
      titulo, descricao: null, responsavelId: null, responsavelNome: null,
      responsavelAvatarUrl: null, prazo: null, prioridade,
      status: 'ABERTA', concluidaEm: null,
    }
    estado.tarefas.unshift(tarefa)
    return responder(tarefa, 60)
  },

  avisos: (slug: string) =>
    responder(estado.avisos.filter((a) => a.atleticaSlug === slug)),

  publicarAviso(slug: string, titulo: string, corpo: string,
                publicoAlvo: Aviso['publicoAlvo']): Promise<Aviso> {
    const aviso: Aviso = {
      id: novoId('av'), atleticaSlug: slug, eventoId: null, titulo, corpo,
      publicoAlvo, fixado: false, publicadoEm: new Date().toISOString(),
      autorNome: estado.sessao?.nome ?? 'Diretoria', autorAvatarUrl: null,
    }
    estado.avisos.unshift(aviso)
    return responder(aviso)
  },

  // ------------------------------------------------------------------
  // Painel
  // ------------------------------------------------------------------

  painel(slug: string): Promise<PainelDaAtletica> {
    const eventos = estado.eventos.filter((e) => e.atleticaSlug === slug)
    const publicados = eventos.filter((e) => e.status === 'PUBLICADO')

    const inscricoesPorEvento: Ponto[] = publicados
      .slice(0, 6)
      .map((e) => ({ rotulo: e.titulo, valor: e.inscritosConfirmados }))

    const presencaPorEvento: Ponto[] = publicados
      .slice(0, 6)
      .map((e, i) => ({
        rotulo: e.titulo,
        valor: Math.round(e.inscritosConfirmados * (0.62 + (i % 4) * 0.09)),
      }))

    const porTipo = new Map<string, number>()
    eventos.forEach((e) => porTipo.set(e.tipo, (porTipo.get(e.tipo) ?? 0) + 1))

    const origem = new Map<string, number>()
    publicados.forEach((e) => {
      participantes(e.id).forEach((p) => {
        const nome = p.atleticaDeOrigem
          ? atleticaPorSlug(p.atleticaDeOrigem)?.nome ?? 'Outra'
          : 'Sem atlética'
        origem.set(nome, (origem.get(nome) ?? 0) + 1)
      })
    })

    // Derivada, e não constante: uma atlética sem evento nenhum mostrava 74%
    // de presença, o que é impossível e denuncia número inventado.
    const totalInscritos = inscricoesPorEvento.reduce((s, p) => s + p.valor, 0)
    const totalPresentes = presencaPorEvento.reduce((s, p) => s + p.valor, 0)

    return responder({
      membrosAtivos: (estado.membros[slug] ?? []).filter((m) => m.situacao === 'ATIVO').length,
      eventosPublicados: publicados.length,
      inscritosNoMes: publicados.reduce((soma, e) => soma + e.inscritosConfirmados, 0),
      taxaDePresenca: totalInscritos === 0 ? 0 : totalPresentes / totalInscritos,
      proximosEventos: eventos
        .filter((e) => new Date(e.inicioEm) >= AGORA && e.status !== 'CANCELADO')
        .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm))
        .slice(0, 4)
        .map(resumirEvento),
      tarefasAbertas: estado.tarefas
        .filter((t) => t.atleticaSlug === slug && t.status !== 'CONCLUIDA').length,
      avisosFixados: estado.avisos.filter((a) => a.atleticaSlug === slug && a.fixado),
      inscricoesPorEvento,
      presencaPorEvento,
      origemDosInscritos: [...origem.entries()]
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6),
      distribuicaoPorTipo: [...porTipo.entries()]
        .map(([tipo, total]) => ({ tipo: tipo as PainelDaAtletica['distribuicaoPorTipo'][number]['tipo'], total })),
    })
  },
}

function rotuloDoCargo(papel: Papel): string {
  return papel === 'PRESIDENTE' ? 'Presidente'
    : papel === 'DIRETOR' ? 'Diretor de Esportes'
    : 'Membro'
}

/** Espelha `Evento.motivoDeFechamento` do backend. Null significa aberta. */
function motivoDeFechamento(evento: Evento): string | null {
  const agora = new Date()
  if (evento.status === 'CANCELADO') return 'Este evento foi cancelado.'
  if (evento.status === 'ENCERRADO') return 'Este evento já aconteceu.'
  if (evento.status !== 'PUBLICADO') return 'As inscrições ainda não foram abertas.'
  if (evento.inscricaoAbreEm && agora < new Date(evento.inscricaoAbreEm)) {
    return 'As inscrições ainda não começaram.'
  }
  if (evento.inscricaoFechaEm && agora > new Date(evento.inscricaoFechaEm)) {
    return 'O prazo de inscrição terminou.'
  }
  if (!evento.inscricaoFechaEm && agora > new Date(evento.inicioEm)) {
    return 'Este evento já começou.'
  }
  return null
}

export function listaDeAtleticas(): AtleticaResumo[] {
  return ATLETICAS
}
