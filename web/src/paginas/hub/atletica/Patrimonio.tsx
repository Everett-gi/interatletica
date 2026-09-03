import { useState, type FormEvent } from 'react'
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
import { dinheiro, plural, quando } from '../../../formatos'
import { corDerivada } from '../../../ui/tema'
import { useSessao } from '../../../sessao/SessaoContexto'

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
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [aberto, setAberto] = useState<ItemDePatrimonio | null>(null)
  const [cadastrando, setCadastrando] = useState(false)

  const itens = useBusca<ItemDePatrimonio[]>(() => Dados.patrimonio(slug), [slug])

  /** Troca um item na lista e, se for o aberto, também na gaveta. */
  const substituir = (item: ItemDePatrimonio) => {
    itens.definir((itens.dados ?? []).map((x) => (x.id === item.id ? item : x)))
    setAberto((atual) => (atual && atual.id === item.id ? item : atual))
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Patrimônio"
        descricao="O que a atlética tem, onde está e com quem. É o inventário que a próxima gestão recebe."
        acoes={diretor ? (
          <button className="botao" onClick={() => setCadastrando((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Novo item
          </button>
        ) : undefined}
      />

      {cadastrando ? (
        <FormularioDeItem
          slug={slug}
          aoCadastrar={(item) => {
            itens.definir([item, ...(itens.dados ?? [])])
            setCadastrando(false)
          }}
          aoCancelar={() => setCadastrando(false)}
        />
      ) : null}

      <Conteudo busca={itens} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="patrimonio" titulo="O inventário está vazio">
                <p className="fraco">
                  Registre bolas, uniformes e equipamentos. Sem inventário, o que
                  se perde na troca de gestão não é o item — é saber que ele existia.
                </p>
                {diretor && !cadastrando ? (
                  <button className="botao" onClick={() => setCadastrando(true)}>
                    <Icone nome="mais" tamanho={16} /> Registrar o primeiro item
                  </button>
                ) : null}
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
                         detalhe={plural(lista.length, 'registro')} />
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

                  {/* O estado é o campo que envelhece: a bola nova de março
                      está desgastada em outubro, e é a conferência anual que
                      alimenta isso. Trocar aqui evita ter que abrir um
                      formulário de edição inteiro para mudar uma palavra. */}
                  {diretor ? (
                    <label className="campo" style={{ marginTop: '1rem' }}>
                      <span className="campo__rotulo">Mudar o estado</span>
                      <select
                        value={aberto.estado}
                        onChange={(e) => {
                          void Dados.mudarEstadoDoItem(
                            aberto.id, e.target.value as EstadoDoItem,
                          ).then((item) => { if (item) substituir(item) })
                        }}
                      >
                        {(Object.keys(ESTADO) as EstadoDoItem[]).map((x) => (
                          <option key={x} value={x}>{ESTADO[x].rotulo}</option>
                        ))}
                      </select>
                    </label>
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

/**
 * Cadastrar um item.
 *
 * <p>Só nome e categoria são obrigatórios. Inventário que exige nota fiscal
 * e foto para aceitar uma bola é inventário que fica vazio — e o que se
 * perde na troca de gestão não é o item, é saber que ele existia.</p>
 */
function FormularioDeItem({ slug, aoCadastrar, aoCancelar }: {
  slug: string
  aoCadastrar: (item: ItemDePatrimonio) => void
  aoCancelar: () => void
}) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<CategoriaDePatrimonio>('ESPORTIVO')
  const [quantidade, setQuantidade] = useState('1')
  const [estadoDoItem, setEstadoDoItem] = useState<EstadoDoItem>('NOVO')
  const [local, setLocal] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [valor, setValor] = useState('')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const item = await Dados.cadastrarPatrimonio(slug, {
      nome: nome.trim(),
      categoria,
      quantidade: Number(quantidade) || 1,
      estado: estadoDoItem,
      localizacao: local.trim() === '' ? null : local.trim(),
      responsavelNome: responsavel.trim() === '' ? null : responsavel.trim(),
      valorEstimado: valor === '' ? null : Number(valor),
      observacao: observacao.trim() === '' ? null : observacao.trim(),
    })
    setSalvando(false)
    aoCadastrar(item)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Novo item</h3>
      <p className="fraco">
        Registre agora, mesmo sem valor nem foto. O que falta se completa
        depois; o que não foi registrado some na troca de gestão.
      </p>

      <label className="campo">
        <span className="campo__rotulo">O que é</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)}
               required maxLength={120} autoFocus
               placeholder="Bola de futsal Penalty" />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Categoria</span>
          <select value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaDePatrimonio)}>
            {(Object.keys(CATEGORIA) as CategoriaDePatrimonio[]).map((c) => (
              <option key={c} value={c}>{CATEGORIA[c]}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Estado</span>
          <select value={estadoDoItem}
                  onChange={(e) => setEstadoDoItem(e.target.value as EstadoDoItem)}>
            {(Object.keys(ESTADO) as EstadoDoItem[]).map((x) => (
              <option key={x} value={x}>{ESTADO[x].rotulo}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Quantidade</span>
          <input type="number" min={1} value={quantidade} required
                 onChange={(e) => setQuantidade(e.target.value)} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Valor estimado (opcional)</span>
          <input type="number" min={0} value={valor}
                 onChange={(e) => setValor(e.target.value)} placeholder="180" />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Onde fica</span>
          <input value={local} onChange={(e) => setLocal(e.target.value)}
                 maxLength={120} placeholder="Armário da sala da atlética" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Com quem</span>
          <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
                 maxLength={120} placeholder="Nome de quem guarda" />
          <span className="campo__dica">
            É a pergunta que a próxima gestão mais faz.
          </span>
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Observação (opcional)</span>
        <input value={observacao} onChange={(e) => setObservacao(e.target.value)}
               maxLength={200} placeholder="Comprada com a verba da Calourada" />
      </label>

      <div className="linha">
        <button className="botao" type="submit" disabled={salvando || !nome.trim()}>
          {salvando ? 'Cadastrando…' : 'Cadastrar item'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
