/**
 * Tema por atlética.
 *
 * <p>A migration já guarda `cor_primaria` e `cor_secundaria` em cada
 * atlética. Isso deixa de ser enfeite quando o hub inteiro se pinta com
 * elas: entrar no hub dos Dragões e no das Corujas passa a ser
 * visivelmente entrar em lugares diferentes, sem que nenhuma delas seja
 * "dona" da plataforma. Território comum, cada uma com a própria cara.</p>
 *
 * <p>O trabalho aqui é garantir que qualquer cor que a diretoria escolher
 * continue legível. Uma atlética com amarelo #F5D90A como cor primária não
 * pode produzir texto branco sobre amarelo.</p>
 */

export type Aparencia = 'clara' | 'escura'

interface Rgb {
  r: number
  g: number
  b: number
}

function hexParaRgb(hex: string): Rgb | null {
  const limpo = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) {
    return null
  }
  return {
    r: parseInt(limpo.slice(0, 2), 16),
    g: parseInt(limpo.slice(2, 4), 16),
    b: parseInt(limpo.slice(4, 6), 16),
  }
}

/**
 * Luminância relativa da WCAG. Serve para decidir se o texto por cima da cor
 * da atlética deve ser branco ou quase preto — a conta que evita "amarelo com
 * texto branco", ilegível para qualquer pessoa e reprovado em contraste.
 */
function luminancia({ r, g, b }: Rgb): number {
  const canal = (valor: number) => {
    const v = valor / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

function clarear({ r, g, b }: Rgb, fator: number): Rgb {
  return {
    r: Math.round(r + (255 - r) * fator),
    g: Math.round(g + (255 - g) * fator),
    b: Math.round(b + (255 - b) * fator),
  }
}

function escurecer({ r, g, b }: Rgb, fator: number): Rgb {
  return {
    r: Math.round(r * (1 - fator)),
    g: Math.round(g * (1 - fator)),
    b: Math.round(b * (1 - fator)),
  }
}

const paraCss = ({ r, g, b }: Rgb) => `rgb(${r} ${g} ${b})`

/**
 * Aplica a cor da atlética nas variáveis CSS do documento.
 *
 * @param cor       cor primária em hexadecimal, ou null para voltar ao padrão
 * @param aparencia tema atual — a mesma cor precisa de ajustes diferentes
 *                  sobre fundo claro e sobre fundo escuro
 */
export function aplicarCorDaAtletica(cor: string | null, aparencia: Aparencia): void {
  const raiz = document.documentElement
  const rgb = cor ? hexParaRgb(cor) : null

  if (!rgb) {
    // Volta ao azul padrão da plataforma removendo as sobrescritas.
    for (const nome of ['--acento', '--acento-forte', '--acento-suave',
                        '--sobre-acento', '--acento-tenue']) {
      raiz.style.removeProperty(nome)
    }
    return
  }

  // No tema escuro, cor muito fechada some no fundo; no claro, cor muito
  // aberta some no papel. Cada um puxa a cor para o lado onde ela aparece.
  const base = aparencia === 'escura'
    ? (luminancia(rgb) < 0.18 ? clarear(rgb, 0.35) : rgb)
    : (luminancia(rgb) > 0.62 ? escurecer(rgb, 0.3) : rgb)

  raiz.style.setProperty('--acento', paraCss(base))
  raiz.style.setProperty('--acento-forte', paraCss(escurecer(base, 0.18)))
  raiz.style.setProperty('--acento-suave', paraCss(clarear(base, 0.22)))

  // 0.45 é o ponto em que texto branco deixa de ter contraste suficiente.
  raiz.style.setProperty('--sobre-acento',
    luminancia(base) > 0.45 ? '#10161f' : '#ffffff')

  const { r, g, b } = base
  raiz.style.setProperty('--acento-tenue', `rgb(${r} ${g} ${b} / 0.14)`)
}

const CHAVE_DA_APARENCIA = 'interatletica:aparencia'

export function aparenciaSalva(): Aparencia {
  try {
    const guardada = localStorage.getItem(CHAVE_DA_APARENCIA)
    if (guardada === 'clara' || guardada === 'escura') {
      return guardada
    }
  } catch {
    // Armazenamento bloqueado (aba anônima restrita). Segue no padrão.
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches
    ? 'clara'
    : 'escura'
}

export function aplicarAparencia(aparencia: Aparencia): void {
  document.documentElement.dataset.tema = aparencia
  try {
    localStorage.setItem(CHAVE_DA_APARENCIA, aparencia)
  } catch {
    // Sem persistência: a escolha vale só nesta visita, o que é aceitável.
  }
}

/**
 * Cor estável a partir de um texto. Usada para dar identidade a atléticas
 * sem cor cadastrada e a modalidades — sempre a mesma cor para o mesmo
 * nome, sem precisar guardar nada.
 */
export function corDerivada(texto: string): string {
  let soma = 0
  for (let i = 0; i < texto.length; i++) {
    soma = (soma * 31 + texto.charCodeAt(i)) % 360
  }
  return `hsl(${soma} 55% 45%)`
}

/** Iniciais para brasão ausente: "Atlética Dragões" vira "DR". */
export function iniciais(nome: string, sigla?: string | null): string {
  if (sigla) {
    return sigla.slice(0, 3).toUpperCase()
  }
  const partes = nome.split(' ').filter((p) => p.length > 2)
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '??'
}
