import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type {
  CategoriaDePatrimonio,
  EstadoDoItem,
  ItemDePatrimonio,
} from '../../../api/tipos-gestao'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Gaveta,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, quando } from '../../../formatos'
import { corDerivada } from '../../../ui/tema'

const CATEGORIA: Record<CategoriaDePatrimonio, string> = {
  ESPORTIVO: 'Esportivo',
  UNIFORME: 'Uniformes',
  ELETRONICO: 'Eletrônicos',
  MOBILIARIO: 'Mobiliário',
  OUTRO: 'Outros',
}

const ESTADO: Record<EstadoDoItem, { rotulo: string; classe: string }> = {
  NOVO: { rotulo: 'novo', classe: 'etiqueta--sucesso' },
  BOM: { rotulo: 'bom', classe: '' },
  DESGASTADO: { rotulo: 'desgastado', classe: 'etiqueta--alerta' },
  DANIFICADO: { rotulo: 'danificado', classe: 'etiqueta--perigo' },
  BAIXADO: { rotulo: 'baixado', classe: 'etiqueta--perigo' },
}

type Filtro = 'TODOS' | CategoriaDePatrimonio

/**
 * O inventário (§29).
 *
 * <p>Abre pelo resumo por categoria, e não pela lista de 124 itens. A lista
 * existe, mas depois — quem entra aqui geralmente quer saber "temos bola de
 * futsal?" ou "quanto vale o que a atlética tem?", e nenhuma das duas se
 * responde rolando uma tabela.</p>
 *
 * <p>O detalhe abre em gaveta, e não em página: consultar onde está a caixa
 * de som não deve custar sair da lista e voltar.</p>
 */
export function Patrimonio() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [aberto, setAberto] = useState<ItemDePatrimonio | null>(null)

  const itens = useBusca<ItemDePatrimonio[]>(() => Dados.patrimonio(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Patrimônio"
        descricao="O que a atlética tem, onde está e com quem. É o inventário que a próxima gestão recebe."
        acoes={
          <button className="botao" disabled
                  title="Cadastro de item chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Novo item
          </button>
        }
      />

      <Conteudo busca={itens} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="patrimonio" titulo="O inventário está vazio">
                <p className="fraco">
                  Registre bolas, uniformes e equipamentos. Sem inventário, o que
                  se perde na troca de gestão não é o item — é saber que ele existia.
                </p>
              </EstadoVazio>
            )
          }

          const total = lista.reduce((s, i) => s + i.quantidade, 0)
          const valor = lista.reduce((s, i) => s + (i.valorEstimado ?? 0), 0)
          const paraBaixa = lista.filter(
            (i) => i.estado === 'DANIFICADO' || i.estado === 'BAIXADO')

          const contar = (categoria: CategoriaDePatrimonio) =>
            lista.filter((i) => i.categoria === categoria)
              .reduce((s, i) => s + i.quantidade, 0)

          const visiveis = filtro === 'TODOS'
            ? lista
            : lista.filter((i) => i.categoria === filtro)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Itens no total" icone="patrimonio" valor={total}
                         detalhe={`${lista.length} registros`} />
                <Metrica rotulo="Valor estimado" icone="financeiro"
                         valor={dinheiro(valor)} />
                <Metrica rotulo="Categorias" icone="grade"
                         valor={new Set(lista.map((i) => i.categoria)).size} />
                <Metrica
                  rotulo="Precisam de baixa" icone="alerta"
                  valor={paraBaixa.reduce((s, i) => s + i.quantidade, 0)}
                  cor={paraBaixa.length > 0 ? 'var(--alerta)' : undefined}
                  detalhe={paraBaixa.length > 0 ? 'danificados ou fora de uso' : 'tudo em ordem'}
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Categorias"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todos', contagem: total },
                    ...(Object.keys(CATEGORIA) as CategoriaDePatrimonio[])
                      .filter((c) => contar(c) > 0)
                      .map((c) => ({
                        valor: c as Filtro,
                        rotulo: CATEGORIA[c],
                        contagem: contar(c),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade">
                  {visiveis.map((item) => (
                    <button
                      key={item.id}
                      className="cartao cartao--clicavel"
                      style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer' }}
                      onClick={() => setAberto(item)}
                    >
                      <div
                        style={{
                          height: '4.2rem',
                          borderRadius: 'var(--raio-m)',
                          background: corDerivada(item.nome),
                          display: 'grid',
                          placeItems: 'center',
                          color: '#fff',
                          marginBottom: '0.7rem',
                        }}
                        aria-hidden="true"
                      >
                        <Icone nome="patrimonio" tamanho={24} />
                      </div>
                      <div className="linha entre" style={{ marginBottom: '0.2rem' }}>
                        <strong style={{ minWidth: 0 }}>{item.nome}</strong>
                        <span className={`etiqueta ${ESTADO[item.estado].classe}`}>
                          {ESTADO[item.estado].rotulo}
                        </span>
                      </div>
                      <div className="fraco">
                        {item.quantidade} unidades · {CATEGORIA[item.categoria]}
                      </div>
                      {item.localizacao ? (
                        <div className="fraco">{item.localizacao}</div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </Secao>

              {aberto ? (
                <Gaveta titulo={aberto.nome} aoFechar={() => setAberto(null)}>
                  <div
                    style={{
                      height: '7rem',
                      borderRadius: 'var(--raio)',
                      background: corDerivada(aberto.nome),
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      marginBottom: '1rem',
                    }}
                    aria-hidden="true"
                  >
                    <Icone nome="patrimonio" tamanho={34} />
                  </div>

                  <div className="pilha pilha--densa">
                    <Campo rotulo="Quantidade" valor={`${aberto.quantidade} unidades`} />
                    <Campo rotulo="Categoria" valor={CATEGORIA[aberto.categoria]} />
                    <Campo rotulo="Estado" valor={ESTADO[aberto.estado].rotulo} />
                    <Campo rotulo="Localização" valor={aberto.localizacao ?? '—'} />
                    <Campo rotulo="Responsável" valor={aberto.responsavelNome ?? '—'} />
                    <Campo
                      rotulo="Valor estimado"
                      valor={aberto.valorEstimado === null
                        ? '—' : dinheiro(aberto.valorEstimado)}
                    />
                    <Campo
                      rotulo="Adquirido"
                      valor={aberto.adquiridoEm ? quando(aberto.adquiridoEm) : '—'}
                    />
                  </div>

                  {aberto.observacao ? (
                    <div className="aviso aviso--alerta" style={{ marginTop: '1rem' }}>
                      {aberto.observacao}
                    </div>
                  ) : null}
                </Gaveta>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="linha entre" style={{ borderBottom: '1px solid var(--borda)',
                                          paddingBottom: '0.45rem' }}>
      <span className="fraco">{rotulo}</span>
      <span style={{ fontWeight: 550, textAlign: 'right' }}>{valor}</span>
    </div>
  )
}
