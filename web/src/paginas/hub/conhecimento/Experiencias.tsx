import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { AreaDeConhecimento, Experiencia } from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, numero } from '../../../formatos'
import { AREA } from '../rede/PedidosDeAjuda'

type Filtro = 'TODAS' | AreaDeConhecimento

/**
 * O banco de experiências (§38).
 *
 * <p>A estrutura fixa — o que funcionou, o que não funcionou, quanto custou,
 * o que faríamos diferente — é o que separa isto de um relato solto. Sem a
 * segunda coluna, vira propaganda; sem o custo, vira conselho sem preço. As
 * quatro perguntas juntas é o que faz uma atlética conseguir decidir se
 * repete a receita.</p>
 */
export function Experiencias() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODAS')

  const experiencias = useBusca<Experiencia[]>(() => Dados.experiencias(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="O que aprendemos"
        descricao="Relatos com número: o que deu certo, o que deu errado, quanto custou."
        trilha={[
          { rotulo: 'Conhecimento', para: `/hub/${slug}/conhecimento` },
          { rotulo: 'Experiências' },
        ]}
        acoes={
          <button className="botao" disabled
                  title="Publicar experiência chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Registrar experiência
          </button>
        }
      />

      <Conteudo
        busca={experiencias}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="14rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="experiencias" titulo="Nenhuma experiência registrada">
                <p className="fraco">
                  Registre a primeira depois do próximo evento, enquanto os números
                  e os problemas ainda estão frescos. Duas semanas depois ninguém
                  lembra.
                </p>
              </EstadoVazio>
            )
          }

          const visiveis = filtro === 'TODAS'
            ? lista
            : lista.filter((e) => e.area === filtro)

          const contar = (a: AreaDeConhecimento) =>
            lista.filter((e) => e.area === a).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Experiências" icone="experiencias" valor={lista.length} />
                <Metrica rotulo="Atléticas que contribuíram" icone="rede"
                         valor={new Set(lista.map((e) => e.atletica.slug)).size} />
                <Metrica rotulo="Marcadas como úteis" icone="certo"
                         valor={lista.reduce((s, e) => s + e.util, 0)} />
                <Metrica rotulo="Pessoas alcançadas" icone="membros"
                         valor={numero(lista.reduce((s, e) => s + (e.publico ?? 0), 0))}
                         detalhe="somando os eventos relatados" />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Áreas"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(AREA) as AreaDeConhecimento[])
                      .filter((a) => contar(a) > 0)
                      .map((a) => ({
                        valor: a as Filtro,
                        rotulo: AREA[a],
                        contagem: contar(a),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((e) => (
                    <Link
                      key={e.id}
                      to={`/hub/${slug}/conhecimento/experiencias/${e.id}`}
                      className="cartao cartao--clicavel"
                    >
                      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                        <span className="etiqueta">{AREA[e.area]}</span>
                        <span className="fraco">{e.quando}</span>
                      </div>

                      <h3 style={{ marginBottom: '0.5rem' }}>{e.titulo}</h3>

                      <div className="linha" style={{ gap: '0.45rem',
                                                      marginBottom: '0.8rem' }}>
                        <Brasao atletica={e.atletica} tamanho="p" />
                        <span className="fraco">{e.atletica.nome}</span>
                      </div>

                      <div className="linha" style={{ gap: '1.2rem',
                                                      marginBottom: '0.8rem' }}>
                        <div>
                          <div className="numero-medio" style={{ color: 'var(--sucesso)' }}>
                            {e.funcionou.length}
                          </div>
                          <div className="fraco">acertos</div>
                        </div>
                        <div>
                          <div className="numero-medio" style={{ color: 'var(--alerta)' }}>
                            {e.naoFuncionou.length}
                          </div>
                          <div className="fraco">erros</div>
                        </div>
                        {e.custo !== null ? (
                          <div>
                            <div className="numero-medio">{dinheiro(e.custo)}</div>
                            <div className="fraco">custo</div>
                          </div>
                        ) : null}
                        {e.publico !== null ? (
                          <div>
                            <div className="numero-medio">{numero(e.publico)}</div>
                            <div className="fraco">pessoas</div>
                          </div>
                        ) : null}
                      </div>

                      <div className="linha entre">
                        <span className="linha fraco" style={{ gap: '0.3rem' }}>
                          <Icone nome="certo" tamanho={13} /> {e.util} acharam útil
                        </span>
                        <span className="fraco">{e.respostas} comentários</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
