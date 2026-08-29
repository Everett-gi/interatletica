import { useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Api } from '../api/rotas'
import { MensagemDeErro } from '../componentes/comuns'
import { hora } from '../formatos'
import type { ResultadoDoCheckin } from '../api/tipos'

/**
 * A tela da portaria.
 *
 * <p>Desenhada para uma condição específica: alguém de pé, com uma mão,
 * segurando o celular, com fila na frente e barulho em volta. Daí as três
 * decisões visíveis aqui:</p>
 *
 * <ul>
 *   <li>o campo recebe foco de volta depois de cada leitura, para que a
 *       próxima pessoa não exija um toque a mais;</li>
 *   <li>o resultado é um bloco grande e colorido, legível de relance —
 *       ninguém lê parágrafo na porta do ginásio;</li>
 *   <li>recusa não é erro vermelho genérico: diz <em>por quê</em>, porque
 *       "já entrou às 22h14" e "inscrição cancelada" pedem reações
 *       diferentes de quem está na porta.</li>
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

  async function ler(evento: FormEvent) {
    evento.preventDefault()
    const codigo = token.trim()
    if (!codigo) {
      return
    }

    setLendo(true)
    setFalha(null)
    try {
      const lido = await Api.portaria.checkin(slug, eventoId, codigo)
      setResultado(lido)
      setHistorico((anterior) => [lido, ...anterior].slice(0, 8))
      setToken('')
    } catch (erro) {
      setFalha(erro)
    } finally {
      setLendo(false)
      // Devolve o foco para a próxima leitura. Sem isto, cada pessoa da fila
      // custaria um toque extra no campo.
      campo.current?.focus()
    }
  }

  return (
    <div className="pilha" style={{ maxWidth: '32rem', margin: '0 auto' }}>
      <header>
        <Link to={`/a/${slug}/eventos/${eventoId}`} className="fraco">
          ← Voltar ao evento
        </Link>
        <h1 style={{ marginTop: '0.35rem' }}>Portaria</h1>
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
            // Teclado sem autocorreção nem maiúscula automática: o token é
            // hexadecimal, e o corretor do celular o transformaria em outra
            // coisa entre a digitação e o envio.
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            autoFocus
            placeholder="Cole ou digite o código"
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
          <div className="pilha">
            {historico.slice(1).map((leitura, indice) => (
              <div key={indice} className="cartao linha entre">
                <span>{leitura.nome ?? 'Sem nome'}</span>
                <span className={leitura.liberado ? 'etiqueta etiqueta--publicado' : 'etiqueta etiqueta--cancelado'}>
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
      // aria-live: quem usa leitor de tela ouve o veredito sem precisar
      // procurar onde a tela mudou.
      role="status"
      aria-live="assertive"
      style={{
        borderColor: resultado.liberado ? 'var(--sucesso)' : 'var(--perigo)',
        borderWidth: '2px',
        textAlign: 'center',
        padding: '1.5rem 1rem',
      }}
    >
      <div
        style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          color: resultado.liberado ? 'var(--sucesso)' : 'var(--perigo)',
        }}
      >
        {resultado.liberado ? 'Pode entrar' : 'Não liberado'}
      </div>

      {resultado.nome ? (
        <div style={{ fontSize: '1.15rem', marginTop: '0.35rem' }}>{resultado.nome}</div>
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
