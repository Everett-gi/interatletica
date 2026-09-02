import { useEffect, useState } from 'react'
import { Icone, type NomeDoIcone } from '../ui/icones'

const CHAVE = 'interatletica:tour-visto'

export function tourJaVisto(): boolean {
  try {
    return localStorage.getItem(CHAVE) === 'sim'
  } catch {
    return true
  }
}

export function marcarTourVisto(): void {
  try {
    localStorage.setItem(CHAVE, 'sim')
  } catch {
    // Sem armazenamento o tour reaparece na próxima visita. Chato, não grave.
  }
}

export function reiniciarTour(): void {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // Nada a limpar.
  }
}

interface Parada {
  /** O elemento a destacar. Ausente ou não encontrado: cartão centralizado. */
  alvo?: string
  icone: NomeDoIcone
  titulo: string
  texto: string
}

const PARADAS: Parada[] = [
  {
    icone: 'painel',
    titulo: 'Um tour de trinta segundos',
    texto:
      'A plataforma tem muita coisa, e quase tudo pode esperar. Estas cinco '
      + 'paradas mostram só o que você usa desde o primeiro dia. Dá para pular '
      + 'e refazer depois, pela central de ajuda.',
  },
  {
    alvo: '#navegacao-principal',
    icone: 'menu',
    titulo: 'Tudo em grupos, não em lista',
    texto:
      'A navegação é agrupada por assunto: a sua atlética, a gestão do dia a '
      + 'dia, eventos, esportes, financeiro, a rede, o conhecimento, o mercado '
      + 'e a comunicação. Você não precisa conhecer os quarenta destinos — só '
      + 'o grupo onde a sua pergunta mora.',
  },
  {
    alvo: '.contexto__botao',
    icone: 'atletica',
    titulo: 'Em qual atlética você está',
    texto:
      'O papel mora no vínculo, não na pessoa: dá para presidir uma atlética e '
      + 'ser membro comum de outra. Este seletor diz onde você está agora, e é '
      + 'o que explica por que um botão aparece aqui e não aparece lá.',
  },
  {
    alvo: '#campo-de-busca',
    icone: 'busca',
    titulo: 'Ache qualquer coisa, de qualquer lugar',
    texto:
      'Pessoas, eventos, documentos, fornecedores, perguntas da rede — e também '
      + 'as próprias telas: digitar "financeiro" leva ao financeiro. O que é da '
      + 'sua atlética aparece primeiro. O atalho é Ctrl + K.',
  },
  {
    alvo: '.como-funciona',
    icone: 'info',
    titulo: 'Cada tela explica o que é',
    texto:
      'Esta caixa aparece na primeira vez que você entra em cada tela, dizendo '
      + 'para que ela serve e como se usa. Depois de dispensada, encolhe para '
      + 'uma linha que reabre num clique — nunca some de vez, porque a próxima '
      + 'diretoria vai chegar aqui sem ter visto nada.',
  },
]

/**
 * O tour de primeiro acesso (§80 e §82).
 *
 * <p>Cinco paradas, e nenhuma delas ensina um módulo — ensinam a
 * <em>navegar</em>. O que cada módulo faz está na ajuda contextual da própria
 * tela, que é onde a pergunta aparece. Tour que tenta explicar quarenta telas
 * de uma vez é tour que se pula.</p>
 *
 * <p>O destaque é desenhado a partir da posição real do elemento. Quando ele
 * não existe — no celular a barra lateral está fechada, por exemplo — a
 * parada vira um cartão centralizado em vez de apontar para o vazio.</p>
 */
export function TourInicial({ aoEncerrar }: { aoEncerrar: () => void }) {
  const [indice, setIndice] = useState(0)
  const [area, setArea] = useState<DOMRect | null>(null)

  const parada = PARADAS[indice]
  const ultima = indice === PARADAS.length - 1

  useEffect(() => {
    function medir() {
      const alvo = parada.alvo
        ? document.querySelector(parada.alvo)
        : null
      const caixa = alvo?.getBoundingClientRect() ?? null
      // Elemento presente na árvore mas fora da tela (lateral recolhida em
      // gaveta) tem largura zero — apontar para ele seria pior que não apontar.
      setArea(caixa && caixa.width > 8 && caixa.right > 0 ? caixa : null)
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [parada])

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { marcarTourVisto(); aoEncerrar() }
      if (e.key === 'ArrowRight' && !ultima) setIndice((i) => i + 1)
      if (e.key === 'ArrowLeft' && indice > 0) setIndice((i) => i - 1)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoEncerrar, ultima, indice])

  function encerrar() {
    marcarTourVisto()
    aoEncerrar()
  }

  const margem = 8
  const cartaoAncorado = area !== null

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Tour da plataforma">
      {area ? (
        <div
          className="tour__foco"
          style={{
            top: area.top - margem,
            left: area.left - margem,
            width: area.width + margem * 2,
            height: area.height + margem * 2,
          }}
          aria-hidden="true"
        />
      ) : null}

      <div
        className={`tour__cartao${cartaoAncorado ? ' tour__cartao--ancorado' : ''}`}
        style={cartaoAncorado ? posicionar(area) : undefined}
      >
        <div className="linha" style={{ gap: '0.55rem', marginBottom: '0.5rem' }}>
          <span className="notificacao__icone">
            <Icone nome={parada.icone} tamanho={17} />
          </span>
          <strong style={{ flex: 1, minWidth: 0 }}>{parada.titulo}</strong>
          <span className="fraco">{indice + 1}/{PARADAS.length}</span>
        </div>

        <p className="suave" style={{ marginBottom: '1rem' }}>{parada.texto}</p>

        <div className="linha entre">
          <button className="botao botao--fantasma botao--pequeno" onClick={encerrar}>
            {ultima ? 'Fechar' : 'Pular'}
          </button>

          <div className="linha" style={{ gap: '0.35rem' }}>
            {indice > 0 ? (
              <button className="botao botao--discreto botao--pequeno"
                      onClick={() => setIndice((i) => i - 1)}>
                Voltar
              </button>
            ) : null}
            {ultima ? (
              <button className="botao botao--pequeno" onClick={encerrar}>
                Começar a usar
              </button>
            ) : (
              <button className="botao botao--pequeno"
                      onClick={() => setIndice((i) => i + 1)}>
                Próximo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Encosta o cartão no elemento destacado, do lado onde há espaço.
 *
 * <p>Abaixo por padrão; acima quando o elemento está na metade de baixo da
 * tela. E preso às bordas com uma margem, para o cartão nunca sair da janela
 * num alvo que esteja no canto.</p>
 */
function posicionar(area: DOMRect): { top: number; left: number } {
  const largura = 22 * 16
  const alturaEstimada = 230
  const folga = 16

  const abaixo = area.bottom + folga
  const acima = area.top - alturaEstimada - folga
  const top = abaixo + alturaEstimada < window.innerHeight || acima < folga
    ? abaixo
    : acima

  const left = Math.min(
    Math.max(folga, area.left),
    Math.max(folga, window.innerWidth - largura - folga),
  )

  return { top, left }
}
