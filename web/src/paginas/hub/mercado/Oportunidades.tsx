import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Oportunidade, TipoDeOportunidade } from '../../../api/tipos-mercado'
import { Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { quando } from '../../../formatos'

const TIPO: Record<TipoDeOportunidade, { rotulo: string; icone: NomeDoIcone }> = {
  PATROCINIO: { rotulo: 'Patrocínio', icone: 'patrocinios' },
  PARCERIA: { rotulo: 'Parceria', icone: 'parcerias' },
  FORNECEDOR: { rotulo: 'Fornecedor', icone: 'fornecedores' },
  EVENTO: { rotulo: 'Evento', icone: 'eventos' },
  COMPETICAO: { rotulo: 'Competição', icone: 'campeonatos' },
  VAGA: { rotulo: 'Vaga', icone: 'membros' },
  PROJETO: { rotulo: 'Projeto', icone: 'projetos' },
}

type Filtro = 'TODAS' | TipoDeOportunidade

/**
 * A central de oportunidades (§45).
 *
 * <p>Cartões curtos, com prazo à vista. O que faz esta tela funcionar é a
 * data: edital que fecha em quarenta dias e compra que fecha em vinte e oito
 * não competem por atenção — a segunda é urgente, e a ordem mostra isso.</p>
 */
export function Oportunidades() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const oportunidades = useBusca<Oportunidade[]>(() => Dados.oportunidades(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Oportunidades"
        descricao="Editais, parcerias, competições e vagas abertas para atléticas da rede."
      />

      <Conteudo
        busca={oportunidades}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="9rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="mercado" titulo="Nenhuma oportunidade aberta">
                <p className="fraco">
                  Editais, parcerias e competições publicados por outras atléticas
                  aparecem aqui.
                </p>
              </EstadoVazio>
            )
          }

          const visiveis = lista
            .filter((o) => filtro === 'TODAS' || o.tipo === filtro)
            // Prazo mais curto primeiro: é o que decide o que fazer hoje.
            .sort((a, b) => (a.prazo ?? '9999').localeCompare(b.prazo ?? '9999'))

          const contar = (t: TipoDeOportunidade) =>
            lista.filter((o) => o.tipo === t).length

          return (
            <>
              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Tipos de oportunidade"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(TIPO) as TipoDeOportunidade[])
                      .filter((t) => contar(t) > 0)
                      .map((t) => ({
                        valor: t as Filtro,
                        rotulo: TIPO[t].rotulo,
                        contagem: contar(t),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((o) => {
                    const dias = o.prazo
                      ? Math.ceil((new Date(o.prazo).getTime() - Date.now()) / 864e5)
                      : null
                    const urgente = dias !== null && dias <= 20

                    const corpo = (
                      <>
                        <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                          <span className="linha etiqueta" style={{ gap: '0.3rem' }}>
                            <Icone nome={TIPO[o.tipo].icone} tamanho={13} />
                            {TIPO[o.tipo].rotulo}
                          </span>
                          {o.prazo ? (
                            <span className={`etiqueta ${urgente ? 'etiqueta--alerta' : ''}`}>
                              {quando(o.prazo)}
                            </span>
                          ) : null}
                        </div>

                        <h3 style={{ marginBottom: '0.25rem' }}>{o.titulo}</h3>
                        <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                          {o.resumo}
                        </p>

                        <div className="linha entre">
                          <span className="fraco">{o.origem}</span>
                          <div className="linha" style={{ gap: '0.25rem' }}>
                            {o.etiquetas.map((e) => (
                              <span key={e} className="etiqueta">{e}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )

                    return o.destino ? (
                      <Link key={o.id} to={`/hub/${slug}/${o.destino}`}
                            className="cartao cartao--clicavel">
                        {corpo}
                      </Link>
                    ) : (
                      <div key={o.id} className="cartao">{corpo}</div>
                    )
                  })}
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
