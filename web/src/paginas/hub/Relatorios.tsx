import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { PainelDaAtletica } from '../../api/tipos-rede'
import type { Conquista, Indicador } from '../../api/tipos-plataforma'
import {
  Abas,
  Anel,
  Barras,
  Conteudo,
  Esqueleto,
  Metrica,
  rotuloDoTipo,
  useBusca,
} from '../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  Progresso,
  Secao,
  Variacao,
} from '../../ui/pagina'
import { Icone } from '../../ui/icones'
import { dinheiro, numero, percentual } from '../../formatos'

type Aba = 'PRESENCA' | 'INDICADORES' | 'CONQUISTAS'

interface Composicao {
  painel: PainelDaAtletica
  indicadores: Indicador[]
  conquistas: Conquista[]
}

/**
 * Os números da atlética (§89, §90 e §91).
 *
 * <p>Três perguntas, três abas. <em>Quem apareceu</em> — a taxa de presença e
 * de onde vieram os inscritos, que a planilha nunca respondeu e que só tem
 * resposta porque `inscricao.atletica_id` guarda a atlética de ORIGEM.
 * <em>Como estamos</em> — os indicadores da gestão, cada um comparado com a
 * média de atléticas de porte parecido. E <em>o que já alcançamos</em>, que é
 * a gamificação com moderação que o §91 pede: marco de organização, não
 * pontuação de jogo.</p>
 */
export function Relatorios() {
  const { slug = '' } = useParams()
  const [aba, setAba] = useState<Aba>('PRESENCA')

  const busca = useBusca<Composicao>(async () => {
    const [painel, indicadores, conquistas] = await Promise.all([
      Dados.painel(slug),
      Dados.indicadores(slug),
      Dados.conquistas(slug),
    ])
    return { painel, indicadores, conquistas }
  }, [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Indicadores"
        descricao="O que a planilha não respondia: quem apareceu, de onde veio, e como a atlética está em relação à rede."
      />

      <Abas
        atual={aba}
        aoTrocar={setAba}
        opcoes={[
          { valor: 'PRESENCA', rotulo: 'Presença e origem' },
          { valor: 'INDICADORES', rotulo: 'Comparação com a rede' },
          { valor: 'CONQUISTAS', rotulo: 'Conquistas' },
        ]}
      />

      <Conteudo busca={busca} esqueleto={<Esqueleto altura="20rem" />}>
        {(d) => {
          const inscritos = d.painel.inscricoesPorEvento
            .reduce((soma, p) => soma + p.valor, 0)
          const presentes = d.painel.presencaPorEvento
            .reduce((soma, p) => soma + p.valor, 0)

          return (
            <>
              {aba === 'PRESENCA' ? (
                <>
                  <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                    <Metrica rotulo="Inscritos no período" icone="inscricoes"
                             valor={numero(inscritos)} />
                    <Metrica rotulo="Compareceram" icone="certo"
                             valor={numero(presentes)} />
                    <Metrica
                      rotulo="Não compareceram" icone="alerta"
                      valor={numero(inscritos - presentes)}
                      cor="var(--alerta)"
                      detalhe="vaga ocupada e não usada"
                    />
                    <Metrica rotulo="Eventos publicados" icone="eventos"
                             valor={d.painel.eventosPublicados} />
                  </div>

                  <section className="cartao" style={{ marginBottom: '1.6rem' }}>
                    <Anel
                      proporcao={inscritos === 0 ? 0 : presentes / inscritos}
                      rotulo="Taxa de presença"
                    />
                    <p className="fraco" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
                      Quem confirma e não vai ocupa uma vaga que ficaria com alguém
                      da lista de espera. É o número que justifica abrir mais vagas
                      do que a capacidade — ou não abrir.
                    </p>
                  </section>

                  <div className="grade grade--larga">
                    <section className="cartao">
                      <h3>Inscritos por evento</h3>
                      <Barras dados={d.painel.inscricoesPorEvento} />
                    </section>

                    <section className="cartao">
                      <h3>Presença por evento</h3>
                      <Barras dados={d.painel.presencaPorEvento} />
                    </section>

                    <section className="cartao">
                      <h3>Origem dos inscritos</h3>
                      <p className="fraco">
                        De quais atléticas vieram as pessoas — o número que só um
                        interatlética responde, e que decide se vale repetir.
                      </p>
                      <Barras
                        dados={d.painel.origemDosInscritos.map((o) => ({
                          rotulo: o.nome, valor: o.total,
                        }))}
                      />
                    </section>

                    <section className="cartao">
                      <h3>Eventos por tipo</h3>
                      <Barras
                        dados={d.painel.distribuicaoPorTipo.map((x) => ({
                          rotulo: rotuloDoTipo(x.tipo), valor: x.total,
                        }))}
                      />
                    </section>
                  </div>
                </>
              ) : null}

              {aba === 'INDICADORES' ? (
                <>
                  <div className="aviso" style={{ marginBottom: '1.3rem' }}>
                    <div className="linha" style={{ gap: '0.55rem' }}>
                      <Icone nome="info" tamanho={17} />
                      <div>
                        <strong>A comparação é agregada e anônima</strong>
                        <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                          A média vem de atléticas de porte parecido, sem identificar
                          nenhuma. Nenhum dado privado de outra organização aparece
                          aqui — nem o seu aparece para elas.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Secao>
                    <div className="grade grade--larga">
                      {d.indicadores.map((ind) => (
                        <CartaoDeIndicador key={ind.rotulo} indicador={ind} />
                      ))}
                    </div>
                  </Secao>
                </>
              ) : null}

              {aba === 'CONQUISTAS' ? (
                <>
                  <div className="aviso" style={{ marginBottom: '1.3rem' }}>
                    <div className="linha" style={{ gap: '0.55rem' }}>
                      <Icone nome="info" tamanho={17} />
                      <div>
                        <strong>Marcos, não pontuação</strong>
                        <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                          Conquistas registram o que a atlética já fez pela primeira
                          vez. Não valem ponto, não entram em ranking e não mudam o
                          que você pode usar na plataforma.
                        </p>
                      </div>
                    </div>
                  </div>

                  {d.conquistas.length === 0 ? (
                    <EstadoVazio titulo="Nenhuma conquista registrada" />
                  ) : (
                    <Secao>
                      <div className="grade">
                        {d.conquistas.map((c) => (
                          <div
                            key={c.id}
                            className={`cartao${c.conquistadaEm ? ' cartao--destacado' : ''}`}
                            style={c.conquistadaEm ? undefined : { opacity: 0.55 }}
                          >
                            <div className="linha linha--topo">
                              <span style={{ fontSize: '1.7rem' }} aria-hidden="true">
                                {c.icone}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <strong>{c.titulo}</strong>
                                <div className="fraco">{c.descricao}</div>
                              </div>
                              {c.conquistadaEm ? (
                                <span style={{ color: 'var(--sucesso)' }}>
                                  <Icone nome="certo" tamanho={18} />
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Secao>
                  )}
                </>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

/**
 * Um indicador com a média da rede como referência (§90).
 *
 * <p>A escala vai até o dobro da média, e não até o máximo da rede. Assim
 * "na média" cai exatamente no meio da barra e a leitura é imediata: à
 * esquerda do traço é abaixo, à direita é acima. Escalar pelo máximo
 * responderia "somos os maiores?", que é outra pergunta — e essa tem página
 * própria, e opcional, em Resultados.</p>
 */
function CartaoDeIndicador({ indicador }: { indicador: Indicador }) {
  const formatar = (valor: number) =>
    indicador.unidade === 'R$' ? dinheiro(valor)
      : indicador.unidade === '%' ? `${valor}%`
      : indicador.unidade ? `${numero(valor)} ${indicador.unidade}`
      : numero(valor)

  const acima = indicador.media !== null && indicador.valor >= indicador.media
  const escala = indicador.media !== null ? indicador.media * 2 : indicador.valor

  return (
    <div className="cartao">
      <div className="linha entre" style={{ marginBottom: '0.35rem' }}>
        <span className="fraco">{indicador.rotulo}</span>
        {indicador.variacao !== null ? (
          <Variacao percentual={indicador.variacao} />
        ) : null}
      </div>

      <div className="numero-grande">{formatar(indicador.valor)}</div>

      {indicador.media !== null ? (
        <>
          <div style={{ position: 'relative', marginTop: '0.7rem' }}>
            <Progresso
              proporcao={escala === 0 ? 0 : indicador.valor / escala}
              tom={acima ? 'sucesso' : 'alerta'}
            />
            <span
              style={{
                position: 'absolute', left: '50%', top: '-3px', bottom: '-3px',
                width: '2px', background: 'var(--borda-forte)',
              }}
              aria-hidden="true"
            />
          </div>

          <div className="linha entre" style={{ marginTop: '0.45rem' }}>
            <span className="fraco">média da rede: {formatar(indicador.media)}</span>
            <span className={`fraco ${acima ? 'dinheiro--positivo' : 'dinheiro--negativo'}`}>
              {acima ? 'acima' : 'abaixo'}
              {indicador.media > 0
                ? ` · ${percentual(
                    Math.abs(indicador.valor - indicador.media) / indicador.media)}`
                : ''}
            </span>
          </div>
        </>
      ) : (
        <div className="fraco" style={{ marginTop: '0.5rem' }}>
          Sem amostra suficiente para comparar com a rede.
        </div>
      )}
    </div>
  )
}
