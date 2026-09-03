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
  AreaDeConhecimento,
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
import { estadoDaDemonstracao } from './loja'
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
  competenciaPorExtenso,
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
  experiencias: Experiencia[]
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
  experiencias: clonar(EXPERIENCIAS),
  notificacoes: clonar(NOTIFICACOES),
  onboarding: clonar(PASSOS_DE_ONBOARDING),
}

function novoId(prefixo: string): string {
  return `${prefixo}-${Math.random().toString(36).slice(2, 9)}`
}

const daAtletica = <T extends { atleticaSlug: string }>(lista: T[], slug: string) =>
  lista.filter((item) => item.atleticaSlug === slug)

/** Contadores e progresso do projeto saem do roteiro, quando há roteiro. */
function recontarProjeto(projeto: Projeto): void {
  if (projeto.passos.length === 0) return
  projeto.tarefasTotal = projeto.passos.length
  projeto.tarefasConcluidas = projeto.passos.filter((p) => p.concluido).length
  projeto.progresso = projeto.tarefasConcluidas / projeto.passos.length
}

/** "2026-09" vira "Setembro de 2026" — inclusive para meses fora da semente. */
function rotuloDaCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number)
  if (!ano || !mes) return competencia
  const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
    .format(new Date(ano, mes - 1, 15))
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`
}

function somarPorNatureza(lista: Lancamento[]): { receitas: number; despesas: number } {
  const somar = (natureza: Lancamento['natureza']) => lista
    .filter((l) => l.natureza === natureza)
    .reduce((s, l) => s + l.valor, 0)
  return { receitas: somar('RECEITA'), despesas: somar('DESPESA') }
}

/** Igual a `loja.ts`: quem avisa que o estado mudou, sem fechar ciclo. */
let notificarMudanca: () => void = () => {}

export function observarMudancasDosModulos(fn: () => void): void {
  notificarMudanca = fn
}

/** Resposta de uma operação que ALTERA o estado: agenda a gravação. */
function responderMudanca<T>(valor: T, ms = 160): Promise<T> {
  notificarMudanca()
  return responder(valor, ms)
}

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

  // Sem lançamento nenhum não existe orçamento aprovado — e mostrar as onze
  // rubricas com 0% realizado faria uma atlética recém-criada parecer que
  // aprovou R$ 126 mil em assembleia.
  const orcamento = lancamentos.length === 0 ? [] :
    (Object.keys(ORCAMENTO_PREVISTO) as CategoriaFinanceira[])
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
// Persistência: registros meus, e os marcadores pessoais na rede
// =====================================================================

export interface FatiaDosModulos {
  projetos: unknown[]
  metas: unknown[]
  reunioes: unknown[]
  decisoes: unknown[]
  documentos: unknown[]
  patrimonio: unknown[]
  lancamentos: unknown[]
  prestacoes: unknown[]
  patrocinios: unknown[]
  noticias: unknown[]
  campanhas: unknown[]
  /** Experiências que a minha atlética publicou na rede. */
  minhasExperiencias: unknown[]
  /** Pedidos que a minha atlética abriu. */
  meusPedidos: unknown[]
  /** Respostas minhas em pedidos de outras atléticas: `{ pedidoId: resposta[] }`. */
  respostasEmOutros: Record<string, unknown[]>
  /** Marcadores pessoais espalhados pelo conteúdo compartilhado. */
  comunidadesQueParticipo: string[]
  parceriasComInteresse: string[]
  amistososComInteresse: string[]
  comprasQueParticipo: { id: string; quantidade: number }[]
  votos: Record<string, string>
  notificacoesLidas: string[]
  itensDaTransicaoConcluidos: string[]
}

/**
 * O que destes módulos pertence a quem está usando.
 *
 * <p>Dois tipos de coisa. Os <strong>registros</strong> — projeto, lançamento,
 * decisão — são meus quando o `atleticaSlug` é meu. Os <strong>marcadores
 * pessoais</strong> vivem em conteúdo compartilhado: a comunidade é da rede,
 * mas "eu participo" é meu. Guardar a comunidade inteira congelaria o número
 * de membros dela; guardar só o marcador preserva as duas coisas.</p>
 */
export function exportarFatiaDosModulos(meus: Set<string>): FatiaDosModulos {
  const daMinha = <T extends { atleticaSlug: string }>(lista: T[]) =>
    lista.filter((item) => meus.has(item.atleticaSlug))

  return {
    projetos: daMinha(estado.projetos),
    metas: daMinha(estado.metas),
    reunioes: daMinha(estado.reunioes),
    decisoes: daMinha(estado.decisoes),
    documentos: daMinha(estado.documentos),
    patrimonio: daMinha(estado.patrimonio),
    lancamentos: daMinha(estado.lancamentos),
    prestacoes: daMinha(estado.prestacoes),
    patrocinios: daMinha(estado.patrocinios),
    noticias: daMinha(estado.noticias),
    campanhas: daMinha(estado.campanhas),
    minhasExperiencias: estado.experiencias.filter((e) => meus.has(e.atletica.slug)),

    meusPedidos: estado.pedidos.filter((p) => meus.has(p.atletica.slug)),
    respostasEmOutros: Object.fromEntries(
      estado.pedidos
        .filter((p) => !meus.has(p.atletica.slug))
        .map((p) => [
          p.id,
          p.respostas.filter((r) => r.atletica !== null && meus.has(r.atletica.slug)),
        ])
        .filter(([, respostas]) => (respostas as unknown[]).length > 0)),

    comunidadesQueParticipo: estado.comunidades.filter((c) => c.participo).map((c) => c.id),
    parceriasComInteresse: estado.parcerias.filter((p) => p.tenhoInteresse).map((p) => p.id),
    amistososComInteresse: estado.amistosos.filter((a) => a.tenhoInteresse).map((a) => a.id),
    comprasQueParticipo: estado.compras
      .filter((c) => c.participo)
      .map((c) => ({
        id: c.id,
        quantidade: c.interessados.find((i) => meus.has(i.atletica.slug))?.quantidade ?? 0,
      })),
    votos: Object.fromEntries(
      estado.decisoes
        .filter((d) => d.meuVoto !== null)
        .map((d) => [d.id, d.meuVoto as string])),
    notificacoesLidas: estado.notificacoes.filter((n) => n.lida).map((n) => n.id),
    itensDaTransicaoConcluidos: estado.transicao.itens
      .filter((i) => i.concluido).map((i) => i.id),
  }
}

/** Recoloca a fatia por cima da semente recém-carregada. */
export function importarFatiaDosModulos(
  fatia: Partial<FatiaDosModulos>,
  minhas: AtleticaResumo[],
): void {
  // A semente traz marcadores pessoais ligados — a demonstração preenchida
  // precisa deles. Quem volta com uma conta própria não herda nada disso:
  // a participação de verdade dessa pessoa está na fatia, e só nela. Sem
  // zerar antes, recarregar marcaria "entre numa comunidade" como feito.
  lojaDosModulos.zerarEstadoPessoal()
  estado.projetos.push(...(fatia.projetos ?? []) as Projeto[])
  estado.metas.push(...(fatia.metas ?? []) as Meta[])
  estado.reunioes.push(...(fatia.reunioes ?? []) as Reuniao[])
  estado.decisoes.push(...(fatia.decisoes ?? []) as Decisao[])
  estado.documentos.push(...(fatia.documentos ?? []) as Documento[])
  estado.patrimonio.push(...(fatia.patrimonio ?? []) as ItemDePatrimonio[])
  estado.lancamentos.push(...(fatia.lancamentos ?? []) as Lancamento[])
  estado.prestacoes.push(...(fatia.prestacoes ?? []) as PrestacaoDeContas[])
  estado.patrocinios.push(...(fatia.patrocinios ?? []) as Patrocinio[])
  estado.noticias.push(...(fatia.noticias ?? []) as Noticia[])
  estado.campanhas.push(...(fatia.campanhas ?? []) as Campanha[])
  estado.experiencias.unshift(...(fatia.minhasExperiencias ?? []) as Experiencia[])
  estado.pedidos.unshift(...(fatia.meusPedidos ?? []) as PedidoDeAjuda[])

  Object.entries(fatia.respostasEmOutros ?? {}).forEach(([pedidoId, respostas]) => {
    const pedido = estado.pedidos.find((p) => p.id === pedidoId)
    if (pedido) {
      pedido.respostas.push(...respostas as PedidoDeAjuda['respostas'])
      pedido.status = 'RESPONDIDO'
    }
  })

  // Os marcadores pessoais são reaplicados como se a pessoa tivesse clicado
  // de novo — inclusive somando membro e quantidade, para os números da rede
  // baterem com o que ela vê.
  const marcar = <T extends { id: string }>(lista: T[], ids: string[] | undefined,
                                            aplicar: (item: T) => void) => {
    (ids ?? []).forEach((id) => {
      const item = lista.find((x) => x.id === id)
      if (item) aplicar(item)
    })
  }

  marcar(estado.comunidades, fatia.comunidadesQueParticipo, (c) => {
    c.participo = true
    c.membros += 1
  })
  marcar(estado.parcerias, fatia.parceriasComInteresse, (p) => {
    p.tenhoInteresse = true
    if (minhas[0] && !p.interessadas.some((a) => a.slug === minhas[0].slug)) {
      p.interessadas = [...p.interessadas, minhas[0]]
    }
    if (p.etapa === 'DISPONIVEL') p.etapa = 'INTERESSE'
  })
  marcar(estado.amistosos, fatia.amistososComInteresse, (a) => {
    a.tenhoInteresse = true
    if (minhas[0] && !a.interessadas.some((x) => x.slug === minhas[0].slug)) {
      a.interessadas = [...a.interessadas, minhas[0]]
    }
  })
  marcar(estado.notificacoes, fatia.notificacoesLidas, (n) => { n.lida = true })
  marcar(estado.transicao.itens, fatia.itensDaTransicaoConcluidos,
    (i) => { i.concluido = true })

  ;(fatia.comprasQueParticipo ?? []).forEach(({ id, quantidade }) => {
    const compra = estado.compras.find((c) => c.id === id)
    if (compra && minhas[0]) {
      compra.participo = true
      compra.interessados = [
        ...compra.interessados.filter((i) => i.atletica.slug !== minhas[0].slug),
        { atletica: minhas[0], quantidade, confirmado: true },
      ]
      compra.quantidadeAtual = compra.interessados.reduce((s, i) => s + i.quantidade, 0)
    }
  })

  Object.entries(fatia.votos ?? {}).forEach(([decisaoId, opcaoId]) => {
    const decisao = estado.decisoes.find((d) => d.id === decisaoId)
    const opcao = decisao?.opcoes.find((o) => o.id === opcaoId)
    if (decisao && opcao && decisao.meuVoto === null) {
      opcao.votos += 1
      decisao.votantes += 1
      decisao.meuVoto = opcaoId
    }
  })
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

  estado.experiencias.forEach((e) => itens.push({
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
  /**
   * Apaga o que é "meu" no estado compartilhado da rede.
   *
   * <p>Comunidade em que participo, parceria e amistoso em que demonstrei
   * interesse, compra em que entrei, voto que dei: tudo isso vem marcado no
   * seed porque a demonstração preenchida representa uma atlética com
   * história. Numa conta recém-criada, esses marcadores seriam a plataforma
   * afirmando que a pessoa fez coisas que ela não fez — e o checklist de
   * primeiros passos já nasceria com item marcado sozinho.</p>
   *
   * <p>O conteúdo da rede continua: as comunidades, as parcerias e as compras
   * seguem existindo, e é isso que dá o que fazer no primeiro dia. O que zera
   * é a minha participação nelas.</p>
   */
  zerarEstadoPessoal(): void {
    estado.comunidades.forEach((c) => {
      if (c.participo) {
        c.participo = false
        c.membros = Math.max(0, c.membros - 1)
      }
    })
    estado.parcerias.forEach((p) => { p.tenhoInteresse = false })
    estado.amistosos.forEach((a) => { a.tenhoInteresse = false })
    estado.compras.forEach((c) => { c.participo = false })
    estado.decisoes.forEach((d) => { d.meuVoto = null })
    estado.notificacoes.forEach((n) => { n.lida = false })
  },

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
      passos: (modelo?.tarefas ?? []).map((titulo, i) => ({
        id: novoId(`ps${i}`), titulo, concluido: false,
      })),
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
    return responderMudanca(projeto)
  },

  /**
   * Marcar um passo do roteiro.
   *
   * <p>O progresso do projeto sai daqui, e não de digitação: um percentual
   * que alguém escreve à mão é um percentual que ninguém confere. Projeto
   * montado à mão, sem roteiro, mantém os contadores que já tinha — não há
   * de onde derivar.</p>
   */
  alternarPassoDoProjeto(projetoId: string, passoId: string): Promise<Projeto | null> {
    const projeto = estado.projetos.find((p) => p.id === projetoId)
    const passo = projeto?.passos.find((x) => x.id === passoId)
    if (projeto && passo) {
      passo.concluido = !passo.concluido
      recontarProjeto(projeto)
    }
    return responderMudanca(projeto ?? null, 80)
  },

  /** O marco é a entrega visível; o passo é o trabalho para chegar nela. */
  alternarMarcoDoProjeto(projetoId: string, marcoId: string): Promise<Projeto | null> {
    const projeto = estado.projetos.find((p) => p.id === projetoId)
    const marco = projeto?.marcos.find((m) => m.id === marcoId)
    if (marco) marco.concluido = !marco.concluido
    return responderMudanca(projeto ?? null, 80)
  },

  /** Encerrar o projeto exige escrever o resultado — é o que vira aprendizado. */
  encerrarProjeto(projetoId: string, resultado: string): Promise<Projeto | null> {
    const projeto = estado.projetos.find((p) => p.id === projetoId)
    if (projeto) {
      projeto.status = 'CONCLUIDO'
      projeto.resultado = resultado.trim() || null
    }
    return responderMudanca(projeto ?? null)
  },

  metas: (slug: string): Promise<Meta[]> => responder(daAtletica(estado.metas, slug)),

  /**
   * Uma meta da gestão (§20).
   *
   * <p>Alvo e unidade são obrigatórios porque meta sem número é intenção:
   * "melhorar a comunicação" não fecha o ano nem prova nada na transição.</p>
   */
  criarMeta(slug: string, dados: {
    titulo: string
    area: string
    alvo: number
    unidade: string
    prazo: string | null
  }): Promise<Meta> {
    const meta: Meta = {
      id: novoId('mt'),
      atleticaSlug: slug,
      gestaoAno: new Date().getFullYear(),
      titulo: dados.titulo,
      area: dados.area,
      alvo: dados.alvo,
      atual: 0,
      unidade: dados.unidade,
      prazo: dados.prazo,
    }
    estado.metas.push(meta)
    return responderMudanca(meta)
  },

  /** O acompanhamento é manual de propósito: número que se move sozinho ninguém confere. */
  atualizarProgressoDaMeta(id: string, atual: number): Promise<Meta | null> {
    const meta = estado.metas.find((m) => m.id === id)
    if (meta) meta.atual = Math.max(0, atual)
    return responderMudanca(meta ?? null, 80)
  },

  excluirMeta(id: string): Promise<void> {
    const i = estado.metas.findIndex((m) => m.id === id)
    if (i >= 0) estado.metas.splice(i, 1)
    return responderMudanca(undefined, 80)
  },

  reunioes: (slug: string): Promise<Reuniao[]> =>
    responder(daAtletica(estado.reunioes, slug)),

  reuniao: (id: string): Promise<Reuniao | null> =>
    responder(estado.reunioes.find((r) => r.id === id) ?? null),

  /**
   * Agendar uma reunião com pauta (§21).
   *
   * <p>A pauta entra no agendamento, não na hora. Reunião cuja pauta se
   * descobre na sala é a reunião que termina sem decisão — que é o problema
   * que este módulo existe para resolver.</p>
   */
  agendarReuniao(slug: string, dados: {
    titulo: string
    inicioEm: string
    duracaoEmMinutos: number
    local: string | null
    linkOnline: string | null
    pautas: string[]
    convocados: { nome: string; avatarUrl: string | null }[]
  }): Promise<Reuniao> {
    const pautas = dados.pautas.filter((p) => p.trim() !== '')
    const reuniao: Reuniao = {
      id: novoId('re'),
      atleticaSlug: slug,
      titulo: dados.titulo,
      inicioEm: dados.inicioEm,
      duracaoEmMinutos: dados.duracaoEmMinutos,
      local: dados.local,
      linkOnline: dados.linkOnline,
      status: 'AGENDADA',
      convocados: dados.convocados.map((c) => ({ ...c, confirmado: false })),
      pautas: pautas.map((titulo) => ({
        id: novoId('pa'), titulo, responsavel: null,
        minutos: Math.max(5, Math.round(dados.duracaoEmMinutos / pautas.length)),
        decisaoId: null,
      })),
      ata: null,
      tarefasGeradas: 0,
      documentos: [],
    }
    estado.reunioes.unshift(reuniao)
    return responderMudanca(reuniao)
  },

  /** Escrever a ata é o que encerra a reunião — sem ata ela fica aberta. */
  registrarAta(id: string, ata: string): Promise<Reuniao | null> {
    const reuniao = estado.reunioes.find((r) => r.id === id)
    if (reuniao) {
      reuniao.ata = ata
      reuniao.status = 'REALIZADA'
    }
    return responderMudanca(reuniao ?? null)
  },

  confirmarPresenca(id: string, nome: string): Promise<Reuniao | null> {
    const reuniao = estado.reunioes.find((r) => r.id === id)
    const convocado = reuniao?.convocados.find((c) => c.nome === nome)
    if (convocado) convocado.confirmado = !convocado.confirmado
    return responderMudanca(reuniao ?? null, 80)
  },

  decisoes: (slug: string): Promise<Decisao[]> =>
    responder(daAtletica(estado.decisoes, slug)),

  decisao: (id: string): Promise<Decisao | null> =>
    responder(estado.decisoes.find((d) => d.id === id) ?? null),

  /**
   * Abrir uma decisão para votação (§22).
   *
   * <p>Nasce já em votação: rascunho de decisão é decisão que ninguém toma.
   * O quórum é declarado na abertura para não ser ajustado depois em função
   * do resultado.</p>
   */
  abrirDecisao(slug: string, dados: {
    titulo: string
    contexto: string
    opcoes: string[]
    quorum: number
    fechaEm: string | null
    reuniaoId?: string | null
  }): Promise<Decisao> {
    const reuniao = dados.reuniaoId
      ? estado.reunioes.find((r) => r.id === dados.reuniaoId) ?? null
      : null
    const decisao: Decisao = {
      id: novoId('dc'),
      atleticaSlug: slug,
      titulo: dados.titulo,
      contexto: dados.contexto,
      status: 'EM_VOTACAO',
      reuniaoId: reuniao?.id ?? null,
      reuniaoTitulo: reuniao?.titulo ?? null,
      abertaEm: new Date().toISOString(),
      fechaEm: dados.fechaEm,
      opcoes: dados.opcoes
        .filter((o) => o.trim() !== '')
        .map((rotulo) => ({ id: novoId('op'), rotulo, detalhe: null, votos: 0 })),
      escolhidaId: null,
      responsavelNome: null,
      quorum: dados.quorum,
      votantes: 0,
      meuVoto: null,
    }
    estado.decisoes.unshift(decisao)
    return responderMudanca(decisao)
  },

  /**
   * Encerrar a votação.
   *
   * <p>Sem quórum a decisão fica adiada, não rejeitada: são coisas
   * diferentes na hora de reabrir o assunto no ano seguinte.</p>
   */
  encerrarDecisao(id: string): Promise<Decisao | null> {
    const decisao = estado.decisoes.find((d) => d.id === id)
    if (decisao && decisao.status === 'EM_VOTACAO') {
      if (decisao.votantes < decisao.quorum) {
        decisao.status = 'ADIADA'
      } else {
        const vencedora = [...decisao.opcoes].sort((a, b) => b.votos - a.votos)[0]
        decisao.escolhidaId = vencedora?.id ?? null
        decisao.status = 'APROVADA'
      }
      decisao.fechaEm = new Date().toISOString()
    }
    return responderMudanca(decisao ?? null)
  },

  /** Voto único: trocar de opção move o voto, não soma um segundo. */
  votar(decisaoId: string, opcaoId: string): Promise<Decisao | null> {
    const decisao = estado.decisoes.find((d) => d.id === decisaoId)
    if (!decisao || decisao.status !== 'EM_VOTACAO') {
      return responderMudanca(decisao ?? null)
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
    return responderMudanca(decisao, 80)
  },

  gestoes: (slug: string): Promise<Gestao[]> => responder(daAtletica(GESTOES, slug)),

  gestao: (slug: string, ano: number): Promise<Gestao | null> =>
    responder(GESTOES.find((g) => g.atleticaSlug === slug && g.ano === ano) ?? null),

  transicao: (slug: string): Promise<Transicao | null> =>
    responder(estado.transicao.atleticaSlug === slug ? estado.transicao : null),

  marcarItemDaTransicao(itemId: string, concluido: boolean): Promise<Transicao> {
    const item = estado.transicao.itens.find((i) => i.id === itemId)
    if (item) item.concluido = concluido
    return responderMudanca(estado.transicao, 70)
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
    return responderMudanca(lancamento)
  },

  /**
   * Os meses que já têm movimento e ainda não foram fechados.
   *
   * <p>A tela não pede à pessoa que digite uma competência: ela oferece os
   * meses que existem. Fechar um mês é conferir o que já está lançado, não
   * redigitá-lo.</p>
   */
  competenciasEmAberto(slug: string): Promise<{
    competencia: string
    rotulo: string
    receitas: number
    despesas: number
    saldo: number
    lancamentos: number
  }[]> {
    const fechadas = new Set(daAtletica(estado.prestacoes, slug).map((p) => p.competencia))
    const porMes = new Map<string, Lancamento[]>()
    daAtletica(estado.lancamentos, slug)
      .filter((l) => l.situacao === 'CONFIRMADO' && !fechadas.has(l.competencia))
      .forEach((l) => porMes.set(l.competencia, [...(porMes.get(l.competencia) ?? []), l]))

    return responder([...porMes.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([competencia, lista]) => {
        const { receitas, despesas } = somarPorNatureza(lista)
        return {
          competencia,
          rotulo: rotuloDaCompetencia(competencia),
          receitas,
          despesas,
          saldo: receitas - despesas,
          lancamentos: lista.length,
        }
      }))
  },

  /**
   * Fechar o mês (§28).
   *
   * <p>Nasce fechada e privada. Publicar é um segundo gesto, e é assim de
   * propósito: quem fecha confere primeiro, e só depois decide para quem
   * aquilo fica visível.</p>
   */
  fecharPrestacao(slug: string, competencia: string): Promise<PrestacaoDeContas> {
    const lancamentos = daAtletica(estado.lancamentos, slug)
      .filter((l) => l.competencia === competencia && l.situacao === 'CONFIRMADO')
    const { receitas, despesas } = somarPorNatureza(lancamentos)

    const prestacao: PrestacaoDeContas = {
      id: novoId('pc'),
      atleticaSlug: slug,
      competencia,
      rotulo: rotuloDaCompetencia(competencia),
      receitas,
      despesas,
      saldo: receitas - despesas,
      publicada: false,
      publicaParaMembros: false,
      publicaParaTodos: false,
      aprovadaEm: new Date().toISOString(),
      documentos: [],
      linhas: lancamentos.map((l) => ({
        descricao: l.descricao, natureza: l.natureza, valor: l.valor,
      })),
    }
    estado.prestacoes.unshift(prestacao)
    return responderMudanca(prestacao)
  },

  /** Para membros, ou para todo mundo. Abrir para fora é decisão da diretoria. */
  publicarPrestacao(id: string, alcance: 'MEMBROS' | 'TODOS'): Promise<PrestacaoDeContas | null> {
    const prestacao = estado.prestacoes.find((p) => p.id === id)
    if (prestacao) {
      prestacao.publicada = true
      prestacao.publicaParaMembros = true
      prestacao.publicaParaTodos = alcance === 'TODOS'
    }
    return responderMudanca(prestacao ?? null)
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
    return responderMudanca(patrocinio ?? null, 70)
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
    return responderMudanca(pedido)
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
    return responderMudanca(pedido ?? null)
  },

  /** Só uma resposta pode ser a mais útil: marcar uma desmarca a anterior. */
  marcarMaisUtil(pedidoId: string, respostaId: string): Promise<PedidoDeAjuda | null> {
    const pedido = estado.pedidos.find((p) => p.id === pedidoId)
    if (pedido) {
      pedido.respostas.forEach((r) => { r.maisUtil = r.id === respostaId })
      pedido.status = 'RESOLVIDO'
    }
    return responderMudanca(pedido ?? null, 70)
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
    return responderMudanca(comunidade ?? null, 70)
  },

  amistosos: (): Promise<Amistoso[]> => responder(estado.amistosos),

  demonstrarInteresseEmAmistoso(id: string, minha: AtleticaResumo): Promise<Amistoso | null> {
    const amistoso = estado.amistosos.find((a) => a.id === id)
    if (amistoso && !amistoso.tenhoInteresse) {
      amistoso.tenhoInteresse = true
      amistoso.interessadas = [...amistoso.interessadas, minha]
    }
    return responderMudanca(amistoso ?? null, 70)
  },

  parcerias: (): Promise<Parceria[]> => responder(estado.parcerias),

  demonstrarInteresseEmParceria(id: string, minha: AtleticaResumo): Promise<Parceria | null> {
    const parceria = estado.parcerias.find((p) => p.id === id)
    if (parceria && !parceria.tenhoInteresse) {
      parceria.tenhoInteresse = true
      parceria.interessadas = [...parceria.interessadas, minha]
      if (parceria.etapa === 'DISPONIVEL') parceria.etapa = 'INTERESSE'
    }
    return responderMudanca(parceria ?? null, 70)
  },

  mentorias: (): Promise<OfertaDeMentoria[]> => responder(MENTORIAS),
  talentos: (): Promise<Talento[]> => responder(TALENTOS),

  // ---------------- Conhecimento ----------------
  guias: (): Promise<Guia[]> => responder(GUIAS),
  guia: (id: string): Promise<Guia | null> =>
    responder(GUIAS.find((g) => g.id === id) ?? null),
  modelos: (): Promise<Modelo[]> => responder(MODELOS),
  experiencias: (): Promise<Experiencia[]> => responder(estado.experiencias),
  experiencia: (id: string): Promise<Experiencia | null> =>
    responder(estado.experiencias.find((e) => e.id === id) ?? null),

  /**
   * Registrar o que deu certo e o que não deu (§37).
   *
   * <p>O "não funcionou" é o campo que dá valor ao resto: relato só de
   * acerto vira propaganda, e propaganda ninguém lê para aprender.</p>
   */
  publicarExperiencia(minha: AtleticaResumo, dados: {
    titulo: string
    area: AreaDeConhecimento
    contexto: string
    funcionou: string[]
    naoFuncionou: string[]
    fariaDiferente: string[]
    custo: number | null
    publico: number | null
  }): Promise<Experiencia> {
    const experiencia: Experiencia = {
      id: novoId('ex'),
      titulo: dados.titulo,
      atletica: minha,
      area: dados.area,
      quando: competenciaPorExtenso(0),
      contexto: dados.contexto,
      funcionou: dados.funcionou,
      naoFuncionou: dados.naoFuncionou,
      fariaDiferente: dados.fariaDiferente,
      custo: dados.custo,
      publico: dados.publico,
      util: 0,
      respostas: 0,
    }
    estado.experiencias.unshift(experiencia)
    return responderMudanca(experiencia)
  },

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
    return responderMudanca(compra ?? null, 90)
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
  /**
   * As notificações que dizem respeito a esta atlética.
   *
   * <p>As de `atleticaSlug` nulo são da rede e valem para todo mundo — é o
   * que faz uma atlética recém-criada ter o que ver aqui sem inventar
   * pendência que ela não tem.</p>
   */
  notificacoes: (slug: string): Promise<Notificacao[]> =>
    responder(
      estado.notificacoes.filter(
        (n) => n.atleticaSlug === null || n.atleticaSlug === slug),
      90),

  marcarNotificacaoLida(id: string): Promise<Notificacao[]> {
    const alvo = estado.notificacoes.find((n) => n.id === id)
    if (alvo) alvo.lida = true
    return responderMudanca(estado.notificacoes, 40)
  },

  marcarTodasLidas(): Promise<Notificacao[]> {
    estado.notificacoes.forEach((n) => { n.lida = true })
    return responderMudanca(estado.notificacoes, 40)
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

  /**
   * As conquistas da atlética, derivadas do que ela realmente fez.
   *
   * <p>Eram constantes com data cravada. Para a atlética de exemplo isso
   * passava; para uma atlética criada há dois minutos, a tela dizia
   * "primeiro campeonato — há 280 dias". Marco que não aconteceu não pode
   * aparecer como alcançado.</p>
   */
  conquistas(slug: string): Promise<Conquista[]> {
    const eventos = estadoDaDemonstracao.resumoDeEventos(slug)
    const projetos = daAtletica(estado.projetos, slug)
    const prestacoes = daAtletica(estado.prestacoes, slug)
    const torneios = estadoDaDemonstracao.torneiosDe(slug)
    const social = projetos.filter((p) => p.tipo === 'SOCIAL' && p.status === 'CONCLUIDO')
    const contribuiu = estado.experiencias.some((e) => e.atletica.slug === slug)
      || GUIAS.some((g) => g.autorAtletica?.slug === slug)
    const transicao = estado.transicao.atleticaSlug === slug
      && estado.transicao.itens.every((i) => i.concluido)
    const mentora = MENTORIAS.some((m) => m.atletica.slug === slug)

    const alcancada: Record<string, boolean> = {
      'cq-01': eventos.total > 0,
      'cq-02': torneios.length > 0,
      'cq-03': PARCERIAS.some(
        (p) => p.proponente?.slug === slug || p.interessadas.some((a) => a.slug === slug)),
      'cq-04': social.length > 0,
      'cq-05': contribuiu,
      'cq-06': prestacoes.filter((p) => p.publicada).length >= 3,
      'cq-07': transicao,
      'cq-08': mentora,
    }

    return responder(CONQUISTAS.map((c) => ({
      ...c,
      conquistadaEm: alcancada[c.id] ? c.conquistadaEm : null,
    })))
  },

  /**
   * Os indicadores da atlética contra a média da rede.
   *
   * <p>O valor vem do estado; a média continua constante, porque ela
   * representa a rede inteira e não é calculável a partir de seis atléticas
   * de exemplo. Quando o valor é zero, a variação some: "+16% de nada" não
   * quer dizer coisa alguma.</p>
   */
  indicadores(slug: string): Promise<Indicador[]> {
    const eventos = estadoDaDemonstracao.resumoDeEventos(slug)
    const membros = estadoDaDemonstracao.membrosDe(slug)
      .filter((m) => m.situacao === 'ATIVO').length
    const equipes = estadoDaDemonstracao.equipesDe(slug).length
    const projetos = daAtletica(estado.projetos, slug)
    const receita = daAtletica(estado.lancamentos, slug)
      .filter((l) => l.natureza === 'RECEITA' && l.situacao === 'CONFIRMADO')
      .reduce((s, l) => s + l.valor, 0)
    const patrocinios = daAtletica(estado.patrocinios, slug)
      .filter((p) => p.etapa === 'ATIVO').length
    const contribuicoes = estado.experiencias.filter((e) => e.atletica.slug === slug).length
      + GUIAS.filter((g) => g.autorAtletica?.slug === slug).length

    const valores: Record<string, number> = {
      'Membros ativos': membros,
      'Eventos no ano': eventos.total,
      'Participação média por evento': eventos.publicados === 0
        ? 0 : Math.round(eventos.inscritos / eventos.publicados),
      'Taxa de presença': eventos.inscritos === 0
        ? 0 : Math.round((eventos.presentes / eventos.inscritos) * 100),
      'Projetos concluídos': projetos.filter((p) => p.status === 'CONCLUIDO').length,
      'Receita no ano': receita,
      'Patrocinadores ativos': patrocinios,
      'Equipes ativas': equipes,
      'Ações sociais': projetos.filter(
        (p) => p.tipo === 'SOCIAL' && p.status === 'CONCLUIDO').length,
      'Contribuições à base de conhecimento': contribuicoes,
    }

    return responder(INDICADORES.map((ind) => {
      const valor = valores[ind.rotulo] ?? ind.valor
      return { ...ind, valor, variacao: valor === 0 ? null : ind.variacao }
    }))
  },

  ranking: (tipo: TipoDeRanking): Promise<LinhaDeRanking[]> => responder(RANKINGS[tipo]),
  painelDaRede: (): Promise<PainelDaRede> => responder(PAINEL_DA_REDE),

  /**
   * Os primeiros passos, marcados pelo que já existe de verdade.
   *
   * <p>Checklist que vem pré-marcado não é checklist: é decoração. Aqui cada
   * passo consulta o módulo correspondente, então marcar o item depende de
   * fazer a coisa.</p>
   */
  onboarding(slug: string): Promise<PassoDeOnboarding[]> {
    const membros = estadoDaDemonstracao.membrosDe(slug)
    const eventos = estadoDaDemonstracao.resumoDeEventos(slug)
    const atletica = ATLETICAS.find((a) => a.slug === slug)

    const feito: Record<string, boolean> = {
      'ob-01': Boolean(atletica?.cidade && atletica?.instituicao),
      'ob-02': membros.filter((m) => m.papel !== 'MEMBRO').length > 1,
      'ob-03': membros.length > 1,
      'ob-04': daAtletica(estado.metas, slug).length > 0,
      'ob-05': estadoDaDemonstracao.equipesDe(slug).length > 0,
      'ob-06': daAtletica(estado.projetos, slug).length > 0,
      'ob-07': eventos.publicados > 0,
      'ob-08': estado.comunidades.some((c) => c.participo),
      'ob-09': daAtletica(estado.prestacoes, slug).length > 0,
      'ob-10': estado.experiencias.some((e) => e.atletica.slug === slug),
    }

    return responder(estado.onboarding.map(
      (p) => ({ ...p, concluido: feito[p.id] ?? p.concluido })))
  },
}
