import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Torneio } from '../../../api/tipos-rede'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { useSessao } from '../../../sessao/SessaoContexto'
import { plural } from '../../../formatos'

const STATUS: Record<Torneio['status'], { rotulo: string; classe: string }> = {
  INSCRICOES: { rotulo: 'Inscrições abertas', classe: 'etiqueta--acento' },
  CHAVEADO: { rotulo: 'Chaveado', classe: '' },
  EM_ANDAMENTO: { rotulo: 'Em andamento', classe: 'etiqueta--sucesso' },
  ENCERRADO: { rotulo: 'Encerrado', classe: '' },
  CANCELADO: { rotulo: 'Cancelado', classe: 'etiqueta--perigo' },
}

export const FORMATO: Record<Torneio['formato'], string> = {
  ELIMINACAO_SIMPLES: 'Eliminação simples',
  ELIMINACAO_DUPLA: 'Eliminação dupla',
  GRUPOS: 'Fase de grupos',
  PONTOS_CORRIDOS: 'Pontos corridos',
  SUICO: 'Sistema suíço',
}

/**
 * Os campeonatos da atlética (§25).
 *
 * <p>Um campeonato <strong>é</strong> um evento — o schema sempre disse isso,
 * com {@code torneio.evento_id} obrigatório. Esta seção não duplica o
 * conceito: ela dá um caminho direto para quem pensa "quero ver a tabela do
 * futsal" em vez de "quero abrir o evento que contém o futsal".</p>
 */
export function Campeonatos() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const torneios = useBusca<Torneio[]>(() => Dados.torneios(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Campeonatos"
        descricao="Chaveamento, tabela e classificação. Todo campeonato acontece dentro de um evento."
        acoes={diretor ? (
          <Link to={`/hub/${slug}/eventos/novo`} className="botao">
            <Icone nome="mais" tamanho={16} /> Novo campeonato
          </Link>
        ) : undefined}
      />

      <Conteudo
        busca={torneios}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1].map((i) => <Esqueleto key={i} altura="12rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="campeonatos" titulo="Nenhum campeonato ainda">
                <p className="fraco">
                  Crie o evento e monte o torneio dentro dele. O guia
                  “Como organizar um campeonato interatlético” tem o roteiro
                  completo, incluindo as etapas que costumam ser esquecidas.
                </p>
                <Link to={`/hub/${slug}/conhecimento`} className="botao botao--discreto">
                  Ler o guia
                </Link>
              </EstadoVazio>
            )
          }

          const emAndamento = lista.filter((t) => t.status === 'EM_ANDAMENTO')
          const partidas = lista.flatMap((t) => t.partidas)
          const encerradas = partidas.filter((p) => p.status === 'ENCERRADA')

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Campeonatos" icone="campeonatos" valor={lista.length} />
                <Metrica rotulo="Em andamento" icone="jogos" valor={emAndamento.length} />
                <Metrica rotulo="Equipes inscritas" icone="equipes"
                         valor={lista.reduce((s, t) => s + t.participantes.length, 0)} />
                <Metrica rotulo="Partidas disputadas" icone="resultados"
                         valor={`${encerradas.length}/${partidas.length}`} />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {lista.map((t) => {
                    const total = t.partidas.length
                    const feitas = t.partidas.filter((p) => p.status === 'ENCERRADA').length
                    return (
                      <Link
                        key={t.id}
                        to={`/hub/${slug}/campeonatos/${t.id}`}
                        className="cartao cartao--clicavel"
                      >
                        <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                          <span className="etiqueta">{t.modalidade}</span>
                          <span className={`etiqueta ${STATUS[t.status].classe}`}>
                            {STATUS[t.status].rotulo}
                          </span>
                        </div>

                        <h3 style={{ marginBottom: '0.2rem' }}>{t.nome}</h3>
                        <div className="fraco" style={{ marginBottom: '0.9rem' }}>
                          {FORMATO[t.formato]} · {plural(t.vagas, 'vaga')}
                        </div>

                        <div className="linha" style={{ gap: '1.4rem',
                                                        marginBottom: '0.9rem' }}>
                          <div>
                            <div className="numero-medio">{t.participantes.length}</div>
                            <div className="fraco">equipes</div>
                          </div>
                          <div>
                            <div className="numero-medio">{total}</div>
                            <div className="fraco">partidas</div>
                          </div>
                          <div>
                            <div className="numero-medio">
                              {t.participantes.filter((p) => p.situacao === 'ATIVO').length}
                            </div>
                            <div className="fraco">na disputa</div>
                          </div>
                        </div>

                        <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
                          <span className="fraco">Andamento</span>
                          <span className="fraco">{feitas} de {total}</span>
                        </div>
                        <Progresso proporcao={total === 0 ? 0 : feitas / total} />
                      </Link>
                    )
                  })}
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
