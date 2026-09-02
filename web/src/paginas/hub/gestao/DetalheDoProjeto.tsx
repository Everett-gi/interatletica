import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Projeto } from '../../../api/tipos-gestao'
import type { Tarefa } from '../../../api/tipos-rede'
import type { Lancamento } from '../../../api/tipos-financeiro'
import { Abas, Avatar, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  ItemDaLinha,
  LinhaDoTempo,
  Progresso,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataCurta, dinheiro, percentual, quando } from '../../../formatos'
import { STATUS_DO_PROJETO, TIPO_DE_PROJETO } from './Projetos'

type Aba = 'VISAO' | 'CRONOGRAMA' | 'TAREFAS' | 'ORCAMENTO' | 'RESULTADOS'

interface Composicao {
  projeto: Projeto | null
  tarefas: Tarefa[]
  lancamentos: Lancamento[]
}

/**
 * A página de um projeto (§19 e §65).
 *
 * <p>Abas, e não uma página vertical interminável. Orçamento, cronograma e
 * tarefas são conteúdos relacionados que quase nunca se consultam juntos —
 * empilhá-los faria a pessoa rolar oito telas para chegar no que veio ver.</p>
 *
 * <p>As abas de projeto social — parceiros e impacto — só aparecem quando o
 * projeto é social. Aba vazia é pior que aba ausente: promete conteúdo.</p>
 */
export function DetalheDoProjeto() {
  const { slug = '', id = '' } = useParams()
  const [aba, setAba] = useState<Aba>('VISAO')

  const busca = useBusca<Composicao>(async () => {
    const [projeto, tarefas, lancamentos] = await Promise.all([
      Dados.projeto(id),
      Dados.tarefas(slug),
      Dados.lancamentos(slug),
    ])
    return { projeto, tarefas, lancamentos }
  }, [slug, id])

  return (
    <div>
      <Conteudo busca={busca} esqueleto={<Esqueleto altura="22rem" />}>
        {({ projeto, tarefas, lancamentos }) => {
          if (!projeto) {
            return (
              <EstadoVazio icone="projetos" titulo="Projeto não encontrado">
                <p className="fraco">Ele pode ter sido removido ou o link mudou.</p>
                <Link to={`/hub/${slug}/projetos`} className="botao botao--discreto">
                  Voltar aos projetos
                </Link>
              </EstadoVazio>
            )
          }

          // Ligação por evento: a tarefa do interatlética é a tarefa do
          // projeto do interatlética. É o §106 — os módulos se conversam em
          // vez de repetirem o mesmo dado com nomes diferentes.
          const doProjeto = tarefas.filter(
            (t) => projeto.eventoId !== null && t.eventoId === projeto.eventoId)
          const gastos = lancamentos.filter((l) => l.projetoId === projeto.id)
          const social = projeto.tipo === 'SOCIAL'

          return (
            <>
              <CabecalhoDePagina
                titulo={projeto.nome}
                descricao={projeto.resumo}
                trilha={[
                  { rotulo: 'Projetos', para: `/hub/${slug}/projetos` },
                  { rotulo: projeto.nome },
                ]}
                etiqueta={
                  <span className={`etiqueta ${STATUS_DO_PROJETO[projeto.status].classe}`}>
                    {STATUS_DO_PROJETO[projeto.status].rotulo}
                  </span>
                }
                acoes={projeto.eventoId ? (
                  <Link to={`/hub/${slug}/eventos/${projeto.eventoId}`}
                        className="botao botao--discreto">
                    <Icone nome="eventos" tamanho={16} /> Abrir o evento
                  </Link>
                ) : undefined}
              />

              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Progresso" icone="projetos"
                         valor={percentual(projeto.progresso)}
                         detalhe={`${projeto.tarefasConcluidas} de ${projeto.tarefasTotal} tarefas`} />
                <Metrica rotulo="Tipo" icone="grade"
                         valor={TIPO_DE_PROJETO[projeto.tipo]} detalhe={projeto.area} />
                <Metrica
                  rotulo="Prazo" icone="relogio"
                  valor={projeto.prazo ? dataCurta(projeto.prazo) : '—'}
                  detalhe={projeto.prazo ? quando(projeto.prazo) : 'sem prazo definido'}
                  cor={projeto.prazo && new Date(projeto.prazo) < new Date()
                    && projeto.status === 'EM_ANDAMENTO' ? 'var(--perigo)' : undefined}
                />
                <Metrica
                  rotulo="Orçamento" icone="orcamento"
                  valor={projeto.orcamentoPrevisto === null
                    ? '—' : dinheiro(projeto.orcamentoPrevisto)}
                  detalhe={projeto.orcamentoGasto !== null && projeto.orcamentoPrevisto
                    ? `${dinheiro(projeto.orcamentoGasto)} gastos`
                    : undefined}
                />
              </div>

              <Abas
                atual={aba}
                aoTrocar={setAba}
                opcoes={[
                  { valor: 'VISAO', rotulo: 'Visão geral' },
                  { valor: 'CRONOGRAMA', rotulo: 'Cronograma', contagem: projeto.marcos.length },
                  { valor: 'TAREFAS', rotulo: 'Tarefas', contagem: doProjeto.length },
                  { valor: 'ORCAMENTO', rotulo: 'Orçamento', contagem: gastos.length },
                  ...(social || projeto.resultado
                    ? [{ valor: 'RESULTADOS' as Aba, rotulo: 'Resultados' }]
                    : []),
                ]}
              />

              {aba === 'VISAO' ? (
                <div className="detalhe">
                  <div>
                    <Secao titulo="Andamento">
                      <div className="cartao">
                        <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                          <span className="fraco">
                            {projeto.tarefasConcluidas} de {projeto.tarefasTotal} tarefas
                            concluídas
                          </span>
                          <strong>{percentual(projeto.progresso)}</strong>
                        </div>
                        <Progresso proporcao={projeto.progresso}
                                   tom={projeto.progresso >= 1 ? 'sucesso' : undefined} />
                      </div>
                    </Secao>

                    <Secao titulo="Próximos marcos">
                      <div className="cartao">
                        <LinhaDoTempo>
                          {projeto.marcos.map((m) => (
                            <ItemDaLinha key={m.id}
                                         estado={m.concluido ? 'feito' : 'pendente'}>
                              <div style={{
                                fontWeight: 550,
                                textDecoration: m.concluido ? 'line-through' : undefined,
                                color: m.concluido ? 'var(--texto-fraco)' : undefined,
                              }}>
                                {m.titulo}
                              </div>
                              {m.prazo ? (
                                <div className="fraco">{quando(m.prazo)}</div>
                              ) : null}
                            </ItemDaLinha>
                          ))}
                        </LinhaDoTempo>
                      </div>
                    </Secao>
                  </div>

                  <div>
                    <Secao titulo="Responsável">
                      <div className="cartao">
                        {projeto.responsavelNome ? (
                          <div className="linha">
                            <Avatar nome={projeto.responsavelNome}
                                    url={projeto.responsavelAvatarUrl} tamanho="m" />
                            <div>
                              <strong>{projeto.responsavelNome}</strong>
                              <div className="fraco">{projeto.area}</div>
                            </div>
                          </div>
                        ) : (
                          <p className="fraco" style={{ margin: 0 }}>
                            Sem responsável. Projeto sem nome é projeto de ninguém.
                          </p>
                        )}
                      </div>
                    </Secao>

                    {social && projeto.parceiros.length > 0 ? (
                      <Secao titulo="Parceiros">
                        <div className="pilha pilha--densa">
                          {projeto.parceiros.map((p) => (
                            <div key={p} className="cartao cartao--compacto linha">
                              <Icone nome="parcerias" tamanho={16} />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </Secao>
                    ) : null}

                    <Secao titulo="Datas">
                      <div className="cartao">
                        <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                          <span className="fraco">Início</span>
                          <span>{dataCurta(projeto.inicioEm)}</span>
                        </div>
                        <div className="linha entre">
                          <span className="fraco">Prazo</span>
                          <span>{projeto.prazo ? dataCurta(projeto.prazo) : '—'}</span>
                        </div>
                      </div>
                    </Secao>
                  </div>
                </div>
              ) : null}

              {aba === 'CRONOGRAMA' ? (
                <Secao descricao="Os marcos que dividem o projeto em pedaços verificáveis.">
                  <div className="cartao">
                    <LinhaDoTempo>
                      {projeto.marcos.map((m) => (
                        <ItemDaLinha key={m.id} estado={m.concluido ? 'feito' : 'pendente'}>
                          <div className="linha entre">
                            <strong style={{
                              textDecoration: m.concluido ? 'line-through' : undefined,
                              color: m.concluido ? 'var(--texto-fraco)' : undefined,
                            }}>
                              {m.titulo}
                            </strong>
                            {m.prazo ? (
                              <span className="fraco">{dataCurta(m.prazo)}</span>
                            ) : null}
                          </div>
                        </ItemDaLinha>
                      ))}
                    </LinhaDoTempo>
                  </div>
                </Secao>
              ) : null}

              {aba === 'TAREFAS' ? (
                <Secao
                  acao={
                    <Link to={`/hub/${slug}/tarefas`}
                          className="botao botao--discreto botao--pequeno">
                      Abrir o quadro
                    </Link>
                  }
                >
                  {doProjeto.length === 0 ? (
                    <EstadoVazio icone="tarefas" titulo="Nenhuma tarefa ligada a este projeto">
                      <p className="fraco">
                        Tarefas criadas no quadro e ligadas ao evento deste projeto
                        aparecem aqui.
                      </p>
                    </EstadoVazio>
                  ) : (
                    <div className="pilha pilha--densa">
                      {doProjeto.map((t) => (
                        <div key={t.id} className="cartao cartao--compacto linha entre">
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontWeight: 550,
                              textDecoration: t.status === 'CONCLUIDA'
                                ? 'line-through' : undefined,
                            }}>
                              {t.titulo}
                            </div>
                            <div className="fraco">
                              {t.responsavelNome ?? 'sem responsável'}
                            </div>
                          </div>
                          {t.prazo ? (
                            <span className={`etiqueta ${
                              new Date(t.prazo) < new Date() && t.status !== 'CONCLUIDA'
                                ? 'etiqueta--perigo' : ''}`}>
                              {quando(t.prazo)}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </Secao>
              ) : null}

              {aba === 'ORCAMENTO' ? (
                <Secao descricao="Os lançamentos financeiros ligados a este projeto.">
                  {projeto.orcamentoPrevisto !== null ? (
                    <div className="cartao" style={{ marginBottom: '1rem' }}>
                      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                        <span className="fraco">
                          {dinheiro(projeto.orcamentoGasto ?? 0)} de{' '}
                          {dinheiro(projeto.orcamentoPrevisto)}
                        </span>
                        <strong>
                          {percentual((projeto.orcamentoGasto ?? 0)
                            / projeto.orcamentoPrevisto)}
                        </strong>
                      </div>
                      <Progresso
                        proporcao={(projeto.orcamentoGasto ?? 0) / projeto.orcamentoPrevisto}
                        tom={(projeto.orcamentoGasto ?? 0) > projeto.orcamentoPrevisto
                          ? 'perigo' : undefined}
                      />
                    </div>
                  ) : null}

                  {gastos.length === 0 ? (
                    <EstadoVazio icone="financeiro" titulo="Nenhum lançamento ligado">
                      <p className="fraco">
                        Ao registrar uma despesa no financeiro, aponte-a para este
                        projeto: é o que faz o custo real aparecer aqui.
                      </p>
                    </EstadoVazio>
                  ) : (
                    <div className="rolagem">
                      <table className="tabela-cartoes">
                        <thead>
                          <tr>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th className="numero">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gastos.map((l) => (
                            <tr key={l.id}>
                              <td data-rotulo="Descrição">{l.descricao}</td>
                              <td data-rotulo="Categoria">{l.categoria.toLowerCase()}</td>
                              <td data-rotulo="Valor" className="numero">
                                <span className={`dinheiro dinheiro--${
                                  l.natureza === 'RECEITA' ? 'positivo' : 'negativo'}`}>
                                  {l.natureza === 'RECEITA' ? '+' : '−'}
                                  {dinheiro(l.valor, true)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Secao>
              ) : null}

              {aba === 'RESULTADOS' ? (
                <div className="detalhe">
                  <div>
                    <Secao titulo="O que este projeto produziu">
                      {projeto.resultado ? (
                        <div className="cartao">
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {projeto.resultado}
                          </p>
                        </div>
                      ) : (
                        <EstadoVazio icone="experiencias"
                                     titulo="Resultado ainda não registrado">
                          <p className="fraco">
                            Ao encerrar, escreva o que funcionou e o que não
                            funcionou. É o que transforma este projeto em
                            aprendizado da atlética, e não só de quem o tocou.
                          </p>
                        </EstadoVazio>
                      )}
                    </Secao>
                  </div>
                  <div>
                    {projeto.beneficiados !== null ? (
                      <Metrica rotulo="Pessoas alcançadas" icone="social"
                               valor={projeto.beneficiados} />
                    ) : null}
                    {projeto.status === 'CONCLUIDO' ? (
                      <div className="aviso" style={{ marginTop: '1rem' }}>
                        <strong>Compartilhe com a rede</strong>
                        <p className="fraco" style={{ margin: '0.3rem 0 0.6rem' }}>
                          Uma atlética não precisa descobrir sozinha o que outra
                          já aprendeu.
                        </p>
                        <Link to={`/hub/${slug}/conhecimento/experiencias`}
                              className="botao botao--discreto botao--pequeno">
                          Registrar experiência
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
