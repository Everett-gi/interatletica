import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { EventoResumo, Participante } from '../../../api/tipos'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, percentual, quando } from '../../../formatos'
import { atleticaPorSlug } from '../../../demo/dados'

interface Composicao {
  eventos: EventoResumo[]
  porEvento: { evento: EventoResumo; participantes: Participante[] }[]
}

/**
 * A central de inscrições.
 *
 * <p>Reúne o que estava espalhado numa aba dentro de cada evento. A pergunta
 * que ela responde é de quem organiza vários eventos ao mesmo tempo: "onde
 * estão faltando inscritos e onde já estourou a capacidade?" — e essa
 * pergunta não cabe dentro de um evento só.</p>
 */
export function Inscricoes() {
  const { slug = '' } = useParams()
  const [aberto, setAberto] = useState<string | null>(null)

  const busca = useBusca<Composicao>(async () => {
    const eventos = await Dados.eventosDaAtletica(slug)
    const publicados = eventos.filter((e) => e.status === 'PUBLICADO')
    const porEvento = await Promise.all(
      publicados.map(async (evento) => ({
        evento,
        participantes: await Dados.participantes(slug, evento.id),
      })))
    return { eventos, porEvento }
  }, [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Inscrições"
        descricao="Quantos entraram em cada evento, de onde vieram e quem está na espera."
      />

      <Conteudo busca={busca} esqueleto={<Esqueleto altura="18rem" />}>
        {({ porEvento }) => {
          if (porEvento.length === 0) {
            return (
              <EstadoVazio icone="inscricoes" titulo="Nenhum evento publicado">
                <p className="fraco">
                  As inscrições aparecem aqui quando um evento estiver no ar.
                </p>
                <Link to={`/hub/${slug}/eventos/novo`} className="botao">
                  <Icone nome="mais" tamanho={16} /> Criar evento
                </Link>
              </EstadoVazio>
            )
          }

          const todos = porEvento.flatMap((p) => p.participantes)
          const confirmados = todos.filter((p) => p.status === 'CONFIRMADA')
          const naEspera = todos.filter((p) => p.status === 'LISTA_ESPERA')
          const presentes = todos.filter((p) => p.checkinEm !== null)

          // De onde vieram: o número que só um interatlética responde, e o
          // motivo de a inscrição guardar a atlética de ORIGEM.
          const origem = new Map<string, number>()
          confirmados.forEach((p) => {
            const nome = p.atleticaDeOrigem
              ? atleticaPorSlug(p.atleticaDeOrigem)?.nome ?? 'Outra'
              : 'Sem atlética'
            origem.set(nome, (origem.get(nome) ?? 0) + 1)
          })
          const ranking = [...origem.entries()]
            .map(([nome, total]) => ({ nome, total }))
            .sort((a, b) => b.total - a.total)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Inscritos confirmados" icone="inscricoes"
                         valor={confirmados.length} />
                <Metrica rotulo="Na lista de espera" icone="relogio"
                         valor={naEspera.length}
                         cor={naEspera.length > 0 ? 'var(--alerta)' : undefined}
                         detalhe="promovidos automaticamente em caso de cancelamento" />
                <Metrica rotulo="Compareceram" icone="certo" valor={presentes.length}
                         detalhe={confirmados.length > 0
                           ? `${percentual(presentes.length / confirmados.length)} dos confirmados`
                           : undefined} />
                <Metrica rotulo="Atléticas de origem" icone="rede" valor={ranking.length} />
              </div>

              <div className="detalhe">
                <div>
                  <Secao titulo="Por evento">
                    <div className="pilha pilha--densa">
                      {porEvento.map(({ evento, participantes }) => {
                        const conf = participantes.filter(
                          (p) => p.status === 'CONFIRMADA').length
                        const espera = participantes.filter(
                          (p) => p.status === 'LISTA_ESPERA').length
                        const compareceram = participantes.filter(
                          (p) => p.checkinEm !== null).length
                        const expandido = aberto === evento.id

                        return (
                          <div key={evento.id} className="cartao">
                            <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                              <div style={{ minWidth: 0 }}>
                                <strong>{evento.titulo}</strong>
                                <div className="fraco">
                                  {dataEHora(evento.inicioEm)} · {quando(evento.inicioEm)}
                                </div>
                              </div>
                              <Link to={`/hub/${slug}/eventos/${evento.id}`}
                                    className="botao botao--fantasma botao--pequeno">
                                Abrir
                              </Link>
                            </div>

                            <div className="linha" style={{ gap: '1.4rem',
                                                            marginBottom: '0.6rem' }}>
                              <div>
                                <div className="numero-medio">{conf}</div>
                                <div className="fraco">confirmados</div>
                              </div>
                              <div>
                                <div className="numero-medio">{espera}</div>
                                <div className="fraco">na espera</div>
                              </div>
                              <div>
                                <div className="numero-medio">{compareceram}</div>
                                <div className="fraco">presentes</div>
                              </div>
                            </div>

                            {conf > 0 ? (
                              <Progresso
                                proporcao={compareceram / conf}
                                tom={compareceram / conf < 0.5 ? 'alerta' : 'sucesso'}
                              />
                            ) : null}

                            <button
                              className="botao botao--fantasma botao--pequeno"
                              style={{ marginTop: '0.6rem' }}
                              onClick={() => setAberto(expandido ? null : evento.id)}
                              aria-expanded={expandido}
                            >
                              <Icone nome={expandido ? 'cima' : 'baixo'} tamanho={14} />
                              {expandido ? 'Esconder' : 'Ver'} a lista
                            </button>

                            {expandido ? (
                              <div className="rolagem" style={{ marginTop: '0.7rem' }}>
                                <table className="tabela-cartoes">
                                  <thead>
                                    <tr>
                                      <th>Participante</th>
                                      <th>Origem</th>
                                      <th>Situação</th>
                                      <th>Entrada</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {participantes.slice(0, 25).map((p) => (
                                      <tr key={p.inscricaoId}>
                                        <td data-rotulo="Participante">
                                          <div style={{ fontWeight: 550 }}>{p.nome}</div>
                                          <div className="fraco">{p.email}</div>
                                        </td>
                                        <td data-rotulo="Origem">
                                          {p.atleticaDeOrigem
                                            ? atleticaPorSlug(p.atleticaDeOrigem)?.sigla
                                              ?? p.atleticaDeOrigem
                                            : <span className="fraco">sem atlética</span>}
                                        </td>
                                        <td data-rotulo="Situação">
                                          <span className={`etiqueta ${
                                            p.status === 'CONFIRMADA'
                                              ? 'etiqueta--sucesso' : 'etiqueta--alerta'}`}>
                                            {p.status === 'CONFIRMADA'
                                              ? 'confirmada'
                                              : `espera ${p.posicaoEspera}º`}
                                          </span>
                                        </td>
                                        <td data-rotulo="Entrada">
                                          {p.checkinEm
                                            ? quando(p.checkinEm)
                                            : <span className="fraco">—</span>}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {participantes.length > 25 ? (
                                  <div className="fraco" style={{ padding: '0.6rem 0.8rem' }}>
                                    Mostrando 25 de {participantes.length}. A lista
                                    completa sai em CSV na página do evento.
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </Secao>
                </div>

                <div>
                  <Secao
                    titulo="De onde vieram"
                    descricao="A atlética de origem de cada inscrito — o número que decide se vale repetir um interatlética."
                  >
                    <div className="cartao">
                      <div className="pilha pilha--densa">
                        {ranking.map((linha) => (
                          <div key={linha.nome}>
                            <div className="linha entre" style={{ marginBottom: '0.2rem' }}>
                              <span style={{ fontSize: '0.88rem' }}>{linha.nome}</span>
                              <span className="fraco">{linha.total}</span>
                            </div>
                            <Progresso proporcao={linha.total / (ranking[0]?.total || 1)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Secao>
                </div>
              </div>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
