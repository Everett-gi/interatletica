import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Produto } from '../../../api/tipos-mercado'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Gaveta, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro } from '../../../formatos'
import { corDerivada } from '../../../ui/tema'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * A vitrine da atlética (§48).
 *
 * <p><strong>Vitrine, não caixa.</strong> A página mostra o que a atlética
 * oferece, quanto custa, que tamanhos existem e como combinar — e para por
 * aí. A plataforma não processa pagamento, não emite cobrança e não guarda
 * dado de cartão.</p>
 *
 * <p>Isso é decisão de produto, não limitação técnica: receber dinheiro de
 * estudante cria responsabilidade fiscal e de reembolso que uma atlética não
 * tem como assumir por meio de um app de terceiros — e que a plataforma não
 * quer assumir por ela. O catálogo resolve o problema real, que é a pergunta
 * "quanto custa a camisa e tem meu tamanho?" repetida no direct.</p>
 */
export function Loja() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [categoria, setCategoria] = useState('TODAS')
  const [aberto, setAberto] = useState<Produto | null>(null)

  const produtos = useBusca<Produto[]>(() => Dados.produtos(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Loja"
        descricao="O catálogo da atlética. A negociação é combinada direto com a diretoria."
        acoes={diretor ? (
          <button className="botao" disabled title="Cadastro chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Novo produto
          </button>
        ) : undefined}
      />

      <Conteudo
        busca={produtos}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="16rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="loja" titulo="Nenhum produto no catálogo">
                <p className="fraco">
                  Camisa, moletom e caneca são o que mais some no direct. Ter o
                  catálogo com preço e estoque à vista responde a pergunta antes
                  de ela chegar.
                </p>
              </EstadoVazio>
            )
          }

          const categorias = [...new Set(lista.map((p) => p.categoria))]
          const visiveis = categoria === 'TODAS'
            ? lista
            : lista.filter((p) => p.categoria === categoria)
          const emEstoque = lista.filter((p) => p.disponivel).length
          const pecas = lista.reduce(
            (s, p) => s + p.variantes.reduce((t, v) => t + v.estoque, 0), 0)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Produtos" icone="loja" valor={lista.length} />
                <Metrica rotulo="Disponíveis" icone="certo" valor={emEstoque} />
                <Metrica rotulo="Peças em estoque" icone="patrimonio" valor={pecas} />
                <Metrica rotulo="Categorias" icone="grade" valor={categorias.length} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Categorias da loja"
                  selecionado={categoria}
                  aoSelecionar={setCategoria}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...categorias.map((c) => ({
                      valor: c,
                      rotulo: c,
                      contagem: lista.filter((p) => p.categoria === c).length,
                    })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((p) => {
                    const estoque = p.variantes.reduce((s, v) => s + v.estoque, 0)
                    return (
                      <button
                        key={p.id}
                        className="cartao cartao--clicavel"
                        style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer' }}
                        onClick={() => setAberto(p)}
                      >
                        <div
                          style={{
                            height: '9rem',
                            borderRadius: 'var(--raio-m)',
                            background: corDerivada(p.nome),
                            display: 'grid',
                            placeItems: 'center',
                            color: '#fff',
                            marginBottom: '0.8rem',
                            opacity: p.disponivel ? 1 : 0.45,
                          }}
                          aria-hidden="true"
                        >
                          <Icone nome="loja" tamanho={36} />
                        </div>

                        <div className="linha entre" style={{ marginBottom: '0.2rem' }}>
                          <strong>{p.nome}</strong>
                          <span className="numero-medio">{dinheiro(p.preco, true)}</span>
                        </div>
                        <p className="fraco" style={{ marginBottom: '0.7rem' }}>
                          {p.descricao}
                        </p>

                        <div className="linha entre">
                          <div className="chips">
                            {p.variantes.map((v) => (
                              <span key={v.rotulo}
                                    className={`etiqueta ${
                                      v.estoque === 0 ? '' : 'etiqueta--acento'}`}
                                    style={v.estoque === 0
                                      ? { opacity: 0.5, textDecoration: 'line-through' }
                                      : undefined}>
                                {v.rotulo}
                              </span>
                            ))}
                          </div>
                          <span className={`etiqueta ${
                            p.disponivel ? 'etiqueta--sucesso' : 'etiqueta--perigo'}`}>
                            {p.disponivel ? `${estoque} em estoque` : 'esgotado'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Secao>

              <div className="aviso" style={{ marginTop: '1.5rem' }}>
                <div className="linha" style={{ gap: '0.55rem' }}>
                  <Icone nome="info" tamanho={17} />
                  <div>
                    <strong>A plataforma não vende nem cobra</strong>
                    <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                      Este catálogo mostra o que existe e por quanto. Pagamento,
                      reserva e entrega são combinados direto com a diretoria,
                      pelos canais que a atlética já usa.
                    </p>
                  </div>
                </div>
              </div>

              {aberto ? (
                <Gaveta titulo={aberto.nome} aoFechar={() => setAberto(null)}>
                  <div
                    style={{
                      height: '11rem',
                      borderRadius: 'var(--raio)',
                      background: corDerivada(aberto.nome),
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      marginBottom: '1rem',
                    }}
                    aria-hidden="true"
                  >
                    <Icone nome="loja" tamanho={44} />
                  </div>

                  <div className="linha entre" style={{ marginBottom: '0.7rem' }}>
                    <span className="etiqueta">{aberto.categoria}</span>
                    <span className="numero-grande">{dinheiro(aberto.preco, true)}</span>
                  </div>

                  <p className="suave">{aberto.descricao}</p>

                  <h3>Tamanhos e estoque</h3>
                  <div className="pilha pilha--densa" style={{ marginBottom: '1.2rem' }}>
                    {aberto.variantes.map((v) => (
                      <div key={v.rotulo} className="linha entre"
                           style={{ borderBottom: '1px solid var(--borda)',
                                    paddingBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 550 }}>{v.rotulo}</span>
                        <span className={v.estoque === 0 ? 'fraco' : ''}>
                          {v.estoque === 0 ? 'esgotado' : `${v.estoque} disponíveis`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="aviso aviso--sucesso">
                    <strong>Como adquirir</strong>
                    <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                      {aberto.comoAdquirir}
                    </p>
                  </div>
                </Gaveta>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
