/**
 * Guarda o convite entre a saída para o Google e a volta.
 *
 * <p>O fluxo OAuth termina em {@code /} — o Spring redireciona para a raiz e
 * não conhece rotas de cliente. Sem esta lembrança, quem clica em "entrar
 * para aceitar" volta logado para a home e o convite simplesmente sumiu; a
 * pessoa precisaria achar o link no WhatsApp de novo, e é aí que ela
 * desiste.</p>
 *
 * <p>{@code sessionStorage}, e não {@code localStorage}: o convite vale para
 * esta ida ao Google e mais nada. Em localStorage, um convite abandonado
 * ficaria sequestrando a home em toda visita futura.</p>
 */

const CHAVE = 'interatletica:convite-pendente'

export function lembrarConvite(token: string): void {
  try {
    sessionStorage.setItem(CHAVE, token)
  } catch {
    // Navegador com armazenamento bloqueado (aba anônima restrita, iOS com
    // ITP agressivo). Perde-se a retomada, não o login.
  }
}

export function retomarConvite(): string | null {
  try {
    const token = sessionStorage.getItem(CHAVE)
    if (token) {
      sessionStorage.removeItem(CHAVE)
    }
    return token
  } catch {
    return null
  }
}
