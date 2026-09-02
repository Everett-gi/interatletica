import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { CategoriaDeFornecedor, Fornecedor } from '../../../api/tipos-mercado'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Estrelas,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { quando } from '../../../formatos'

export const CATEGORIA_DE_FORNECEDOR: Record<CategoriaDeFornecedor, string> = {
  UNIFORMES: 'Uniformes',
  MEDALHAS: 'Medalhas',
  TROFEUS: 'Troféus',
  IMPRESSAO: 'Impressão',
  TRANSPORTE: 'Transporte',
  ARBITRAGEM: 'Arbitragem',
  FOTOGRAFIA: 'Fotografia',
  VIDEO: 'Vídeo',
  ALIMENTACAO: 'Alimentação',
  EVENTOS: 'Estrutura de evento',
  SEGURANCA: 'Segurança',
}

export const FAIXA: Record<NonNullable<Fornecedor['faixaDePreco']>, string> = {
  BAIXA: '$',
  MEDIA: '$$',
  ALTA: '$$$',
}

type Filtro = 'TODOS' | CategoriaDeFornecedor

/**
 * O diretório de fornecedores (§40 e §41).
 *
 * <p>O valor não está no catálogo — está na avaliação. Saber que a gráfica X
 * atendeu doze atléticas e atrasou em duas é informação que nenhuma atlética
 * consegue sozinha, e é ela que evita repetir o erro que outra já pagou.
 * Por isso a nota e o número de atendimentos vêm antes do telefone.</p>
 */
export function Fornecedores() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [termo, setTermo] = useState('')

  const fornecedores = useBusca<Fornecedor[]>(() => Dados.fornecedores(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Fornecedores"
        descricao="Quem outras atléticas já contrataram, com nota, prazo e o que deu errado."
        acoes={
          <button className="botao botao--discreto" disabled
                  title="Cadastro chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Indicar fornecedor
          </button>
        }
      />

      <div className="barra-de-filtros">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, cidade ou serviço"
          aria-label="Buscar fornecedores"
        />
      </div>

      <Conteudo
        busca={fornecedores}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="12rem" />)}
          </div>
        }
      >
        {(lista) => {
          const alvo = termo.trim().toLowerCase()
          const visiveis = lista
            .filter((f) => filtro === 'TODOS' || f.categoria === filtro)
            .filter((f) => alvo === '' ||
              `${f.nome} ${f.cidade ?? ''} ${f.descricao} ${CATEGORIA_DE_FORNECEDOR[f.categoria]}`
                .toLowerCase().includes(alvo))
            .sort((a, b) => b.nota - a.nota)

          const contar = (c: CategoriaDeFornecedor) =>
            lista.filter((f) => f.categoria === c).length

          const avaliacoes = lista.reduce((s, f) => s + f.avaliacoes, 0)
          const atendimentos = lista.reduce((s, f) => s + f.atleticasAtendidas, 0)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Fornecedores" icone="fornecedores" valor={lista.length} />
                <Metrica rotulo="Avaliações" icone="estrela" valor={avaliacoes}
                         detalhe="escritas por atléticas da rede" />
                <Metrica rotulo="Atendimentos" icone="parcerias" valor={atendimentos} />
                <Metrica rotulo="Categorias" icone="grade"
                         valor={new Set(lista.map((f) => f.categoria)).size} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Categorias de fornecedor"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todos', contagem: lista.length },
                    ...(Object.keys(CATEGORIA_DE_FORNECEDOR) as CategoriaDeFornecedor[])
                      .filter((c) => contar(c) > 0)
                      .map((c) => ({
                        valor: c as Filtro,
                        rotulo: CATEGORIA_DE_FORNECEDOR[c],
                        contagem: contar(c),
                      })),
                  ]}
                />
              </div>

              {visiveis.length === 0 ? (
                <EstadoVazio icone="fornecedores" titulo="Nenhum fornecedor encontrado">
                  <p className="fraco">
                    Tente outro termo, ou peça indicação na seção de pedidos de ajuda —
                    é o caminho mais rápido para achar quem atende a sua região.
                  </p>
                  <Link to={`/hub/${slug}/rede/ajuda`} className="botao botao--discreto">
                    Pedir indicação
                  </Link>
                </EstadoVazio>
              ) : (
                <Secao>
                  <div className="grade grade--larga">
                    {visiveis.map((f) => (
                      <Link
                        key={f.id}
                        to={`/hub/${slug}/mercado/fornecedores/${f.id}`}
                        className="cartao cartao--clicavel"
                      >
                        <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                          <span className="etiqueta">
                            {CATEGORIA_DE_FORNECEDOR[f.categoria]}
                          </span>
                          {f.faixaDePreco ? (
                            <span className="fraco" title="Faixa de preço">
                              {FAIXA[f.faixaDePreco]}
                            </span>
                          ) : null}
                        </div>

                        <h3 style={{ marginBottom: '0.25rem' }}>{f.nome}</h3>

                        <div className="linha" style={{ gap: '0.45rem',
                                                        marginBottom: '0.6rem' }}>
                          <Estrelas nota={f.nota} />
                          <span style={{ fontWeight: 650 }}>{f.nota.toFixed(1)}</span>
                          <span className="fraco">({f.avaliacoes} avaliações)</span>
                        </div>

                        <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                          {f.descricao}
                        </p>

                        <div className="linha entre">
                          <span className="fraco">
                            {f.cidade ? `${f.cidade}/${f.uf}` : 'sem endereço'}
                            {f.atendeRemoto ? ' · atende remoto' : ''}
                          </span>
                          <span className="etiqueta etiqueta--acento">
                            {f.atleticasAtendidas} atléticas
                          </span>
                        </div>

                        {f.ultimaCompra ? (
                          <div className="fraco" style={{ marginTop: '0.4rem' }}>
                            sua atlética contratou {quando(f.ultimaCompra)}
                          </div>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </Secao>
              )}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
