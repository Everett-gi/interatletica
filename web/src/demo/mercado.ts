/**
 * Mercado: fornecedores avaliados, compras coletivas, parcerias,
 * oportunidades e a vitrine da loja.
 *
 * <p>A nota do fornecedor é a média dos cinco critérios de todas as
 * avaliações — calculada, não digitada. É o número que uma atlética sozinha
 * nunca teria, e o motivo de o diretório existir dentro da rede em vez de
 * ser uma lista de contatos no bloco de notas de alguém.</p>
 */

import type {
  Amistoso,
  CompraColetiva,
  Fornecedor,
  NotasDoFornecedor,
  Oportunidade,
  Parceria,
  Produto,
  AvaliacaoDeFornecedor,
} from '../api/tipos-mercado'
import { ATLETICAS, dias } from './dados'

function media(notas: NotasDoFornecedor): number {
  const { qualidade, preco, prazo, atendimento, confiabilidade } = notas
  return (qualidade + preco + prazo + atendimento + confiabilidade) / 5
}

function notas(
  qualidade: number, preco: number, prazo: number,
  atendimento: number, confiabilidade: number,
): NotasDoFornecedor {
  return { qualidade, preco, prazo, atendimento, confiabilidade }
}

interface Semente {
  id: string
  nome: string
  categoria: Fornecedor['categoria']
  cidade: string | null
  uf: string | null
  contato: string | null
  site: string | null
  descricao: string
  avaliacoes: number
  atleticasAtendidas: number
  faixaDePreco: Fornecedor['faixaDePreco']
  atendeRemoto: boolean
  ultimaCompra: string | null
  detalhe: NotasDoFornecedor
}

const SEMENTES: Semente[] = [
  { id: 'fn-01', nome: 'Uniformes Vale', categoria: 'UNIFORMES', cidade: 'São Bento do Vale', uf: 'SP', contato: '(11) 98800-1122', site: 'https://uniformesvale.exemplo', descricao: 'Confecção de uniforme esportivo sob medida. Trabalha com lote a partir de 20 peças e entrega em até 30 dias.', avaliacoes: 14, atleticasAtendidas: 12, faixaDePreco: 'MEDIA', atendeRemoto: true, ultimaCompra: dias(-60), detalhe: notas(5, 4, 5, 5, 5) },
  { id: 'fn-02', nome: 'Tecidos Aurora', categoria: 'UNIFORMES', cidade: 'Porto Aurora', uf: 'PR', contato: '(41) 99700-3344', site: null, descricao: 'Uniforme e camisa de torcida. Boa qualidade de tecido, prazo mais longo.', avaliacoes: 9, atleticasAtendidas: 8, faixaDePreco: 'ALTA', atendeRemoto: true, ultimaCompra: dias(-330), detalhe: notas(5, 3, 4, 5, 5) },
  { id: 'fn-03', nome: 'Malharia Serrana', categoria: 'UNIFORMES', cidade: 'Serra Alta', uf: 'MG', contato: '(31) 99500-7788', site: null, descricao: 'A opção mais barata da região. Prazo de 60 dias e acabamento simples.', avaliacoes: 11, atleticasAtendidas: 10, faixaDePreco: 'BAIXA', atendeRemoto: false, ultimaCompra: null, detalhe: notas(3, 5, 3, 4, 4) },
  { id: 'fn-04', nome: 'Troféus & Medalhas Império', categoria: 'MEDALHAS', cidade: 'São Bento do Vale', uf: 'SP', contato: '(11) 98111-2233', site: 'https://imperio.exemplo', descricao: 'Medalha personalizada, troféu e placa. Faz arte inclusa no preço.', avaliacoes: 17, atleticasAtendidas: 15, faixaDePreco: 'MEDIA', atendeRemoto: true, ultimaCompra: dias(-35), detalhe: notas(5, 4, 5, 4, 5) },
  { id: 'fn-05', nome: 'Premiar Troféus', categoria: 'TROFEUS', cidade: 'Serra Alta', uf: 'MG', contato: '(31) 99222-4455', site: null, descricao: 'Troféus em acrílico e resina. Prazo curto para pedido pequeno.', avaliacoes: 6, atleticasAtendidas: 6, faixaDePreco: 'MEDIA', atendeRemoto: true, ultimaCompra: null, detalhe: notas(4, 4, 5, 4, 4) },
  { id: 'fn-06', nome: 'Gráfica Serrana', categoria: 'IMPRESSAO', cidade: 'Serra Alta', uf: 'MG', contato: '(31) 99333-5566', site: 'https://graficaserrana.exemplo', descricao: 'Banner, cartaz, adesivo e credencial. Aceita permuta por patrocínio.', avaliacoes: 12, atleticasAtendidas: 11, faixaDePreco: 'BAIXA', atendeRemoto: false, ultimaCompra: dias(-90), detalhe: notas(4, 5, 4, 5, 4) },
  { id: 'fn-07', nome: 'Viação Caminho do Vale', categoria: 'TRANSPORTE', cidade: 'São Bento do Vale', uf: 'SP', contato: '(11) 98444-6677', site: null, descricao: 'Fretamento de ônibus e micro-ônibus. Cobra pedágio à parte.', avaliacoes: 19, atleticasAtendidas: 16, faixaDePreco: 'MEDIA', atendeRemoto: false, ultimaCompra: dias(-280), detalhe: notas(4, 4, 5, 3, 5) },
  { id: 'fn-08', nome: 'Federação Regional de Arbitragem', categoria: 'ARBITRAGEM', cidade: 'São Bento do Vale', uf: 'SP', contato: 'contato@federacaoregional.exemplo', site: null, descricao: 'Escala de árbitros e mesários federados para múltiplas modalidades.', avaliacoes: 21, atleticasAtendidas: 18, faixaDePreco: 'ALTA', atendeRemoto: false, ultimaCompra: dias(-11), detalhe: notas(5, 3, 5, 4, 5) },
  { id: 'fn-09', nome: 'Apito Livre Arbitragem', categoria: 'ARBITRAGEM', cidade: 'Porto Aurora', uf: 'PR', contato: '(41) 99666-8899', site: null, descricao: 'Cooperativa de árbitros universitários. Preço menor, escala menos previsível.', avaliacoes: 8, atleticasAtendidas: 7, faixaDePreco: 'BAIXA', atendeRemoto: false, ultimaCompra: null, detalhe: notas(4, 5, 3, 4, 3) },
  { id: 'fn-10', nome: 'Estúdio Quadra Foto', categoria: 'FOTOGRAFIA', cidade: 'São Bento do Vale', uf: 'SP', contato: '(11) 98777-9900', site: 'https://quadrafoto.exemplo', descricao: 'Cobertura fotográfica de jogo e evento, entrega em 48 horas.', avaliacoes: 13, atleticasAtendidas: 11, faixaDePreco: 'MEDIA', atendeRemoto: false, ultimaCompra: dias(-40), detalhe: notas(5, 4, 5, 5, 5) },
  { id: 'fn-11', nome: 'Corta Certo Vídeo', categoria: 'VIDEO', cidade: 'Porto Aurora', uf: 'PR', contato: null, site: 'https://cortacerto.exemplo', descricao: 'Aftermovie e transmissão ao vivo com dois operadores.', avaliacoes: 7, atleticasAtendidas: 6, faixaDePreco: 'ALTA', atendeRemoto: true, ultimaCompra: null, detalhe: notas(5, 3, 4, 4, 4) },
  { id: 'fn-12', nome: 'Buffet do Campus', categoria: 'ALIMENTACAO', cidade: 'São Bento do Vale', uf: 'SP', contato: '(11) 98999-1100', site: null, descricao: 'Marmita de atleta e coffee break. Faz cardápio para restrição alimentar.', avaliacoes: 15, atleticasAtendidas: 13, faixaDePreco: 'BAIXA', atendeRemoto: false, ultimaCompra: dias(-120), detalhe: notas(4, 5, 4, 5, 4) },
  { id: 'fn-13', nome: 'Estrutura Vale Eventos', categoria: 'EVENTOS', cidade: 'São Bento do Vale', uf: 'SP', contato: '(11) 98222-3311', site: null, descricao: 'Tenda, palco, som e gerador. Montagem inclusa.', avaliacoes: 10, atleticasAtendidas: 9, faixaDePreco: 'ALTA', atendeRemoto: false, ultimaCompra: dias(-220), detalhe: notas(4, 3, 4, 4, 4) },
  { id: 'fn-14', nome: 'Guarda Vale Segurança', categoria: 'SEGURANCA', cidade: 'São Bento do Vale', uf: 'SP', contato: '(11) 98555-4422', site: null, descricao: 'Equipe de segurança para evento universitário, com CNV em dia.', avaliacoes: 16, atleticasAtendidas: 14, faixaDePreco: 'MEDIA', atendeRemoto: false, ultimaCompra: dias(-8), detalhe: notas(5, 4, 5, 4, 5) },
]

export const FORNECEDORES: Fornecedor[] = SEMENTES.map((s) => ({
  id: s.id,
  nome: s.nome,
  categoria: s.categoria,
  cidade: s.cidade,
  uf: s.uf,
  contato: s.contato,
  site: s.site,
  descricao: s.descricao,
  nota: Math.round(media(s.detalhe) * 10) / 10,
  avaliacoes: s.avaliacoes,
  atleticasAtendidas: s.atleticasAtendidas,
  faixaDePreco: s.faixaDePreco,
  atendeRemoto: s.atendeRemoto,
  ultimaCompra: s.ultimaCompra,
  detalheDasNotas: s.detalhe,
}))

export const AVALIACOES: Record<string, AvaliacaoDeFornecedor[]> = {
  'fn-01': [
    { id: 'av-01', atletica: ATLETICAS[0], autorNome: 'Camila Toledo', quando: dias(-55), notas: notas(5, 4, 5, 5, 5), comentario: 'Entregaram os 16 conjuntos de vôlei em 28 dias, com a numeração certa. Mandaram foto do lote antes de despachar.', contexto: '16 conjuntos de vôlei feminino' },
    { id: 'av-02', atletica: ATLETICAS[4], autorNome: 'Isabela Cunha', quando: dias(-200), notas: notas(5, 4, 5, 4, 5), comentario: 'Lote de 80 peças em 28 dias. Uma camisa veio com defeito e trocaram sem discussão.', contexto: '80 camisas de torcida' },
    { id: 'av-03', atletica: ATLETICAS[2], autorNome: 'Beatriz Nogueira', quando: dias(-380), notas: notas(5, 3, 4, 5, 5), comentario: 'Qualidade excelente. Preço acima do que a gente pagava antes, mas não teve retrabalho nenhum.', contexto: '40 conjuntos de natação' },
  ],
  'fn-08': [
    { id: 'av-04', atletica: ATLETICAS[0], autorNome: 'Rafael Bandeira', quando: dias(-9), notas: notas(5, 3, 5, 4, 5), comentario: 'Escala completa e pontual nos três dias. Caro, mas nunca faltou árbitro — e isso já salvou o evento duas vezes.', contexto: 'Interatlética, 11 modalidades' },
    { id: 'av-05', atletica: ATLETICAS[1], autorNome: 'Diego Marinho', quando: dias(-160), notas: notas(5, 2, 5, 4, 5), comentario: 'Fechamos com 45 dias de antecedência e pagamos 38% acima do orçado. Com 90 dias o preço é outro.', contexto: 'Taça Leões de futsal' },
  ],
  'fn-03': [
    { id: 'av-06', atletica: ATLETICAS[5], autorNome: 'Thiago Rezende', quando: dias(-240), notas: notas(3, 5, 3, 4, 4), comentario: 'Preço imbatível. O tecido é mais fino e o prazo estourou em uma semana, mas para camisa de torcida serviu bem.', contexto: '60 camisas de torcida' },
  ],
  'fn-14': [
    { id: 'av-07', atletica: ATLETICAS[0], autorNome: 'Larissa Prado', quando: dias(-6), notas: notas(5, 4, 5, 4, 5), comentario: 'Quatro seguranças para 300 pessoas, chegaram uma hora antes e ficaram até o último convidado sair.', contexto: 'Calourada da Engenharia' },
  ],
}

// ---------------------------------------------------------------------
// Compras coletivas
// ---------------------------------------------------------------------

export const COMPRAS_COLETIVAS: CompraColetiva[] = [
  {
    id: 'cc-01',
    titulo: 'Compra coletiva de uniformes de treino',
    produto: 'Conjunto de treino (camisa + shorts), tecido dry-fit',
    descricao:
      'Juntando o pedido de várias atléticas para chegar na faixa de desconto '
      + 'por volume. Cada atlética escolhe a própria arte; o que se compartilha '
      + 'é o lote de produção.',
    organizadora: ATLETICAS[4],
    etapa: 'ABERTA',
    quantidadeMinima: 1000,
    quantidadeAtual: 740,
    prazo: dias(28),
    precoEstimado: 62,
    economiaPercentual: null,
    fornecedorId: 'fn-01',
    fornecedorNome: 'Uniformes Vale',
    participo: false,
    interessados: [
      { atletica: ATLETICAS[4], quantidade: 180, confirmado: true },
      { atletica: ATLETICAS[2], quantidade: 140, confirmado: true },
      { atletica: ATLETICAS[1], quantidade: 120, confirmado: true },
      { atletica: ATLETICAS[5], quantidade: 100, confirmado: true },
      { atletica: ATLETICAS[3], quantidade: 90, confirmado: false },
      { atletica: ATLETICAS[0], quantidade: 110, confirmado: false },
    ],
  },
  {
    id: 'cc-02',
    titulo: 'Medalhas para a temporada 2026',
    produto: 'Medalha 50 mm com fita personalizada',
    descricao: 'Lote fechado para as atléticas do Vale que têm campeonato no segundo semestre.',
    organizadora: ATLETICAS[0],
    etapa: 'FECHADA',
    quantidadeMinima: 800,
    quantidadeAtual: 940,
    prazo: dias(-12),
    precoEstimado: 7.4,
    economiaPercentual: 31,
    fornecedorId: 'fn-04',
    fornecedorNome: 'Troféus & Medalhas Império',
    participo: true,
    interessados: [
      { atletica: ATLETICAS[0], quantidade: 320, confirmado: true },
      { atletica: ATLETICAS[1], quantidade: 240, confirmado: true },
      { atletica: ATLETICAS[3], quantidade: 200, confirmado: true },
      { atletica: ATLETICAS[5], quantidade: 180, confirmado: true },
    ],
  },
  {
    id: 'cc-03',
    titulo: 'Kit de primeiros socorros',
    produto: 'Kit completo com maleta, conforme exigência de evento esportivo',
    descricao: 'Item obrigatório em evento e caro no varejo unitário.',
    organizadora: ATLETICAS[2],
    etapa: 'ABERTA',
    quantidadeMinima: 40,
    quantidadeAtual: 23,
    prazo: dias(45),
    precoEstimado: 148,
    economiaPercentual: null,
    fornecedorId: null,
    fornecedorNome: null,
    participo: false,
    interessados: [
      { atletica: ATLETICAS[2], quantidade: 8, confirmado: true },
      { atletica: ATLETICAS[4], quantidade: 6, confirmado: true },
      { atletica: ATLETICAS[5], quantidade: 5, confirmado: false },
      { atletica: ATLETICAS[1], quantidade: 4, confirmado: false },
    ],
  },
  {
    id: 'cc-04',
    titulo: 'Bolas de futsal e vôlei',
    produto: 'Bola oficial de futsal e de vôlei, linha de treino',
    descricao: 'Reposição anual. Compra fechada em julho, entregue no mês seguinte.',
    organizadora: ATLETICAS[1],
    etapa: 'CONCLUIDA',
    quantidadeMinima: 100,
    quantidadeAtual: 134,
    prazo: dias(-70),
    precoEstimado: 96,
    economiaPercentual: 24,
    fornecedorId: null,
    fornecedorNome: 'Distribuidora Esporte Sul',
    participo: true,
    interessados: [
      { atletica: ATLETICAS[1], quantidade: 40, confirmado: true },
      { atletica: ATLETICAS[0], quantidade: 34, confirmado: true },
      { atletica: ATLETICAS[3], quantidade: 30, confirmado: true },
      { atletica: ATLETICAS[2], quantidade: 30, confirmado: true },
    ],
  },
]

// ---------------------------------------------------------------------
// Parcerias
// ---------------------------------------------------------------------

export const PARCERIAS: Parceria[] = [
  {
    id: 'pr-01',
    titulo: 'Academia Movimento — desconto para estudantes',
    tipo: 'EMPRESA',
    parceiroNome: 'Academia Movimento',
    parceiroLogoUrl: null,
    proponente: ATLETICAS[3],
    descricao:
      'A academia oferece 40% no plano semestral para membro com vínculo ativo '
      + 'em qualquer atlética da rede. Em troca, pede logo no uniforme e uma '
      + 'aula aberta por semestre.',
    beneficio: '40% no plano semestral',
    etapa: 'DISPONIVEL',
    interessadas: [ATLETICAS[0], ATLETICAS[1], ATLETICAS[2], ATLETICAS[4], ATLETICAS[5]],
    validade: dias(60),
    cidade: 'São Bento do Vale',
    uf: 'SP',
    tenhoInteresse: false,
  },
  {
    id: 'pr-02',
    titulo: 'Clínica Fisio Ativa — atendimento a atletas',
    tipo: 'EMPRESA',
    parceiroNome: 'Clínica Fisio Ativa',
    parceiroLogoUrl: null,
    proponente: ATLETICAS[2],
    descricao:
      'Avaliação e sessão de fisioterapia com preço fechado para atleta '
      + 'federado pela atlética. Atendimento prioritário em caso de lesão em jogo.',
    beneficio: 'Sessão a preço de estudante e prioridade em lesão',
    etapa: 'ATIVA',
    interessadas: [ATLETICAS[0], ATLETICAS[2]],
    validade: dias(180),
    cidade: 'Serra Alta',
    uf: 'MG',
    tenhoInteresse: true,
  },
  {
    id: 'pr-03',
    titulo: 'Dragões e Corujas — quadra e laboratório compartilhados',
    tipo: 'ATLETICA',
    parceiroNome: 'Atlética Corujas',
    parceiroLogoUrl: null,
    proponente: ATLETICAS[0],
    descricao:
      'Os Dragões abrem a quadra de vôlei nas terças; as Corujas abrem o '
      + 'laboratório de e-sports nas quintas. Sem dinheiro envolvido.',
    beneficio: 'Uso recíproco de espaço',
    etapa: 'ATIVA',
    interessadas: [ATLETICAS[3]],
    validade: null,
    cidade: 'São Bento do Vale',
    uf: 'SP',
    tenhoInteresse: true,
  },
  {
    id: 'pr-04',
    titulo: 'Livraria Universitária — desconto em material',
    tipo: 'EMPRESA',
    parceiroNome: 'Livraria Universitária',
    parceiroLogoUrl: null,
    proponente: ATLETICAS[1],
    descricao: 'Desconto de 15% em livro técnico mediante carteirinha da atlética.',
    beneficio: '15% em livro técnico',
    etapa: 'INTERESSE',
    interessadas: [ATLETICAS[0], ATLETICAS[3]],
    validade: dias(90),
    cidade: 'São Bento do Vale',
    uf: 'SP',
    tenhoInteresse: false,
  },
  {
    id: 'pr-05',
    titulo: 'Instituto Serrano — cessão de ginásio para eventos da rede',
    tipo: 'INSTITUICAO',
    parceiroNome: 'Instituto Serrano',
    parceiroLogoUrl: null,
    proponente: ATLETICAS[2],
    descricao:
      'A instituição cede o ginásio para eventos interatléticos aos sábados, '
      + 'mediante ofício com 30 dias de antecedência.',
    beneficio: 'Ginásio cedido aos sábados',
    etapa: 'NEGOCIACAO',
    interessadas: [ATLETICAS[2], ATLETICAS[5]],
    validade: null,
    cidade: 'Serra Alta',
    uf: 'MG',
    tenhoInteresse: false,
  },
]

// ---------------------------------------------------------------------
// Oportunidades
// ---------------------------------------------------------------------

export const OPORTUNIDADES: Oportunidade[] = [
  { id: 'op-01', tipo: 'PATROCINIO', titulo: 'Edital de apoio a projeto social — UniVale Extensão', resumo: 'Até R$ 8.000 por projeto com contrapartida social comprovada.', origem: 'UniVale', prazo: dias(40), destino: null, etiquetas: ['Projeto social', 'Edital'] },
  { id: 'op-02', tipo: 'COMPETICAO', titulo: 'Circuito Regional de Natação — inscrição aberta', resumo: 'Sete provas, aberto a atléticas de SP, MG e PR.', origem: 'Federação Regional', prazo: dias(22), destino: null, etiquetas: ['Natação'] },
  { id: 'op-03', tipo: 'PARCERIA', titulo: 'Academia Movimento — desconto para estudantes', resumo: '40% no plano semestral para membro com vínculo ativo.', origem: 'Atlética Corujas', prazo: dias(60), destino: 'rede/parcerias', etiquetas: ['Parceria', 'Fitness'] },
  { id: 'op-04', tipo: 'FORNECEDOR', titulo: 'Compra coletiva de uniformes: faltam 260 peças', resumo: 'Com mil unidades o desconto sobe de 18% para 27%.', origem: 'Atlética Panteras', prazo: dias(28), destino: 'mercado/compras/cc-01', etiquetas: ['Compra coletiva'] },
  { id: 'op-05', tipo: 'EVENTO', titulo: 'Interatlética 2026 — vagas em handebol e natação', resumo: 'Seis atléticas, três dias, 418 atletas confirmados.', origem: 'Atlética Dragões', prazo: dias(18), destino: 'e/dragoes/interatletica-2026', etiquetas: ['Interatlética'] },
  { id: 'op-06', tipo: 'VAGA', titulo: 'Comissão organizadora do Circuito de E-sports', resumo: 'Duas vagas para produção e transmissão, aberto a qualquer atlética da rede.', origem: 'Atlética Corujas', prazo: dias(15), destino: null, etiquetas: ['E-sports', 'Voluntário'] },
  { id: 'op-07', tipo: 'PROJETO', titulo: 'Mutirão de doação de sangue entre atléticas', resumo: 'Cinco atléticas já toparam. Meta de 200 doadores em um sábado.', origem: 'Atlética Furacão', prazo: dias(35), destino: null, etiquetas: ['Projeto social'] },
]

// ---------------------------------------------------------------------
// Loja — vitrine, sem cobrança
// ---------------------------------------------------------------------

export const PRODUTOS: Produto[] = [
  {
    id: 'pd-01',
    atleticaSlug: 'dragoes',
    nome: 'Camisa oficial 2026',
    descricao: 'Tecido dry-fit, brasão bordado, numeração opcional nas costas.',
    categoria: 'Vestuário',
    preco: 89,
    imagemUrl: null,
    disponivel: true,
    variantes: [
      { rotulo: 'P', estoque: 12 },
      { rotulo: 'M', estoque: 28 },
      { rotulo: 'G', estoque: 24 },
      { rotulo: 'GG', estoque: 9 },
    ],
    comoAdquirir: 'Reserve com a diretoria de marketing na sala da atlética ou pelo direct.',
  },
  {
    id: 'pd-02',
    atleticaSlug: 'dragoes',
    nome: 'Moletom Dragões',
    descricao: 'Moletom flanelado com capuz e brasão em silk.',
    categoria: 'Vestuário',
    preco: 159,
    imagemUrl: null,
    disponivel: true,
    variantes: [
      { rotulo: 'P', estoque: 4 },
      { rotulo: 'M', estoque: 11 },
      { rotulo: 'G', estoque: 7 },
      { rotulo: 'GG', estoque: 0 },
    ],
    comoAdquirir: 'Encomenda por lote. Próximo fechamento no fim do mês.',
  },
  {
    id: 'pd-03',
    atleticaSlug: 'dragoes',
    nome: 'Caneca do interatlética',
    descricao: 'Caneca de cerâmica 325 ml com a arte da edição 2026.',
    categoria: 'Acessório',
    preco: 39,
    imagemUrl: null,
    disponivel: true,
    variantes: [{ rotulo: 'Única', estoque: 46 }],
    comoAdquirir: 'Disponível na barraca da atlética durante o evento.',
  },
  {
    id: 'pd-04',
    atleticaSlug: 'dragoes',
    nome: 'Bandeira 1,5 x 1 m',
    descricao: 'Bandeira de torcida em tecido resistente, com ilhoses.',
    categoria: 'Acessório',
    preco: 74,
    imagemUrl: null,
    disponivel: false,
    variantes: [{ rotulo: 'Única', estoque: 0 }],
    comoAdquirir: 'Esgotada. Próximo lote depende da campanha da camisa nova.',
  },
  {
    id: 'pd-05',
    atleticaSlug: 'dragoes',
    nome: 'Kit calouro',
    descricao: 'Camisa, caneca e adesivos. Combo da recepção de calouros.',
    categoria: 'Combo',
    preco: 119,
    imagemUrl: null,
    disponivel: true,
    variantes: [
      { rotulo: 'M', estoque: 18 },
      { rotulo: 'G', estoque: 15 },
    ],
    comoAdquirir: 'Retirada na Calourada, mediante inscrição confirmada.',
  },
  {
    id: 'pd-06',
    atleticaSlug: 'dragoes',
    nome: 'Corta-vento',
    descricao: 'Jaqueta leve impermeável, com o brasão no peito.',
    categoria: 'Vestuário',
    preco: 189,
    imagemUrl: null,
    disponivel: true,
    variantes: [
      { rotulo: 'P', estoque: 3 },
      { rotulo: 'M', estoque: 6 },
      { rotulo: 'G', estoque: 5 },
    ],
    comoAdquirir: 'Encomenda por lote, com a diretoria de marketing.',
  },
]

/** Reexportado para a fachada não precisar conhecer dois módulos de rede. */
export type { Amistoso }
