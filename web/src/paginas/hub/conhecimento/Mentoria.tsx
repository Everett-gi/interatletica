import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { AreaDeConhecimento, OfertaDeMentoria } from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { AREA } from '../rede/PedidosDeAjuda'

type Filtro = 'TODAS' | AreaDeConhecimento

/**
 * A mentoria entre atléticas (§53).
 *
 * <p>É a diferença entre uma resposta e um acompanhamento. Pedido de ajuda
 * resolve dúvida pontual; mentoria é uma atlética experiente andando junto
 * de outra por um semestre — para colocar a prestação de contas em dia, para
 * fechar o primeiro patrocínio, para organizar o primeiro interatlética.</p>
 */
export function Mentoria() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODAS')

  const mentorias = useBusca<OfertaDeMentoria[]>(() => Dados.mentorias(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Mentoria"
        descricao="Atléticas experientes acompanhando quem está começando — por área."
        trilha={[
          { rotulo: 'Conhecimento', para: `/hub/${slug}/conhecimento` },
          { rotulo: 'Mentoria' },
        ]}
        acoes={
          <button className="botao botao--discreto" disabled
                  title="Oferecer mentoria chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Oferecer mentoria
          </button>
        }
      />

      <Conteudo
        busca={mentorias}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="12rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="mentoria" titulo="Nenhuma mentoria disponível">
                <p className="fraco">
                  Se a sua atlética domina alguma área, ofereça acompanhamento.
                  É a forma mais direta de a rede crescer com qualidade.
                </p>
              </EstadoVazio>
            )
          }

          const disponiveis = lista.filter((m) => m.disponivel)
          const visiveis = filtro === 'TODAS'
            ? lista
            : lista.filter((m) => m.area === filtro)

          const contar = (a: AreaDeConhecimento) =>
            lista.filter((m) => m.area === a).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Mentorias abertas" icone="mentoria"
                         valor={disponiveis.length} />
                <Metrica rotulo="Atléticas mentoras" icone="rede"
                         valor={new Set(lista.map((m) => m.atletica.slug)).size} />
                <Metrica rotulo="Atléticas atendidas" icone="certo"
                         valor={lista.reduce((s, m) => s + m.atleticasAtendidas, 0)} />
                <Metrica rotulo="Áreas cobertas" icone="grade"
                         valor={new Set(lista.map((m) => m.area)).size} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Áreas de mentoria"
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
                  {visiveis.map((m) => (
                    <div key={m.id}
                         className="cartao"
                         style={m.disponivel ? undefined : { opacity: 0.6 }}>
                      <div className="linha entre" style={{ marginBottom: '0.6rem' }}>
                        <span className="etiqueta">{AREA[m.area]}</span>
                        <span className={`etiqueta ${
                          m.disponivel ? 'etiqueta--sucesso' : ''}`}>
                          {m.disponivel ? 'aceitando' : 'lotada'}
                        </span>
                      </div>

                      <h3 style={{ marginBottom: '0.3rem' }}>{m.titulo}</h3>
                      <p className="fraco" style={{ marginBottom: '0.9rem' }}>
                        {m.descricao}
                      </p>

                      <div className="linha" style={{ gap: '0.5rem',
                                                      marginBottom: '0.9rem' }}>
                        <Brasao atletica={m.atletica} tamanho="m" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '0.92rem' }}>{m.atletica.nome}</strong>
                          <div className="fraco">com {m.responsavelNome}</div>
                        </div>
                      </div>

                      <div className="linha entre">
                        <span className="fraco">
                          {m.atleticasAtendidas}{' '}
                          {m.atleticasAtendidas === 1
                            ? 'atlética já atendida' : 'atléticas já atendidas'}
                        </span>
                        <button className="botao botao--discreto botao--pequeno"
                                disabled={!m.disponivel}
                                title={m.disponivel
                                  ? 'Solicitar chega com a API conectada'
                                  : 'Sem vaga no momento'}>
                          Solicitar
                        </button>
                      </div>
                    </div>
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
