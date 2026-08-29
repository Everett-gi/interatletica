import type { ReactNode } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { entrar, sair } from './api/cliente'
import { Carregando } from './componentes/comuns'
import { useSessao } from './sessao/SessaoContexto'
import { Inicio } from './paginas/Inicio'
import { Convite } from './paginas/Convite'
import { PainelDaAtletica } from './paginas/PainelDaAtletica'
import { EditorDeEvento } from './paginas/EditorDeEvento'
import { DetalheDoEvento } from './paginas/DetalheDoEvento'
import { Portaria } from './paginas/Portaria'
import { Membros } from './paginas/Membros'
import { PaginaPublicaDoEvento } from './paginas/PaginaPublicaDoEvento'

export function App() {
  return (
    <div className="aplicacao">
      <Cabecalho />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/convite/:token" element={<Convite />} />

          {/* O link que circula no WhatsApp. Curto de propósito. */}
          <Route path="/e/:atleticaSlug/:eventoSlug" element={<PaginaPublicaDoEvento />} />

          <Route path="/a/:slug" element={<Protegida><PainelDaAtletica /></Protegida>} />
          <Route path="/a/:slug/membros" element={<Protegida><Membros /></Protegida>} />
          <Route
            path="/a/:slug/eventos/novo"
            element={<Protegida><EditorDeEvento /></Protegida>}
          />
          <Route
            path="/a/:slug/eventos/:eventoId"
            element={<Protegida><DetalheDoEvento /></Protegida>}
          />
          <Route
            path="/a/:slug/eventos/:eventoId/editar"
            element={<Protegida><EditorDeEvento /></Protegida>}
          />
          <Route
            path="/a/:slug/eventos/:eventoId/portaria"
            element={<Protegida><Portaria /></Protegida>}
          />

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>
      <Rodape />
    </div>
  )
}

/**
 * Rota que exige sessão.
 *
 * <p>Espera o carregamento antes de decidir. Sem essa espera, a primeira
 * renderização veria {@code perfil === null} — que ainda não significa
 * "deslogado", significa "não perguntei" — e chutaria todo mundo para a
 * tela de entrada por uma fração de segundo. Numa PWA aberta pelo atalho da
 * tela inicial, esse piscar é a primeira coisa que o usuário vê.</p>
 */
function Protegida({ children }: { children: ReactNode }) {
  const { perfil, carregando } = useSessao()

  if (carregando) {
    return <Carregando />
  }
  if (!perfil) {
    return <ConviteParaEntrar />
  }
  return <>{children}</>
}

function ConviteParaEntrar() {
  return (
    <div className="cartao" style={{ textAlign: 'center', padding: '2.5rem 1.25rem' }}>
      <h1>Entre para continuar</h1>
      <p className="suave">
        A Interatlética usa sua conta Google. Nada é publicado no seu nome.
      </p>
      <button className="botao" onClick={entrar}>
        Entrar com Google
      </button>
    </div>
  )
}

function Cabecalho() {
  const { perfil, carregando } = useSessao()

  return (
    <header className="cabecalho">
      <div className="cabecalho__interno">
        <Link to="/" className="marca">
          Interatlética
        </Link>
        <span className="cabecalho__espaco" />

        {carregando ? null : perfil ? (
          <div className="linha">
            {perfil.convitesPendentes > 0 && (
              <Link to="/" className="etiqueta etiqueta--rascunho">
                {perfil.convitesPendentes} convite
                {perfil.convitesPendentes > 1 ? 's' : ''}
              </Link>
            )}
            <span className="fraco">{perfil.nome}</span>
            <button className="botao botao--discreto" onClick={() => void sair()}>
              Sair
            </button>
          </div>
        ) : (
          <button className="botao" onClick={entrar}>
            Entrar
          </button>
        )}
      </div>
    </header>
  )
}

function Rodape() {
  return (
    <footer className="rodape">
      Território comum. Cada atlética é dona dos seus dados.
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
