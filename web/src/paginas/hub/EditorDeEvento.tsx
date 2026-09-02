import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Evento, TipoDeEvento, Visibilidade } from '../../api/tipos'
import { Carregando, MensagemDeErro } from '../../ui/componentes'
import { doInputParaIso, doIsoParaInput } from '../../formatos'

const TIPOS: { valor: TipoDeEvento; rotulo: string }[] = [
  { valor: 'ESPORTIVO', rotulo: 'Esportivo' },
  { valor: 'ESPORTS', rotulo: 'E-sports' },
  { valor: 'SOCIAL', rotulo: 'Social' },
  { valor: 'INTERNO', rotulo: 'Interno' },
]

const VISIBILIDADES: { valor: Visibilidade; rotulo: string; explica: string }[] = [
  {
    valor: 'PUBLICO', rotulo: 'Público',
    explica: 'Qualquer pessoa com o link. É o caso do evento divulgado no Instagram.',
  },
  {
    valor: 'REDE', rotulo: 'Rede de atléticas',
    explica: 'Só membros de atléticas da plataforma. É o interatlética.',
  },
  {
    valor: 'INTERNO', rotulo: 'Interno',
    explica: 'Só a sua atlética. Nunca aparece na agenda pública.',
  },
]

type Formulario = Omit<Evento, 'id' | 'slug' | 'status' | 'publicadoEm'
  | 'inscritosConfirmados' | 'naListaDeEspera'>

const VAZIO: Formulario = {
  titulo: '', descricao: null, tipo: 'SOCIAL', modalidade: null,
  visibilidade: 'PUBLICO', inicioEm: '', fimEm: null, localNome: null,
  localEndereco: null, localMapaUrl: null, capacidade: null,
  inscricaoAbreEm: null, inscricaoFechaEm: null, inscricaoPorEquipe: false,
  capaUrl: null,
}

/**
 * Criar e editar no mesmo formulário: os campos são idênticos, e duas telas
 * paralelas divergiriam no primeiro campo acrescentado em só uma delas. O
 * que muda é o destino do envio, decidido pela presença do id na rota.
 */
export function EditorDeEvento() {
  const { slug = '', eventoId } = useParams()
  const navegar = useNavigate()

  const editando = Boolean(eventoId)
  const [dados, setDados] = useState<Formulario>(VAZIO)
  const [carregando, setCarregando] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [falha, setFalha] = useState<unknown>(null)

  useEffect(() => {
    if (!eventoId) return
    let cancelado = false

    Dados.evento(slug, eventoId)
      .then((evento) => {
        if (cancelado || !evento) return
        // Só os campos editáveis: id, status e contadores vêm do servidor e
        // não pertencem ao formulário.
        const { id: _id, slug: _slug, status: _status, publicadoEm: _pub,
                inscritosConfirmados: _ic, naListaDeEspera: _ne, ...resto } = evento
        setDados(resto)
      })
      .catch((e: unknown) => { if (!cancelado) setFalha(e) })
      .finally(() => { if (!cancelado) setCarregando(false) })

    return () => { cancelado = true }
  }, [slug, eventoId])

  function alterar<C extends keyof Formulario>(campo: C, valor: Formulario[C]) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setFalha(null)
    try {
      const salvo = eventoId
        ? await Dados.atualizarEvento(eventoId, dados)
        : await Dados.criarEvento(slug, dados)
      navegar(`/hub/${slug}/eventos/${salvo?.id ?? ''}`, { replace: true })
    } catch (erro) {
      setFalha(erro)
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <Carregando rotulo="Carregando evento" />
  }

  return (
    <form onSubmit={(e) => void enviar(e)} style={{ maxWidth: '38rem' }}>
      <h1>{editando ? 'Editar evento' : 'Novo evento'}</h1>
      {falha ? <MensagemDeErro erro={falha} /> : null}

      <label className="campo">
        <span className="campo__rotulo">Título</span>
        <input value={dados.titulo} maxLength={160} required
               onChange={(e) => alterar('titulo', e.target.value)} />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Descrição</span>
        <textarea
          value={dados.descricao ?? ''}
          placeholder="O que vai acontecer, o que levar, regras."
          onChange={(e) => alterar('descricao', e.target.value || null)}
        />
      </label>

      <div className="grade" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="campo">
          <span className="campo__rotulo">Tipo</span>
          <select value={dados.tipo}
                  onChange={(e) => alterar('tipo', e.target.value as TipoDeEvento)}>
            {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
          </select>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Modalidade</span>
          <input value={dados.modalidade ?? ''} maxLength={60}
                 placeholder="Vôlei feminino, Valorant…"
                 onChange={(e) => alterar('modalidade', e.target.value || null)} />
        </label>
      </div>

      <fieldset className="campo" style={{ border: 0, padding: 0, margin: '0 0 0.9rem' }}>
        <legend className="campo__rotulo">Quem pode ver</legend>
        {VISIBILIDADES.map((opcao) => (
          <label key={opcao.valor} className="linha linha--topo"
                 style={{ marginBottom: '0.35rem' }}>
            <input
              type="radio" name="visibilidade" value={opcao.valor}
              checked={dados.visibilidade === opcao.valor}
              onChange={() => alterar('visibilidade', opcao.valor)}
              style={{ width: 'auto', minHeight: 'auto', marginTop: '0.35rem' }}
            />
            <span>
              <strong>{opcao.rotulo}</strong>
              <div className="fraco">{opcao.explica}</div>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="grade" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="campo">
          <span className="campo__rotulo">Começa em</span>
          <input type="datetime-local" required
                 value={doIsoParaInput(dados.inicioEm)}
                 onChange={(e) => alterar('inicioEm', doInputParaIso(e.target.value) ?? '')} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Termina em</span>
          <input type="datetime-local" value={doIsoParaInput(dados.fimEm)}
                 onChange={(e) => alterar('fimEm', doInputParaIso(e.target.value))} />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Local</span>
        <input value={dados.localNome ?? ''} maxLength={160}
               placeholder="Ginásio da Engenharia"
               onChange={(e) => alterar('localNome', e.target.value || null)} />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Endereço</span>
        <input value={dados.localEndereco ?? ''}
               onChange={(e) => alterar('localEndereco', e.target.value || null)} />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Capacidade</span>
        <input type="number" min={1} value={dados.capacidade ?? ''}
               onChange={(e) => alterar('capacidade',
                 e.target.value ? Number(e.target.value) : null)} />
        <span className="campo__dica">
          Em branco = vagas ilimitadas. Com limite, quem chegar depois entra na
          lista de espera e é promovido automaticamente se alguém desistir.
        </span>
      </label>

      <div className="grade" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="campo">
          <span className="campo__rotulo">Inscrições abrem em</span>
          <input type="datetime-local" value={doIsoParaInput(dados.inscricaoAbreEm)}
                 onChange={(e) => alterar('inscricaoAbreEm',
                   doInputParaIso(e.target.value))} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Inscrições fecham em</span>
          <input type="datetime-local" value={doIsoParaInput(dados.inscricaoFechaEm)}
                 onChange={(e) => alterar('inscricaoFechaEm',
                   doInputParaIso(e.target.value))} />
          <span className="campo__dica">
            Em branco, fecham quando o evento começa.
          </span>
        </label>
      </div>

      <label className="campo linha" style={{ gap: '0.5rem' }}>
        <input
          type="checkbox" checked={dados.inscricaoPorEquipe}
          onChange={(e) => alterar('inscricaoPorEquipe', e.target.checked)}
          style={{ width: 'auto', minHeight: 'auto' }}
        />
        <span>
          <strong>Inscrição por equipe</strong>
          <div className="fraco">Para torneios: quem se inscreve é o time, não a pessoa.</div>
        </span>
      </label>

      <div className="linha">
        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : editando ? 'Salvar' : 'Criar rascunho'}
        </button>
        <button className="botao botao--discreto" type="button"
                onClick={() => navegar(-1)}>
          Cancelar
        </button>
      </div>

      {!editando ? (
        <p className="fraco" style={{ marginTop: '0.7rem' }}>
          O evento nasce como rascunho. Nada fica visível até você publicar.
        </p>
      ) : null}
    </form>
  )
}
