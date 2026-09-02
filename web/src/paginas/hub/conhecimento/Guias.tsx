import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { AreaDeConhecimento, Guia } from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { AREA } from '../rede/PedidosDeAjuda'

type Filtro = 'TODAS' | AreaDeConhecimento

/**
 * A base de conhecimento (§37).
 *
 * <p>Guias escritos por atléticas, para atléticas. O que separa um guia útil
 * de um texto genérico é o número: "contrate a arbitragem com 90 dias, porque
 * com 45 sobra um fornecedor e ele sabe disso" resolve; "planeje com
 * antecedência" não resolve nada.</p>
 */
export function Guias() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [termo, setTermo] = useState('')

  const guias = useBusca<Guia[]>(() => Dados.guias(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Base de conhecimento"
        descricao="O que outras atléticas aprenderam, escrito para ser aproveitado."
        acoes={
          <>
            <Link to={`/hub/${slug}/conhecimento/modelos`} className="botao botao--discreto">
              Modelos
            </Link>
            <Link to={`/hub/${slug}/conhecimento/experiencias`}
                  className="botao botao--discreto">
              Experiências
            </Link>
          </>
        }
      />

      <div className="barra-de-filtros">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por assunto"
          aria-label="Buscar guias"
        />
      </div>

      <Conteudo
        busca={guias}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="11rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="guias" titulo="Nenhum guia publicado ainda">
                <p className="fraco">
                  Escreva o primeiro sobre algo que a sua atlética já domina.
                </p>
              </EstadoVazio>
            )
          }

          const alvo = termo.trim().toLowerCase()
          const visiveis = lista
            .filter((g) => filtro === 'TODAS' || g.area === filtro)
            .filter((g) => alvo === '' ||
              `${g.titulo} ${g.resumo}`.toLowerCase().includes(alvo))
            .sort((a, b) => b.util - a.util)

          const contar = (a: AreaDeConhecimento) =>
            lista.filter((g) => g.area === a).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Guias" icone="guias" valor={lista.length} />
                <Metrica rotulo="Áreas cobertas" icone="grade"
                         valor={new Set(lista.map((g) => g.area)).size} />
                <Metrica rotulo="Marcados como úteis" icone="certo"
                         valor={lista.reduce((s, g) => s + g.util, 0)} />
                <Metrica rotulo="Salvamentos" icone="documentos"
                         valor={lista.reduce((s, g) => s + g.salvamentos, 0)} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Áreas do conhecimento"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(AREA) as AreaDeConhecimento[])
                      .filter((a) => contar(a) > 0)
                      .map((a) => ({
                        valor: a as Filtro,
                        rotulo: AREA[a],
                        contagem: contar(a),
                      })),
                  ]}
                />
              </div>

              <Secao>
                {visiveis.length === 0 ? (
                  <EstadoVazio icone="guias" titulo="Nenhum guia com esse termo">
                    <p className="fraco">
                      Se ninguém escreveu sobre isso ainda, pergunte na seção de
                      pedidos de ajuda — a resposta pode virar o primeiro guia.
                    </p>
                    <Link to={`/hub/${slug}/rede/ajuda?novo=1`} className="botao">
                      Fazer uma pergunta
                    </Link>
                  </EstadoVazio>
                ) : (
                  <div className="grade grade--larga">
                    {visiveis.map((g) => (
                      <Link
                        key={g.id}
                        to={`/hub/${slug}/conhecimento/guias/${g.id}`}
                        className="cartao cartao--clicavel"
                      >
                        <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                          <span className="etiqueta">{AREA[g.area]}</span>
                          <span className="linha fraco" style={{ gap: '0.3rem' }}>
                            <Icone nome="relogio" tamanho={13} />
                            {g.minutosDeLeitura} min
                          </span>
                        </div>

                        <h3 style={{ marginBottom: '0.3rem' }}>{g.titulo}</h3>
                        <p className="fraco" style={{ marginBottom: '0.9rem' }}>
                          {g.resumo}
                        </p>

                        <div className="linha entre">
                          {g.autorAtletica ? (
                            <div className="linha" style={{ gap: '0.4rem', minWidth: 0 }}>
                              <Brasao atletica={g.autorAtletica} tamanho="p" />
                              <span className="fraco">{g.autorAtletica.nome}</span>
                            </div>
                          ) : (
                            <span className="fraco">plataforma</span>
                          )}
                          <span className="linha fraco" style={{ gap: '0.3rem' }}>
                            <Icone nome="certo" tamanho={13} /> {g.util}
                          </span>
                        </div>

                        <div className="fraco" style={{ marginTop: '0.4rem' }}>
                          atualizado {quando(g.atualizadoEm)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
