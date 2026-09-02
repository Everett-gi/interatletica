import { useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { PainelDaAtletica } from '../../api/tipos-rede'
import {
  Anel,
  Barras,
  Conteudo,
  Esqueleto,
  Metrica,
  rotuloDoTipo,
  useBusca,
} from '../../ui/componentes'

/**
 * Engajamento e presença.
 *
 * <p>Duas perguntas que a planilha nunca respondeu: quantos dos inscritos
 * realmente apareceram, e de quais atléticas eles vieram. A segunda só tem
 * resposta porque `inscricao.atletica_id` guarda a atlética de ORIGEM — e é
 * o número que decide se vale repetir um interatlética no ano seguinte.</p>
 */
export function Relatorios() {
  const { slug = '' } = useParams()

  const painel = useBusca<PainelDaAtletica>(() => Dados.painel(slug), [slug])

  return (
    <div className="pilha" style={{ gap: '1.6rem' }}>
      <header>
        <h1>Relatórios</h1>
        <p className="fraco" style={{ margin: 0 }}>
          O que a planilha não respondia: quem apareceu, e de onde veio.
        </p>
      </header>

      <Conteudo busca={painel} esqueleto={<Esqueleto altura="18rem" />}>
        {(dados) => {
          const inscritos = dados.inscricoesPorEvento
            .reduce((soma, p) => soma + p.valor, 0)
          const presentes = dados.presencaPorEvento
            .reduce((soma, p) => soma + p.valor, 0)

          return (
            <>
              <div className="grade grade--metricas">
                <Metrica rotulo="Inscritos no período" valor={inscritos} />
                <Metrica rotulo="Compareceram" valor={presentes} />
                <Metrica
                  rotulo="Não compareceram"
                  valor={inscritos - presentes}
                  cor="var(--alerta)"
                  detalhe="vaga ocupada e não usada"
                />
                <Metrica rotulo="Eventos publicados" valor={dados.eventosPublicados} />
              </div>

              <section className="cartao">
                <Anel
                  proporcao={inscritos === 0 ? 0 : presentes / inscritos}
                  rotulo="Taxa de presença"
                />
                <p className="fraco" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
                  Quem confirma e não vai ocupa uma vaga que ficaria com alguém
                  da lista de espera. É o número que justifica abrir mais vagas
                  do que a capacidade, ou não.
                </p>
              </section>

              <div className="grade grade--larga">
                <section className="cartao">
                  <h3>Inscritos por evento</h3>
                  <Barras dados={dados.inscricoesPorEvento} />
                </section>

                <section className="cartao">
                  <h3>Presença por evento</h3>
                  <Barras dados={dados.presencaPorEvento} />
                </section>

                <section className="cartao">
                  <h3>Origem dos inscritos</h3>
                  <p className="fraco">
                    De quais atléticas vieram as pessoas.
                  </p>
                  <Barras
                    dados={dados.origemDosInscritos.map((o) => ({
                      rotulo: o.nome, valor: o.total,
                    }))}
                  />
                </section>

                <section className="cartao">
                  <h3>Eventos por tipo</h3>
                  <Barras
                    dados={dados.distribuicaoPorTipo.map((d) => ({
                      rotulo: rotuloDoTipo(d.tipo), valor: d.total,
                    }))}
                  />
                </section>
              </div>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
