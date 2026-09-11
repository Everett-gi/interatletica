import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Convite, Membro } from '../../api/tipos'
import type { PainelDaAtletica } from '../../api/tipos-rede'
import {
  Conteudo,
  Esqueleto,
  EtiquetaDeStatus,
  Metrica,
  useBusca,
} from '../../ui/componentes'
import { EstadoVazio, Secao } from '../../ui/pagina'
import { Icone } from '../../ui/icones'
import { dataEHora, plural, quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

/**
 * A primeira tela de quem administra, no app real.
 *
 * <p>Existe separada do painel da demonstração por honestidade: aquele
 * mostra caixa, decisões em votação e feed da rede, que são módulos sem
 * servidor. Aqui só entra o que a API responde — atlética, membros,
 * convites e eventos. Um indicador a mais, vindo de dado fictício, seria a
 * diretoria tomando decisão em cima de número inventado.</p>
 *
 * <p>Vazio não é falha: atlética recém-criada não tem evento nem diretoria,
 * e a tela precisa dizer o que fazer em vez de mostrar quatro zeros.</p>
 */
interface Composicao {
  painel: PainelDaAtletica
  membros: Membro[]
  convites: Convite[]
}

export function PainelReal() {
  const { slug = '' } = useParams()
  const { perfil, podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const presidente = podeAtuarComo(slug, 'PRESIDENTE')

  const busca = useBusca<Composicao>(async () => {
    const [painel, membros, convites] = await Promise.all([
      Dados.painel(slug),
      Dados.membros(slug),
      // Convite é assunto de presidente; para o resto a API responde 403 e
      // a seção simplesmente não aparece.
      presidente ? Dados.convites(slug) : Promise.resolve([] as Convite[]),
    ])
    return { painel, membros, convites }
  }, [slug, presidente])

  const primeiroNome = perfil?.nome.split(' ')[0] ?? ''

  return (
    <div className="pilha" style={{ gap: '1.9rem' }}>
      <header className="pagina__cabecalho">
        <div>
          <h1 className="pagina__titulo">{saudacao()}, {primeiroNome} 👋</h1>
          <p className="pagina__descricao">
            {diretor
              ? 'O que está acontecendo na sua atlética, e o que depende de você.'
              : 'O que a sua atlética marcou, e onde você entra.'}
          </p>
        </div>
        {diretor ? (
          <div className="pagina__acoes">
            <Link to={`/hub/${slug}/eventos/novo`} className="botao">
              <Icone nome="mais" tamanho={16} /> Novo evento
            </Link>
          </div>
        ) : null}
      </header>

      <Conteudo busca={busca} esqueleto={<EsqueletoDoPainel />}>
        {(d) => {
          const ativos = d.membros.filter((m) => m.situacao === 'ATIVO')
          const diretoria = ativos.filter((m) => m.papel !== 'MEMBRO')
          const semCargo = ativos.filter((m) => m.papel !== 'MEMBRO' && !m.cargo)

          return (
            <>
              <div className="grade grade--metricas">
                <Metrica rotulo="Membros ativos" icone="membros" valor={ativos.length}
                         para={`/hub/${slug}/membros`}
                         detalhe={`${plural(diretoria.length, 'na diretoria')}`} />
                <Metrica rotulo="Eventos próximos" icone="eventos"
                         para={`/hub/${slug}/eventos`}
                         valor={d.painel.proximosEventos.length} />
                <Metrica rotulo="Publicados" icone="inscricoes"
                         para={`/hub/${slug}/inscricoes`}
                         valor={d.painel.eventosPublicados}
                         detalhe="abertos para inscrição" />
                <Metrica rotulo="Convites abertos" icone="membros"
                         para={`/hub/${slug}/membros`}
                         valor={d.convites.length}
                         detalhe={d.convites.length > 0 ? 'esperando aceite' : undefined} />
              </div>

              <div className="detalhe">
                <div className="pilha" style={{ gap: '1.6rem' }}>
                  <ProximosEventos slug={slug} painel={d.painel} diretor={diretor} />
                </div>

                <div className="pilha" style={{ gap: '1.6rem' }}>
                  <Secao titulo="Por onde continuar">
                    <div className="pilha pilha--densa">
                      {ativos.length <= 1 ? (
                        <Atalho slug={slug} para="membros?convidar=1" icone="membros"
                                titulo="Convide a diretoria"
                                texto="A atlética ainda é você sozinho. O convite vai para o e-mail da pessoa." />
                      ) : null}
                      {semCargo.length > 0 ? (
                        <Atalho slug={slug} para="membros" icone="diretoria"
                                titulo="Diga de que cada um cuida"
                                texto={`${plural(semCargo.length, 'pessoa')} na diretoria sem cargo escrito.`} />
                      ) : null}
                      {d.painel.eventosPublicados === 0 ? (
                        <Atalho slug={slug} para="eventos/novo" icone="eventos"
                                titulo="Crie o primeiro evento"
                                texto="Treino, festa ou campeonato. Publicar gera a página que circula no WhatsApp." />
                      ) : null}
                      <Atalho slug={slug} para="boas-vindas" icone="certo"
                              titulo="Ver os primeiros passos"
                              texto="A lista curta do que falta para a plataforma servir para alguma coisa." />
                    </div>
                  </Secao>

                  <Secao titulo="A diretoria">
                    {diretoria.length === 0 ? (
                      <EstadoVazio icone="diretoria" titulo="Ninguém na diretoria ainda">
                        <p className="fraco">
                          Convide quem cuida de esportes, financeiro e comunicação.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha pilha--densa">
                        {diretoria.slice(0, 6).map((m) => (
                          <div key={m.id} className="cartao cartao--compacto linha entre">
                            <div style={{ minWidth: 0 }}>
                              <strong>{m.nome}</strong>
                              <div className="fraco">{m.cargo ?? 'sem cargo escrito'}</div>
                            </div>
                            <span className={`etiqueta ${
                              m.papel === 'PRESIDENTE' ? 'etiqueta--acento' : ''}`}>
                              {m.papel === 'PRESIDENTE' ? 'Presidente' : 'Diretor'}
                            </span>
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

function ProximosEventos({ slug, painel, diretor }: {
  slug: string
  painel: PainelDaAtletica
  diretor: boolean
}) {
  return (
    <Secao
      titulo="Próximos eventos"
      acao={
        <Link to={`/hub/${slug}/eventos`} className="botao botao--fantasma botao--pequeno">
          Ver todos
        </Link>
      }
    >
      {painel.proximosEventos.length === 0 ? (
        <EstadoVazio icone="calendario" titulo="Nada marcado por enquanto">
          <p className="fraco">
            {diretor
              ? 'O primeiro evento é o que faz a plataforma sair do papel: ele gera a página pública e a lista de presença.'
              : 'Quando a diretoria publicar um evento, ele aparece aqui.'}
          </p>
          {diretor ? (
            <Link to={`/hub/${slug}/eventos/novo`} className="botao botao--pequeno">
              <Icone nome="mais" tamanho={15} /> Criar evento
            </Link>
          ) : null}
        </EstadoVazio>
      ) : (
        <div className="pilha pilha--densa">
          {painel.proximosEventos.map((e) => (
            <Link key={e.id} to={`/hub/${slug}/eventos/${e.id}`}
                  className="cartao cartao--clicavel linha entre">
              <div className="linha" style={{ minWidth: 0, flex: 1 }}>
                <span className="notificacao__icone">
                  <Icone nome="eventos" tamanho={16} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <strong>{e.titulo}</strong>
                  <div className="fraco">
                    {dataEHora(e.inicioEm)} · {quando(e.inicioEm)}
                    {e.localNome ? ` · ${e.localNome}` : ''}
                  </div>
                </div>
              </div>
              <EtiquetaDeStatus status={e.status} />
            </Link>
          ))}
        </div>
      )}
    </Secao>
  )
}

function Atalho({ slug, para, icone, titulo, texto }: {
  slug: string
  para: string
  icone: 'membros' | 'diretoria' | 'eventos' | 'certo'
  titulo: string
  texto: string
}) {
  return (
    <Link to={`/hub/${slug}/${para}`} className="cartao cartao--clicavel linha linha--topo">
      <span className="notificacao__icone">
        <Icone nome={icone} tamanho={16} />
      </span>
      <div style={{ minWidth: 0 }}>
        <strong>{titulo}</strong>
        <div className="fraco">{texto}</div>
      </div>
    </Link>
  )
}

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function EsqueletoDoPainel() {
  return (
    <div className="pilha" style={{ gap: '1.6rem' }}>
      <div className="grade grade--metricas">
        {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="6.4rem" />)}
      </div>
      <div className="detalhe">
        <Esqueleto altura="16rem" />
        <Esqueleto altura="12rem" />
      </div>
    </div>
  )
}
