/**
 * Guarda a demonstração no navegador de quem está usando.
 *
 * <p>Sem isto, recarregar a página apagava a atlética que a pessoa acabou de
 * criar. Para um link público que circula, começar sempre do mesmo ponto é o
 * comportamento certo; para quem está <em>experimentando</em> a plataforma,
 * é perder o trabalho a cada F5.</p>
 *
 * <h3>O que se guarda, e por que só isso</h3>
 *
 * <p>Guardamos <strong>apenas o que é seu</strong>: a sessão, as atléticas
 * que você criou, os registros que pertencem a elas e os marcadores pessoais
 * espalhados pela rede (a comunidade em que você entrou, o voto que deu). O
 * conteúdo de exemplo — as outras atléticas, os guias, os fornecedores —
 * <strong>nunca</strong> é guardado: ele volta do pacote a cada carga.</p>
 *
 * <p>Isso não é economia de espaço, é correção. As datas do exemplo nascem
 * relativas a <em>hoje</em>: o interatlética é sempre "daqui a 23 dias".
 * Congelar isso no armazenamento traria de volta exatamente o defeito que a
 * âncora relativa existe para evitar — abrir a demonstração um mês depois e
 * ver um campeonato que já aconteceu. Restaurando só a sua parte sobre uma
 * semente sempre nova, a rede continua viva e o seu trabalho continua seu.</p>
 *
 * <h3>A demonstração preenchida não é guardada</h3>
 *
 * <p>Ela existe para apresentar, e precisa abrir idêntica todas as vezes.
 * Persistir uma sessão de apresentação faria a próxima pessoa herdar o estado
 * da anterior — que é justamente o que uma demonstração pública não pode
 * fazer.</p>
 */

import type { AtleticaResumo, PerfilDaSessao } from '../api/tipos'

/**
 * Sobe quando o formato do estado muda de um jeito que a versão anterior não
 * entende. Instantâneo de versão diferente é descartado em silêncio: um
 * usuário que volta depois de um deploy prefere começar do zero a ver a tela
 * quebrar com um campo que não existe mais.
 */
const VERSAO = 1

const CHAVE = 'interatletica:demonstracao'

export interface Instantaneo {
  versao: number
  salvoEm: string
  sessao: PerfilDaSessao | null
  /** As atléticas criadas nesta demonstração, para recolocar na rede. */
  atleticas: AtleticaResumo[]
  /** Fatia da loja principal: eventos, membros, tarefas, avisos… */
  loja: Record<string, unknown>
  /** Fatia da loja dos módulos: projetos, lançamentos, decisões… */
  modulos: Record<string, unknown>
}

export function ler(): Instantaneo | null {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) {
      return null
    }
    const dados = JSON.parse(bruto) as Instantaneo
    if (dados.versao !== VERSAO) {
      localStorage.removeItem(CHAVE)
      return null
    }
    return dados
  } catch {
    // JSON corrompido, armazenamento bloqueado, modo anônimo restrito: em
    // qualquer um dos casos a demonstração funciona em memória, como antes.
    return null
  }
}

export function gravar(instantaneo: Omit<Instantaneo, 'versao' | 'salvoEm'>): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({
      ...instantaneo,
      versao: VERSAO,
      salvoEm: new Date().toISOString(),
    }))
  } catch {
    // Cota estourada ou armazenamento indisponível. Não há o que fazer nem o
    // que avisar: a alteração já valeu em memória, e o próximo salvamento
    // tenta de novo.
  }
}

export function limpar(): void {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // Sem armazenamento não há o que limpar.
  }
}

export function existe(): boolean {
  return ler() !== null
}
