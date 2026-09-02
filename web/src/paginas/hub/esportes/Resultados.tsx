import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { LinhaDoQuadroDeMedalhas } from '../../../api/tipos-rede'
import type { LinhaDeArtilharia, Jogo } from '../../../api/tipos-esportes'
import type { LinhaDeRanking, TipoDeRanking } from '../../../api/tipos-plataforma'
import { Abas, Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao, Variacao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { percentual } from '../../../formatos'

type Aba = 'TEMPORADA' | 'QUADRO' | 'ARTILHARIA' | 'RANKINGS'

interface Composicao {
  quadro: LinhaDoQuadroDeMedalhas[]
  artilharia: LinhaDeArtilharia[]
  jogos: Jogo[]
  ranking: LinhaDeRanking[]
}

const RANKING: { valor: TipoDeRanking; rotulo: string; explica: string }[] = [
  { valor: 'ESPORTIVO', rotulo: 'Esportivo', explica: 'pontos por medalha na temporada' },
  { valor: 'PARTICIPACAO', rotulo: 'Participação', explica: 'presença nos próprios eventos' },
  { valor: 'COLABORACAO', rotulo: 'Colaboração', explica: 'guias, respostas e experiências publicadas' },
  { valor: 'SOCIAL', rotulo: 'Projetos sociais', explica: 'projetos concluídos com impacto externo' },
  { valor: 'ORGANIZACAO', rotulo: 'Organização', explica: 'registros em dia: contas, atas e inventário' },
]

/**
 * Os resultados da temporada (§92).
 *
 * <p>Rankings são opcionais e explicados: cada aba diz o que o número mede.
 * Ranking sem critério visível não informa — vira disputa, e o §92 é
 * explícito em que ranking administrativo não pode ser obrigatório nem
 * virar régua de valor entre atléticas.</p>
 */
export function Resultados() {
  const { slug = '' } = useParams()
  const [aba, setAba] = useState<Aba>('TEMPORADA')
  const [tipo, setTipo] = useState<TipoDeRanking>('ESPORTIVO')

  const busca = useBusca<Composicao>(async () => {
    const [quadro, artilharia, jogos, ranking] = await Promise.all([
      Dados.quadroDeMedalhas(),
      Dados.artilharia(),
      Dados.jogos(slug),
      Dados.ranking(tipo),
    ])
    return { quadro, artilharia, jogos, ranking }
  }, [slug, tipo])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Resultados"
        descricao="Como a temporada está indo — para a atlética e para a rede."
      />

      <Abas
        atual={aba}
        aoTrocar={setAba}
        opcoes={[
          { valor: 'TEMPORADA', rotulo: 'Nossa temporada' },
          { valor: 'QUADRO', rotulo: 'Quadro de medalhas' },
          { valor: 'ARTILHARIA', rotulo: 'Artilharia' },
          { valor: 'RANKINGS', rotulo: 'Rankings' },
        ]}
      />

      <Conteudo busca={busca} esqueleto={<Esqueleto altura="20rem" />}>
        {(d) => {
          const disputados = d.jogos.filter((j) => j.resultado !== 'PENDENTE')
          const vitorias = disputados.filter((j) => j.resultado === 'VITORIA').length
          const empates = disputados.filter((j) => j.resultado === 'EMPATE').length
          const derrotas = disputados.filter((j) => j.resultado === 'DERROTA').length
          const minhaLinha = d.quadro.find((l) => l.atletica.slug === slug)

          return (
            <>
              {aba === 'TEMPORADA' ? (
                <>
                  <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                    <Metrica rotulo="Vitórias" icone="certo" valor={vitorias}
                             cor="var(--sucesso)" />
                    <Metrica rotulo="Empates" icone="jogos" valor={empates} />
                    <Metrica rotulo="Derrotas" icone="alerta" valor={derrotas} />
                    <Metrica
                      rotulo="Aproveitamento" icone="resultados"
                      valor={disputados.length === 0
                        ? '—' : percentual(vitorias / disputados.length)}
                    />
                  </div>

                  {minhaLinha ? (
                    <Secao titulo="No quadro da rede">
                      <div className="cartao cartao--destacado linha entre">
                        <div className="linha">
                          <span className="numero-grande">{minhaLinha.posicao}º</span>
                          <div>
                            <strong>{minhaLinha.atletica.nome}</strong>
                            <div className="fraco">
                              {minhaLinha.ouro} ouros · {minhaLinha.prata} pratas ·{' '}
                              {minhaLinha.bronze} bronzes
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="numero-medio">{minhaLinha.pontos}</div>
                          <div className="fraco">pontos</div>
                        </div>
                      </div>
                    </Secao>
                  ) : null}

                  <Secao titulo="Por modalidade">
                    <div className="grade">
                      {[...new Set(d.jogos.map((j) => j.modalidade))].map((modalidade) => {
                        const daModalidade = d.jogos.filter(
                          (j) => j.modalidade === modalidade && j.resultado !== 'PENDENTE')
                        const v = daModalidade.filter(
                          (j) => j.resultado === 'VITORIA').length
                        return (
                          <div key={modalidade} className="cartao">
                            <strong>{modalidade}</strong>
                            <div className="fraco" style={{ marginBottom: '0.5rem' }}>
                              {daModalidade.length} jogos disputados
                            </div>
                            <div className="numero-medio">
                              {daModalidade.length === 0
                                ? '—' : percentual(v / daModalidade.length)}
                            </div>
                            <div className="fraco">de aproveitamento</div>
                          </div>
                        )
                      })}
                    </div>
                  </Secao>
                </>
              ) : null}

              {aba === 'QUADRO' ? (
                <Secao
                  titulo="Quadro de medalhas da temporada"
                  descricao="O número que a rede inteira acompanha. É o motivo de a inscrição guardar a atlética de origem de cada participante."
                  acao={
                    <Link to="/rede/quadro" className="botao botao--fantasma botao--pequeno">
                      Ver a página pública
                    </Link>
                  }
                >
                  <div className="rolagem">
                    <table className="tabela-cartoes">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Atlética</th>
                          <th className="numero">Ouro</th>
                          <th className="numero">Prata</th>
                          <th className="numero">Bronze</th>
                          <th className="numero">Pontos</th>
                          <th>Variação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.quadro.map((linha) => (
                          <tr key={linha.atletica.slug}
                              style={linha.atletica.slug === slug
                                ? { background: 'var(--acento-tenue)' } : undefined}>
                            <td data-rotulo="Posição">{linha.posicao}</td>
                            <td data-rotulo="Atlética">
                              <div className="linha" style={{ gap: '0.45rem' }}>
                                <Brasao atletica={linha.atletica} tamanho="p" />
                                <span>{linha.atletica.nome}</span>
                              </div>
                            </td>
                            <td data-rotulo="Ouro" className="numero"
                                style={{ color: 'var(--ouro)' }}>{linha.ouro}</td>
                            <td data-rotulo="Prata" className="numero"
                                style={{ color: 'var(--prata)' }}>{linha.prata}</td>
                            <td data-rotulo="Bronze" className="numero"
                                style={{ color: 'var(--bronze)' }}>{linha.bronze}</td>
                            <td data-rotulo="Pontos" className="numero">
                              <strong>{linha.pontos}</strong>
                            </td>
                            <td data-rotulo="Variação">
                              {linha.variacao === 0 ? (
                                <span className="fraco">—</span>
                              ) : (
                                <span className={`fraco ${
                                  linha.variacao > 0 ? 'dinheiro--positivo'
                                    : 'dinheiro--negativo'}`}>
                                  {linha.variacao > 0 ? '▲' : '▼'} {Math.abs(linha.variacao)}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Secao>
              ) : null}

              {aba === 'ARTILHARIA' ? (
                <Secao descricao="Quem mais pontuou na rede, em todas as modalidades.">
                  {d.artilharia.length === 0 ? (
                    <EstadoVazio icone="atletas" titulo="Sem estatística ainda" />
                  ) : (
                    <div className="pilha pilha--densa">
                      {d.artilharia.map((a, i) => (
                        <div key={a.atletaNome}
                             className={`cartao cartao--compacto linha${
                               a.atleticaSlug === slug ? ' cartao--destacado' : ''}`}>
                          <span className="passo__marca">{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong>{a.atletaNome}</strong>
                            <div className="fraco">{a.equipeNome}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="numero-medio">{a.total}</div>
                            <div className="fraco">
                              {a.jogos} jogos · {(a.total / a.jogos).toFixed(1)} por jogo
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Secao>
              ) : null}

              {aba === 'RANKINGS' ? (
                <>
                  <div className="chips" style={{ marginBottom: '1rem' }}>
                    {RANKING.map((r) => (
                      <button
                        key={r.valor}
                        className="chip"
                        aria-pressed={tipo === r.valor}
                        onClick={() => setTipo(r.valor)}
                      >
                        {r.rotulo}
                      </button>
                    ))}
                  </div>

                  <div className="aviso" style={{ marginBottom: '1.1rem' }}>
                    <div className="linha" style={{ gap: '0.5rem' }}>
                      <Icone nome="info" tamanho={16} />
                      <span className="fraco">
                        Mede {RANKING.find((r) => r.valor === tipo)?.explica}. Rankings
                        são opcionais: participar da rede não exige aparecer neles.
                      </span>
                    </div>
                  </div>

                  <Secao>
                    <div className="pilha pilha--densa">
                      {d.ranking.map((linha) => (
                        <div key={linha.atletica.slug}
                             className={`cartao cartao--compacto linha${
                               linha.atletica.slug === slug ? ' cartao--destacado' : ''}`}>
                          <span className="passo__marca">{linha.posicao}</span>
                          <Brasao atletica={linha.atletica} tamanho="p" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong>{linha.atletica.nome}</strong>
                            <div className="fraco">{linha.atletica.instituicao}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="numero-medio">{linha.valor}</div>
                            <div className="fraco">{linha.rotuloDoValor}</div>
                          </div>
                          {linha.variacao !== 0 ? (
                            <Variacao percentual={linha.variacao} />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </Secao>
                </>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
