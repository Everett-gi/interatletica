import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { PrestacaoDeContas as Prestacao } from '../../../api/tipos-financeiro'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Gaveta, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * A prestação de contas (§28).
 *
 * <p>Um mês fechado cabe em uma página: receitas, despesas, saldo e os
 * comprovantes anexados. A assembleia quer saber quanto custou a Calourada,
 * não quanto custou cada saco de gelo — o detalhamento existe, mas não é a
 * primeira coisa que aparece.</p>
 *
 * <p>A visibilidade é escolha da atlética (§85), e a etiqueta em cada mês
 * mostra o que está exposto. Transparência interna reduz pela metade a
 * pergunta "para onde foi o dinheiro da camisa".</p>
 */
export function PrestacaoDeContas() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [aberta, setAberta] = useState<Prestacao | null>(null)

  const prestacoes = useBusca<Prestacao[]>(() => Dados.prestacoes(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Prestação de contas"
        descricao="O fechamento de cada mês, com o que dá para mostrar aos membros e à rede."
        trilha={[
          { rotulo: 'Financeiro', para: `/hub/${slug}/financeiro` },
          { rotulo: 'Prestação de contas' },
        ]}
        acoes={diretor ? (
          <button className="botao" disabled title="Fechamento chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Fechar o mês
          </button>
        ) : undefined}
      />

      <Conteudo busca={prestacoes} esqueleto={<Esqueleto altura="18rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="prestacao" titulo="Nenhum mês fechado ainda">
                <p className="fraco">
                  A prestação atrasada nunca é uma só: quando você percebe, são
                  quatro meses e ninguém lembra do que foi cada Pix. Fechar um mês
                  sem movimento leva dois minutos e mantém o hábito.
                </p>
              </EstadoVazio>
            )
          }

          const receitas = lista.reduce((s, p) => s + p.receitas, 0)
          const despesas = lista.reduce((s, p) => s + p.despesas, 0)
          const publicas = lista.filter((p) => p.publicaParaTodos).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Meses fechados" icone="prestacao" valor={lista.length} />
                <Metrica rotulo="Receitas no período" icone="receitas"
                         valor={dinheiro(receitas)} cor="var(--sucesso)" />
                <Metrica rotulo="Despesas no período" icone="despesas"
                         valor={dinheiro(despesas)} />
                <Metrica rotulo="Abertas ao público" icone="explorar" valor={publicas}
                         detalhe={`${lista.length - publicas} só para membros`} />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {lista.map((p) => (
                    <button
                      key={p.id}
                      className="cartao cartao--clicavel"
                      style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer' }}
                      onClick={() => setAberta(p)}
                    >
                      <div className="linha entre" style={{ marginBottom: '0.7rem' }}>
                        <strong style={{ fontSize: '1.02rem' }}>{p.rotulo}</strong>
                        <span className={`etiqueta ${
                          p.publicaParaTodos ? 'etiqueta--sucesso'
                            : p.publicaParaMembros ? 'etiqueta--acento' : ''}`}>
                          {p.publicaParaTodos ? 'pública'
                            : p.publicaParaMembros ? 'membros' : 'diretoria'}
                        </span>
                      </div>

                      <div className="pilha pilha--densa">
                        <div className="linha entre">
                          <span className="fraco">Receitas</span>
                          <span className="dinheiro dinheiro--positivo">
                            {dinheiro(p.receitas)}
                          </span>
                        </div>
                        <div className="linha entre">
                          <span className="fraco">Despesas</span>
                          <span className="dinheiro dinheiro--negativo">
                            {dinheiro(p.despesas)}
                          </span>
                        </div>
                        <hr className="divisor" style={{ margin: '0.35rem 0' }} />
                        <div className="linha entre">
                          <strong>Saldo</strong>
                          <strong className={`dinheiro dinheiro--${
                            p.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                            {dinheiro(p.saldo)}
                          </strong>
                        </div>
                      </div>

                      <div className="linha entre" style={{ marginTop: '0.8rem' }}>
                        <span className="fraco">
                          {p.aprovadaEm ? `aprovada ${quando(p.aprovadaEm)}` : 'em revisão'}
                        </span>
                        <span className="fraco">
                          {p.documentos.length}{' '}
                          {p.documentos.length === 1 ? 'anexo' : 'anexos'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </Secao>

              {aberta ? (
                <Gaveta
                  titulo={`Prestação de contas — ${aberta.rotulo}`}
                  aoFechar={() => setAberta(null)}
                >
                  <div className="cartao" style={{ marginBottom: '1rem' }}>
                    <div className="linha entre" style={{ marginBottom: '0.35rem' }}>
                      <span className="fraco">Receitas</span>
                      <span className="dinheiro dinheiro--positivo">
                        {dinheiro(aberta.receitas, true)}
                      </span>
                    </div>
                    <div className="linha entre" style={{ marginBottom: '0.35rem' }}>
                      <span className="fraco">Despesas</span>
                      <span className="dinheiro dinheiro--negativo">
                        {dinheiro(aberta.despesas, true)}
                      </span>
                    </div>
                    <hr className="divisor" />
                    <div className="linha entre">
                      <strong>Saldo do mês</strong>
                      <strong className={`dinheiro dinheiro--${
                        aberta.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                        {dinheiro(aberta.saldo, true)}
                      </strong>
                    </div>
                  </div>

                  <h3>Detalhamento</h3>
                  <div className="pilha pilha--densa" style={{ marginBottom: '1.2rem' }}>
                    {aberta.linhas.map((linha) => (
                      <div key={linha.descricao} className="linha entre"
                           style={{ borderBottom: '1px solid var(--borda)',
                                    paddingBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.89rem' }}>{linha.descricao}</span>
                        <span className={`dinheiro dinheiro--${
                          linha.natureza === 'RECEITA' ? 'positivo' : 'negativo'}`}>
                          {linha.natureza === 'RECEITA' ? '+' : '−'}
                          {dinheiro(linha.valor)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {aberta.documentos.length > 0 ? (
                    <>
                      <h3>Comprovantes</h3>
                      <div className="pilha pilha--densa">
                        {aberta.documentos.map((doc) => (
                          <div key={doc} className="cartao cartao--compacto linha">
                            <Icone nome="documentos" tamanho={16} />
                            <span style={{ fontSize: '0.88rem' }}>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}

                  <div className="aviso" style={{ marginTop: '1.2rem' }}>
                    <div className="linha" style={{ gap: '0.5rem' }}>
                      <Icone nome="info" tamanho={16} />
                      <span className="fraco">
                        {aberta.publicaParaTodos
                          ? 'Este mês está aberto a qualquer pessoa, inclusive sem conta.'
                          : aberta.publicaParaMembros
                            ? 'Visível para quem tem vínculo ativo com a atlética.'
                            : 'Visível apenas para a diretoria.'}
                      </span>
                    </div>
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
