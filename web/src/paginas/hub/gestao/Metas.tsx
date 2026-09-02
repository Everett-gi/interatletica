import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Meta } from '../../../api/tipos-gestao'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, percentual, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * As metas da gestão.
 *
 * <p>Toda meta aqui tem número e prazo. "Melhorar a comunicação" não é meta,
 * é intenção — e intenção não se cobra na assembleia nem se passa para a
 * gestão seguinte. Três a seis metas com número valem mais que vinte
 * declarações de propósito.</p>
 */
export function Metas() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const presidente = podeAtuarComo(slug, 'PRESIDENTE')
  const metas = useBusca<Meta[]>(() => Dados.metas(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Metas"
        descricao="O que esta gestão se comprometeu a entregar, com número e prazo."
        acoes={presidente ? (
          <button className="botao" disabled title="Cadastro chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Nova meta
          </button>
        ) : undefined}
      />

      <Conteudo
        busca={metas}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="9rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="metas" titulo="Nenhuma meta definida">
                <p className="fraco">
                  Defina de três a seis metas com número. É o que permite dizer,
                  no fim do ano, se a gestão entregou o que prometeu.
                </p>
              </EstadoVazio>
            )
          }

          const atingidas = lista.filter((m) => m.atual >= m.alvo).length
          const medio = lista.reduce(
            (s, m) => s + Math.min(1, m.atual / m.alvo), 0) / lista.length

          const areas = [...new Set(lista.map((m) => m.area))]

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.6rem' }}>
                <Metrica rotulo="Metas definidas" icone="metas" valor={lista.length} />
                <Metrica rotulo="Já atingidas" icone="certo" valor={atingidas}
                         cor={atingidas > 0 ? 'var(--sucesso)' : undefined} />
                <Metrica rotulo="Progresso médio" icone="resultados"
                         valor={percentual(medio)} />
                <Metrica rotulo="Áreas cobertas" icone="grade" valor={areas.length} />
              </div>

              {areas.map((area) => (
                <Secao key={area} titulo={area}>
                  <div className="grade grade--larga">
                    {lista.filter((m) => m.area === area).map((meta) => (
                      <CartaoDeMeta key={meta.id} meta={meta} />
                    ))}
                  </div>
                </Secao>
              ))}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function CartaoDeMeta({ meta }: { meta: Meta }) {
  const proporcao = meta.atual / meta.alvo
  const atingida = proporcao >= 1
  const formatar = (valor: number) =>
    meta.unidade === 'reais' ? dinheiro(valor)
      : meta.unidade === '%' ? `${valor}%`
      : `${valor} ${meta.unidade}`

  return (
    <div className={`cartao${atingida ? ' cartao--destacado' : ''}`}>
      <div className="linha entre" style={{ marginBottom: '0.45rem' }}>
        <strong>{meta.titulo}</strong>
        {atingida ? (
          <span className="etiqueta etiqueta--sucesso">atingida</span>
        ) : null}
      </div>

      <div className="linha entre" style={{ alignItems: 'baseline',
                                            marginBottom: '0.55rem' }}>
        <span className="numero-medio">{formatar(meta.atual)}</span>
        <span className="fraco">de {formatar(meta.alvo)}</span>
      </div>

      <Progresso
        proporcao={proporcao}
        tom={atingida ? 'sucesso' : proporcao < 0.4 ? 'alerta' : undefined}
      />

      <div className="linha entre" style={{ marginTop: '0.55rem' }}>
        <span className="fraco">{percentual(proporcao)}</span>
        {meta.prazo ? (
          <span className="fraco">prazo {quando(meta.prazo)}</span>
        ) : null}
      </div>
    </div>
  )
}
