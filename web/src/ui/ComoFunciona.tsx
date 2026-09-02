import { useEffect, useState } from 'react'
import { Icone } from './icones'
import { explicacaoDe } from './tutorial'

const CHAVE = 'interatletica:ajuda-vista'

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
 * A ajuda contextual de cada tela (§82).
 *
 * <p>Aparece aberta na primeira vez que a pessoa entra na tela, e depois
 * disso encolhe para uma linha discreta que reabre num clique. Nunca some de
 * vez: seis meses depois é outra diretoria olhando a mesma tela pela primeira
 * vez, e ela não deveria precisar procurar um manual.</p>
 *
 * <p>Fica no topo do conteúdo, acima do título da página, porque é onde o
 * olho vai primeiro — e é aí que a pergunta "o que é isto?" existe. Depois de
 * dispensada, a linha fina não compete com nada.</p>
 */
export function ComoFunciona({ caminho }: { caminho: string }) {
  const explicacao = explicacaoDe(caminho)
  const chave = caminho || 'inicio'
  const [aberta, setAberta] = useState(false)

  // A decisão de abrir depende do que está guardado, e o caminho muda a cada
  // navegação — daí ler no efeito em vez de no estado inicial.
  useEffect(() => {
    setAberta(!vistas().includes(chave))
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
        O que é esta tela?
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

/** Reabre a ajuda de todas as telas. Usada pela central de ajuda. */
export function reiniciarAjuda(): void {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // Sem armazenamento não há o que limpar.
  }
}
