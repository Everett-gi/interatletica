import { useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { ResultadoDoCheckin } from '../../api/tipos'
import { MensagemDeErro } from '../../ui/componentes'
import { hora } from '../../formatos'

/**
 * A portaria.
 *
 * <p>Desenhada para uma condição específica: alguém de pé, com uma mão,
 * segurando o celular, com fila na frente e barulho em volta. Daí as
 * decisões visíveis aqui:</p>
 *
 * <ul>
 *   <li>fica FORA do layout do hub — sem barra lateral, sem navegação. É uma
 *       tela de tarefa única, e cada elemento a mais é um toque errado
 *       esperando acontecer;</li>
 *   <li>o campo recebe foco de volta a cada leitura, para a próxima pessoa
 *       não custar um toque extra;</li>
 *   <li>o veredito é um bloco grande e colorido, legível de relance;</li>
 *   <li>recusa não é erro genérico: diz <em>por quê</em>, porque "já entrou
 *       às 22h14" e "inscrição cancelada" pedem reações diferentes de quem
 *       está na porta.</li>
 * </ul>
 */
export function Portaria() {
  const { slug = '', eventoId = '' } = useParams()

  const [token, setToken] = useState('')
  const [resultado, setResultado] = useState<ResultadoDoCheckin | null>(null)
  const [falha, setFalha] = useState<unknown>(null)
  const [lendo, setLendo] = useState(false)
  const [historico, setHistorico] = useState<ResultadoDoCheckin[]>([])

  const campo = useRef<HTMLInputElement>(null)

  async function ler(e: FormEvent) {
    e.preventDefault()
    const codigo = token.trim()
    if (!codigo) return

    setLendo(true)
    setFalha(null)
    try {
      const lido = await Dados.checkin(slug, eventoId, codigo)
      setResultado(lido)
      setHistorico((anterior) => [lido, ...anterior].slice(0, 10))
      setToken('')
    } catch (erro) {
      setFalha(erro)
    } finally {
      setLendo(false)
      campo.current?.focus()
    }
  }

  return (
    <div className="pilha" style={{ maxWidth: '32rem', margin: '0 auto' }}>
      <header>
        <Link to={`/hub/${slug}/eventos/${eventoId}`} className="fraco">
          ← Voltar ao evento
        </Link>
        <h1 style={{ marginTop: '0.3rem' }}>Portaria</h1>
        <p className="fraco">
          Leia o QR do inscrito ou digite o código do comprovante.
        </p>
      </header>

      <form onSubmit={(e) => void ler(e)} className="cartao">
        <label className="campo">
          <span className="campo__rotulo">Código de entrada</span>
          <input
            ref={campo}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            // Sem autocorreção nem maiúscula automática: o token é
            // hexadecimal, e o corretor do celular o transformaria em outra
            // coisa entre a digitação e o envio.
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            placeholder="Cole ou digite o código"
            style={{ fontSize: '1.05rem', letterSpacing: '0.04em' }}
          />
        </label>
        <button className="botao botao--largo" type="submit" disabled={lendo}>
          {lendo ? 'Verificando…' : 'Verificar entrada'}
        </button>
      </form>

      {falha ? <MensagemDeErro erro={falha} /> : null}
      {resultado ? <Veredito resultado={resultado} /> : null}

      {historico.length > 1 ? (
        <section>
          <h2>Últimas leituras</h2>
          <div className="pilha pilha--densa">
            {historico.slice(1).map((leitura, i) => (
              <div key={i} className="cartao linha entre" style={{ padding: '0.6rem 0.8rem' }}>
                <span>{leitura.nome ?? 'Sem nome'}</span>
                <span className={`etiqueta ${
                  leitura.liberado ? 'etiqueta--sucesso' : 'etiqueta--perigo'}`}>
                  {leitura.liberado ? 'Liberado' : 'Recusado'}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Veredito({ resultado }: { resultado: ResultadoDoCheckin }) {
  return (
    <section
      className="cartao"
      // aria-live assertivo: quem usa leitor de tela ouve o veredito sem
      // precisar procurar onde a tela mudou.
      role="status"
      aria-live="assertive"
      style={{
        borderColor: resultado.liberado ? 'var(--sucesso)' : 'var(--perigo)',
        borderWidth: '2px',
        textAlign: 'center',
        padding: '1.6rem 1rem',
      }}
    >
      <div
        style={{
          fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em',
          color: resultado.liberado ? 'var(--sucesso)' : 'var(--perigo)',
        }}
      >
        {resultado.liberado ? 'Pode entrar' : 'Não liberado'}
      </div>

      {resultado.nome ? (
        <div style={{ fontSize: '1.2rem', marginTop: '0.3rem' }}>{resultado.nome}</div>
      ) : null}

      <p className="suave" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
        {resultado.mensagem}
      </p>

      {!resultado.liberado && resultado.checkinEm ? (
        <p className="fraco" style={{ margin: 0 }}>
          Entrada registrada às {hora(resultado.checkinEm)}.
        </p>
      ) : null}
    </section>
  )
}
