import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Projeto } from '../../../api/tipos-gestao'
import type { Tarefa } from '../../../api/tipos-rede'
import { useSessao } from '../../../sessao/SessaoContexto'
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
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [aba, setAba] = useState<Aba>('VISAO')
  const [encerrando, setEncerrando] = useState(false)

  const busca = useBusca<Composicao>(async () => {
    const [projeto, tarefas, lancamentos] = await Promise.all([
      Dados.projeto(id),
      Dados.tarefas(slug),
      Dados.lancamentos(slug),
    ])
    return { projeto, tarefas, lancamentos }
  }, [slug, id])

  /** Troca só o projeto no resultado, sem refazer as três chamadas. */
  const trocarProjeto = (projeto: Projeto) => {
    const atual = busca.dados
    if (atual) busca.definir({ ...atual, projeto })
  }

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
          // Com roteiro, a unidade de trabalho do projeto e o passo; sem
          // roteiro, e a tarefa do quadro ligada pelo evento.
          const unidade = projeto.passos.length > 0
            ? { nome: 'passos', feitos: 'concluídos' }
            : { nome: 'tarefas', feitos: 'concluídas' }
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
                acoes={
                  <>
                    {projeto.eventoId ? (
                      <Link to={`/hub/${slug}/eventos/${projeto.eventoId}`}
                            className="botao botao--discreto">
                        <Icone nome="eventos" tamanho={16} /> Abrir o evento
                      </Link>
                    ) : null}
                    {diretor && projeto.status !== 'CONCLUIDO' ? (
                      <button className="botao" onClick={() => setEncerrando(true)}>
                        <Icone nome="certo" tamanho={16} /> Encerrar
                      </button>
                    ) : null}
                  </>
                }
              />

              {encerrando ? (
                <FormularioDeEncerramento
                  projeto={projeto}
                  aoEncerrar={(p) => {
                    trocarProjeto(p)
                    setEncerrando(false)
                    setAba('RESULTADOS')
                  }}
                  aoCancelar={() => setEncerrando(false)}
                />
              ) : null}

              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Progresso" icone="projetos"
                         valor={percentual(projeto.progresso)}
                         detalhe={`${projeto.tarefasConcluidas} de ${projeto.tarefasTotal} ${unidade.nome}`} />
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
                  {
                    valor: 'TAREFAS',
                    rotulo: projeto.passos.length > 0 ? 'Roteiro' : 'Tarefas',
                    contagem: projeto.passos.length > 0
                      ? projeto.passos.length : doProjeto.length,
                  },
                  { valor: 'ORCAMENTO', rotulo: 'Orçamento', contagem: gastos.length },
                  ...(social || projeto.resultado || projeto.status === 'CONCLUIDO'
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
                            {projeto.tarefasConcluidas} de {projeto.tarefasTotal}{' '}
                            {unidade.nome} {unidade.feitos}
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
                              {/* Marcar é clicar no próprio marco: um botão
                                  "concluir" ao lado de cada linha encheria a
                                  coluna de controles repetidos. */}
                              <button
                                className="linha-marcavel"
                                disabled={!diretor}
                                aria-pressed={m.concluido}
                                onClick={() => {
                                  void Dados.alternarMarcoDoProjeto(projeto.id, m.id)
                                    .then((p) => { if (p) trocarProjeto(p) })
                                }}
                              >
                                <span style={{
                                  fontWeight: 550,
                                  textDecoration: m.concluido ? 'line-through' : undefined,
                                  color: m.concluido ? 'var(--texto-fraco)' : undefined,
                                }}>
                                  {m.titulo}
                                </span>
                                {m.prazo ? (
                                  <span className="fraco">{quando(m.prazo)}</span>
                                ) : null}
                              </button>
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
                <>
                  {projeto.passos.length > 0 ? (
                    <Secao
                      titulo="O roteiro do modelo"
                      descricao="As etapas que outra atlética já descobriu que importam. Marque conforme resolver — o progresso do projeto sai daqui."
                    >
                      <div className="cartao">
                        <div className="pilha pilha--densa">
                          {projeto.passos.map((p) => (
                            <button
                              key={p.id}
                              className="linha-marcavel"
                              disabled={!diretor}
                              aria-pressed={p.concluido}
                              onClick={() => {
                                void Dados.alternarPassoDoProjeto(projeto.id, p.id)
                                  .then((x) => { if (x) trocarProjeto(x) })
                              }}
                            >
                              <Icone nome={p.concluido ? 'certo' : 'lista'} tamanho={16} />
                              <span style={{
                                textDecoration: p.concluido ? 'line-through' : undefined,
                                color: p.concluido ? 'var(--texto-fraco)' : undefined,
                              }}>
                                {p.titulo}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </Secao>
                  ) : null}

                <Secao
                  titulo={projeto.passos.length > 0 ? 'Tarefas do quadro' : undefined}
                  descricao={projeto.passos.length > 0
                    ? 'O roteiro acima é uma lista de conferência. Trabalho com responsável e prazo vira tarefa no quadro.'
                    : undefined}
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
                </>
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
                          {diretor && projeto.status !== 'CONCLUIDO' ? (
                            <button className="botao"
                                    onClick={() => setEncerrando(true)}>
                              <Icone nome="certo" tamanho={16} /> Encerrar o projeto
                            </button>
                          ) : null}
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

/**
 * Encerrar exige escrever o resultado.
 *
 * <p>Um botão que só muda o status para "concluído" perde o único momento em
 * que alguém ainda lembra por que as coisas deram certo ou errado. Duas
 * semanas depois, ninguém escreve — e a gestão seguinte recomeça do zero,
 * que é exatamente o problema que a plataforma existe para resolver.</p>
 */
function FormularioDeEncerramento({ projeto, aoEncerrar, aoCancelar }: {
  projeto: Projeto
  aoEncerrar: (projeto: Projeto) => void
  aoCancelar: () => void
}) {
  const [resultado, setResultado] = useState('')
  const [salvando, setSalvando] = useState(false)

  const pendentes = projeto.passos.filter((p) => !p.concluido).length

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const atualizado = await Dados.encerrarProjeto(projeto.id, resultado)
    setSalvando(false)
    if (atualizado) aoEncerrar(atualizado)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Encerrar “{projeto.nome}”</h3>
      <p className="fraco">
        Escreva agora, enquanto você lembra. Este texto é o que a próxima
        diretoria vai ler antes de repetir o projeto.
      </p>

      {pendentes > 0 ? (
        <div className="aviso aviso--alerta" style={{ marginBottom: '0.9rem' }}>
          {pendentes === 1
            ? 'Ainda há um passo do roteiro não marcado.'
            : `Ainda há ${pendentes} passos do roteiro não marcados.`}
          {' '}Encerrar assim mesmo é comum — nem todo roteiro se aplica inteiro.
        </div>
      ) : null}

      <label className="campo">
        <span className="campo__rotulo">O que este projeto produziu</span>
        <textarea value={resultado} onChange={(e) => setResultado(e.target.value)}
                  required rows={5}
                  placeholder="Quanto rendeu, quantas pessoas, o que deu errado e o que faríamos diferente." />
        <span className="campo__dica">
          Número ajuda: "R$ 4.200 de saldo e 320 pessoas" diz mais que "correu bem".
        </span>
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !resultado.trim()}>
          {salvando ? 'Encerrando…' : 'Encerrar projeto'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
