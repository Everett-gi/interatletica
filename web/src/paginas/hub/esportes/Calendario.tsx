import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { EventoResumo } from '../../../api/tipos'
import type { Reuniao } from '../../../api/tipos-gestao'
import type { Tarefa } from '../../../api/tipos-rede'
import type { Lancamento } from '../../../api/tipos-financeiro'
import type { Jogo, Viagem } from '../../../api/tipos-esportes'
import { Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Secao,
  Segmentado,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, hora, mesEAno, quando } from '../../../formatos'

type Categoria = 'EVENTO' | 'REUNIAO' | 'JOGO' | 'VIAGEM' | 'PRAZO' | 'PAGAMENTO'

const CATEGORIA: Record<Categoria, { rotulo: string; cor: string }> = {
  EVENTO: { rotulo: 'Eventos', cor: 'var(--acento)' },
  REUNIAO: { rotulo: 'Reuniões', cor: 'var(--texto-suave)' },
  JOGO: { rotulo: 'Jogos', cor: 'var(--sucesso)' },
  VIAGEM: { rotulo: 'Viagens', cor: 'var(--ouro)' },
  PRAZO: { rotulo: 'Prazos', cor: 'var(--alerta)' },
  PAGAMENTO: { rotulo: 'Pagamentos', cor: 'var(--perigo)' },
}

interface Marcacao {
  id: string
  titulo: string
  quandoEm: string
  categoria: Categoria
  destino: string
  detalhe: string
}

type Visao = 'MES' | 'AGENDA'
type Filtro = 'TUDO' | Categoria

interface Fontes {
  eventos: EventoResumo[]
  reunioes: Reuniao[]
  jogos: Jogo[]
  viagens: Viagem[]
  tarefas: Tarefa[]
  lancamentos: Lancamento[]
}

/**
 * O calendário (§23).
 *
 * <p>Reúne o que tem data em toda a plataforma: evento, reunião, jogo,
 * viagem, prazo de tarefa e pagamento previsto. É a tela que responde
 * "o que a atlética tem pela frente?" sem obrigar a abrir seis módulos —
 * e é o §106 na prática: um campeonato criado aparece aqui sem que ninguém
 * o cadastre de novo.</p>
 *
 * <p>Cores por categoria, mas poucas e sem gritar. O §23 pede exatamente
 * isso: filtrar por cor sem que a tela vire vitral.</p>
 */
export function Calendario() {
  const { slug = '' } = useParams()
  const [visao, setVisao] = useState<Visao>('MES')
  const [filtro, setFiltro] = useState<Filtro>('TUDO')
  const [desloc, setDesloc] = useState(0)

  const busca = useBusca<Fontes>(async () => {
    const [eventos, reunioes, jogos, viagens, tarefas, lancamentos] = await Promise.all([
      Dados.eventosDaAtletica(slug),
      Dados.reunioes(slug),
      Dados.jogos(slug),
      Dados.viagens(slug),
      Dados.tarefas(slug),
      Dados.lancamentos(slug),
    ])
    return { eventos, reunioes, jogos, viagens, tarefas, lancamentos }
  }, [slug])

  const marcacoes = useMemo<Marcacao[]>(() => {
    const f = busca.dados
    if (!f) return []
    const base = `/hub/${slug}`

    return [
      ...f.eventos
        .filter((e) => e.status !== 'CANCELADO')
        .map((e) => ({
          id: `ev-${e.id}`, titulo: e.titulo, quandoEm: e.inicioEm,
          categoria: 'EVENTO' as Categoria, destino: `${base}/eventos/${e.id}`,
          detalhe: e.localNome ?? 'sem local definido',
        })),
      ...f.reunioes.map((r) => ({
        id: `rn-${r.id}`, titulo: r.titulo, quandoEm: r.inicioEm,
        categoria: 'REUNIAO' as Categoria, destino: `${base}/reunioes/${r.id}`,
        detalhe: r.local ?? 'online',
      })),
      ...f.jogos.map((j) => ({
        id: `jg-${j.id}`, titulo: `${j.equipeNome} × ${j.adversario}`,
        quandoEm: j.inicioEm, categoria: 'JOGO' as Categoria,
        destino: `${base}/jogos`, detalhe: j.modalidade,
      })),
      ...f.viagens.map((v) => ({
        id: `vg-${v.id}`, titulo: `Viagem — ${v.destino}`, quandoEm: v.saidaEm,
        categoria: 'VIAGEM' as Categoria, destino: `${base}/viagens`,
        detalhe: v.motivo,
      })),
      ...f.tarefas
        .filter((t) => t.prazo !== null && t.status !== 'CONCLUIDA')
        .map((t) => ({
          id: `tf-${t.id}`, titulo: t.titulo, quandoEm: t.prazo as string,
          categoria: 'PRAZO' as Categoria, destino: `${base}/tarefas`,
          detalhe: t.responsavelNome ?? 'sem responsável',
        })),
      ...f.lancamentos
        .filter((l) => l.situacao === 'PREVISTO' || l.situacao === 'ATRASADO')
        .map((l) => ({
          id: `ln-${l.id}`, titulo: l.descricao,
          // A competência é o mês; o dia 10 é a convenção de vencimento
          // usada aqui para o previsto ganhar posição no calendário.
          quandoEm: `${l.competencia}-10T12:00:00-03:00`,
          categoria: 'PAGAMENTO' as Categoria,
          destino: `${base}/financeiro/${l.natureza === 'RECEITA' ? 'receitas' : 'despesas'}`,
          detalhe: l.natureza === 'RECEITA' ? 'a receber' : 'a pagar',
        })),
    ].sort((a, b) => a.quandoEm.localeCompare(b.quandoEm))
  }, [busca.dados, slug])

  const visiveis = filtro === 'TUDO'
    ? marcacoes
    : marcacoes.filter((m) => m.categoria === filtro)

  const hoje = new Date()
  const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + desloc, 1)

  return (
    <div>
      <CabecalhoDePagina
        titulo="Calendário"
        descricao="Tudo o que tem data: evento, reunião, jogo, viagem, prazo e pagamento."
        acoes={
          <Segmentado
            rotulo="Forma de ver o calendário"
            atual={visao}
            aoTrocar={setVisao}
            opcoes={[
              { valor: 'MES', rotulo: 'Mês', icone: 'calendario' },
              { valor: 'AGENDA', rotulo: 'Agenda', icone: 'lista' },
            ]}
          />
        }
      />

      <div className="barra-de-filtros">
        <Chips
          rotulo="Categorias do calendário"
          selecionado={filtro}
          aoSelecionar={setFiltro}
          opcoes={[
            { valor: 'TUDO', rotulo: 'Tudo', contagem: marcacoes.length },
            ...(Object.keys(CATEGORIA) as Categoria[]).map((c) => ({
              valor: c as Filtro,
              rotulo: CATEGORIA[c].rotulo,
              contagem: marcacoes.filter((m) => m.categoria === c).length,
            })),
          ]}
        />
      </div>

      <Conteudo busca={busca} esqueleto={<Esqueleto altura="26rem" />}>
        {() =>
          visao === 'MES' ? (
            <>
              <div className="linha entre" style={{ marginBottom: '0.8rem' }}>
                <div className="linha" style={{ gap: '0.3rem' }}>
                  <button className="icone-botao" onClick={() => setDesloc((d) => d - 1)}
                          aria-label="Mês anterior">
                    <Icone nome="esquerda" tamanho={18} />
                  </button>
                  <strong style={{ minWidth: '11rem', textAlign: 'center',
                                   textTransform: 'capitalize' }}>
                    {mesEAno(mesAtual)}
                  </strong>
                  <button className="icone-botao" onClick={() => setDesloc((d) => d + 1)}
                          aria-label="Próximo mês">
                    <Icone nome="direita" tamanho={18} />
                  </button>
                </div>
                {desloc !== 0 ? (
                  <button className="botao botao--discreto botao--pequeno"
                          onClick={() => setDesloc(0)}>
                    Voltar para hoje
                  </button>
                ) : null}
              </div>

              <GradeDoMes mes={mesAtual} marcacoes={visiveis} />

              <div className="chips" style={{ marginTop: '0.9rem' }}>
                {(Object.keys(CATEGORIA) as Categoria[]).map((c) => (
                  <span key={c} className="linha" style={{ gap: '0.35rem' }}>
                    <span style={{ width: '0.7rem', height: '0.7rem', borderRadius: '3px',
                                   background: CATEGORIA[c].cor, display: 'inline-block' }}
                          aria-hidden="true" />
                    <span className="fraco">{CATEGORIA[c].rotulo}</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <Agenda slug={slug} marcacoes={visiveis} />
          )
        }
      </Conteudo>
    </div>
  )
}

const DIAS_DA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

function GradeDoMes({ mes, marcacoes }: { mes: Date; marcacoes: Marcacao[] }) {
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1)
  // A grade sempre começa no domingo da semana do dia 1 e tem seis linhas:
  // altura fixa evita a página "pular" ao trocar de mês.
  const inicio = new Date(primeiro)
  inicio.setDate(1 - primeiro.getDay())

  const hoje = new Date()
  const mesmoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()

  const dias = Array.from({ length: 42 }, (_, i) => {
    const data = new Date(inicio)
    data.setDate(inicio.getDate() + i)
    return data
  })

  return (
    <div className="calendario">
      {DIAS_DA_SEMANA.map((dia) => (
        <div key={dia} className="calendario__dia-da-semana">{dia}</div>
      ))}

      {dias.map((data) => {
        const doDia = marcacoes.filter((m) => mesmoDia(new Date(m.quandoEm), data))
        const foraDoMes = data.getMonth() !== mes.getMonth()

        return (
          <div
            key={data.toISOString()}
            className={`calendario__dia${foraDoMes ? ' calendario__dia--fora' : ''}${
              mesmoDia(data, hoje) ? ' calendario__dia--hoje' : ''}`}
          >
            <span className="calendario__numero">{data.getDate()}</span>
            {doDia.slice(0, 3).map((m) => (
              <Link
                key={m.id}
                to={m.destino}
                className="calendario__marca"
                style={{ color: CATEGORIA[m.categoria].cor }}
                title={`${m.titulo} · ${hora(m.quandoEm)}`}
              >
                <span style={{ color: 'var(--texto)' }}>{m.titulo}</span>
              </Link>
            ))}
            {doDia.length > 3 ? (
              <span className="calendario__mais">+{doDia.length - 3}</span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function Agenda({ slug, marcacoes }: { slug: string; marcacoes: Marcacao[] }) {
  const futuras = marcacoes.filter((m) => new Date(m.quandoEm) >= new Date())

  if (futuras.length === 0) {
    return (
      <EstadoVazio icone="calendario" titulo="Nada marcado daqui para a frente">
        <p className="fraco">
          Evento, reunião, jogo e prazo aparecem aqui assim que ganharem data.
        </p>
        <Link to={`/hub/${slug}/eventos/novo`} className="botao">
          <Icone nome="mais" tamanho={16} /> Criar evento
        </Link>
      </EstadoVazio>
    )
  }

  // Agrupar por dia é o que torna a agenda legível: sem isso, vinte linhas
  // com data repetida obrigam a comparar textos para saber o que é de hoje.
  const porDia = new Map<string, Marcacao[]>()
  futuras.forEach((m) => {
    const chave = m.quandoEm.slice(0, 10)
    porDia.set(chave, [...(porDia.get(chave) ?? []), m])
  })

  return (
    <Secao>
      <div className="pilha">
        {[...porDia.entries()].map(([dia, itens]) => (
          <div key={dia}>
            <div className="fraco" style={{ marginBottom: '0.4rem', fontWeight: 650 }}>
              {dataEHora(itens[0].quandoEm).split(',')[0]} · {quando(itens[0].quandoEm)}
            </div>
            <div className="pilha pilha--densa">
              {itens.map((m) => (
                <Link key={m.id} to={m.destino} className="cartao cartao--clicavel linha">
                  <span
                    style={{ width: '3px', alignSelf: 'stretch', borderRadius: '999px',
                             background: CATEGORIA[m.categoria].cor }}
                    aria-hidden="true"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{m.titulo}</strong>
                    <div className="fraco">{m.detalhe}</div>
                  </div>
                  <span className="fraco">{hora(m.quandoEm)}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Secao>
  )
}
