import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Dados, MODO_DEMO } from '../../dados'
import { useSessao } from '../../sessao/SessaoContexto'
import { Carregando } from '../../ui/componentes'
import { Icone } from '../../ui/icones'

/**
 * A tela de entrada.
 *
 * <p>A autenticação de verdade é OAuth do Google, e só ela: o servidor não
 * guarda senha, não tem fluxo de recuperação e não quer ter. Uma plataforma
 * mantida por uma diretoria que muda todo ano não deveria ser responsável
 * por guardar senha de estudante.</p>
 *
 * <p>No modo demonstração o Google não existe, então há um atalho que cria
 * uma sessão local. A tela diz isso em voz alta — fingir login funcionando
 * seria mentir sobre o produto.</p>
 */
export function Entrar() {
  const { perfil, carregando, recarregar } = useSessao()
  const navegar = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [entrando, setEntrando] = useState(false)

  if (carregando) {
    return <Carregando />
  }
  if (perfil) {
    return <Navigate to="/" replace />
  }

  async function entrarNaDemonstracao(e: FormEvent) {
    e.preventDefault()
    setEntrando(true)
    await Dados.cadastrarDemo(nome, email)
    await recarregar()
    navegar('/criar-atletica', { replace: true })
  }

  return (
    <div style={{ maxWidth: '26rem', margin: '2rem auto' }}>
      <div className="cartao">
        <h1 style={{ marginBottom: '0.3rem' }}>Entrar</h1>
        <p className="fraco">
          A plataforma usa a sua conta Google. Não guardamos senha — não temos
          onde nem por quê.
        </p>

        {MODO_DEMO ? (
          <>
            <div className="aviso aviso--alerta" style={{ marginBottom: '1.1rem' }}>
              <strong>Esta é a demonstração</strong>
              <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                O login do Google não funciona aqui. Informe um nome e um e-mail
                para criar uma sessão local — nada é enviado a lugar nenhum e
                tudo some ao recarregar a página.
              </p>
            </div>

            <form onSubmit={(e) => void entrarNaDemonstracao(e)}>
              <label className="campo">
                <span className="campo__rotulo">Seu nome</span>
                <input value={nome} onChange={(e) => setNome(e.target.value)}
                       required maxLength={120} autoFocus
                       placeholder="Como aparece para a sua atlética" />
              </label>

              <label className="campo">
                <span className="campo__rotulo">Seu e-mail</span>
                <input type="email" value={email} maxLength={180}
                       onChange={(e) => setEmail(e.target.value)}
                       required placeholder="voce@universidade.br" />
                <span className="campo__dica">
                  Serve só para exibição na demonstração.
                </span>
              </label>

              <button className="botao botao--largo" type="submit"
                      disabled={entrando || !nome.trim() || !email.trim()}>
                {entrando ? 'Entrando…' : 'Entrar na demonstração'}
              </button>
            </form>

            <hr className="divisor" />

            <button
              className="botao botao--discreto botao--largo"
              onClick={() => { void Dados.entrarDemo().then(recarregar) }}
            >
              Abrir a demonstração já preenchida
            </button>
            <p className="fraco" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              Entra como presidente de uma atlética fictícia com dois anos de
              história — útil para ver a plataforma cheia, sem preencher nada.
            </p>
          </>
        ) : (
          <>
            <a className="botao botao--largo" href="/oauth2/authorization/google">
              <Icone nome="usuario" tamanho={17} /> Entrar com Google
            </a>
            <p className="fraco" style={{ marginTop: '0.7rem' }}>
              No primeiro acesso a conta é criada automaticamente. Depois disso,
              você cria a sua atlética ou espera um convite da diretoria de uma.
            </p>
          </>
        )}
      </div>

      <div className="cartao" style={{ marginTop: '1rem' }}>
        <h3>Ainda não tem conta?</h3>
        <p className="fraco">
          É o mesmo botão: o primeiro acesso já cria a conta. Se quiser entender
          o que acontece depois, veja o passo a passo.
        </p>
        <Link to="/criar-conta" className="botao botao--discreto botao--largo">
          Ver como funciona o primeiro acesso
        </Link>
      </div>
    </div>
  )
}
