import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Dados, MODO_DEMO } from '../dados'
import type { MinhaAtletica, Papel, PerfilDaSessao } from '../api/tipos'
import { aparenciaSalva, aplicarAparencia, type Aparencia } from '../ui/tema'

/**
 * Quem está logado, onde tem vínculo, com que papel — e a aparência.
 *
 * <p>Carregado uma vez na abertura. Toda tela pergunta aqui em vez de
 * refazer a chamada de sessão, que é a requisição mais duplicada de
 * qualquer SPA quando cada componente resolve buscar sozinho.</p>
 */

interface Sessao {
  perfil: PerfilDaSessao | null
  carregando: boolean
  recarregar: () => Promise<void>
  vinculo: (slug: string) => MinhaAtletica | null
  podeAtuarComo: (slug: string, exigido: Papel) => boolean
  aparencia: Aparencia
  trocarAparencia: () => void
  /** Só no modo demonstração: troca o papel para mostrar o que cada um vê. */
  assumirPapel: (papel: Papel | 'VISITANTE') => Promise<void>
}

const ContextoDeSessao = createContext<Sessao | null>(null)

/**
 * A mesma hierarquia de `Papel.podeAtuarComo` no servidor.
 *
 * <p>Duplicar regra de permissão no cliente é aceitável aqui, e só aqui,
 * porque o que ela decide é o que APARECE. Quem autoriza é o
 * `@PreAuthorize` do servidor; esconder o botão é cortesia, não segurança.</p>
 */
const FORCA: Record<Papel, number> = { PRESIDENTE: 0, DIRETOR: 1, MEMBRO: 2 }

export function ProvedorDeSessao({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilDaSessao | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [aparencia, setAparencia] = useState<Aparencia>(() => aparenciaSalva())

  useEffect(() => {
    aplicarAparencia(aparencia)
  }, [aparencia])

  const carregar = useCallback(async () => {
    try {
      setPerfil(await Dados.sessao())
    } catch {
      // Falha de rede na abertura não pode virar tela de erro: o visitante
      // deslogado precisa ver a descoberta mesmo assim.
      setPerfil(null)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  const valor = useMemo<Sessao>(() => {
    const vinculo = (slug: string) =>
      perfil?.atleticas.find((a) => a.atletica.slug === slug) ?? null

    return {
      perfil,
      carregando,
      recarregar: carregar,
      vinculo,
      podeAtuarComo: (slug, exigido) => {
        const meu = vinculo(slug)
        return meu !== null && FORCA[meu.papel] <= FORCA[exigido]
      },
      aparencia,
      trocarAparencia: () =>
        setAparencia((atual) => (atual === 'escura' ? 'clara' : 'escura')),
      assumirPapel: async (papel) => {
        if (!MODO_DEMO) return
        setPerfil(await Dados.assumirPapel(papel))
      },
    }
  }, [perfil, carregando, carregar, aparencia])

  return <ContextoDeSessao.Provider value={valor}>{children}</ContextoDeSessao.Provider>
}

export function useSessao(): Sessao {
  const contexto = useContext(ContextoDeSessao)
  if (!contexto) {
    throw new Error('useSessao precisa estar dentro de <ProvedorDeSessao>')
  }
  return contexto
}
