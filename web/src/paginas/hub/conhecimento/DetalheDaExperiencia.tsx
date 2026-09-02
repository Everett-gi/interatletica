import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Experiencia } from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, numero } from '../../../formatos'
import { AREA } from '../rede/PedidosDeAjuda'

/**
 * Uma experiência, nas quatro colunas que a tornam aproveitável.
 *
 * <p>A do meio — <em>o que não funcionou</em> — é a mais valiosa e a que
 * quase nunca é escrita. Relatório que só lista vitória é propaganda; o que
 * ajuda a próxima atlética é saber que abrir 500 vagas de uma vez esgotou em
 * quatro horas e sobrou frustração.</p>
 */
export function DetalheDaExperiencia() {
  const { slug = '', id = '' } = useParams()
  const experiencia = useBusca<Experiencia | null>(() => Dados.experiencia(id), [id])

  return (
    <div>
      <Conteudo busca={experiencia} esqueleto={<Esqueleto altura="22rem" />}>
        {(e) => {
          if (!e) {
            return (
              <EstadoVazio icone="experiencias" titulo="Experiência não encontrada">
                <Link to={`/hub/${slug}/conhecimento/experiencias`}
                      className="botao botao--discreto">
                  Voltar às experiências
                </Link>
              </EstadoVazio>
            )
          }

          return (
            <>
              <CabecalhoDePagina
                titulo={e.titulo}
                descricao={e.contexto}
                trilha={[
                  { rotulo: 'Conhecimento', para: `/hub/${slug}/conhecimento` },
                  { rotulo: 'Experiências',
                    para: `/hub/${slug}/conhecimento/experiencias` },
                  { rotulo: e.titulo },
                ]}
                etiqueta={<span className="etiqueta">{AREA[e.area]}</span>}
              />

              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Quando" icone="calendario" valor={e.quando} />
                <Metrica
                  rotulo="Custo" icone="financeiro"
                  valor={e.custo === null ? '—' : dinheiro(e.custo)}
                  detalhe={e.custo === null ? 'sem custo direto' : undefined}
                />
                <Metrica
                  rotulo="Público" icone="membros"
                  valor={e.publico === null ? '—' : numero(e.publico)}
                />
                <Metrica rotulo="Acharam útil" icone="certo" valor={e.util} />
              </div>

              <div className="detalhe">
                <div>
                  <Secao titulo="O que funcionou">
                    <Lista itens={e.funcionou} icone="certo" cor="var(--sucesso)"
                           vazio="Nada registrado como acerto." />
                  </Secao>

                  <Secao
                    titulo="O que não funcionou"
                    descricao="A parte mais útil do relato — e a que quase nunca é escrita."
                  >
                    <Lista itens={e.naoFuncionou} icone="alerta" cor="var(--alerta)"
                           vazio="Nenhum problema registrado." />
                  </Secao>

                  <Secao titulo="O que faríamos diferente">
                    <Lista itens={e.fariaDiferente} icone="transicao" cor="var(--acento)"
                           vazio="Nenhuma recomendação registrada." />
                  </Secao>
                </div>

                <div>
                  <Secao titulo="Quem viveu isso">
                    <Link to={`/a/${e.atletica.slug}`} className="cartao cartao--clicavel">
                      <div className="linha linha--topo">
                        <Brasao atletica={e.atletica} tamanho="g" />
                        <div style={{ minWidth: 0 }}>
                          <strong>{e.atletica.nome}</strong>
                          <div className="fraco">{e.atletica.instituicao}</div>
                          <div className="fraco">{e.atletica.cidade}/{e.atletica.uf}</div>
                        </div>
                      </div>
                    </Link>
                  </Secao>

                  <Secao titulo="Aproveitar">
                    <div className="pilha pilha--densa">
                      <Link to={`/hub/${slug}/projetos/novo`}
                            className="cartao cartao--clicavel cartao--compacto linha">
                        <Icone nome="projetos" tamanho={17} />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          Começar projeto com este roteiro
                        </span>
                        <Icone nome="direita" tamanho={14} />
                      </Link>
                      <Link to={`/hub/${slug}/rede/ajuda?novo=1`}
                            className="cartao cartao--clicavel cartao--compacto linha">
                        <Icone nome="ajuda" tamanho={17} />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          Perguntar mais sobre isso
                        </span>
                        <Icone nome="direita" tamanho={14} />
                      </Link>
                    </div>
                  </Secao>

                  <div className="aviso">
                    <strong>Por que isto existe</strong>
                    <p className="fraco" style={{ margin: '0.3rem 0 0' }}>
                      Uma atlética não precisa descobrir sozinha o que outra já
                      aprendeu. Cada erro registrado aqui é um erro que outra
                      diretoria não vai pagar.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function Lista({ itens, icone, cor, vazio }: {
  itens: string[]
  icone: 'certo' | 'alerta' | 'transicao'
  cor: string
  vazio: string
}) {
  if (itens.length === 0) {
    return <p className="fraco">{vazio}</p>
  }
  return (
    <div className="cartao">
      <div className="pilha pilha--densa">
        {itens.map((item) => (
          <div key={item} className="linha linha--topo" style={{ gap: '0.55rem' }}>
            <span style={{ color: cor, marginTop: '0.1rem', flexShrink: 0 }}>
              <Icone nome={icone} tamanho={17} />
            </span>
            <span style={{ flex: 1 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
