import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Membro } from '../../../api/tipos'
import type { EventoDoHistorico, Gestao, Meta, Projeto } from '../../../api/tipos-gestao'
import type { Equipe, PainelDaAtletica } from '../../../api/tipos-rede'
import type { Patrocinio, ResumoFinanceiro } from '../../../api/tipos-financeiro'
import type { Conquista } from '../../../api/tipos-plataforma'
import {
  Avatar,
  Brasao,
  Conteudo,
  Esqueleto,
  EtiquetaDeStatus,
  Metrica,
  useBusca,
} from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  LinhaDoTempo,
  ItemDaLinha,
  Progresso,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, dinheiro, percentual, plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

interface Composicao {
  painel: PainelDaAtletica
  membros: Membro[]
  equipes: Equipe[]
  projetos: Projeto[]
  metas: Meta[]
  financeiro: ResumoFinanceiro
  patrocinios: Patrocinio[]
  gestoes: Gestao[]
  historico: EventoDoHistorico[]
  conquistas: Conquista[]
}

/**
 * A página institucional da atlética (§12 e §13).
 *
 * <p>É a resposta à pergunta "como está a atlética?" — diferente do Início,
 * que responde "o que eu preciso fazer hoje?". Uma olha para a organização,
 * a outra para o dia. Misturar as duas produzia um painel que não servia
 * bem a nenhuma das perguntas.</p>
 */
export function VisaoGeral() {
  const { slug = '' } = useParams()
  const { vinculo, podeAtuarComo } = useSessao()
  const meu = vinculo(slug)
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const base = `/hub/${slug}`

  const busca = useBusca<Composicao>(async () => {
    const [painel, membros, equipes, projetos, metas, financeiro,
           patrocinios, gestoes, historico, conquistas] = await Promise.all([
      Dados.painel(slug),
      Dados.membros(slug),
      Dados.equipes(slug),
      Dados.projetos(slug),
      Dados.metas(slug),
      Dados.resumoFinanceiro(slug),
      Dados.patrocinios(slug),
      Dados.gestoes(slug),
      Dados.historico(),
      Dados.conquistas(slug),
    ])
    return { painel, membros, equipes, projetos, metas, financeiro,
             patrocinios, gestoes, historico, conquistas }
  }, [slug])

  const atletica = meu?.atletica

  return (
    <div>
      {atletica ? (
        <section
          className="capa"
          style={{
            background: atletica.corPrimaria ?? 'var(--acento)',
            marginBottom: '1.4rem',
          }}
        >
          <div className="linha linha--topo" style={{ gap: '1rem' }}>
            <Brasao atletica={atletica} tamanho="g" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: '1.6rem', marginBottom: '0.15rem' }}>
                {atletica.nome}
              </h1>
              <div style={{ opacity: 0.92 }}>{atletica.instituicao}</div>
              {atletica.cidade ? (
                <div className="linha" style={{ gap: '0.3rem', opacity: 0.85,
                                                marginTop: '0.25rem' }}>
                  <Icone nome="local" tamanho={14} />
                  {atletica.cidade} · {atletica.uf}
                </div>
              ) : null}
            </div>
            <div className="linha">
              <Link to={`/a/${slug}`} className="botao botao--pequeno"
                    style={{ background: '#fff', color: '#1a2540' }}>
                Ver como visitante
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <CabecalhoDePagina
        titulo="Visão geral"
        descricao="O retrato da organização: quem faz parte, o que está em curso e o que já ficou registrado."
      />

      <Conteudo
        busca={busca}
        esqueleto={
          <div className="grade grade--metricas">
            {[0, 1, 2, 3, 4, 5].map((i) => <Esqueleto key={i} altura="6rem" />)}
          </div>
        }
      >
        {(d) => {
          const gestaoAtual = d.gestoes.find((g) => !g.encerrada) ?? d.gestoes[0]
          const ativos = d.membros.filter((m) => m.situacao === 'ATIVO')
          const modalidades = [...new Set(d.equipes.map((e) => e.modalidade))]

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.8rem' }}>
                <Metrica rotulo="Membros" icone="membros" para={`${base}/membros`}
                         valor={ativos.length} detalhe="com vínculo ativo" />
                <Metrica rotulo="Equipes" icone="equipes" para={`${base}/equipes`}
                         valor={d.equipes.length}
                         detalhe={plural(modalidades.length, 'modalidade')} />
                <Metrica rotulo="Eventos no ar" icone="eventos" para={`${base}/eventos`}
                         valor={d.painel.eventosPublicados} />
                <Metrica rotulo="Projetos" icone="projetos" para={`${base}/projetos`}
                         valor={d.projetos.filter((p) => p.status === 'EM_ANDAMENTO').length}
                         detalhe="em andamento" />
                {diretor ? (
                  <Metrica rotulo="Em caixa" icone="financeiro" para={`${base}/financeiro`}
                           valor={dinheiro(d.financeiro.saldoAtual)}
                           cor={d.financeiro.saldoAtual < 0 ? 'var(--perigo)' : undefined} />
                ) : null}
                <Metrica rotulo="Patrocinadores" icone="patrocinios"
                         para={diretor ? `${base}/mercado/patrocinios` : undefined}
                         valor={d.patrocinios.filter((p) => p.etapa === 'ATIVO').length}
                         detalhe="ativos" />
              </div>

              <div className="detalhe">
                <div>
                  {gestaoAtual ? (
                    <Secao
                      titulo={`Gestão ${gestaoAtual.ano}`}
                      descricao={gestaoAtual.periodo}
                      acao={
                        <Link to={`${base}/gestao`}
                              className="botao botao--fantasma botao--pequeno">
                          Ver as gestões
                        </Link>
                      }
                    >
                      <div className="cartao">
                        <div className="linha" style={{ marginBottom: '0.9rem' }}>
                          <Avatar nome={gestaoAtual.presidente} tamanho="m" />
                          <div>
                            <strong>{gestaoAtual.presidente}</strong>
                            <div className="fraco">Presidência</div>
                          </div>
                        </div>
                        <div className="linha" style={{ gap: '0.4rem' }}>
                          {gestaoAtual.integrantes.slice(1, 7).map((i) => (
                            <span key={i.nome} className="etiqueta" title={i.nome}>
                              {i.cargo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Secao>
                  ) : null}

                  {d.metas.length > 0 ? (
                    <Secao
                      titulo="Metas da gestão"
                      acao={diretor ? (
                        <Link to={`${base}/metas`}
                              className="botao botao--fantasma botao--pequeno">
                          Ver todas
                        </Link>
                      ) : undefined}
                    >
                      <div className="pilha pilha--densa">
                        {d.metas.slice(0, 4).map((meta) => (
                          <div key={meta.id} className="cartao cartao--compacto">
                            <div className="linha entre" style={{ marginBottom: '0.35rem' }}>
                              <strong>{meta.titulo}</strong>
                              <span className="fraco">
                                {meta.unidade === 'reais'
                                  ? `${dinheiro(meta.atual)} de ${dinheiro(meta.alvo)}`
                                  : `${meta.atual} de ${meta.alvo} ${meta.unidade}`}
                              </span>
                            </div>
                            <Progresso
                              proporcao={meta.atual / meta.alvo}
                              tom={meta.atual / meta.alvo >= 1 ? 'sucesso' : undefined}
                            />
                          </div>
                        ))}
                      </div>
                    </Secao>
                  ) : null}

                  <Secao
                    titulo="Próximos eventos"
                    acao={
                      <Link to={`${base}/eventos`}
                            className="botao botao--fantasma botao--pequeno">
                        Ver todos
                      </Link>
                    }
                  >
                    {d.painel.proximosEventos.length === 0 ? (
                      <EstadoVazio icone="eventos" titulo="Nenhum evento marcado">
                        <p className="fraco">
                          Organize o primeiro evento da sua atlética.
                        </p>
                        {diretor ? (
                          <Link to={`${base}/eventos/novo`} className="botao">
                            <Icone nome="mais" tamanho={16} /> Criar evento
                          </Link>
                        ) : null}
                      </EstadoVazio>
                    ) : (
                      <div className="pilha pilha--densa">
                        {d.painel.proximosEventos.map((e) => (
                          <Link key={e.id} to={`${base}/eventos/${e.id}`}
                                className="cartao cartao--clicavel linha entre">
                            <div style={{ minWidth: 0 }}>
                              <strong>{e.titulo}</strong>
                              <div className="fraco">
                                {dataEHora(e.inicioEm)}
                                {e.localNome ? ` · ${e.localNome}` : ''}
                              </div>
                            </div>
                            <EtiquetaDeStatus status={e.status} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </Secao>

                  <Secao
                    titulo="Atividade recente"
                    descricao="A trilha que preserva a memória: quem fez o quê, e quando."
                  >
                    <div className="cartao">
                      <LinhaDoTempo>
                        {d.historico.slice(0, 7).map((h, i) => (
                          <ItemDaLinha key={h.id} estado={i === 0 ? 'ativo' : 'feito'}>
                            <div style={{ fontSize: '0.92rem' }}>
                              <strong>{h.autorNome}</strong> {h.acao}{' '}
                              <strong>{h.alvo}</strong>
                            </div>
                            <div className="fraco">
                              {quando(h.quando)}
                              {h.detalhe ? ` · ${h.detalhe}` : ''}
                            </div>
                          </ItemDaLinha>
                        ))}
                      </LinhaDoTempo>
                    </div>
                  </Secao>
                </div>

                <div>
                  <Secao titulo="Modalidades">
                    {modalidades.length === 0 ? (
                      <EstadoVazio titulo="Sem equipes ainda">
                        <p className="fraco">
                          Cadastre as equipes para que possam se inscrever em torneios.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="chips">
                        {modalidades.map((m) => (
                          <Link key={m} to={`${base}/equipes`} className="chip">{m}</Link>
                        ))}
                      </div>
                    )}
                  </Secao>

                  <Secao titulo="Diretoria"
                         acao={
                           <Link to={`${base}/diretoria`}
                                 className="botao botao--fantasma botao--pequeno">
                             Organograma
                           </Link>
                         }>
                    <div className="pilha pilha--densa">
                      {ativos.filter((m) => m.papel !== 'MEMBRO').slice(0, 6).map((m) => (
                        <div key={m.id} className="linha">
                          <Avatar nome={m.nome} url={m.avatarUrl} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 550 }}>{m.nome}</div>
                            <div className="fraco">{m.cargo ?? 'Diretoria'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Secao>

                  <Secao titulo="Patrocinadores">
                    {d.patrocinios.filter((p) => p.etapa === 'ATIVO').length === 0 ? (
                      <EstadoVazio titulo="Nenhum patrocínio ativo" />
                    ) : (
                      <div className="pilha pilha--densa">
                        {d.patrocinios.filter((p) => p.etapa === 'ATIVO').map((p) => (
                          <div key={p.id} className="cartao cartao--compacto">
                            <strong>{p.empresa}</strong>
                            <div className="fraco">{p.segmento}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Secao>

                  <Secao titulo="Conquistas"
                         descricao="Marcos da atlética na plataforma.">
                    <div className="cartao">
                      <div className="pilha pilha--densa">
                        {d.conquistas.filter((c) => c.conquistadaEm !== null)
                          .slice(0, 5).map((c) => (
                          <div key={c.id} className="linha">
                            <span style={{ fontSize: '1.2rem' }} aria-hidden="true">
                              {c.icone}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 550 }}>{c.titulo}</div>
                              <div className="fraco">{c.descricao}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="fraco" style={{ marginTop: '0.7rem' }}>
                        {percentual(
                          d.conquistas.filter((c) => c.conquistadaEm !== null).length
                          / d.conquistas.length)}{' '}
                        das conquistas alcançadas
                      </div>
                    </div>
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
