import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import type { Papel } from '../api/tipos'
import { MODO_DEMO } from '../dados'
import { Icone } from '../ui/icones'
import {
  NAVEGACAO,
  type ContagensDaNavegacao,
  type ItemDeNavegacao,
} from './navegacao'

/**
 * A barra lateral do app.
 *
 * <p>Dois comportamentos, um componente: no desktop é coluna fixa e
 * recolhível; abaixo de 1040px é gaveta, aberta pelo botão do topo. Manter
 * uma coluna de 15rem fixa num celular não é navegação — é obstáculo.</p>
 *
 * <p>Itens sem permissão não aparecem. O §84 diz para não presumir que todo
 * membro acessa financeiro; mostrar o item e negar no clique é pior que não
 * mostrar, porque promete uma coisa que não vai acontecer.</p>
 *
 * <p><strong>Só o grupo em que você está fica aberto.</strong> Onze grupos
 * abertos somam mais de dois metros de coluna: você vê um terço e rola para
 * achar o resto, que é o oposto de navegar. Fechados, os onze títulos cabem
 * na tela de uma vez — e são eles que mostram o tamanho da plataforma. O que
 * está dentro de cada um fica a um clique, que é onde deve estar.</p>
 */
export function BarraLateral({
  slug, aberta, recolhida, contagens, podeAtuarComo, aoFechar, aoAlternarRecolhida,
}: {
  slug: string
  aberta: boolean
  recolhida: boolean
  contagens: ContagensDaNavegacao
  podeAtuarComo: (slug: string, papel: Papel) => boolean
  aoFechar: () => void
  aoAlternarRecolhida: () => void
}) {
  const base = `/hub/${slug}`
  const { pathname } = useLocation()
  const [alternados, setAlternados] = useState<Record<string, boolean>>({})

  const podeVer = (item: ItemDeNavegacao) =>
    (MODO_DEMO || !item.semServidor)
    && (item.exige === undefined || podeAtuarComo(slug, item.exige))

  /**
   * O grupo da rota atual.
   *
   * <p>Compara pelo prefixo mais longo: `financeiro/receitas` casa com o
   * item `financeiro/receitas` e não com `financeiro`, senão dois grupos
   * abririam ao mesmo tempo em toda subrota.</p>
   */
  const relativo = pathname.startsWith(base) ? pathname.slice(base.length + 1) : ''
  const grupoDaRota = NAVEGACAO.reduce<{ titulo: string | null; tamanho: number }>(
    (melhor, grupo) => {
      const casa = grupo.itens.reduce((maior, item) => (
        item.para !== '' && (relativo === item.para || relativo.startsWith(`${item.para}/`))
          ? Math.max(maior, item.para.length)
          : maior), 0)
      return casa > melhor.tamanho ? { titulo: grupo.titulo, tamanho: casa } : melhor
    },
    { titulo: null, tamanho: 0 }).titulo

  return (
    <nav
      className="lateral"
      data-aberta={aberta}
      aria-label="Navegação da plataforma"
      id="navegacao-principal"
    >
      <div className="lateral__topo">
        <Link to="/" className="marca" onClick={aoFechar}>
          <span className="marca__simbolo">IA</span>
          <span className="lateral__marca-texto">Interatlética</span>
        </Link>
        <span className="espaco lateral__marca-texto" />
        <button
          className="icone-botao lateral__marca-texto"
          onClick={aoAlternarRecolhida}
          aria-label={recolhida ? 'Expandir a navegação' : 'Recolher a navegação'}
          title={recolhida ? 'Expandir' : 'Recolher'}
        >
          <Icone nome={recolhida ? 'direita' : 'esquerda'} tamanho={17} />
        </button>
      </div>

      <div className="lateral__grupos">
        {NAVEGACAO.map((grupo) => {
          const visiveis = grupo.itens.filter(podeVer)
          if (visiveis.length === 0) return null

          // Grupo sem título é a raiz (Início): não encolhe, não tem o que
          // encolher. Recolhida, a coluna vira só ícones e o acordeão não faz
          // sentido — tudo aberto.
          const encolhivel = grupo.titulo !== null && !recolhida
          const aberto = !encolhivel || grupo.titulo === null
            || (alternados[grupo.titulo] ?? grupo.titulo === grupoDaRota)
          const pendentes = visiveis.reduce(
            (s, i) => s + (i.contador ? contagens[i.contador] : 0), 0)

          return (
            <div key={grupo.titulo ?? 'raiz'}>
              {grupo.titulo && encolhivel ? (
                <button
                  className="lateral__titulo lateral__titulo--botao"
                  aria-expanded={aberto}
                  onClick={() => setAlternados((atual) => ({
                    ...atual,
                    [grupo.titulo as string]: !aberto,
                  }))}
                >
                  <span>{grupo.titulo}</span>
                  {/* O selo migra para o título quando o grupo está fechado:
                      duas decisões esperando voto não podem sumir só porque
                      a pessoa está noutra seção. */}
                  {!aberto && pendentes > 0 ? (
                    <span className="lateral__selo">{pendentes}</span>
                  ) : null}
                  <Icone nome={aberto ? 'cima' : 'baixo'} tamanho={13} />
                </button>
              ) : grupo.titulo ? (
                <div className="lateral__titulo">{grupo.titulo}</div>
              ) : null}
              {aberto ? visiveis.map((item) => {
                const contagem = item.contador ? contagens[item.contador] : 0
                return (
                  <NavLink
                    key={item.para}
                    to={item.para ? `${base}/${item.para}` : base}
                    end={item.exato}
                    className="lateral__item"
                    onClick={aoFechar}
                    title={recolhida ? item.rotulo : undefined}
                  >
                    <Icone nome={item.icone} tamanho={18} />
                    <span className="lateral__rotulo">{item.rotulo}</span>
                    {contagem > 0 ? (
                      <span className="lateral__selo" aria-label={`${contagem} pendentes`}>
                        {contagem}
                      </span>
                    ) : null}
                  </NavLink>
                )
              }) : null}
            </div>
          )
        })}
      </div>

      <div className="lateral__rodape">
        <NavLink to={`${base}/boas-vindas`} className="lateral__item" onClick={aoFechar}
                 title={recolhida ? 'Primeiros passos' : undefined}>
          <Icone nome="certo" tamanho={18} />
          <span className="lateral__rotulo">Primeiros passos</span>
        </NavLink>
        <NavLink to="/ajuda" className="lateral__item" onClick={aoFechar}
                 title={recolhida ? 'Ajuda' : undefined}>
          <Icone nome="info" tamanho={18} />
          <span className="lateral__rotulo">Central de ajuda</span>
        </NavLink>
        <NavLink to="/eu" className="lateral__item" onClick={aoFechar}
                 title={recolhida ? 'Meu perfil' : undefined}>
          <Icone nome="usuario" tamanho={18} />
          <span className="lateral__rotulo">Meu perfil</span>
        </NavLink>
      </div>
    </nav>
  )
}
