import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { PostDaRede, TipoDePostDaRede } from '../../../api/tipos-conhecimento'
import { Avatar, Brasao, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, Confirmacao, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { quando } from '../../../formatos'

const TIPO: Record<TipoDePostDaRede, { rotulo: string; icone: NomeDoIcone; classe: string }> = {
  CONQUISTA: { rotulo: 'Conquista', icone: 'campeonatos', classe: 'etiqueta--sucesso' },
  EVENTO: { rotulo: 'Evento', icone: 'eventos', classe: 'etiqueta--acento' },
  PERGUNTA: { rotulo: 'Pergunta', icone: 'perguntas', classe: '' },
  PEDIDO: { rotulo: 'Pedido de ajuda', icone: 'ajuda', classe: 'etiqueta--alerta' },
  EXPERIENCIA: { rotulo: 'Experiência', icone: 'experiencias', classe: 'etiqueta--acento' },
  OPORTUNIDADE: { rotulo: 'Oportunidade', icone: 'mercado', classe: '' },
  PARCERIA: { rotulo: 'Parceria', icone: 'parcerias', classe: '' },
}

type Filtro = 'TUDO' | TipoDePostDaRede

/**
 * O feed da rede (§34).
 *
 * <p>Não é rede social. A diferença está numa regra só: <strong>todo item
 * tem destino</strong> — leva a um pedido para responder, a uma experiência
 * para ler, a um evento para se inscrever. Post que só existe para ser
 * curtido vira mural morto, e mural morto faz a rede inteira parecer
 * enfeite.</p>
 */
export function Feed() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TUDO')
  const [denunciando, setDenunciando] = useState<PostDaRede | null>(null)
  const [denunciados, setDenunciados] = useState<string[]>([])
  const posts = useBusca<PostDaRede[]>(() => Dados.feedDaRede(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Feed da rede"
        descricao="O que as atléticas publicaram: conquistas, eventos abertos, perguntas e o que aprenderam."
        acoes={
          <Link to={`/hub/${slug}/rede/ajuda?novo=1`} className="botao">
            <Icone nome="mais" tamanho={16} /> Publicar pedido
          </Link>
        }
      />

      <Conteudo
        busca={posts}
        esqueleto={
          <div className="pilha">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="9rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="feed" titulo="O feed ainda está vazio">
                <p className="fraco">
                  Publique o que a sua atlética aprendeu. É o que faz outra
                  atlética não pagar o mesmo preço.
                </p>
              </EstadoVazio>
            )
          }

          const visiveis = filtro === 'TUDO'
            ? lista
            : lista.filter((p) => p.tipo === filtro)

          const contar = (t: TipoDePostDaRede) =>
            lista.filter((p) => p.tipo === t).length

          return (
            <>
              <div style={{ marginBottom: '1.2rem' }}>
                <Chips
                  rotulo="Tipos de publicação"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TUDO', rotulo: 'Tudo', contagem: lista.length },
                    ...(Object.keys(TIPO) as TipoDePostDaRede[])
                      .filter((t) => contar(t) > 0)
                      .map((t) => ({
                        valor: t as Filtro,
                        rotulo: TIPO[t].rotulo,
                        contagem: contar(t),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="pilha">
                  {visiveis.map((post) => (
                    <article key={post.id} className="cartao">
                      <div className="linha entre" style={{ marginBottom: '0.7rem' }}>
                        <div className="linha" style={{ gap: '0.55rem', minWidth: 0 }}>
                          <Brasao atletica={post.atletica} />
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ fontSize: '0.92rem' }}>
                              {post.atletica.nome}
                            </strong>
                            <div className="fraco">
                              {post.autorNome} · {quando(post.quando)}
                            </div>
                          </div>
                        </div>
                        <span className={`linha etiqueta ${TIPO[post.tipo].classe}`}
                              style={{ gap: '0.3rem' }}>
                          <Icone nome={TIPO[post.tipo].icone} tamanho={13} />
                          {TIPO[post.tipo].rotulo}
                        </span>
                      </div>

                      <h3 style={{ marginBottom: '0.3rem' }}>{post.titulo}</h3>
                      <p className="suave" style={{ marginBottom: '0.9rem' }}>
                        {post.corpo}
                      </p>

                      {post.etiquetas.length > 0 ? (
                        <div className="chips" style={{ marginBottom: '0.9rem' }}>
                          {post.etiquetas.map((e) => (
                            <span key={e} className="etiqueta">{e}</span>
                          ))}
                        </div>
                      ) : null}

                      <div className="linha entre">
                        <div className="linha" style={{ gap: '1rem' }}>
                          <span className="linha fraco" style={{ gap: '0.3rem' }}>
                            <Icone nome="certo" tamanho={14} /> {post.util} acharam útil
                          </span>
                          {post.respostas > 0 ? (
                            <span className="linha fraco" style={{ gap: '0.3rem' }}>
                              <Icone nome="comunidades" tamanho={14} />
                              {post.respostas} respostas
                            </span>
                          ) : null}
                          {/* Denúncia discreta (§93): precisa existir em todo
                              conteúdo da rede, e não pode competir com a ação
                              principal do card. */}
                          <button
                            className="botao botao--fantasma botao--pequeno"
                            style={{ minHeight: 'auto', padding: '0 0.3rem',
                                     fontSize: '0.78rem' }}
                            onClick={() => setDenunciando(post)}
                          >
                            <Icone nome="alerta" tamanho={13} /> Denunciar
                          </button>
                        </div>

                        {post.destino ? (
                          <Link
                            to={post.destino.startsWith('e/') || post.destino.startsWith('a/')
                              ? `/${post.destino}`
                              : `/hub/${slug}/${post.destino}`}
                            className="botao botao--discreto botao--pequeno"
                          >
                            {post.destinoRotulo ?? 'Abrir'}
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </Secao>

              <div className="aviso" style={{ marginTop: '1.4rem' }}>
                <div className="linha" style={{ gap: '0.55rem' }}>
                  <Avatar nome="Interatlética" />
                  <div>
                    <strong>Este feed não é uma linha do tempo social</strong>
                    <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                      Cada publicação leva a algum lugar: responder um pedido,
                      ler uma experiência, entrar num evento. Post sem destino
                      não entra aqui.
                    </p>
                  </div>
                </div>
              </div>

              {denunciando ? (
                <Confirmacao
                  titulo="Denunciar esta publicação?"
                  consequencia={
                    `“${denunciando.titulo}”, publicada pela ${denunciando.atletica.nome}, `
                    + 'vai para a administração da rede com o nome da sua atlética. '
                    + 'A publicação não é removida agora — quem modera analisa antes. '
                    + 'Toda ação administrativa fica registrada no histórico.'
                  }
                  rotuloDeConfirmar="Enviar denúncia"
                  aoConfirmar={() => {
                    setDenunciados((atuais) => [...atuais, denunciando.id])
                    setDenunciando(null)
                  }}
                  aoCancelar={() => setDenunciando(null)}
                />
              ) : null}

              {denunciados.length > 0 ? (
                <div className="aviso aviso--sucesso" style={{ marginTop: '1rem' }}>
                  {denunciados.length === 1
                    ? 'Denúncia enviada à administração da rede.'
                    : `${denunciados.length} denúncias enviadas à administração da rede.`}
                </div>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
