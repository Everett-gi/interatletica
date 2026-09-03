import { Link, useParams } from 'react-router-dom'
import { Dados } from '../dados'
import type { AtleticaResumo, EventoResumo } from '../api/tipos'
import type { Equipe } from '../api/tipos-rede'
import {
  Brasao,
  Conteudo,
  Esqueleto,
  EtiquetaDeTipo,
  useBusca,
  Vazio,
} from '../ui/componentes'
import { useCorDaAtletica } from '../ui/useCorDaAtletica'
import { dataEHora, plural, quando } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'

/**
 * A página pública da atlética — o cartão de visitas dela na rede.
 *
 * <p>A tela inteira se pinta com a cor cadastrada pela atlética. É o que faz
 * entrar no perfil dos Dragões e no das Corujas ser visivelmente entrar em
 * lugares diferentes, sem que nenhuma seja dona da plataforma.</p>
 */
export function AtleticaPublica() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()

  const atletica = useBusca<AtleticaResumo | null>(
    () => Dados.atleticaPublica(slug), [slug])
  const agenda = useBusca<EventoResumo[]>(() => Dados.agendaPublica(slug), [slug])
  const equipes = useBusca<Equipe[]>(() => Dados.equipes(slug), [slug])

  useCorDaAtletica(atletica.dados?.corPrimaria)
  const meu = vinculo(slug)

  return (
    <Conteudo busca={atletica} esqueleto={<Esqueleto altura="14rem" />}>
      {(perfil) =>
        perfil === null ? (
          <Vazio titulo="Atlética não encontrada">
            O endereço pode ter mudado.
          </Vazio>
        ) : (
          <div className="pilha" style={{ gap: '1.8rem' }}>
            <header
              className="capa"
              style={{ background: perfil.corPrimaria ?? 'var(--acento)' }}
            >
              <div className="linha linha--topo">
                <Brasao atletica={perfil} tamanho="g" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{ marginBottom: '0.2rem' }}>{perfil.nome}</h1>
                  <div style={{ opacity: 0.92 }}>{perfil.instituicao}</div>
                  {perfil.cidade ? (
                    <div style={{ opacity: 0.75, fontSize: '0.88rem' }}>
                      {perfil.cidade}/{perfil.uf}
                    </div>
                  ) : null}
                </div>
                {meu ? (
                  <Link
                    to={`/hub/${slug}`}
                    className="botao"
                    style={{ background: '#fff', color: '#1a2540' }}
                  >
                    Abrir o hub
                  </Link>
                ) : null}
              </div>
            </header>

            <section>
              <div className="cabecalho-de-secao">
                <h2>Próximos eventos</h2>
              </div>
              <Conteudo busca={agenda} esqueleto={<Esqueleto altura="8rem" />}>
                {(eventos) =>
                  eventos.length === 0 ? (
                    <Vazio>Nenhum evento publicado no momento.</Vazio>
                  ) : (
                    <div className="grade">
                      {eventos.map((evento) => (
                        <Link
                          key={evento.id}
                          to={`/e/${slug}/${evento.slug}`}
                          className="cartao cartao--clicavel"
                        >
                          <div className="linha" style={{ gap: '0.35rem',
                                                          marginBottom: '0.5rem' }}>
                            <EtiquetaDeTipo tipo={evento.tipo} />
                            {evento.modalidade ? (
                              <span className="etiqueta">{evento.modalidade}</span>
                            ) : null}
                          </div>
                          <h3>{evento.titulo}</h3>
                          <div className="fraco">
                            {dataEHora(evento.inicioEm)} · {quando(evento.inicioEm)}
                          </div>
                          {evento.localNome ? (
                            <div className="fraco">{evento.localNome}</div>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  )
                }
              </Conteudo>
            </section>

            <section>
              <div className="cabecalho-de-secao">
                <h2>Equipes</h2>
              </div>
              <Conteudo busca={equipes} esqueleto={<Esqueleto altura="6rem" />}>
                {(times) =>
                  times.length === 0 ? (
                    <Vazio>Esta atlética ainda não cadastrou equipes.</Vazio>
                  ) : (
                    <div className="grade">
                      {times.map((equipe) => (
                        <div key={equipe.id} className="cartao">
                          <div className="linha entre">
                            <div>
                              <strong>{equipe.nome}</strong>
                              <div className="fraco">{equipe.modalidade}</div>
                            </div>
                            <span className="etiqueta">
                              {plural(equipe.elenco.length, 'atleta')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </Conteudo>
            </section>
          </div>
        )
      }
    </Conteudo>
  )
}
