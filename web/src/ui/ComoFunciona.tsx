import { useEffect, useState } from 'react'
import { Icone } from './icones'
import { explicacaoDe } from './tutorial'

const CHAVE = 'interatletica:ajuda-vista'
const CHAVE_AUTOMATICA = 'interatletica:ajuda-automatica'

/**
 * As telas cuja explicação a pessoa já dispensou.
 *
 * <p>Guardado por tela, e não um interruptor global: dispensar a ajuda das
 * tarefas não deveria calar a do financeiro, que é a que ela ainda não
 * abriu.</p>
 */
function vistas(): string[] {
  try {
    const guardado = localStorage.getItem(CHAVE)
    return guardado ? (JSON.parse(guardado) as string[]) : []
  } catch {
    return []
  }
}

function marcarVista(chave: string): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify([...new Set([...vistas(), chave])]))
  } catch {
    // Armazenamento bloqueado: a ajuda reaparece na próxima visita, o que é
    // preferível a sumir para sempre.
  }
}

/**
 * Quem pediu para as explicações abrirem sozinhas.
 *
 * <p>Desligado por padrão. A caixa aberta ocupa um quarto da tela, e em
 * quarenta telas isso vira uma plataforma que parece um manual: a pessoa
 * rola por três parágrafos antes de ver o próprio saldo. Quem está
 * aprendendo liga na central de ajuda e passa a ver todas abertas.</p>
 */
function abreSozinha(): boolean {
  try {
    return localStorage.getItem(CHAVE_AUTOMATICA) === 'sim'
  } catch {
    return false
  }
}

/**
 * A ajuda contextual de cada tela (§82).
 *
 * <p>Encolhida numa linha, e a linha nunca some: seis meses depois é outra
 * diretoria olhando a mesma tela pela primeira vez, e ela não deveria
 * precisar procurar um manual. Mas também não deveria ter que fechar uma
 * caixa em cada uma das quarenta telas para chegar ao conteúdo — por isso a
 * explicação abre num clique, e não sozinha.</p>
 *
 * <p>Fica acima do título da página porque é onde a pergunta "o que é isto?"
 * existe. Encolhida, não compete com nada.</p>
 */
export function ComoFunciona({ caminho }: { caminho: string }) {
  const explicacao = explicacaoDe(caminho)
  const chave = caminho || 'inicio'
  const [aberta, setAberta] = useState(false)

  // A decisão de abrir depende do que está guardado, e o caminho muda a cada
  // navegação — daí ler no efeito em vez de no estado inicial.
  useEffect(() => {
    setAberta(abreSozinha() && !vistas().includes(chave))
  }, [chave])

  if (!explicacao) {
    return null
  }

  if (!aberta) {
    return (
      <button
        className="como-funciona__gatilho"
        onClick={() => setAberta(true)}
        aria-expanded="false"
      >
        <Icone nome="info" tamanho={14} />
        Como funciona {explicacao.titulo.toLowerCase()}
      </button>
    )
  }

  return (
    <aside className="como-funciona" aria-label={`Ajuda: ${explicacao.titulo}`}>
      <div className="como-funciona__cabecalho">
        <span className="como-funciona__icone" aria-hidden="true">
          <Icone nome="info" tamanho={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{explicacao.titulo}</strong>
          <p className="como-funciona__resumo">{explicacao.oQueE}</p>
        </div>
        <button
          className="icone-botao"
          onClick={() => { marcarVista(chave); setAberta(false) }}
          aria-label="Dispensar esta ajuda"
          title="Entendi — encolher"
        >
          <Icone nome="fechar" tamanho={16} />
        </button>
      </div>

      <ul className="como-funciona__passos">
        {explicacao.comoUsar.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ul>

      {explicacao.porQue ? (
        <p className="como-funciona__porque">
          <strong>Por quê:</strong> {explicacao.porQue}
        </p>
      ) : null}

      <button
        className="botao botao--discreto botao--pequeno"
        onClick={() => { marcarVista(chave); setAberta(false) }}
      >
        Entendi
      </button>
    </aside>
  )
}

/**
 * Faz as explicações voltarem a abrir sozinhas, em todas as telas.
 *
 * <p>Usada pela central de ajuda, e pensada para quando entra gente nova na
 * diretoria: liga o modo aprendiz para quem quer, sem impor a caixa aberta a
 * quem já conhece a plataforma.</p>
 */
export function reiniciarAjuda(): void {
  try {
    localStorage.removeItem(CHAVE)
    localStorage.setItem(CHAVE_AUTOMATICA, 'sim')
  } catch {
    // Sem armazenamento não há o que ligar; a linha de ajuda continua lá.
  }
}

/** Volta ao padrão: explicações encolhidas, uma linha por tela. */
export function silenciarAjuda(): void {
  try {
    localStorage.removeItem(CHAVE_AUTOMATICA)
  } catch {
    // Já é o padrão.
  }
}

/** A central de ajuda mostra qual dos dois modos está valendo. */
export function ajudaAbreSozinha(): boolean {
  return abreSozinha()
}
