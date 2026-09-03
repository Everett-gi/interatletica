/**
 * Liga as duas lojas de demonstração ao armazenamento do navegador.
 *
 * <p>É o único módulo que enxerga as duas, e por isso é ele que orquestra:
 * as lojas apenas avisam "mudei" por um retorno de chamada. A dependência
 * aponta num sentido só, o que evita o ciclo que existiria se cada loja
 * importasse o armazenamento e o armazenamento importasse as lojas.</p>
 */

import type { AtleticaResumo } from '../api/tipos'
import {
  exportarFatiaDaLoja,
  importarFatiaDaLoja,
  observarMudancas,
  sessaoAtual,
  type FatiaDaLoja,
} from './loja'
import {
  exportarFatiaDosModulos,
  importarFatiaDosModulos,
  observarMudancasDosModulos,
  type FatiaDosModulos,
} from './lojaDosModulos'
import { gravar, ler, limpar } from './persistencia'

/**
 * Espera antes de gravar.
 *
 * <p>Arrastar uma ficha de tarefa entre colunas dispara várias alterações em
 * sequência; gravar em cada uma seria serializar o estado cinco vezes para
 * chegar no mesmo lugar. Meio segundo agrupa a rajada sem que a pessoa
 * consiga fechar a aba no meio.</p>
 */
const ESPERA_MS = 500

let relogio: ReturnType<typeof setTimeout> | null = null

function salvarAgora(): void {
  const sessao = sessaoAtual()
  const fatiaDaLoja = exportarFatiaDaLoja()

  // Sem sessão própria não há o que guardar — e é assim que sair limpa o
  // registro, em vez de deixar dado órfão que ninguém mais alcança.
  if (!sessao || !fatiaDaLoja) {
    limpar()
    return
  }

  const meus = new Set(sessao.atleticas.map((v) => v.atletica.slug))

  gravar({
    sessao,
    atleticas: fatiaDaLoja.atleticasCriadas,
    loja: fatiaDaLoja as unknown as Record<string, unknown>,
    modulos: exportarFatiaDosModulos(meus) as unknown as Record<string, unknown>,
  })
}

function agendarSalvamento(): void {
  if (relogio !== null) {
    clearTimeout(relogio)
  }
  relogio = setTimeout(() => {
    relogio = null
    salvarAgora()
  }, ESPERA_MS)
}

/**
 * Restaura o que estava guardado e passa a acompanhar as mudanças.
 *
 * <p>Chamada uma vez, na subida do app e antes da primeira leitura de sessão.
 * A semente já está carregada neste ponto — com as datas relativas a hoje —,
 * e o que se faz aqui é sobrepor a parte da pessoa.</p>
 */
export function iniciarPersistencia(): void {
  const guardado = ler()

  if (guardado?.sessao) {
    const atleticas = (guardado.atleticas ?? []) as AtleticaResumo[]
    importarFatiaDaLoja(
      (guardado.loja ?? {}) as Partial<FatiaDaLoja>,
      guardado.sessao,
    )
    importarFatiaDosModulos(
      (guardado.modulos ?? {}) as Partial<FatiaDosModulos>,
      atleticas,
    )
  }

  observarMudancas(agendarSalvamento)
  observarMudancasDosModulos(agendarSalvamento)
}

/** Descarta o que está guardado. Usada pelo "recomeçar a demonstração". */
export function descartarDemonstracao(): void {
  if (relogio !== null) {
    clearTimeout(relogio)
    relogio = null
  }
  limpar()
}
