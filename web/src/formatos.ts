/**
 * Datas e horas em português do Brasil.
 *
 * <p>O servidor manda ISO-8601 com offset ({@code 2026-03-14T21:00:00-03:00})
 * e guarda em UTC. Formatar com {@code Intl} e fuso explícito de São Paulo,
 * em vez do fuso do aparelho, evita que a festa da meia-noite apareça no dia
 * seguinte para alguém cujo celular está com o relógio em outro país — ou
 * simplesmente errado, que é mais comum.</p>
 */

const FUSO = 'America/Sao_Paulo'
const LOCAL = 'pt-BR'

const DATA_E_HORA = new Intl.DateTimeFormat(LOCAL, {
  timeZone: FUSO,
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const DATA_COMPLETA = new Intl.DateTimeFormat(LOCAL, {
  timeZone: FUSO,
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const SO_HORA = new Intl.DateTimeFormat(LOCAL, {
  timeZone: FUSO,
  hour: '2-digit',
  minute: '2-digit',
})

export function dataEHora(iso: string | null): string {
  return iso ? DATA_E_HORA.format(new Date(iso)) : 'sem data'
}

export function dataPorExtenso(iso: string | null): string {
  return iso ? DATA_COMPLETA.format(new Date(iso)) : 'sem data'
}

export function hora(iso: string | null): string {
  return iso ? SO_HORA.format(new Date(iso)) : 'sem horário'
}

/**
 * "em 3 dias", "há 2 horas". Usado no prazo do convite e na contagem para o
 * evento — quem lê quer saber se dá tempo, não a data exata.
 */
export function quando(iso: string): string {
  const alvo = new Date(iso).getTime()
  const diferenca = alvo - Date.now()
  const relativo = new Intl.RelativeTimeFormat(LOCAL, { numeric: 'auto' })

  const minuto = 60_000
  const hora_ = 60 * minuto
  const dia = 24 * hora_

  const absoluto = Math.abs(diferenca)
  if (absoluto < hora_) {
    return relativo.format(Math.round(diferenca / minuto), 'minute')
  }
  if (absoluto < dia) {
    return relativo.format(Math.round(diferenca / hora_), 'hour')
  }
  return relativo.format(Math.round(diferenca / dia), 'day')
}

/**
 * Converte o valor de um `<input type="datetime-local">` em ISO com offset.
 *
 * <p>O input entrega {@code 2026-03-14T21:00} sem fuso nenhum. Mandar essa
 * string crua para a API faria o Java interpretá-la como UTC, e o evento das
 * 21h viraria 18h na tela de todo mundo. Construir um {@code Date} local e
 * pedir o ISO resolve, porque aí o navegador aplica o fuso do aparelho — que
 * é o mesmo em que a diretoria digitou o horário.</p>
 */
export function doInputParaIso(valor: string): string | null {
  if (!valor) {
    return null
  }
  return new Date(valor).toISOString()
}

const SO_DATA = new Intl.DateTimeFormat(LOCAL, {
  timeZone: FUSO,
  day: '2-digit',
  month: 'short',
})

const MES_E_ANO = new Intl.DateTimeFormat(LOCAL, {
  timeZone: FUSO,
  month: 'long',
  year: 'numeric',
})

/** "18 set" — para cartão, tabela e calendário, onde a hora não cabe. */
export function dataCurta(iso: string | null): string {
  return iso ? SO_DATA.format(new Date(iso)) : '—'
}

/** "setembro de 2026" — cabeçalho de mês. */
export function mesEAno(data: Date): string {
  return MES_E_ANO.format(data)
}

const DINHEIRO = new Intl.NumberFormat(LOCAL, {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
})

const DINHEIRO_REDONDO = new Intl.NumberFormat(LOCAL, {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

/**
 * Dinheiro em reais.
 *
 * <p>O padrão arredonda para o real inteiro. Num painel, "R$ 8.420" é o
 * número que a pessoa quer; "R$ 8.420,00" ocupa mais espaço para dizer o
 * mesmo. Os centavos aparecem onde importam — lançamento e comprovante —,
 * pedindo {@code exato}.</p>
 */
export function dinheiro(valor: number, exato = false): string {
  return (exato ? DINHEIRO : DINHEIRO_REDONDO).format(valor)
}

const NUMERO = new Intl.NumberFormat(LOCAL)

export function numero(valor: number): string {
  return NUMERO.format(valor)
}

/** "+18%", "−4%", "0%". O sinal vem antes porque é o que se lê primeiro. */
export function variacao(percentual: number): string {
  const sinal = percentual > 0 ? '+' : percentual < 0 ? '−' : ''
  return `${sinal}${Math.abs(percentual)}%`
}

/** "68%" a partir de uma proporção de 0 a 1, presa nos limites. */
export function percentual(proporcao: number): string {
  return `${Math.round(Math.min(1, Math.max(0, proporcao)) * 100)}%`
}

/** O caminho inverso: ISO da API para o formato que o input aceita. */
export function doIsoParaInput(iso: string | null): string {
  if (!iso) {
    return ''
  }
  const data = new Date(iso)
  const doisDigitos = (n: number) => String(n).padStart(2, '0')
  return (
    `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-` +
    `${doisDigitos(data.getDate())}T${doisDigitos(data.getHours())}:` +
    `${doisDigitos(data.getMinutes())}`
  )
}
