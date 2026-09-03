import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Guia } from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { AREA } from '../rede/PedidosDeAjuda'

/**
 * Um guia, com índice lateral.
 *
 * <p>Doze minutos de leitura sem índice é o tipo de página que se abre e se
 * fecha. Com as seções listadas ao lado, quem já sabe metade pula direto
 * para o que interessa — e é assim que um guia longo continua sendo útil na
 * segunda consulta.</p>
 */
export function DetalheDoGuia() {
  const { slug = '', id = '' } = useParams()
  const guia = useBusca<Guia | null>(() => Dados.guia(id), [id])

  return (
    <div>
      <Conteudo busca={guia} esqueleto={<Esqueleto altura="24rem" />}>
        {(g) => {
          if (!g) {
            return (
              <EstadoVazio icone="guias" titulo="Guia não encontrado">
                <Link to={`/hub/${slug}/conhecimento`} className="botao botao--discreto">
                  Voltar à base de conhecimento
                </Link>
              </EstadoVazio>
            )
          }

          return (
            <>
              <CabecalhoDePagina
                titulo={g.titulo}
                descricao={g.resumo}
                trilha={[
                  { rotulo: 'Conhecimento', para: `/hub/${slug}/conhecimento` },
                  { rotulo: g.titulo },
                ]}
                etiqueta={<span className="etiqueta">{AREA[g.area]}</span>}
                acoes={
                  <button
                    className={g.salvo ? 'botao' : 'botao botao--discreto'}
                    aria-pressed={g.salvo}
                    onClick={() => {
                      void Dados.alternarGuiaSalvo(g.id).then(guia.definir)
                    }}
                  >
                    <Icone nome={g.salvo ? 'certo' : 'documentos'} tamanho={16} />{' '}
                    {g.salvo ? 'Guardado' : 'Guardar'}
                  </button>
                }
              />

              <div className="detalhe">
                <div>
                  <article className="pilha" style={{ gap: '1.5rem' }}>
                    {g.secoes.map((secao, i) => (
                      <section key={secao.titulo} id={`secao-${i}`} className="cartao">
                        <h2 style={{ marginBottom: '0.5rem' }}>{secao.titulo}</h2>
                        <p className="suave" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {secao.corpo}
                        </p>
                      </section>
                    ))}
                  </article>

                  <div className="cartao" style={{ marginTop: '1.5rem' }}>
                    <div className="linha entre">
                      <div>
                        <strong>Este guia ajudou?</strong>
                        <div className="fraco">
                          {g.util} atléticas marcaram como útil.
                        </div>
                      </div>
                      <button
                        className={g.marqueiUtil ? 'botao' : 'botao botao--discreto'}
                        aria-pressed={g.marqueiUtil}
                        onClick={() => {
                          void Dados.alternarGuiaUtil(g.id).then(guia.definir)
                        }}
                      >
                        <Icone nome="certo" tamanho={16} />{' '}
                        {g.marqueiUtil ? 'Você marcou' : 'Foi útil'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <Secao titulo="Neste guia">
                    <nav className="cartao" aria-label="Seções do guia">
                      <div className="pilha pilha--densa">
                        {g.secoes.map((secao, i) => (
                          <a key={secao.titulo} href={`#secao-${i}`} className="linha"
                             style={{ gap: '0.5rem' }}>
                            <span className="passo__marca">{i + 1}</span>
                            <span style={{ flex: 1, minWidth: 0, fontSize: '0.88rem' }}>
                              {secao.titulo}
                            </span>
                          </a>
                        ))}
                      </div>
                    </nav>
                  </Secao>

                  <Secao titulo="Quem escreveu">
                    <div className="cartao">
                      {g.autorAtletica ? (
                        <Link to={`/a/${g.autorAtletica.slug}`} className="linha"
                              style={{ color: 'inherit', marginBottom: '0.6rem' }}>
                          <Brasao atletica={g.autorAtletica} tamanho="m" />
                          <div style={{ minWidth: 0 }}>
                            <strong>{g.autorAtletica.nome}</strong>
                            <div className="fraco">{g.autorNome}</div>
                          </div>
                        </Link>
                      ) : (
                        <div className="fraco" style={{ marginBottom: '0.6rem' }}>
                          Guia da plataforma
                        </div>
                      )}
                      <hr className="divisor" />
                      <div className="linha entre" style={{ marginBottom: '0.35rem' }}>
                        <span className="fraco">Leitura</span>
                        <span>{g.minutosDeLeitura} min</span>
                      </div>
                      <div className="linha entre" style={{ marginBottom: '0.35rem' }}>
                        <span className="fraco">Salvamentos</span>
                        <span>{g.salvamentos}</span>
                      </div>
                      <div className="linha entre">
                        <span className="fraco">Atualizado</span>
                        <span>{quando(g.atualizadoEm)}</span>
                      </div>
                    </div>
                  </Secao>

                  <Secao titulo="Colocar em prática">
                    <div className="pilha pilha--densa">
                      <Link to={`/hub/${slug}/projetos/novo`}
                            className="cartao cartao--clicavel cartao--compacto linha">
                        <Icone nome="projetos" tamanho={17} />
                        <span style={{ flex: 1, minWidth: 0 }}>Criar projeto do zero guiado</span>
                        <Icone nome="direita" tamanho={14} />
                      </Link>
                      <Link to={`/hub/${slug}/conhecimento/modelos`}
                            className="cartao cartao--clicavel cartao--compacto linha">
                        <Icone nome="modelos" tamanho={17} />
                        <span style={{ flex: 1, minWidth: 0 }}>Usar um modelo pronto</span>
                        <Icone nome="direita" tamanho={14} />
                      </Link>
                      <Link to={`/hub/${slug}/rede/ajuda?novo=1`}
                            className="cartao cartao--clicavel cartao--compacto linha">
                        <Icone nome="ajuda" tamanho={17} />
                        <span style={{ flex: 1, minWidth: 0 }}>Perguntar o que ficou faltando</span>
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
