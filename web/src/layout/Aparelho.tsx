import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { Dados, MODO_DEMO } from '../dados'
import type { Decisao } from '../api/tipos-gestao'
import type { Tarefa } from '../api/tipos-rede'
import type { PedidoDeAjuda } from '../api/tipos-conhecimento'
import { useSessao } from '../sessao/SessaoContexto'
import { Carregando } from '../ui/componentes'
import { useCorDaAtletica } from '../ui/useCorDaAtletica'
import { BarraLateral } from './BarraLateral'
import { BarraDoTopo } from './BarraDoTopo'
import type { ContagensDaNavegacao } from './navegacao'

const CHAVE_RECOLHIDA = 'interatletica:lateral-recolhida'

function recolhidaSalva(): boolean {
  try {
    return localStorage.getItem(CHAVE_RECOLHIDA) === 'sim'
  } catch {
    return false
  }
}

/**
 * A casca do ambiente de trabalho: barra lateral, topo e conteúdo.
 *
 * <p>Monta uma vez e sobrevive à troca de página. É o que permite manter a
 * lateral recolhida, a busca digitada e a rolagem da navegação entre uma
 * tela e outra — remontar a casca a cada rota faria a interface piscar em
 * cada clique, e é o defeito mais fácil de introduzir num app com quarenta
 * destinos.</p>
 */
export function Aparelho() {
  const { slug = '' } = useParams()
  const { perfil, carregando, vinculo, podeAtuarComo } = useSessao()
  const local = useLocation()

  const [gavetaAberta, setGavetaAberta] = useState(false)
  const [recolhida, setRecolhida] = useState(recolhidaSalva)

  const meu = vinculo(slug)
  useCorDaAtletica(meu?.atletica.corPrimaria)

  // Trocar de página fecha a gaveta. Sem isto, no celular, clicar num item
  // navega por baixo de um painel que continua cobrindo a tela.
  useEffect(() => { setGavetaAberta(false) }, [local.pathname])

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_RECOLHIDA, recolhida ? 'sim' : 'nao')
    } catch {
      // Armazenamento bloqueado: a escolha vale só nesta visita.
    }
  }, [recolhida])

  const contagens = useContagens(slug, meu !== null)

  if (carregando) {
    return <Carregando rotulo="Abrindo sua atlética" />
  }
  if (!perfil || !meu) {
    return <SemVinculo slug={slug} temSessao={perfil !== null} />
  }

  return (
    <div className="app" data-recolhida={recolhida}>
      <BarraLateral
        slug={slug}
        aberta={gavetaAberta}
        recolhida={recolhida}
        contagens={contagens}
        podeAtuarComo={podeAtuarComo}
        aoFechar={() => setGavetaAberta(false)}
        aoAlternarRecolhida={() => setRecolhida((v) => !v)}
      />

      {gavetaAberta ? (
        <button
          className="veu"
          aria-label="Fechar a navegação"
          onClick={() => setGavetaAberta(false)}
        />
      ) : null}

      <div className="app__area">
        <BarraDoTopo slug={slug} aoAbrirMenu={() => setGavetaAberta(true)} />
        <main className="app__conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/**
 * Os números que aparecem como selo na navegação.
 *
 * <p>Buscados uma vez por atlética, aqui, e não em cada tela: um selo que
 * some ao navegar sugere que a pendência foi resolvida quando nada
 * aconteceu.</p>
 */
function useContagens(slug: string, ativo: boolean): ContagensDaNavegacao {
  const [contagens, setContagens] = useState<ContagensDaNavegacao>(
    { tarefas: 0, decisoes: 0, ajuda: 0 })

  useEffect(() => {
    if (!ativo || !slug) return
    let cancelado = false

    void Promise.all([
      Dados.tarefas(slug) as Promise<Tarefa[]>,
      Dados.decisoes(slug) as Promise<Decisao[]>,
      Dados.pedidosDeAjuda() as Promise<PedidoDeAjuda[]>,
    ]).then(([tarefas, decisoes, pedidos]) => {
      if (cancelado) return
      const agora = Date.now()
      setContagens({
        // Só o que está atrasado. Contar toda tarefa aberta transformaria o
        // selo em decoração permanente, e selo permanente ninguém mais vê.
        tarefas: tarefas.filter((t) =>
          t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA'
          && t.prazo !== null && new Date(t.prazo).getTime() < agora).length,
        decisoes: decisoes.filter((d) =>
          d.status === 'EM_VOTACAO' && d.meuVoto === null).length,
        ajuda: pedidos.filter((p) => p.status === 'ABERTO').length,
      })
    })

    return () => { cancelado = true }
  }, [slug, ativo])

  return contagens
}

/** Quem chega no hub de uma atlética sem vínculo. */
function SemVinculo({ slug, temSessao }: { slug: string; temSessao: boolean }) {
  const { assumirPapel } = useSessao()

  return (
    <div className="cartao" style={{ maxWidth: '32rem', margin: '3rem auto' }}>
      <h1>Área da diretoria</h1>
      <p className="suave">
        {temSessao
          ? 'Você não tem vínculo com esta atlética. A entrada é por convite da diretoria.'
          : 'Entre para acessar a área da sua atlética.'}
      </p>
      <div className="linha">
        {MODO_DEMO && !temSessao ? (
          <button className="botao" onClick={() => void assumirPapel('PRESIDENTE')}>
            Entrar na demonstração
          </button>
        ) : null}
        <Link className="botao botao--discreto" to={`/a/${slug}`}>
          Ver a página pública
        </Link>
      </div>
    </div>
  )
}
