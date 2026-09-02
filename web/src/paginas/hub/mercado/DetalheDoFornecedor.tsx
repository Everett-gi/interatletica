import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type {
  AvaliacaoDeFornecedor,
  Fornecedor,
  NotasDoFornecedor,
} from '../../../api/tipos-mercado'
import { Brasao, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  Estrelas,
  Progresso,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { CATEGORIA_DE_FORNECEDOR, FAIXA } from './Fornecedores'

const CRITERIO: { chave: keyof NotasDoFornecedor; rotulo: string }[] = [
  { chave: 'qualidade', rotulo: 'Qualidade' },
  { chave: 'preco', rotulo: 'Preço' },
  { chave: 'prazo', rotulo: 'Prazo' },
  { chave: 'atendimento', rotulo: 'Atendimento' },
  { chave: 'confiabilidade', rotulo: 'Confiabilidade' },
]

interface Composicao {
  fornecedor: Fornecedor | null
  avaliacoes: AvaliacaoDeFornecedor[]
}

/**
 * A ficha de um fornecedor, com as cinco notas separadas (§41).
 *
 * <p>A média sozinha esconde o que importa. Um fornecedor com 4,2 pode ter
 * qualidade 5 e prazo 3 — e para quem tem campeonato em quarenta dias, o
 * prazo é o número que decide. Por isso os cinco critérios aparecem
 * abertos, e não só o total.</p>
 */
export function DetalheDoFornecedor() {
  const { slug = '', id = '' } = useParams()

  const busca = useBusca<Composicao>(async () => {
    const [fornecedor, avaliacoes] = await Promise.all([
      Dados.fornecedor(id),
      Dados.avaliacoesDoFornecedor(id),
    ])
    return { fornecedor, avaliacoes }
  }, [id])

  return (
    <div>
      <Conteudo busca={busca} esqueleto={<Esqueleto altura="20rem" />}>
        {({ fornecedor: f, avaliacoes }) => {
          if (!f) {
            return (
              <EstadoVazio icone="fornecedores" titulo="Fornecedor não encontrado">
                <Link to={`/hub/${slug}/mercado/fornecedores`} className="botao botao--discreto">
                  Voltar ao diretório
                </Link>
              </EstadoVazio>
            )
          }

          const pior = CRITERIO.reduce((menor, c) =>
            f.detalheDasNotas[c.chave] < f.detalheDasNotas[menor.chave] ? c : menor,
            CRITERIO[0])

          return (
            <>
              <CabecalhoDePagina
                titulo={f.nome}
                descricao={f.descricao}
                trilha={[
                  { rotulo: 'Fornecedores', para: `/hub/${slug}/mercado/fornecedores` },
                  { rotulo: f.nome },
                ]}
                etiqueta={
                  <span className="etiqueta">{CATEGORIA_DE_FORNECEDOR[f.categoria]}</span>
                }
                acoes={
                  <button className="botao" disabled
                          title="Avaliar chega com a API conectada">
                    <Icone nome="estrela" tamanho={16} /> Avaliar
                  </button>
                }
              />

              <div className="detalhe">
                <div>
                  <Secao titulo="Como a rede avalia">
                    <div className="cartao">
                      <div className="linha" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <div className="numero-grande">{f.nota.toFixed(1)}</div>
                          <Estrelas nota={f.nota} tamanho={17} />
                          <div className="fraco">{f.avaliacoes} avaliações</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="pilha pilha--densa">
                            {CRITERIO.map((c) => (
                              <div key={c.chave}>
                                <div className="linha entre"
                                     style={{ marginBottom: '0.15rem' }}>
                                  <span style={{ fontSize: '0.85rem' }}>{c.rotulo}</span>
                                  <span className="fraco">
                                    {f.detalheDasNotas[c.chave].toFixed(1)}
                                  </span>
                                </div>
                                <Progresso
                                  proporcao={f.detalheDasNotas[c.chave] / 5}
                                  tom={f.detalheDasNotas[c.chave] >= 4.5 ? 'sucesso'
                                    : f.detalheDasNotas[c.chave] < 3.5 ? 'alerta' : undefined}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {f.detalheDasNotas[pior.chave] < 4 ? (
                        <div className="aviso aviso--alerta">
                          <strong>Ponto fraco: {pior.rotulo.toLowerCase()}</strong>
                          <p className="fraco" style={{ margin: '0.2rem 0 0' }}>
                            É o critério com a menor nota. Vale combinar isso por
                            escrito antes de fechar.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </Secao>

                  <Secao
                    titulo={`Avaliações (${avaliacoes.length})`}
                    descricao="Escritas por quem contratou. Nota sem contexto não ajuda ninguém."
                  >
                    {avaliacoes.length === 0 ? (
                      <EstadoVazio icone="estrela" titulo="Nenhuma avaliação detalhada">
                        <p className="fraco">
                          A nota agregada vem de atléticas que ainda não escreveram
                          comentário. Se você já contratou, sua avaliação ajuda
                          quem vai contratar depois.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha">
                        {avaliacoes.map((a) => {
                          const media = CRITERIO.reduce(
                            (s, c) => s + a.notas[c.chave], 0) / CRITERIO.length
                          return (
                            <div key={a.id} className="cartao">
                              <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                                <div className="linha" style={{ gap: '0.5rem', minWidth: 0 }}>
                                  <Brasao atletica={a.atletica} tamanho="p" />
                                  <div style={{ minWidth: 0 }}>
                                    <strong style={{ fontSize: '0.92rem' }}>
                                      {a.atletica.nome}
                                    </strong>
                                    <div className="fraco">
                                      {a.autorNome} · {quando(a.quando)}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <Estrelas nota={media} />
                                  <div className="fraco">{media.toFixed(1)}</div>
                                </div>
                              </div>

                              {a.contexto ? (
                                <div className="etiqueta" style={{ marginBottom: '0.5rem' }}>
                                  {a.contexto}
                                </div>
                              ) : null}

                              <p className="suave" style={{ margin: 0 }}>{a.comentario}</p>

                              <hr className="divisor" />
                              <div className="chips">
                                {CRITERIO.map((c) => (
                                  <span key={c.chave} className="fraco"
                                        style={{ fontSize: '0.78rem' }}>
                                    {c.rotulo} {a.notas[c.chave]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Secao>
                </div>

                <div>
                  <Secao titulo="Contato">
                    <div className="cartao">
                      {f.contato ? (
                        <div className="linha" style={{ marginBottom: '0.5rem' }}>
                          <Icone nome="usuario" tamanho={16} />
                          <span>{f.contato}</span>
                        </div>
                      ) : null}
                      {f.site ? (
                        <div className="linha" style={{ marginBottom: '0.5rem' }}>
                          <Icone nome="externo" tamanho={16} />
                          <a href={f.site} target="_blank" rel="noreferrer"
                             style={{ wordBreak: 'break-all' }}>
                            {f.site.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      ) : null}
                      {f.cidade ? (
                        <div className="linha">
                          <Icone nome="local" tamanho={16} />
                          <span>{f.cidade}/{f.uf}</span>
                        </div>
                      ) : null}
                      <hr className="divisor" />
                      <div className="linha entre" style={{ marginBottom: '0.35rem' }}>
                        <span className="fraco">Faixa de preço</span>
                        <span>{f.faixaDePreco ? FAIXA[f.faixaDePreco] : '—'}</span>
                      </div>
                      <div className="linha entre" style={{ marginBottom: '0.35rem' }}>
                        <span className="fraco">Atende remoto</span>
                        <span>{f.atendeRemoto ? 'sim' : 'não'}</span>
                      </div>
                      <div className="linha entre">
                        <span className="fraco">Atléticas atendidas</span>
                        <strong>{f.atleticasAtendidas}</strong>
                      </div>
                    </div>
                  </Secao>

                  {f.ultimaCompra ? (
                    <div className="aviso aviso--sucesso">
                      <strong>Sua atlética já contratou</strong>
                      <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                        Última compra {quando(f.ultimaCompra)}. O histórico fica
                        no financeiro, ligado ao lançamento.
                      </p>
                    </div>
                  ) : null}

                  <Secao titulo="Comprar junto">
                    <div className="cartao">
                      <p className="fraco" style={{ marginTop: 0 }}>
                        Juntar o pedido com outras atléticas costuma render 20% a
                        30% de desconto no mesmo fornecedor.
                      </p>
                      <Link to={`/hub/${slug}/mercado/compras`}
                            className="botao botao--discreto botao--largo">
                        Ver compras coletivas
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
