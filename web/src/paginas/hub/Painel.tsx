import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { PainelDaAtletica } from '../../api/tipos-rede'
import {
  Anel,
  Barras,
  Conteudo,
  Esqueleto,
  EtiquetaDeStatus,
  Metrica,
  useBusca,
  Vazio,
} from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
import { dataEHora, quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

/**
 * A primeira tela de quem administra: o que exige atenção agora.
 *
 * <p>A ordem não é decorativa. Vem primeiro o que tem prazo — próximos
 * eventos e tarefas abertas —, depois o que já aconteceu. Um painel que
 * abre com gráfico do trimestre passado é bonito e inútil na semana de um
 * evento.</p>
 */
export function Painel() {
  const { slug = '' } = useParams()
  const { vinculo, podeAtuarComo } = useSessao()
  const meu = vinculo(slug)
  const diretor = podeAtuarComo(slug, 'DIRETOR')

  useCorDaAtletica(meu?.atletica.corPrimaria)
  const painel = useBusca<PainelDaAtletica>(() => Dados.painel(slug), [slug])

  return (
    <div className="pilha" style={{ gap: '1.6rem' }}>
      <header className="linha entre">
        <div>
          <h1 style={{ marginBottom: '0.1rem' }}>{meu?.atletica.nome ?? 'Atlética'}</h1>
          <div className="fraco">{meu?.cargo ?? 'Painel da diretoria'}</div>
        </div>
        {diretor ? (
          <Link to={`/hub/${slug}/eventos/novo`} className="botao">Novo evento</Link>
        ) : null}
      </header>

      <Conteudo
        busca={painel}
        esqueleto={
          <div className="grade grade--metricas">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="6rem" />)}
          </div>
        }
      >
        {(dados) => (
          <>
            <div className="grade grade--metricas">
              <Metrica rotulo="Membros ativos" valor={dados.membrosAtivos} />
              <Metrica rotulo="Eventos publicados" valor={dados.eventosPublicados} />
              <Metrica rotulo="Inscritos" valor={dados.inscritosNoMes}
                       detalhe="somando os eventos no ar" />
              <Metrica
                rotulo="Tarefas abertas"
                valor={dados.tarefasAbertas}
                cor={dados.tarefasAbertas > 4 ? 'var(--alerta)' : undefined}
              />
            </div>

            {dados.avisosFixados.length > 0 ? (
              <section>
                {dados.avisosFixados.map((aviso) => (
                  <div key={aviso.id} className="aviso aviso--alerta"
                       style={{ marginBottom: '0.5rem' }}>
                    <strong>{aviso.titulo}</strong>
                    <div className="fraco">{aviso.corpo}</div>
                  </div>
                ))}
              </section>
            ) : null}

            <section>
              <div className="cabecalho-de-secao">
                <h2>Próximos eventos</h2>
                <Link to={`/hub/${slug}/eventos`}
                      className="botao botao--fantasma botao--pequeno">
                  Ver todos
                </Link>
              </div>

              {dados.proximosEventos.length === 0 ? (
                <Vazio titulo="Nada marcado">
                  {diretor
                    ? 'Crie o primeiro evento e publique quando estiver pronto.'
                    : 'A diretoria ainda não publicou nada.'}
                </Vazio>
              ) : (
                <div className="pilha pilha--densa">
                  {dados.proximosEventos.map((evento) => (
                    <Link
                      key={evento.id}
                      to={`/hub/${slug}/eventos/${evento.id}`}
                      className="cartao cartao--clicavel linha entre"
                    >
                      <div style={{ minWidth: 0 }}>
                        <strong>{evento.titulo}</strong>
                        <div className="fraco">
                          {dataEHora(evento.inicioEm)} · {quando(evento.inicioEm)}
                          {evento.localNome ? ` · ${evento.localNome}` : ''}
                        </div>
                      </div>
                      <EtiquetaDeStatus status={evento.status} />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {diretor ? (
              <div className="grade grade--larga">
                <section className="cartao">
                  <h3>Inscritos por evento</h3>
                  <Barras dados={dados.inscricoesPorEvento} />
                </section>

                <section className="cartao">
                  <h3>De onde vieram</h3>
                  <p className="fraco">
                    A atlética de origem de cada inscrito — o número que só um
                    interatlética responde.
                  </p>
                  <Barras
                    dados={dados.origemDosInscritos.map((o) => ({
                      rotulo: o.nome, valor: o.total,
                    }))}
                  />
                </section>

                <section className="cartao">
                  <h3>Presença</h3>
                  <Anel proporcao={dados.taxaDePresenca} rotulo="Compareceram" />
                </section>
              </div>
            ) : null}
          </>
        )}
      </Conteudo>
    </div>
  )
}
