/**
 * O conjunto de ícones da plataforma.
 *
 * <p>Desenhados aqui, em SVG de traço, em vez de instalar uma biblioteca:
 * são cerca de cinquenta símbolos usados na navegação e nos cabeçalhos, e
 * qualquer pacote de ícones custaria mais bytes do que este arquivo inteiro
 * — justamente na primeira visita, que é a que decide se a pessoa espera
 * carregar ou fecha.</p>
 *
 * <p>Todos partilham a mesma gramática: grade de 24, traço de 1,7,
 * extremidades arredondadas e {@code currentColor}. É o que faz a sidebar
 * parecer um conjunto, e não um mural de figurinhas de origens diferentes —
 * o §103 chama isso de "ícones sem significado"; o inverso começa por eles
 * parecerem da mesma família.</p>
 */

export type NomeDoIcone =
  | 'inicio' | 'atletica' | 'membros' | 'diretoria' | 'gestao' | 'documentos'
  | 'patrimonio' | 'tarefas' | 'projetos' | 'reunioes' | 'decisoes' | 'metas'
  | 'calendario' | 'eventos' | 'campeonatos' | 'inscricoes' | 'equipes'
  | 'atletas' | 'jogos' | 'resultados' | 'financeiro' | 'receitas' | 'despesas'
  | 'orcamento' | 'prestacao' | 'rede' | 'explorar' | 'feed' | 'comunidades'
  | 'parcerias' | 'ajuda' | 'amistosos' | 'conhecimento' | 'guias' | 'modelos'
  | 'experiencias' | 'perguntas' | 'mercado' | 'fornecedores' | 'compras'
  | 'patrocinios' | 'comunicacao' | 'noticias' | 'campanhas' | 'midia' | 'loja'
  | 'viagens' | 'busca' | 'sino' | 'mais' | 'fechar' | 'menu' | 'direita'
  | 'esquerda' | 'baixo' | 'cima' | 'filtro' | 'grade' | 'lista' | 'local'
  | 'usuario' | 'sair' | 'ajustes' | 'sol' | 'lua' | 'verificado' | 'alerta'
  | 'info' | 'relogio' | 'externo' | 'baixar' | 'estrela' | 'certo' | 'mentoria'
  | 'talentos' | 'social' | 'historico' | 'transicao' | 'painel'

/** Cada ícone é uma lista de elementos SVG já montados. */
const TRACOS: Record<NomeDoIcone, JSX.Element> = {
  inicio: <><path d="M3.5 10.6 12 3.6l8.5 7" /><path d="M5.8 9.4V20h12.4V9.4" /><path d="M9.8 20v-5.2h4.4V20" /></>,
  atletica: <><path d="M12 3.2 19 6v5.4c0 4.2-2.8 7.7-7 8.6-4.2-.9-7-4.4-7-8.6V6l7-2.8Z" /><path d="M9.4 11.6 11.3 14l3.4-3.9" /></>,
  membros: <><circle cx="9" cy="8.4" r="3.2" /><path d="M3.2 19.6c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2" /><path d="M16.6 5.6a3 3 0 0 1 0 5.7" /><path d="M17.4 14.8c2.1.6 3.4 2.4 3.4 4.8" /></>,
  diretoria: <><rect x="9" y="3.2" width="6" height="4.2" rx="1.2" /><rect x="3.2" y="16.4" width="5.6" height="4.2" rx="1.2" /><rect x="15.2" y="16.4" width="5.6" height="4.2" rx="1.2" /><path d="M12 7.4v4.4M6 16.4v-2.4h12v2.4" /></>,
  gestao: <><rect x="3.2" y="7.2" width="17.6" height="12.6" rx="2" /><path d="M8.8 7.2V5.6a1.8 1.8 0 0 1 1.8-1.8h2.8a1.8 1.8 0 0 1 1.8 1.8v1.6" /><path d="M3.2 12.4h17.6" /></>,
  documentos: <><path d="M3.4 7.2a1.8 1.8 0 0 1 1.8-1.8h3.6l2 2.4h7.8a1.8 1.8 0 0 1 1.8 1.8v8.6a1.8 1.8 0 0 1-1.8 1.8H5.2a1.8 1.8 0 0 1-1.8-1.8Z" /></>,
  patrimonio: <><path d="m12 3.4 8 4.1v9L12 20.6 4 16.5v-9Z" /><path d="M4 7.5l8 4.1 8-4.1M12 11.6v9" /></>,
  tarefas: <><rect x="3.2" y="4.4" width="4.8" height="15.2" rx="1.4" /><rect x="9.6" y="4.4" width="4.8" height="10.4" rx="1.4" /><rect x="16" y="4.4" width="4.8" height="13" rx="1.4" /></>,
  projetos: <><path d="m12 3.2 8.4 4.3-8.4 4.3-8.4-4.3Z" /><path d="m4.4 12 7.6 3.9 7.6-3.9" /><path d="m4.4 16.4 7.6 3.9 7.6-3.9" /></>,
  reunioes: <><circle cx="12" cy="12" r="3.4" /><circle cx="12" cy="4.6" r="1.6" /><circle cx="12" cy="19.4" r="1.6" /><circle cx="4.6" cy="12" r="1.6" /><circle cx="19.4" cy="12" r="1.6" /></>,
  decisoes: <><path d="M12 3.4v6.2" /><path d="M12 9.6 6 14.4M12 9.6l6 4.8" /><circle cx="12" cy="3.4" r="1.4" /><circle cx="5.4" cy="16.6" r="2.6" /><circle cx="18.6" cy="16.6" r="2.6" /></>,
  metas: <><circle cx="12" cy="12" r="8.2" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r="1.2" /></>,
  calendario: <><rect x="3.4" y="5" width="17.2" height="15.4" rx="2" /><path d="M3.4 9.8h17.2M8.2 3.4v3.2M15.8 3.4v3.2" /></>,
  eventos: <><path d="M3.4 8.6a2 2 0 0 1 2-2h13.2a2 2 0 0 1 2 2v1.6a2 2 0 0 0 0 3.6v1.6a2 2 0 0 1-2 2H5.4a2 2 0 0 1-2-2v-1.6a2 2 0 0 0 0-3.6Z" /><path d="M13.6 6.6v10.8" /></>,
  campeonatos: <><path d="M7.4 4h9.2v5.2a4.6 4.6 0 0 1-9.2 0Z" /><path d="M7.4 5.6H4.8v1.6a3 3 0 0 0 2.6 3M16.6 5.6h2.6v1.6a3 3 0 0 1-2.6 3" /><path d="M12 13.8v3.4M8.6 20.4h6.8l-.8-3.2H9.4Z" /></>,
  inscricoes: <><rect x="5" y="4.4" width="14" height="16" rx="2" /><path d="M9 3.2h6v3H9z" /><path d="M8.6 11.4h6.8M8.6 15.4h4.4" /></>,
  equipes: <><path d="M8.6 4.2 12 6l3.4-1.8 4 2.2-1.8 3.4-1.6-.8v10.6H7.9V9l-1.5.8L4.6 6.4Z" /></>,
  atletas: <><circle cx="12" cy="6.6" r="2.8" /><path d="M12 9.4v5.4M12 14.8l-3.2 5.4M12 14.8l3.2 5.4M7.6 11.4 12 12.6l4.4-1.2" /></>,
  jogos: <><path d="m4 4 6.4 6.4M4 20l6.4-6.4M20 4l-6.4 6.4M20 20l-6.4-6.4" /><circle cx="12" cy="12" r="2.2" /></>,
  resultados: <><path d="M3.6 20.4h16.8" /><rect x="5.4" y="12.4" width="3.4" height="8" rx="1" /><rect x="10.4" y="7.4" width="3.4" height="13" rx="1" /><rect x="15.4" y="3.6" width="3.4" height="16.8" rx="1" /></>,
  financeiro: <><rect x="3.2" y="6" width="17.6" height="13" rx="2.2" /><path d="M3.2 10.4h17.6" /><circle cx="16.6" cy="14.8" r="1.4" /></>,
  receitas: <><circle cx="12" cy="12" r="8.4" /><path d="M12 16.2V7.8M8.4 11.4 12 7.8l3.6 3.6" /></>,
  despesas: <><circle cx="12" cy="12" r="8.4" /><path d="M12 7.8v8.4M8.4 12.6 12 16.2l3.6-3.6" /></>,
  orcamento: <><path d="M12 3.6v8.4h8.4A8.4 8.4 0 0 0 12 3.6Z" /><path d="M20 14.6A8.4 8.4 0 1 1 9.8 4.1" /></>,
  prestacao: <><path d="M6 3.4h8l4.4 4.4v12.8H6Z" /><path d="M13.6 3.4v4.8h4.8" /><path d="m9.2 14.6 2 2 3.6-4" /></>,
  rede: <><circle cx="12" cy="5.2" r="2.4" /><circle cx="5" cy="17.4" r="2.4" /><circle cx="19" cy="17.4" r="2.4" /><path d="m10.7 7.4-4.4 7.7M13.3 7.4l4.4 7.7M7.4 17.4h9.2" /></>,
  explorar: <><circle cx="12" cy="12" r="8.4" /><path d="m15.4 8.6-1.8 5-5 1.8 1.8-5Z" /></>,
  feed: <><path d="M4.6 5.4h14.8M4.6 10.2h14.8M4.6 15h9.8M4.6 19.4h6.4" /></>,
  comunidades: <><path d="M4 6.4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-3.6 3v-3H6a2 2 0 0 1-2-2Z" /><path d="M19.4 8.6a2 2 0 0 1 .6 1.4v6.4a2 2 0 0 1-2 2h-.4v2.6l-3-2.6" /></>,
  parcerias: <><path d="m3.4 12 3.2-3.2 4 1.4 2.8-2.4 3.6 1.2 3.6-1.6" /><path d="m3.4 12 4.4 4.4a1.6 1.6 0 0 0 2.3 0l1.1-1.1 1.6 1.6a1.6 1.6 0 0 0 2.3-2.3l1.4 1.4a1.6 1.6 0 0 0 2.3-2.3l-3.7-3.7" /></>,
  ajuda: <><circle cx="12" cy="12" r="8.4" /><path d="M9.7 9.6a2.4 2.4 0 1 1 3.3 2.2c-.7.3-1 .9-1 1.6v.4" /><circle cx="12" cy="16.6" r=".7" fill="currentColor" stroke="none" /></>,
  amistosos: <><path d="M3.6 4.4h3l9.4 12.4h4.4" /><path d="M17 3.4h3v3M17 20.6h3v-3" /><path d="M3.6 19.6h3l3.4-4.4" /><path d="M13.6 8.8 17 4.4" /></>,
  conhecimento: <><path d="M5 4.4h11.6a2 2 0 0 1 2 2v13.2H7a2 2 0 0 1-2-2Z" /><path d="M5 17.6a2 2 0 0 1 2-2h11.6" /></>,
  guias: <><path d="M12 6.8C10.6 5.2 8.6 4.6 5 4.6v12.6c3.6 0 5.6.6 7 2.2 1.4-1.6 3.4-2.2 7-2.2V4.6c-3.6 0-5.6.6-7 2.2Z" /><path d="M12 6.8v12.6" /></>,
  modelos: <><rect x="5" y="3.6" width="14" height="16.8" rx="2" /><path d="M8.6 8h6.8M8.6 12h6.8M8.6 16h3.8" /></>,
  experiencias: <><path d="M9 17.4a5.4 5.4 0 1 1 6 0v1.2H9Z" /><path d="M9.8 20.6h4.4" /></>,
  perguntas: <><path d="M4 6.4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2h-7l-4 3.4v-3.4H6a2 2 0 0 1-2-2Z" /><path d="M10.2 8.8a2 2 0 1 1 2.6 1.9c-.5.2-.8.7-.8 1.2" /><circle cx="12" cy="14.2" r=".65" fill="currentColor" stroke="none" /></>,
  mercado: <><path d="M4 9.4h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" /><path d="M3.4 9.4 5.2 4.2h13.6l1.8 5.2" /><path d="M8.4 9.4v-5M15.6 9.4v-5" /></>,
  fornecedores: <><path d="M3.2 6.6h10.2v9.8H3.2Z" /><path d="M13.4 10h3.8l2.6 3v3.4h-6.4Z" /><circle cx="7" cy="18" r="1.8" /><circle cx="16.6" cy="18" r="1.8" /></>,
  compras: <><path d="M4.6 7.4h14.8l-1.2 11.4a1.6 1.6 0 0 1-1.6 1.4H7.4a1.6 1.6 0 0 1-1.6-1.4Z" /><path d="M8.8 9.6V6.4a3.2 3.2 0 0 1 6.4 0v3.2" /></>,
  patrocinios: <><rect x="3.2" y="6.4" width="17.6" height="11.2" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6.6 12h.02M17.4 12h.02" /></>,
  comunicacao: <><path d="M4 9.6 15.4 5v14L4 14.4Z" /><path d="M4 9.6H3.2a1.4 1.4 0 0 0-1.4 1.4v2a1.4 1.4 0 0 0 1.4 1.4H4" /><path d="M18.4 9.4a3.6 3.6 0 0 1 0 5.2" /><path d="M7.6 15.4v3.2a1.6 1.6 0 0 0 3.2 0v-2" /></>,
  noticias: <><rect x="3.2" y="5.4" width="14" height="13.6" rx="1.6" /><path d="M17.2 9h2.2a1.4 1.4 0 0 1 1.4 1.4v6.6a2 2 0 0 1-4 0" /><path d="M6.2 8.8h8M6.2 12.2h8M6.2 15.6h5" /></>,
  campanhas: <><path d="M8.6 14.6 6 20.4l4.4-2 2-4.2" /><path d="M14.4 3.8c3 1.4 5 4.4 5.4 7.8-2.6 2.4-6 3.6-9.4 3.4L7.6 12c.4-3.4 2.6-6.6 6.8-8.2Z" /><circle cx="14.4" cy="9.6" r="1.6" /></>,
  midia: <><rect x="3.4" y="5" width="17.2" height="14" rx="2" /><circle cx="8.6" cy="9.8" r="1.6" /><path d="m4.2 17.4 4.8-4.4 3.4 3 3-2.6 4.4 4" /></>,
  loja: <><path d="m4 12.6 8-8.4h7.4v7.4l-8.2 8.2a1.4 1.4 0 0 1-2 0L4 14.6a1.4 1.4 0 0 1 0-2Z" /><circle cx="16" cy="8" r="1.3" /></>,
  viagens: <><rect x="4" y="4.4" width="16" height="12.4" rx="2.2" /><path d="M4 11.4h16M8.4 4.4v7M15.6 4.4v7" /><path d="M7 16.8v2.4M17 16.8v2.4" /></>,
  busca: <><circle cx="10.8" cy="10.8" r="6.6" /><path d="m15.6 15.6 4.4 4.4" /></>,
  sino: <><path d="M6.4 10.4a5.6 5.6 0 0 1 11.2 0c0 4 1.4 5.4 1.4 5.4H5s1.4-1.4 1.4-5.4Z" /><path d="M10.2 19a2 2 0 0 0 3.6 0" /></>,
  mais: <><path d="M12 5.2v13.6M5.2 12h13.6" /></>,
  fechar: <><path d="m6 6 12 12M18 6 6 18" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  direita: <><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></>,
  esquerda: <><path d="M14.5 5.5 8 12l6.5 6.5" /></>,
  baixo: <><path d="m5.5 9.5 6.5 6.5 6.5-6.5" /></>,
  cima: <><path d="m5.5 14.5 6.5-6.5 6.5 6.5" /></>,
  filtro: <><path d="M3.6 5.4h16.8l-6.4 7.6v5.8l-4 2v-7.8Z" /></>,
  grade: <><rect x="4" y="4" width="6.6" height="6.6" rx="1.4" /><rect x="13.4" y="4" width="6.6" height="6.6" rx="1.4" /><rect x="4" y="13.4" width="6.6" height="6.6" rx="1.4" /><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.4" /></>,
  lista: <><path d="M8.6 6.4h11.4M8.6 12h11.4M8.6 17.6h11.4" /><circle cx="4.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" /><circle cx="4.6" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="4.6" cy="17.6" r="1.1" fill="currentColor" stroke="none" /></>,
  local: <><path d="M12 20.6s6.6-5.6 6.6-10.2a6.6 6.6 0 1 0-13.2 0C5.4 15 12 20.6 12 20.6Z" /><circle cx="12" cy="10.2" r="2.4" /></>,
  usuario: <><circle cx="12" cy="9" r="3.6" /><path d="M5.2 19.8c0-3.4 3-5.6 6.8-5.6s6.8 2.2 6.8 5.6" /></>,
  sair: <><path d="M14.4 5.2H6.4a1.6 1.6 0 0 0-1.6 1.6v10.4a1.6 1.6 0 0 0 1.6 1.6h8" /><path d="m15.6 8.4 3.6 3.6-3.6 3.6M19.2 12h-8.8" /></>,
  ajustes: <><path d="M4.4 7.4h15.2M4.4 16.6h15.2" /><circle cx="9.4" cy="7.4" r="2.2" /><circle cx="15" cy="16.6" r="2.2" /></>,
  sol: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" /></>,
  lua: <><path d="M19.4 14.6A7.8 7.8 0 0 1 9.4 4.6a7.8 7.8 0 1 0 10 10Z" /></>,
  verificado: <><path d="m12 3.2 2.2 1.9 2.9-.2.8 2.8 2.5 1.5-1.1 2.7 1.1 2.7-2.5 1.5-.8 2.8-2.9-.2L12 20.8l-2.2-1.9-2.9.2-.8-2.8L3.6 14.8l1.1-2.7-1.1-2.7 2.5-1.5.8-2.8 2.9.2Z" /><path d="m9.4 12 1.9 1.9 3.5-4" /></>,
  alerta: <><path d="M12 4.2 21 19.4H3Z" /><path d="M12 10.2v3.6" /><circle cx="12" cy="16.6" r=".7" fill="currentColor" stroke="none" /></>,
  info: <><circle cx="12" cy="12" r="8.4" /><path d="M12 11.2v5" /><circle cx="12" cy="8.2" r=".7" fill="currentColor" stroke="none" /></>,
  relogio: <><circle cx="12" cy="12" r="8.4" /><path d="M12 7.4V12l3 1.8" /></>,
  externo: <><path d="M13.4 4.6H19.4v6" /><path d="m19.4 4.6-8 8" /><path d="M18 13.6v4.8a1.6 1.6 0 0 1-1.6 1.6H5.8a1.6 1.6 0 0 1-1.6-1.6V7.8a1.6 1.6 0 0 1 1.6-1.6h4.8" /></>,
  baixar: <><path d="M12 4v10.4M8 11l4 3.6 4-3.6" /><path d="M4.6 18.4v1a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-1" /></>,
  estrela: <><path d="m12 3.8 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.9l5.8-.8Z" /></>,
  certo: <><path d="m5 12.6 4.6 4.6L19 6.8" /></>,
  mentoria: <><path d="m12 4.4 8.4 4-8.4 4-8.4-4Z" /><path d="M7.2 10.6v4.6c0 1.7 2.1 3 4.8 3s4.8-1.3 4.8-3v-4.6" /><path d="M20.4 8.4v5.2" /></>,
  talentos: <><circle cx="9.4" cy="8.4" r="3.2" /><path d="M3.6 19.4c0-3 2.6-5 5.8-5 1.2 0 2.3.3 3.2.8" /><path d="m17.4 12.4 1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4Z" /></>,
  social: <><path d="M12 20.2s-7.4-4.4-7.4-9.4A4.2 4.2 0 0 1 12 8.2a4.2 4.2 0 0 1 7.4 2.6c0 5-7.4 9.4-7.4 9.4Z" /></>,
  historico: <><path d="M3.8 12a8.2 8.2 0 1 0 2.6-6" /><path d="M3.4 3.4v4.4h4.4" /><path d="M12 7.8V12l3 1.8" /></>,
  transicao: <><path d="M4 8.4h11.6M12 4.8l3.6 3.6L12 12" /><path d="M20 15.6H8.4M12 19.2l-3.6-3.6L12 12" /></>,
  painel: <><rect x="3.4" y="3.8" width="7.4" height="8.6" rx="1.6" /><rect x="13.2" y="3.8" width="7.4" height="5.4" rx="1.6" /><rect x="3.4" y="15.2" width="7.4" height="5" rx="1.6" /><rect x="13.2" y="12" width="7.4" height="8.2" rx="1.6" /></>,
}

export function Icone({ nome, tamanho = 20, titulo }: {
  nome: NomeDoIcone
  tamanho?: number
  /** Quando o ícone é a única etiqueta do controle. Sem isso, fica oculto. */
  titulo?: string
}) {
  return (
    <svg
      className="icone"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={titulo ? 'img' : undefined}
      aria-hidden={titulo ? undefined : 'true'}
      aria-label={titulo}
      focusable="false"
    >
      {titulo ? <title>{titulo}</title> : null}
      {TRACOS[nome]}
    </svg>
  )
}
