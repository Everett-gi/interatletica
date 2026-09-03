import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { ItemDaAgendaDaRede, ResumoDaAtleticaNaRede } from '../../../api/tipos-rede'
import type { PedidoDeAjuda } from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  Secao,
  Segmentado,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, plural, quando } from '../../../formatos'

type Visao = 'LISTA' | 'MAPA'

interface Composicao {
  atleticas: ResumoDaAtleticaNaRede[]
  agenda: ItemDaAgendaDaRede[]
  pedidos: PedidoDeAjuda[]
}

/**
 * A home da rede (§31, §32 e §33).
 *
 * <p>Três blocos, nesta ordem: quem está por perto, o que está aberto, e
 * quem precisa de ajuda. É a sequência que faz a rede parecer útil já na
 * primeira visita — uma lista de perfis sozinha não dá o que fazer.</p>
 */
export function ExplorarAtleticas() {
  const { slug = '' } = useParams()
  const [visao, setVisao] = useState<Visao>('LISTA')
  const [uf, setUf] = useState('TODOS')
  const [modalidade, setModalidade] = useState('TODAS')
  const [termo, setTermo] = useState('')

  const busca = useBusca<Composicao>(async () => {
    const [atleticas, agenda, pedidos] = await Promise.all([
      Dados.atleticasDaRede(),
      Dados.agendaDaRede(),
      Dados.pedidosDeAjuda(),
    ])
    return { atleticas, agenda, pedidos }
  }, [])

  const minhaUf = busca.dados?.atleticas
    .find((a) => a.atletica.slug === slug)?.atletica.uf

  const filtradas = useMemo(() => {
    const lista = busca.dados?.atleticas ?? []
    const alvo = termo.trim().toLowerCase()
    return lista
      .filter((r) => uf === 'TODOS' || r.atletica.uf === uf)
      .filter((r) => modalidade === 'TODAS' || r.modalidades.includes(modalidade))
      .filter((r) => alvo === '' ||
        [r.atletica.nome, r.atletica.instituicao, r.atletica.cidade ?? '',
         ...r.modalidades].join(' ').toLowerCase().includes(alvo))
      // Vizinhas primeiro: quem está no mesmo estado é com quem dá para marcar
      // amistoso sem fretar ônibus.
      .sort((a, b) => Number(b.atletica.uf === minhaUf) - Number(a.atletica.uf === minhaUf))
  }, [busca.dados, uf, modalidade, termo, minhaUf])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Rede de atléticas"
        descricao="Quem mais está na plataforma, o que abriram para fora e quem está pedindo ajuda."
        acoes={
          <Segmentado
            rotulo="Forma de ver a rede"
            atual={visao}
            aoTrocar={setVisao}
            opcoes={[
              { valor: 'LISTA', rotulo: 'Lista', icone: 'lista' },
              { valor: 'MAPA', rotulo: 'Mapa', icone: 'local' },
            ]}
          />
        }
      />

      <Conteudo
        busca={busca}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="13rem" />)}
          </div>
        }
      >
        {(d) => {
          const ufs = [...new Set(d.atleticas.map((a) => a.atletica.uf)
            .filter((u): u is string => u !== null))]
          const modalidades = [...new Set(d.atleticas.flatMap((a) => a.modalidades))]

          return (
            <>
              <div className="barra-de-filtros">
                <input
                  type="search"
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Buscar por nome, instituição, cidade ou modalidade"
                  aria-label="Buscar atléticas"
                />
                <select value={uf} onChange={(e) => setUf(e.target.value)}
                        aria-label="Filtrar por estado">
                  <option value="TODOS">Todos os estados</option>
                  {ufs.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <select value={modalidade} onChange={(e) => setModalidade(e.target.value)}
                        aria-label="Filtrar por modalidade">
                  <option value="TODAS">Todas as modalidades</option>
                  {modalidades.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {uf !== 'TODOS' || modalidade !== 'TODAS' ? (
                <div className="chips" style={{ marginBottom: '1rem' }}>
                  {uf !== 'TODOS' ? (
                    <button className="chip" aria-pressed="true" onClick={() => setUf('TODOS')}>
                      {uf} <Icone nome="fechar" tamanho={12} />
                    </button>
                  ) : null}
                  {modalidade !== 'TODAS' ? (
                    <button className="chip" aria-pressed="true"
                            onClick={() => setModalidade('TODAS')}>
                      {modalidade} <Icone nome="fechar" tamanho={12} />
                    </button>
                  ) : null}
                </div>
              ) : null}

              <Secao
                titulo={uf === 'TODOS' ? 'Atléticas na plataforma' : `Atléticas em ${uf}`}
                descricao={`${filtradas.length} encontradas`}
              >
                {filtradas.length === 0 ? (
                  <EstadoVazio icone="explorar" titulo="Nenhuma atlética encontrada">
                    <p className="fraco">
                      Tente outro termo, ou remova os filtros. A rede ainda está
                      crescendo — se a sua região está vazia, você pode ser a
                      primeira a chamar as vizinhas.
                    </p>
                  </EstadoVazio>
                ) : visao === 'MAPA' ? (
                  <MapaDaRede atleticas={filtradas} slug={slug} />
                ) : (
                  <div className="grade grade--larga">
                    {filtradas.map((r) => (
                      <CartaoDeAtletica key={r.atletica.slug} resumo={r}
                                        proxima={r.atletica.uf === minhaUf} />
                    ))}
                  </div>
                )}
              </Secao>

              <Secao
                titulo="Eventos da rede"
                descricao="O que outras atléticas abriram para fora."
                acao={
                  <Link to={`/hub/${slug}/rede/feed`}
                        className="botao botao--fantasma botao--pequeno">
                    Ver o feed
                  </Link>
                }
              >
                {d.agenda.length === 0 ? (
                  <EstadoVazio titulo="Nada aberto no momento" />
                ) : (
                  <div className="rolagem-lateral">
                    {d.agenda.map((item) => (
                      <Link
                        key={item.evento.id}
                        to={`/e/${item.atletica.slug}/${item.evento.slug}`}
                        className="cartao cartao--clicavel"
                      >
                        <div className="linha" style={{ marginBottom: '0.5rem' }}>
                          <Brasao atletica={item.atletica} tamanho="p" />
                          <span className="fraco" style={{ flex: 1, minWidth: 0 }}>
                            {item.atletica.nome}
                          </span>
                          {item.organizadoras > 1 ? (
                            <span className="etiqueta etiqueta--acento">
                              {item.organizadoras} atléticas
                            </span>
                          ) : null}
                        </div>
                        <strong>{item.evento.titulo}</strong>
                        <div className="fraco" style={{ marginTop: '0.25rem' }}>
                          {dataEHora(item.evento.inicioEm)} · {quando(item.evento.inicioEm)}
                        </div>
                        <div className="linha entre" style={{ marginTop: '0.7rem' }}>
                          <span className="fraco">{item.inscritos} inscritos</span>
                          {item.vagasRestantes !== null ? (
                            <span className={`etiqueta ${
                              item.vagasRestantes === 0
                                ? 'etiqueta--alerta' : 'etiqueta--sucesso'}`}>
                              {item.vagasRestantes === 0
                                ? 'lista de espera' : plural(item.vagasRestantes, 'vaga')}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Secao>

              <Secao
                titulo="Pedidos de ajuda"
                descricao="Quem está com um problema que você talvez já tenha resolvido."
                acao={
                  <Link to={`/hub/${slug}/rede/ajuda`}
                        className="botao botao--fantasma botao--pequeno">
                    Ver todos
                  </Link>
                }
              >
                <div className="pilha pilha--densa">
                  {d.pedidos.slice(0, 3).map((p) => (
                    <Link key={p.id} to={`/hub/${slug}/rede/ajuda/${p.id}`}
                          className="cartao cartao--clicavel linha entre">
                      <div style={{ minWidth: 0 }}>
                        <strong>{p.titulo}</strong>
                        <div className="fraco">
                          {p.atletica.nome} · {p.respostas.length}{' '}
                          {p.respostas.length === 1 ? 'resposta' : 'respostas'}
                        </div>
                      </div>
                      <span className={`etiqueta ${
                        p.status === 'ABERTO' ? 'etiqueta--alerta' : ''}`}>
                        {p.status === 'ABERTO' ? 'sem resposta' : p.status.toLowerCase()}
                      </span>
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

function CartaoDeAtletica({ resumo, proxima }: {
  resumo: ResumoDaAtleticaNaRede
  proxima: boolean
}) {
  const { atletica } = resumo

  return (
    <Link to={`/a/${atletica.slug}`} className="cartao cartao--clicavel">
      <div className="linha linha--topo" style={{ marginBottom: '0.8rem' }}>
        <Brasao atletica={atletica} tamanho="g" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="linha" style={{ gap: '0.35rem' }}>
            <h3 style={{ marginBottom: 0 }}>{atletica.nome}</h3>
            {resumo.posicaoNoQuadro !== null && resumo.posicaoNoQuadro <= 3 ? (
              <span className="etiqueta etiqueta--acento">
                {resumo.posicaoNoQuadro}º no quadro
              </span>
            ) : null}
          </div>
          <div className="fraco">{atletica.instituicao}</div>
          {atletica.cidade ? (
            <div className="linha fraco" style={{ gap: '0.25rem' }}>
              <Icone nome="local" tamanho={12} />
              {atletica.cidade}/{atletica.uf}
              {proxima ? <span className="etiqueta">perto</span> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="linha" style={{ gap: '1.3rem' }}>
        <Contagem valor={resumo.membros} rotulo="membros" />
        <Contagem valor={resumo.eventosNoAno} rotulo="eventos" />
        <Contagem valor={resumo.equipes} rotulo="equipes" />
      </div>

      {resumo.modalidades.length > 0 ? (
        <div className="chips" style={{ marginTop: '0.8rem' }}>
          {resumo.modalidades.slice(0, 4).map((m) => (
            <span key={m} className="etiqueta">{m}</span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}

function Contagem({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div>
      <div className="numero-medio">{valor}</div>
      <div className="fraco">{rotulo}</div>
    </div>
  )
}

/**
 * O mapa da rede (§33).
 *
 * <p>Um esquema em SVG com as atléticas distribuídas por estado, e não um
 * mapa cartográfico. A razão é prática: carregar uma biblioteca de mapas e
 * um <em>tile server</em> custaria mais rede que o app inteiro para responder
 * uma pergunta simples — "quem está perto de mim?". Coordenada real entra
 * quando a plataforma tiver endereço de verdade das atléticas.</p>
 */
function MapaDaRede({ atleticas, slug }: {
  atleticas: ResumoDaAtleticaNaRede[]
  slug: string
}) {
  const [selecionada, setSelecionada] = useState<ResumoDaAtleticaNaRede | null>(null)

  const porUf = new Map<string, ResumoDaAtleticaNaRede[]>()
  atleticas.forEach((a) => {
    const uf = a.atletica.uf ?? '—'
    porUf.set(uf, [...(porUf.get(uf) ?? []), a])
  })
  const estados = [...porUf.entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="detalhe">
      <div className="mapa" style={{ padding: '1.2rem' }}>
        <div className="pilha">
          {estados.map(([uf, lista]) => (
            <div key={uf}>
              <div className="linha" style={{ gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span className="etiqueta etiqueta--acento">{uf}</span>
                <span className="fraco">
                  {lista.length} {lista.length === 1 ? 'atlética' : 'atléticas'}
                </span>
                <span style={{ flex: 1, height: '1px', background: 'var(--borda)' }} />
              </div>

              <div className="linha" style={{ gap: '0.6rem' }}>
                {lista.map((a) => (
                  <button
                    key={a.atletica.slug}
                    className="mapa__marcador"
                    onClick={() => setSelecionada(a)}
                    aria-label={`${a.atletica.nome}, ${a.atletica.cidade}`}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      display: 'grid', placeItems: 'center', gap: '0.25rem',
                    }}
                  >
                    <span style={{
                      outline: selecionada?.atletica.slug === a.atletica.slug
                        ? '3px solid var(--acento)' : 'none',
                      outlineOffset: '2px',
                      borderRadius: '10px',
                      display: 'block',
                    }}>
                      <Brasao atletica={a.atletica} tamanho="m" />
                    </span>
                    <span className="fraco" style={{ fontSize: '0.72rem' }}>
                      {a.atletica.sigla ?? a.atletica.nome.slice(0, 6)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        {selecionada ? (
          <div className="cartao cartao--destacado">
            <div className="linha linha--topo" style={{ marginBottom: '0.8rem' }}>
              <Brasao atletica={selecionada.atletica} tamanho="g" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ marginBottom: '0.1rem' }}>{selecionada.atletica.nome}</h3>
                <div className="fraco">{selecionada.atletica.instituicao}</div>
                <div className="fraco">
                  {selecionada.atletica.cidade}/{selecionada.atletica.uf}
                </div>
              </div>
            </div>

            <div className="linha" style={{ gap: '1.3rem', marginBottom: '0.9rem' }}>
              <Contagem valor={selecionada.membros} rotulo="membros" />
              <Contagem valor={selecionada.equipes} rotulo="equipes" />
              <Contagem valor={selecionada.eventosNoAno} rotulo="eventos" />
            </div>

            {selecionada.modalidades.length > 0 ? (
              <div className="chips" style={{ marginBottom: '0.9rem' }}>
                {selecionada.modalidades.map((m) => (
                  <span key={m} className="etiqueta">{m}</span>
                ))}
              </div>
            ) : null}

            <div className="linha">
              <Link to={`/a/${selecionada.atletica.slug}`} className="botao botao--largo">
                Ver perfil
              </Link>
            </div>
            <Link to={`/hub/${slug}/rede/amistosos`}
                  className="botao botao--discreto botao--largo"
                  style={{ marginTop: '0.5rem' }}>
              Procurar amistoso
            </Link>
          </div>
        ) : (
          <EstadoVazio icone="local" titulo="Selecione uma atlética no mapa">
            <p className="fraco">
              As atléticas estão agrupadas por estado. Quem está no mesmo estado
              é com quem dá para marcar amistoso sem fretar ônibus.
            </p>
          </EstadoVazio>
        )}
      </div>
    </div>
  )
}
