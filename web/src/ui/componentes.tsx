import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { FalhaDaApi } from '../api/cliente'
import { MODO_DEMO } from '../dados'
import type { AtleticaResumo, StatusDoEvento, TipoDeEvento } from '../api/tipos'
import { Icone, type NomeDoIcone } from './icones'
import { corDerivada, iniciais } from './tema'

/** As peças repetidas em quase toda tela, e o hook que busca dados. */

// ---------------------------------------------------------------------
// Estados de carga
// ---------------------------------------------------------------------

export function Carregando({ rotulo = 'Carregando' }: { rotulo?: string }) {
  return (
    <div role="status" aria-live="polite">
      <div className="girando" />
      <span className="fraco" style={{ display: 'block', textAlign: 'center' }}>
        {rotulo}…
      </span>
    </div>
  )
}

/**
 * Silhueta do conteúdo enquanto ele chega. Diferente do spinner: aqui a
 * página não "pula" quando o dado entra, porque o espaço já estava
 * reservado no tamanho certo.
 */
export function Esqueleto({ altura = '4rem', largura = '100%' }: {
  altura?: string
  largura?: string
}) {
  return <div className="esqueleto" style={{ height: altura, width: largura }} />
}

/**
 * Erro em português, com saída (§76).
 *
 * <p>"Error 500" não diz à pessoa nem o que falhou nem o que fazer. A
 * mensagem da API já vem escrita para o usuário final; quando não há
 * mensagem — queda de rede, proxy fora —, entra um texto que descreve o
 * problema e oferece a única ação que costuma resolver: tentar de novo.</p>
 */
export function MensagemDeErro({ erro, aoTentarNovamente }: {
  erro: unknown
  aoTentarNovamente?: () => void
}) {
  const texto = erro instanceof FalhaDaApi
    ? erro.message
    : 'Não conseguimos carregar esta parte agora.'
  return (
    <div className="aviso aviso--erro" role="alert">
      <div>{texto}</div>
      {aoTentarNovamente ? (
        <button
          className="botao botao--discreto botao--pequeno"
          style={{ marginTop: '0.6rem' }}
          onClick={aoTentarNovamente}
        >
          Tentar novamente
        </button>
      ) : null}
    </div>
  )
}

export function Vazio({ titulo, children }: { titulo?: string; children?: ReactNode }) {
  return (
    <div className="vazio">
      {titulo ? <h3>{titulo}</h3> : null}
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------
// Busca
// ---------------------------------------------------------------------

interface Busca<T> {
  dados: T | null
  carregando: boolean
  erro: unknown
  recarregar: () => void
  definir: (valor: T) => void
}

/**
 * O `cancelado` do efeito não é zelo excessivo: navegar rápido entre dois
 * eventos dispara duas buscas, e sem ele a resposta LENTA da primeira chega
 * depois e sobrescreve a segunda. A tela mostra o registro errado, e o bug
 * só aparece em conexão ruim — que é onde ninguém testa.
 */
export function useBusca<T>(buscar: () => Promise<T>, gatilhos: unknown[]): Busca<T> {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<unknown>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro(null)

    buscar()
      .then((r) => { if (!cancelado) setDados(r) })
      .catch((e: unknown) => { if (!cancelado) setErro(e) })
      .finally(() => { if (!cancelado) setCarregando(false) })

    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...gatilhos, tentativa])

  const recarregar = useCallback(() => setTentativa((n) => n + 1), [])
  return { dados, carregando, erro, recarregar, definir: setDados }
}

export function Conteudo<T>({ busca, children, esqueleto }: {
  busca: Busca<T>
  children: (dados: T) => ReactNode
  esqueleto?: ReactNode
}) {
  if (busca.carregando) {
    return <>{esqueleto ?? <Carregando />}</>
  }
  if (busca.erro) {
    return <MensagemDeErro erro={busca.erro} aoTentarNovamente={busca.recarregar} />
  }
  if (busca.dados === null) {
    return <Vazio titulo="Não encontrado">O conteúdo não está disponível.</Vazio>
  }
  return <>{children(busca.dados)}</>
}

// ---------------------------------------------------------------------
// Identidade visual
// ---------------------------------------------------------------------

export function Brasao({ atletica, tamanho = 'm' }: {
  atletica: Pick<AtleticaResumo, 'nome' | 'sigla' | 'brasaoUrl' | 'corPrimaria'>
  tamanho?: 'p' | 'm' | 'g'
}) {
  const classe = `brasao brasao--${tamanho}`
  if (atletica.brasaoUrl) {
    return <img className={classe} src={atletica.brasaoUrl} alt="" />
  }
  // Atlética recém-criada não tem imagem, e um quadrado vazio na vitrine faz
  // a plataforma inteira parecer quebrada.
  return (
    <div
      className={classe}
      style={{ background: atletica.corPrimaria ?? corDerivada(atletica.nome) }}
      aria-hidden="true"
    >
      {iniciais(atletica.nome, atletica.sigla)}
    </div>
  )
}

export function Avatar({ nome, url, tamanho = 'p' }: {
  nome: string
  url?: string | null
  tamanho?: 'p' | 'm'
}) {
  const classe = `brasao brasao--${tamanho}`
  if (url) {
    return <img className={classe} src={url} alt="" />
  }
  return (
    <div className={classe} style={{ background: corDerivada(nome), borderRadius: '999px' }}
         aria-hidden="true">
      {nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
    </div>
  )
}

// ---------------------------------------------------------------------
// Etiquetas
// ---------------------------------------------------------------------

const STATUS: Record<StatusDoEvento, { rotulo: string; classe: string }> = {
  RASCUNHO: { rotulo: 'Rascunho', classe: 'etiqueta--alerta' },
  PUBLICADO: { rotulo: 'Publicado', classe: 'etiqueta--sucesso' },
  ENCERRADO: { rotulo: 'Encerrado', classe: '' },
  CANCELADO: { rotulo: 'Cancelado', classe: 'etiqueta--perigo' },
}

export function EtiquetaDeStatus({ status }: { status: StatusDoEvento }) {
  const { rotulo, classe } = STATUS[status]
  return <span className={`etiqueta ${classe}`}>{rotulo}</span>
}

const TIPOS: Record<TipoDeEvento, string> = {
  ESPORTIVO: 'Esportivo',
  ESPORTS: 'E-sports',
  SOCIAL: 'Social',
  INTERNO: 'Interno',
}

export function EtiquetaDeTipo({ tipo }: { tipo: TipoDeEvento }) {
  return <span className="etiqueta">{TIPOS[tipo]}</span>
}

export function rotuloDoTipo(tipo: TipoDeEvento): string {
  return TIPOS[tipo]
}

export function rotuloDoPapel(papel: string): string {
  return papel === 'PRESIDENTE' ? 'Presidente'
    : papel === 'DIRETOR' ? 'Diretor'
    : 'Membro'
}

// ---------------------------------------------------------------------
// Métricas e gráficos
// ---------------------------------------------------------------------

/**
 * O cartão de número.
 *
 * <p>Vira link quando recebe {@code para}: um indicador que não leva a lugar
 * nenhum obriga a pessoa a procurar na navegação de onde ele saiu. "12
 * tarefas abertas" deve abrir as doze.</p>
 */
export function Metrica({ rotulo, valor, detalhe, cor, icone, extra, para }: {
  rotulo: string
  valor: ReactNode
  detalhe?: string
  cor?: string
  icone?: NomeDoIcone
  /** Variação, selo ou qualquer coisa que acompanhe o número. */
  extra?: ReactNode
  para?: string
}) {
  const corpo = (
    <>
      <div className="metrica__topo">
        {icone ? <Icone nome={icone} tamanho={15} /> : null}
        <span style={{ flex: 1, minWidth: 0 }}>{rotulo}</span>
        {para ? <Icone nome="direita" tamanho={14} /> : null}
      </div>
      <div className="linha" style={{ gap: '0.5rem', alignItems: 'baseline' }}>
        <div className="numero-grande" style={cor ? { color: cor } : undefined}>{valor}</div>
        {extra}
      </div>
      {detalhe ? <div className="fraco">{detalhe}</div> : null}
    </>
  )

  return para
    ? <Link to={para} className="cartao cartao--clicavel">{corpo}</Link>
    : <div className="cartao">{corpo}</div>
}

/**
 * Barras horizontais em vez de um gráfico de verdade.
 *
 * <p>São nomes de eventos com contagem — rótulos longos e poucas linhas. Num
 * gráfico de barras verticais os nomes ficariam na diagonal ou truncados, e
 * uma biblioteca de gráficos custaria mais de rede do que este componente
 * inteiro. O eixo aqui é a própria largura.</p>
 */
export function Barras({ dados, formatar }: {
  dados: { rotulo: string; valor: number }[]
  formatar?: (valor: number) => string
}) {
  const maximo = Math.max(1, ...dados.map((d) => d.valor))

  return (
    <div className="barras">
      {dados.map((item) => (
        <div key={item.rotulo}>
          <div className="linha entre" style={{ marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.86rem' }}>{item.rotulo}</span>
            <span className="fraco" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatar ? formatar(item.valor) : item.valor}
            </span>
          </div>
          <div className="barra__trilho">
            <div
              className="barra__preenchimento"
              style={{ width: `${(item.valor / maximo) * 100}%` }}
              role="img"
              aria-label={`${item.rotulo}: ${item.valor}`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Anel de progresso para uma proporção — taxa de presença, ocupação. */
export function Anel({ proporcao, rotulo }: { proporcao: number; rotulo: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, proporcao)) * 100)
  const estilo: CSSProperties = {
    width: '5.5rem',
    height: '5.5rem',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: `conic-gradient(var(--acento) ${pct * 3.6}deg, var(--fundo-afundado) 0)`,
  }
  return (
    <div className="linha" style={{ gap: '0.9rem' }}>
      <div style={estilo} role="img" aria-label={`${rotulo}: ${pct}%`}>
        <div
          style={{
            width: '4.1rem', height: '4.1rem', borderRadius: '50%',
            background: 'var(--fundo-cartao)', display: 'grid', placeItems: 'center',
            fontWeight: 700, fontSize: '1.05rem',
          }}
        >
          {pct}%
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>{rotulo}</div>
        <div className="fraco">dos confirmados</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Abas
// ---------------------------------------------------------------------

/**
 * Abas sublinhadas.
 *
 * <p>Eram botões-pílula, e pílula é o desenho de <em>ação</em>. Numa página
 * cheia de botões de verdade — publicar, convidar, criar —, trocar de aba
 * parecia executar alguma coisa. O sublinhado diz "isto muda o que você
 * está vendo", que é o que uma aba faz.</p>
 */
export function Abas<T extends string>({ opcoes, atual, aoTrocar }: {
  opcoes: { valor: T; rotulo: string; contagem?: number }[]
  atual: T
  aoTrocar: (valor: T) => void
}) {
  return (
    <div className="abas" role="tablist">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          role="tab"
          type="button"
          aria-selected={atual === opcao.valor}
          className="aba"
          onClick={() => aoTrocar(opcao.valor)}
        >
          {opcao.rotulo}
          {opcao.contagem !== undefined ? (
            <span className="aba__contagem">{opcao.contagem}</span>
          ) : null}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------
// Diálogo
// ---------------------------------------------------------------------

/**
 * Painel modal simples. Fecha com Esc e no clique fora — as duas saídas que
 * as pessoas tentam antes de procurar o botão.
 */
export function Dialogo({ titulo, aoFechar, children }: {
  titulo: string
  aoFechar: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={aoFechar}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgb(0 0 0 / 0.55)',
        display: 'grid', placeItems: 'center', padding: '1rem',
      }}
    >
      <div
        className="cartao"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(32rem, 100%)', maxHeight: '85dvh', overflowY: 'auto' }}
      >
        <div className="linha entre" style={{ marginBottom: '0.8rem' }}>
          <h2 style={{ margin: 0 }}>{titulo}</h2>
          <button className="botao botao--fantasma botao--pequeno" onClick={aoFechar}>
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/**
 * Marca uma tela cuja tabela existe no banco mas cujo endpoint ainda não
 * foi escrito.
 *
 * <p>Sem isso, metade da navegação leva a telas que parecem funcionar e não
 * salvam nada — e quem testa conclui que o sistema é instável, em vez de
 * incompleto. Dizer "ainda não" em voz alta custa menos que essa confusão.</p>
 */
export function Previa({ oQueFalta }: { oQueFalta: string }) {
  return (
    <div className="aviso aviso--alerta" style={{ marginBottom: '1rem' }}>
      <div className="linha" style={{ gap: '0.5rem' }}>
        <span className="etiqueta etiqueta--alerta">prévia</span>
        <strong>Esta tela ainda não fala com o servidor</strong>
      </div>
      <p className="fraco" style={{ margin: '0.3rem 0 0' }}>
        {oQueFalta} O banco já tem a tabela; falta o endpoint na API.{' '}
        {MODO_DEMO
          ? 'Na demonstração o que você fizer fica guardado neste navegador: '
            + 'volta ao recarregar, some se você limpar os dados do site, e '
            + 'ninguém mais enxerga.'
          : 'Até lá, o que você fizer aqui vale só nesta aba.'}
      </p>
    </div>
  )
}
