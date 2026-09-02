import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { Dados } from '../dados'
import type { Decisao } from '../api/tipos-gestao'
import type { Tarefa } from '../api/tipos-rede'
import type { PedidoDeAjuda } from '../api/tipos-conhecimento'
import { useSessao } from '../sessao/SessaoContexto'
import { Carregando } from '../ui/componentes'
import { ComoFunciona } from '../ui/ComoFunciona'
import { useCorDaAtletica } from '../ui/useCorDaAtletica'
import { BarraLateral } from './BarraLateral'
import { BarraDoTopo } from './BarraDoTopo'
import { TourInicial, tourJaVisto } from './TourInicial'
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

  // O caminho dentro do hub, que é a chave da ajuda contextual.
  const caminhoRelativo = local.pathname
    .replace(new RegExp(`^/hub/${slug}/?`), '')
    .replace(/\/+$/, '')

  // O tour só faz sentido depois que a casca existe — e uma vez só.
  const [mostrarTour, setMostrarTour] = useState(false)
  useEffect(() => {
    if (perfil && meu && !tourJaVisto()) {
      // Espera a primeira pintura: o tour mede a posição real dos elementos,
      // e medir antes de a barra lateral existir aponta para o vazio.
      const relogio = setTimeout(() => setMostrarTour(true), 700)
      return () => clearTimeout(relogio)
    }
    return undefined
  }, [perfil, meu])

  if (carregando) {
    return <Carregando rotulo="Abrindo sua atlética" />
  }
  if (!perfil) {
    return <SemSessao slug={slug} />
  }
  if (!meu) {
    return <SemVinculo slug={slug} temAtleticas={perfil.atleticas.length > 0} />
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
          {/* A ajuda vem antes do título porque é aí que a pergunta "o que é
              isto?" existe. Depois de dispensada vira uma linha fina. */}
          <ComoFunciona caminho={caminhoRelativo} />
          <Outlet />
        </main>
      </div>

      {mostrarTour ? (
        <TourInicial aoEncerrar={() => setMostrarTour(false)} />
      ) : null}
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

/** Quem chega no hub sem estar logado. */
function SemSessao({ slug }: { slug: string }) {
  return (
    <div className="cartao" style={{ maxWidth: '32rem', margin: '3rem auto' }}>
      <h1>Área da diretoria</h1>
      <p className="suave">
        Esta parte é de quem tem vínculo com a atlética. Entre para continuar —
        ou veja a página pública, que é aberta a qualquer pessoa.
      </p>
      <div className="linha">
        <Link className="botao" to="/entrar">Entrar</Link>
        <Link className="botao botao--discreto" to={`/a/${slug}`}>
          Ver a página pública
        </Link>
      </div>
    </div>
  )
}

/**
 * Quem está logado mas não pertence a esta atlética.
 *
 * <p>Duas situações diferentes, e a saída certa muda: quem não tem atlética
 * nenhuma precisa criar a sua; quem já tem outras entrou no endereço errado e
 * precisa voltar para as suas.</p>
 */
function SemVinculo({ slug, temAtleticas }: { slug: string; temAtleticas: boolean }) {
  const { perfil } = useSessao()

  return (
    <div className="cartao" style={{ maxWidth: '32rem', margin: '3rem auto' }}>
      <h1>Você não faz parte desta atlética</h1>
      <p className="suave">
        A entrada é por convite da diretoria, endereçado ao seu e-mail. Não
        existe cadastro aberto de vínculo, e é assim de propósito.
      </p>
      <div className="linha">
        {temAtleticas && perfil ? (
          <Link className="botao" to={`/hub/${perfil.atleticas[0].atletica.slug}`}>
            Ir para a minha atlética
          </Link>
        ) : (
          <Link className="botao" to="/criar-atletica">
            Criar a minha atlética
          </Link>
        )}
        <Link className="botao botao--discreto" to={`/a/${slug}`}>
          Ver a página pública
        </Link>
      </div>
    </div>
  )
}
