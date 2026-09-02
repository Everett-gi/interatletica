import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Abre e fecha um painel flutuante — menu de perfil, seletor de contexto,
 * resultados da busca.
 *
 * <p>Fecha no Esc e no clique fora, que são as duas saídas que as pessoas
 * tentam antes de procurar um botão de fechar. Sem elas, cada menu aberto
 * vira uma armadilha, e o app parece travado.</p>
 */
export function useMenu<T extends HTMLElement>(): {
  aberto: boolean
  abrir: () => void
  fechar: () => void
  alternar: () => void
  ancora: RefObject<T>
} {
  const [aberto, setAberto] = useState(false)
  const ancora = useRef<T>(null)

  useEffect(() => {
    if (!aberto) return

    const aoClicar = (evento: MouseEvent) => {
      if (!ancora.current?.contains(evento.target as Node)) {
        setAberto(false)
      }
    }
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAberto(false)
    }

    // `mousedown` e não `click`: o clique de um item do menu remove o item da
    // árvore antes do `click` chegar aqui, e o teste de "está dentro?" daria
    // falso — o menu fecharia por engano no caminho certo.
    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicar)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  return {
    aberto,
    abrir: () => setAberto(true),
    fechar: () => setAberto(false),
    alternar: () => setAberto((v) => !v),
    ancora,
  }
}
