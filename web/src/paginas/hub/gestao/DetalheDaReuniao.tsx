import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Reuniao } from '../../../api/tipos-gestao'
import { Avatar, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataPorExtenso, hora, plural, quando } from '../../../formatos'

/**
 * Uma reunião: pauta, participantes, ata e o que saiu dela.
 *
 * <p>A ligação entre pauta e decisão é o que faz a memória funcionar. Meses
 * depois, a pergunta nunca é "o que foi discutido"; é "por que decidimos
 * assim". Aqui a pauta aponta para a votação, e a votação aponta de volta
 * para a reunião.</p>
 */
export function DetalheDaReuniao() {
  const { slug = '', id = '' } = useParams()
  const reuniao = useBusca<Reuniao | null>(() => Dados.reuniao(id), [id])

  return (
    <div>
      <Conteudo busca={reuniao} esqueleto={<Esqueleto altura="20rem" />}>
        {(r) => {
          if (!r) {
            return (
              <EstadoVazio icone="reunioes" titulo="Reunião não encontrada">
                <Link to={`/hub/${slug}/reunioes`} className="botao botao--discreto">
                  Voltar às reuniões
                </Link>
              </EstadoVazio>
            )
          }

          const confirmados = r.convocados.filter((c) => c.confirmado)
          const minutos = r.pautas.reduce((s, p) => s + p.minutos, 0)

          return (
            <>
              <CabecalhoDePagina
                titulo={r.titulo}
                descricao={`${dataPorExtenso(r.inicioEm)} · ${hora(r.inicioEm)} · ${r.duracaoEmMinutos} minutos`}
                trilha={[
                  { rotulo: 'Reuniões', para: `/hub/${slug}/reunioes` },
                  { rotulo: r.titulo },
                ]}
                etiqueta={
                  <span className={`etiqueta ${
                    r.status === 'AGENDADA' ? 'etiqueta--acento'
                      : r.status === 'REALIZADA' ? 'etiqueta--sucesso' : ''}`}>
                    {r.status.toLowerCase()}
                  </span>
                }
                acoes={r.linkOnline && r.status === 'AGENDADA' ? (
                  <a className="botao" href={r.linkOnline} target="_blank" rel="noreferrer">
                    <Icone nome="externo" tamanho={16} /> Entrar
                  </a>
                ) : undefined}
              />

              <div className="detalhe">
                <div>
                  <Secao
                    titulo="Pauta"
                    descricao={`${r.pautas.length} pontos · ${minutos} minutos previstos`}
                  >
                    <div className="pilha pilha--densa">
                      {r.pautas.map((pauta, i) => (
                        <div key={pauta.id} className="cartao">
                          <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
                            <div className="linha" style={{ gap: '0.55rem', minWidth: 0 }}>
                              <span className="passo__marca">{i + 1}</span>
                              <strong>{pauta.titulo}</strong>
                            </div>
                            <span className="fraco">{pauta.minutos} min</span>
                          </div>
                          <div className="linha entre" style={{ paddingLeft: '2.25rem' }}>
                            <span className="fraco">
                              {pauta.responsavel ?? 'sem responsável'}
                            </span>
                            {pauta.decisaoId ? (
                              <Link to={`/hub/${slug}/decisoes/${pauta.decisaoId}`}
                                    className="etiqueta etiqueta--acento">
                                gera decisão
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Secao>

                  <Secao titulo="Ata">
                    {r.ata ? (
                      <div className="cartao">
                        <p className="suave" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                          {r.ata}
                        </p>
                        {r.tarefasGeradas > 0 ? (
                          <>
                            <hr className="divisor" />
                            <div className="linha entre">
                              <span className="fraco">
                                {plural(r.tarefasGeradas, 'tarefa')} {r.tarefasGeradas === 1 ? 'saiu' : 'saíram'} desta reunião
                              </span>
                              <Link to={`/hub/${slug}/tarefas`}
                                    className="botao botao--discreto botao--pequeno">
                                Ver no quadro
                              </Link>
                            </div>
                          </>
                        ) : null}
                      </div>
                    ) : r.status === 'AGENDADA' ? (
                      <EstadoVazio icone="documentos" titulo="A ata é escrita depois">
                        <p className="fraco">
                          Quando a reunião acontecer, registre o que foi deliberado.
                          Ata não é formalidade: é a prova de que a decisão foi
                          coletiva, e é o que existe quando alguém contestar um
                          gasto dois anos depois.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <EstadoVazio icone="alerta" titulo="Reunião sem ata">
                        <p className="fraco">
                          Aconteceu e não ficou registrado. Isso é exatamente o que
                          se perde na troca de gestão.
                        </p>
                      </EstadoVazio>
                    )}
                  </Secao>
                </div>

                <div>
                  <Secao titulo={`Convocados (${r.convocados.length})`}>
                    <div className="cartao">
                      <div className="pilha pilha--densa">
                        {r.convocados.map((c) => (
                          <div key={c.nome} className="linha">
                            <Avatar nome={c.nome} url={c.avatarUrl} />
                            <span style={{ flex: 1, minWidth: 0, fontSize: '0.9rem' }}>
                              {c.nome}
                            </span>
                            <span className={`etiqueta ${
                              c.confirmado ? 'etiqueta--sucesso' : ''}`}>
                              {c.confirmado ? 'confirmou' : 'sem resposta'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <hr className="divisor" />
                      <div className="fraco">
                        {confirmados.length} de {r.convocados.length} confirmaram presença
                      </div>
                    </div>
                  </Secao>

                  <Secao titulo="Onde">
                    <div className="cartao">
                      {r.local ? (
                        <div className="linha" style={{ marginBottom: '0.4rem' }}>
                          <Icone nome="local" tamanho={16} />
                          <span>{r.local}</span>
                        </div>
                      ) : null}
                      {r.linkOnline ? (
                        <div className="linha">
                          <Icone nome="externo" tamanho={16} />
                          <a href={r.linkOnline} target="_blank" rel="noreferrer"
                             style={{ wordBreak: 'break-all' }}>
                            {r.linkOnline}
                          </a>
                        </div>
                      ) : null}
                      <hr className="divisor" />
                      <div className="fraco">{quando(r.inicioEm)}</div>
                    </div>
                  </Secao>

                  {r.documentos.length > 0 ? (
                    <Secao titulo="Documentos">
                      <div className="pilha pilha--densa">
                        {r.documentos.map((doc) => (
                          <div key={doc} className="cartao cartao--compacto linha">
                            <Icone nome="documentos" tamanho={16} />
                            <span style={{ fontSize: '0.88rem' }}>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </Secao>
                  ) : null}
                </div>
              </div>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
