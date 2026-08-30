import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Aviso, PublicoDoAviso } from '../../api/tipos-rede'
import {
  Avatar,
  Conteudo,
  Esqueleto,
  useBusca,
  Vazio,
} from '../../ui/componentes'
import { Previa } from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
import { quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

const PUBLICO: Record<PublicoDoAviso, { rotulo: string; explica: string }> = {
  MEMBROS: { rotulo: 'Membros', explica: 'quem tem vínculo ativo com a atlética' },
  INSCRITOS: { rotulo: 'Inscritos', explica: 'quem se inscreveu no evento' },
  DIRETORIA: { rotulo: 'Diretoria', explica: 'só presidência e diretores' },
  PUBLICO: { rotulo: 'Público', explica: 'qualquer pessoa, inclusive sem conta' },
}

/**
 * O mural.
 *
 * <p>O público-alvo não é detalhe: "as inscrições esgotaram" vai para todo
 * mundo, "a prestação de contas é quinta" vai só para a diretoria. Mandar
 * tudo para todos é o caminho mais curto para as pessoas silenciarem a
 * notificação — e aí o aviso que importa também não chega.</p>
 */
export function Avisos() {
  const { slug = '' } = useParams()
  const { vinculo, podeAtuarComo } = useSessao()
  useCorDaAtletica(vinculo(slug)?.atletica.corPrimaria)

  const avisos = useBusca<Aviso[]>(() => Dados.avisos(slug), [slug])
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [compondo, setCompondo] = useState(false)

  return (
    <div className="pilha">
      <header className="linha entre">
        <div>
          <h1>Avisos</h1>
          <p className="fraco" style={{ margin: 0 }}>
            O mural da atlética. Cada aviso escolhe quem deve recebê-lo.
          </p>
        </div>
        {diretor ? (
          <button className="botao" onClick={() => setCompondo((v) => !v)}>
            {compondo ? 'Fechar' : 'Novo aviso'}
          </button>
        ) : null}
      </header>

      <Previa oQueFalta="Publicar aviso ainda não chega ao servidor, e ninguém é notificado." />

      {compondo ? (
        <Compositor
          slug={slug}
          aoPublicar={(aviso) => {
            avisos.definir([aviso, ...(avisos.dados ?? [])])
            setCompondo(false)
          }}
        />
      ) : null}

      <Conteudo busca={avisos} esqueleto={<Esqueleto altura="10rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return <Vazio titulo="Nenhum aviso publicado">
              O mural aparece na primeira tela de quem é membro.
            </Vazio>
          }
          const fixados = lista.filter((a) => a.fixado)
          const demais = lista.filter((a) => !a.fixado)
          return (
            <div className="pilha">
              {fixados.map((aviso) => <CartaoDeAviso key={aviso.id} aviso={aviso} />)}
              {demais.map((aviso) => <CartaoDeAviso key={aviso.id} aviso={aviso} />)}
            </div>
          )
        }}
      </Conteudo>
    </div>
  )
}

function CartaoDeAviso({ aviso }: { aviso: Aviso }) {
  return (
    <article className="cartao" style={
      aviso.fixado ? { borderColor: 'var(--acento)' } : undefined
    }>
      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
        <div className="linha" style={{ gap: '0.4rem' }}>
          {aviso.fixado ? (
            <span className="etiqueta etiqueta--acento">fixado</span>
          ) : null}
          <span className="etiqueta" title={PUBLICO[aviso.publicoAlvo].explica}>
            {PUBLICO[aviso.publicoAlvo].rotulo}
          </span>
        </div>
        <span className="fraco">
          {aviso.publicadoEm ? quando(aviso.publicadoEm) : 'rascunho'}
        </span>
      </div>

      <h3>{aviso.titulo}</h3>
      <p className="suave" style={{ whiteSpace: 'pre-wrap' }}>{aviso.corpo}</p>

      <div className="linha" style={{ gap: '0.4rem' }}>
        <Avatar nome={aviso.autorNome} url={aviso.autorAvatarUrl} />
        <span className="fraco">{aviso.autorNome}</span>
      </div>
    </article>
  )
}

function Compositor({ slug, aoPublicar }: {
  slug: string
  aoPublicar: (aviso: Aviso) => void
}) {
  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')
  const [publico, setPublico] = useState<PublicoDoAviso>('MEMBROS')
  const [publicando, setPublicando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setPublicando(true)
    const aviso = await Dados.publicarAviso(slug, titulo, corpo, publico)
    setPublicando(false)
    aoPublicar(aviso)
  }

  return (
    <form className="cartao" onSubmit={(e) => void enviar(e)}>
      <label className="campo">
        <span className="campo__rotulo">Título</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               maxLength={160} required />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Mensagem</span>
        <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)} required />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Quem recebe</span>
        <select value={publico}
                onChange={(e) => setPublico(e.target.value as PublicoDoAviso)}>
          {(Object.keys(PUBLICO) as PublicoDoAviso[]).map((chave) => (
            <option key={chave} value={chave}>
              {PUBLICO[chave].rotulo} — {PUBLICO[chave].explica}
            </option>
          ))}
        </select>
      </label>

      <button className="botao" type="submit"
              disabled={publicando || !titulo.trim() || !corpo.trim()}>
        {publicando ? 'Publicando…' : 'Publicar aviso'}
      </button>
    </form>
  )
}
