import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Jogo, ResultadoDoJogo } from '../../../api/tipos-esportes'
import { Brasao, Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, percentual, quando } from '../../../formatos'
import { atleticaPorSlug } from '../../../demo/dados'
import { useSessao } from '../../../sessao/SessaoContexto'

const RESULTADO: Record<ResultadoDoJogo, { rotulo: string; classe: string }> = {
  VITORIA: { rotulo: 'vitória', classe: 'etiqueta--sucesso' },
  EMPATE: { rotulo: 'empate', classe: 'etiqueta--alerta' },
  DERROTA: { rotulo: 'derrota', classe: 'etiqueta--perigo' },
  PENDENTE: { rotulo: 'a jogar', classe: '' },
}

type Filtro = 'TODOS' | 'PROXIMOS' | 'DISPUTADOS'

/**
 * Os jogos da atlética.
 *
 * <p>Inclui o que não está dentro de campeonato: amistoso, treino contra
 * outra atlética, jogo de preparação. Se só o chaveamento contasse, metade
 * da temporada esportiva ficaria sem registro — e é justamente essa metade
 * que some entre uma gestão e outra.</p>
 */
export function Jogos() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')

  const jogos = useBusca<Jogo[]>(() => Dados.jogos(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Jogos"
        descricao="Amistosos, jogos de campeonato e o resultado de cada um."
        acoes={diretor ? (
          <button className="botao" disabled title="Cadastro chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Marcar jogo
          </button>
        ) : undefined}
      />

      <Previa oQueFalta="Marcar jogo e registrar súmula ainda não chegam ao servidor." />

      <Conteudo busca={jogos} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="jogos" titulo="Nenhum jogo registrado">
                <p className="fraco">
                  Marque um amistoso pela seção Amistosos da rede: outra atlética
                  já está procurando adversário na sua modalidade.
                </p>
              </EstadoVazio>
            )
          }

          const disputados = lista.filter((j) => j.resultado !== 'PENDENTE')
          const vitorias = disputados.filter((j) => j.resultado === 'VITORIA').length
          const agora = Date.now()

          const visiveis = lista
            .filter((j) => {
              if (filtro === 'PROXIMOS') return new Date(j.inicioEm).getTime() >= agora
              if (filtro === 'DISPUTADOS') return j.resultado !== 'PENDENTE'
              return true
            })
            .sort((a, b) => b.inicioEm.localeCompare(a.inicioEm))

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Jogos no ano" icone="jogos" valor={lista.length} />
                <Metrica rotulo="Vitórias" icone="certo" valor={vitorias}
                         cor="var(--sucesso)" />
                <Metrica
                  rotulo="Aproveitamento" icone="resultados"
                  valor={disputados.length === 0
                    ? '—' : percentual(vitorias / disputados.length)}
                  detalhe={`${disputados.length} jogos disputados`}
                />
                <Metrica rotulo="Marcados" icone="calendario"
                         valor={lista.filter(
                           (j) => new Date(j.inicioEm).getTime() >= agora).length} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Filtro de jogos"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todos', contagem: lista.length },
                    { valor: 'PROXIMOS', rotulo: 'Próximos',
                      contagem: lista.filter(
                        (j) => new Date(j.inicioEm).getTime() >= agora).length },
                    { valor: 'DISPUTADOS', rotulo: 'Disputados',
                      contagem: disputados.length },
                  ]}
                />
              </div>

              <Secao>
                <div className="pilha pilha--densa">
                  {visiveis.map((j) => {
                    const adversaria = j.adversarioAtleticaSlug
                      ? atleticaPorSlug(j.adversarioAtleticaSlug) : undefined
                    const futuro = new Date(j.inicioEm).getTime() >= agora

                    return (
                      <div key={j.id}
                           className={`cartao${futuro ? ' cartao--destacado' : ''}`}>
                        <div className="linha entre" style={{ marginBottom: '0.55rem' }}>
                          <div className="linha" style={{ gap: '0.35rem' }}>
                            <span className="etiqueta">{j.modalidade}</span>
                            {j.competicao ? (
                              <span className="etiqueta etiqueta--acento">{j.competicao}</span>
                            ) : null}
                          </div>
                          <span className="fraco">{quando(j.inicioEm)}</span>
                        </div>

                        <div className="linha entre" style={{ gap: '1rem' }}>
                          <div className="linha" style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ minWidth: 0 }}>
                              <strong>{j.equipeNome}</strong>
                              <div className="fraco">nossa equipe</div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            {j.resultado === 'PENDENTE' ? (
                              <span className="fraco">×</span>
                            ) : (
                              <div className="numero-medio">
                                {j.placarNos} × {j.placarDeles}
                              </div>
                            )}
                            <span className={`etiqueta ${RESULTADO[j.resultado].classe}`}>
                              {RESULTADO[j.resultado].rotulo}
                            </span>
                          </div>

                          <div className="linha" style={{ flex: 1, minWidth: 0,
                                                          justifyContent: 'flex-end' }}>
                            <div style={{ minWidth: 0, textAlign: 'right' }}>
                              <strong>{j.adversario}</strong>
                              <div className="fraco">
                                {adversaria?.nome ?? 'adversário'}
                              </div>
                            </div>
                            {adversaria ? (
                              <Brasao atletica={adversaria} tamanho="p" />
                            ) : null}
                          </div>
                        </div>

                        <div className="linha entre" style={{ marginTop: '0.7rem' }}>
                          <span className="fraco">
                            {dataEHora(j.inicioEm)}
                            {j.local ? ` · ${j.local}` : ''}
                          </span>
                        </div>

                        {j.destaques.length > 0 ? (
                          <>
                            <hr className="divisor" />
                            <div className="linha" style={{ gap: '0.35rem' }}>
                              {j.destaques.map((d) => (
                                <span key={d} className="etiqueta">{d}</span>
                              ))}
                            </div>
                          </>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
