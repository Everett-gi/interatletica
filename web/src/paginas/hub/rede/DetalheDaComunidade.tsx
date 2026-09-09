import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Comunidade, PostDaComunidade } from '../../../api/tipos-conhecimento'
import { Avatar, Brasao, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

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
  const { perfil, vinculo } = useSessao()
  const [escrevendo, setEscrevendo] = useState(false)

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
                    acao={c.participo && perfil ? (
                      <button className="botao botao--discreto botao--pequeno"
                              onClick={() => setEscrevendo((v) => !v)}>
                        <Icone nome="mais" tamanho={14} /> Nova conversa
                      </button>
                    ) : undefined}
                  >
                    {escrevendo && perfil ? (
                      <FormularioDePost
                        comunidadeId={c.id}
                        autor={{
                          nome: perfil.nome,
                          avatarUrl: perfil.avatarUrl,
                          atletica: vinculo(slug)?.atletica ?? null,
                        }}
                        aoPublicar={(post) => {
                          busca.definir({ comunidade: c, posts: [post, ...posts] })
                          setEscrevendo(false)
                        }}
                        aoCancelar={() => setEscrevendo(false)}
                      />
                    ) : null}

                    {posts.length === 0 ? (
                      <EstadoVazio icone="comunidades" titulo="Nenhuma conversa por aqui">
                        <p className="fraco">
                          Comece perguntando algo específico. Pergunta com número
                          recebe resposta com número.
                        </p>
                        {c.participo && perfil && !escrevendo ? (
                          <button className="botao" onClick={() => setEscrevendo(true)}>
                            <Icone nome="mais" tamanho={16} /> Começar a primeira
                          </button>
                        ) : null}
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
                                {plural(post.respostas, 'resposta')}
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

/**
 * Escrever na comunidade.
 *
 * <p>Um campo só, e de propósito: título mais corpo transformaria a conversa
 * em fórum, e conversa de comunidade é mais próxima de uma pergunta no grupo
 * do que de um artigo. O tamanho do texto é que define se é pergunta rápida
 * ou relato longo.</p>
 */
function FormularioDePost({ comunidadeId, autor, aoPublicar, aoCancelar }: {
  comunidadeId: string
  autor: {
    nome: string
    avatarUrl: string | null
    atletica: PostDaComunidade['atletica']
  }
  aoPublicar: (post: PostDaComunidade) => void
  aoCancelar: () => void
}) {
  const [corpo, setCorpo] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const post = await Dados.publicarNaComunidade(comunidadeId, autor, corpo.trim())
    setSalvando(false)
    aoPublicar(post)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1rem' }}
          onSubmit={(e) => void enviar(e)}>
      <label className="campo">
        <span className="campo__rotulo">O que você quer perguntar ou contar</span>
        <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)}
                  required rows={4} autoFocus
                  placeholder="Quanto vocês cobram de cota num interatlética de quatro atléticas?" />
        <span className="campo__dica">
          Pergunta com número recebe resposta com número. Diga o tamanho da sua
          atlética e o que já foi tentado.
        </span>
      </label>

      <div className="linha">
        <button className="botao botao--pequeno" type="submit"
                disabled={salvando || corpo.trim().length < 10}>
          {salvando ? 'Publicando…' : 'Publicar'}
        </button>
        <button className="botao botao--fantasma botao--pequeno" type="button"
                onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
