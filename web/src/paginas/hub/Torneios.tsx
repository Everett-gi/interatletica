import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { FormatoDeTorneio, StatusDoTorneio, Torneio } from '../../api/tipos-rede'
import { Conteudo, Esqueleto, useBusca, Vazio } from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
import { useSessao } from '../../sessao/SessaoContexto'

const FORMATO: Record<FormatoDeTorneio, string> = {
  ELIMINACAO_SIMPLES: 'Eliminação simples',
  ELIMINACAO_DUPLA: 'Eliminação dupla',
  GRUPOS: 'Fase de grupos',
  PONTOS_CORRIDOS: 'Pontos corridos',
  SUICO: 'Sistema suíço',
}

const STATUS: Record<StatusDoTorneio, { rotulo: string; classe: string }> = {
  INSCRICOES: { rotulo: 'Inscrições abertas', classe: 'etiqueta--acento' },
  CHAVEADO: { rotulo: 'Chaveado', classe: '' },
  EM_ANDAMENTO: { rotulo: 'Em andamento', classe: 'etiqueta--sucesso' },
  ENCERRADO: { rotulo: 'Encerrado', classe: '' },
  CANCELADO: { rotulo: 'Cancelado', classe: 'etiqueta--perigo' },
}

export function Torneios() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  useCorDaAtletica(vinculo(slug)?.atletica.corPrimaria)

  const torneios = useBusca<Torneio[]>(() => Dados.torneios(slug), [slug])

  return (
    <div className="pilha">
      <header>
        <h1>Torneios</h1>
        <p className="fraco" style={{ margin: 0 }}>
          Chaveamento, resultados e tabela ao vivo.
        </p>
      </header>

      <Conteudo busca={torneios} esqueleto={<Esqueleto altura="10rem" />}>
        {(lista) =>
          lista.length === 0 ? (
            <Vazio titulo="Nenhum torneio">
              Torneios nascem de um evento com inscrição por equipe.
            </Vazio>
          ) : (
            <div className="grade grade--larga">
              {lista.map((torneio) => {
                const encerradas = torneio.partidas
                  .filter((p) => p.status === 'ENCERRADA').length
                const progresso = Math.round(
                  (encerradas / Math.max(1, torneio.partidas.length)) * 100)

                return (
                  <Link
                    key={torneio.id}
                    to={`/hub/${slug}/torneios/${torneio.id}`}
                    className="cartao cartao--clicavel"
                  >
                    <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                      <span className="etiqueta">{FORMATO[torneio.formato]}</span>
                      <span className={`etiqueta ${STATUS[torneio.status].classe}`}>
                        {STATUS[torneio.status].rotulo}
                      </span>
                    </div>

                    <h3>{torneio.nome}</h3>
                    <div className="fraco" style={{ marginBottom: '0.8rem' }}>
                      {torneio.modalidade} · {torneio.participantes.length} de{' '}
                      {torneio.vagas} vagas
                    </div>

                    <div className="linha entre" style={{ marginBottom: '0.25rem' }}>
                      <span className="fraco">Partidas</span>
                      <span className="fraco">
                        {encerradas} de {torneio.partidas.length}
                      </span>
                    </div>
                    <div className="barra__trilho">
                      <div className="barra__preenchimento"
                           style={{ width: `${progresso}%` }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        }
      </Conteudo>
    </div>
  )
}
