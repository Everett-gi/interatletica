import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Api } from '../api/rotas'
import {
  Carregando,
  EtiquetaDeStatus,
  MensagemDeErro,
  useBusca,
  Vazio,
} from '../componentes/comuns'
import { dataEHora } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'
import type { Evento, Participante } from '../api/tipos'

/**
 * A tela de trabalho da diretoria durante um evento: estado, ações,
 * lista de presença e o link público para colar no WhatsApp.
 */
export function DetalheDoEvento() {
  const { slug = '', eventoId = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const ehDiretor = podeAtuarComo(slug, 'DIRETOR')

  const busca = useBusca<Evento>(() => Api.eventos.porId(slug, eventoId), [slug, eventoId])
  const [acao, setAcao] = useState<unknown>(null)
  const [trabalhando, setTrabalhando] = useState(false)

  async function executar(operacao: () => Promise<unknown>) {
    setTrabalhando(true)
    setAcao(null)
    try {
      await operacao()
      busca.recarregar()
    } catch (erro) {
      setAcao(erro)
    } finally {
      setTrabalhando(false)
    }
  }

  if (busca.carregando) {
    return <Carregando />
  }
  if (busca.erro) {
    return <MensagemDeErro erro={busca.erro} />
  }
  if (!busca.dados) {
    return null
  }

  const evento = busca.dados
  const linkPublico = `${window.location.origin}/e/${slug}/${evento.slug}`

  return (
    <div className="pilha">
      <header className="linha entre">
        <div>
          <Link to={`/a/${slug}`} className="fraco">
            ← Voltar
          </Link>
          <h1 style={{ marginTop: '0.35rem' }}>{evento.titulo}</h1>
          <div className="fraco">{dataEHora(evento.inicioEm)}</div>
        </div>
        <EtiquetaDeStatus status={evento.status} />
      </header>

      {acao ? <MensagemDeErro erro={acao} /> : null}

      <section className="cartao">
        <div className="linha entre">
          <div>
            <div className="fraco">Confirmados</div>
            <strong style={{ fontSize: '1.5rem' }}>{evento.inscritosConfirmados}</strong>
            {evento.capacidade ? (
              <span className="suave"> de {evento.capacidade}</span>
            ) : null}
          </div>
          <div>
            <div className="fraco">Na espera</div>
            <strong style={{ fontSize: '1.5rem' }}>{evento.naListaDeEspera}</strong>
          </div>
        </div>
      </section>

      {evento.status === 'PUBLICADO' ? (
        <LinkPublico link={linkPublico} />
      ) : null}

      {ehDiretor ? (
        <section className="cartao">
          <h2>Ações</h2>
          <div className="linha">
            <Link to={`/a/${slug}/eventos/${eventoId}/editar`} className="botao botao--discreto">
              Editar
            </Link>

            {evento.status === 'RASCUNHO' ? (
              <button
                className="botao"
                disabled={trabalhando}
                onClick={() => void executar(() => Api.eventos.publicar(slug, eventoId))}
              >
                Publicar
              </button>
            ) : null}

            {evento.status === 'PUBLICADO' ? (
              <>
                <Link
                  to={`/a/${slug}/eventos/${eventoId}/portaria`}
                  className="botao botao--discreto"
                >
                  Portaria
                </Link>
                <button
                  className="botao botao--discreto"
                  disabled={trabalhando}
                  onClick={() => void executar(() => Api.eventos.encerrar(slug, eventoId))}
                >
                  Encerrar
                </button>
                <button
                  className="botao botao--discreto"
                  disabled={trabalhando}
                  onClick={() => void executar(() => Api.eventos.despublicar(slug, eventoId))}
                >
                  Despublicar
                </button>
              </>
            ) : null}

            {evento.status !== 'CANCELADO' && evento.status !== 'ENCERRADO' ? (
              <button
                className="botao botao--perigo"
                disabled={trabalhando}
                onClick={() => {
                  // Cancelar é visível para quem já se inscreveu e não tem
                  // desfazer. Vale a confirmação.
                  if (
                    window.confirm(
                      'Cancelar o evento? Quem se inscreveu verá o aviso ao abrir o link.',
                    )
                  ) {
                    void executar(() => Api.eventos.cancelar(slug, eventoId))
                  }
                }}
              >
                Cancelar evento
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {ehDiretor ? <ListaDePresenca slug={slug} eventoId={eventoId} /> : null}
    </div>
  )
}

/**
 * O link que a diretoria vai colar no grupo. Copiar com um toque, porque a
 * alternativa é selecionar da barra de endereços no celular.
 */
function LinkPublico({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Clipboard exige contexto seguro e permissão; em HTTP local ou num
      // navegador antigo não existe. O link continua visível para copiar na
      // mão — o que não pode é o botão sumir sem explicação.
      setCopiado(false)
    }
  }

  return (
    <section className="cartao">
      <div className="fraco">Link público — cole no grupo</div>
      <div className="linha entre">
        <code style={{ wordBreak: 'break-all' }}>{link}</code>
        <button className="botao botao--discreto" onClick={() => void copiar()}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </section>
  )
}

function ListaDePresenca({ slug, eventoId }: { slug: string; eventoId: string }) {
  const busca = useBusca<Participante[]>(
    () => Api.participantes.listar(slug, eventoId),
    [slug, eventoId],
  )

  return (
    <section>
      <div className="linha entre">
        <h2>Participantes</h2>
        {/* Âncora, não fetch: é o Content-Disposition da resposta que faz o
            arquivo baixar com nome. Por fetch seria preciso montar Blob e
            link sintético para chegar no mesmo resultado. */}
        <a
          className="botao botao--discreto"
          href={Api.participantes.urlDoCsv(slug, eventoId)}
        >
          Baixar CSV
        </a>
      </div>

      {busca.carregando ? <Carregando /> : null}
      {busca.erro ? <MensagemDeErro erro={busca.erro} /> : null}

      {busca.dados && busca.dados.length === 0 ? (
        <Vazio>Ninguém se inscreveu ainda.</Vazio>
      ) : null}

      {busca.dados && busca.dados.length > 0 ? (
        <div className="rolagem-horizontal">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Situação</th>
                <th>Inscrito em</th>
                <th>Entrada</th>
              </tr>
            </thead>
            <tbody>
              {busca.dados.map((p) => (
                <tr key={p.inscricaoId}>
                  <td>{p.nome ?? '—'}</td>
                  <td>{p.email ?? '—'}</td>
                  <td>
                    {p.status === 'LISTA_ESPERA'
                      ? `Espera (${p.posicaoEspera})`
                      : 'Confirmada'}
                  </td>
                  <td>{dataEHora(p.inscritoEm)}</td>
                  <td>{p.checkinEm ? dataEHora(p.checkinEm) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
