import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { FalhaDaApi } from '../api/cliente'
import type { StatusDoEvento } from '../api/tipos'

/**
 * Peças repetidas em quase toda tela: carregando, erro, vazio, etiqueta de
 * status — e o hook que busca dados.
 */

export function Carregando({ rotulo = 'Carregando' }: { rotulo?: string }) {
  // role="status" + aria-live: quem usa leitor de tela ouve "Carregando" em
  // vez de silêncio enquanto a lista não chega.
  return (
    <div role="status" aria-live="polite">
      <div className="girando" />
      <span className="fraco" style={{ display: 'block', textAlign: 'center' }}>
        {rotulo}…
      </span>
    </div>
  )
}

export function MensagemDeErro({ erro }: { erro: unknown }) {
  const texto =
    erro instanceof FalhaDaApi
      ? erro.message
      : 'Algo deu errado. Tente novamente em instantes.'

  return (
    <div className="aviso aviso--erro" role="alert">
      {texto}
    </div>
  )
}

export function Vazio({ children }: { children: ReactNode }) {
  return <div className="vazio">{children}</div>
}

const ROTULO_DO_STATUS: Record<StatusDoEvento, string> = {
  RASCUNHO: 'Rascunho',
  PUBLICADO: 'Publicado',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
}

const CLASSE_DO_STATUS: Record<StatusDoEvento, string> = {
  RASCUNHO: 'etiqueta--rascunho',
  PUBLICADO: 'etiqueta--publicado',
  ENCERRADO: '',
  CANCELADO: 'etiqueta--cancelado',
}

export function EtiquetaDeStatus({ status }: { status: StatusDoEvento }) {
  return (
    <span className={`etiqueta ${CLASSE_DO_STATUS[status]}`}>
      {ROTULO_DO_STATUS[status]}
    </span>
  )
}

interface Busca<T> {
  dados: T | null
  carregando: boolean
  erro: unknown
  recarregar: () => void
}

/**
 * Busca dados e devolve os três estados que toda tela precisa tratar.
 *
 * <p>O {@code cancelado} do efeito não é zelo excessivo: navegar entre dois
 * eventos rápido dispara duas buscas, e sem ele a resposta LENTA da primeira
 * chega depois e sobrescreve a segunda — a tela mostra o evento errado, e o
 * bug só aparece em conexão ruim, que é justamente onde ninguém testa.</p>
 *
 * @param buscar   função que faz a chamada
 * @param gatilhos valores que, ao mudarem, refazem a busca (slug, id)
 */
export function useBusca<T>(
  buscar: () => Promise<T>,
  gatilhos: unknown[],
): Busca<T> {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<unknown>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro(null)

    buscar()
      .then((resultado) => {
        if (!cancelado) {
          setDados(resultado)
        }
      })
      .catch((falha: unknown) => {
        if (!cancelado) {
          setErro(falha)
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
    // `buscar` é recriada a cada render; os gatilhos declarados pelo
    // chamador é que dizem quando a busca precisa acontecer de novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...gatilhos, tentativa])

  const recarregar = useCallback(() => setTentativa((n) => n + 1), [])

  return { dados, carregando, erro, recarregar }
}

/**
 * Envolve o trio carregando/erro/conteúdo, para que cada tela não repita o
 * mesmo encadeamento de ternários.
 */
export function Conteudo<T>({
  busca,
  children,
}: {
  busca: Busca<T>
  children: (dados: T) => ReactNode
}) {
  if (busca.carregando) {
    return <Carregando />
  }
  if (busca.erro) {
    return <MensagemDeErro erro={busca.erro} />
  }
  if (busca.dados === null) {
    return null
  }
  return <>{children(busca.dados)}</>
}
