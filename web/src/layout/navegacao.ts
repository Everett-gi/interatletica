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
 *
 * <p><strong>`semServidor` marca o que ainda não tem endpoint.</strong> No app
 * real esses itens somem; na demonstração todos aparecem. A marca fica aqui, e
 * não numa lista à parte, porque lista paralela é o que envelhece primeiro:
 * quando a API de tarefas existir, some a marca da linha de tarefas e pronto.</p>
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
  /**
   * A tela existe, mas ainda não tem endpoint.
   *
   * <p>No app real ela some da navegação: mostrar dado fictício ao lado do
   * que a atlética cadastrou de verdade é o jeito mais fácil de alguém
   * decidir em cima de número inventado. Na demonstração todas aparecem —
   * lá o combinado é justamente mostrar a plataforma inteira.</p>
   */
  semServidor?: boolean
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
      { para: 'atletica', rotulo: 'Visão geral', icone: 'atletica', semServidor: true },
      { para: 'membros', rotulo: 'Membros', icone: 'membros' },
      { para: 'diretoria', rotulo: 'Diretoria', icone: 'diretoria' },
      { para: 'gestao', rotulo: 'Gestão', icone: 'gestao', semServidor: true },
      { para: 'documentos', rotulo: 'Documentos', icone: 'documentos', semServidor: true },
      { para: 'patrimonio', rotulo: 'Patrimônio', icone: 'patrimonio', exige: 'DIRETOR',
        semServidor: true },
      { para: 'relatorios', rotulo: 'Indicadores', icone: 'resultados', exige: 'DIRETOR',
        semServidor: true },
    ],
  },
  {
    titulo: 'Gestão',
    itens: [
      { para: 'tarefas', rotulo: 'Tarefas', icone: 'tarefas', exige: 'DIRETOR',
        contador: 'tarefas', semServidor: true },
      { para: 'projetos', rotulo: 'Projetos', icone: 'projetos', exige: 'DIRETOR',
        semServidor: true },
      { para: 'reunioes', rotulo: 'Reuniões', icone: 'reunioes', exige: 'DIRETOR',
        semServidor: true },
      { para: 'decisoes', rotulo: 'Decisões', icone: 'decisoes', exige: 'DIRETOR',
        contador: 'decisoes', semServidor: true },
      { para: 'metas', rotulo: 'Metas', icone: 'metas', exige: 'DIRETOR', semServidor: true },
    ],
  },
  {
    titulo: 'Eventos',
    itens: [
      { para: 'calendario', rotulo: 'Calendário', icone: 'calendario', semServidor: true },
      { para: 'eventos', rotulo: 'Eventos', icone: 'eventos' },
      { para: 'campeonatos', rotulo: 'Campeonatos', icone: 'campeonatos', semServidor: true },
      { para: 'inscricoes', rotulo: 'Inscrições', icone: 'inscricoes', exige: 'DIRETOR' },
      { para: 'viagens', rotulo: 'Viagens', icone: 'viagens', semServidor: true },
    ],
  },
  {
    titulo: 'Esportes',
    itens: [
      { para: 'equipes', rotulo: 'Equipes', icone: 'equipes', semServidor: true },
      { para: 'atletas', rotulo: 'Atletas', icone: 'atletas', semServidor: true },
      { para: 'jogos', rotulo: 'Jogos', icone: 'jogos', semServidor: true },
      { para: 'resultados', rotulo: 'Resultados', icone: 'resultados', semServidor: true },
    ],
  },
  {
    titulo: 'Financeiro',
    itens: [
      { para: 'financeiro', rotulo: 'Visão geral', icone: 'financeiro', exige: 'DIRETOR',
        exato: true, semServidor: true },
      { para: 'financeiro/receitas', rotulo: 'Receitas', icone: 'receitas', exige: 'DIRETOR',
        semServidor: true },
      { para: 'financeiro/despesas', rotulo: 'Despesas', icone: 'despesas', exige: 'DIRETOR',
        semServidor: true },
      { para: 'financeiro/orcamento', rotulo: 'Orçamento', icone: 'orcamento', exige: 'DIRETOR',
        semServidor: true },
      { para: 'financeiro/prestacao-de-contas', rotulo: 'Prestação de contas',
        icone: 'prestacao', semServidor: true },
    ],
  },
  {
    titulo: 'Rede',
    itens: [
      { para: 'rede', rotulo: 'Explorar atléticas', icone: 'explorar', exato: true,
        semServidor: true },
      { para: 'rede/feed', rotulo: 'Feed', icone: 'feed', semServidor: true },
      { para: 'rede/comunidades', rotulo: 'Comunidades', icone: 'comunidades',
        semServidor: true },
      { para: 'rede/parcerias', rotulo: 'Parcerias', icone: 'parcerias', semServidor: true },
      { para: 'rede/ajuda', rotulo: 'Pedidos de ajuda', icone: 'ajuda', contador: 'ajuda',
        semServidor: true },
      { para: 'rede/amistosos', rotulo: 'Amistosos', icone: 'amistosos', semServidor: true },
    ],
  },
  {
    titulo: 'Conhecimento',
    itens: [
      { para: 'conhecimento', rotulo: 'Guias', icone: 'guias', exato: true, semServidor: true },
      { para: 'conhecimento/modelos', rotulo: 'Modelos', icone: 'modelos', semServidor: true },
      { para: 'conhecimento/experiencias', rotulo: 'Experiências', icone: 'experiencias',
        semServidor: true },
      { para: 'conhecimento/mentoria', rotulo: 'Mentoria', icone: 'mentoria',
        semServidor: true },
      { para: 'conhecimento/talentos', rotulo: 'Banco de talentos', icone: 'talentos',
        semServidor: true },
    ],
  },
  {
    titulo: 'Mercado',
    itens: [
      { para: 'mercado/fornecedores', rotulo: 'Fornecedores', icone: 'fornecedores',
        semServidor: true },
      { para: 'mercado/oportunidades', rotulo: 'Oportunidades', icone: 'mercado',
        semServidor: true },
      { para: 'mercado/compras', rotulo: 'Compras coletivas', icone: 'compras',
        semServidor: true },
      { para: 'mercado/patrocinios', rotulo: 'Patrocínios', icone: 'patrocinios',
        exige: 'DIRETOR', semServidor: true },
      { para: 'loja', rotulo: 'Loja', icone: 'loja', semServidor: true },
    ],
  },
  {
    titulo: 'Comunicação',
    itens: [
      { para: 'comunicacao', rotulo: 'Notícias', icone: 'noticias', exato: true,
        semServidor: true },
      { para: 'avisos', rotulo: 'Avisos', icone: 'comunicacao', semServidor: true },
      { para: 'comunicacao/campanhas', rotulo: 'Campanhas', icone: 'campanhas',
        exige: 'DIRETOR', semServidor: true },
      { para: 'comunicacao/midia', rotulo: 'Biblioteca de mídia', icone: 'midia',
        exige: 'DIRETOR', semServidor: true },
    ],
  },
]

/** O que o botão "+ Criar" oferece (§99). */
export interface AcaoRapida {
  rotulo: string
  icone: NomeDoIcone
  para: string
  exige?: Papel
  /** Mesma regra do item de navegação: some no app real. */
  semServidor?: boolean
}

export const ACOES_RAPIDAS: AcaoRapida[] = [
  { rotulo: 'Evento', icone: 'eventos', para: 'eventos/novo', exige: 'DIRETOR' },
  { rotulo: 'Convite de membro', icone: 'membros', para: 'membros?convidar=1',
    exige: 'PRESIDENTE' },
  { rotulo: 'Projeto', icone: 'projetos', para: 'projetos/novo', exige: 'DIRETOR',
    semServidor: true },
  { rotulo: 'Tarefa', icone: 'tarefas', para: 'tarefas?novo=1', exige: 'DIRETOR',
    semServidor: true },
  { rotulo: 'Reunião', icone: 'reunioes', para: 'reunioes?novo=1', exige: 'DIRETOR',
    semServidor: true },
  { rotulo: 'Decisão', icone: 'decisoes', para: 'decisoes?novo=1', exige: 'DIRETOR',
    semServidor: true },
  { rotulo: 'Aviso', icone: 'comunicacao', para: 'avisos?novo=1', exige: 'DIRETOR',
    semServidor: true },
  { rotulo: 'Lançamento financeiro', icone: 'financeiro', para: 'financeiro/despesas?novo=1',
    exige: 'DIRETOR', semServidor: true },
  { rotulo: 'Pedido de ajuda', icone: 'ajuda', para: 'rede/ajuda?novo=1', semServidor: true },
  { rotulo: 'Amistoso', icone: 'amistosos', para: 'rede/amistosos?novo=1', exige: 'DIRETOR',
    semServidor: true },
]
