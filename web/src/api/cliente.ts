/**
 * Cliente HTTP da API.
 *
 * <p>Nada de biblioteca: a API é same-origin, autenticada por cookie de
 * sessão, e o que sobra para o cliente fazer é mandar o cabeçalho de CSRF e
 * traduzir o corpo de erro. Isso cabe num arquivo.</p>
 */

import type { ErroDaApi } from './tipos-de-erro'

/**
 * Erro com o vocabulário da API: o {@code codigo} é estável e serve para o
 * componente decidir o que fazer; a {@code mensagem} já vem em português,
 * escrita para o usuário final, e pode ir direto à tela.
 */
export class FalhaDaApi extends Error {
  readonly status: number
  readonly codigo: string
  readonly campos: { campo: string; mensagem: string }[]

  constructor(
    status: number,
    codigo: string,
    mensagem: string,
    campos: { campo: string; mensagem: string }[] = [],
  ) {
    super(mensagem)
    this.name = 'FalhaDaApi'
    this.status = status
    this.codigo = codigo
    this.campos = campos
  }

  /** Sessão expirada ou inexistente — a tela deve oferecer login, não erro. */
  get precisaEntrar(): boolean {
    return this.status === 401
  }

  get naoEncontrado(): boolean {
    return this.status === 404
  }
}

/**
 * Lê o token de CSRF do cookie que o Spring Security escreve.
 *
 * <p>O cookie é legível por JavaScript de propósito (`withHttpOnlyFalse` no
 * servidor): é assim que o padrão cookie-to-header funciona. Quem não pode
 * ser legível é o cookie de SESSÃO — esse é HttpOnly, e é o que um XSS iria
 * querer roubar. Um token de CSRF vazado sozinho não vale nada.</p>
 */
function tokenDeCsrf(): string | null {
  const encontrado = document.cookie
    .split('; ')
    .find((parte) => parte.startsWith('XSRF-TOKEN='))
  return encontrado ? decodeURIComponent(encontrado.split('=')[1]) : null
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  corpo?: unknown
}

async function requisitar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T | null> {
  const metodo = opcoes.metodo ?? 'GET'
  const cabecalhos: Record<string, string> = { Accept: 'application/json' }

  if (opcoes.corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json'
  }
  if (metodo !== 'GET') {
    const token = tokenDeCsrf()
    if (token) {
      cabecalhos['X-XSRF-TOKEN'] = token
    }
  }

  const resposta = await fetch(caminho, {
    method: metodo,
    headers: cabecalhos,
    // Sem isto o cookie de sessão não é enviado e TODA chamada dá 401 — o
    // erro mais comum de SPA com sessão por cookie.
    credentials: 'same-origin',
    body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
  })

  // 204 é resposta legítima em várias rotas ("não há sessão", "não há
  // inscrição"). Tentar ler JSON de corpo vazio lançaria SyntaxError.
  if (resposta.status === 204) {
    return null
  }

  if (!resposta.ok) {
    throw await traduzirErro(resposta)
  }

  return (await resposta.json()) as T
}

async function traduzirErro(resposta: Response): Promise<FalhaDaApi> {
  try {
    const corpo = (await resposta.json()) as ErroDaApi
    return new FalhaDaApi(
      resposta.status,
      corpo.erro ?? 'ERRO',
      corpo.mensagem ?? 'Não foi possível completar a operação.',
      corpo.campos ?? [],
    )
  } catch {
    // Erro sem corpo JSON: 502 do Caddy, queda de rede, HTML de proxy. O
    // usuário não pode receber "Unexpected token < in JSON".
    return new FalhaDaApi(
      resposta.status,
      'FALHA_DE_REDE',
      'Não conseguimos falar com o servidor. Verifique sua conexão.',
    )
  }
}

/** Para rotas que devolvem corpo sempre. Trata 204 como falha de contrato. */
async function exigir<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const resultado = await requisitar<T>(caminho, opcoes)
  if (resultado === null) {
    throw new FalhaDaApi(500, 'RESPOSTA_VAZIA', 'O servidor respondeu sem conteúdo.')
  }
  return resultado
}

export const api = {
  get: <T>(caminho: string) => exigir<T>(caminho),
  /** Para rotas em que a ausência é resposta válida (204), não erro. */
  getOpcional: <T>(caminho: string) => requisitar<T>(caminho),
  post: <T>(caminho: string, corpo?: unknown) =>
    exigir<T>(caminho, { metodo: 'POST', corpo }),
  postSemResposta: (caminho: string, corpo?: unknown) =>
    requisitar<void>(caminho, { metodo: 'POST', corpo }),
  put: <T>(caminho: string, corpo: unknown) =>
    exigir<T>(caminho, { metodo: 'PUT', corpo }),
  remover: (caminho: string) => requisitar<void>(caminho, { metodo: 'DELETE' }),
}

/**
 * Sai da sessão e recarrega.
 *
 * <p>Recarregar em vez de limpar o estado em memória: o logout invalida a
 * sessão no servidor, e qualquer dado ainda em tela é de alguém que não está
 * mais logado. Recarga total é a única forma barata de garantir que não
 * sobrou nada.</p>
 */
export async function sair(): Promise<void> {
  await api.postSemResposta('/api/sessao/sair')
  window.location.href = '/'
}

/** Manda o navegador para o Google. Não é fetch: é navegação de verdade. */
export function entrar(): void {
  window.location.href = '/oauth2/authorization/google'
}
