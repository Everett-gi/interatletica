import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { ResumoFinanceiro } from '../../../api/tipos-financeiro'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Progresso, Secao } from '../../../ui/pagina'
import { dinheiro, percentual } from '../../../formatos'
import { CATEGORIA } from './Financeiro'

/**
 * Previsto contra realizado.
 *
 * <p>A pergunta que o orçamento responde não é "quanto gastamos" — isso o
 * extrato já diz. É "estamos dentro do que planejamos", e ela só faz sentido
 * comparando duas colunas. A linha que estourou aparece em vermelho antes de
 * a assembleia perguntar.</p>
 */
export function Orcamento() {
  const { slug = '' } = useParams()
  const resumo = useBusca<ResumoFinanceiro>(() => Dados.resumoFinanceiro(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Orçamento"
        descricao="O que foi aprovado no início do ano, contra o que já aconteceu."
        trilha={[
          { rotulo: 'Financeiro', para: `/hub/${slug}/financeiro` },
          { rotulo: 'Orçamento' },
        ]}
      />

      <Conteudo busca={resumo} esqueleto={<Esqueleto altura="20rem" />}>
        {(r) => {
          const previsto = r.orcamento.reduce((s, l) => s + l.previsto, 0)
          const realizado = r.orcamento.reduce((s, l) => s + l.realizado, 0)
          const estourados = r.orcamento.filter((l) => l.realizado > l.previsto)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Orçado no ano" icone="orcamento"
                         valor={dinheiro(previsto)} />
                <Metrica rotulo="Movimentado" icone="financeiro"
                         valor={dinheiro(realizado)}
                         detalhe={`${percentual(realizado / previsto)} do previsto`} />
                <Metrica rotulo="Categorias" icone="grade" valor={r.orcamento.length} />
                <Metrica
                  rotulo="Estouraram" icone="alerta" valor={estourados.length}
                  cor={estourados.length > 0 ? 'var(--perigo)' : undefined}
                  detalhe={estourados.length > 0
                    ? 'acima do aprovado' : 'tudo dentro do previsto'}
                />
              </div>

              {estourados.length > 0 ? (
                <div className="aviso aviso--erro" style={{ marginBottom: '1.3rem' }}>
                  <strong>
                    {estourados.length}{' '}
                    {estourados.length === 1 ? 'categoria estourou' : 'categorias estouraram'}
                    {' '}o orçamento
                  </strong>
                  <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                    {estourados.map((l) => CATEGORIA[l.categoria]).join(', ')}. Levar à
                    próxima reunião: ou remaneja de outra rubrica, ou registra a
                    diferença em ata.
                  </p>
                </div>
              ) : null}

              <Secao titulo="Por categoria">
                <div className="cartao">
                  <div className="pilha">
                    {r.orcamento.map((linha) => {
                      const proporcao = linha.realizado / linha.previsto
                      const estourou = linha.realizado > linha.previsto
                      return (
                        <div key={linha.categoria}>
                          <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
                            <strong style={{ fontSize: '0.92rem' }}>
                              {CATEGORIA[linha.categoria]}
                            </strong>
                            <span className="fraco dinheiro">
                              {dinheiro(linha.realizado)} de {dinheiro(linha.previsto)}
                            </span>
                          </div>
                          <Progresso
                            proporcao={proporcao}
                            tom={estourou ? 'perigo' : proporcao > 0.85 ? 'alerta' : undefined}
                          />
                          <div className="linha entre" style={{ marginTop: '0.25rem' }}>
                            <span className="fraco">{percentual(proporcao)}</span>
                            <span className={`fraco ${estourou ? 'dinheiro--negativo' : ''}`}>
                              {estourou
                                ? `${dinheiro(linha.realizado - linha.previsto)} acima`
                                : `${dinheiro(linha.previsto - linha.realizado)} disponíveis`}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Secao>

              <Secao>
                <div className="rolagem">
                  <table className="tabela-cartoes">
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th className="numero">Previsto</th>
                        <th className="numero">Realizado</th>
                        <th className="numero">Saldo</th>
                        <th className="numero">Uso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.orcamento.map((linha) => (
                        <tr key={linha.categoria}>
                          <td data-rotulo="Categoria">{CATEGORIA[linha.categoria]}</td>
                          <td data-rotulo="Previsto" className="numero">
                            {dinheiro(linha.previsto)}
                          </td>
                          <td data-rotulo="Realizado" className="numero">
                            {dinheiro(linha.realizado)}
                          </td>
                          <td data-rotulo="Saldo" className="numero">
                            <span className={`dinheiro dinheiro--${
                              linha.previsto - linha.realizado >= 0
                                ? 'positivo' : 'negativo'}`}>
                              {dinheiro(linha.previsto - linha.realizado)}
                            </span>
                          </td>
                          <td data-rotulo="Uso" className="numero">
                            {percentual(linha.realizado / linha.previsto)}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td data-rotulo="Categoria"><strong>Total</strong></td>
                        <td data-rotulo="Previsto" className="numero">
                          <strong>{dinheiro(previsto)}</strong>
                        </td>
                        <td data-rotulo="Realizado" className="numero">
                          <strong>{dinheiro(realizado)}</strong>
                        </td>
                        <td data-rotulo="Saldo" className="numero">
                          <strong>{dinheiro(previsto - realizado)}</strong>
                        </td>
                        <td data-rotulo="Uso" className="numero">
                          <strong>{percentual(realizado / previsto)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
