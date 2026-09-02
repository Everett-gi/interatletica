import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { PedidoDeAjuda } from '../../../api/tipos-conhecimento'
import { Avatar, Brasao, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'
import { AREA } from './PedidosDeAjuda'

/**
 * Um pedido e suas respostas (§36).
 *
 * <p>A <strong>resposta mais útil</strong> é o mecanismo central: sem ela, uma
 * pergunta com doze respostas obriga quem chega depois a ler as doze. Com
 * ela, a primeira coisa que aparece é a que resolveu o problema — e é o autor
 * da pergunta quem marca, porque só ele sabe o que funcionou.</p>
 */
export function DetalheDoPedido() {
  const { slug = '', id = '' } = useParams()
  const { perfil, vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica

  const pedido = useBusca<PedidoDeAjuda | null>(() => Dados.pedidoDeAjuda(id), [id])
  const [resposta, setResposta] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function responder(e: FormEvent) {
    e.preventDefault()
    if (!perfil) return
    setEnviando(true)
    const atualizado = await Dados.responderPedido(
      id, perfil.nome, minha ?? null, resposta.trim())
    setEnviando(false)
    setResposta('')
    if (atualizado) pedido.definir(atualizado)
  }

  async function marcarMaisUtil(respostaId: string) {
    const atualizado = await Dados.marcarMaisUtil(id, respostaId)
    if (atualizado) pedido.definir(atualizado)
  }

  return (
    <div>
      <Conteudo busca={pedido} esqueleto={<Esqueleto altura="20rem" />}>
        {(p) => {
          if (!p) {
            return (
              <EstadoVazio icone="ajuda" titulo="Pedido não encontrado">
                <Link to={`/hub/${slug}/rede/ajuda`} className="botao botao--discreto">
                  Voltar aos pedidos
                </Link>
              </EstadoVazio>
            )
          }

          // O autor é quem pode eleger a resposta mais útil — no demo, isso
          // vale quando o pedido é da atlética em que você está.
          const souOAutor = p.atletica.slug === slug
          const ordenadas = [...p.respostas].sort(
            (a, b) => Number(b.maisUtil) - Number(a.maisUtil) || b.util - a.util)

          return (
            <>
              <CabecalhoDePagina
                titulo={p.titulo}
                trilha={[
                  { rotulo: 'Pedidos de ajuda', para: `/hub/${slug}/rede/ajuda` },
                  { rotulo: p.titulo },
                ]}
                etiqueta={<span className="etiqueta">{AREA[p.area]}</span>}
              />

              <div className="detalhe">
                <div>
                  <div className="cartao" style={{ marginBottom: '1.4rem' }}>
                    <div className="linha entre" style={{ marginBottom: '0.7rem' }}>
                      <div className="linha" style={{ gap: '0.55rem', minWidth: 0 }}>
                        <Brasao atletica={p.atletica} />
                        <div style={{ minWidth: 0 }}>
                          <strong>{p.atletica.nome}</strong>
                          <div className="fraco">
                            {p.autorNome} · {quando(p.abertoEm)}
                          </div>
                        </div>
                      </div>
                      <span className={`etiqueta ${
                        p.status === 'ABERTO' ? 'etiqueta--alerta'
                          : p.status === 'RESOLVIDO' ? 'etiqueta--sucesso' : ''}`}>
                        {p.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="suave" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {p.corpo}
                    </p>
                  </div>

                  <Secao
                    titulo={`${p.respostas.length} ${
                      p.respostas.length === 1 ? 'resposta' : 'respostas'}`}
                    descricao={souOAutor && p.respostas.length > 0
                      ? 'Marque a que resolveu o seu problema: é ela que aparece primeiro para quem vier depois.'
                      : undefined}
                  >
                    {ordenadas.length === 0 ? (
                      <EstadoVazio icone="comunidades" titulo="Ninguém respondeu ainda">
                        <p className="fraco">
                          Se a sua atlética já passou por isso, escreva abaixo. Dois
                          minutos aqui poupam semanas de quem perguntou.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha">
                        {ordenadas.map((r) => (
                          <article key={r.id}
                                   className={`cartao${r.maisUtil ? ' cartao--destacado' : ''}`}>
                            {r.maisUtil ? (
                              <div className="linha" style={{ gap: '0.4rem',
                                                              marginBottom: '0.6rem' }}>
                                <span style={{ color: 'var(--sucesso)' }}>
                                  <Icone nome="certo" tamanho={17} />
                                </span>
                                <strong style={{ color: 'var(--sucesso)',
                                                 fontSize: '0.88rem' }}>
                                  Resposta mais útil
                                </strong>
                              </div>
                            ) : null}

                            <div className="linha entre" style={{ marginBottom: '0.6rem' }}>
                              <div className="linha" style={{ gap: '0.5rem', minWidth: 0 }}>
                                <Avatar nome={r.autorNome} url={r.autorAvatarUrl} />
                                <div style={{ minWidth: 0 }}>
                                  <strong style={{ fontSize: '0.9rem' }}>{r.autorNome}</strong>
                                  <div className="fraco">
                                    {r.atletica?.nome ?? 'sem atlética'} · {quando(r.quando)}
                                  </div>
                                </div>
                              </div>
                              <span className="linha fraco" style={{ gap: '0.3rem' }}>
                                <Icone nome="certo" tamanho={13} /> {r.util}
                              </span>
                            </div>

                            <p className="suave" style={{ whiteSpace: 'pre-wrap' }}>
                              {r.corpo}
                            </p>

                            {r.anexos.length > 0 ? (
                              <div className="chips" style={{ marginBottom: '0.6rem' }}>
                                {r.anexos.map((a) => (
                                  <span key={a} className="linha etiqueta"
                                        style={{ gap: '0.3rem' }}>
                                    <Icone nome="documentos" tamanho={12} /> {a}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            {souOAutor && !r.maisUtil ? (
                              <button
                                className="botao botao--discreto botao--pequeno"
                                onClick={() => void marcarMaisUtil(r.id)}
                              >
                                <Icone nome="certo" tamanho={14} />
                                Marcar como mais útil
                              </button>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    )}
                  </Secao>

                  <Secao titulo="Responder">
                    <form className="cartao" onSubmit={(e) => void responder(e)}>
                      <label className="campo">
                        <span className="campo__rotulo">
                          O que a sua atlética fez nesta situação?
                        </span>
                        <textarea
                          value={resposta}
                          onChange={(e) => setResposta(e.target.value)}
                          required
                          placeholder="Conte o que funcionou, com número quando der. Resposta com dado vale por dez conselhos."
                        />
                      </label>
                      <button className="botao" type="submit"
                              disabled={enviando || !resposta.trim()}>
                        {enviando ? 'Enviando…' : 'Publicar resposta'}
                      </button>
                    </form>
                  </Secao>
                </div>

                <div>
                  <Secao titulo="Quem perguntou">
                    <Link to={`/a/${p.atletica.slug}`} className="cartao cartao--clicavel">
                      <div className="linha linha--topo">
                        <Brasao atletica={p.atletica} tamanho="g" />
                        <div style={{ minWidth: 0 }}>
                          <strong>{p.atletica.nome}</strong>
                          <div className="fraco">{p.atletica.instituicao}</div>
                          <div className="fraco">
                            {p.atletica.cidade}/{p.atletica.uf}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Secao>

                  {p.experienciaId ? (
                    <div className="aviso aviso--sucesso">
                      <strong>Virou experiência registrada</strong>
                      <p className="fraco" style={{ margin: '0.25rem 0 0.6rem' }}>
                        O que saiu daqui foi escrito em detalhe e ficou disponível
                        para toda a rede.
                      </p>
                      <Link
                        to={`/hub/${slug}/conhecimento/experiencias/${p.experienciaId}`}
                        className="botao botao--discreto botao--pequeno"
                      >
                        Ler a experiência
                      </Link>
                    </div>
                  ) : p.status === 'RESOLVIDO' ? (
                    <div className="aviso">
                      <strong>Registre o que aprendeu</strong>
                      <p className="fraco" style={{ margin: '0.25rem 0 0.6rem' }}>
                        A resposta ajudou você. Escrever o que deu certo na prática
                        ajuda as próximas — e fecha o ciclo.
                      </p>
                      <Link to={`/hub/${slug}/conhecimento/experiencias`}
                            className="botao botao--discreto botao--pequeno">
                        Escrever experiência
                      </Link>
                    </div>
                  ) : null}

                  <Secao titulo="Também pode ajudar">
                    <div className="pilha pilha--densa">
                      <Link to={`/hub/${slug}/conhecimento`}
                            className="cartao cartao--clicavel cartao--compacto linha">
                        <Icone nome="guias" tamanho={17} />
                        <span style={{ flex: 1, minWidth: 0 }}>Guias da rede</span>
                        <Icone nome="direita" tamanho={14} />
                      </Link>
                      <Link to={`/hub/${slug}/conhecimento/modelos`}
                            className="cartao cartao--clicavel cartao--compacto linha">
                        <Icone nome="modelos" tamanho={17} />
                        <span style={{ flex: 1, minWidth: 0 }}>Modelos prontos</span>
                        <Icone nome="direita" tamanho={14} />
                      </Link>
                      <Link to={`/hub/${slug}/conhecimento/mentoria`}
                            className="cartao cartao--clicavel cartao--compacto linha">
                        <Icone nome="mentoria" tamanho={17} />
                        <span style={{ flex: 1, minWidth: 0 }}>Buscar mentoria</span>
                        <Icone nome="direita" tamanho={14} />
                      </Link>
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
