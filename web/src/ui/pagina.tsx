/**
 * O vocabulário de página.
 *
 * <p>Um módulo novo não deve inventar como se apresenta. Cabeçalho, trilha,
 * seção, estado vazio, confirmação e gaveta vivem aqui para que a décima
 * tela pareça a primeira — que é literalmente o §100 do planejamento. Quando
 * cada módulo desenha o próprio cabeçalho, a plataforma vira uma coleção de
 * telas de origens diferentes, e o usuário deixa de saber onde está.</p>
 */

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icone, type NomeDoIcone } from './icones'

// ---------------------------------------------------------------------
// Cabeçalho e trilha
// ---------------------------------------------------------------------

export interface DegrauDaTrilha {
  rotulo: string
  para?: string
}

/**
 * O caminho de volta. Existe para responder "como eu saio daqui?" sem que a
 * pessoa dependa do botão do navegador — que numa PWA instalada muitas vezes
 * nem aparece.
 */
export function Trilha({ itens }: { itens: DegrauDaTrilha[] }) {
  if (itens.length === 0) return null
  return (
    <nav className="trilha" aria-label="Você está em">
      {itens.map((degrau, i) => (
        <span key={`${degrau.rotulo}-${i}`} style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
          {i > 0 ? <Icone nome="direita" tamanho={12} /> : null}
          {degrau.para ? <Link to={degrau.para}>{degrau.rotulo}</Link> : <span>{degrau.rotulo}</span>}
        </span>
      ))}
    </nav>
  )
}

export function CabecalhoDePagina({ titulo, descricao, trilha, acoes, etiqueta }: {
  titulo: string
  descricao?: string
  trilha?: DegrauDaTrilha[]
  acoes?: ReactNode
  /** Fica ao lado do título: status, selo, contagem. */
  etiqueta?: ReactNode
}) {
  return (
    <header className="pagina__cabecalho">
      <div style={{ minWidth: 0 }}>
        {trilha ? <Trilha itens={trilha} /> : null}
        <h1 className="pagina__titulo">
          {titulo}
          {etiqueta}
        </h1>
        {descricao ? <p className="pagina__descricao">{descricao}</p> : null}
      </div>
      {acoes ? <div className="pagina__acoes">{acoes}</div> : null}
    </header>
  )
}

export function Secao({ titulo, descricao, acao, children }: {
  titulo?: string
  descricao?: string
  acao?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="secao">
      {titulo || acao ? (
        <div className="cabecalho-de-secao">
          <div style={{ minWidth: 0 }}>
            {titulo ? <h2>{titulo}</h2> : null}
            {descricao ? (
              <p className="fraco" style={{ margin: 0 }}>{descricao}</p>
            ) : null}
          </div>
          {acao}
        </div>
      ) : null}
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------
// Estado vazio
// ---------------------------------------------------------------------

/**
 * Estado vazio útil (§75).
 *
 * <p>Uma tela em branco faz a pessoa achar que o sistema quebrou. Aqui ela
 * sempre lê o que aquela seção seria e qual é o próximo passo — e o botão de
 * ação só aparece para quem tem permissão de executá-lo, senão vira
 * frustração.</p>
 */
export function EstadoVazio({ icone, titulo, children, acao }: {
  icone?: NomeDoIcone
  titulo: string
  children?: ReactNode
  acao?: ReactNode
}) {
  return (
    <div className="vazio">
      {icone ? (
        <div style={{ color: 'var(--texto-fraco)', marginBottom: '0.5rem' }}>
          <Icone nome={icone} tamanho={30} />
        </div>
      ) : null}
      <h3 style={{ color: 'var(--texto)' }}>{titulo}</h3>
      {children ? (
        <div style={{ maxWidth: '38ch', margin: '0 auto 0.9rem' }}>{children}</div>
      ) : null}
      {acao}
    </div>
  )
}

// ---------------------------------------------------------------------
// Confirmação de ação destrutiva
// ---------------------------------------------------------------------

/**
 * Confirmação para o que não dá para desfazer (§77).
 *
 * <p>Substitui o `window.confirm`, que não recebe o tema, não explica a
 * consequência e não distingue "excluir projeto" de "sair da página".</p>
 */
export function Confirmacao({
  titulo, consequencia, rotuloDeConfirmar = 'Confirmar', perigo = true,
  aoConfirmar, aoCancelar,
}: {
  titulo: string
  consequencia: string
  rotuloDeConfirmar?: string
  perigo?: boolean
  aoConfirmar: () => void
  aoCancelar: () => void
}) {
  const idDoTitulo = useId()

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') aoCancelar() }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoCancelar])

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={idDoTitulo}
      onClick={aoCancelar}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgb(0 0 0 / 0.55)',
        display: 'grid', placeItems: 'center', padding: '1rem',
      }}
    >
      <div
        className="cartao"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(27rem, 100%)' }}
      >
        <h2 id={idDoTitulo} style={{ marginBottom: '0.4rem' }}>{titulo}</h2>
        <p className="suave">{consequencia}</p>
        <div className="linha" style={{ justifyContent: 'flex-end' }}>
          <button className="botao botao--discreto" onClick={aoCancelar}>Cancelar</button>
          <button
            className={perigo ? 'botao botao--perigo' : 'botao'}
            onClick={aoConfirmar}
            autoFocus
          >
            {rotuloDeConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Gaveta
// ---------------------------------------------------------------------

/**
 * Painel lateral para detalhe rápido, filtros e notificações (§63).
 *
 * <p>A diferença para o modal: a gaveta não interrompe: o conteúdo da página
 * continua visível ao lado, e é isso que permite consultar um detalhe sem
 * perder o lugar na lista.</p>
 */
export function Gaveta({ titulo, aoFechar, children, rodape }: {
  titulo: string
  aoFechar: () => void
  children: ReactNode
  rodape?: ReactNode
}) {
  const painel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') aoFechar() }
    document.addEventListener('keydown', aoTeclar)
    painel.current?.focus()
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  return (
    <>
      <button className="veu" aria-label="Fechar" onClick={aoFechar} />
      <aside
        className="gaveta"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        ref={painel}
        tabIndex={-1}
      >
        <div className="gaveta__cabecalho">
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{titulo}</h2>
          <button className="icone-botao" onClick={aoFechar} aria-label="Fechar">
            <Icone nome="fechar" tamanho={18} />
          </button>
        </div>
        <div className="gaveta__corpo">{children}</div>
        {rodape ? (
          <div style={{ borderTop: '1px solid var(--borda)', padding: '0.7rem 0.85rem' }}>
            {rodape}
          </div>
        ) : null}
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------
// Controles de seleção
// ---------------------------------------------------------------------

export interface OpcaoDeChip<T extends string> {
  valor: T
  rotulo: string
  contagem?: number
}

/** Filtros como chips (§61): poucos, visíveis, e removíveis num toque. */
export function Chips<T extends string>({ opcoes, selecionado, aoSelecionar, rotulo }: {
  opcoes: OpcaoDeChip<T>[]
  selecionado: T
  aoSelecionar: (valor: T) => void
  rotulo: string
}) {
  return (
    <div className="chips" role="group" aria-label={rotulo}>
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          className="chip"
          aria-pressed={selecionado === opcao.valor}
          onClick={() => aoSelecionar(opcao.valor)}
        >
          {opcao.rotulo}
          {opcao.contagem !== undefined ? (
            <span style={{ opacity: 0.7 }}>{opcao.contagem}</span>
          ) : null}
        </button>
      ))}
    </div>
  )
}

/** Alternador de duas ou três visões: grade/lista, mês/semana. */
export function Segmentado<T extends string>({ opcoes, atual, aoTrocar, rotulo }: {
  opcoes: { valor: T; rotulo: string; icone?: NomeDoIcone }[]
  atual: T
  aoTrocar: (valor: T) => void
  rotulo: string
}) {
  return (
    <div className="segmentado" role="group" aria-label={rotulo}>
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          aria-pressed={atual === opcao.valor}
          onClick={() => aoTrocar(opcao.valor)}
        >
          {opcao.icone ? <Icone nome={opcao.icone} tamanho={15} /> : null}
          {opcao.rotulo}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------
// Indicadores
// ---------------------------------------------------------------------

export function Progresso({ proporcao, tom }: {
  proporcao: number
  tom?: 'sucesso' | 'alerta' | 'perigo'
}) {
  const pct = Math.round(Math.min(1, Math.max(0, proporcao)) * 100)
  return (
    <div className={`progresso ${tom ? `progresso--${tom}` : ''}`}>
      <div className="progresso__preenchimento" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Cinco estrelas com meia estrela por arredondamento visual. */
export function Estrelas({ nota, tamanho = 15 }: { nota: number; tamanho?: number }) {
  const cheias = Math.round(nota)
  return (
    <span className="estrelas" role="img" aria-label={`${nota.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={tamanho} height={tamanho} viewBox="0 0 24 24"
             fill={n <= cheias ? 'currentColor' : 'none'}
             stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round"
             aria-hidden="true" focusable="false">
          <path d="m12 3.8 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.9l5.8-.8Z" />
        </svg>
      ))}
    </span>
  )
}

/** Variação contra o período anterior, com o sinal em cor. */
export function Variacao({ percentual }: { percentual: number }) {
  const classe = percentual > 0 ? 'sobe' : percentual < 0 ? 'desce' : 'igual'
  return (
    <span className={`metrica__variacao metrica__variacao--${classe}`}>
      <Icone nome={percentual >= 0 ? 'cima' : 'baixo'} tamanho={12} />
      {Math.abs(percentual)}%
    </span>
  )
}

// ---------------------------------------------------------------------
// Linha do tempo
// ---------------------------------------------------------------------

export function LinhaDoTempo({ children }: { children: ReactNode }) {
  return <div className="linha-do-tempo">{children}</div>
}

export function ItemDaLinha({ estado = 'pendente', children }: {
  estado?: 'feito' | 'ativo' | 'pendente'
  children: ReactNode
}) {
  const sufixo = estado === 'pendente' ? '' : ` linha-do-tempo__item--${estado}`
  return <div className={`linha-do-tempo__item${sufixo}`}>{children}</div>
}
