import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { entrar, FalhaDaApi } from '../api/cliente'
import { Api } from '../api/rotas'
import { Conteudo, MensagemDeErro, useBusca } from '../componentes/comuns'
import { dataPorExtenso, hora } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'
import type { EventoPublico, Inscricao } from '../api/tipos'

/**
 * A tela que abre a partir do link do WhatsApp.
 *
 * <p>É a página mais visitada da plataforma e a única que a maioria das
 * pessoas verá. Por isso ela responde, nesta ordem, as três perguntas de
 * quem clicou: <strong>o que é</strong>, <strong>quando e onde</strong>,
 * <strong>como entro</strong>. Login só é pedido no último passo — antes
 * disso, exigir conta seria pedir crachá para quem só quer saber a hora da
 * festa.</p>
 */
export function PaginaPublicaDoEvento() {
  const { atleticaSlug = '', eventoSlug = '' } = useParams()

  const busca = useBusca<EventoPublico>(
    () => Api.publico.evento(atleticaSlug, eventoSlug),
    [atleticaSlug, eventoSlug],
  )

  return (
    <Conteudo busca={busca}>
      {(evento) => (
        <article className="pilha" style={{ maxWidth: '40rem', margin: '0 auto' }}>
          {evento.capaUrl ? (
            <img
              src={evento.capaUrl}
              alt=""
              style={{
                width: '100%',
                borderRadius: 'var(--raio)',
                aspectRatio: '16 / 9',
                objectFit: 'cover',
              }}
            />
          ) : null}

          <header>
            <p className="fraco">{evento.atleticaNome}</p>
            <h1>{evento.titulo}</h1>
            {evento.modalidade ? (
              <span className="etiqueta">{evento.modalidade}</span>
            ) : null}
          </header>

          {evento.status === 'CANCELADO' ? (
            <div className="aviso aviso--erro" role="alert">
              <strong>Evento cancelado.</strong> Se você estava inscrito, não
              precisa comparecer.
            </div>
          ) : null}

          <section className="cartao">
            <div className="linha entre">
              <div>
                <div className="fraco">Quando</div>
                <strong>{dataPorExtenso(evento.inicioEm)}</strong>
                <div className="suave">
                  {hora(evento.inicioEm)}
                  {evento.fimEm ? ` às ${hora(evento.fimEm)}` : ''}
                </div>
              </div>
            </div>

            {evento.localNome ? (
              <div style={{ marginTop: '1rem' }}>
                <div className="fraco">Onde</div>
                <strong>{evento.localNome}</strong>
                {evento.localEndereco ? (
                  <div className="suave">{evento.localEndereco}</div>
                ) : null}
                {evento.localMapaUrl ? (
                  <a
                    href={evento.localMapaUrl}
                    target="_blank"
                    // noreferrer junto com noopener: sem ele, a página de
                    // destino recebe o endereço do evento no Referer.
                    rel="noopener noreferrer"
                  >
                    Abrir no mapa
                  </a>
                ) : null}
              </div>
            ) : null}
          </section>

          {evento.descricao ? (
            <section className="cartao">
              {/* Sem HTML: o texto vem da diretoria e é exibido como texto.
                  Interpretar markdown aqui abriria injeção de conteúdo numa
                  página pública, para economizar formatação. */}
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{evento.descricao}</p>
            </section>
          ) : null}

          <Inscricao_ evento={evento} />
        </article>
      )}
    </Conteudo>
  )
}

/** O bloco de inscrição, que é onde a página deixa de ser cartaz e vira app. */
function Inscricao_({ evento }: { evento: EventoPublico }) {
  const { perfil } = useSessao()

  const minha = useBusca<Inscricao | null>(
    () =>
      perfil
        ? Api.inscricao.minha(evento.atleticaSlug, evento.id)
        : Promise.resolve(null),
    [evento.id, perfil?.id],
  )

  const [inscricao, setInscricao] = useState<Inscricao | null>(null)
  const [trabalhando, setTrabalhando] = useState(false)
  const [falha, setFalha] = useState<unknown>(null)

  const atual = inscricao ?? minha.dados

  async function inscrever() {
    setTrabalhando(true)
    setFalha(null)
    try {
      // A atlética de origem fica nula: com um vínculo só, o servidor
      // resolve sozinho. Se a pessoa tiver vários, ele responde
      // ORIGEM_AMBIGUA e o seletor aparece abaixo.
      setInscricao(
        await Api.inscricao.criar(evento.atleticaSlug, evento.id, null, null),
      )
    } catch (erro) {
      setFalha(erro)
    } finally {
      setTrabalhando(false)
    }
  }

  async function escolherOrigem(slug: string) {
    setTrabalhando(true)
    setFalha(null)
    try {
      setInscricao(
        await Api.inscricao.criar(evento.atleticaSlug, evento.id, null, slug),
      )
    } catch (erro) {
      setFalha(erro)
    } finally {
      setTrabalhando(false)
    }
  }

  async function cancelar() {
    setTrabalhando(true)
    setFalha(null)
    try {
      await Api.inscricao.cancelar(evento.atleticaSlug, evento.id)
      setInscricao(null)
      minha.recarregar()
    } catch (erro) {
      setFalha(erro)
    } finally {
      setTrabalhando(false)
    }
  }

  if (atual) {
    return <Comprovante inscricao={atual} onCancelar={cancelar} ocupado={trabalhando} />
  }

  if (!evento.inscricaoAberta) {
    return (
      <section className="cartao">
        <p className="suave" style={{ margin: 0 }}>
          {evento.motivoDoFechamento ?? 'As inscrições não estão abertas.'}
        </p>
        {evento.inscricaoAbreEm ? (
          <p className="fraco" style={{ margin: 0 }}>
            Abrem em {dataPorExtenso(evento.inscricaoAbreEm)}.
          </p>
        ) : null}
      </section>
    )
  }

  const ambigua =
    falha instanceof FalhaDaApi && falha.codigo === 'ORIGEM_AMBIGUA'

  return (
    <section className="cartao">
      <div className="linha entre" style={{ marginBottom: '0.75rem' }}>
        <span className="suave">
          {evento.inscritosConfirmados} inscrito
          {evento.inscritosConfirmados === 1 ? '' : 's'}
        </span>
        {evento.vagasRestantes !== null ? (
          <span className={evento.vagasRestantes === 0 ? 'etiqueta' : 'etiqueta etiqueta--publicado'}>
            {evento.vagasRestantes === 0
              ? 'Lotado — entra na espera'
              : `${evento.vagasRestantes} vaga${evento.vagasRestantes === 1 ? '' : 's'}`}
          </span>
        ) : null}
      </div>

      {falha && !ambigua ? <MensagemDeErro erro={falha} /> : null}

      {ambigua && perfil ? (
        <div>
          <p className="suave">Por qual atlética você está se inscrevendo?</p>
          <div className="pilha">
            {perfil.atleticas.map(({ atletica }) => (
              <button
                key={atletica.slug}
                className="botao botao--discreto botao--largo"
                disabled={trabalhando}
                onClick={() => void escolherOrigem(atletica.slug)}
              >
                {atletica.nome}
              </button>
            ))}
          </div>
        </div>
      ) : perfil ? (
        <button
          className="botao botao--largo"
          disabled={trabalhando}
          onClick={() => void inscrever()}
        >
          {trabalhando ? 'Confirmando…' : 'Quero ir'}
        </button>
      ) : (
        <button className="botao botao--largo" onClick={entrar}>
          Entrar com Google para se inscrever
        </button>
      )}
    </section>
  )
}

/**
 * O comprovante. O token do QR aparece como texto grande e legível: a leitura
 * na portaria é por câmera, mas quando a câmera falha — e falha, no escuro do
 * ginásio — alguém digita.
 */
function Comprovante({
  inscricao,
  onCancelar,
  ocupado,
}: {
  inscricao: Inscricao
  onCancelar: () => Promise<void>
  ocupado: boolean
}) {
  const naEspera = inscricao.status === 'LISTA_ESPERA'

  return (
    <section className="cartao">
      <div className={naEspera ? 'aviso' : 'aviso aviso--sucesso'}>
        {naEspera ? (
          <>
            <strong>Você está na lista de espera</strong>
            <div className="fraco">
              Posição {inscricao.posicaoEspera}. Se alguém desistir, sua vaga é
              confirmada automaticamente.
            </div>
          </>
        ) : (
          <strong>Inscrição confirmada</strong>
        )}
      </div>

      {!naEspera ? (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <div className="fraco">Código de entrada</div>
          <code
            style={{
              display: 'block',
              fontSize: '1.05rem',
              letterSpacing: '0.08em',
              wordBreak: 'break-all',
              padding: '0.5rem',
            }}
          >
            {inscricao.checkinToken}
          </code>
          {inscricao.checkinEm ? (
            <p className="fraco">Entrada já registrada.</p>
          ) : null}
        </div>
      ) : null}

      <button
        className="botao botao--perigo botao--largo"
        disabled={ocupado}
        onClick={() => void onCancelar()}
      >
        {ocupado ? 'Cancelando…' : 'Cancelar inscrição'}
      </button>
    </section>
  )
}
