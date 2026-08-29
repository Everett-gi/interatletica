import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Api } from '../api/rotas'
import type { MinhaAtletica, Papel, PerfilDaSessao } from '../api/tipos'

/**
 * Quem está logado, onde tem vínculo e com que papel.
 *
 * <p>Carregado uma vez na abertura do app. Toda tela pergunta a este
 * contexto em vez de refazer {@code GET /api/eu} — que é a chamada mais
 * repetida de qualquer SPA com sessão, e a que mais aparece duplicada na aba
 * de rede quando cada componente resolve buscar sozinho.</p>
 */

interface Sessao {
  perfil: PerfilDaSessao | null
  carregando: boolean
  /** Recarrega depois de aceitar convite ou mudar de papel. */
  recarregar: () => Promise<void>
  /** O vínculo com uma atlética, ou null se não houver. */
  vinculo: (slug: string) => MinhaAtletica | null
  /** Papel suficiente naquela atlética, seguindo a hierarquia do servidor. */
  podeAtuarComo: (slug: string, exigido: Papel) => boolean
}

const ContextoDeSessao = createContext<Sessao | null>(null)

/**
 * A mesma hierarquia de {@code Papel.podeAtuarComo} no servidor.
 *
 * <p>Duplicar regra de permissão no cliente é aceitável aqui, e só aqui,
 * porque o que ela decide é o que APARECE na tela — nunca o que é permitido.
 * Quem autoriza de verdade é o {@code @PreAuthorize} do servidor; esconder o
 * botão é cortesia, não segurança.</p>
 */
const FORCA: Record<Papel, number> = {
  PRESIDENTE: 0,
  DIRETOR: 1,
  MEMBRO: 2,
}

export function ProvedorDeSessao({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilDaSessao | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    try {
      setPerfil(await Api.sessao())
    } catch {
      // Falha de rede na abertura não pode virar tela de erro: o visitante
      // deslogado precisa ver a vitrine mesmo assim. Segue como anônimo.
      setPerfil(null)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const valor = useMemo<Sessao>(() => {
    const vinculo = (slug: string): MinhaAtletica | null =>
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
    }
  }, [perfil, carregando, carregar])

  return (
    <ContextoDeSessao.Provider value={valor}>{children}</ContextoDeSessao.Provider>
  )
}

export function useSessao(): Sessao {
  const contexto = useContext(ContextoDeSessao)
  if (!contexto) {
    throw new Error('useSessao precisa estar dentro de <ProvedorDeSessao>')
  }
  return contexto
}
