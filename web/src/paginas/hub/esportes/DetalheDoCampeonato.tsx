import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { LinhaDaTabela, Torneio } from '../../../api/tipos-rede'
import type { LinhaDeArtilharia } from '../../../api/tipos-esportes'
import {
  Abas,
  Brasao,
  Conteudo,
  Esqueleto,
  Metrica,
  Previa,
  useBusca,
} from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, plural } from '../../../formatos'
import { atleticaPorSlug } from '../../../demo/dados'
import { useSessao } from '../../../sessao/SessaoContexto'
import { QuadroDeChaveamento, ClassificacaoDoTorneio } from '../Chaveamento'
import { FORMATO } from './Campeonatos'

type Aba = 'VISAO' | 'CHAVE' | 'EQUIPES' | 'JOGOS' | 'CLASSIFICACAO' | 'ARTILHARIA'

interface Composicao {
  torneio: Torneio | null
  artilharia: LinhaDeArtilharia[]
}

/**
 * O painel de um campeonato (§25).
 *
 * <p>Abre pelo resumo — fase atual, equipes, jogos — e só depois oferece
 * chave, tabela e artilharia em abas. Abrir direto no chaveamento parecia
 * óbvio e não era: quem entra aqui na semana do evento quer saber "em que
 * fase estamos" antes de procurar um confronto específico.</p>
 */
export function DetalheDoCampeonato() {
  const { slug = '', id = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [aba, setAba] = useState<Aba>('VISAO')

  const busca = useBusca<Composicao>(async () => {
    const [torneio, artilharia] = await Promise.all([
      Dados.torneio(id),
      Dados.artilharia(),
    ])
    return { torneio, artilharia }
  }, [id])

  return (
    <div>
      <Conteudo busca={busca} esqueleto={<Esqueleto altura="22rem" />}>
        {({ torneio, artilharia }) => {
          if (!torneio) {
            return (
              <EstadoVazio icone="campeonatos" titulo="Campeonato não encontrado">
                <Link to={`/hub/${slug}/campeonatos`} className="botao botao--discreto">
                  Voltar aos campeonatos
                </Link>
              </EstadoVazio>
            )
          }

          const total = torneio.partidas.length
          const feitas = torneio.partidas.filter((p) => p.status === 'ENCERRADA').length
          const ativos = torneio.participantes.filter((p) => p.situacao === 'ATIVO')
          const aoVivo = torneio.partidas.filter((p) => p.status === 'EM_ANDAMENTO')
          const proximas = torneio.partidas
            .filter((p) => p.status === 'AGENDADA' && p.inicioEm !== null)
            .sort((a, b) => (a.inicioEm ?? '').localeCompare(b.inicioEm ?? ''))
          const tabela = montarTabela(torneio)
          const daModalidade = artilharia.filter(
            (a) => a.total > 0 && torneio.participantes.some(
              (p) => p.atleticaSlug === a.atleticaSlug))

          return (
            <>
              <CabecalhoDePagina
                titulo={torneio.nome}
                descricao={`${torneio.modalidade} · ${plural(torneio.participantes.length, 'equipe')}`
                  + ` · ${plural(total, 'partida')}`}
                trilha={[
                  { rotulo: 'Campeonatos', para: `/hub/${slug}/campeonatos` },
                  { rotulo: torneio.nome },
                ]}
                etiqueta={
                  <span className="etiqueta etiqueta--sucesso">
                    {torneio.status.toLowerCase().replace('_', ' ')}
                  </span>
                }
                acoes={
                  <Link to={`/hub/${slug}/eventos/${torneio.eventoId}`}
                        className="botao botao--discreto">
                    <Icone nome="eventos" tamanho={16} /> Abrir o evento
                  </Link>
                }
              />

              <div className="grade grade--metricas" style={{ marginBottom: '1.3rem' }}>
                <Metrica rotulo="Equipes" icone="equipes"
                         valor={torneio.participantes.length}
                         detalhe={`${ativos.length} ainda na disputa`} />
                <Metrica rotulo="Partidas" icone="jogos" valor={total}
                         detalhe={`${feitas} disputadas`} />
                <Metrica rotulo="Ao vivo" icone="resultados" valor={aoVivo.length}
                         cor={aoVivo.length > 0 ? 'var(--sucesso)' : undefined} />
                <Metrica rotulo="Atletas" icone="atletas"
                         valor={torneio.participantes.length * 5}
                         detalhe="estimativa por elenco" />
              </div>

              <Abas
                atual={aba}
                aoTrocar={setAba}
                opcoes={[
                  { valor: 'VISAO', rotulo: 'Visão geral' },
                  { valor: 'CHAVE', rotulo: 'Chaveamento' },
                  { valor: 'EQUIPES', rotulo: 'Equipes', contagem: torneio.participantes.length },
                  { valor: 'JOGOS', rotulo: 'Jogos', contagem: total },
                  { valor: 'CLASSIFICACAO', rotulo: 'Classificação' },
                  { valor: 'ARTILHARIA', rotulo: 'Artilharia' },
                ]}
              />

              {aba === 'VISAO' ? (
                <div className="detalhe">
                  <div>
                    <Secao titulo="Andamento">
                      <div className="cartao">
                        <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                          <span className="fraco">{feitas} de {total} partidas</span>
                          <strong>{Math.round((feitas / Math.max(1, total)) * 100)}%</strong>
                        </div>
                        <Progresso proporcao={feitas / Math.max(1, total)} />
                      </div>
                    </Secao>

                    {aoVivo.length > 0 ? (
                      <Secao titulo="Acontecendo agora">
                        <div className="pilha pilha--densa">
                          {aoVivo.map((p) => (
                            <div key={p.id} className="cartao cartao--destacado linha entre">
                              <div>
                                <strong>
                                  {nomeDoParticipante(torneio, p.participanteAId)} ×{' '}
                                  {nomeDoParticipante(torneio, p.participanteBId)}
                                </strong>
                                <div className="fraco">{p.rotulo}</div>
                              </div>
                              <span className="etiqueta etiqueta--sucesso">
                                {p.placarA ?? 0} × {p.placarB ?? 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Secao>
                    ) : null}

                    <Secao titulo="Próximas partidas">
                      {proximas.length === 0 ? (
                        <EstadoVazio titulo="Nenhuma partida agendada" />
                      ) : (
                        <div className="pilha pilha--densa">
                          {proximas.slice(0, 5).map((p) => (
                            <div key={p.id} className="cartao cartao--compacto linha entre">
                              <div style={{ minWidth: 0 }}>
                                <strong>
                                  {nomeDoParticipante(torneio, p.participanteAId)} ×{' '}
                                  {nomeDoParticipante(torneio, p.participanteBId)}
                                </strong>
                                <div className="fraco">
                                  {p.rotulo}
                                  {p.localNome ? ` · ${p.localNome}` : ''}
                                </div>
                              </div>
                              <span className="fraco">{dataEHora(p.inicioEm)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Secao>
                  </div>

                  <div>
                    <Secao titulo="Formato">
                      <div className="cartao">
                        <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                          <span className="fraco">Sistema</span>
                          <span>{FORMATO[torneio.formato]}</span>
                        </div>
                        <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                          <span className="fraco">Vagas</span>
                          <span>{torneio.vagas}</span>
                        </div>
                        <div className="linha entre">
                          <span className="fraco">Modalidade</span>
                          <span>{torneio.modalidade}</span>
                        </div>
                        {torneio.regulamentoUrl ? (
                          <>
                            <hr className="divisor" />
                            <a href={torneio.regulamentoUrl} className="linha">
                              <Icone nome="documentos" tamanho={16} /> Regulamento
                            </a>
                          </>
                        ) : null}
                      </div>
                    </Secao>

                    <ClassificacaoDoTorneio participantes={torneio.participantes} />
                  </div>
                </div>
              ) : null}

              {aba === 'CHAVE' ? (
                <>
                  <Previa oQueFalta="Registrar placar ainda não chega ao servidor." />
                  <QuadroDeChaveamento
                    torneio={torneio}
                    podeEditar={diretor}
                    aoAtualizar={(t) => busca.definir({ torneio: t, artilharia })}
                  />
                </>
              ) : null}

              {aba === 'EQUIPES' ? (
                <Secao descricao="O nome fica congelado no momento da inscrição: a tabela de 2026 não muda se a equipe se renomear em 2027.">
                  <div className="grade">
                    {torneio.participantes.map((p) => {
                      const atletica = p.atleticaSlug
                        ? atleticaPorSlug(p.atleticaSlug) : undefined
                      return (
                        <div key={p.id} className="cartao linha">
                          {atletica ? <Brasao atletica={atletica} /> : null}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong>{p.nomeExibicao}</strong>
                            <div className="fraco">
                              {atletica?.nome ?? 'sem atlética'}
                              {p.seed ? ` · cabeça ${p.seed}` : ''}
                            </div>
                          </div>
                          <span className={`etiqueta ${
                            p.situacao === 'ATIVO' ? 'etiqueta--sucesso' : ''}`}>
                            {p.situacao.toLowerCase()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Secao>
              ) : null}

              {aba === 'JOGOS' ? (
                <Secao>
                  <div className="rolagem">
                    <table className="tabela-cartoes">
                      <thead>
                        <tr>
                          <th>Fase</th>
                          <th>Confronto</th>
                          <th className="numero">Placar</th>
                          <th>Quando</th>
                          <th>Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {torneio.partidas.map((p) => (
                          <tr key={p.id}>
                            <td data-rotulo="Fase">{p.rotulo}</td>
                            <td data-rotulo="Confronto">
                              {nomeDoParticipante(torneio, p.participanteAId)} ×{' '}
                              {nomeDoParticipante(torneio, p.participanteBId)}
                            </td>
                            <td data-rotulo="Placar" className="numero">
                              {p.placarA === null ? '—' : `${p.placarA} × ${p.placarB}`}
                            </td>
                            <td data-rotulo="Quando">{dataEHora(p.inicioEm)}</td>
                            <td data-rotulo="Situação">
                              <span className={`etiqueta ${
                                p.status === 'EM_ANDAMENTO' ? 'etiqueta--sucesso'
                                  : p.status === 'ENCERRADA' ? '' : 'etiqueta--alerta'}`}>
                                {p.status.toLowerCase().replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Secao>
              ) : null}

              {aba === 'CLASSIFICACAO' ? (
                <Secao descricao="Vitórias, saldo e pontos, calculados a partir das partidas encerradas.">
                  <div className="rolagem">
                    <table className="tabela-cartoes">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Equipe</th>
                          <th className="numero">J</th>
                          <th className="numero">V</th>
                          <th className="numero">D</th>
                          <th className="numero">PP</th>
                          <th className="numero">PC</th>
                          <th className="numero">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabela.map((linha, i) => (
                          <tr key={linha.participanteId}>
                            <td data-rotulo="Posição">{i + 1}</td>
                            <td data-rotulo="Equipe">{linha.nome}</td>
                            <td data-rotulo="Jogos" className="numero">{linha.jogos}</td>
                            <td data-rotulo="Vitórias" className="numero">{linha.vitorias}</td>
                            <td data-rotulo="Derrotas" className="numero">{linha.derrotas}</td>
                            <td data-rotulo="Pontos pró" className="numero">{linha.pontosPro}</td>
                            <td data-rotulo="Pontos contra" className="numero">
                              {linha.pontosContra}
                            </td>
                            <td data-rotulo="Pontos" className="numero">
                              <strong>{linha.pontos}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Secao>
              ) : null}

              {aba === 'ARTILHARIA' ? (
                <Secao descricao="Quem mais pontuou entre as atléticas participantes.">
                  {daModalidade.length === 0 ? (
                    <EstadoVazio icone="atletas" titulo="Sem estatística individual ainda">
                      <p className="fraco">
                        A artilharia aparece quando as súmulas das partidas
                        registrarem quem pontuou.
                      </p>
                    </EstadoVazio>
                  ) : (
                    <div className="pilha pilha--densa">
                      {daModalidade.slice(0, 10).map((a, i) => (
                        <div key={a.atletaNome} className="cartao cartao--compacto linha">
                          <span className="passo__marca">{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong>{a.atletaNome}</strong>
                            <div className="fraco">{a.equipeNome}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="numero-medio">{a.total}</div>
                            <div className="fraco">{a.jogos} jogos</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Secao>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function nomeDoParticipante(torneio: Torneio, id: string | null): string {
  if (!id) return 'a definir'
  return torneio.participantes.find((p) => p.id === id)?.nomeExibicao ?? 'a definir'
}

/**
 * A tabela sai das partidas encerradas, e não de um campo guardado.
 *
 * <p>Classificação digitada à mão desanda no primeiro placar corrigido. Aqui,
 * corrigir um resultado reordena a tabela sem que ninguém precise lembrar de
 * atualizá-la.</p>
 */
function montarTabela(torneio: Torneio): LinhaDaTabela[] {
  const linhas = new Map<string, LinhaDaTabela>()

  torneio.participantes.forEach((p) => {
    linhas.set(p.id, {
      participanteId: p.id,
      nome: p.nomeExibicao,
      atleticaSlug: p.atleticaSlug,
      jogos: 0, vitorias: 0, empates: 0, derrotas: 0,
      pontosPro: 0, pontosContra: 0, pontos: 0,
    })
  })

  torneio.partidas
    .filter((p) => p.status === 'ENCERRADA'
      && p.placarA !== null && p.placarB !== null
      && p.participanteAId && p.participanteBId)
    .forEach((p) => {
      const a = linhas.get(p.participanteAId as string)
      const b = linhas.get(p.participanteBId as string)
      if (!a || !b) return

      const placarA = p.placarA as number
      const placarB = p.placarB as number

      a.jogos += 1; b.jogos += 1
      a.pontosPro += placarA; a.pontosContra += placarB
      b.pontosPro += placarB; b.pontosContra += placarA

      if (placarA > placarB) { a.vitorias += 1; b.derrotas += 1; a.pontos += 3 }
      else if (placarB > placarA) { b.vitorias += 1; a.derrotas += 1; b.pontos += 3 }
      else { a.empates += 1; b.empates += 1; a.pontos += 1; b.pontos += 1 }
    })

  return [...linhas.values()].sort((x, y) =>
    y.pontos - x.pontos
    || (y.pontosPro - y.pontosContra) - (x.pontosPro - x.pontosContra)
    || y.pontosPro - x.pontosPro)
}
