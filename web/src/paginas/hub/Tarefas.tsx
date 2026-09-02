import { useMemo, useState, type DragEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { PrioridadeDaTarefa, StatusDaTarefa, Tarefa } from '../../api/tipos-rede'
import { Avatar, Conteudo, Esqueleto, Previa, useBusca } from '../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Secao,
  Segmentado,
} from '../../ui/pagina'
import { Icone } from '../../ui/icones'
import { quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

const COLUNAS: { status: StatusDaTarefa; titulo: string }[] = [
  { status: 'ABERTA', titulo: 'A fazer' },
  { status: 'EM_ANDAMENTO', titulo: 'Fazendo' },
  { status: 'CONCLUIDA', titulo: 'Feito' },
]

const PRIORIDADE: Record<PrioridadeDaTarefa, { rotulo: string; classe: string }> = {
  ALTA: { rotulo: 'alta', classe: 'etiqueta--perigo' },
  MEDIA: { rotulo: 'média', classe: 'etiqueta--alerta' },
  BAIXA: { rotulo: 'baixa', classe: '' },
}

type Visao = 'QUADRO' | 'LISTA'
type Filtro = 'TODAS' | 'MINHAS' | 'ATRASADAS' | 'SEMANA' | 'SEM_DONO'

/**
 * O quadro de tarefas da diretoria (§18).
 *
 * <p>Kanban por padrão, porque o problema real de uma diretoria não é "o que
 * falta" — é "quem está com o quê", e a coluna do meio é justamente a
 * informação que uma lista esconde. Mas a lista também existe: para escanear
 * prazo e responsável de trinta tarefas, ela ganha do quadro.</p>
 */
export function Tarefas() {
  const { slug = '' } = useParams()
  const [parametros] = useSearchParams()
  const { perfil } = useSessao()

  const tarefas = useBusca<Tarefa[]>(() => Dados.tarefas(slug), [slug])
  const [visao, setVisao] = useState<Visao>('QUADRO')
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<StatusDaTarefa | null>(null)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [compondo, setCompondo] = useState(parametros.get('novo') === '1')

  async function mover(id: string, status: StatusDaTarefa) {
    // Move na tela primeiro: arrastar e esperar meio segundo pelo servidor
    // faz a ficha "voltar" e parecer que o gesto falhou.
    const atuais = tarefas.dados ?? []
    tarefas.definir(atuais.map((t) => (t.id === id ? { ...t, status } : t)))
    await Dados.moverTarefa(id, status)
  }

  async function criar() {
    const titulo = novoTitulo.trim()
    if (!titulo) return
    setNovoTitulo('')
    const criada = await Dados.criarTarefa(slug, titulo, 'MEDIA')
    tarefas.definir([criada, ...(tarefas.dados ?? [])])
  }

  function aoSoltar(e: DragEvent, status: StatusDaTarefa) {
    e.preventDefault()
    setAlvo(null)
    if (arrastando) {
      void mover(arrastando, status)
      setArrastando(null)
    }
  }

  const filtradas = useMemo(() => {
    const lista = tarefas.dados ?? []
    const agora = Date.now()
    const semana = agora + 7 * 864e5

    switch (filtro) {
      case 'MINHAS':
        return lista.filter((t) => t.responsavelNome === perfil?.nome)
      case 'ATRASADAS':
        return lista.filter((t) => t.status !== 'CONCLUIDA' && t.prazo !== null
          && new Date(t.prazo).getTime() < agora)
      case 'SEMANA':
        return lista.filter((t) => t.prazo !== null
          && new Date(t.prazo).getTime() <= semana)
      case 'SEM_DONO':
        return lista.filter((t) => t.responsavelNome === null)
      default:
        return lista
    }
  }, [tarefas.dados, filtro, perfil?.nome])

  const lista = tarefas.dados ?? []
  const agora = Date.now()
  const contar = (f: Filtro) => {
    switch (f) {
      case 'MINHAS': return lista.filter((t) => t.responsavelNome === perfil?.nome).length
      case 'ATRASADAS': return lista.filter((t) => t.status !== 'CONCLUIDA'
        && t.prazo !== null && new Date(t.prazo).getTime() < agora).length
      case 'SEMANA': return lista.filter((t) => t.prazo !== null
        && new Date(t.prazo).getTime() <= agora + 7 * 864e5).length
      case 'SEM_DONO': return lista.filter((t) => t.responsavelNome === null).length
      default: return lista.length
    }
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Tarefas"
        descricao="Quem está com o quê. Arraste entre as colunas ou use os botões — funciona nos dois."
        acoes={
          <>
            <Segmentado
              rotulo="Forma de ver as tarefas"
              atual={visao}
              aoTrocar={setVisao}
              opcoes={[
                { valor: 'QUADRO', rotulo: 'Quadro', icone: 'tarefas' },
                { valor: 'LISTA', rotulo: 'Lista', icone: 'lista' },
              ]}
            />
            <button className="botao" onClick={() => setCompondo((v) => !v)}>
              <Icone nome="mais" tamanho={16} /> Nova tarefa
            </button>
          </>
        }
      />

      <Previa oQueFalta="Criar e mover tarefa ainda não chega ao servidor." />

      {compondo ? (
        <div className="cartao" style={{ marginBottom: '1.1rem' }}>
          <div className="linha">
            <input
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void criar() }}
              placeholder="O que precisa ser feito?"
              aria-label="Título da nova tarefa"
              autoFocus
              style={{ flex: 1, minWidth: '14rem' }}
            />
            <button className="botao" onClick={() => void criar()}
                    disabled={!novoTitulo.trim()}>
              Adicionar
            </button>
            <button className="botao botao--fantasma" onClick={() => setCompondo(false)}>
              Fechar
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ marginBottom: '1.1rem' }}>
        <Chips
          rotulo="Filtros de tarefa"
          selecionado={filtro}
          aoSelecionar={setFiltro}
          opcoes={[
            { valor: 'TODAS', rotulo: 'Todas', contagem: contar('TODAS') },
            { valor: 'MINHAS', rotulo: 'Minhas', contagem: contar('MINHAS') },
            { valor: 'ATRASADAS', rotulo: 'Atrasadas', contagem: contar('ATRASADAS') },
            { valor: 'SEMANA', rotulo: 'Esta semana', contagem: contar('SEMANA') },
            { valor: 'SEM_DONO', rotulo: 'Sem responsável', contagem: contar('SEM_DONO') },
          ]}
        />
      </div>

      <Conteudo busca={tarefas} esqueleto={<Esqueleto altura="18rem" />}>
        {() => {
          if (filtradas.length === 0) {
            return (
              <EstadoVazio icone="tarefas" titulo="Nenhuma tarefa neste filtro">
                <p className="fraco">
                  {filtro === 'ATRASADAS'
                    ? 'Nada atrasado. É o melhor resultado possível aqui.'
                    : 'Mude o filtro ou crie a primeira tarefa.'}
                </p>
              </EstadoVazio>
            )
          }

          if (visao === 'LISTA') {
            return (
              <Secao>
                <div className="rolagem">
                  <table className="tabela-cartoes">
                    <thead>
                      <tr>
                        <th>Tarefa</th>
                        <th>Responsável</th>
                        <th>Prazo</th>
                        <th>Prioridade</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtradas.map((t) => {
                        const atrasada = t.prazo !== null && t.status !== 'CONCLUIDA'
                          && new Date(t.prazo) < new Date()
                        return (
                          <tr key={t.id}>
                            <td data-rotulo="Tarefa">
                              <div style={{
                                fontWeight: 550,
                                textDecoration: t.status === 'CONCLUIDA'
                                  ? 'line-through' : undefined,
                              }}>
                                {t.titulo}
                              </div>
                              {t.eventoTitulo ? (
                                <div className="fraco">{t.eventoTitulo}</div>
                              ) : null}
                            </td>
                            <td data-rotulo="Responsável">
                              {t.responsavelNome ?? (
                                <span className="fraco">sem responsável</span>
                              )}
                            </td>
                            <td data-rotulo="Prazo">
                              {t.prazo ? (
                                <span className={atrasada ? 'etiqueta etiqueta--perigo' : ''}>
                                  {quando(t.prazo)}
                                </span>
                              ) : <span className="fraco">—</span>}
                            </td>
                            <td data-rotulo="Prioridade">
                              <span className={`etiqueta ${PRIORIDADE[t.prioridade].classe}`}>
                                {PRIORIDADE[t.prioridade].rotulo}
                              </span>
                            </td>
                            <td data-rotulo="Situação">
                              <select
                                value={t.status}
                                onChange={(e) =>
                                  void mover(t.id, e.target.value as StatusDaTarefa)}
                                aria-label={`Situação de ${t.titulo}`}
                                style={{ width: 'auto', minHeight: '34px' }}
                              >
                                {COLUNAS.map((c) => (
                                  <option key={c.status} value={c.status}>{c.titulo}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Secao>
            )
          }

          return (
            <div className="kanban">
              {COLUNAS.map((coluna) => {
                const daColuna = filtradas.filter((t) => t.status === coluna.status)
                return (
                  <div
                    key={coluna.status}
                    className={`coluna ${alvo === coluna.status ? 'coluna--alvo' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setAlvo(coluna.status) }}
                    onDragLeave={() => setAlvo(null)}
                    onDrop={(e) => aoSoltar(e, coluna.status)}
                  >
                    <div className="coluna__titulo">
                      <span>{coluna.titulo}</span>
                      <span>{daColuna.length}</span>
                    </div>

                    {daColuna.map((tarefa) => (
                      <Ficha
                        key={tarefa.id}
                        tarefa={tarefa}
                        arrastando={arrastando === tarefa.id}
                        aoIniciarArraste={() => setArrastando(tarefa.id)}
                        aoTerminarArraste={() => setArrastando(null)}
                        aoMover={(status) => void mover(tarefa.id, status)}
                      />
                    ))}

                    {daColuna.length === 0 ? (
                      <div className="fraco" style={{ padding: '0.6rem',
                                                      textAlign: 'center' }}>
                        vazio
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )
        }}
      </Conteudo>
    </div>
  )
}

function Ficha({ tarefa, arrastando, aoIniciarArraste, aoTerminarArraste, aoMover }: {
  tarefa: Tarefa
  arrastando: boolean
  aoIniciarArraste: () => void
  aoTerminarArraste: () => void
  aoMover: (status: StatusDaTarefa) => void
}) {
  const atrasada = tarefa.prazo !== null
    && tarefa.status !== 'CONCLUIDA'
    && new Date(tarefa.prazo) < new Date()

  return (
    <article
      className={`ficha ${arrastando ? 'ficha--arrastando' : ''}`}
      draggable
      onDragStart={aoIniciarArraste}
      onDragEnd={aoTerminarArraste}
    >
      <div style={{ fontWeight: 550, marginBottom: '0.3rem' }}>{tarefa.titulo}</div>

      {tarefa.eventoTitulo ? (
        <div className="fraco" style={{ marginBottom: '0.4rem' }}>
          {tarefa.eventoTitulo}
        </div>
      ) : null}

      <div className="linha" style={{ gap: '0.35rem', marginBottom: '0.5rem' }}>
        <span className={`etiqueta ${PRIORIDADE[tarefa.prioridade].classe}`}>
          {PRIORIDADE[tarefa.prioridade].rotulo}
        </span>
        {tarefa.prazo ? (
          <span className={`etiqueta ${atrasada ? 'etiqueta--perigo' : ''}`}>
            {atrasada ? 'atrasada · ' : ''}{quando(tarefa.prazo)}
          </span>
        ) : null}
      </div>

      <div className="linha entre">
        {tarefa.responsavelNome ? (
          <div className="linha" style={{ gap: '0.4rem' }}>
            <Avatar nome={tarefa.responsavelNome} url={tarefa.responsavelAvatarUrl} />
            <span className="fraco">{tarefa.responsavelNome.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="fraco">sem responsável</span>
        )}

        {/* Arrastar não funciona com teclado nem com leitor de tela. Estes
            botões são a mesma ação por outro caminho — não são atalho. */}
        <div className="linha" style={{ gap: '0.2rem' }}>
          {COLUNAS.filter((c) => c.status !== tarefa.status).map((c) => (
            <button
              key={c.status}
              className="botao botao--fantasma botao--pequeno"
              style={{ minHeight: 'auto', padding: '0 0.35rem', fontSize: '0.75rem' }}
              onClick={() => aoMover(c.status)}
              aria-label={`Mover "${tarefa.titulo}" para ${c.titulo}`}
            >
              → {c.titulo}
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}
