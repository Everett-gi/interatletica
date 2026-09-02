/**
 * A estrutura da navegação, num lugar só.
 *
 * <p>Declarativa de propósito. Com onze grupos e mais de quarenta destinos,
 * espalhar `<NavLink>` pelo JSX transformaria "quem enxerga o quê" numa
 * caçada por condicional — e a primeira coisa a apodrecer seria justamente a
 * permissão. Aqui o requisito de papel viaja junto do item.</p>
 *
 * <p>Agrupar não é decoração: são os blocos do §6. Quarenta itens soltos numa
 * coluna não é navegação, é lista telefônica.</p>
 */

import type { Papel } from '../api/tipos'
import type { NomeDoIcone } from '../ui/icones'

export interface ItemDeNavegacao {
  /** Caminho relativo ao hub da atlética. Vazio é a raiz do hub. */
  para: string
  rotulo: string
  icone: NomeDoIcone
  /** Papel mínimo. Ausente significa "qualquer pessoa com vínculo". */
  exige?: Papel
  /** Só casa a rota exata. Usado na raiz e onde há subrota irmã. */
  exato?: boolean
  /** Nome do contador em `ContagensDaNavegacao`, quando o item tem selo. */
  contador?: 'tarefas' | 'decisoes' | 'ajuda'
}

export interface GrupoDeNavegacao {
  titulo: string | null
  itens: ItemDeNavegacao[]
}

export interface ContagensDaNavegacao {
  tarefas: number
  decisoes: number
  ajuda: number
}

export const NAVEGACAO: GrupoDeNavegacao[] = [
  {
    titulo: null,
    itens: [
      { para: '', rotulo: 'Início', icone: 'inicio', exato: true },
    ],
  },
  {
    titulo: 'Minha atlética',
    itens: [
      { para: 'atletica', rotulo: 'Visão geral', icone: 'atletica' },
      { para: 'membros', rotulo: 'Membros', icone: 'membros' },
      { para: 'diretoria', rotulo: 'Diretoria', icone: 'diretoria' },
      { para: 'gestao', rotulo: 'Gestão', icone: 'gestao' },
      { para: 'documentos', rotulo: 'Documentos', icone: 'documentos' },
      { para: 'patrimonio', rotulo: 'Patrimônio', icone: 'patrimonio', exige: 'DIRETOR' },
    ],
  },
  {
    titulo: 'Gestão',
    itens: [
      { para: 'tarefas', rotulo: 'Tarefas', icone: 'tarefas', exige: 'DIRETOR', contador: 'tarefas' },
      { para: 'projetos', rotulo: 'Projetos', icone: 'projetos', exige: 'DIRETOR' },
      { para: 'reunioes', rotulo: 'Reuniões', icone: 'reunioes', exige: 'DIRETOR' },
      { para: 'decisoes', rotulo: 'Decisões', icone: 'decisoes', exige: 'DIRETOR', contador: 'decisoes' },
      { para: 'metas', rotulo: 'Metas', icone: 'metas', exige: 'DIRETOR' },
    ],
  },
  {
    titulo: 'Eventos',
    itens: [
      { para: 'calendario', rotulo: 'Calendário', icone: 'calendario' },
      { para: 'eventos', rotulo: 'Eventos', icone: 'eventos' },
      { para: 'campeonatos', rotulo: 'Campeonatos', icone: 'campeonatos' },
      { para: 'inscricoes', rotulo: 'Inscrições', icone: 'inscricoes', exige: 'DIRETOR' },
      { para: 'viagens', rotulo: 'Viagens', icone: 'viagens' },
    ],
  },
  {
    titulo: 'Esportes',
    itens: [
      { para: 'equipes', rotulo: 'Equipes', icone: 'equipes' },
      { para: 'atletas', rotulo: 'Atletas', icone: 'atletas' },
      { para: 'jogos', rotulo: 'Jogos', icone: 'jogos' },
      { para: 'resultados', rotulo: 'Resultados', icone: 'resultados' },
    ],
  },
  {
    titulo: 'Financeiro',
    itens: [
      { para: 'financeiro', rotulo: 'Visão geral', icone: 'financeiro', exige: 'DIRETOR', exato: true },
      { para: 'financeiro/receitas', rotulo: 'Receitas', icone: 'receitas', exige: 'DIRETOR' },
      { para: 'financeiro/despesas', rotulo: 'Despesas', icone: 'despesas', exige: 'DIRETOR' },
      { para: 'financeiro/orcamento', rotulo: 'Orçamento', icone: 'orcamento', exige: 'DIRETOR' },
      { para: 'financeiro/prestacao-de-contas', rotulo: 'Prestação de contas', icone: 'prestacao' },
    ],
  },
  {
    titulo: 'Rede',
    itens: [
      { para: 'rede', rotulo: 'Explorar atléticas', icone: 'explorar', exato: true },
      { para: 'rede/feed', rotulo: 'Feed', icone: 'feed' },
      { para: 'rede/comunidades', rotulo: 'Comunidades', icone: 'comunidades' },
      { para: 'rede/parcerias', rotulo: 'Parcerias', icone: 'parcerias' },
      { para: 'rede/ajuda', rotulo: 'Pedidos de ajuda', icone: 'ajuda', contador: 'ajuda' },
      { para: 'rede/amistosos', rotulo: 'Amistosos', icone: 'amistosos' },
    ],
  },
  {
    titulo: 'Conhecimento',
    itens: [
      { para: 'conhecimento', rotulo: 'Guias', icone: 'guias', exato: true },
      { para: 'conhecimento/modelos', rotulo: 'Modelos', icone: 'modelos' },
      { para: 'conhecimento/experiencias', rotulo: 'Experiências', icone: 'experiencias' },
      { para: 'conhecimento/mentoria', rotulo: 'Mentoria', icone: 'mentoria' },
      { para: 'conhecimento/talentos', rotulo: 'Banco de talentos', icone: 'talentos' },
    ],
  },
  {
    titulo: 'Mercado',
    itens: [
      { para: 'mercado/fornecedores', rotulo: 'Fornecedores', icone: 'fornecedores' },
      { para: 'mercado/oportunidades', rotulo: 'Oportunidades', icone: 'mercado' },
      { para: 'mercado/compras', rotulo: 'Compras coletivas', icone: 'compras' },
      { para: 'mercado/patrocinios', rotulo: 'Patrocínios', icone: 'patrocinios', exige: 'DIRETOR' },
      { para: 'loja', rotulo: 'Loja', icone: 'loja' },
    ],
  },
  {
    titulo: 'Comunicação',
    itens: [
      { para: 'comunicacao', rotulo: 'Notícias', icone: 'noticias', exato: true },
      { para: 'avisos', rotulo: 'Avisos', icone: 'comunicacao' },
      { para: 'comunicacao/campanhas', rotulo: 'Campanhas', icone: 'campanhas', exige: 'DIRETOR' },
      { para: 'comunicacao/midia', rotulo: 'Biblioteca de mídia', icone: 'midia', exige: 'DIRETOR' },
    ],
  },
]

/** O que o botão "+ Criar" oferece (§99). */
export interface AcaoRapida {
  rotulo: string
  icone: NomeDoIcone
  para: string
  exige?: Papel
}

export const ACOES_RAPIDAS: AcaoRapida[] = [
  { rotulo: 'Evento', icone: 'eventos', para: 'eventos/novo', exige: 'DIRETOR' },
  { rotulo: 'Projeto', icone: 'projetos', para: 'projetos/novo', exige: 'DIRETOR' },
  { rotulo: 'Tarefa', icone: 'tarefas', para: 'tarefas?novo=1', exige: 'DIRETOR' },
  { rotulo: 'Reunião', icone: 'reunioes', para: 'reunioes?novo=1', exige: 'DIRETOR' },
  { rotulo: 'Decisão', icone: 'decisoes', para: 'decisoes?novo=1', exige: 'DIRETOR' },
  { rotulo: 'Aviso', icone: 'comunicacao', para: 'avisos?novo=1', exige: 'DIRETOR' },
  { rotulo: 'Lançamento financeiro', icone: 'financeiro', para: 'financeiro/despesas?novo=1', exige: 'DIRETOR' },
  { rotulo: 'Pedido de ajuda', icone: 'ajuda', para: 'rede/ajuda?novo=1' },
  { rotulo: 'Amistoso', icone: 'amistosos', para: 'rede/amistosos?novo=1', exige: 'DIRETOR' },
  { rotulo: 'Convite de membro', icone: 'membros', para: 'membros?convidar=1', exige: 'PRESIDENTE' },
]
