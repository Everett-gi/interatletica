import { Suspense, lazy } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { MODO_DEMO } from './dados'
import { useSessao } from './sessao/SessaoContexto'
import { Carregando } from './ui/componentes'
import { Icone } from './ui/icones'

// Públicas: o que abre a partir de um link compartilhado.
import { Rede } from './paginas/Rede'
import { QuadroDeMedalhas } from './paginas/QuadroDeMedalhas'
import { Boasvindas } from './paginas/Boasvindas'
import { AtleticaPublica } from './paginas/AtleticaPublica'
import { PaginaPublicaDoEvento } from './paginas/PaginaPublicaDoEvento'
import { Convite } from './paginas/Convite'
import { MeuPerfil } from './paginas/MeuPerfil'
import { Portaria } from './paginas/hub/Portaria'

// Da pessoa e da plataforma, fora do contexto de uma atlética.
import { CentralDeAjuda } from './paginas/plataforma/CentralDeAjuda'
import { MeuHistorico } from './paginas/plataforma/MeuHistorico'
import { AdministracaoDaRede } from './paginas/plataforma/AdministracaoDaRede'

/**
 * As telas de trabalho vêm num pacote à parte, baixado só quando alguém
 * entra em `/hub/…`. São mais de quarenta, e quem abre um link de evento no
 * WhatsApp não usa nenhuma delas.
 */
const RotasDoHub = lazy(() => import('./RotasDoHub'))

/**
 * A estrutura do app em duas frases.
 *
 * <p><strong>A atlética é o lugar; o evento é a unidade de trabalho.</strong>
 * E há dois ambientes distintos, com cascas diferentes:</p>
 *
 * <ul>
 *   <li><strong>O público</strong> — topo simples e conteúdo estreito. É o que
 *       abre num link de WhatsApp: página da atlética, página do evento,
 *       convite. Quem chega ali não tem navegação de produto para usar, e
 *       oferecer uma só atrapalha.</li>
 *   <li><strong>O ambiente de trabalho</strong> — barra lateral com onze
 *       grupos, topo com pesquisa, notificações e seletor de organização.
 *       É onde a diretoria passa o tempo, e onde vale a densidade.</li>
 * </ul>
 *
 * <p>Duas decisões de organização que valem registro, porque a versão
 * anterior errava as duas:</p>
 *
 * <ul>
 *   <li><strong>A porta de entrada é a SUA atlética</strong>, não um feed
 *       geral. Quem entra aqui vem organizar o próprio campeonato, não
 *       descobrir o que os outros estão fazendo. A rede existe, e é
 *       essencial — mas ela serve ao trabalho, não o substitui.</li>
 *   <li><strong>Torneio não é seção paralela; é parte do evento.</strong> Um
 *       campeonato É um evento — o schema sempre disse isso, com
 *       {@code torneio.evento_id} obrigatório. A seção Campeonatos dá um
 *       atalho para quem pensa "quero ver a tabela", sem duplicar o
 *       conceito.</li>
 * </ul>
 */
export function App() {
  return (
    <Routes>
      {/* Tela de tarefa única: a portaria roda de pé, no escuro, com uma
          mão. Barra lateral e pesquisa global só atrapalhariam. Fica fora do
          pacote sob demanda porque é a tela mais urgente do sistema. */}
      <Route path="/hub/:slug/eventos/:eventoId/portaria" element={<Portaria />} />

      {/* O ambiente de trabalho da atlética. */}
      <Route
        path="/hub/:slug/*"
        element={
          <Suspense fallback={<Carregando rotulo="Abrindo sua atlética" />}>
            <RotasDoHub />
          </Suspense>
        }
      />

      {/* O público e o que não pertence a uma atlética só. */}
      <Route element={<LayoutPublico />}>
        <Route path="/" element={<PortaDeEntrada />} />
        <Route path="/rede" element={<Rede />} />
        <Route path="/rede/quadro" element={<QuadroDeMedalhas />} />
        <Route path="/a/:slug" element={<AtleticaPublica />} />
        <Route path="/e/:atleticaSlug/:eventoSlug" element={<PaginaPublicaDoEvento />} />
        <Route path="/convite/:token" element={<Convite />} />
        <Route path="/eu" element={<MeuPerfil />} />
        <Route path="/eu/historico" element={<MeuHistorico />} />
        <Route path="/ajuda" element={<CentralDeAjuda />} />
        <Route path="/administracao" element={<AdministracaoDaRede />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}

/** A casca pública: topo simples, conteúdo estreito, rodapé. */
function LayoutPublico() {
  return (
    <div className="aplicacao">
      {MODO_DEMO ? <FaixaDeDemonstracao /> : null}
      <Topo />
      <main className="conteudo">
        <Outlet />
      </main>
      <Rodape />
    </div>
  )
}

/**
 * Quem tem vínculo cai direto na própria atlética. Quem não tem vê o que a
 * plataforma é.
 *
 * <p>A versão anterior abria num feed de eventos de todas as atléticas.
 * Ficava bonito e respondia a pergunta errada: quem entra aqui quer
 * organizar o próprio campeonato.</p>
 */
function PortaDeEntrada() {
  const { perfil, carregando } = useSessao()

  if (carregando) {
    return <Carregando />
  }
  if (perfil && perfil.atleticas.length > 0) {
    return <Navigate to={`/hub/${perfil.atleticas[0].atletica.slug}`} replace />
  }
  return <Boasvindas />
}

function FaixaDeDemonstracao() {
  return (
    <div className="faixa-demo">
      Demonstração navegável · dados fictícios, alterações não são salvas
    </div>
  )
}

function Topo() {
  const { perfil, carregando, aparencia, trocarAparencia, assumirPapel } = useSessao()

  return (
    <header className="topo">
      <div className="topo__interno">
        <Link to="/" className="marca">
          <span className="marca__simbolo">IA</span>
          Interatlética
        </Link>

        <span className="espaco" />

        <NavLink to="/rede" className="navegacao__item">Outras atléticas</NavLink>
        <NavLink to="/ajuda" className="navegacao__item so-desktop">Ajuda</NavLink>

        <button
          className="icone-botao"
          onClick={trocarAparencia}
          aria-label={`Mudar para tema ${aparencia === 'escura' ? 'claro' : 'escuro'}`}
        >
          <Icone nome={aparencia === 'escura' ? 'sol' : 'lua'} tamanho={18} />
        </button>

        {carregando ? null : perfil ? (
          <>
            {perfil.atleticas.length > 0 ? (
              <Link to={`/hub/${perfil.atleticas[0].atletica.slug}`}
                    className="botao botao--pequeno">
                Minha atlética
              </Link>
            ) : null}
            <NavLink to="/eu" className="navegacao__item">
              {perfil.nome.split(' ')[0]}
            </NavLink>
          </>
        ) : MODO_DEMO ? (
          <button className="botao botao--pequeno"
                  onClick={() => void assumirPapel('PRESIDENTE')}>
            Entrar
          </button>
        ) : (
          <a className="botao botao--pequeno" href="/oauth2/authorization/google">
            Entrar
          </a>
        )}
      </div>
    </header>
  )
}

function Rodape() {
  return (
    <footer className="rodape">
      Território comum. Nenhuma atlética é dona da plataforma; cada uma é dona
      dos seus dados.
    </footer>
  )
}

function NaoEncontrada() {
  return (
    <div className="vazio">
      <h2>Página não encontrada</h2>
      <p>O link pode ter mudado ou o conteúdo pode ter sido removido.</p>
      <Link to="/" className="botao botao--discreto">Voltar ao início</Link>
    </div>
  )
}
