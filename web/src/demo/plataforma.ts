/**
 * Notificações, conquistas, rankings, comparação com a rede e a
 * administração geral.
 */

import type {
  Conquista,
  Denuncia,
  Indicador,
  LinhaDeRanking,
  Notificacao,
  PainelDaRede,
  PassoDeOnboarding,
  TipoDeRanking,
} from '../api/tipos-plataforma'
import { ATLETICAS, dias } from './dados'

export const NOTIFICACOES: Notificacao[] = [
  { id: 'nf-01', categoria: 'GESTAO', titulo: 'Votação aberta: fornecedor dos uniformes', detalhe: 'Faltam 2 dias e o quórum ainda não foi atingido.', quando: dias(-1, 9), lida: false, destino: 'decisoes/dc-01', urgente: true, atleticaSlug: 'dragoes' },
  { id: 'nf-02', categoria: 'EVENTOS', titulo: 'Interatlética 2026 começa em 23 dias', detalhe: '418 inscritos confirmados. Duas tarefas críticas ainda abertas.', quando: dias(-1, 8), lida: false, destino: 'eventos/e-01', urgente: false, atleticaSlug: 'dragoes' },
  { id: 'nf-03', categoria: 'GESTAO', titulo: 'Tarefa atrasada: publicar regulamento das modalidades', detalhe: 'Prazo venceu ontem. Responsável: Diego Marinho.', quando: dias(-1, 7), lida: false, destino: 'tarefas', urgente: true, atleticaSlug: 'dragoes' },
  { id: 'nf-04', categoria: 'REDE', titulo: 'Nova resposta ao seu pedido de ajuda', detalhe: 'Isabela Cunha indicou um fornecedor com prazo de 28 dias.', quando: dias(-2, 19), lida: false, destino: 'rede/ajuda/pa-03', urgente: false, atleticaSlug: 'dragoes' },
  { id: 'nf-05', categoria: 'FINANCEIRO', titulo: 'Prestação de contas de agosto publicada', detalhe: 'Saldo do mês: −R$ 2.380. Visível para os membros.', quando: dias(-4, 9), lida: true, destino: 'financeiro/prestacao-de-contas', urgente: false, atleticaSlug: 'dragoes' },
  { id: 'nf-06', categoria: 'ESPORTES', titulo: 'Semifinal de Valorant em andamento', detalhe: 'Corujas A 1 × 1 Panteras Squad.', quando: dias(0, 19, 30), lida: false, destino: null, urgente: false, atleticaSlug: 'corujas' },
  { id: 'nf-07', categoria: 'REDE', titulo: 'Compra coletiva precisa de 260 peças para fechar', detalhe: 'Com mil unidades o desconto sobe de 18% para 27%.', quando: dias(-5, 11), lida: true, destino: 'mercado/compras/cc-01', urgente: false, atleticaSlug: null },
  { id: 'nf-08', categoria: 'MENSAGENS', titulo: 'Bruno Sarmento comentou em Atléticas do Vale', detalhe: 'Procurando carona para Serra Alta no dia 18.', quando: dias(-1, 12), lida: true, destino: 'rede/comunidades/cm-01', urgente: false, atleticaSlug: null },
  { id: 'nf-09', categoria: 'EVENTOS', titulo: 'Calourada: 27 pessoas na lista de espera', detalhe: 'A promoção é automática se alguém cancelar.', quando: dias(-8, 15), lida: true, destino: 'eventos/e-02', urgente: false, atleticaSlug: 'dragoes' },
  { id: 'nf-10', categoria: 'GESTAO', titulo: 'Transição 2026 → 2027: 8 itens pendentes', detalhe: 'Acessos de redes sociais ainda não foram transferidos.', quando: dias(-3, 10), lida: true, destino: 'gestao/transicao', urgente: false, atleticaSlug: 'dragoes' },
  { id: 'nf-11', categoria: 'FINANCEIRO', titulo: 'Despesa em atraso: reposição de bolas e redes', detalhe: 'R$ 1.600 previstos e não executados desde o inventário.', quando: dias(-2, 16), lida: true, destino: 'financeiro/despesas', urgente: false, atleticaSlug: 'dragoes' },
  { id: 'nf-12', categoria: 'REDE', titulo: 'Atlética Leões quer marcar amistoso de futsal', detalhe: 'Dia 12, quadra deles, arbitragem por conta da casa.', quando: dias(-6, 18), lida: true, destino: 'rede/amistosos', urgente: false, atleticaSlug: 'dragoes' },
]

export const CONQUISTAS: Conquista[] = [
  { id: 'cq-01', titulo: 'Primeiro evento', descricao: 'Publicou e realizou o primeiro evento da atlética.', icone: '🎉', conquistadaEm: dias(-620) },
  { id: 'cq-02', titulo: 'Primeiro campeonato', descricao: 'Organizou um torneio com chaveamento completo.', icone: '🏆', conquistadaEm: dias(-280) },
  { id: 'cq-03', titulo: 'Primeira parceria', descricao: 'Fechou uma parceria com outra atlética ou empresa.', icone: '🤝', conquistadaEm: dias(-150) },
  { id: 'cq-04', titulo: 'Primeiro projeto social', descricao: 'Concluiu um projeto com impacto fora da universidade.', icone: '🌱', conquistadaEm: dias(-70) },
  { id: 'cq-05', titulo: 'Contribuiu com a rede', descricao: 'Publicou uma experiência que outra atlética marcou como útil.', icone: '📚', conquistadaEm: dias(-12) },
  { id: 'cq-06', titulo: 'Contas em dia', descricao: 'Publicou a prestação de contas por seis meses seguidos.', icone: '📊', conquistadaEm: null },
  { id: 'cq-07', titulo: 'Memória preservada', descricao: 'Concluiu uma transição de gestão com o checklist completo.', icone: '🗝️', conquistadaEm: null },
  { id: 'cq-08', titulo: 'Mentora da rede', descricao: 'Ofereceu mentoria e acompanhou outra atlética até o fim.', icone: '🧭', conquistadaEm: null },
]

export const INDICADORES: Indicador[] = [
  { rotulo: 'Membros ativos', valor: 94, unidade: null, variacao: 16, media: 72 },
  { rotulo: 'Eventos no ano', valor: 7, unidade: null, variacao: -22, media: 6 },
  { rotulo: 'Participação média por evento', valor: 168, unidade: 'pessoas', variacao: 12, media: 121 },
  { rotulo: 'Taxa de presença', valor: 74, unidade: '%', variacao: 4, media: 68 },
  { rotulo: 'Projetos concluídos', valor: 3, unidade: null, variacao: -40, media: 3 },
  { rotulo: 'Receita no ano', valor: 41360, unidade: 'R$', variacao: 28, media: 26400 },
  { rotulo: 'Patrocinadores ativos', valor: 2, unidade: null, variacao: 0, media: 2 },
  { rotulo: 'Equipes ativas', valor: 6, unidade: null, variacao: 20, media: 5 },
  { rotulo: 'Ações sociais', valor: 1, unidade: null, variacao: 0, media: 1 },
  { rotulo: 'Contribuições à base de conhecimento', valor: 4, unidade: null, variacao: 300, media: 1 },
]

export const RANKINGS: Record<TipoDeRanking, LinhaDeRanking[]> = {
  ESPORTIVO: [
    { posicao: 1, atletica: ATLETICAS[0], valor: 38, rotuloDoValor: 'pontos', variacao: 1 },
    { posicao: 2, atletica: ATLETICAS[2], valor: 34, rotuloDoValor: 'pontos', variacao: -1 },
    { posicao: 3, atletica: ATLETICAS[3], valor: 30, rotuloDoValor: 'pontos', variacao: 2 },
    { posicao: 4, atletica: ATLETICAS[1], valor: 28, rotuloDoValor: 'pontos', variacao: 0 },
    { posicao: 5, atletica: ATLETICAS[4], valor: 17, rotuloDoValor: 'pontos', variacao: -2 },
    { posicao: 6, atletica: ATLETICAS[5], valor: 11, rotuloDoValor: 'pontos', variacao: 0 },
  ],
  PARTICIPACAO: [
    { posicao: 1, atletica: ATLETICAS[2], valor: 82, rotuloDoValor: '% de presença', variacao: 2 },
    { posicao: 2, atletica: ATLETICAS[0], valor: 74, rotuloDoValor: '% de presença', variacao: 1 },
    { posicao: 3, atletica: ATLETICAS[1], valor: 71, rotuloDoValor: '% de presença', variacao: -2 },
    { posicao: 4, atletica: ATLETICAS[3], valor: 69, rotuloDoValor: '% de presença', variacao: 0 },
    { posicao: 5, atletica: ATLETICAS[5], valor: 64, rotuloDoValor: '% de presença', variacao: 1 },
    { posicao: 6, atletica: ATLETICAS[4], valor: 58, rotuloDoValor: '% de presença', variacao: -2 },
  ],
  COLABORACAO: [
    { posicao: 1, atletica: ATLETICAS[0], valor: 14, rotuloDoValor: 'contribuições', variacao: 3 },
    { posicao: 2, atletica: ATLETICAS[2], valor: 12, rotuloDoValor: 'contribuições', variacao: 0 },
    { posicao: 3, atletica: ATLETICAS[4], valor: 9, rotuloDoValor: 'contribuições', variacao: 1 },
    { posicao: 4, atletica: ATLETICAS[1], valor: 7, rotuloDoValor: 'contribuições', variacao: -2 },
    { posicao: 5, atletica: ATLETICAS[3], valor: 5, rotuloDoValor: 'contribuições', variacao: 0 },
    { posicao: 6, atletica: ATLETICAS[5], valor: 3, rotuloDoValor: 'contribuições', variacao: -2 },
  ],
  SOCIAL: [
    { posicao: 1, atletica: ATLETICAS[2], valor: 4, rotuloDoValor: 'projetos', variacao: 1 },
    { posicao: 2, atletica: ATLETICAS[0], valor: 3, rotuloDoValor: 'projetos', variacao: 0 },
    { posicao: 3, atletica: ATLETICAS[5], valor: 2, rotuloDoValor: 'projetos', variacao: 2 },
    { posicao: 4, atletica: ATLETICAS[1], valor: 2, rotuloDoValor: 'projetos', variacao: -1 },
    { posicao: 5, atletica: ATLETICAS[4], valor: 1, rotuloDoValor: 'projetos', variacao: 0 },
    { posicao: 6, atletica: ATLETICAS[3], valor: 1, rotuloDoValor: 'projetos', variacao: -1 },
  ],
  ORGANIZACAO: [
    { posicao: 1, atletica: ATLETICAS[0], valor: 96, rotuloDoValor: '% de registros em dia', variacao: 2 },
    { posicao: 2, atletica: ATLETICAS[2], valor: 94, rotuloDoValor: '% de registros em dia', variacao: 0 },
    { posicao: 3, atletica: ATLETICAS[1], valor: 88, rotuloDoValor: '% de registros em dia', variacao: 1 },
    { posicao: 4, atletica: ATLETICAS[4], valor: 81, rotuloDoValor: '% de registros em dia', variacao: -1 },
    { posicao: 5, atletica: ATLETICAS[3], valor: 76, rotuloDoValor: '% de registros em dia', variacao: 0 },
    { posicao: 6, atletica: ATLETICAS[5], valor: 62, rotuloDoValor: '% de registros em dia', variacao: -2 },
  ],
}

const DENUNCIAS: Denuncia[] = [
  { id: 'dn-01', conteudo: 'Post no feed: "Vendo ingresso da Calourada"', motivo: 'Revenda não autorizada', autorAtletica: 'Atlética Leões', quando: dias(-2), situacao: 'EM_ANALISE' },
  { id: 'dn-02', conteudo: 'Resposta em pedido de ajuda', motivo: 'Linguagem ofensiva', autorAtletica: 'Atlética Furacão', quando: dias(-5), situacao: 'PROCEDENTE' },
  { id: 'dn-03', conteudo: 'Perfil de fornecedor "Gráfica Rápida SP"', motivo: 'Contato inexistente', autorAtletica: 'Atlética Panteras', quando: dias(-9), situacao: 'ABERTA' },
  { id: 'dn-04', conteudo: 'Comentário em comunidade', motivo: 'Spam comercial', autorAtletica: 'Atlética Corujas', quando: dias(-14), situacao: 'IMPROCEDENTE' },
]

export const PAINEL_DA_REDE: PainelDaRede = {
  atleticas: 1240,
  usuarios: 42800,
  eventos: 3420,
  crescimento: 18,
  novasAtleticas: 34,
  atleticasPorMes: [
    { rotulo: 'Mar', valor: 1104 },
    { rotulo: 'Abr', valor: 1132 },
    { rotulo: 'Mai', valor: 1158 },
    { rotulo: 'Jun', valor: 1181 },
    { rotulo: 'Jul', valor: 1206 },
    { rotulo: 'Ago', valor: 1240 },
  ],
  eventosPorMes: [
    { rotulo: 'Mar', valor: 412 },
    { rotulo: 'Abr', valor: 486 },
    { rotulo: 'Mai', valor: 521 },
    { rotulo: 'Jun', valor: 498 },
    { rotulo: 'Jul', valor: 604 },
    { rotulo: 'Ago', valor: 899 },
  ],
  denunciasAbertas: 2,
  aguardandoVerificacao: [
    { atletica: ATLETICAS[5], pedidoEm: dias(-3) },
    { atletica: ATLETICAS[4], pedidoEm: dias(-11) },
  ],
  denuncias: DENUNCIAS,
}

export const PASSOS_DE_ONBOARDING: PassoDeOnboarding[] = [
  { id: 'ob-01', titulo: 'Complete o perfil da atlética', descricao: 'Nome, instituição, cidade e as cores que pintam o seu hub.', concluido: true, destino: 'atletica', acao: 'Ver o perfil' },
  { id: 'ob-02', titulo: 'Monte a diretoria', descricao: 'Cargo com escopo escrito evita presidente fazendo tudo.', concluido: true, destino: 'diretoria', acao: 'Ver a diretoria' },
  { id: 'ob-03', titulo: 'Convide os membros', descricao: 'A entrada é por convite endereçado, não por cadastro aberto.', concluido: true, destino: 'membros', acao: 'Convidar' },
  { id: 'ob-04', titulo: 'Defina as metas da gestão', descricao: 'Três a seis metas com número. O resto é intenção.', concluido: true, destino: 'metas', acao: 'Ver metas' },
  { id: 'ob-05', titulo: 'Cadastre suas equipes', descricao: 'A equipe é da atlética e atravessa os eventos.', concluido: true, destino: 'equipes', acao: 'Ver equipes' },
  { id: 'ob-06', titulo: 'Crie o primeiro projeto', descricao: 'Comece de um modelo da rede em vez de partir do zero.', concluido: true, destino: 'projetos/novo', acao: 'Usar um modelo' },
  { id: 'ob-07', titulo: 'Publique o primeiro evento', descricao: 'Nasce como rascunho. Nada fica visível até você publicar.', concluido: true, destino: 'eventos/novo', acao: 'Criar evento' },
  { id: 'ob-08', titulo: 'Entre em uma comunidade da rede', descricao: 'É por onde chega quem já resolveu o que você está começando.', concluido: false, destino: 'rede/comunidades', acao: 'Explorar' },
  { id: 'ob-09', titulo: 'Registre a primeira prestação de contas', descricao: 'Fechar todo mês, mesmo o mês vazio, é o que evita o buraco.', concluido: false, destino: 'financeiro/prestacao-de-contas', acao: 'Fechar o mês' },
  { id: 'ob-10', titulo: 'Compartilhe uma experiência', descricao: 'O que você aprendeu evita que outra atlética pague o mesmo preço.', concluido: false, destino: 'conhecimento/experiencias', acao: 'Escrever' },
]
