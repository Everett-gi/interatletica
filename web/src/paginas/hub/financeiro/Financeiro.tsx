import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { CategoriaFinanceira, ResumoFinanceiro } from '../../../api/tipos-financeiro'
import { Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { dinheiro, percentual, quando } from '../../../formatos'

export const CATEGORIA: Record<CategoriaFinanceira, string> = {
  EVENTO: 'Eventos',
  PATROCINIO: 'Patrocínio',
  MENSALIDADE: 'Contribuição de membros',
  UNIFORME: 'Uniformes',
  VIAGEM: 'Viagens',
  ESTRUTURA: 'Estrutura',
  MARKETING: 'Marketing',
  ARBITRAGEM: 'Arbitragem',
  ALIMENTACAO: 'Alimentação',
  DOACAO: 'Doações',
  OUTRO: 'Outros',
}

/**
 * O financeiro (§27).
 *
 * <p>Começa pelo saldo, não pela tabela. O §27 é explícito: nunca iniciar a
 * página com uma lista enorme. Quem abre o financeiro quer saber "quanto
 * temos" antes de "o que foi lançado" — e a diferença entre as duas
 * perguntas é a diferença entre um painel e um extrato.</p>
 *
 * <p>Todos os números aqui são <strong>derivados</strong> dos lançamentos.
 * Registrar uma despesa muda o saldo, o gráfico e a linha de orçamento de
 * uma vez — não há total guardado à parte para desandar.</p>
 */
export function Financeiro() {
  const { slug = '' } = useParams()
  const resumo = useBusca<ResumoFinanceiro>(() => Dados.resumoFinanceiro(slug), [slug])
  const base = `/hub/${slug}/financeiro`

  return (
    <div>
      <CabecalhoDePagina
        titulo="Financeiro"
        descricao="Quanto a atlética tem, de onde veio e para onde foi."
        acoes={
          <>
            <Link to={`${base}/receitas`} className="botao botao--discreto">Receitas</Link>
            <Link to={`${base}/despesas`} className="botao botao--discreto">Despesas</Link>
            <Link to={`${base}/orcamento`} className="botao botao--discreto">Orçamento</Link>
          </>
        }
      />

      <Previa oQueFalta="Lançar receita e despesa ainda não chegam ao servidor." />

      <Conteudo
        busca={resumo}
        esqueleto={
          <div className="grade grade--metricas">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="6.5rem" />)}
          </div>
        }
      >
        {(r) => {
          const maiorCategoria = Math.max(
            1, ...r.porCategoria.map((c) => Math.max(c.receita, c.despesa)))

          return (
            <>
              <div className="cartao" style={{ marginBottom: '1.5rem' }}>
                <div className="fraco">Saldo atual</div>
                <div
                  className="numero-grande dinheiro"
                  style={{ fontSize: '2.6rem',
                           color: r.saldoAtual < 0 ? 'var(--perigo)' : undefined }}
                >
                  {dinheiro(r.saldoAtual, true)}
                </div>
                <div className="linha" style={{ gap: '1.6rem', marginTop: '0.7rem' }}>
                  <div>
                    <div className="fraco">Entradas confirmadas</div>
                    <div className="numero-medio dinheiro dinheiro--positivo">
                      {dinheiro(r.receitasNoPeriodo)}
                    </div>
                  </div>
                  <div>
                    <div className="fraco">Saídas confirmadas</div>
                    <div className="numero-medio dinheiro dinheiro--negativo">
                      {dinheiro(r.despesasNoPeriodo)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grade grade--metricas" style={{ marginBottom: '1.6rem' }}>
                <Metrica rotulo="A receber" icone="receitas" para={`${base}/receitas`}
                         valor={dinheiro(r.aReceber)} detalhe="previsto e não confirmado" />
                <Metrica rotulo="A pagar" icone="despesas" para={`${base}/despesas`}
                         valor={dinheiro(r.aPagar)}
                         cor={r.aPagar > r.saldoAtual ? 'var(--alerta)' : undefined}
                         detalhe={r.aPagar > r.saldoAtual
                           ? 'acima do saldo atual' : undefined} />
                <Metrica rotulo="Projeção" icone="orcamento"
                         valor={dinheiro(r.saldoAtual + r.aReceber - r.aPagar)}
                         detalhe="saldo se tudo se confirmar" />
                <Metrica rotulo="Prestação de contas" icone="prestacao"
                         para={`${base}/prestacao-de-contas`}
                         valor="Ver" detalhe="fechamento mensal" />
              </div>

              <div className="detalhe">
                <div>
                  <Secao
                    titulo="Evolução do caixa"
                    descricao="Saldo acumulado mês a mês. A pergunta é se a linha sobe."
                  >
                    <div className="cartao">
                      <GraficoDeLinha pontos={r.evolucao} />
                    </div>
                  </Secao>

                  <Secao
                    titulo="Por categoria"
                    descricao="Onde o dinheiro entra e onde ele sai."
                  >
                    <div className="cartao">
                      <div className="pilha pilha--densa">
                        {r.porCategoria.map((c) => (
                          <div key={c.categoria}>
                            <div className="linha entre" style={{ marginBottom: '0.25rem' }}>
                              <span style={{ fontSize: '0.88rem' }}>
                                {CATEGORIA[c.categoria]}
                              </span>
                              <span className="fraco dinheiro">
                                {c.receita > 0 ? (
                                  <span className="dinheiro--positivo">
                                    +{dinheiro(c.receita)}
                                  </span>
                                ) : null}
                                {c.receita > 0 && c.despesa > 0 ? ' · ' : ''}
                                {c.despesa > 0 ? (
                                  <span className="dinheiro--negativo">
                                    −{dinheiro(c.despesa)}
                                  </span>
                                ) : null}
                              </span>
                            </div>
                            <div className="linha" style={{ gap: '0.25rem' }}>
                              <div style={{ flex: 1 }}>
                                <Progresso proporcao={c.receita / maiorCategoria}
                                           tom="sucesso" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Progresso proporcao={c.despesa / maiorCategoria}
                                           tom="perigo" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Secao>
                </div>

                <div>
                  <Secao
                    titulo="Últimos lançamentos"
                    acao={
                      <Link to={`${base}/despesas`}
                            className="botao botao--fantasma botao--pequeno">
                        Ver tudo
                      </Link>
                    }
                  >
                    {r.ultimosLancamentos.length === 0 ? (
                      <EstadoVazio icone="financeiro" titulo="Nenhum lançamento">
                        <p className="fraco">
                          Registre a primeira entrada ou saída. Fechar todo mês,
                          mesmo o mês vazio, é o que evita o buraco.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha pilha--densa">
                        {r.ultimosLancamentos.map((l) => (
                          <div key={l.id} className="cartao cartao--compacto linha entre">
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 550, fontSize: '0.9rem' }}>
                                {l.descricao}
                              </div>
                              <div className="fraco">
                                {CATEGORIA[l.categoria]}
                                {l.situacao !== 'CONFIRMADO'
                                  ? ` · ${l.situacao.toLowerCase()}` : ''}
                              </div>
                            </div>
                            <span className={`dinheiro dinheiro--${
                              l.natureza === 'RECEITA' ? 'positivo' : 'negativo'}`}
                                  style={{ fontWeight: 650, flexShrink: 0 }}>
                              {l.natureza === 'RECEITA' ? '+' : '−'}{dinheiro(l.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Secao>

                  <Secao titulo="Orçamento do ano"
                         acao={
                           <Link to={`${base}/orcamento`}
                                 className="botao botao--fantasma botao--pequeno">
                             Detalhar
                           </Link>
                         }>
                    <div className="cartao">
                      {r.orcamento.slice(0, 5).map((linha) => (
                        <div key={linha.categoria} style={{ marginBottom: '0.7rem' }}>
                          <div className="linha entre" style={{ marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.86rem' }}>
                              {CATEGORIA[linha.categoria]}
                            </span>
                            <span className="fraco">
                              {percentual(linha.realizado / linha.previsto)}
                            </span>
                          </div>
                          <Progresso
                            proporcao={linha.realizado / linha.previsto}
                            tom={linha.realizado > linha.previsto ? 'perigo'
                              : linha.realizado / linha.previsto > 0.85 ? 'alerta' : undefined}
                          />
                        </div>
                      ))}
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

/**
 * Gráfico de linha em SVG puro.
 *
 * <p>Seis pontos não justificam uma biblioteca: seriam dezenas de kB de rede
 * para desenhar o que cabe em vinte linhas — e o custo cairia na primeira
 * visita, que é a que decide se a pessoa espera carregar.</p>
 */
function GraficoDeLinha({ pontos }: { pontos: { rotulo: string; valor: number }[] }) {
  if (pontos.length < 2) {
    return <p className="fraco" style={{ margin: 0 }}>Ainda não há meses suficientes.</p>
  }

  const valores = pontos.map((p) => p.valor)
  const minimo = Math.min(0, ...valores)
  const maximo = Math.max(...valores, 1)
  const amplitude = maximo - minimo || 1

  const largura = 100
  const altura = 40
  const passo = largura / (pontos.length - 1)
  const y = (valor: number) => altura - ((valor - minimo) / amplitude) * (altura - 5) - 2.5

  const linha = pontos
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${i * passo} ${y(p.valor)}`)
    .join(' ')
  const area = `${linha} L${largura} ${altura} L0 ${altura} Z`
  const zero = y(0)

  return (
    <div>
      <svg viewBox={`0 0 ${largura} ${altura}`} preserveAspectRatio="none"
           style={{ width: '100%', height: '9rem', display: 'block' }}
           role="img"
           aria-label={pontos.map((p) => `${p.rotulo}: ${dinheiro(p.valor)}`).join('; ')}>
        {minimo < 0 ? (
          <line x1="0" y1={zero} x2={largura} y2={zero}
                stroke="var(--borda-forte)" strokeWidth={0.5}
                vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />
        ) : null}
        <path d={area} fill="var(--acento-tenue)" />
        <path d={linha} fill="none" stroke="var(--acento)" strokeWidth={2}
              vectorEffect="non-scaling-stroke" strokeLinejoin="round"
              strokeLinecap="round" />
        {pontos.map((p, i) => (
          <circle key={p.rotulo} cx={i * passo} cy={y(p.valor)} r={1.2}
                  fill="var(--fundo-cartao)" stroke="var(--acento)" strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      <div className="linha entre" style={{ marginTop: '0.4rem' }}>
        {pontos.map((p) => (
          <span key={p.rotulo} className="fraco" style={{ fontSize: '0.74rem' }}>
            {p.rotulo}
          </span>
        ))}
      </div>
      <div className="fraco" style={{ marginTop: '0.4rem' }}>
        De {dinheiro(pontos[0].valor)} a {dinheiro(pontos[pontos.length - 1].valor)}
        {' '}· atualizado {quando(new Date().toISOString())}
      </div>
    </div>
  )
}
