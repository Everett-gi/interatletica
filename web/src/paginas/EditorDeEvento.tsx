import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FalhaDaApi } from '../api/cliente'
import { Api } from '../api/rotas'
import { Carregando, MensagemDeErro } from '../componentes/comuns'
import { doInputParaIso, doIsoParaInput } from '../formatos'
import type { DadosDoEvento, TipoDeEvento, Visibilidade } from '../api/tipos'

const TIPOS: { valor: TipoDeEvento; rotulo: string }[] = [
  { valor: 'ESPORTIVO', rotulo: 'Esportivo' },
  { valor: 'ESPORTS', rotulo: 'E-sports' },
  { valor: 'SOCIAL', rotulo: 'Social' },
  { valor: 'INTERNO', rotulo: 'Interno' },
]

const VISIBILIDADES: { valor: Visibilidade; rotulo: string; explicacao: string }[] = [
  {
    valor: 'PUBLICO',
    rotulo: 'Público',
    explicacao: 'Qualquer pessoa com o link. É o caso do evento divulgado no Instagram.',
  },
  {
    valor: 'REDE',
    rotulo: 'Rede de atléticas',
    explicacao: 'Só membros de atléticas da plataforma. É o interatlética.',
  },
  {
    valor: 'INTERNO',
    rotulo: 'Interno',
    explicacao: 'Só a sua atlética. Nunca aparece na agenda pública.',
  },
]

const VAZIO: DadosDoEvento = {
  titulo: '',
  descricao: null,
  tipo: 'SOCIAL',
  modalidade: null,
  visibilidade: 'PUBLICO',
  inicioEm: '',
  fimEm: null,
  localNome: null,
  localEndereco: null,
  localMapaUrl: null,
  capacidade: null,
  inscricaoAbreEm: null,
  inscricaoFechaEm: null,
  inscricaoPorEquipe: false,
  capaUrl: null,
}

/**
 * Criação e edição no mesmo formulário: os campos são idênticos, e duas
 * telas paralelas divergiriam no primeiro campo novo acrescentado em só uma.
 * O que muda é o destino do envio, decidido pela presença do id na rota.
 */
export function EditorDeEvento() {
  const { slug = '', eventoId } = useParams()
  const navegar = useNavigate()
  const editando = Boolean(eventoId)

  const [dados, setDados] = useState<DadosDoEvento>(VAZIO)
  const [carregando, setCarregando] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [falha, setFalha] = useState<unknown>(null)

  useEffect(() => {
    if (!eventoId) {
      return
    }
    let cancelado = false
    Api.eventos
      .porId(slug, eventoId)
      .then((evento) => {
        if (cancelado) {
          return
        }
        // Só os campos editáveis: id, status e contadores vêm do servidor e
        // não pertencem ao formulário.
        setDados({
          titulo: evento.titulo,
          descricao: evento.descricao,
          tipo: evento.tipo,
          modalidade: evento.modalidade,
          visibilidade: evento.visibilidade,
          inicioEm: evento.inicioEm,
          fimEm: evento.fimEm,
          localNome: evento.localNome,
          localEndereco: evento.localEndereco,
          localMapaUrl: evento.localMapaUrl,
          capacidade: evento.capacidade,
          inscricaoAbreEm: evento.inscricaoAbreEm,
          inscricaoFechaEm: evento.inscricaoFechaEm,
          inscricaoPorEquipe: evento.inscricaoPorEquipe,
          capaUrl: evento.capaUrl,
        })
      })
      .catch((erro: unknown) => {
        if (!cancelado) {
          setFalha(erro)
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCarregando(false)
        }
      })
    return () => {
      cancelado = true
    }
  }, [slug, eventoId])

  function alterar<C extends keyof DadosDoEvento>(campo: C, valor: DadosDoEvento[C]) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setSalvando(true)
    setFalha(null)
    try {
      const salvo = eventoId
        ? await Api.eventos.atualizar(slug, eventoId, dados)
        : await Api.eventos.criar(slug, dados)
      navegar(`/a/${slug}/eventos/${salvo.id}`, { replace: true })
    } catch (erro) {
      setFalha(erro)
    } finally {
      setSalvando(false)
    }
  }

  /** Erros de validação por campo, como o servidor os devolve. */
  const erroDoCampo = (campo: string): string | null => {
    if (!(falha instanceof FalhaDaApi)) {
      return null
    }
    return falha.campos.find((c) => c.campo === campo)?.mensagem ?? null
  }

  if (carregando) {
    return <Carregando rotulo="Carregando evento" />
  }

  return (
    <form onSubmit={(e) => void enviar(e)} style={{ maxWidth: '38rem', margin: '0 auto' }}>
      <h1>{editando ? 'Editar evento' : 'Novo evento'}</h1>

      {falha ? <MensagemDeErro erro={falha} /> : null}

      <label className="campo">
        <span className="campo__rotulo">Título</span>
        <input
          value={dados.titulo}
          onChange={(e) => alterar('titulo', e.target.value)}
          maxLength={160}
          required
        />
        {erroDoCampo('dados.titulo') ? (
          <span className="campo__erro">{erroDoCampo('dados.titulo')}</span>
        ) : null}
      </label>

      <label className="campo">
        <span className="campo__rotulo">Descrição</span>
        <textarea
          value={dados.descricao ?? ''}
          onChange={(e) => alterar('descricao', e.target.value || null)}
          placeholder="O que vai acontecer, o que levar, regras."
        />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Tipo</span>
        <select
          value={dados.tipo}
          onChange={(e) => alterar('tipo', e.target.value as TipoDeEvento)}
        >
          {TIPOS.map((tipo) => (
            <option key={tipo.valor} value={tipo.valor}>
              {tipo.rotulo}
            </option>
          ))}
        </select>
      </label>

      <label className="campo">
        <span className="campo__rotulo">Modalidade</span>
        <input
          value={dados.modalidade ?? ''}
          onChange={(e) => alterar('modalidade', e.target.value || null)}
          maxLength={60}
          placeholder="Vôlei feminino, Valorant, Futsal…"
        />
      </label>

      <fieldset className="campo" style={{ border: 0, padding: 0, margin: '0 0 0.9rem' }}>
        <legend className="campo__rotulo">Quem pode ver</legend>
        {VISIBILIDADES.map((opcao) => (
          <label
            key={opcao.valor}
            className="linha"
            style={{ alignItems: 'flex-start', marginBottom: '0.4rem' }}
          >
            <input
              type="radio"
              name="visibilidade"
              value={opcao.valor}
              checked={dados.visibilidade === opcao.valor}
              onChange={() => alterar('visibilidade', opcao.valor)}
              style={{ width: 'auto', minHeight: 'auto', marginTop: '0.35rem' }}
            />
            <span>
              <strong>{opcao.rotulo}</strong>
              <div className="fraco">{opcao.explicacao}</div>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="campo">
        <span className="campo__rotulo">Começa em</span>
        <input
          type="datetime-local"
          value={doIsoParaInput(dados.inicioEm)}
          onChange={(e) => alterar('inicioEm', doInputParaIso(e.target.value) ?? '')}
          required
        />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Termina em</span>
        <input
          type="datetime-local"
          value={doIsoParaInput(dados.fimEm)}
          onChange={(e) => alterar('fimEm', doInputParaIso(e.target.value))}
        />
        <span className="campo__dica">Opcional.</span>
      </label>

      <label className="campo">
        <span className="campo__rotulo">Local</span>
        <input
          value={dados.localNome ?? ''}
          onChange={(e) => alterar('localNome', e.target.value || null)}
          maxLength={160}
          placeholder="Ginásio da Engenharia"
        />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Endereço</span>
        <input
          value={dados.localEndereco ?? ''}
          onChange={(e) => alterar('localEndereco', e.target.value || null)}
        />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Link do mapa</span>
        <input
          type="url"
          value={dados.localMapaUrl ?? ''}
          onChange={(e) => alterar('localMapaUrl', e.target.value || null)}
          placeholder="https://maps.google.com/…"
        />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Capacidade</span>
        <input
          type="number"
          min={1}
          value={dados.capacidade ?? ''}
          onChange={(e) =>
            alterar('capacidade', e.target.value ? Number(e.target.value) : null)
          }
        />
        <span className="campo__dica">
          Em branco = vagas ilimitadas. Com limite, quem chegar depois entra na
          lista de espera e é promovido automaticamente se alguém desistir.
        </span>
      </label>

      <label className="campo">
        <span className="campo__rotulo">Inscrições abrem em</span>
        <input
          type="datetime-local"
          value={doIsoParaInput(dados.inscricaoAbreEm)}
          onChange={(e) => alterar('inscricaoAbreEm', doInputParaIso(e.target.value))}
        />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Inscrições fecham em</span>
        <input
          type="datetime-local"
          value={doIsoParaInput(dados.inscricaoFechaEm)}
          onChange={(e) => alterar('inscricaoFechaEm', doInputParaIso(e.target.value))}
        />
        <span className="campo__dica">
          Em branco, fecham quando o evento começa.
        </span>
      </label>

      <label className="campo">
        <span className="campo__rotulo">Imagem de capa</span>
        <input
          type="url"
          value={dados.capaUrl ?? ''}
          onChange={(e) => alterar('capaUrl', e.target.value || null)}
          placeholder="https://…"
        />
      </label>

      <div className="linha">
        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : editando ? 'Salvar' : 'Criar rascunho'}
        </button>
        <button
          className="botao botao--discreto"
          type="button"
          onClick={() => navegar(-1)}
        >
          Cancelar
        </button>
      </div>

      {!editando ? (
        <p className="fraco" style={{ marginTop: '0.75rem' }}>
          O evento nasce como rascunho. Nada fica visível até você publicar.
        </p>
      ) : null}
    </form>
  )
}
