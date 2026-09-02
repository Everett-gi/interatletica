import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Campanha } from '../../../api/tipos-comunicacao'
import { Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { percentual, quando } from '../../../formatos'
import { STATUS_DA_PUBLICACAO } from './Noticias'

/**
 * As campanhas (§50).
 *
 * <p>Campanha sem meta numérica é postagem avulsa com nome bonito. Aqui toda
 * campanha declara o que quer atingir — 300 camisas, 40 novos membros — e a
 * barra mostra onde está. É o que permite decidir se vale insistir ou
 * mudar de abordagem antes do prazo acabar.</p>
 */
export function Campanhas() {
  const { slug = '' } = useParams()
  const campanhas = useBusca<Campanha[]>(() => Dados.campanhas(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Campanhas"
        descricao="Objetivo com número, calendário de conteúdo e quanto já foi atingido."
        trilha={[
          { rotulo: 'Comunicação', para: `/hub/${slug}/comunicacao` },
          { rotulo: 'Campanhas' },
        ]}
        acoes={
          <button className="botao" disabled title="Criar chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Nova campanha
          </button>
        }
      />

      <Previa oQueFalta="Criar campanha e agendar conteúdo ainda não chegam ao servidor." />

      <Conteudo
        busca={campanhas}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1].map((i) => <Esqueleto key={i} altura="14rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="campanhas" titulo="Nenhuma campanha ativa">
                <p className="fraco">
                  Uma campanha é uma meta com prazo e um calendário de conteúdo.
                  Post feito na véspera é post sem foto boa e sem revisão.
                </p>
              </EstadoVazio>
            )
          }

          const conteudos = lista.flatMap((c) => c.conteudos)
          const publicados = conteudos.filter((c) => c.status === 'PUBLICADO')
          const proximos = conteudos
            .filter((c) => c.status === 'AGENDADO' || c.status === 'PRODUCAO')
            .sort((a, b) => a.publicarEm.localeCompare(b.publicarEm))

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Campanhas" icone="campanhas" valor={lista.length} />
                <Metrica rotulo="Conteúdos publicados" icone="certo"
                         valor={publicados.length} />
                <Metrica rotulo="Na fila" icone="relogio" valor={proximos.length}
                         cor={proximos.length > 6 ? 'var(--alerta)' : undefined} />
                <Metrica rotulo="Ideias sem responsável" icone="alerta"
                         valor={conteudos.filter(
                           (c) => c.status === 'IDEIA' && c.responsavelNome === null).length} />
              </div>

              <div className="detalhe">
                <div>
                  <Secao titulo="Campanhas em curso">
                    <div className="pilha">
                      {lista.map((c) => {
                        const proporcao = c.atual / c.metaValor
                        const feitos = c.conteudos.filter(
                          (x) => x.status === 'PUBLICADO').length
                        return (
                          <Link
                            key={c.id}
                            to={`/hub/${slug}/comunicacao/campanhas/${c.id}`}
                            className="cartao cartao--clicavel"
                          >
                            <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
                              <h3 style={{ marginBottom: 0 }}>{c.nome}</h3>
                              <span className="fraco">termina {quando(c.fimEm)}</span>
                            </div>
                            <p className="fraco" style={{ marginBottom: '0.9rem' }}>
                              {c.objetivo}
                            </p>

                            <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
                              <span className="fraco">
                                {c.atual} de {c.metaValor} {c.metaUnidade}
                              </span>
                              <strong>{percentual(proporcao)}</strong>
                            </div>
                            <Progresso
                              proporcao={proporcao}
                              tom={proporcao >= 1 ? 'sucesso'
                                : proporcao < 0.4 ? 'alerta' : undefined}
                            />

                            <div className="linha entre" style={{ marginTop: '0.8rem' }}>
                              <span className="fraco">
                                {feitos} de {c.conteudos.length} conteúdos publicados
                              </span>
                              {c.responsavelNome ? (
                                <span className="etiqueta">{c.responsavelNome}</span>
                              ) : null}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </Secao>
                </div>

                <div>
                  <Secao
                    titulo="Calendário editorial"
                    descricao="O que sai nas próximas semanas, em todas as campanhas."
                  >
                    {proximos.length === 0 ? (
                      <EstadoVazio titulo="Nada na fila" />
                    ) : (
                      <div className="pilha pilha--densa">
                        {proximos.slice(0, 8).map((c) => (
                          <div key={c.id} className="cartao cartao--compacto linha entre">
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 550, fontSize: '0.9rem' }}>
                                {c.titulo}
                              </div>
                              <div className="fraco">
                                {c.canal.toLowerCase()} ·{' '}
                                {c.responsavelNome ?? 'sem responsável'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span className={`etiqueta ${
                                STATUS_DA_PUBLICACAO[c.status].classe}`}>
                                {STATUS_DA_PUBLICACAO[c.status].rotulo}
                              </span>
                              <div className="fraco">{quando(c.publicarEm)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Secao>
                </div>
              </div>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
