import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Equipe, FuncaoNaEquipe } from '../../../api/tipos-rede'
import type { Jogo } from '../../../api/tipos-esportes'
import { Avatar, Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, percentual, quando } from '../../../formatos'
import { atleticaPorSlug } from '../../../demo/dados'

const FUNCAO: Record<FuncaoNaEquipe, { rotulo: string; classe: string }> = {
  CAPITAO: { rotulo: 'Capitão', classe: 'etiqueta--acento' },
  TITULAR: { rotulo: 'Titular', classe: '' },
  RESERVA: { rotulo: 'Reserva', classe: '' },
  TECNICO: { rotulo: 'Técnico', classe: 'etiqueta--alerta' },
}

interface Composicao {
  equipe: Equipe | undefined
  jogos: Jogo[]
}

/**
 * A ficha de uma equipe (§26).
 *
 * <p>Elenco, calendário, resultados e títulos numa página só, porque é assim
 * que a pergunta chega: "como está o vôlei feminino?" — e não "quem são os
 * atletas do vôlei feminino" separado de "quais foram os jogos do vôlei
 * feminino".</p>
 */
export function DetalheDaEquipe() {
  const { slug = '', id = '' } = useParams()

  const busca = useBusca<Composicao>(async () => {
    const [equipes, jogos] = await Promise.all([
      Dados.equipes(slug),
      Dados.jogos(slug),
    ])
    return { equipe: equipes.find((e) => e.id === id), jogos }
  }, [slug, id])

  return (
    <div>
      <Conteudo busca={busca} esqueleto={<Esqueleto altura="20rem" />}>
        {({ equipe, jogos }) => {
          if (!equipe) {
            return (
              <EstadoVazio icone="equipes" titulo="Equipe não encontrada">
                <Link to={`/hub/${slug}/equipes`} className="botao botao--discreto">
                  Voltar às equipes
                </Link>
              </EstadoVazio>
            )
          }

          const daEquipe = jogos.filter((j) => j.equipeNome === equipe.nome)
          const disputados = daEquipe.filter((j) => j.resultado !== 'PENDENTE')
          const vitorias = disputados.filter((j) => j.resultado === 'VITORIA').length
          const proximos = daEquipe
            .filter((j) => new Date(j.inicioEm) >= new Date())
            .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm))
          // E-sports usa nickname; esporte de quadra usa número. A mesma
          // tabela guarda os dois, e a tela mostra o que faz sentido.
          const usaNick = equipe.elenco.some((a) => a.nick !== null)

          return (
            <>
              <CabecalhoDePagina
                titulo={equipe.nome}
                descricao={`${equipe.modalidade} · ${equipe.elenco.length} atletas`}
                trilha={[
                  { rotulo: 'Equipes', para: `/hub/${slug}/equipes` },
                  { rotulo: equipe.nome },
                ]}
                etiqueta={
                  <span className={`etiqueta ${equipe.ativa ? 'etiqueta--sucesso' : ''}`}>
                    {equipe.ativa ? 'ativa' : 'inativa'}
                  </span>
                }
              />

              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Atletas" icone="atletas" valor={equipe.elenco.length} />
                <Metrica rotulo="Jogos disputados" icone="jogos" valor={disputados.length} />
                <Metrica
                  rotulo="Aproveitamento" icone="resultados"
                  valor={disputados.length === 0
                    ? '—' : percentual(vitorias / disputados.length)}
                  detalhe={`${vitorias} vitórias`}
                />
                <Metrica rotulo="Próximos jogos" icone="calendario" valor={proximos.length} />
              </div>

              <div className="detalhe">
                <div>
                  <Secao titulo="Elenco">
                    <div className="cartao">
                      <div className="pilha pilha--densa">
                        {equipe.elenco.map((atleta) => (
                          <div key={atleta.usuarioId} className="linha">
                            <Avatar nome={atleta.nome} url={atleta.avatarUrl} tamanho="m" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 550 }}>{atleta.nome}</div>
                              {usaNick && atleta.nick ? (
                                <code className="fraco">{atleta.nick}</code>
                              ) : null}
                            </div>
                            {atleta.numero !== null ? (
                              <span className="numero-medio">#{atleta.numero}</span>
                            ) : null}
                            <span className={`etiqueta ${FUNCAO[atleta.funcao].classe}`}>
                              {FUNCAO[atleta.funcao].rotulo}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Secao>

                  <Secao titulo="Jogos"
                         acao={
                           <Link to={`/hub/${slug}/jogos`}
                                 className="botao botao--fantasma botao--pequeno">
                             Ver todos
                           </Link>
                         }>
                    {daEquipe.length === 0 ? (
                      <EstadoVazio icone="jogos" titulo="Nenhum jogo registrado">
                        <p className="fraco">
                          Marque um amistoso pela seção Amistosos da rede: outra
                          atlética já está procurando adversário nesta modalidade.
                        </p>
                        <Link to={`/hub/${slug}/rede/amistosos`}
                              className="botao botao--discreto">
                          Procurar adversário
                        </Link>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha pilha--densa">
                        {[...daEquipe]
                          .sort((a, b) => b.inicioEm.localeCompare(a.inicioEm))
                          .map((j) => {
                            const adversaria = j.adversarioAtleticaSlug
                              ? atleticaPorSlug(j.adversarioAtleticaSlug) : undefined
                            return (
                              <div key={j.id} className="cartao cartao--compacto linha entre">
                                <div className="linha" style={{ minWidth: 0, gap: '0.5rem' }}>
                                  {adversaria ? (
                                    <Brasao atletica={adversaria} tamanho="p" />
                                  ) : null}
                                  <div style={{ minWidth: 0 }}>
                                    <strong>{j.adversario}</strong>
                                    <div className="fraco">
                                      {dataEHora(j.inicioEm)}
                                      {j.competicao ? ` · ${j.competicao}` : ''}
                                    </div>
                                  </div>
                                </div>
                                {j.resultado === 'PENDENTE' ? (
                                  <span className="etiqueta">{quando(j.inicioEm)}</span>
                                ) : (
                                  <span className={`etiqueta ${
                                    j.resultado === 'VITORIA' ? 'etiqueta--sucesso'
                                      : j.resultado === 'DERROTA' ? 'etiqueta--perigo'
                                      : 'etiqueta--alerta'}`}>
                                    {j.placarNos} × {j.placarDeles}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </Secao>
                </div>

                <div>
                  <Secao titulo="A equipe">
                    <div className="cartao">
                      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                        <span className="fraco">Modalidade</span>
                        <span>{equipe.modalidade}</span>
                      </div>
                      {equipe.tag ? (
                        <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                          <span className="fraco">Sigla</span>
                          <span>{equipe.tag}</span>
                        </div>
                      ) : null}
                      <div className="linha entre">
                        <span className="fraco">Capitão</span>
                        <span>
                          {equipe.elenco.find((a) => a.funcao === 'CAPITAO')?.nome ?? '—'}
                        </span>
                      </div>
                      <hr className="divisor" />
                      <p className="fraco" style={{ margin: 0 }}>
                        A equipe é da atlética e atravessa os eventos: ela se
                        inscreve em torneios, não é criada por evento.
                      </p>
                    </div>
                  </Secao>

                  <Secao titulo="Próximos compromissos">
                    {proximos.length === 0 ? (
                      <EstadoVazio titulo="Nada marcado" />
                    ) : (
                      <div className="pilha pilha--densa">
                        {proximos.map((j) => (
                          <div key={j.id} className="cartao cartao--compacto">
                            <strong style={{ fontSize: '0.92rem' }}>
                              contra {j.adversario}
                            </strong>
                            <div className="fraco">
                              {dataEHora(j.inicioEm)} · {quando(j.inicioEm)}
                            </div>
                            {j.local ? (
                              <div className="linha fraco" style={{ gap: '0.3rem' }}>
                                <Icone nome="local" tamanho={13} /> {j.local}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
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
