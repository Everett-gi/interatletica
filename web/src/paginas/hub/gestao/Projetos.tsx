import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Projeto, StatusDoProjeto, TipoDeProjeto } from '../../../api/tipos-gestao'
import { Avatar, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Progresso,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, percentual, plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

export const STATUS_DO_PROJETO: Record<StatusDoProjeto, { rotulo: string; classe: string }> = {
  IDEIA: { rotulo: 'Ideia', classe: '' },
  PLANEJAMENTO: { rotulo: 'Planejamento', classe: 'etiqueta--acento' },
  EM_ANDAMENTO: { rotulo: 'Em andamento', classe: 'etiqueta--sucesso' },
  CONCLUIDO: { rotulo: 'Concluído', classe: '' },
  PAUSADO: { rotulo: 'Pausado', classe: 'etiqueta--alerta' },
  CANCELADO: { rotulo: 'Cancelado', classe: 'etiqueta--perigo' },
}

export const TIPO_DE_PROJETO: Record<TipoDeProjeto, string> = {
  EVENTO: 'Evento',
  CAMPEONATO: 'Campeonato',
  SOCIAL: 'Projeto social',
  ESTRUTURA: 'Estrutura',
  CAPTACAO: 'Captação',
  COMUNICACAO: 'Comunicação',
}

type Filtro = 'TODOS' | StatusDoProjeto

/**
 * Os projetos da atlética (§19).
 *
 * <p>Projeto social não ganhou módulo próprio, e é de propósito: ele tem
 * tarefa, orçamento, cronograma e responsável como qualquer outro. Separar
 * duplicaria tudo isso para ganhar um cabeçalho diferente. O que muda é o
 * que a página de detalhe destaca — parceiros e impacto —, e isso o tipo
 * já resolve.</p>
 */
export function Projetos() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')

  const projetos = useBusca<Projeto[]>(() => Dados.projetos(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Projetos"
        descricao="O que a atlética está construindo, com prazo, responsável e orçamento."
        acoes={diretor ? (
          <Link to={`/hub/${slug}/projetos/novo`} className="botao">
            <Icone nome="mais" tamanho={16} /> Novo projeto
          </Link>
        ) : undefined}
      />

      <Conteudo
        busca={projetos}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="12rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="projetos" titulo="Nenhum projeto ainda">
                <p className="fraco">
                  Comece de um modelo da rede em vez de partir do zero: o roteiro
                  de calourada dos Leões já tem as tarefas que eles descobriram
                  na prática.
                </p>
                {diretor ? (
                  <Link to={`/hub/${slug}/projetos/novo`} className="botao">
                    <Icone nome="mais" tamanho={16} /> Criar o primeiro projeto
                  </Link>
                ) : null}
              </EstadoVazio>
            )
          }

          const emAndamento = lista.filter((p) => p.status === 'EM_ANDAMENTO')
          const concluidos = lista.filter((p) => p.status === 'CONCLUIDO')
          const orcado = lista.reduce((s, p) => s + (p.orcamentoPrevisto ?? 0), 0)
          const gasto = lista.reduce((s, p) => s + (p.orcamentoGasto ?? 0), 0)

          const contar = (status: StatusDoProjeto) =>
            lista.filter((p) => p.status === status).length

          const visiveis = filtro === 'TODOS'
            ? lista
            : lista.filter((p) => p.status === filtro)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Em andamento" icone="projetos"
                         valor={emAndamento.length} />
                <Metrica rotulo="Concluídos no ano" icone="certo"
                         valor={concluidos.length} />
                <Metrica rotulo="Orçamento comprometido" icone="orcamento"
                         valor={dinheiro(orcado)} />
                <Metrica rotulo="Já gasto" icone="despesas" valor={dinheiro(gasto)}
                         detalhe={orcado > 0 ? `${percentual(gasto / orcado)} do previsto` : undefined}
                         cor={orcado > 0 && gasto / orcado > 0.9 ? 'var(--alerta)' : undefined} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Situação"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todos', contagem: lista.length },
                    ...(Object.keys(STATUS_DO_PROJETO) as StatusDoProjeto[])
                      .filter((s) => contar(s) > 0)
                      .map((s) => ({
                        valor: s as Filtro,
                        rotulo: STATUS_DO_PROJETO[s].rotulo,
                        contagem: contar(s),
                      })),
                  ]}
                />
              </div>

              <Secao>
                {visiveis.length === 0 ? (
                  <EstadoVazio titulo="Nenhum projeto nesta situação" />
                ) : (
                  <div className="grade grade--larga">
                    {visiveis.map((p) => (
                      <CartaoDeProjeto key={p.id} projeto={p} slug={slug} />
                    ))}
                  </div>
                )}
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

export function CartaoDeProjeto({ projeto, slug }: { projeto: Projeto; slug: string }) {
  const atrasado = projeto.prazo !== null
    && projeto.status === 'EM_ANDAMENTO'
    && new Date(projeto.prazo) < new Date()

  return (
    <Link to={`/hub/${slug}/projetos/${projeto.id}`} className="cartao cartao--clicavel">
      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
        <span className="etiqueta">{TIPO_DE_PROJETO[projeto.tipo]}</span>
        <span className={`etiqueta ${STATUS_DO_PROJETO[projeto.status].classe}`}>
          {STATUS_DO_PROJETO[projeto.status].rotulo}
        </span>
      </div>

      <h3 style={{ marginBottom: '0.25rem' }}>{projeto.nome}</h3>
      <p className="fraco" style={{ marginBottom: '0.8rem' }}>{projeto.resumo}</p>

      <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
        <span className="fraco">
          {projeto.tarefasConcluidas} de {plural(projeto.tarefasTotal, 'etapa')}
        </span>
        <span className="fraco">{percentual(projeto.progresso)}</span>
      </div>
      <Progresso
        proporcao={projeto.progresso}
        tom={projeto.progresso >= 1 ? 'sucesso' : atrasado ? 'perigo' : undefined}
      />

      <div className="linha entre" style={{ marginTop: '0.8rem' }}>
        <div className="linha" style={{ gap: '0.4rem', minWidth: 0 }}>
          {projeto.responsavelNome ? (
            <>
              <Avatar nome={projeto.responsavelNome} url={projeto.responsavelAvatarUrl} />
              <span className="fraco">{projeto.area}</span>
            </>
          ) : (
            <span className="fraco">sem responsável</span>
          )}
        </div>
        {projeto.prazo ? (
          <span className={`etiqueta ${atrasado ? 'etiqueta--perigo' : ''}`}>
            {atrasado ? 'atrasado · ' : 'prazo '}{quando(projeto.prazo)}
          </span>
        ) : null}
      </div>
    </Link>
  )
}
