import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Comunidade, TipoDeComunidade } from '../../../api/tipos-conhecimento'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { plural, quando } from '../../../formatos'
import { corDerivada } from '../../../ui/tema'

const TIPO: Record<TipoDeComunidade, { rotulo: string; icone: NomeDoIcone }> = {
  REGIAO: { rotulo: 'Região', icone: 'local' },
  MODALIDADE: { rotulo: 'Modalidade', icone: 'equipes' },
  FUNCAO: { rotulo: 'Função', icone: 'diretoria' },
  INTERESSE: { rotulo: 'Interesse', icone: 'experiencias' },
}

type Filtro = 'TODAS' | 'MINHAS' | TipoDeComunidade

/**
 * As comunidades da rede (§57).
 *
 * <p>Agrupam por região, modalidade, função e interesse — quatro recortes que
 * cobrem quase toda pergunta de atlética. "Diretores de Marketing" reúne
 * gente que faz o mesmo trabalho em atléticas diferentes, e é onde a resposta
 * chega mais rápido do que num feed geral.</p>
 */
export function Comunidades() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const comunidades = useBusca<Comunidade[]>(() => Dados.comunidades(), [])

  async function alternar(id: string) {
    const atualizada = await Dados.alternarComunidade(id)
    if (atualizada) {
      comunidades.definir(
        (comunidades.dados ?? []).map((c) => (c.id === id ? atualizada : c)))
    }
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Comunidades"
        descricao="Grupos por região, modalidade, função ou interesse. É onde a pergunta certa encontra quem já respondeu."
      />

      <Conteudo
        busca={comunidades}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="11rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="comunidades" titulo="Nenhuma comunidade ainda">
                <p className="fraco">
                  As comunidades aparecem conforme a rede cresce.
                </p>
              </EstadoVazio>
            )
          }

          const minhas = lista.filter((c) => c.participo)
          const visiveis = filtro === 'TODAS' ? lista
            : filtro === 'MINHAS' ? minhas
            : lista.filter((c) => c.tipo === filtro)

          const contar = (t: TipoDeComunidade) =>
            lista.filter((c) => c.tipo === t).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Comunidades" icone="comunidades" valor={lista.length} />
                <Metrica rotulo="Você participa de" icone="certo" valor={minhas.length} />
                <Metrica rotulo="Pessoas na rede" icone="membros"
                         valor={lista.reduce((s, c) => s + c.membros, 0)} />
                <Metrica rotulo="Atléticas envolvidas" icone="rede"
                         valor={Math.max(...lista.map((c) => c.atleticas))} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Tipos de comunidade"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    { valor: 'MINHAS', rotulo: 'Que eu participo', contagem: minhas.length },
                    ...(Object.keys(TIPO) as TipoDeComunidade[])
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
                {visiveis.length === 0 ? (
                  <EstadoVazio titulo="Nenhuma comunidade neste filtro" />
                ) : (
                  <div className="grade grade--larga">
                    {visiveis.map((c) => (
                      <div key={c.id}
                           className={`cartao${c.participo ? ' cartao--destacado' : ''}`}>
                        <div className="linha linha--topo" style={{ marginBottom: '0.7rem' }}>
                          <div
                            style={{
                              width: '2.7rem', height: '2.7rem',
                              borderRadius: '10px', flexShrink: 0,
                              background: c.emblema ?? corDerivada(c.nome),
                              display: 'grid', placeItems: 'center', color: '#fff',
                            }}
                            aria-hidden="true"
                          >
                            <Icone nome={TIPO[c.tipo].icone} tamanho={18} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link to={`/hub/${slug}/rede/comunidades/${c.id}`}
                                  style={{ color: 'inherit' }}>
                              <h3 style={{ marginBottom: '0.1rem' }}>{c.nome}</h3>
                            </Link>
                            <span className="etiqueta">{TIPO[c.tipo].rotulo}</span>
                          </div>
                        </div>

                        <p className="fraco" style={{ marginBottom: '0.9rem' }}>
                          {c.descricao}
                        </p>

                        <div className="linha entre" style={{ marginBottom: '0.9rem' }}>
                          <span className="fraco">
                            {plural(c.membros, 'pessoa')} · {plural(c.atleticas, 'atlética')}
                          </span>
                          <span className="fraco">
                            ativa {quando(c.ultimaAtividade)}
                          </span>
                        </div>

                        <div className="linha">
                          <Link to={`/hub/${slug}/rede/comunidades/${c.id}`}
                                className="botao botao--discreto"
                                style={{ flex: 1 }}>
                            Abrir
                          </Link>
                          <button
                            className={c.participo ? 'botao botao--fantasma' : 'botao'}
                            onClick={() => void alternar(c.id)}
                          >
                            {c.participo ? 'Sair' : 'Participar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
