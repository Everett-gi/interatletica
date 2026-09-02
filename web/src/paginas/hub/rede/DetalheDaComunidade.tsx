import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Comunidade, PostDaComunidade } from '../../../api/tipos-conhecimento'
import { Avatar, Brasao, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { quando } from '../../../formatos'

interface Composicao {
  comunidade: Comunidade | null
  posts: PostDaComunidade[]
}

/**
 * Uma comunidade: quem está e o que se conversa.
 *
 * <p>Comunicação organizada por contexto (§58): a conversa acontece dentro do
 * grupo a que ela pertence, e não num mensageiro geral. Quem entra em
 * "Futsal Universitário" quer falar de arbitragem e tabela — misturar isso
 * com o financeiro da atlética faria as duas conversas piores.</p>
 */
export function DetalheDaComunidade() {
  const { slug = '', id = '' } = useParams()

  const busca = useBusca<Composicao>(async () => {
    const [comunidade, posts] = await Promise.all([
      Dados.comunidade(id),
      Dados.postsDaComunidade(id),
    ])
    return { comunidade, posts }
  }, [id])

  async function alternar(comunidade: Comunidade) {
    const atualizada = await Dados.alternarComunidade(comunidade.id)
    if (atualizada && busca.dados) {
      busca.definir({ ...busca.dados, comunidade: atualizada })
    }
  }

  return (
    <div>
      <Conteudo busca={busca} esqueleto={<Esqueleto altura="18rem" />}>
        {({ comunidade: c, posts }) => {
          if (!c) {
            return (
              <EstadoVazio icone="comunidades" titulo="Comunidade não encontrada">
                <Link to={`/hub/${slug}/rede/comunidades`} className="botao botao--discreto">
                  Voltar às comunidades
                </Link>
              </EstadoVazio>
            )
          }

          return (
            <>
              <CabecalhoDePagina
                titulo={c.nome}
                descricao={c.descricao}
                trilha={[
                  { rotulo: 'Comunidades', para: `/hub/${slug}/rede/comunidades` },
                  { rotulo: c.nome },
                ]}
                acoes={
                  <button
                    className={c.participo ? 'botao botao--discreto' : 'botao'}
                    onClick={() => void alternar(c)}
                  >
                    {c.participo ? 'Sair da comunidade' : 'Participar'}
                  </button>
                }
              />

              <div className="detalhe">
                <div>
                  <Secao
                    titulo="Conversas"
                    acao={c.participo ? (
                      <button className="botao botao--discreto botao--pequeno" disabled
                              title="Publicar chega com a API conectada">
                        <Icone nome="mais" tamanho={14} /> Nova conversa
                      </button>
                    ) : undefined}
                  >
                    {posts.length === 0 ? (
                      <EstadoVazio icone="comunidades" titulo="Nenhuma conversa por aqui">
                        <p className="fraco">
                          Comece perguntando algo específico. Pergunta com número
                          recebe resposta com número.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha">
                        {posts.map((post) => (
                          <article key={post.id} className="cartao">
                            <div className="linha" style={{ gap: '0.55rem',
                                                            marginBottom: '0.6rem' }}>
                              <Avatar nome={post.autorNome} url={post.autorAvatarUrl} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <strong style={{ fontSize: '0.9rem' }}>
                                  {post.autorNome}
                                </strong>
                                <div className="fraco">
                                  {post.atletica?.nome ?? 'sem atlética'} ·{' '}
                                  {quando(post.quando)}
                                </div>
                              </div>
                              {post.atletica ? (
                                <Brasao atletica={post.atletica} tamanho="p" />
                              ) : null}
                            </div>

                            <p className="suave" style={{ marginBottom: '0.7rem' }}>
                              {post.corpo}
                            </p>

                            <div className="linha" style={{ gap: '1rem' }}>
                              <span className="linha fraco" style={{ gap: '0.3rem' }}>
                                <Icone nome="certo" tamanho={14} /> {post.util} úteis
                              </span>
                              <span className="linha fraco" style={{ gap: '0.3rem' }}>
                                <Icone nome="comunidades" tamanho={14} />
                                {post.respostas} respostas
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </Secao>
                </div>

                <div>
                  <Secao titulo="A comunidade">
                    <div className="cartao">
                      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                        <span className="fraco">Pessoas</span>
                        <strong>{c.membros}</strong>
                      </div>
                      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                        <span className="fraco">Atléticas</span>
                        <strong>{c.atleticas}</strong>
                      </div>
                      <div className="linha entre">
                        <span className="fraco">Última atividade</span>
                        <span>{quando(c.ultimaAtividade)}</span>
                      </div>
                      {c.participo ? (
                        <>
                          <hr className="divisor" />
                          <div className="linha" style={{ gap: '0.45rem',
                                                          color: 'var(--sucesso)' }}>
                            <Icone nome="certo" tamanho={16} />
                            <span style={{ fontSize: '0.88rem' }}>
                              Você participa desta comunidade
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </Secao>

                  <Secao titulo="Regras de convivência">
                    <div className="cartao">
                      <ul className="lista-marcada">
                        <li>Pergunta específica, resposta específica.</li>
                        <li>Sem venda de ingresso nem revenda.</li>
                        <li>Número e contexto valem mais que opinião.</li>
                        <li>Conteúdo fora do assunto pode ser denunciado.</li>
                      </ul>
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
