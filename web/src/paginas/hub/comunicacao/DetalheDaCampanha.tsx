import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { CanalDeConteudo, Campanha } from '../../../api/tipos-comunicacao'
import type { Patrocinio } from '../../../api/tipos-financeiro'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  ItemDaLinha,
  LinhaDoTempo,
  Progresso,
  Secao,
} from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { dataCurta, percentual, quando } from '../../../formatos'
import { STATUS_DA_PUBLICACAO } from './Noticias'

const CANAL: Record<CanalDeConteudo, { rotulo: string; icone: NomeDoIcone }> = {
  INSTAGRAM: { rotulo: 'Instagram', icone: 'midia' },
  STORIES: { rotulo: 'Stories', icone: 'campanhas' },
  TIKTOK: { rotulo: 'TikTok', icone: 'midia' },
  YOUTUBE: { rotulo: 'YouTube', icone: 'midia' },
  PRESENCIAL: { rotulo: 'Presencial', icone: 'eventos' },
}

interface Composicao {
  campanha: Campanha | null
  patrocinios: Patrocinio[]
}

/**
 * Uma campanha: meta, calendário e o que ainda não tem dono.
 *
 * <p>O bloco de conteúdos sem responsável existe porque é o defeito mais
 * comum de calendário editorial: a ideia entra na planilha, ninguém assume,
 * e a data chega. Aqui isso aparece em destaque em vez de ficar diluído na
 * lista.</p>
 */
export function DetalheDaCampanha() {
  const { slug = '', id = '' } = useParams()

  const busca = useBusca<Composicao>(async () => {
    const [campanha, patrocinios] = await Promise.all([
      Dados.campanha(id),
      Dados.patrocinios(slug),
    ])
    return { campanha, patrocinios }
  }, [slug, id])

  return (
    <div>
      <Conteudo busca={busca} esqueleto={<Esqueleto altura="20rem" />}>
        {({ campanha: c, patrocinios }) => {
          if (!c) {
            return (
              <EstadoVazio icone="campanhas" titulo="Campanha não encontrada">
                <Link to={`/hub/${slug}/comunicacao/campanhas`}
                      className="botao botao--discreto">
                  Voltar às campanhas
                </Link>
              </EstadoVazio>
            )
          }

          const proporcao = c.atual / c.metaValor
          const publicados = c.conteudos.filter((x) => x.status === 'PUBLICADO')
          const semDono = c.conteudos.filter((x) => x.responsavelNome === null)
          const patrocinio = patrocinios.find((p) => p.id === c.patrocinioId)
          const ordenados = [...c.conteudos]
            .sort((a, b) => a.publicarEm.localeCompare(b.publicarEm))

          return (
            <>
              <CabecalhoDePagina
                titulo={c.nome}
                descricao={c.objetivo}
                trilha={[
                  { rotulo: 'Comunicação', para: `/hub/${slug}/comunicacao` },
                  { rotulo: 'Campanhas', para: `/hub/${slug}/comunicacao/campanhas` },
                  { rotulo: c.nome },
                ]}
              />

              <div className="cartao" style={{ marginBottom: '1.5rem' }}>
                <div className="linha entre" style={{ alignItems: 'baseline',
                                                      marginBottom: '0.6rem' }}>
                  <div>
                    <div className="fraco">Progresso da meta</div>
                    <div className="numero-grande">
                      {c.atual}
                      <span className="fraco" style={{ fontSize: '1.1rem' }}>
                        {' '}/ {c.metaValor} {c.metaUnidade}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="numero-medio">{percentual(proporcao)}</div>
                    <div className="fraco">termina {quando(c.fimEm)}</div>
                  </div>
                </div>
                <Progresso proporcao={proporcao}
                           tom={proporcao >= 1 ? 'sucesso'
                             : proporcao < 0.4 ? 'alerta' : undefined} />
              </div>

              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Conteúdos" icone="midia" valor={c.conteudos.length} />
                <Metrica rotulo="Publicados" icone="certo" valor={publicados.length} />
                <Metrica rotulo="Sem responsável" icone="alerta" valor={semDono.length}
                         cor={semDono.length > 0 ? 'var(--alerta)' : undefined} />
                <Metrica rotulo="Canais" icone="comunicacao"
                         valor={new Set(c.conteudos.map((x) => x.canal)).size} />
              </div>

              {semDono.length > 0 ? (
                <div className="aviso aviso--alerta" style={{ marginBottom: '1.3rem' }}>
                  <strong>
                    {semDono.length}{' '}
                    {semDono.length === 1 ? 'conteúdo sem responsável' : 'conteúdos sem responsável'}
                  </strong>
                  <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                    {semDono.map((x) => x.titulo).join(', ')}. Ideia sem nome vira
                    data que chega e ninguém produziu.
                  </p>
                </div>
              ) : null}

              <div className="detalhe">
                <div>
                  <Secao
                    titulo="Calendário de conteúdo"
                    descricao="O que sai, quando e por conta de quem."
                  >
                    <div className="cartao">
                      <LinhaDoTempo>
                        {ordenados.map((x) => (
                          <ItemDaLinha
                            key={x.id}
                            estado={x.status === 'PUBLICADO' ? 'feito'
                              : x.status === 'PRODUCAO' ? 'ativo' : 'pendente'}
                          >
                            <div className="linha entre">
                              <div style={{ minWidth: 0 }}>
                                <strong style={{ fontSize: '0.93rem' }}>{x.titulo}</strong>
                                <div className="linha fraco" style={{ gap: '0.35rem' }}>
                                  <Icone nome={CANAL[x.canal].icone} tamanho={13} />
                                  {CANAL[x.canal].rotulo}
                                  {' · '}
                                  {x.responsavelNome ?? 'sem responsável'}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span className={`etiqueta ${
                                  STATUS_DA_PUBLICACAO[x.status].classe}`}>
                                  {STATUS_DA_PUBLICACAO[x.status].rotulo}
                                </span>
                                <div className="fraco">{dataCurta(x.publicarEm)}</div>
                              </div>
                            </div>
                          </ItemDaLinha>
                        ))}
                      </LinhaDoTempo>
                    </div>
                  </Secao>
                </div>

                <div>
                  <Secao titulo="A campanha">
                    <div className="cartao">
                      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                        <span className="fraco">Início</span>
                        <span>{dataCurta(c.inicioEm)}</span>
                      </div>
                      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                        <span className="fraco">Fim</span>
                        <span>{dataCurta(c.fimEm)}</span>
                      </div>
                      <div className="linha entre">
                        <span className="fraco">Responsável</span>
                        <span>{c.responsavelNome ?? '—'}</span>
                      </div>
                    </div>
                  </Secao>

                  {patrocinio ? (
                    <Secao titulo="Contrapartida de patrocínio">
                      <Link to={`/hub/${slug}/mercado/patrocinios`}
                            className="cartao cartao--clicavel">
                        <strong>{patrocinio.empresa}</strong>
                        <div className="fraco" style={{ marginBottom: '0.6rem' }}>
                          {patrocinio.segmento}
                        </div>
                        <div className="pilha pilha--densa">
                          {patrocinio.contrapartidas.map((x) => (
                            <div key={x} className="linha" style={{ gap: '0.45rem' }}>
                              <span style={{ color: 'var(--sucesso)' }}>
                                <Icone nome="certo" tamanho={14} />
                              </span>
                              <span style={{ fontSize: '0.87rem' }}>{x}</span>
                            </div>
                          ))}
                        </div>
                      </Link>
                    </Secao>
                  ) : null}

                  <Secao titulo="Materiais">
                    <Link to={`/hub/${slug}/comunicacao/midia`}
                          className="cartao cartao--clicavel linha">
                      <Icone nome="midia" tamanho={17} />
                      <span style={{ flex: 1, minWidth: 0 }}>Biblioteca de mídia</span>
                      <Icone nome="direita" tamanho={14} />
                    </Link>
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
