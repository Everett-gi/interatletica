/** Espelho de {@code ErroResposta} — o corpo de erro único da API. */
export interface ErroDaApi {
  status: number
  /** Identificador estável em maiúsculas: CONVITE_EXPIRADO, JA_INSCRITO. */
  erro: string
  /** Texto em português, pronto para exibir. */
  mensagem: string
  campos?: { campo: string; mensagem: string }[]
  momento: string
}
