/**
 * A loja de demonstração dos módulos novos: gestão, financeiro, esportes,
 * rede, conhecimento, mercado, comunicação e plataforma.
 *
 * <p>Mesma regra de `loja.ts`: estado em memória, <strong>mutável</strong>.
 * Votar numa decisão muda o placar, marcar item da transição move a barra,
 * entrar numa compra coletiva soma quantidade. Demo só de leitura vira
 * catálogo de telas, e ninguém entende um produto olhando print.</p>
 *
 * <p>O que é <em>derivado</em> fica derivado: saldo, orçamento realizado e
 * pipeline saem dos lançamentos e dos registros, não de constantes paralelas.
 * É o que garante que as telas não se contradigam.</p>
 */

import type { AtleticaResumo } from '../api/tipos'
import type {
  Decisao,
  Documento,
  EventoDoHistorico,
  Gestao,
  ItemDePatrimonio,
  Meta,
  ModeloDeProjeto,
  Projeto,
  Reuniao,
  Transicao,
} from '../api/tipos-gestao'
import type {
  CategoriaFinanceira,
  Lancamento,
  Patrocinio,
  PrestacaoDeContas,
  ResumoFinanceiro,
} from '../api/tipos-financeiro'
import type { Atleta, Jogo, LinhaDeArtilharia, Viagem } from '../api/tipos-esportes'
import type {
  Comunidade,
  Experiencia,
  Guia,
  Modelo,
  OfertaDeMentoria,
  PedidoDeAjuda,
  PostDaComunidade,
  PostDaRede,
  Talento,
} from '../api/tipos-conhecimento'
import type {
  Amistoso,
  AvaliacaoDeFornecedor,
  CompraColetiva,
  Fornecedor,
  Oportunidade,
  Parceria,
  Produto,
} from '../api/tipos-mercado'
import type { Campanha, Midia, Noticia } from '../api/tipos-comunicacao'
import type {
  Conquista,
  Indicador,
  LinhaDeRanking,
  Notificacao,
  PainelDaRede,
  PassoDeOnboarding,
  ResultadoDeBusca,
  TipoDeRanking,
} from '../api/tipos-plataforma'

import { ATLETICAS, EVENTOS, MEMBROS, atleticaPorSlug } from './dados'
import {
  DECISOES,
  DOCUMENTOS,
  GESTOES,
  HISTORICO,
  METAS,
  MODELOS_DE_PROJETO,
  PATRIMONIO,
  PROJETOS,
  REUNIOES,
  TRANSICAO,
} from './gestao'
import {
  LANCAMENTOS,
  ORCAMENTO_PREVISTO,
  PATROCINIOS,
  PRESTACOES,
  ROTULO_DO_MES,
} from './financeiro'
import { ARTILHARIA, ATLETAS, JOGOS, VIAGENS } from './esportes'
import { EXPERIENCIAS, GUIAS, MODELOS } from './conhecimento'
import {
  AMISTOSOS,
  COMUNIDADES,
  FEED_DA_REDE,
  MENTORIAS,
  PEDIDOS_DE_AJUDA,
  POSTS_DE_COMUNIDADE,
  TALENTOS,
} from './rede'
import {
  AVALIACOES,
  COMPRAS_COLETIVAS,
  FORNECEDORES,
  OPORTUNIDADES,
  PARCERIAS,
  PRODUTOS,
} from './mercado'
import { CAMPANHAS, MIDIAS, NOTICIAS } from './comunicacao'
import {
  CONQUISTAS,
  INDICADORES,
  NOTIFICACOES,
  PAINEL_DA_REDE,
  PASSOS_DE_ONBOARDING,
  RANKINGS,
} from './plataforma'

function clonar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T
}

/**
 * Latência simulada — sem ela o app pisca e ninguém vê os estados de carga —
 * e uma cópia da resposta.
 *
 * <p>A cópia não é zelo: é o que faz o demo se comportar como HTTP. Devolver
 * a referência viva do estado tem duas consequências ruins. A tela poderia
 * alterar o "banco" sem passar por uma operação; e, pior, uma mutação que
 * devolvesse o MESMO objeto não provocaria re-render — o React compara por
 * identidade, veria o mesmo valor e não redesenharia. Votar numa decisão
 * mudaria o dado e não mudaria a tela.</p>
 */
function responder<T>(valor: T, ms = 160): Promise<T> {
  const copia = clonar(valor)
  return new Promise((resolver) => setTimeout(() => resolver(copia), ms))
}

interface Estado {
  projetos: Projeto[]
  metas: Meta[]
  reunioes: Reuniao[]
  decisoes: Decisao[]
  transicao: Transicao
  documentos: Documento[]
  patrimonio: ItemDePatrimonio[]
  lancamentos: Lancamento[]
  prestacoes: PrestacaoDeContas[]
  patrocinios: Patrocinio[]
  pedidos: PedidoDeAjuda[]
  comunidades: Comunidade[]
  compras: CompraColetiva[]
  parcerias: Parceria[]
  amistosos: Amistoso[]
  noticias: Noticia[]
  campanhas: Campanha[]
  notificacoes: Notificacao[]
  onboarding: PassoDeOnboarding[]
}

const estado: Estado = {
  projetos: clonar(PROJETOS),
  metas: clonar(METAS),
  reunioes: clonar(REUNIOES),
  decisoes: clonar(DECISOES),
  transicao: clonar(TRANSICAO),
  documentos: clonar(DOCUMENTOS),
  patrimonio: clonar(PATRIMONIO),
  lancamentos: clonar(LANCAMENTOS),
  prestacoes: clonar(PRESTACOES),
  patrocinios: clonar(PATROCINIOS),
  pedidos: clonar(PEDIDOS_DE_AJUDA),
  comunidades: clonar(COMUNIDADES),
  compras: clonar(COMPRAS_COLETIVAS),
  parcerias: clonar(PARCERIAS),
  amistosos: clonar(AMISTOSOS),
  noticias: clonar(NOTICIAS),
  campanhas: clonar(CAMPANHAS),
  notificacoes: clonar(NOTIFICACOES),
  onboarding: clonar(PASSOS_DE_ONBOARDING),
}

function novoId(prefixo: string): string {
  return `${prefixo}-${Math.random().toString(36).slice(2, 9)}`
}

const daAtletica = <T extends { atleticaSlug: string }>(lista: T[], slug: string) =>
  lista.filter((item) => item.atleticaSlug === slug)

// =====================================================================
// Financeiro derivado
// =====================================================================

/**
 * Saldo, orçamento e séries saem SEMPRE dos lançamentos.
 *
 * <p>É a diferença entre uma demonstração coerente e uma maquete: registrar
 * uma despesa muda o saldo do painel, o gráfico do mês e a linha da
 * categoria de uma vez só, porque todos leem a mesma fonte.</p>
 */
function resumirFinanceiro(slug: string): ResumoFinanceiro {
  const lancamentos = daAtletica(estado.lancamentos, slug)
  const confirmados = lancamentos.filter((l) => l.situacao === 'CONFIRMADO')
  const pendentes = lancamentos.filter(
    (l) => l.situacao === 'PREVISTO' || l.situacao === 'ATRASADO')

  const somar = (lista: Lancamento[], natureza: Lancamento['natureza']) =>
    lista.filter((l) => l.natureza === natureza).reduce((s, l) => s + l.valor, 0)

  const receitas = somar(confirmados, 'RECEITA')
  const despesas = somar(confirmados, 'DESPESA')

  // Série mensal acumulada: é a pergunta "o caixa está subindo ou descendo?".
  const competencias = [...new Set(confirmados.map((l) => l.competencia))].sort()
  let acumulado = 0
  const evolucao = competencias.map((competencia) => {
    const doMes = confirmados.filter((l) => l.competencia === competencia)
    acumulado += somar(doMes, 'RECEITA') - somar(doMes, 'DESPESA')
    return { rotulo: ROTULO_DO_MES[competencia] ?? competencia, valor: acumulado }
  })

  const categorias = [...new Set(confirmados.map((l) => l.categoria))]
  const porCategoria = categorias
    .map((categoria) => {
      const daCategoria = confirmados.filter((l) => l.categoria === categoria)
      return {
        categoria,
        receita: somar(daCategoria, 'RECEITA'),
        despesa: somar(daCategoria, 'DESPESA'),
      }
    })
    .sort((a, b) => (b.receita + b.despesa) - (a.receita + a.despesa))

  const orcamento = (Object.keys(ORCAMENTO_PREVISTO) as CategoriaFinanceira[])
    .map((categoria) => {
      const daCategoria = confirmados.filter((l) => l.categoria === categoria)
      return {
        categoria,
        previsto: ORCAMENTO_PREVISTO[categoria],
        realizado: daCategoria.reduce((s, l) => s + l.valor, 0),
      }
    })
    .filter((linha) => linha.previsto > 0)

  return {
    saldoAtual: receitas - despesas,
    receitasNoPeriodo: receitas,
    despesasNoPeriodo: despesas,
    aReceber: somar(pendentes, 'RECEITA'),
    aPagar: somar(pendentes, 'DESPESA'),
    evolucao,
    porCategoria,
    orcamento,
    ultimosLancamentos: [...lancamentos].reverse().slice(0, 8),
  }
}

// =====================================================================
// Busca global
// =====================================================================

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/**
 * O índice da busca global, montado sob demanda.
 *
 * <p>`contextoSlug` não filtra: ele <em>ordena</em>. Pesquisar "regulamento"
 * dentro dos Dragões deve trazer o regulamento dos Dragões primeiro, sem
 * esconder o dos Leões — é a regra do §98 do planejamento.</p>
 */
function indexar(contextoSlug: string): ResultadoDeBusca[] {
  const itens: ResultadoDeBusca[] = []
  const base = `/hub/${contextoSlug}`

  ATLETICAS.forEach((a) => itens.push({
    id: `bat-${a.slug}`, tipo: 'ATLETICA', titulo: a.nome,
    detalhe: `${a.instituicao} · ${a.cidade ?? ''}`,
    destino: `/a/${a.slug}`, noContexto: a.slug === contextoSlug,
  }))

  EVENTOS.forEach((e) => itens.push({
    id: `bev-${e.id}`, tipo: 'EVENTO', titulo: e.titulo,
    detalhe: [e.modalidade, e.localNome].filter(Boolean).join(' · ') || 'Evento',
    destino: e.atleticaSlug === contextoSlug
      ? `${base}/eventos/${e.id}`
      : `/e/${e.atleticaSlug}/${e.slug}`,
    noContexto: e.atleticaSlug === contextoSlug,
  }))

  estado.projetos.forEach((p) => itens.push({
    id: `bpj-${p.id}`, tipo: 'PROJETO', titulo: p.nome, detalhe: p.resumo,
    destino: `${base}/projetos/${p.id}`, noContexto: p.atleticaSlug === contextoSlug,
  }))

  estado.documentos.forEach((d) => itens.push({
    id: `bdc-${d.id}`, tipo: 'DOCUMENTO', titulo: d.nome,
    detalhe: `${d.pasta.toLowerCase()} · ${d.formato}`,
    destino: `${base}/documentos`, noContexto: d.atleticaSlug === contextoSlug,
  }))

  FORNECEDORES.forEach((f) => itens.push({
    id: `bfn-${f.id}`, tipo: 'FORNECEDOR', titulo: f.nome,
    detalhe: `${f.categoria.toLowerCase()} · nota ${f.nota.toFixed(1)}`,
    destino: `${base}/mercado/fornecedores/${f.id}`, noContexto: false,
  }))

  estado.pedidos.forEach((p) => itens.push({
    id: `bpa-${p.id}`, tipo: 'PERGUNTA', titulo: p.titulo,
    detalhe: `${p.atletica.nome} · ${p.respostas.length} respostas`,
    destino: `${base}/rede/ajuda/${p.id}`, noContexto: p.atletica.slug === contextoSlug,
  }))

  GUIAS.forEach((g) => itens.push({
    id: `bgu-${g.id}`, tipo: 'GUIA', titulo: g.titulo, detalhe: g.resumo,
    destino: `${base}/conhecimento/guias/${g.id}`, noContexto: false,
  }))

  EXPERIENCIAS.forEach((e) => itens.push({
    id: `bex-${e.id}`, tipo: 'POST', titulo: e.titulo,
    detalhe: `${e.atletica.nome} · ${e.quando}`,
    destino: `${base}/conhecimento/experiencias/${e.id}`,
    noContexto: e.atletica.slug === contextoSlug,
  }))

  Object.entries(MEMBROS).forEach(([slug, lista]) => {
    lista.forEach((m) => itens.push({
      id: `bpe-${slug}-${m.id}`, tipo: 'PESSOA', titulo: m.nome,
      detalhe: `${m.cargo ?? 'Membro'} · ${atleticaPorSlug(slug)?.nome ?? ''}`,
      destino: `${base}/membros`, noContexto: slug === contextoSlug,
    }))
  })

  PAGINAS.forEach((p) => itens.push({
    id: `bpg-${p.destino}`, tipo: 'PAGINA', titulo: p.titulo, detalhe: p.detalhe,
    destino: `${base}/${p.destino}`.replace(/\/$/, ''), noContexto: true,
  }))

  return itens
}

/** Atalhos de navegação: pesquisar "financeiro" tem que levar ao financeiro. */
const PAGINAS = [
  { titulo: 'Financeiro', detalhe: 'Saldo, receitas, despesas e orçamento', destino: 'financeiro' },
  { titulo: 'Prestação de contas', detalhe: 'Fechamento mensal publicável', destino: 'financeiro/prestacao-de-contas' },
  { titulo: 'Patrimônio', detalhe: 'Inventário de itens da atlética', destino: 'patrimonio' },
  { titulo: 'Documentos', detalhe: 'Estatuto, atas, contratos e regulamentos', destino: 'documentos' },
  { titulo: 'Transição de gestão', detalhe: 'Checklist de passagem para a próxima diretoria', destino: 'gestao/transicao' },
  { titulo: 'Diretoria', detalhe: 'Organograma e cargos', destino: 'diretoria' },
  { titulo: 'Calendário', detalhe: 'Tudo o que tem data', destino: 'calendario' },
  { titulo: 'Campeonatos', detalhe: 'Chaveamento, tabela e classificação', destino: 'campeonatos' },
  { titulo: 'Fornecedores', detalhe: 'Diretório avaliado pela rede', destino: 'mercado/fornecedores' },
  { titulo: 'Compras coletivas', detalhe: 'Juntar pedido para baixar o preço', destino: 'mercado/compras' },
  { titulo: 'Patrocínios', detalhe: 'Pipeline de captação', destino: 'mercado/patrocinios' },
  { titulo: 'Pedidos de ajuda', detalhe: 'Perguntar para quem já passou por isso', destino: 'rede/ajuda' },
  { titulo: 'Amistosos', detalhe: 'Procurar adversário', destino: 'rede/amistosos' },
  { titulo: 'Base de conhecimento', detalhe: 'Guias, modelos e experiências', destino: 'conhecimento' },
  { titulo: 'Biblioteca de mídia', detalhe: 'Fotos, vídeos e artes', destino: 'comunicacao/midia' },
]

// =====================================================================
// A loja
// =====================================================================

export const lojaDosModulos = {
  // ---------------- Gestão ----------------
  projetos: (slug: string): Promise<Projeto[]> =>
    responder(daAtletica(estado.projetos, slug)),

  projeto: (id: string): Promise<Projeto | null> =>
    responder(estado.projetos.find((p) => p.id === id) ?? null),

  modelosDeProjeto: (): Promise<ModeloDeProjeto[]> => responder(MODELOS_DE_PROJETO),

  criarProjetoDeModelo(slug: string, modeloId: string, nome: string): Promise<Projeto> {
    const modelo = MODELOS_DE_PROJETO.find((m) => m.id === modeloId)
    const projeto: Projeto = {
      id: novoId('pj'),
      atleticaSlug: slug,
      nome,
      resumo: modelo?.descricao ?? 'Projeto novo.',
      tipo: modelo?.tipo ?? 'EVENTO',
      status: 'PLANEJAMENTO',
      area: 'Geral',
      responsavelNome: null,
      responsavelAvatarUrl: null,
      inicioEm: new Date().toISOString(),
      prazo: modelo
        ? new Date(Date.now() + modelo.duracaoEmDias * 864e5).toISOString()
        : null,
      progresso: 0,
      tarefasTotal: modelo?.tarefas.length ?? 0,
      tarefasConcluidas: 0,
      orcamentoPrevisto: null,
      orcamentoGasto: null,
      eventoId: null,
      gestaoAno: 2026,
      marcos: (modelo?.marcos ?? []).map((titulo, i) => ({
        id: novoId(`mc${i}`), titulo, prazo: null, concluido: false,
      })),
      parceiros: [],
      beneficiados: null,
      resultado: null,
    }
    estado.projetos.unshift(projeto)
    return responder(projeto)
  },

  metas: (slug: string): Promise<Meta[]> => responder(daAtletica(estado.metas, slug)),

  reunioes: (slug: string): Promise<Reuniao[]> =>
    responder(daAtletica(estado.reunioes, slug)),

  reuniao: (id: string): Promise<Reuniao | null> =>
    responder(estado.reunioes.find((r) => r.id === id) ?? null),

  decisoes: (slug: string): Promise<Decisao[]> =>
    responder(daAtletica(estado.decisoes, slug)),

  decisao: (id: string): Promise<Decisao | null> =>
    responder(estado.decisoes.find((d) => d.id === id) ?? null),

  /** Voto único: trocar de opção move o voto, não soma um segundo. */
  votar(decisaoId: string, opcaoId: string): Promise<Decisao | null> {
    const decisao = estado.decisoes.find((d) => d.id === decisaoId)
    if (!decisao || decisao.status !== 'EM_VOTACAO') {
      return responder(decisao ?? null)
    }
    if (decisao.meuVoto) {
      const anterior = decisao.opcoes.find((o) => o.id === decisao.meuVoto)
      if (anterior) anterior.votos = Math.max(0, anterior.votos - 1)
      decisao.votantes = Math.max(0, decisao.votantes - 1)
    }
    const escolhida = decisao.opcoes.find((o) => o.id === opcaoId)
    if (escolhida) {
      escolhida.votos += 1
      decisao.votantes += 1
      decisao.meuVoto = opcaoId
    }
    return responder(decisao, 80)
  },

  gestoes: (slug: string): Promise<Gestao[]> => responder(daAtletica(GESTOES, slug)),

  gestao: (slug: string, ano: number): Promise<Gestao | null> =>
    responder(GESTOES.find((g) => g.atleticaSlug === slug && g.ano === ano) ?? null),

  transicao: (slug: string): Promise<Transicao | null> =>
    responder(estado.transicao.atleticaSlug === slug ? estado.transicao : null),

  marcarItemDaTransicao(itemId: string, concluido: boolean): Promise<Transicao> {
    const item = estado.transicao.itens.find((i) => i.id === itemId)
    if (item) item.concluido = concluido
    return responder(estado.transicao, 70)
  },

  documentos: (slug: string): Promise<Documento[]> =>
    responder(daAtletica(estado.documentos, slug)),

  patrimonio: (slug: string): Promise<ItemDePatrimonio[]> =>
    responder(daAtletica(estado.patrimonio, slug)),

  historico: (): Promise<EventoDoHistorico[]> => responder(HISTORICO),

  // ---------------- Financeiro ----------------
  resumoFinanceiro: (slug: string): Promise<ResumoFinanceiro> =>
    responder(resumirFinanceiro(slug)),

  lancamentos: (slug: string): Promise<Lancamento[]> =>
    responder([...daAtletica(estado.lancamentos, slug)].reverse()),

  registrarLancamento(slug: string, dados: Omit<Lancamento, 'id' | 'atleticaSlug'>):
  Promise<Lancamento> {
    const lancamento: Lancamento = { ...dados, id: novoId('ln'), atleticaSlug: slug }
    estado.lancamentos.push(lancamento)
    return responder(lancamento)
  },

  prestacoes: (slug: string): Promise<PrestacaoDeContas[]> =>
    responder(daAtletica(estado.prestacoes, slug)),

  patrocinios: (slug: string): Promise<Patrocinio[]> =>
    responder(daAtletica(estado.patrocinios, slug)),

  patrocinio: (id: string): Promise<Patrocinio | null> =>
    responder(estado.patrocinios.find((p) => p.id === id) ?? null),

  moverPatrocinio(id: string, etapa: Patrocinio['etapa']): Promise<Patrocinio | null> {
    const patrocinio = estado.patrocinios.find((p) => p.id === id)
    if (patrocinio) {
      patrocinio.etapa = etapa
      patrocinio.atualizadoEm = new Date().toISOString()
    }
    return responder(patrocinio ?? null, 70)
  },

  // ---------------- Esportes ----------------
  atletas: (slug: string): Promise<Atleta[]> => responder(daAtletica(ATLETAS, slug)),
  jogos: (slug: string): Promise<Jogo[]> => responder(daAtletica(JOGOS, slug)),
  artilharia: (): Promise<LinhaDeArtilharia[]> => responder(ARTILHARIA),
  viagens: (slug: string): Promise<Viagem[]> => responder(daAtletica(VIAGENS, slug)),
  viagem: (id: string): Promise<Viagem | null> =>
    responder(VIAGENS.find((v) => v.id === id) ?? null),

  // ---------------- Rede ----------------
  feedDaRede: (): Promise<PostDaRede[]> => responder(FEED_DA_REDE),

  pedidosDeAjuda: (): Promise<PedidoDeAjuda[]> => responder(estado.pedidos),

  pedidoDeAjuda: (id: string): Promise<PedidoDeAjuda | null> =>
    responder(estado.pedidos.find((p) => p.id === id) ?? null),

  criarPedidoDeAjuda(
    atletica: AtleticaResumo, autorNome: string,
    titulo: string, corpo: string, area: PedidoDeAjuda['area'],
  ): Promise<PedidoDeAjuda> {
    const pedido: PedidoDeAjuda = {
      id: novoId('pa'), titulo, corpo, area, atletica, autorNome,
      autorAvatarUrl: null, abertoEm: new Date().toISOString(),
      status: 'ABERTO', respostas: [], experienciaId: null,
    }
    estado.pedidos.unshift(pedido)
    return responder(pedido)
  },

  responderPedido(
    pedidoId: string, autorNome: string,
    atletica: AtleticaResumo | null, corpo: string,
  ): Promise<PedidoDeAjuda | null> {
    const pedido = estado.pedidos.find((p) => p.id === pedidoId)
    if (pedido) {
      pedido.respostas.push({
        id: novoId('ra'), autorNome, autorAvatarUrl: null, atletica, corpo,
        quando: new Date().toISOString(), util: 0, maisUtil: false, anexos: [],
      })
      pedido.status = 'RESPONDIDO'
    }
    return responder(pedido ?? null)
  },

  /** Só uma resposta pode ser a mais útil: marcar uma desmarca a anterior. */
  marcarMaisUtil(pedidoId: string, respostaId: string): Promise<PedidoDeAjuda | null> {
    const pedido = estado.pedidos.find((p) => p.id === pedidoId)
    if (pedido) {
      pedido.respostas.forEach((r) => { r.maisUtil = r.id === respostaId })
      pedido.status = 'RESOLVIDO'
    }
    return responder(pedido ?? null, 70)
  },

  comunidades: (): Promise<Comunidade[]> => responder(estado.comunidades),

  comunidade: (id: string): Promise<Comunidade | null> =>
    responder(estado.comunidades.find((c) => c.id === id) ?? null),

  postsDaComunidade: (id: string): Promise<PostDaComunidade[]> =>
    responder(POSTS_DE_COMUNIDADE.filter((p) => p.comunidadeId === id)),

  alternarComunidade(id: string): Promise<Comunidade | null> {
    const comunidade = estado.comunidades.find((c) => c.id === id)
    if (comunidade) {
      comunidade.participo = !comunidade.participo
      comunidade.membros += comunidade.participo ? 1 : -1
    }
    return responder(comunidade ?? null, 70)
  },

  amistosos: (): Promise<Amistoso[]> => responder(estado.amistosos),

  demonstrarInteresseEmAmistoso(id: string, minha: AtleticaResumo): Promise<Amistoso | null> {
    const amistoso = estado.amistosos.find((a) => a.id === id)
    if (amistoso && !amistoso.tenhoInteresse) {
      amistoso.tenhoInteresse = true
      amistoso.interessadas = [...amistoso.interessadas, minha]
    }
    return responder(amistoso ?? null, 70)
  },

  parcerias: (): Promise<Parceria[]> => responder(estado.parcerias),

  demonstrarInteresseEmParceria(id: string, minha: AtleticaResumo): Promise<Parceria | null> {
    const parceria = estado.parcerias.find((p) => p.id === id)
    if (parceria && !parceria.tenhoInteresse) {
      parceria.tenhoInteresse = true
      parceria.interessadas = [...parceria.interessadas, minha]
      if (parceria.etapa === 'DISPONIVEL') parceria.etapa = 'INTERESSE'
    }
    return responder(parceria ?? null, 70)
  },

  mentorias: (): Promise<OfertaDeMentoria[]> => responder(MENTORIAS),
  talentos: (): Promise<Talento[]> => responder(TALENTOS),

  // ---------------- Conhecimento ----------------
  guias: (): Promise<Guia[]> => responder(GUIAS),
  guia: (id: string): Promise<Guia | null> =>
    responder(GUIAS.find((g) => g.id === id) ?? null),
  modelos: (): Promise<Modelo[]> => responder(MODELOS),
  experiencias: (): Promise<Experiencia[]> => responder(EXPERIENCIAS),
  experiencia: (id: string): Promise<Experiencia | null> =>
    responder(EXPERIENCIAS.find((e) => e.id === id) ?? null),

  // ---------------- Mercado ----------------
  fornecedores: (): Promise<Fornecedor[]> => responder(FORNECEDORES),
  fornecedor: (id: string): Promise<Fornecedor | null> =>
    responder(FORNECEDORES.find((f) => f.id === id) ?? null),
  avaliacoesDoFornecedor: (id: string): Promise<AvaliacaoDeFornecedor[]> =>
    responder(AVALIACOES[id] ?? []),

  comprasColetivas: (): Promise<CompraColetiva[]> => responder(estado.compras),
  compraColetiva: (id: string): Promise<CompraColetiva | null> =>
    responder(estado.compras.find((c) => c.id === id) ?? null),

  participarDeCompra(
    id: string, minha: AtleticaResumo, quantidade: number,
  ): Promise<CompraColetiva | null> {
    const compra = estado.compras.find((c) => c.id === id)
    if (compra && !compra.participo) {
      compra.participo = true
      compra.interessados = [
        ...compra.interessados.filter((i) => i.atletica.slug !== minha.slug),
        { atletica: minha, quantidade, confirmado: true },
      ]
      compra.quantidadeAtual = compra.interessados
        .reduce((soma, i) => soma + i.quantidade, 0)
    }
    return responder(compra ?? null, 90)
  },

  oportunidades: (): Promise<Oportunidade[]> => responder(OPORTUNIDADES),

  produtos: (slug: string): Promise<Produto[]> => responder(daAtletica(PRODUTOS, slug)),

  // ---------------- Comunicação ----------------
  noticias: (slug: string): Promise<Noticia[]> =>
    responder(daAtletica(estado.noticias, slug)),
  noticia: (id: string): Promise<Noticia | null> =>
    responder(estado.noticias.find((n) => n.id === id) ?? null),
  campanhas: (slug: string): Promise<Campanha[]> =>
    responder(daAtletica(estado.campanhas, slug)),
  campanha: (id: string): Promise<Campanha | null> =>
    responder(estado.campanhas.find((c) => c.id === id) ?? null),
  midias: (slug: string): Promise<Midia[]> => responder(daAtletica(MIDIAS, slug)),

  // ---------------- Plataforma ----------------
  notificacoes: (): Promise<Notificacao[]> => responder(estado.notificacoes, 90),

  marcarNotificacaoLida(id: string): Promise<Notificacao[]> {
    const alvo = estado.notificacoes.find((n) => n.id === id)
    if (alvo) alvo.lida = true
    return responder(estado.notificacoes, 40)
  },

  marcarTodasLidas(): Promise<Notificacao[]> {
    estado.notificacoes.forEach((n) => { n.lida = true })
    return responder(estado.notificacoes, 40)
  },

  buscar(termo: string, contextoSlug: string): Promise<ResultadoDeBusca[]> {
    const alvo = semAcento(termo.trim())
    if (alvo.length < 2) return responder([], 40)

    const achados = indexar(contextoSlug)
      .filter((r) => semAcento(`${r.titulo} ${r.detalhe}`).includes(alvo))
      // Contexto primeiro: §98. Ordenar, não filtrar.
      .sort((a, b) => Number(b.noContexto) - Number(a.noContexto))
      .slice(0, 24)

    return responder(achados, 70)
  },

  conquistas: (): Promise<Conquista[]> => responder(CONQUISTAS),
  indicadores: (): Promise<Indicador[]> => responder(INDICADORES),
  ranking: (tipo: TipoDeRanking): Promise<LinhaDeRanking[]> => responder(RANKINGS[tipo]),
  painelDaRede: (): Promise<PainelDaRede> => responder(PAINEL_DA_REDE),
  onboarding: (): Promise<PassoDeOnboarding[]> => responder(estado.onboarding),
}
