import { Link, Route, Routes } from 'react-router-dom'
import { Aparelho } from './layout/Aparelho'

import { Onboarding } from './paginas/plataforma/Onboarding'

// Início e minha atlética.
import { Painel } from './paginas/hub/Painel'
import { VisaoGeral } from './paginas/hub/atletica/VisaoGeral'
import { Membros } from './paginas/hub/Membros'
import { Diretoria } from './paginas/hub/atletica/Diretoria'
import { Gestoes } from './paginas/hub/atletica/Gestoes'
import { RelatorioDaGestao } from './paginas/hub/atletica/RelatorioDaGestao'
import { Transicao } from './paginas/hub/atletica/Transicao'
import { Documentos } from './paginas/hub/atletica/Documentos'
import { Patrimonio } from './paginas/hub/atletica/Patrimonio'

// Gestão.
import { Tarefas } from './paginas/hub/Tarefas'
import { Projetos } from './paginas/hub/gestao/Projetos'
import { NovoProjeto } from './paginas/hub/gestao/NovoProjeto'
import { DetalheDoProjeto } from './paginas/hub/gestao/DetalheDoProjeto'
import { Reunioes } from './paginas/hub/gestao/Reunioes'
import { DetalheDaReuniao } from './paginas/hub/gestao/DetalheDaReuniao'
import { Decisoes } from './paginas/hub/gestao/Decisoes'
import { DetalheDaDecisao } from './paginas/hub/gestao/DetalheDaDecisao'
import { Metas } from './paginas/hub/gestao/Metas'

// Eventos e esportes.
import { Calendario } from './paginas/hub/esportes/Calendario'
import { Eventos } from './paginas/hub/Eventos'
import { EditorDeEvento } from './paginas/hub/EditorDeEvento'
import { DetalheDoEvento } from './paginas/hub/DetalheDoEvento'
import { Chaveamento } from './paginas/hub/Chaveamento'
import { Campeonatos } from './paginas/hub/esportes/Campeonatos'
import { DetalheDoCampeonato } from './paginas/hub/esportes/DetalheDoCampeonato'
import { Inscricoes } from './paginas/hub/esportes/Inscricoes'
import { Viagens } from './paginas/hub/esportes/Viagens'
import { Equipes } from './paginas/hub/Equipes'
import { DetalheDaEquipe } from './paginas/hub/esportes/DetalheDaEquipe'
import { Atletas } from './paginas/hub/esportes/Atletas'
import { Jogos } from './paginas/hub/esportes/Jogos'
import { Resultados } from './paginas/hub/esportes/Resultados'

// Financeiro.
import { Financeiro } from './paginas/hub/financeiro/Financeiro'
import { Lancamentos } from './paginas/hub/financeiro/Lancamentos'
import { Orcamento } from './paginas/hub/financeiro/Orcamento'
import { PrestacaoDeContas } from './paginas/hub/financeiro/PrestacaoDeContas'

// Rede.
import { ExplorarAtleticas } from './paginas/hub/rede/ExplorarAtleticas'
import { Feed } from './paginas/hub/rede/Feed'
import { Comunidades } from './paginas/hub/rede/Comunidades'
import { DetalheDaComunidade } from './paginas/hub/rede/DetalheDaComunidade'
import { Parcerias } from './paginas/hub/rede/Parcerias'
import { PedidosDeAjuda } from './paginas/hub/rede/PedidosDeAjuda'
import { DetalheDoPedido } from './paginas/hub/rede/DetalheDoPedido'
import { Amistosos } from './paginas/hub/rede/Amistosos'

// Conhecimento.
import { Guias } from './paginas/hub/conhecimento/Guias'
import { DetalheDoGuia } from './paginas/hub/conhecimento/DetalheDoGuia'
import { Modelos } from './paginas/hub/conhecimento/Modelos'
import { Experiencias } from './paginas/hub/conhecimento/Experiencias'
import { DetalheDaExperiencia } from './paginas/hub/conhecimento/DetalheDaExperiencia'
import { Mentoria } from './paginas/hub/conhecimento/Mentoria'
import { Talentos } from './paginas/hub/conhecimento/Talentos'

// Mercado.
import { Fornecedores } from './paginas/hub/mercado/Fornecedores'
import { DetalheDoFornecedor } from './paginas/hub/mercado/DetalheDoFornecedor'
import { Oportunidades } from './paginas/hub/mercado/Oportunidades'
import { ComprasColetivas } from './paginas/hub/mercado/ComprasColetivas'
import { Patrocinios } from './paginas/hub/mercado/Patrocinios'
import { Loja } from './paginas/hub/mercado/Loja'

// Comunicação.
import { Noticias } from './paginas/hub/comunicacao/Noticias'
import { Campanhas } from './paginas/hub/comunicacao/Campanhas'
import { DetalheDaCampanha } from './paginas/hub/comunicacao/DetalheDaCampanha'
import { BibliotecaDeMidia } from './paginas/hub/comunicacao/BibliotecaDeMidia'
import { Avisos } from './paginas/hub/Avisos'
import { Relatorios } from './paginas/hub/Relatorios'

/**
 * Todas as telas do ambiente de trabalho, num módulo só — carregado sob
 * demanda.
 *
 * <p>Este arquivo existe por causa do peso. São mais de quarenta telas, e
 * quem abre um link de evento no WhatsApp não usa nenhuma delas. Manter tudo
 * no mesmo pacote faria a página pública — a que mais abre em rede ruim, na
 * porta do ginásio — pagar pelo app inteiro antes de mostrar a primeira
 * linha.</p>
 *
 * <p>O `App` importa isto com `lazy`, então o download acontece quando
 * alguém entra em `/hub/…`, e não antes.</p>
 */
export default function RotasDoHub() {
  return (
    <Routes>
      <Route element={<Aparelho />}>
        <Route index element={<Painel />} />
        <Route path="boas-vindas" element={<Onboarding />} />

        {/* Minha atlética */}
        <Route path="atletica" element={<VisaoGeral />} />
        <Route path="membros" element={<Membros />} />
        <Route path="diretoria" element={<Diretoria />} />
        <Route path="gestao" element={<Gestoes />} />
        <Route path="gestao/transicao" element={<Transicao />} />
        <Route path="gestao/:ano" element={<RelatorioDaGestao />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="patrimonio" element={<Patrimonio />} />

        {/* Gestão */}
        <Route path="tarefas" element={<Tarefas />} />
        <Route path="projetos" element={<Projetos />} />
        <Route path="projetos/novo" element={<NovoProjeto />} />
        <Route path="projetos/:id" element={<DetalheDoProjeto />} />
        <Route path="reunioes" element={<Reunioes />} />
        <Route path="reunioes/:id" element={<DetalheDaReuniao />} />
        <Route path="decisoes" element={<Decisoes />} />
        <Route path="decisoes/:id" element={<DetalheDaDecisao />} />
        <Route path="metas" element={<Metas />} />

        {/* Eventos */}
        <Route path="calendario" element={<Calendario />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="eventos/novo" element={<EditorDeEvento />} />
        <Route path="eventos/:eventoId" element={<DetalheDoEvento />} />
        <Route path="eventos/:eventoId/editar" element={<EditorDeEvento />} />
        <Route path="eventos/:eventoId/torneio" element={<Chaveamento />} />
        <Route path="campeonatos" element={<Campeonatos />} />
        <Route path="campeonatos/:id" element={<DetalheDoCampeonato />} />
        <Route path="inscricoes" element={<Inscricoes />} />
        <Route path="viagens" element={<Viagens />} />

        {/* Esportes */}
        <Route path="equipes" element={<Equipes />} />
        <Route path="equipes/:id" element={<DetalheDaEquipe />} />
        <Route path="atletas" element={<Atletas />} />
        <Route path="jogos" element={<Jogos />} />
        <Route path="resultados" element={<Resultados />} />

        {/* Financeiro */}
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="financeiro/receitas" element={<Lancamentos natureza="RECEITA" />} />
        <Route path="financeiro/despesas" element={<Lancamentos natureza="DESPESA" />} />
        <Route path="financeiro/orcamento" element={<Orcamento />} />
        <Route path="financeiro/prestacao-de-contas" element={<PrestacaoDeContas />} />

        {/* Rede */}
        <Route path="rede" element={<ExplorarAtleticas />} />
        <Route path="rede/feed" element={<Feed />} />
        <Route path="rede/comunidades" element={<Comunidades />} />
        <Route path="rede/comunidades/:id" element={<DetalheDaComunidade />} />
        <Route path="rede/parcerias" element={<Parcerias />} />
        <Route path="rede/ajuda" element={<PedidosDeAjuda />} />
        <Route path="rede/ajuda/:id" element={<DetalheDoPedido />} />
        <Route path="rede/amistosos" element={<Amistosos />} />

        {/* Conhecimento */}
        <Route path="conhecimento" element={<Guias />} />
        <Route path="conhecimento/guias/:id" element={<DetalheDoGuia />} />
        <Route path="conhecimento/modelos" element={<Modelos />} />
        <Route path="conhecimento/experiencias" element={<Experiencias />} />
        <Route path="conhecimento/experiencias/:id" element={<DetalheDaExperiencia />} />
        <Route path="conhecimento/mentoria" element={<Mentoria />} />
        <Route path="conhecimento/talentos" element={<Talentos />} />

        {/* Mercado */}
        <Route path="mercado/fornecedores" element={<Fornecedores />} />
        <Route path="mercado/fornecedores/:id" element={<DetalheDoFornecedor />} />
        <Route path="mercado/oportunidades" element={<Oportunidades />} />
        <Route path="mercado/compras" element={<ComprasColetivas />} />
        {/* O feed aponta para uma compra específica; a lista já mostra todas
            e destaca a que interessa, então não há detalhe separado. */}
        <Route path="mercado/compras/:id" element={<ComprasColetivas />} />
        <Route path="mercado/patrocinios" element={<Patrocinios />} />
        <Route path="loja" element={<Loja />} />

        {/* Comunicação */}
        <Route path="comunicacao" element={<Noticias />} />
        <Route path="comunicacao/campanhas" element={<Campanhas />} />
        <Route path="comunicacao/campanhas/:id" element={<DetalheDaCampanha />} />
        <Route path="comunicacao/midia" element={<BibliotecaDeMidia />} />
        <Route path="avisos" element={<Avisos />} />
        <Route path="relatorios" element={<Relatorios />} />

        <Route path="*" element={<SecaoNaoEncontrada />} />
      </Route>
    </Routes>
  )
}

function SecaoNaoEncontrada() {
  return (
    <div className="vazio">
      <h2>Seção não encontrada</h2>
      <p>Este endereço não existe dentro da atlética.</p>
      <Link to="." className="botao botao--discreto">Voltar ao início</Link>
    </div>
  )
}
