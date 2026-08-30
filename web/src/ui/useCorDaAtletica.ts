import { useEffect } from 'react'
import { useSessao } from '../sessao/SessaoContexto'
import { aplicarCorDaAtletica } from './tema'

/**
 * Pinta a interface com a cor da atlética enquanto a tela estiver montada, e
 * devolve o azul da plataforma ao sair.
 *
 * <p>Sair limpando é o ponto importante: sem isso, quem visita o hub laranja
 * dos Dragões e volta para a descoberta leva o laranja junto, e a plataforma
 * passa a parecer de uma atlética só — o contrário de território comum.</p>
 */
export function useCorDaAtletica(cor: string | null | undefined): void {
  const { aparencia } = useSessao()

  useEffect(() => {
    aplicarCorDaAtletica(cor ?? null, aparencia)
    return () => aplicarCorDaAtletica(null, aparencia)
  }, [cor, aparencia])
}
