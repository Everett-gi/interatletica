/**
 * Dados de demonstração do financeiro e dos patrocínios.
 *
 * <p>Os lançamentos são a fonte: saldo, orçamento e prestação de contas são
 * <strong>calculados</strong> a partir deles em `loja.ts`, e não digitados
 * à parte. É o que garante que registrar uma despesa na demonstração mude
 * o saldo do painel — sem isso, cada tela contaria uma história diferente.</p>
 */

import type { Lancamento, Patrocinio, PrestacaoDeContas } from '../api/tipos-financeiro'
import { dias } from './dados'

/**
 * Competência no formato AAAA-MM, contada a partir do mês corrente.
 *
 * <p>Relativa, e não fixa, pela mesma razão de `AGORA`: uma demonstração
 * aberta em dezembro não pode mostrar o "mês atual" como agosto.</p>
 */
function mes(desloc: number): string {
  const base = new Date()
  base.setDate(15)
  base.setMonth(base.getMonth() + desloc)
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`
}

function nomeDoMes(desloc: number): string {
  const base = new Date()
  base.setDate(15)
  base.setMonth(base.getMonth() + desloc)
  const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(base)
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

/** Rótulo curto de cada competência, para eixo de gráfico e cabeçalho. */
export const ROTULO_DO_MES: Record<string, string> = Object.fromEntries(
  [-5, -4, -3, -2, -1, 0, 1].map((d) => [mes(d), nomeDoMes(d)]))

/** "Agosto de 2026" — o título de uma prestação de contas fechada. */
export function competenciaPorExtenso(desloc: number): string {
  const base = new Date()
  base.setDate(15)
  base.setMonth(base.getMonth() + desloc)
  return `${nomeDoMes(desloc)} de ${base.getFullYear()}`
}

let sequencia = 0
function lanc(
  natureza: Lancamento['natureza'],
  descricao: string,
  categoria: Lancamento['categoria'],
  valor: number,
  competencia: string,
  extras: Partial<Lancamento> = {},
): Lancamento {
  sequencia += 1
  return {
    id: `ln-${String(sequencia).padStart(3, '0')}`,
    atleticaSlug: 'dragoes',
    natureza,
    descricao,
    categoria,
    valor,
    competencia,
    situacao: 'CONFIRMADO',
    eventoId: null,
    eventoTitulo: null,
    projetoId: null,
    responsavelNome: 'Diego Marinho',
    comprovanteNome: null,
    observacao: null,
    ...extras,
  }
}

export const LANCAMENTOS: Lancamento[] = [
  // ---- Os três primeiros meses: a base do caixa ----
  lanc('RECEITA', 'Cota de patrocínio — Ótica Vale', 'PATROCINIO', 6000, mes(-5), { comprovanteNome: 'nf-otica-vale.pdf' }),
  lanc('RECEITA', `Contribuição de membros — ${nomeDoMes(-5).toLowerCase()}`, 'MENSALIDADE', 1880, mes(-5)),
  lanc('DESPESA', 'Aluguel da sala da atlética', 'ESTRUTURA', 800, mes(-5)),
  lanc('DESPESA', 'Reposição de material esportivo', 'ESTRUTURA', 1240, mes(-5), { comprovanteNome: 'nf-material-esportivo.pdf' }),

  lanc('RECEITA', `Contribuição de membros — ${nomeDoMes(-4).toLowerCase()}`, 'MENSALIDADE', 1920, mes(-4)),
  lanc('RECEITA', 'Rifa da camisa nova', 'DOACAO', 2450, mes(-4)),
  lanc('DESPESA', 'Aluguel da sala da atlética', 'ESTRUTURA', 800, mes(-4)),
  lanc('DESPESA', 'Uniformes de vôlei feminino', 'UNIFORME', 2880, mes(-4), { comprovanteNome: 'nf-uniformes.pdf' }),

  lanc('RECEITA', `Contribuição de membros — ${nomeDoMes(-3).toLowerCase()}`, 'MENSALIDADE', 1840, mes(-3)),
  lanc('DESPESA', 'Aluguel da sala da atlética', 'ESTRUTURA', 800, mes(-3)),
  lanc('DESPESA', 'Campanha do agasalho — transporte e triagem', 'OUTRO', 940, mes(-3), { projetoId: 'pj-03' }),
  lanc('DESPESA', 'Impressão de material de divulgação', 'MARKETING', 620, mes(-3)),

  // ---- Os dois anteriores: preparação da Interatlética ----
  lanc('RECEITA', `Contribuição de membros — ${nomeDoMes(-2).toLowerCase()}`, 'MENSALIDADE', 2010, mes(-2)),
  lanc('RECEITA', 'Cota das atléticas coorganizadoras (1ª parcela)', 'EVENTO', 7200, mes(-2), { eventoId: 'e-01', eventoTitulo: 'Interatlética 2026' }),
  lanc('DESPESA', 'Aluguel da sala da atlética', 'ESTRUTURA', 800, mes(-2)),
  lanc('DESPESA', 'Sinal do ginásio — Interatlética', 'EVENTO', 4000, mes(-2), { eventoId: 'e-01', eventoTitulo: 'Interatlética 2026', projetoId: 'pj-01', comprovanteNome: 'contrato-ginasio.pdf' }),

  lanc('RECEITA', `Contribuição de membros — ${nomeDoMes(-1).toLowerCase()}`, 'MENSALIDADE', 1960, mes(-1)),
  lanc('RECEITA', 'Cota de patrocínio — Padaria do Campus', 'PATROCINIO', 2500, mes(-1)),
  lanc('DESPESA', 'Aluguel da sala da atlética', 'ESTRUTURA', 800, mes(-1)),
  lanc('DESPESA', 'Medalhas e troféus — Interatlética', 'EVENTO', 3400, mes(-1), { eventoId: 'e-01', eventoTitulo: 'Interatlética 2026', projetoId: 'pj-01', comprovanteNome: 'nf-medalhas.pdf' }),
  lanc('DESPESA', 'Tendas para a área externa', 'ESTRUTURA', 2600, mes(-1)),

  // ---- O mês corrente, já fechado ----
  lanc('RECEITA', `Contribuição de membros — ${nomeDoMes(0).toLowerCase()}`, 'MENSALIDADE', 2040, mes(0)),
  lanc('RECEITA', 'Cota das atléticas coorganizadoras (2ª parcela)', 'EVENTO', 7200, mes(0), { eventoId: 'e-01', eventoTitulo: 'Interatlética 2026' }),
  lanc('RECEITA', 'Bar da Calourada — repasse do parceiro', 'EVENTO', 3260, mes(0), { eventoId: 'e-02', eventoTitulo: 'Calourada da Engenharia' }),
  lanc('DESPESA', 'Aluguel da sala da atlética', 'ESTRUTURA', 800, mes(0)),
  lanc('DESPESA', 'Arbitragem — Federação Regional', 'ARBITRAGEM', 6400, mes(0), { eventoId: 'e-01', eventoTitulo: 'Interatlética 2026', projetoId: 'pj-01', comprovanteNome: 'contrato-arbitragem.pdf' }),
  lanc('DESPESA', 'Segurança da Calourada', 'EVENTO', 2800, mes(0), { eventoId: 'e-02', eventoTitulo: 'Calourada da Engenharia', projetoId: 'pj-02', comprovanteNome: 'nf-seguranca.pdf' }),
  lanc('DESPESA', 'Locação do galpão — Calourada', 'EVENTO', 4500, mes(0), { eventoId: 'e-02', eventoTitulo: 'Calourada da Engenharia', projetoId: 'pj-02' }),
  lanc('DESPESA', 'Impulsionamento de posts', 'MARKETING', 380, mes(0)),

  // ---- O mês que vem: previsto e a receber ----
  lanc('RECEITA', 'Cota de patrocínio — Ótica Vale (2º semestre)', 'PATROCINIO', 6000, mes(1), { situacao: 'PREVISTO', observacao: 'Vence junto com a renovação do contrato.' }),
  lanc('RECEITA', 'Cota das atléticas coorganizadoras (3ª parcela)', 'EVENTO', 3600, mes(1), { situacao: 'PREVISTO', eventoId: 'e-01', eventoTitulo: 'Interatlética 2026' }),
  lanc('RECEITA', `Contribuição de membros — ${nomeDoMes(1).toLowerCase()}`, 'MENSALIDADE', 2100, mes(1), { situacao: 'PREVISTO' }),
  lanc('DESPESA', 'Saldo do ginásio — Interatlética', 'EVENTO', 4000, mes(1), { situacao: 'PREVISTO', eventoId: 'e-01', eventoTitulo: 'Interatlética 2026', projetoId: 'pj-01' }),
  lanc('DESPESA', 'Ônibus para a Corrida da Medicina', 'VIAGEM', 1800, mes(1), { situacao: 'PREVISTO', eventoId: 'e-08' }),
  lanc('DESPESA', 'Aluguel da sala da atlética', 'ESTRUTURA', 800, mes(1), { situacao: 'PREVISTO' }),
  lanc('DESPESA', 'Alimentação das equipes — Interatlética', 'ALIMENTACAO', 2200, mes(1), { situacao: 'PREVISTO', eventoId: 'e-01', eventoTitulo: 'Interatlética 2026', projetoId: 'pj-01' }),
  lanc('DESPESA', 'Reposição de bolas e redes', 'ESTRUTURA', 1600, mes(1), { situacao: 'ATRASADO', observacao: 'Levantado no último inventário e ainda não comprado.' }),
]

/** Orçamento anual aprovado, por categoria. O realizado sai dos lançamentos. */
export const ORCAMENTO_PREVISTO: Record<string, number> = {
  EVENTO: 32000,
  PATROCINIO: 20000,
  MENSALIDADE: 24000,
  UNIFORME: 8000,
  VIAGEM: 6000,
  ESTRUTURA: 14000,
  MARKETING: 4000,
  ARBITRAGEM: 8000,
  ALIMENTACAO: 5000,
  DOACAO: 3000,
  OUTRO: 2000,
}

export const PRESTACOES: PrestacaoDeContas[] = [
  {
    id: 'pc-01',
    atleticaSlug: 'dragoes',
    competencia: mes(0),
    rotulo: competenciaPorExtenso(0),
    receitas: 12500,
    despesas: 14880,
    saldo: -2380,
    publicada: true,
    publicaParaMembros: true,
    publicaParaTodos: false,
    aprovadaEm: dias(-4),
    documentos: [`Prestação de contas — ${competenciaPorExtenso(0)}.xlsx`, 'Comprovantes do mês.zip'],
    linhas: [
      { descricao: 'Contribuição de membros', natureza: 'RECEITA', valor: 2040 },
      { descricao: 'Cota das atléticas coorganizadoras', natureza: 'RECEITA', valor: 7200 },
      { descricao: 'Bar da Calourada — repasse do parceiro', natureza: 'RECEITA', valor: 3260 },
      { descricao: 'Arbitragem — Federação Regional', natureza: 'DESPESA', valor: 6400 },
      { descricao: 'Locação do galpão — Calourada', natureza: 'DESPESA', valor: 4500 },
      { descricao: 'Segurança da Calourada', natureza: 'DESPESA', valor: 2800 },
      { descricao: 'Aluguel da sala', natureza: 'DESPESA', valor: 800 },
      { descricao: 'Impulsionamento de posts', natureza: 'DESPESA', valor: 380 },
    ],
  },
  {
    id: 'pc-02',
    atleticaSlug: 'dragoes',
    competencia: mes(-1),
    rotulo: competenciaPorExtenso(-1),
    receitas: 4460,
    despesas: 6800,
    saldo: -2340,
    publicada: true,
    publicaParaMembros: true,
    publicaParaTodos: true,
    aprovadaEm: dias(-34),
    documentos: [`Prestação de contas — ${competenciaPorExtenso(-1)}.xlsx`],
    linhas: [
      { descricao: 'Contribuição de membros', natureza: 'RECEITA', valor: 1960 },
      { descricao: 'Cota de patrocínio — Padaria do Campus', natureza: 'RECEITA', valor: 2500 },
      { descricao: 'Medalhas e troféus', natureza: 'DESPESA', valor: 3400 },
      { descricao: 'Tendas para a área externa', natureza: 'DESPESA', valor: 2600 },
      { descricao: 'Aluguel da sala', natureza: 'DESPESA', valor: 800 },
    ],
  },
  {
    id: 'pc-03',
    atleticaSlug: 'dragoes',
    competencia: mes(-2),
    rotulo: competenciaPorExtenso(-2),
    receitas: 9210,
    despesas: 4800,
    saldo: 4410,
    publicada: true,
    publicaParaMembros: true,
    publicaParaTodos: true,
    aprovadaEm: dias(-64),
    documentos: [`Prestação de contas — ${competenciaPorExtenso(-2)}.xlsx`],
    linhas: [
      { descricao: 'Contribuição de membros', natureza: 'RECEITA', valor: 2010 },
      { descricao: 'Cota das atléticas coorganizadoras', natureza: 'RECEITA', valor: 7200 },
      { descricao: 'Sinal do ginásio', natureza: 'DESPESA', valor: 4000 },
      { descricao: 'Aluguel da sala', natureza: 'DESPESA', valor: 800 },
    ],
  },
]

// ---------------------------------------------------------------------
// Patrocínios
// ---------------------------------------------------------------------

export const PATROCINIOS: Patrocinio[] = [
  {
    id: 'ps-01',
    atleticaSlug: 'dragoes',
    empresa: 'Ótica Vale',
    segmento: 'Varejo',
    contatoNome: 'Sr. Almeida',
    contatoEmail: 'contato@oticavale.exemplo',
    etapa: 'ATIVO',
    valor: 12000,
    contrapartidas: ['Logo na frente do uniforme', 'Menção em todos os posts de jogo', 'Estande na Interatlética'],
    inicioEm: dias(-150),
    fimEm: dias(215),
    responsavelNome: 'Diego Marinho',
    logoUrl: null,
    observacao: 'Cota master. Renovação a conversar em outubro.',
    atualizadoEm: dias(-30),
  },
  {
    id: 'ps-02',
    atleticaSlug: 'dragoes',
    empresa: 'Padaria do Campus',
    segmento: 'Alimentação',
    contatoNome: 'Dona Vera',
    contatoEmail: 'padariadocampus@exemplo.br',
    etapa: 'ATIVO',
    valor: 5000,
    contrapartidas: ['Logo na manga do uniforme', 'Ponto de venda na Calourada'],
    inicioEm: dias(-40),
    fimEm: dias(325),
    responsavelNome: 'Larissa Prado',
    logoUrl: null,
    observacao: null,
    atualizadoEm: dias(-12),
  },
  {
    id: 'ps-03',
    atleticaSlug: 'dragoes',
    empresa: 'Academia Movimento',
    segmento: 'Fitness',
    contatoNome: 'Paula Ribas',
    contatoEmail: 'paula@movimento.exemplo',
    etapa: 'CONTRATO',
    valor: 8000,
    contrapartidas: ['Logo nas costas do uniforme', 'Desconto para membros', 'Aula aberta na semana de calouros'],
    inicioEm: null,
    fimEm: null,
    responsavelNome: 'Diego Marinho',
    logoUrl: null,
    observacao: 'Minuta enviada. Falta assinatura da diretoria deles.',
    atualizadoEm: dias(-5),
  },
  {
    id: 'ps-04',
    atleticaSlug: 'dragoes',
    empresa: 'Gráfica Serrana',
    segmento: 'Impressão',
    contatoNome: 'Marcelo',
    contatoEmail: 'comercial@graficaserrana.exemplo',
    etapa: 'NEGOCIACAO',
    valor: 4000,
    contrapartidas: ['Logo no material impresso', 'Permuta de 40% em impressão'],
    inicioEm: null,
    fimEm: null,
    responsavelNome: 'Helena Vasques',
    logoUrl: null,
    observacao: 'Querem permuta, não dinheiro. Precisa de aprovação da diretoria.',
    atualizadoEm: dias(-8),
  },
  {
    id: 'ps-05',
    atleticaSlug: 'dragoes',
    empresa: 'Hamburgueria do Vale',
    segmento: 'Alimentação',
    contatoNome: 'Igor',
    contatoEmail: null,
    etapa: 'CONTATO',
    valor: null,
    contrapartidas: [],
    inicioEm: null,
    fimEm: null,
    responsavelNome: 'Larissa Prado',
    logoUrl: null,
    observacao: 'Respondeu o e-mail e pediu o media kit.',
    atualizadoEm: dias(-2),
  },
  {
    id: 'ps-06',
    atleticaSlug: 'dragoes',
    empresa: 'Faculdade UniVale — Extensão',
    segmento: 'Institucional',
    contatoNome: 'Coordenação',
    contatoEmail: 'extensao@univale.exemplo',
    etapa: 'PROSPECCAO',
    valor: null,
    contrapartidas: [],
    inicioEm: null,
    fimEm: null,
    responsavelNome: 'Marina Alencar',
    logoUrl: null,
    observacao: 'Edital de apoio a projeto social abre em outubro.',
    atualizadoEm: dias(-1),
  },
  {
    id: 'ps-07',
    atleticaSlug: 'dragoes',
    empresa: 'Loja de Suplementos Titan',
    segmento: 'Varejo',
    contatoNome: 'Bruna',
    contatoEmail: null,
    etapa: 'PROSPECCAO',
    valor: null,
    contrapartidas: [],
    inicioEm: null,
    fimEm: null,
    responsavelNome: 'Diego Marinho',
    logoUrl: null,
    observacao: null,
    atualizadoEm: dias(-1),
  },
  {
    id: 'ps-08',
    atleticaSlug: 'dragoes',
    empresa: 'Construtora Pilar',
    segmento: 'Construção',
    contatoNome: 'Sr. Nunes',
    contatoEmail: 'nunes@pilar.exemplo',
    etapa: 'ENCERRADO',
    valor: 6000,
    contrapartidas: ['Logo na lateral do uniforme 2025'],
    inicioEm: dias(-500),
    fimEm: dias(-135),
    responsavelNome: 'Isabela Cunha',
    logoUrl: null,
    observacao: 'Não renovou: mudança de diretoria comercial deles.',
    atualizadoEm: dias(-135),
  },
]
