import { useState, type DragEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { PrioridadeDaTarefa, StatusDaTarefa, Tarefa } from '../../api/tipos-rede'
import { Avatar, Conteudo, Esqueleto, useBusca } from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
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

/**
 * O quadro de tarefas da diretoria.
 *
 * <p>Kanban de três colunas, e não uma lista com caixinha de marcar, porque
 * o problema real de uma diretoria não é "o que falta" — é "quem está com
 * o quê". A coluna do meio é a informação que a lista esconde.</p>
 */
export function Tarefas() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  useCorDaAtletica(vinculo(slug)?.atletica.corPrimaria)

  const tarefas = useBusca<Tarefa[]>(() => Dados.tarefas(slug), [slug])
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<StatusDaTarefa | null>(null)
  const [novoTitulo, setNovoTitulo] = useState('')

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

  return (
    <div className="pilha">
      <header>
        <h1>Tarefas</h1>
        <p className="fraco" style={{ margin: 0 }}>
          Arraste entre as colunas. Quem está com o quê é a pergunta que uma
          lista simples não responde.
        </p>
      </header>

      <div className="linha">
        <input
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void criar() }}
          placeholder="Nova tarefa e Enter"
          aria-label="Título da nova tarefa"
          style={{ maxWidth: '24rem' }}
        />
        <button className="botao" onClick={() => void criar()} disabled={!novoTitulo.trim()}>
          Adicionar
        </button>
      </div>

      <Conteudo busca={tarefas} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => (
          <div className="kanban">
            {COLUNAS.map((coluna) => {
              const daColuna = lista.filter((t) => t.status === coluna.status)
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
                    <div className="fraco" style={{ padding: '0.6rem', textAlign: 'center' }}>
                      vazio
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
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
