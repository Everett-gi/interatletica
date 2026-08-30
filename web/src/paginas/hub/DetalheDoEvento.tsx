import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Evento, Participante, StatusDoEvento } from '../../api/tipos'
import type { Torneio as TorneioDto } from '../../api/tipos-rede'
import {
  Abas,
  Carregando,
  Conteudo,
  Esqueleto,
  EtiquetaDeStatus,
  MensagemDeErro,
  Metrica,
  useBusca,
  Vazio,
} from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
import { dataEHora, hora } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

/** A tela de trabalho da diretoria durante um evento. */
export function DetalheDoEvento() {
  const { slug = '', eventoId = '' } = useParams()
  const { vinculo, podeAtuarComo } = useSessao()
  useCorDaAtletica(vinculo(slug)?.atletica.corPrimaria)

  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const busca = useBusca<Evento | null>(() => Dados.evento(slug, eventoId),
    [slug, eventoId])

  const [falha, setFalha] = useState<unknown>(null)
  const [ocupado, setOcupado] = useState(false)

  async function mudar(status: StatusDoEvento) {
    setOcupado(true)
    setFalha(null)
    try {
      await Dados.mudarStatusDoEvento(eventoId, status)
      busca.recarregar()
    } catch (erro) {
      setFalha(erro)
    } finally {
      setOcupado(false)
    }
  }

  if (busca.carregando) return <Carregando />
  if (busca.erro) return <MensagemDeErro erro={busca.erro} />
  if (!busca.dados) return <Vazio titulo="Evento não encontrado" />

  const evento = busca.dados
  const linkPublico = `${window.location.origin}/e/${slug}/${evento.slug}`
  const ocupacao = evento.capacidade
    ? Math.round((evento.inscritosConfirmados / evento.capacidade) * 100)
    : null

  return (
    <div className="pilha" style={{ gap: '1.4rem' }}>
      <header>
        <Link to={`/hub/${slug}/eventos`} className="fraco">← Eventos</Link>
        <div className="linha entre" style={{ marginTop: '0.3rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.1rem' }}>{evento.titulo}</h1>
            <div className="fraco">
              {dataEHora(evento.inicioEm)}
              {evento.localNome ? ` · ${evento.localNome}` : ''}
            </div>
          </div>
          <EtiquetaDeStatus status={evento.status} />
        </div>
      </header>

      {falha ? <MensagemDeErro erro={falha} /> : null}

      <div className="grade grade--metricas">
        <Metrica rotulo="Confirmados" valor={evento.inscritosConfirmados}
                 detalhe={evento.capacidade ? `de ${evento.capacidade}` : 'sem limite'} />
        <Metrica rotulo="Lista de espera" valor={evento.naListaDeEspera}
                 cor={evento.naListaDeEspera > 0 ? 'var(--alerta)' : undefined} />
        {ocupacao !== null ? (
          <Metrica rotulo="Ocupação" valor={`${ocupacao}%`} />
        ) : null}
      </div>

      {evento.status === 'PUBLICADO' ? <LinkPublico link={linkPublico} /> : null}

      <Torneio slug={slug} eventoId={eventoId} />


      {diretor ? (
        <section className="cartao">
          <h3>Ações</h3>
          <div className="linha">
            <Link to={`/hub/${slug}/eventos/${eventoId}/editar`}
                  className="botao botao--discreto">Editar</Link>

            {evento.status === 'RASCUNHO' ? (
              <button className="botao" disabled={ocupado}
                      onClick={() => void mudar('PUBLICADO')}>Publicar</button>
            ) : null}

            {evento.status === 'PUBLICADO' ? (
              <>
                <Link to={`/hub/${slug}/eventos/${eventoId}/portaria`}
                      className="botao botao--discreto">Portaria</Link>
                <button className="botao botao--discreto" disabled={ocupado}
                        onClick={() => void mudar('ENCERRADO')}>Encerrar</button>
              </>
            ) : null}

            {evento.status !== 'CANCELADO' && evento.status !== 'ENCERRADO' ? (
              <button
                className="botao botao--perigo"
                disabled={ocupado}
                onClick={() => {
                  // Cancelar é visível para quem já se inscreveu e não tem
                  // desfazer. Vale a confirmação.
                  if (window.confirm(
                    'Cancelar o evento? Quem se inscreveu verá o aviso ao abrir o link.')) {
                    void mudar('CANCELADO')
                  }
                }}
              >
                Cancelar evento
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {diretor ? <ListaDePresenca slug={slug} eventoId={eventoId} /> : null}
    </div>
  )
}

/**
 * O torneio deste evento, se houver.
 *
 * <p>Fica aqui, e não numa seção "Torneios" na navegação, porque um
 * campeonato É um evento — o schema sempre disse isso, com
 * {@code torneio.evento_id} obrigatório. Separar os dois obrigava a pessoa
 * a adivinhar em qual das duas seções procurar a mesma coisa.</p>
 */
function Torneio({ slug, eventoId }: { slug: string; eventoId: string }) {
  const busca = useBusca<TorneioDto | null>(
    () => Dados.torneioDoEvento(eventoId), [eventoId])

  if (busca.carregando || !busca.dados) {
    return null
  }

  const torneio = busca.dados
  const encerradas = torneio.partidas.filter((p) => p.status === 'ENCERRADA').length
  const emAndamento = torneio.partidas.some((p) => p.status === 'EM_ANDAMENTO')

  return (
    <section className="cartao">
      <div className="linha entre">
        <div>
          <div className="linha" style={{ gap: '0.4rem', marginBottom: '0.2rem' }}>
            <h3 style={{ margin: 0 }}>Chaveamento</h3>
            {emAndamento ? (
              <span className="etiqueta etiqueta--sucesso">● ao vivo</span>
            ) : null}
          </div>
          <div className="fraco">
            {torneio.modalidade} · {torneio.participantes.length} participantes ·{' '}
            {encerradas} de {torneio.partidas.length} partidas
          </div>
        </div>
        <Link to={`/hub/${slug}/eventos/${eventoId}/torneio`} className="botao">
          Abrir chaveamento
        </Link>
      </div>
    </section>
  )
}

/**
 * O link que a diretoria cola no grupo. Copiar com um toque, porque a
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
      // Clipboard exige contexto seguro e permissão; em HTTP local não
      // existe. O link continua visível para copiar na mão — o que não pode
      // é o botão sumir sem explicação.
      setCopiado(false)
    }
  }

  return (
    <section className="cartao">
      <div className="fraco">Link público, para colar no grupo</div>
      <div className="linha entre">
        <code style={{ wordBreak: 'break-all' }}>{link}</code>
        <button className="botao botao--discreto botao--pequeno"
                onClick={() => void copiar()}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </section>
  )
}

type FiltroDePresenca = 'TODOS' | 'CONFIRMADA' | 'LISTA_ESPERA' | 'PRESENTES'

function ListaDePresenca({ slug, eventoId }: { slug: string; eventoId: string }) {
  const [filtro, setFiltro] = useState<FiltroDePresenca>('TODOS')
  const [busca, setBusca] = useState('')
  const lista = useBusca<Participante[]>(() => Dados.participantes(slug, eventoId),
    [slug, eventoId])

  // A coluna de origem guarda o slug. Mostrar "LEOES" numa lista impressa
  // não diz nada a quem está na portaria — o nome da atlética, sim.
  const atleticas = useBusca(() => Dados.vitrine(), [])
  const nomeDaOrigem = (slugDaOrigem: string | null) => {
    if (!slugDaOrigem) return null
    const encontrada = atleticas.dados?.find((a) => a.slug === slugDaOrigem)
    return encontrada?.sigla ?? encontrada?.nome ?? slugDaOrigem
  }

  function filtrar(pessoas: Participante[]): Participante[] {
    const termo = busca.trim().toLowerCase()
    return pessoas
      .filter((p) => {
        if (filtro === 'PRESENTES') return p.checkinEm !== null
        if (filtro === 'TODOS') return true
        return p.status === filtro
      })
      .filter((p) => termo === '' ||
        `${p.nome ?? ''} ${p.email ?? ''}`.toLowerCase().includes(termo))
  }

  return (
    <section>
      <div className="cabecalho-de-secao">
        <h2>Participantes</h2>
        {/* Âncora, e não fetch: é o Content-Disposition da resposta que faz
            o arquivo baixar com nome. Por fetch seria preciso montar Blob e
            link sintético para chegar no mesmo lugar. */}
        <a className="botao botao--discreto botao--pequeno"
           href={`/api/a/${slug}/eventos/${eventoId}/participantes.csv`}>
          Baixar CSV
        </a>
      </div>

      <div className="linha" style={{ marginBottom: '0.8rem' }}>
        <input
          type="search" value={busca} onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail" aria-label="Buscar participantes"
          style={{ maxWidth: '20rem' }}
        />
      </div>

      <Abas
        atual={filtro}
        aoTrocar={setFiltro}
        opcoes={[
          { valor: 'TODOS', rotulo: 'Todos', contagem: lista.dados?.length },
          {
            valor: 'CONFIRMADA', rotulo: 'Confirmados',
            contagem: lista.dados?.filter((p) => p.status === 'CONFIRMADA').length,
          },
          {
            valor: 'LISTA_ESPERA', rotulo: 'Espera',
            contagem: lista.dados?.filter((p) => p.status === 'LISTA_ESPERA').length,
          },
          {
            valor: 'PRESENTES', rotulo: 'Presentes',
            contagem: lista.dados?.filter((p) => p.checkinEm !== null).length,
          },
        ]}
      />

      <Conteudo busca={lista} esqueleto={<Esqueleto altura="14rem" />}>
        {(pessoas) => {
          const visiveis = filtrar(pessoas)
          if (visiveis.length === 0) {
            return <Vazio>Ninguém encontrado com esse filtro.</Vazio>
          }
          return (
            <div className="rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Origem</th>
                    <th>Situação</th>
                    <th>Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.slice(0, 200).map((p) => (
                    <tr key={p.inscricaoId}>
                      <td>{p.nome ?? 'sem nome'}</td>
                      <td className="fraco">{p.email ?? 'não informado'}</td>
                      <td>
                        {p.atleticaDeOrigem
                          ? <span className="etiqueta">{nomeDaOrigem(p.atleticaDeOrigem)}</span>
                          : <span className="fraco">sem atlética</span>}
                      </td>
                      <td>
                        {p.status === 'LISTA_ESPERA' ? (
                          <span className="etiqueta etiqueta--alerta">
                            espera {p.posicaoEspera}º
                          </span>
                        ) : (
                          <span className="etiqueta etiqueta--sucesso">confirmada</span>
                        )}
                      </td>
                      <td>
                        {p.checkinEm
                          ? <span className="etiqueta etiqueta--sucesso">
                              {hora(p.checkinEm)}
                            </span>
                          : <span className="fraco">não entrou</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }}
      </Conteudo>
    </section>
  )
}
