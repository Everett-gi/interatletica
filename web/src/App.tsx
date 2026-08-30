import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import { MODO_DEMO } from './dados'
import { useSessao } from './sessao/SessaoContexto'
import { Carregando } from './ui/componentes'

import { Descoberta } from './paginas/Descoberta'
import { Rede } from './paginas/Rede'
import { QuadroDeMedalhas } from './paginas/QuadroDeMedalhas'
import { AtleticaPublica } from './paginas/AtleticaPublica'
import { PaginaPublicaDoEvento } from './paginas/PaginaPublicaDoEvento'
import { Convite } from './paginas/Convite'
import { MeuPerfil } from './paginas/MeuPerfil'

import { Painel } from './paginas/hub/Painel'
import { Eventos } from './paginas/hub/Eventos'
import { EditorDeEvento } from './paginas/hub/EditorDeEvento'
import { DetalheDoEvento } from './paginas/hub/DetalheDoEvento'
import { Portaria } from './paginas/hub/Portaria'
import { Equipes } from './paginas/hub/Equipes'
import { Torneios } from './paginas/hub/Torneios'
import { Chaveamento } from './paginas/hub/Chaveamento'
import { Tarefas } from './paginas/hub/Tarefas'
import { Avisos } from './paginas/hub/Avisos'
import { Membros } from './paginas/hub/Membros'
import { Relatorios } from './paginas/hub/Relatorios'

export function App() {
  return (
    <div className="aplicacao">
      {MODO_DEMO ? <FaixaDeDemonstracao /> : null}
      <Topo />

      <main className="conteudo">
        <Routes>
          {/* -------- Público -------- */}
          <Route path="/" element={<Descoberta />} />
          <Route path="/rede" element={<Rede />} />
          <Route path="/quadro" element={<QuadroDeMedalhas />} />
          <Route path="/a/:slug" element={<AtleticaPublica />} />
          <Route path="/e/:atleticaSlug/:eventoSlug" element={<PaginaPublicaDoEvento />} />
          <Route path="/convite/:token" element={<Convite />} />
          <Route path="/eu" element={<MeuPerfil />} />

          {/* -------- Hub da atlética -------- */}
          <Route path="/hub/:slug" element={<Hub><Painel /></Hub>} />
          <Route path="/hub/:slug/eventos" element={<Hub><Eventos /></Hub>} />
          <Route path="/hub/:slug/eventos/novo" element={<Hub><EditorDeEvento /></Hub>} />
          <Route path="/hub/:slug/eventos/:eventoId" element={<Hub><DetalheDoEvento /></Hub>} />
          <Route path="/hub/:slug/eventos/:eventoId/editar" element={<Hub><EditorDeEvento /></Hub>} />
          <Route path="/hub/:slug/eventos/:eventoId/portaria" element={<Portaria />} />
          <Route path="/hub/:slug/equipes" element={<Hub><Equipes /></Hub>} />
          <Route path="/hub/:slug/torneios" element={<Hub><Torneios /></Hub>} />
          <Route path="/hub/:slug/torneios/:torneioId" element={<Hub><Chaveamento /></Hub>} />
          <Route path="/hub/:slug/tarefas" element={<Hub><Tarefas /></Hub>} />
          <Route path="/hub/:slug/avisos" element={<Hub><Avisos /></Hub>} />
          <Route path="/hub/:slug/membros" element={<Hub><Membros /></Hub>} />
          <Route path="/hub/:slug/relatorios" element={<Hub><Relatorios /></Hub>} />

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>

      <Rodape />
    </div>
  )
}

/**
 * A demonstração precisa se anunciar. Sem isso, alguém abre o link, vê nomes
 * e telefones nas listas de presença e conclui que a plataforma vaza dado de
 * aluno — quando é tudo fictício.
 */
function FaixaDeDemonstracao() {
  return (
    <div className="faixa-demo">
      Demonstração navegável · dados fictícios, alterações não são salvas
    </div>
  )
}

function Topo() {
  const { perfil, carregando, aparencia, trocarAparencia } = useSessao()

  return (
    <header className="topo">
      <div className="topo__interno">
        <Link to="/" className="marca">
          <span className="marca__simbolo">IA</span>
          Interatlética
        </Link>

        <nav className="linha" style={{ gap: '0.2rem', marginLeft: '0.6rem' }}>
          <NavLink to="/rede" className="navegacao__item">Atléticas</NavLink>
          <NavLink to="/quadro" className="navegacao__item">Quadro</NavLink>
        </nav>

        <span className="espaco" />

        <button
          className="botao botao--fantasma botao--pequeno"
          onClick={trocarAparencia}
          aria-label={`Mudar para tema ${aparencia === 'escura' ? 'claro' : 'escuro'}`}
          title={`Tema ${aparencia === 'escura' ? 'claro' : 'escuro'}`}
        >
          {aparencia === 'escura' ? '☀' : '☾'}
        </button>

        {carregando ? null : perfil ? (
          <SeletorDeAtletica />
        ) : (
          <EntrarNoDemo />
        )}
      </div>
    </header>
  )
}

/**
 * O seletor existe porque papel é do VÍNCULO, não do usuário: a mesma pessoa
 * preside uma atlética e é membro comum de outra. Sem trocar de contexto, o
 * app teria de escolher uma por ela — e escolheria errado metade das vezes.
 */
function SeletorDeAtletica() {
  const { perfil } = useSessao()
  if (!perfil) return null

  return (
    <div className="linha" style={{ gap: '0.4rem' }}>
      {perfil.atleticas.map((v) => (
        <NavLink key={v.atletica.slug} to={`/hub/${v.atletica.slug}`}
                 className="navegacao__item">
          {v.atletica.sigla ?? v.atletica.nome}
        </NavLink>
      ))}
      <NavLink to="/eu" className="navegacao__item">{perfil.nome.split(' ')[0]}</NavLink>
    </div>
  )
}

function EntrarNoDemo() {
  const { assumirPapel } = useSessao()

  if (!MODO_DEMO) {
    return (
      <a className="botao botao--pequeno" href="/oauth2/authorization/google">
        Entrar
      </a>
    )
  }
  return (
    <button className="botao botao--pequeno" onClick={() => void assumirPapel('PRESIDENTE')}>
      Entrar na demonstração
    </button>
  )
}

/**
 * O hub de uma atlética: barra lateral fixa e conteúdo.
 *
 * <p>Exige vínculo. Quem não tem cai na página pública da atlética, que é o
 * que a pessoa provavelmente queria — em vez de um 403 seco.</p>
 */
function Hub({ children }: { children: React.ReactNode }) {
  const { slug = '' } = useParams()
  const { perfil, carregando, vinculo, podeAtuarComo } = useSessao()

  if (carregando) {
    return <Carregando />
  }

  const meu = vinculo(slug)
  if (!perfil || !meu) {
    return <SemVinculo slug={slug} temSessao={perfil !== null} />
  }

  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const presidente = podeAtuarComo(slug, 'PRESIDENTE')
  const base = `/hub/${slug}`

  return (
    <div className="hub">
      <nav className="hub__barra" aria-label="Seções da atlética">
        <NavLink end to={base} className="navegacao__item">Painel</NavLink>
        <NavLink to={`${base}/eventos`} className="navegacao__item">Eventos</NavLink>
        <NavLink to={`${base}/equipes`} className="navegacao__item">Equipes</NavLink>
        <NavLink to={`${base}/torneios`} className="navegacao__item">Torneios</NavLink>
        <NavLink to={`${base}/avisos`} className="navegacao__item">Avisos</NavLink>
        {diretor ? (
          <NavLink to={`${base}/tarefas`} className="navegacao__item">Tarefas</NavLink>
        ) : null}
        {diretor ? (
          <NavLink to={`${base}/relatorios`} className="navegacao__item">Relatórios</NavLink>
        ) : null}
        {presidente ? (
          <NavLink to={`${base}/membros`} className="navegacao__item">Membros</NavLink>
        ) : null}

        <div style={{ marginTop: '0.8rem' }}>
          <Link to={`/a/${slug}`} className="navegacao__item fraco">
            Ver página pública
          </Link>
        </div>
      </nav>

      <div>{children}</div>
    </div>
  )
}

function SemVinculo({ slug, temSessao }: { slug: string; temSessao: boolean }) {
  const { assumirPapel } = useSessao()

  return (
    <div className="cartao" style={{ maxWidth: '32rem', margin: '2rem auto' }}>
      <h1>Área da diretoria</h1>
      <p className="suave">
        {temSessao
          ? 'Você não tem vínculo com esta atlética. A entrada é por convite da diretoria.'
          : 'Entre para acessar o hub da atlética.'}
      </p>
      <div className="linha">
        {MODO_DEMO && !temSessao ? (
          <button className="botao" onClick={() => void assumirPapel('PRESIDENTE')}>
            Entrar na demonstração
          </button>
        ) : null}
        <Link className="botao botao--discreto" to={`/a/${slug}`}>
          Ver a página pública
        </Link>
      </div>
    </div>
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
    <Vazio />
  )
}

function Vazio() {
  return (
    <div className="vazio">
      <h2>Página não encontrada</h2>
      <p>O link pode ter mudado ou o evento pode ter sido removido.</p>
      <Link to="/">Voltar ao início</Link>
    </div>
  )
}
