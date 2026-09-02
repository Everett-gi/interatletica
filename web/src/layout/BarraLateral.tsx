import { NavLink, Link } from 'react-router-dom'
import type { Papel } from '../api/tipos'
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
  const podeVer = (item: ItemDeNavegacao) =>
    item.exige === undefined || podeAtuarComo(slug, item.exige)

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

          return (
            <div key={grupo.titulo ?? 'raiz'}>
              {grupo.titulo ? (
                <div className="lateral__titulo">{grupo.titulo}</div>
              ) : null}
              {visiveis.map((item) => {
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
              })}
            </div>
          )
        })}
      </div>

      <div className="lateral__rodape">
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
