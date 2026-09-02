import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Dados, MODO_DEMO } from '../../dados'
import { useSessao } from '../../sessao/SessaoContexto'
import { Carregando } from '../../ui/componentes'
import { ItemDaLinha, LinhaDoTempo } from '../../ui/pagina'
import { Icone } from '../../ui/icones'

/**
 * O primeiro acesso.
 *
 * <p>Não é um formulário de cadastro clássico — e a tela explica por quê. A
 * conta nasce do primeiro login com Google; o que a pessoa precisa saber é o
 * que vem <em>depois</em> dela, que é a parte que costuma travar: ou você
 * cria a sua atlética, ou você espera um convite. Não existe terceira
 * saída, e não existe cadastro aberto de atlética.</p>
 *
 * <p>Essa porta fechada é decisão de produto, não limitação: sem ela,
 * moderar atlética falsa vira trabalho de alguém já na primeira semana.</p>
 */
export function CriarConta() {
  const { perfil, carregando, recarregar } = useSessao()
  const navegar = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [criando, setCriando] = useState(false)

  if (carregando) {
    return <Carregando />
  }
  if (perfil) {
    return <Navigate to="/" replace />
  }

  async function criar(e: FormEvent) {
    e.preventDefault()
    setCriando(true)
    await Dados.cadastrarDemo(nome, email)
    await recarregar()
    navegar('/criar-atletica', { replace: true })
  }

  return (
    <div style={{ maxWidth: '42rem', margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '0.3rem' }}>Primeiro acesso</h1>
      <p className="suave" style={{ marginBottom: '1.6rem' }}>
        São três passos, e o terceiro é o que realmente importa.
      </p>

      <div className="detalhe">
        <div>
          <div className="cartao">
            <LinhaDoTempo>
              <ItemDaLinha estado="ativo">
                <strong>1. A conta nasce no primeiro login</strong>
                <p className="fraco" style={{ margin: '0.2rem 0 0' }}>
                  Não há formulário de cadastro nem senha para inventar. Você
                  entra com o Google e a conta passa a existir.
                </p>
              </ItemDaLinha>

              <ItemDaLinha>
                <strong>2. Você ainda não pertence a nenhuma atlética</strong>
                <p className="fraco" style={{ margin: '0.2rem 0 0' }}>
                  Conta e vínculo são coisas diferentes. O papel — presidente,
                  diretor, membro — mora no vínculo com uma atlética, não na
                  pessoa: dá para presidir uma e ser membro comum de outra.
                </p>
              </ItemDaLinha>

              <ItemDaLinha>
                <strong>3. Aí você escolhe um dos dois caminhos</strong>
                <div className="pilha pilha--densa" style={{ marginTop: '0.6rem' }}>
                  <div className="cartao cartao--compacto linha linha--topo">
                    <Icone nome="atletica" tamanho={18} />
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: '0.92rem' }}>
                        Criar a sua atlética
                      </strong>
                      <div className="fraco">
                        Você vira presidente dela e convida o resto da diretoria.
                      </div>
                    </div>
                  </div>
                  <div className="cartao cartao--compacto linha linha--topo">
                    <Icone nome="membros" tamanho={18} />
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: '0.92rem' }}>
                        Aceitar um convite
                      </strong>
                      <div className="fraco">
                        Se a sua atlética já está aqui, peça o link à diretoria.
                        O convite é endereçado ao seu e-mail — link encaminhado
                        no grupo não matricula o grupo inteiro.
                      </div>
                    </div>
                  </div>
                </div>
              </ItemDaLinha>
            </LinhaDoTempo>
          </div>
        </div>

        <div>
          <div className="cartao">
            {MODO_DEMO ? (
              <>
                <h3>Criar conta na demonstração</h3>
                <p className="fraco">
                  Nada é enviado nem salvo. A sessão vive só nesta aba e some ao
                  recarregar.
                </p>

                <form onSubmit={(e) => void criar(e)}>
                  <label className="campo">
                    <span className="campo__rotulo">Seu nome</span>
                    <input value={nome} onChange={(e) => setNome(e.target.value)}
                           required maxLength={120} autoFocus
                           placeholder="Nome e sobrenome" />
                  </label>

                  <label className="campo">
                    <span className="campo__rotulo">Seu e-mail</span>
                    <input type="email" value={email} required maxLength={180}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="voce@universidade.br" />
                  </label>

                  <button className="botao botao--largo" type="submit"
                          disabled={criando || !nome.trim() || !email.trim()}>
                    {criando ? 'Criando…' : 'Criar conta e continuar'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3>Começar</h3>
                <p className="fraco">
                  O primeiro acesso cria a conta automaticamente.
                </p>
                <a className="botao botao--largo" href="/oauth2/authorization/google">
                  <Icone nome="usuario" tamanho={17} /> Entrar com Google
                </a>
              </>
            )}

            <hr className="divisor" />
            <Link to="/entrar" className="fraco">Já tem conta? Entrar</Link>
          </div>

          <div className="aviso" style={{ marginTop: '1rem' }}>
            <strong>Por que não existe cadastro aberto de atlética?</strong>
            <p className="fraco" style={{ margin: '0.3rem 0 0' }}>
              Existe — é o que você faz no passo 3. O que não existe é entrar
              numa atlética que já está aqui sem que a diretoria dela convide.
              Sem essa porta fechada, moderar vínculo falso vira trabalho de
              alguém já na primeira semana.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
