import type { ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { MODO_DEMO } from './dados'
import { useSessao } from './sessao/SessaoContexto'
import { Brasao, Carregando } from './ui/componentes'
import { useCorDaAtletica } from './ui/useCorDaAtletica'

import { Rede } from './paginas/Rede'
import { QuadroDeMedalhas } from './paginas/QuadroDeMedalhas'
import { Boasvindas } from './paginas/Boasvindas'
import { AtleticaPublica } from './paginas/AtleticaPublica'
import { PaginaPublicaDoEvento } from './paginas/PaginaPublicaDoEvento'
import { Convite } from './paginas/Convite'
import { MeuPerfil } from './paginas/MeuPerfil'

import { Painel } from './paginas/hub/Painel'
import { Eventos } from './paginas/hub/Eventos'
import { EditorDeEvento } from './paginas/hub/EditorDeEvento'
import { DetalheDoEvento } from './paginas/hub/DetalheDoEvento'
import { Portaria } from './paginas/hub/Portaria'
import { Chaveamento } from './paginas/hub/Chaveamento'
import { Equipes } from './paginas/hub/Equipes'
import { Tarefas } from './paginas/hub/Tarefas'
import { Avisos } from './paginas/hub/Avisos'
import { Membros } from './paginas/hub/Membros'
import { Relatorios } from './paginas/hub/Relatorios'

/**
 * A estrutura do app em uma frase: **a atlética é o lugar; o evento é a
 * unidade de trabalho.**
 *
 * <p>Duas decisões de organização que valem registro, porque a versão
 * anterior errava as duas:</p>
 *
 * <ul>
 *   <li><strong>A porta de entrada é a SUA atlética</strong>, não um feed
 *       geral. Quem entra aqui vem organizar o próprio campeonato, não
 *       descobrir o que os outros estão fazendo. A rede existe, mas é
 *       secundária.</li>
 *   <li><strong>Torneio não é seção; é parte do evento.</strong> Um
 *       campeonato É um evento — o schema sempre disse isso, com
 *       {@code torneio.evento_id} obrigatório. Ter "Torneios" na navegação
 *       ao lado de "Eventos" duplicava o conceito e obrigava a pessoa a
 *       adivinhar em qual dos dois procurar.</li>
 * </ul>
 */
export function App() {
  return (
    <div className="aplicacao">
      {MODO_DEMO ? <FaixaDeDemonstracao /> : null}
      <Topo />

      <main className="conteudo">
        <Routes>
          <Route path="/" element={<PortaDeEntrada />} />

          {/* Rede: secundária, mas é o "inter" da Interatlética. */}
          <Route path="/rede" element={<Rede />} />
          <Route path="/rede/quadro" element={<QuadroDeMedalhas />} />

          {/* Públicas: o que abre a partir de um link compartilhado. */}
          <Route path="/a/:slug" element={<AtleticaPublica />} />
          <Route path="/e/:atleticaSlug/:eventoSlug" element={<PaginaPublicaDoEvento />} />
          <Route path="/convite/:token" element={<Convite />} />
          <Route path="/eu" element={<MeuPerfil />} />

          {/* O hub da atlética. */}
          <Route path="/hub/:slug" element={<Hub><Painel /></Hub>} />
          <Route path="/hub/:slug/relatorios" element={<Hub><Relatorios /></Hub>} />
          <Route path="/hub/:slug/eventos" element={<Hub><Eventos /></Hub>} />
          <Route path="/hub/:slug/eventos/novo" element={<Hub><EditorDeEvento /></Hub>} />
          <Route path="/hub/:slug/eventos/:eventoId" element={<Hub><DetalheDoEvento /></Hub>} />
          <Route path="/hub/:slug/eventos/:eventoId/editar" element={<Hub><EditorDeEvento /></Hub>} />
          <Route path="/hub/:slug/eventos/:eventoId/torneio" element={<Hub><Chaveamento /></Hub>} />
          <Route path="/hub/:slug/equipes" element={<Hub><Equipes /></Hub>} />
          <Route path="/hub/:slug/tarefas" element={<Hub><Tarefas /></Hub>} />
          <Route path="/hub/:slug/avisos" element={<Hub><Avisos /></Hub>} />
          <Route path="/hub/:slug/membros" element={<Hub><Membros /></Hub>} />

          {/* Fora do layout do hub: tela de tarefa única. */}
          <Route path="/hub/:slug/eventos/:eventoId/portaria" element={<Portaria />} />

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
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

        <button
          className="botao botao--fantasma botao--pequeno"
          onClick={trocarAparencia}
          aria-label={`Mudar para tema ${aparencia === 'escura' ? 'claro' : 'escuro'}`}
        >
          {aparencia === 'escura' ? '☀' : '☾'}
        </button>

        {carregando ? null : perfil ? (
          <NavLink to="/eu" className="navegacao__item">
            {perfil.nome.split(' ')[0]}
          </NavLink>
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

/**
 * O hub: cabeçalho da atlética, navegação e conteúdo.
 *
 * <p>O cabeçalho com brasão e cor existe para responder "onde eu estou?"
 * sem a pessoa precisar ler a URL. Com duas atléticas no seletor e três
 * endereços possíveis para cada uma — pública, hub e evento —, essa
 * pergunta era a mais frequente na versão anterior.</p>
 */
function Hub({ children }: { children: ReactNode }) {
  const { slug = '' } = useParams()
  const { perfil, carregando, vinculo, podeAtuarComo } = useSessao()
  const meu = vinculo(slug)
  useCorDaAtletica(meu?.atletica.corPrimaria)

  if (carregando) {
    return <Carregando />
  }
  if (!perfil || !meu) {
    return <SemVinculo slug={slug} temSessao={perfil !== null} />
  }

  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const presidente = podeAtuarComo(slug, 'PRESIDENTE')
  const base = `/hub/${slug}`

  return (
    <>
      <CabecalhoDaAtletica atletica={meu.atletica} cargo={meu.cargo ?? meu.papel} />

      <div className="hub">
        <nav className="hub__barra" aria-label="Seções da atlética">
          <NavLink end to={base} className="navegacao__item">Início</NavLink>
          <NavLink to={`${base}/eventos`} className="navegacao__item">Eventos</NavLink>
          <NavLink to={`${base}/equipes`} className="navegacao__item">Equipes</NavLink>
          <NavLink to={`${base}/avisos`} className="navegacao__item">Avisos</NavLink>
          {diretor ? (
            <NavLink to={`${base}/tarefas`} className="navegacao__item">Tarefas</NavLink>
          ) : null}
          {presidente ? (
            <NavLink to={`${base}/membros`} className="navegacao__item">Membros</NavLink>
          ) : null}
        </nav>

        <div>{children}</div>
      </div>
    </>
  )
}

/** Onde estou, de quem é este lugar, e como sair para a versão pública. */
function CabecalhoDaAtletica({ atletica, cargo }: {
  atletica: Parameters<typeof Brasao>[0]['atletica'] & { slug: string }
  cargo: string
}) {
  const { perfil } = useSessao()
  const outras = perfil?.atleticas.filter((v) => v.atletica.slug !== atletica.slug) ?? []

  return (
    <div className="linha entre" style={{ marginBottom: '1.2rem' }}>
      <div className="linha">
        <Brasao atletica={atletica} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{atletica.nome}</div>
          <div className="fraco">Você é {cargo.toLowerCase()} aqui</div>
        </div>
      </div>

      <div className="linha">
        {outras.map((v) => (
          <Link key={v.atletica.slug} to={`/hub/${v.atletica.slug}`}
                className="botao botao--fantasma botao--pequeno"
                title={`Ir para ${v.atletica.nome}`}>
            {v.atletica.sigla ?? v.atletica.nome}
          </Link>
        ))}
        <Link to={`/a/${atletica.slug}`} className="botao botao--discreto botao--pequeno">
          Ver como visitante
        </Link>
      </div>
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
          : 'Entre para acessar a área da sua atlética.'}
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
    <div className="vazio">
      <h2>Página não encontrada</h2>
      <p>O link pode ter mudado ou o evento pode ter sido removido.</p>
      <Link to="/">Voltar ao início</Link>
    </div>
  )
}
