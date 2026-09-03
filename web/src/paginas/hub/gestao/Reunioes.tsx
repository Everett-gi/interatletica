import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Reuniao } from '../../../api/tipos-gestao'
import type { Membro } from '../../../api/tipos'
import { Avatar, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, hora, plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * As reuniões da diretoria (§21).
 *
 * <p>A separação entre agendadas e realizadas não é cosmética: a reunião que
 * já aconteceu vale pela ata, e a que vai acontecer vale pela pauta. São
 * dois conteúdos diferentes com o mesmo nome, e misturá-los faz a ata sumir
 * no meio de convocações.</p>
 */
export function Reunioes() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const reunioes = useBusca<Reuniao[]>(() => Dados.reunioes(slug), [slug])
  const [compondo, setCompondo] = useState(false)

  return (
    <div>
      <CabecalhoDePagina
        titulo="Reuniões"
        descricao="Pauta antes, ata depois. É a ata que prova que a decisão foi coletiva."
        acoes={diretor ? (
          <button className="botao" onClick={() => setCompondo((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Agendar reunião
          </button>
        ) : undefined}
      />

      {compondo ? (
        <FormularioDeReuniao
          slug={slug}
          aoAgendar={(reuniao) => {
            reunioes.definir([reuniao, ...(reunioes.dados ?? [])])
            setCompondo(false)
          }}
          aoCancelar={() => setCompondo(false)}
        />
      ) : null}

      <Conteudo
        busca={reunioes}
        esqueleto={
          <div className="pilha pilha--densa">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="9rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="reunioes" titulo="Nenhuma reunião registrada">
                <p className="fraco">
                  Agende a primeira com pauta escrita. Reunião sem pauta vira
                  conversa, e conversa não gera ata.
                </p>
                {diretor && !compondo ? (
                  <button className="botao" onClick={() => setCompondo(true)}>
                    <Icone nome="mais" tamanho={16} /> Agendar a primeira reunião
                  </button>
                ) : null}
              </EstadoVazio>
            )
          }

          const agendadas = lista
            .filter((r) => r.status === 'AGENDADA')
            .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm))
          const realizadas = lista
            .filter((r) => r.status !== 'AGENDADA')
            .sort((a, b) => b.inicioEm.localeCompare(a.inicioEm))

          return (
            <>
              <Secao titulo="Próximas" descricao="O que está convocado.">
                {agendadas.length === 0 ? (
                  <EstadoVazio titulo="Nada agendado" />
                ) : (
                  <div className="grade grade--larga">
                    {agendadas.map((r) => (
                      <CartaoDeReuniao key={r.id} reuniao={r} slug={slug} destaque />
                    ))}
                  </div>
                )}
              </Secao>

              {realizadas.length > 0 ? (
                <Secao
                  titulo="Realizadas"
                  descricao="Com ata registrada e as tarefas que saíram de cada uma."
                >
                  <div className="pilha pilha--densa">
                    {realizadas.map((r) => (
                      <Link key={r.id} to={`/hub/${slug}/reunioes/${r.id}`}
                            className="cartao cartao--clicavel linha entre">
                        <div style={{ minWidth: 0 }}>
                          <strong>{r.titulo}</strong>
                          <div className="fraco">
                            {dataEHora(r.inicioEm)} · {plural(r.pautas.length, 'pauta')}{' '}
                            · {plural(r.tarefasGeradas, 'tarefa')}{' '}
                            {r.tarefasGeradas === 1 ? 'gerada' : 'geradas'}
                          </div>
                        </div>
                        <span className={`etiqueta ${r.ata ? 'etiqueta--sucesso' : 'etiqueta--alerta'}`}>
                          {r.ata ? 'ata registrada' : 'sem ata'}
                        </span>
                      </Link>
                    ))}
                  </div>
                </Secao>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function CartaoDeReuniao({ reuniao, slug, destaque }: {
  reuniao: Reuniao
  slug: string
  destaque?: boolean
}) {
  const confirmados = reuniao.convocados.filter((c) => c.confirmado).length
  const minutos = reuniao.pautas.reduce((s, p) => s + p.minutos, 0)

  return (
    <div className={`cartao${destaque ? ' cartao--destacado' : ''}`}>
      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
        <span className="etiqueta etiqueta--acento">{quando(reuniao.inicioEm)}</span>
        <span className="fraco">{hora(reuniao.inicioEm)}</span>
      </div>

      <h3 style={{ marginBottom: '0.3rem' }}>{reuniao.titulo}</h3>
      <div className="fraco" style={{ marginBottom: '0.7rem' }}>
        {reuniao.local ?? 'Online'}
        {reuniao.linkOnline && reuniao.local ? ' · com link online' : ''}
      </div>

      <div className="linha" style={{ gap: '0.35rem', marginBottom: '0.8rem' }}>
        <span className="etiqueta">{plural(reuniao.convocados.length, 'convocado')}</span>
        <span className="etiqueta">{plural(reuniao.pautas.length, 'pauta')}</span>
        <span className="etiqueta">{minutos} min previstos</span>
      </div>

      <div className="linha entre">
        <div className="pilha-de-avatares">
          {reuniao.convocados.slice(0, 6).map((c) => (
            <Avatar key={c.nome} nome={c.nome} url={c.avatarUrl} />
          ))}
        </div>
        <span className="fraco">{confirmados} confirmaram</span>
      </div>

      <Link to={`/hub/${slug}/reunioes/${reuniao.id}`}
            className="botao botao--discreto botao--largo"
            style={{ marginTop: '0.9rem' }}>
        Ver a pauta
      </Link>
    </div>
  )
}

/**
 * Agendar com a pauta escrita na hora do agendamento.
 *
 * <p>A pauta é campo obrigatório de propósito: reunião cuja pauta se descobre
 * na sala é a que termina sem decisão, que é o problema que este módulo
 * existe para resolver. Convocar toda a diretoria é o padrão — quem não
 * precisa estar se remove, e isso custa menos que esquecer alguém.</p>
 */
function FormularioDeReuniao({ slug, aoAgendar, aoCancelar }: {
  slug: string
  aoAgendar: (reuniao: Reuniao) => void
  aoCancelar: () => void
}) {
  const membros = useBusca<Membro[]>(() => Dados.membros(slug), [slug])
  const [titulo, setTitulo] = useState('')
  const [quandoEm, setQuandoEm] = useState(amanhaANoite())
  const [duracao, setDuracao] = useState('60')
  const [local, setLocal] = useState('')
  const [link, setLink] = useState('')
  const [pautas, setPautas] = useState<string[]>([''])
  const [salvando, setSalvando] = useState(false)

  const diretoria = (membros.dados ?? []).filter(
    (m) => m.situacao === 'ATIVO' && m.papel !== 'MEMBRO')

  const mudarPauta = (i: number, valor: string) =>
    setPautas((atual) => atual.map((p, j) => (j === i ? valor : p)))

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const reuniao = await Dados.agendarReuniao(slug, {
      titulo: titulo.trim(),
      inicioEm: new Date(quandoEm).toISOString(),
      duracaoEmMinutos: Number(duracao) || 60,
      local: local.trim() === '' ? null : local.trim(),
      linkOnline: link.trim() === '' ? null : link.trim(),
      pautas: pautas.map((p) => p.trim()).filter((p) => p !== ''),
      convocados: diretoria.map((m) => ({ nome: m.nome, avatarUrl: m.avatarUrl })),
    })
    setSalvando(false)
    aoAgendar(reuniao)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Agendar reunião</h3>
      <p className="fraco">
        A pauta entra agora, não na hora. É ela que faz a reunião terminar com
        decisão em vez de com "a gente resolve depois".
      </p>

      <label className="campo">
        <span className="campo__rotulo">Assunto</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               required maxLength={140} autoFocus
               placeholder="Reunião ordinária da diretoria" />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Quando</span>
          <input type="datetime-local" value={quandoEm} required
                 onChange={(e) => setQuandoEm(e.target.value)} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Duração prevista</span>
          <select value={duracao} onChange={(e) => setDuracao(e.target.value)}>
            <option value="30">30 minutos</option>
            <option value="60">1 hora</option>
            <option value="90">1 hora e meia</option>
            <option value="120">2 horas</option>
          </select>
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Local (opcional)</span>
          <input value={local} onChange={(e) => setLocal(e.target.value)}
                 maxLength={120} placeholder="Sala da atlética" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Link online (opcional)</span>
          <input value={link} onChange={(e) => setLink(e.target.value)}
                 maxLength={200} placeholder="https://meet…" />
        </label>
      </div>

      <div className="campo">
        <span className="campo__rotulo">Pauta</span>
        <div className="pilha pilha--densa">
          {pautas.map((pauta, i) => (
            <div key={i} className="linha">
              <input
                value={pauta}
                onChange={(e) => mudarPauta(i, e.target.value)}
                maxLength={140}
                aria-label={`Item ${i + 1} da pauta`}
                placeholder={i === 0
                  ? 'Fechamento do mês e prestação de contas'
                  : 'Outro ponto'}
                style={{ flex: 1 }}
              />
              {pautas.length > 1 ? (
                <button
                  type="button" className="icone-botao"
                  aria-label={`Remover o item ${i + 1}`}
                  onClick={() => setPautas((a) => a.filter((_, j) => j !== i))}
                >
                  <Icone nome="fechar" tamanho={15} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button type="button" className="botao botao--fantasma botao--pequeno"
                style={{ marginTop: '0.5rem' }}
                onClick={() => setPautas((a) => [...a, ''])}>
          <Icone nome="mais" tamanho={15} /> Outro ponto de pauta
        </button>
      </div>

      <div className="aviso" style={{ margin: '0.9rem 0' }}>
        <strong>
          {diretoria.length === 0
            ? 'Ninguém para convocar ainda'
            : `Convocando ${diretoria.length} da diretoria`}
        </strong>
        <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
          {diretoria.length === 0
            ? 'Convide a diretoria em Membros; a convocação sai automática para quem tem cargo.'
            : diretoria.map((m) => m.nome).join(', ')}
        </p>
      </div>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !titulo.trim()
                  || pautas.every((p) => p.trim() === '')}>
          {salvando ? 'Agendando…' : 'Agendar'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/**
 * O padrão do campo de data: amanhã às 19h.
 *
 * <p>Montado à mão em horário local. `toISOString` devolve UTC, e um
 * `datetime-local` alimentado com UTC mostra a hora errada para quem está
 * a três horas de Greenwich — que é todo mundo aqui.</p>
 */
function amanhaANoite(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(19, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    + `T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
