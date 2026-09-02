/** Notícias, campanhas e biblioteca de mídia da atlética. */

import type { Campanha, Midia, Noticia } from '../api/tipos-comunicacao'
import { corDerivada } from '../ui/tema'
import { dias } from './dados'

export const NOTICIAS: Noticia[] = [
  {
    id: 'nt-01',
    atleticaSlug: 'dragoes',
    titulo: 'Interatlética 2026 tem 418 atletas confirmados a três semanas do início',
    chamada: 'Seis atléticas, onze modalidades e a maior edição desde a retomada.',
    corpo:
      'A Interatlética 2026 fecha a lista de inscritos com 418 atletas de seis '
      + 'atléticas, número 12% maior que o da edição passada. Handebol e natação '
      + 'ainda têm vaga.\n\n'
      + 'A abertura foi antecipada para as 8h por causa da previsão de chuva à '
      + 'tarde no sábado. O fretado sai às 7h do campus.',
    capaUrl: null,
    autorNome: 'Helena Vasques',
    publicadaEm: dias(-2),
    status: 'PUBLICADO',
    destaque: true,
    etiquetas: ['Interatlética', 'Esportes'],
  },
  {
    id: 'nt-02',
    atleticaSlug: 'dragoes',
    titulo: 'Campanha do agasalho fecha com 1.480 peças e alcança 312 pessoas',
    chamada: 'Mudança na logística de coleta mais que dobrou o resultado do ano passado.',
    corpo:
      'A campanha usou os jogos de vôlei como ponto de coleta, e não mais a '
      + 'sala da atlética. O resultado foi 1.480 peças, contra 600 em 2025.\n\n'
      + 'As doações foram distribuídas entre três instituições parceiras.',
    capaUrl: null,
    autorNome: 'Camila Toledo',
    publicadaEm: dias(-16),
    status: 'PUBLICADO',
    destaque: false,
    etiquetas: ['Projeto social'],
  },
  {
    id: 'nt-03',
    atleticaSlug: 'dragoes',
    titulo: 'Calourada da Engenharia esgota em quatro horas',
    chamada: 'As 300 vagas acabaram na primeira tarde. Lista de espera segue aberta.',
    corpo:
      'Quem entrar na lista de espera é promovido automaticamente se houver '
      + 'cancelamento. A entrada é por QR, e o comprovante fica no perfil de '
      + 'cada inscrito.',
    capaUrl: null,
    autorNome: 'Larissa Prado',
    publicadaEm: dias(-8),
    status: 'PUBLICADO',
    destaque: false,
    etiquetas: ['Eventos'],
  },
  {
    id: 'nt-04',
    atleticaSlug: 'dragoes',
    titulo: 'Eleição da diretoria 2027: o que muda no calendário',
    chamada: 'A assembleia de setembro decide entre abrir o processo em outubro ou novembro.',
    corpo: 'Texto em produção. Depende do resultado da votação na assembleia.',
    capaUrl: null,
    autorNome: 'Marina Alencar',
    publicadaEm: null,
    status: 'PRODUCAO',
    destaque: false,
    etiquetas: ['Gestão'],
  },
  {
    id: 'nt-05',
    atleticaSlug: 'dragoes',
    titulo: 'Nova camisa: bastidores da escolha do fornecedor',
    chamada: 'Três orçamentos, uma votação e um prazo apertado.',
    corpo: 'Agendado para publicar depois da decisão da diretoria.',
    capaUrl: null,
    autorNome: 'Helena Vasques',
    publicadaEm: dias(4),
    status: 'AGENDADO',
    destaque: false,
    etiquetas: ['Marketing'],
  },
]

export const CAMPANHAS: Campanha[] = [
  {
    id: 'cp-01',
    atleticaSlug: 'dragoes',
    nome: 'Camisa oficial 2026',
    objetivo: 'Vender 300 camisas até o fim da Interatlética',
    metaValor: 300,
    metaUnidade: 'camisas',
    atual: 241,
    inicioEm: dias(-45),
    fimEm: dias(30),
    responsavelNome: 'Helena Vasques',
    patrocinioId: null,
    conteudos: [
      { id: 'ct-01', titulo: 'Teaser da nova camisa', canal: 'INSTAGRAM', publicarEm: dias(-40), status: 'PUBLICADO', responsavelNome: 'Helena Vasques' },
      { id: 'ct-02', titulo: 'Bastidores da produção', canal: 'STORIES', publicarEm: dias(-30), status: 'PUBLICADO', responsavelNome: 'Larissa Prado' },
      { id: 'ct-03', titulo: 'Ensaio com atletas das equipes', canal: 'INSTAGRAM', publicarEm: dias(-14), status: 'PUBLICADO', responsavelNome: 'Helena Vasques' },
      { id: 'ct-04', titulo: 'Vídeo curto: da arte à camisa pronta', canal: 'TIKTOK', publicarEm: dias(2), status: 'PRODUCAO', responsavelNome: 'Isabela Cunha' },
      { id: 'ct-05', titulo: 'Contagem regressiva do último lote', canal: 'STORIES', publicarEm: dias(10), status: 'AGENDADO', responsavelNome: 'Larissa Prado' },
      { id: 'ct-06', titulo: 'Post de encerramento com o número final', canal: 'INSTAGRAM', publicarEm: dias(31), status: 'IDEIA', responsavelNome: null },
    ],
  },
  {
    id: 'cp-02',
    atleticaSlug: 'dragoes',
    nome: 'Interatlética 2026 — divulgação',
    objetivo: 'Encher as vagas de handebol e natação',
    metaValor: 450,
    metaUnidade: 'atletas inscritos',
    atual: 418,
    inicioEm: dias(-60),
    fimEm: dias(18),
    responsavelNome: 'Larissa Prado',
    patrocinioId: 'ps-01',
    conteudos: [
      { id: 'ct-07', titulo: 'Abertura das inscrições', canal: 'INSTAGRAM', publicarEm: dias(-55), status: 'PUBLICADO', responsavelNome: 'Larissa Prado' },
      { id: 'ct-08', titulo: 'Tabela de jogos em carrossel', canal: 'INSTAGRAM', publicarEm: dias(-3), status: 'PUBLICADO', responsavelNome: 'Helena Vasques' },
      { id: 'ct-09', titulo: 'Chamada para handebol e natação', canal: 'STORIES', publicarEm: dias(1), status: 'AGENDADO', responsavelNome: 'Larissa Prado' },
      { id: 'ct-10', titulo: 'Transmissão da final', canal: 'YOUTUBE', publicarEm: dias(25), status: 'IDEIA', responsavelNome: null },
      { id: 'ct-11', titulo: 'Aftermovie da edição', canal: 'INSTAGRAM', publicarEm: dias(35), status: 'IDEIA', responsavelNome: null },
    ],
  },
  {
    id: 'cp-03',
    atleticaSlug: 'dragoes',
    nome: 'Recrutamento de calouros',
    objetivo: 'Trazer 40 novos membros ativos no semestre',
    metaValor: 40,
    metaUnidade: 'novos membros',
    atual: 12,
    inicioEm: dias(-5),
    fimEm: dias(75),
    responsavelNome: 'Marina Alencar',
    patrocinioId: null,
    conteudos: [
      { id: 'ct-12', titulo: 'O que é a atlética, em 60 segundos', canal: 'TIKTOK', publicarEm: dias(3), status: 'PRODUCAO', responsavelNome: 'Isabela Cunha' },
      { id: 'ct-13', titulo: 'Roda de conversa com calouros', canal: 'PRESENCIAL', publicarEm: dias(12), status: 'AGENDADO', responsavelNome: 'Marina Alencar' },
      { id: 'ct-14', titulo: 'Depoimento de quem entrou ano passado', canal: 'INSTAGRAM', publicarEm: dias(20), status: 'IDEIA', responsavelNome: null },
    ],
  },
]

interface SementeDeMidia {
  nome: string
  pasta: Midia['pasta']
  tipo: Midia['tipo']
  quandoDias: number
  autor: string
  kb: number
}

const SEMENTES_DE_MIDIA: SementeDeMidia[] = [
  { nome: 'Brasão — versão principal', pasta: 'LOGO', tipo: 'VETOR', quandoDias: -620, autor: 'Helena Vasques', kb: 240 },
  { nome: 'Brasão — versão monocromática', pasta: 'LOGO', tipo: 'VETOR', quandoDias: -620, autor: 'Helena Vasques', kb: 180 },
  { nome: 'Brasão — fundo transparente', pasta: 'LOGO', tipo: 'IMAGEM', quandoDias: -300, autor: 'Helena Vasques', kb: 420 },
  { nome: 'Camisa 2026 — frente', pasta: 'UNIFORMES', tipo: 'IMAGEM', quandoDias: -44, autor: 'Estúdio Quadra Foto', kb: 1840 },
  { nome: 'Camisa 2026 — costas', pasta: 'UNIFORMES', tipo: 'IMAGEM', quandoDias: -44, autor: 'Estúdio Quadra Foto', kb: 1760 },
  { nome: 'Uniforme de vôlei feminino', pasta: 'UNIFORMES', tipo: 'IMAGEM', quandoDias: -58, autor: 'Camila Toledo', kb: 1320 },
  { nome: 'Moletom — ensaio', pasta: 'UNIFORMES', tipo: 'IMAGEM', quandoDias: -30, autor: 'Estúdio Quadra Foto', kb: 2100 },
  { nome: 'Calourada 2026 — abertura', pasta: 'EVENTOS', tipo: 'IMAGEM', quandoDias: -180, autor: 'Thiago Rezende', kb: 2480 },
  { nome: 'Calourada 2026 — pista', pasta: 'EVENTOS', tipo: 'IMAGEM', quandoDias: -180, autor: 'Thiago Rezende', kb: 2610 },
  { nome: 'Treino aberto de vôlei', pasta: 'EVENTOS', tipo: 'IMAGEM', quandoDias: -22, autor: 'Larissa Prado', kb: 1490 },
  { nome: 'Aftermovie da Calourada', pasta: 'EVENTOS', tipo: 'VIDEO', quandoDias: -170, autor: 'Corta Certo Vídeo', kb: 48200 },
  { nome: 'Interatlética 2025 — pódio geral', pasta: 'CAMPEONATOS', tipo: 'IMAGEM', quandoDias: -278, autor: 'Estúdio Quadra Foto', kb: 3120 },
  { nome: 'Interatlética 2025 — final de futsal', pasta: 'CAMPEONATOS', tipo: 'IMAGEM', quandoDias: -278, autor: 'Estúdio Quadra Foto', kb: 2890 },
  { nome: 'Tabela de jogos 2026 — carrossel', pasta: 'CAMPEONATOS', tipo: 'IMAGEM', quandoDias: -3, autor: 'Helena Vasques', kb: 960 },
  { nome: 'Arte da campanha da camisa', pasta: 'CAMPANHAS', tipo: 'VETOR', quandoDias: -45, autor: 'Helena Vasques', kb: 620 },
  { nome: 'Teaser da camisa — story', pasta: 'CAMPANHAS', tipo: 'VIDEO', quandoDias: -40, autor: 'Isabela Cunha', kb: 12400 },
  { nome: 'Campanha do agasalho — arte', pasta: 'CAMPANHAS', tipo: 'VETOR', quandoDias: -140, autor: 'Helena Vasques', kb: 540 },
  { nome: 'Ótica Vale — logo', pasta: 'PATROCINADORES', tipo: 'VETOR', quandoDias: -150, autor: 'Diego Marinho', kb: 90 },
  { nome: 'Padaria do Campus — logo', pasta: 'PATROCINADORES', tipo: 'VETOR', quandoDias: -40, autor: 'Larissa Prado', kb: 78 },
  { nome: 'Placa de patrocinadores — Interatlética', pasta: 'PATROCINADORES', tipo: 'IMAGEM', quandoDias: -12, autor: 'Helena Vasques', kb: 1180 },
  { nome: 'Diretoria 2025', pasta: 'HISTORICO', tipo: 'IMAGEM', quandoDias: -400, autor: 'Bruno Sarmento', kb: 2240 },
  { nome: 'Diretoria 2024', pasta: 'HISTORICO', tipo: 'IMAGEM', quandoDias: -760, autor: 'Isabela Cunha', kb: 1980 },
  { nome: 'Primeira sede da atlética', pasta: 'HISTORICO', tipo: 'IMAGEM', quandoDias: -1100, autor: 'Arquivo', kb: 1420 },
]

export const MIDIAS: Midia[] = SEMENTES_DE_MIDIA.map((s, i) => ({
  id: `mi-${String(i + 1).padStart(2, '0')}`,
  atleticaSlug: 'dragoes',
  nome: s.nome,
  pasta: s.pasta,
  tipo: s.tipo,
  cor: corDerivada(s.nome),
  adicionadaEm: dias(s.quandoDias),
  autorNome: s.autor,
  tamanhoEmKb: s.kb,
}))
