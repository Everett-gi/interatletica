import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados, MODO_DEMO } from '../dados'
import type { EventoPublico, Inscricao } from '../api/tipos'
import {
  Conteudo,
  Esqueleto,
  EtiquetaDeTipo,
  MensagemDeErro,
  useBusca,
  Vazio,
} from '../ui/componentes'
import { useCorDaAtletica } from '../ui/useCorDaAtletica'
import { dataPorExtenso, hora, quando } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'

/**
 * A tela que abre a partir do link do WhatsApp.
 *
 * <p>É a página mais visitada da plataforma e a única que a maioria das
 * pessoas verá. Responde, nesta ordem, as três perguntas de quem clicou:
 * <strong>o que é</strong>, <strong>quando e onde</strong>, <strong>como
 * entro</strong>. Login só no último passo — antes disso, pedir conta é
 * pedir crachá para quem só quer saber a hora da festa.</p>
 */
export function PaginaPublicaDoEvento() {
  const { atleticaSlug = '', eventoSlug = '' } = useParams()

  const busca = useBusca<EventoPublico | null>(
    () => Dados.eventoPublico(atleticaSlug, eventoSlug),
    [atleticaSlug, eventoSlug],
  )

  const atletica = useBusca(() => Dados.atleticaPublica(atleticaSlug), [atleticaSlug])
  useCorDaAtletica(atletica.dados?.corPrimaria)

  return (
    <Conteudo busca={busca} esqueleto={<Esqueleto altura="18rem" />}>
      {(evento) =>
        evento === null ? (
          <Vazio titulo="Evento não encontrado">
            O link pode ter mudado, ou o evento ainda não foi publicado.
          </Vazio>
        ) : (
          <article className="pilha" style={{ maxWidth: '42rem', margin: '0 auto' }}>
            <header>
              <Link to={`/a/${evento.atleticaSlug}`} className="fraco">
                {evento.atleticaNome}
              </Link>
              <h1 style={{ marginTop: '0.2rem' }}>{evento.titulo}</h1>
              <div className="linha" style={{ gap: '0.35rem' }}>
                <EtiquetaDeTipo tipo={evento.tipo} />
                {evento.modalidade ? (
                  <span className="etiqueta">{evento.modalidade}</span>
                ) : null}
              </div>
            </header>

            {evento.status === 'CANCELADO' ? (
              <div className="aviso aviso--erro" role="alert">
                <strong>Evento cancelado.</strong> Se você estava inscrito, não
                precisa comparecer.
              </div>
            ) : null}

            <section className="cartao">
              <div className="fraco">Quando</div>
              <strong>{dataPorExtenso(evento.inicioEm)}</strong>
              <div className="suave">
                {hora(evento.inicioEm)}
                {evento.fimEm ? ` às ${hora(evento.fimEm)}` : ''}
                {' · '}{quando(evento.inicioEm)}
              </div>

              {evento.localNome ? (
                <div style={{ marginTop: '1rem' }}>
                  <div className="fraco">Onde</div>
                  <strong>{evento.localNome}</strong>
                  {evento.localEndereco ? (
                    <div className="suave">{evento.localEndereco}</div>
                  ) : null}
                  {evento.localMapaUrl ? (
                    // noreferrer junto com noopener: sem ele o destino recebe
                    // o endereço do evento no cabeçalho Referer.
                    <a href={evento.localMapaUrl} target="_blank"
                       rel="noopener noreferrer">
                      Abrir no mapa
                    </a>
                  ) : null}
                </div>
              ) : null}
            </section>

            {evento.descricao ? (
              <section className="cartao">
                {/* Texto puro, sem HTML: a descrição vem da diretoria, e
                    interpretar markdown numa página pública abriria injeção
                    de conteúdo para economizar formatação. */}
                <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{evento.descricao}</p>
              </section>
            ) : null}

            <BlocoDeInscricao evento={evento} />
          </article>
        )
      }
    </Conteudo>
  )
}

/** Onde a página deixa de ser cartaz e vira aplicação. */
function BlocoDeInscricao({ evento }: { evento: EventoPublico }) {
  const { perfil, assumirPapel } = useSessao()

  const minha = useBusca<Inscricao | null>(
    () => (perfil ? Dados.minhaInscricao(evento.atleticaSlug, evento.id)
                  : Promise.resolve(null)),
    [evento.id, perfil?.id],
  )

  const [trabalhando, setTrabalhando] = useState(false)
  const [falha, setFalha] = useState<unknown>(null)

  async function executar(acao: () => Promise<unknown>) {
    setTrabalhando(true)
    setFalha(null)
    try {
      await acao()
      minha.recarregar()
    } catch (erro) {
      setFalha(erro)
    } finally {
      setTrabalhando(false)
    }
  }

  if (minha.dados) {
    return (
      <Comprovante
        inscricao={minha.dados}
        ocupado={trabalhando}
        aoCancelar={() =>
          executar(() => Dados.cancelarInscricao(evento.atleticaSlug, evento.id))}
      />
    )
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

  const lotado = evento.vagasRestantes === 0

  return (
    <section className="cartao">
      <div className="linha entre" style={{ marginBottom: '0.8rem' }}>
        <span className="suave">
          {evento.inscritosConfirmados} inscrito
          {evento.inscritosConfirmados === 1 ? '' : 's'}
        </span>
        {evento.vagasRestantes !== null ? (
          <span className={`etiqueta ${lotado ? 'etiqueta--alerta' : 'etiqueta--sucesso'}`}>
            {lotado
              ? 'Só lista de espera'
              : `${evento.vagasRestantes} vaga${evento.vagasRestantes === 1 ? '' : 's'}`}
          </span>
        ) : null}
      </div>

      {falha ? <MensagemDeErro erro={falha} /> : null}

      {perfil ? (
        <button
          className="botao botao--largo"
          disabled={trabalhando}
          onClick={() =>
            void executar(() => Dados.inscrever(evento.atleticaSlug, evento.id))}
        >
          {trabalhando ? 'Confirmando…' : lotado ? 'Entrar na lista de espera' : 'Quero ir'}
        </button>
      ) : MODO_DEMO ? (
        <button className="botao botao--largo"
                onClick={() => void assumirPapel('MEMBRO')}>
          Entrar na demonstração para se inscrever
        </button>
      ) : (
        <a className="botao botao--largo" href="/oauth2/authorization/google">
          Entrar com Google para se inscrever
        </a>
      )}
    </section>
  )
}

/**
 * O comprovante. O código aparece como texto grande e legível: a leitura na
 * portaria é por câmera, mas quando a câmera falha — e falha, no escuro do
 * ginásio — alguém digita.
 */
function Comprovante({ inscricao, aoCancelar, ocupado }: {
  inscricao: Inscricao
  aoCancelar: () => void
  ocupado: boolean
}) {
  const naEspera = inscricao.status === 'LISTA_ESPERA'

  return (
    <section className="cartao">
      <div className={naEspera ? 'aviso aviso--alerta' : 'aviso aviso--sucesso'}>
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
        <div style={{ textAlign: 'center', margin: '1.1rem 0' }}>
          <div className="fraco">Código de entrada</div>
          <code
            style={{
              display: 'block', fontSize: '1.05rem', letterSpacing: '0.08em',
              wordBreak: 'break-all', padding: '0.5rem',
            }}
          >
            {inscricao.checkinToken}
          </code>
          {inscricao.checkinEm ? (
            <p className="fraco">Entrada já registrada.</p>
          ) : (
            <p className="fraco">Apresente este código na portaria.</p>
          )}
        </div>
      ) : null}

      <button
        className="botao botao--perigo botao--largo"
        disabled={ocupado}
        onClick={aoCancelar}
      >
        {ocupado ? 'Cancelando…' : 'Cancelar inscrição'}
      </button>
    </section>
  )
}
