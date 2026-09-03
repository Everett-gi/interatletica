import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { PainelDaAtletica, Tarefa } from '../../api/tipos-rede'
import type { Decisao, Projeto, Reuniao } from '../../api/tipos-gestao'
import type { ResumoFinanceiro } from '../../api/tipos-financeiro'
import type { Jogo } from '../../api/tipos-esportes'
import type { PostDaRede } from '../../api/tipos-conhecimento'
import type { Campanha } from '../../api/tipos-comunicacao'
import type { Patrocinio } from '../../api/tipos-financeiro'
import {
  Avatar,
  Conteudo,
  Esqueleto,
  EtiquetaDeStatus,
  Metrica,
  useBusca,
} from '../../ui/componentes'
import { EstadoVazio, Progresso, Secao } from '../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../ui/icones'
import { dataEHora, dinheiro, percentual, plural, quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

/**
 * A primeira tela de quem administra.
 *
 * <p>Duas regras a governam. A primeira é do §4: <strong>resumo primeiro,
 * detalhe depois</strong> — daqui não sai nenhuma tabela; sai um indicador,
 * um cartão e um caminho para o detalhe. A segunda é do §11: <strong>o
 * painel muda com a função</strong>. O tesoureiro abre no caixa, o diretor
 * de esportes abre nos jogos, o membro abre no que ele pode fazer. Um painel
 * igual para todos é um painel bom para ninguém.</p>
 */

type Funcao = 'PRESIDENCIA' | 'FINANCEIRO' | 'ESPORTES' | 'MARKETING' | 'EVENTOS' | 'MEMBRO'

/**
 * A função vem do cargo escrito pela própria atlética, com o papel como rede
 * de segurança. "Diretora de E-sports" e "Diretor de Esportes" precisam cair
 * no mesmo painel sem que a plataforma imponha uma lista fechada de cargos.
 */
function funcaoDe(papel: string, cargo: string | null): Funcao {
  const c = (cargo ?? '').toLowerCase()
  if (papel === 'PRESIDENTE' || c.includes('presiden')) return 'PRESIDENCIA'
  if (c.includes('financ') || c.includes('tesour')) return 'FINANCEIRO'
  if (c.includes('esport') || c.includes('atlet')) return 'ESPORTES'
  if (c.includes('marketing') || c.includes('comunica')) return 'MARKETING'
  if (c.includes('event')) return 'EVENTOS'
  return papel === 'DIRETOR' ? 'EVENTOS' : 'MEMBRO'
}

interface Composicao {
  painel: PainelDaAtletica
  financeiro: ResumoFinanceiro
  tarefas: Tarefa[]
  decisoes: Decisao[]
  reunioes: Reuniao[]
  projetos: Projeto[]
  jogos: Jogo[]
  campanhas: Campanha[]
  patrocinios: Patrocinio[]
  feed: PostDaRede[]
}

export function Painel() {
  const { slug = '' } = useParams()
  const { perfil, vinculo, podeAtuarComo } = useSessao()
  const meu = vinculo(slug)
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const funcao = funcaoDe(meu?.papel ?? 'MEMBRO', meu?.cargo ?? null)

  const busca = useBusca<Composicao>(async () => {
    const [painel, financeiro, tarefas, decisoes, reunioes, projetos,
           jogos, campanhas, patrocinios, feed] = await Promise.all([
      Dados.painel(slug),
      Dados.resumoFinanceiro(slug),
      Dados.tarefas(slug),
      Dados.decisoes(slug),
      Dados.reunioes(slug),
      Dados.projetos(slug),
      Dados.jogos(slug),
      Dados.campanhas(slug),
      Dados.patrocinios(slug),
      Dados.feedDaRede(),
    ])
    return { painel, financeiro, tarefas, decisoes, reunioes, projetos,
             jogos, campanhas, patrocinios, feed }
  }, [slug])

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
        {(d) => (
          <>
            <Indicadores slug={slug} funcao={funcao} dados={d} />

            {d.painel.avisosFixados.length > 0 ? (
              <section>
                {d.painel.avisosFixados.map((aviso) => (
                  <Link
                    key={aviso.id}
                    to={`/hub/${slug}/avisos`}
                    className="aviso aviso--alerta"
                    style={{ display: 'block', marginBottom: '0.5rem', color: 'inherit' }}
                  >
                    <strong>{aviso.titulo}</strong>
                    <div className="fraco">{aviso.corpo}</div>
                  </Link>
                ))}
              </section>
            ) : null}

            <div className="detalhe">
              <div className="pilha" style={{ gap: '1.6rem' }}>
                <ProximasAtividades slug={slug} dados={d} />
                {funcao === 'FINANCEIRO' ? <CaixaDoMes slug={slug} dados={d} /> : null}
                {funcao === 'ESPORTES' ? <ProximosJogos slug={slug} dados={d} /> : null}
                {funcao === 'MARKETING' ? <CampanhasEmCurso slug={slug} dados={d} /> : null}
                {diretor ? <ProjetosEmAndamento slug={slug} dados={d} /> : null}
              </div>

              <div className="pilha" style={{ gap: '1.6rem' }}>
                <MinhasPendencias slug={slug} dados={d} funcao={funcao} />
                <DaRede slug={slug} dados={d} />
              </div>
            </div>
          </>
        )}
      </Conteudo>
    </div>
  )
}

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

// ---------------------------------------------------------------------
// Indicadores por função (§11)
// ---------------------------------------------------------------------

function Indicadores({ slug, funcao, dados }: {
  slug: string
  funcao: Funcao
  dados: Composicao
}) {
  const base = `/hub/${slug}`
  const atrasadas = dados.tarefas.filter((t) =>
    t.status !== 'CONCLUIDA' && t.prazo !== null && new Date(t.prazo) < new Date()).length
  const emVotacao = dados.decisoes.filter((d) => d.status === 'EM_VOTACAO').length

  if (funcao === 'FINANCEIRO') {
    return (
      <div className="grade grade--metricas">
        <Metrica rotulo="Saldo em caixa" icone="financeiro" para={`${base}/financeiro`}
                 valor={dinheiro(dados.financeiro.saldoAtual)}
                 cor={dados.financeiro.saldoAtual < 0 ? 'var(--perigo)' : undefined} />
        <Metrica rotulo="A receber" icone="receitas" para={`${base}/financeiro/receitas`}
                 valor={dinheiro(dados.financeiro.aReceber)} detalhe="previsto e não confirmado" />
        <Metrica rotulo="A pagar" icone="despesas" para={`${base}/financeiro/despesas`}
                 valor={dinheiro(dados.financeiro.aPagar)}
                 cor={dados.financeiro.aPagar > dados.financeiro.saldoAtual
                   ? 'var(--alerta)' : undefined} />
        <Metrica rotulo="Patrocínios ativos" icone="patrocinios"
                 para={`${base}/mercado/patrocinios`}
                 valor={dados.patrocinios.filter((p) => p.etapa === 'ATIVO').length}
                 detalhe={dinheiro(dados.patrocinios
                   .filter((p) => p.etapa === 'ATIVO')
                   .reduce((s, p) => s + (p.valor ?? 0), 0)) + ' contratados'} />
      </div>
    )
  }

  if (funcao === 'ESPORTES') {
    const proximos = dados.jogos.filter((j) => new Date(j.inicioEm) >= new Date()).length
    const vitorias = dados.jogos.filter((j) => j.resultado === 'VITORIA').length
    const disputados = dados.jogos.filter((j) => j.resultado !== 'PENDENTE').length
    return (
      <div className="grade grade--metricas">
        <Metrica rotulo="Jogos marcados" icone="jogos" para={`${base}/jogos`} valor={proximos} />
        <Metrica rotulo="Aproveitamento" icone="resultados" para={`${base}/resultados`}
                 valor={disputados === 0 ? '—' : percentual(vitorias / disputados)}
                 detalhe={`${vitorias} de ${disputados} jogos`} />
        <Metrica rotulo="Equipes ativas" icone="equipes" para={`${base}/equipes`}
                 valor={dados.painel.eventosPublicados > 0 ? 6 : 0} />
        <Metrica rotulo="Tarefas atrasadas" icone="tarefas" para={`${base}/tarefas`}
                 valor={atrasadas} cor={atrasadas > 0 ? 'var(--perigo)' : undefined} />
      </div>
    )
  }

  if (funcao === 'MARKETING') {
    const conteudos = dados.campanhas.flatMap((c) => c.conteudos)
    const pendentes = conteudos.filter((c) => c.status !== 'PUBLICADO').length
    return (
      <div className="grade grade--metricas">
        <Metrica rotulo="Campanhas ativas" icone="campanhas"
                 para={`${base}/comunicacao/campanhas`} valor={dados.campanhas.length} />
        <Metrica rotulo="Conteúdos a produzir" icone="midia"
                 para={`${base}/comunicacao/campanhas`} valor={pendentes}
                 cor={pendentes > 6 ? 'var(--alerta)' : undefined} />
        <Metrica rotulo="Patrocinadores" icone="patrocinios"
                 para={`${base}/mercado/patrocinios`}
                 valor={dados.patrocinios.filter((p) => p.etapa === 'ATIVO').length}
                 detalhe="com contrapartida a entregar" />
        <Metrica rotulo="Inscritos no período" icone="inscricoes"
                 para={`${base}/inscricoes`} valor={dados.painel.inscritosNoMes} />
      </div>
    )
  }

  if (funcao === 'MEMBRO') {
    return (
      <div className="grade grade--metricas">
        <Metrica rotulo="Eventos abertos" icone="eventos" para={`${base}/eventos`}
                 valor={dados.painel.proximosEventos.length} />
        <Metrica rotulo="Meus jogos" icone="jogos" para={`${base}/jogos`}
                 valor={dados.jogos.filter((j) => new Date(j.inicioEm) >= new Date()).length} />
        <Metrica rotulo="Avisos" icone="comunicacao" para={`${base}/avisos`}
                 valor={dados.painel.avisosFixados.length} detalhe="fixados no mural" />
        <Metrica rotulo="Membros ativos" icone="membros" para={`${base}/membros`}
                 valor={dados.painel.membrosAtivos} />
      </div>
    )
  }

  // Presidência e demais diretorias: a visão geral da organização.
  return (
    <div className="grade grade--metricas">
      <Metrica rotulo="Tarefas abertas" icone="tarefas" para={`${base}/tarefas`}
               valor={dados.tarefas.filter((t) => t.status !== 'CONCLUIDA').length}
               detalhe={atrasadas > 0 ? `${atrasadas} atrasadas` : 'nenhuma atrasada'}
               cor={atrasadas > 0 ? 'var(--alerta)' : undefined} />
      <Metrica rotulo="Eventos próximos" icone="eventos" para={`${base}/eventos`}
               valor={dados.painel.proximosEventos.length} />
      <Metrica rotulo="Em caixa" icone="financeiro" para={`${base}/financeiro`}
               valor={dinheiro(dados.financeiro.saldoAtual)}
               cor={dados.financeiro.saldoAtual < 0 ? 'var(--perigo)' : undefined} />
      <Metrica rotulo="Decisões pendentes" icone="decisoes" para={`${base}/decisoes`}
               valor={emVotacao} cor={emVotacao > 0 ? 'var(--acento)' : undefined} />
    </div>
  )
}

// ---------------------------------------------------------------------
// Blocos
// ---------------------------------------------------------------------

function ProximasAtividades({ slug, dados }: { slug: string; dados: Composicao }) {
  const agora = Date.now()

  interface Atividade {
    id: string
    titulo: string
    quandoEm: string
    detalhe: string
    para: string
    icone: NomeDoIcone
    etiqueta?: JSX.Element
  }

  const atividades: Atividade[] = [
    ...dados.painel.proximosEventos.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      quandoEm: e.inicioEm,
      detalhe: e.localNome ?? 'local a definir',
      para: `/hub/${slug}/eventos/${e.id}`,
      icone: 'eventos' as NomeDoIcone,
      etiqueta: <EtiquetaDeStatus status={e.status} />,
    })),
    ...dados.reunioes
      .filter((r) => r.status === 'AGENDADA')
      .map((r) => ({
        id: r.id,
        titulo: r.titulo,
        quandoEm: r.inicioEm,
        detalhe: `${plural(r.convocados.length, 'convocado')}`
          + ` · ${plural(r.pautas.length, 'pauta')}`,
        para: `/hub/${slug}/reunioes/${r.id}`,
        icone: 'reunioes' as NomeDoIcone,
      })),
    ...dados.jogos
      .filter((j) => new Date(j.inicioEm).getTime() >= agora)
      .map((j) => ({
        id: j.id,
        titulo: `${j.equipeNome} × ${j.adversario}`,
        quandoEm: j.inicioEm,
        detalhe: `${j.modalidade}${j.local ? ` · ${j.local}` : ''}`,
        para: `/hub/${slug}/jogos`,
        icone: 'jogos' as NomeDoIcone,
      })),
  ]
    .filter((a) => new Date(a.quandoEm).getTime() >= agora)
    .sort((a, b) => a.quandoEm.localeCompare(b.quandoEm))
    .slice(0, 5)

  return (
    <Secao
      titulo="Próximas atividades"
      acao={
        <Link to={`/hub/${slug}/calendario`} className="botao botao--fantasma botao--pequeno">
          Ver o calendário
        </Link>
      }
    >
      {atividades.length === 0 ? (
        <EstadoVazio icone="calendario" titulo="Nada marcado por enquanto">
          <p className="fraco">
            Evento, reunião e jogo aparecem aqui assim que ganharem data.
          </p>
        </EstadoVazio>
      ) : (
        <div className="pilha pilha--densa">
          {atividades.map((a) => (
            <Link key={a.id} to={a.para} className="cartao cartao--clicavel linha entre">
              <div className="linha" style={{ minWidth: 0, flex: 1 }}>
                <span className="notificacao__icone">
                  <Icone nome={a.icone} tamanho={16} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <strong>{a.titulo}</strong>
                  <div className="fraco">
                    {dataEHora(a.quandoEm)} · {quando(a.quandoEm)} · {a.detalhe}
                  </div>
                </div>
              </div>
              {a.etiqueta}
            </Link>
          ))}
        </div>
      )}
    </Secao>
  )
}

function MinhasPendencias({ slug, dados, funcao }: {
  slug: string
  dados: Composicao
  funcao: Funcao
}) {
  const { perfil } = useSessao()
  const minhas = dados.tarefas.filter(
    (t) => t.status !== 'CONCLUIDA' && t.responsavelNome === perfil?.nome)
  const semDono = dados.tarefas.filter(
    (t) => t.status !== 'CONCLUIDA' && t.responsavelNome === null)
  const votar = dados.decisoes.filter((d) => d.status === 'EM_VOTACAO' && d.meuVoto === null)

  const nada = minhas.length === 0 && votar.length === 0
    && (funcao === 'MEMBRO' || semDono.length === 0)

  return (
    <Secao titulo="Minhas pendências">
      {nada ? (
        <EstadoVazio icone="certo" titulo="Nada com o seu nome">
          <p className="fraco">Quando alguém atribuir uma tarefa a você, ela aparece aqui.</p>
        </EstadoVazio>
      ) : (
        <div className="pilha pilha--densa">
          {votar.map((d) => (
            <Link key={d.id} to={`/hub/${slug}/decisoes/${d.id}`}
                  className="cartao cartao--clicavel cartao--compacto">
              <div className="linha" style={{ gap: '0.4rem', marginBottom: '0.25rem' }}>
                <span className="etiqueta etiqueta--acento">votação aberta</span>
                {d.fechaEm ? (
                  <span className="fraco">fecha {quando(d.fechaEm)}</span>
                ) : null}
              </div>
              <strong>{d.titulo}</strong>
            </Link>
          ))}

          {minhas.slice(0, 5).map((t) => (
            <Link key={t.id} to={`/hub/${slug}/tarefas`}
                  className="cartao cartao--clicavel cartao--compacto linha entre">
              <div style={{ minWidth: 0 }}>
                <span>{t.titulo}</span>
                {t.eventoTitulo ? (
                  <div className="fraco">{t.eventoTitulo}</div>
                ) : null}
              </div>
              {t.prazo ? (
                <span className={`etiqueta ${
                  new Date(t.prazo) < new Date() ? 'etiqueta--perigo' : ''}`}>
                  {quando(t.prazo)}
                </span>
              ) : null}
            </Link>
          ))}

          {funcao !== 'MEMBRO' && semDono.length > 0 ? (
            <Link to={`/hub/${slug}/tarefas`} className="aviso aviso--alerta"
                  style={{ display: 'block', color: 'inherit' }}>
              <strong>{plural(semDono.length, 'tarefa')} sem responsável</strong>
              <div className="fraco">
                Tarefa sem nome é tarefa de ninguém. Atribua antes que vire atraso.
              </div>
            </Link>
          ) : null}
        </div>
      )}
    </Secao>
  )
}

function ProjetosEmAndamento({ slug, dados }: { slug: string; dados: Composicao }) {
  const ativos = dados.projetos.filter((p) => p.status === 'EM_ANDAMENTO')
  if (ativos.length === 0) return null

  return (
    <Secao
      titulo="Projetos em andamento"
      acao={
        <Link to={`/hub/${slug}/projetos`} className="botao botao--fantasma botao--pequeno">
          Ver todos
        </Link>
      }
    >
      <div className="pilha pilha--densa">
        {ativos.slice(0, 3).map((p) => (
          <Link key={p.id} to={`/hub/${slug}/projetos/${p.id}`}
                className="cartao cartao--clicavel">
            <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
              <strong>{p.nome}</strong>
              <span className="fraco">{percentual(p.progresso)}</span>
            </div>
            <Progresso proporcao={p.progresso} />
            <div className="linha entre" style={{ marginTop: '0.45rem' }}>
              <span className="fraco">
                {p.tarefasConcluidas} de {plural(p.tarefasTotal, 'etapa')} · {p.area}
              </span>
              {p.prazo ? <span className="fraco">prazo {quando(p.prazo)}</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </Secao>
  )
}

function CaixaDoMes({ slug, dados }: { slug: string; dados: Composicao }) {
  const { financeiro } = dados
  return (
    <Secao
      titulo="O caixa"
      acao={
        <Link to={`/hub/${slug}/financeiro`} className="botao botao--fantasma botao--pequeno">
          Abrir o financeiro
        </Link>
      }
    >
      <div className="cartao">
        <div className="linha entre" style={{ marginBottom: '0.8rem' }}>
          <div>
            <div className="fraco">Saldo atual</div>
            <div className="numero-grande dinheiro">
              {dinheiro(financeiro.saldoAtual)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="fraco">Entradas · saídas</div>
            <div className="numero-medio">
              <span className="dinheiro dinheiro--positivo">
                {dinheiro(financeiro.receitasNoPeriodo)}
              </span>
              <span className="fraco"> · </span>
              <span className="dinheiro dinheiro--negativo">
                {dinheiro(financeiro.despesasNoPeriodo)}
              </span>
            </div>
          </div>
        </div>
        <div className="fraco" style={{ marginBottom: '0.35rem' }}>Evolução do caixa</div>
        <MiniSerie pontos={financeiro.evolucao} />
      </div>
    </Secao>
  )
}

function ProximosJogos({ slug, dados }: { slug: string; dados: Composicao }) {
  const ultimos = dados.jogos
    .filter((j) => j.resultado !== 'PENDENTE')
    .slice(0, 4)
  if (ultimos.length === 0) return null

  return (
    <Secao
      titulo="Últimos resultados"
      acao={
        <Link to={`/hub/${slug}/jogos`} className="botao botao--fantasma botao--pequeno">
          Ver todos
        </Link>
      }
    >
      <div className="pilha pilha--densa">
        {ultimos.map((j) => (
          <div key={j.id} className="cartao cartao--compacto linha entre">
            <div style={{ minWidth: 0 }}>
              <strong>{j.equipeNome} × {j.adversario}</strong>
              <div className="fraco">{j.modalidade} · {quando(j.inicioEm)}</div>
            </div>
            <span className={`etiqueta ${
              j.resultado === 'VITORIA' ? 'etiqueta--sucesso'
                : j.resultado === 'DERROTA' ? 'etiqueta--perigo' : ''}`}>
              {j.placarNos} × {j.placarDeles}
            </span>
          </div>
        ))}
      </div>
    </Secao>
  )
}

function CampanhasEmCurso({ slug, dados }: { slug: string; dados: Composicao }) {
  if (dados.campanhas.length === 0) return null
  return (
    <Secao
      titulo="Campanhas"
      acao={
        <Link to={`/hub/${slug}/comunicacao/campanhas`}
              className="botao botao--fantasma botao--pequeno">
          Gerenciar
        </Link>
      }
    >
      <div className="pilha pilha--densa">
        {dados.campanhas.slice(0, 3).map((c) => (
          <Link key={c.id} to={`/hub/${slug}/comunicacao/campanhas/${c.id}`}
                className="cartao cartao--clicavel">
            <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
              <strong>{c.nome}</strong>
              <span className="fraco">{c.atual} / {c.metaValor} {c.metaUnidade}</span>
            </div>
            <Progresso proporcao={c.atual / c.metaValor} />
          </Link>
        ))}
      </div>
    </Secao>
  )
}

function DaRede({ slug, dados }: { slug: string; dados: Composicao }) {
  return (
    <Secao
      titulo="Da rede"
      descricao="O que outras atléticas publicaram."
      acao={
        <Link to={`/hub/${slug}/rede/feed`} className="botao botao--fantasma botao--pequeno">
          Ver o feed
        </Link>
      }
    >
      <div className="pilha pilha--densa">
        {dados.feed.slice(0, 4).map((post) => (
          <Link
            key={post.id}
            to={post.destino ? `/hub/${slug}/${post.destino}` : `/hub/${slug}/rede/feed`}
            className="cartao cartao--clicavel cartao--compacto"
          >
            <div className="linha" style={{ gap: '0.45rem', marginBottom: '0.3rem' }}>
              <Avatar nome={post.atletica.nome} />
              <span className="fraco" style={{ flex: 1, minWidth: 0 }}>
                {post.atletica.nome}
              </span>
              <span className="fraco">{quando(post.quando)}</span>
            </div>
            <strong style={{ fontSize: '0.93rem' }}>{post.titulo}</strong>
          </Link>
        ))}
      </div>
    </Secao>
  )
}

/**
 * Série pequena em SVG.
 *
 * <p>Uma linha com seis pontos não justifica biblioteca de gráfico: seriam
 * dezenas de kB para desenhar o que cabe em quinze linhas de path — e o
 * peso cairia na primeira visita, que é a que decide se a pessoa espera.</p>
 */
function MiniSerie({ pontos }: { pontos: { rotulo: string; valor: number }[] }) {
  if (pontos.length < 2) return null

  const valores = pontos.map((p) => p.valor)
  const minimo = Math.min(0, ...valores)
  const maximo = Math.max(...valores, 1)
  const amplitude = maximo - minimo || 1

  const largura = 100
  const altura = 34
  const passo = largura / (pontos.length - 1)
  const y = (valor: number) => altura - ((valor - minimo) / amplitude) * (altura - 4) - 2

  const linha = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${i * passo} ${y(p.valor)}`).join(' ')
  const area = `${linha} L${largura} ${altura} L0 ${altura} Z`

  return (
    <div>
      <svg viewBox={`0 0 ${largura} ${altura}`} preserveAspectRatio="none"
           style={{ width: '100%', height: '3.4rem', display: 'block' }}
           role="img"
           aria-label={pontos.map((p) => `${p.rotulo}: ${dinheiro(p.valor)}`).join(', ')}>
        <path d={area} fill="var(--acento-tenue)" />
        <path d={linha} fill="none" stroke="var(--acento)" strokeWidth={1.6}
              vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <div className="linha entre">
        <span className="fraco">{pontos[0].rotulo}</span>
        <span className="fraco">{pontos[pontos.length - 1].rotulo}</span>
      </div>
    </div>
  )
}

function EsqueletoDoPainel() {
  return (
    <div className="pilha" style={{ gap: '1.6rem' }}>
      <div className="grade grade--metricas">
        {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="6.4rem" />)}
      </div>
      <div className="detalhe">
        <Esqueleto altura="18rem" />
        <Esqueleto altura="13rem" />
      </div>
    </div>
  )
}
