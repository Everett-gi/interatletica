import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Decisao, StatusDaDecisao } from '../../../api/tipos-gestao'
import { Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

export const STATUS_DA_DECISAO: Record<StatusDaDecisao, { rotulo: string; classe: string }> = {
  RASCUNHO: { rotulo: 'Rascunho', classe: '' },
  EM_VOTACAO: { rotulo: 'Em votação', classe: 'etiqueta--acento' },
  APROVADA: { rotulo: 'Aprovada', classe: 'etiqueta--sucesso' },
  REJEITADA: { rotulo: 'Rejeitada', classe: 'etiqueta--perigo' },
  ADIADA: { rotulo: 'Adiada', classe: 'etiqueta--alerta' },
}

/**
 * A central de decisões (§22).
 *
 * <p>Existe porque decisão de atlética costuma morrer no grupo de mensagens:
 * discute-se por três dias, alguém decide, e seis meses depois ninguém lembra
 * quem escolheu nem por quê. Aqui a decisão tem opções, votos, quórum, prazo
 * e responsável — e fica.</p>
 */
export function Decisoes() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const decisoes = useBusca<Decisao[]>(() => Dados.decisoes(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Decisões"
        descricao="O que a diretoria precisa escolher, e o registro do que já foi escolhido."
        acoes={diretor ? (
          <button className="botao" disabled
                  title="Abrir decisão chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Nova decisão
          </button>
        ) : undefined}
      />

      <Conteudo
        busca={decisoes}
        esqueleto={
          <div className="pilha pilha--densa">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="10rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="decisoes" titulo="Nenhuma decisão registrada">
                <p className="fraco">
                  A primeira decisão registrada aqui é a primeira que a próxima
                  gestão vai conseguir entender.
                </p>
              </EstadoVazio>
            )
          }

          const abertas = lista.filter((d) => d.status === 'EM_VOTACAO')
          const rascunhos = lista.filter((d) => d.status === 'RASCUNHO')
          const fechadas = lista.filter(
            (d) => d.status !== 'EM_VOTACAO' && d.status !== 'RASCUNHO')

          return (
            <>
              <Secao
                titulo="Em votação"
                descricao="O que depende de você agora."
              >
                {abertas.length === 0 ? (
                  <EstadoVazio titulo="Nenhuma votação aberta" />
                ) : (
                  <div className="grade grade--larga">
                    {abertas.map((d) => (
                      <CartaoDeDecisao key={d.id} decisao={d} slug={slug} />
                    ))}
                  </div>
                )}
              </Secao>

              {rascunhos.length > 0 ? (
                <Secao titulo="Preparadas"
                       descricao="Ainda não abriram para voto.">
                  <div className="pilha pilha--densa">
                    {rascunhos.map((d) => (
                      <Link key={d.id} to={`/hub/${slug}/decisoes/${d.id}`}
                            className="cartao cartao--clicavel linha entre">
                        <div style={{ minWidth: 0 }}>
                          <strong>{d.titulo}</strong>
                          <div className="fraco">
                            {d.opcoes.length} opções
                            {d.reuniaoTitulo ? ` · ${d.reuniaoTitulo}` : ''}
                          </div>
                        </div>
                        <span className="etiqueta">rascunho</span>
                      </Link>
                    ))}
                  </div>
                </Secao>
              ) : null}

              {fechadas.length > 0 ? (
                <Secao
                  titulo="Decididas"
                  descricao="O histórico que responde “por que decidimos assim?”."
                >
                  <div className="pilha pilha--densa">
                    {fechadas.map((d) => {
                      const escolhida = d.opcoes.find((o) => o.id === d.escolhidaId)
                      return (
                        <Link key={d.id} to={`/hub/${slug}/decisoes/${d.id}`}
                              className="cartao cartao--clicavel linha entre">
                          <div style={{ minWidth: 0 }}>
                            <strong>{d.titulo}</strong>
                            <div className="fraco">
                              {escolhida ? `Escolhido: ${escolhida.rotulo}` : 'sem escolha'}
                              {d.fechaEm ? ` · ${quando(d.fechaEm)}` : ''}
                            </div>
                          </div>
                          <span className={`etiqueta ${STATUS_DA_DECISAO[d.status].classe}`}>
                            {STATUS_DA_DECISAO[d.status].rotulo}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </Secao>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function CartaoDeDecisao({ decisao, slug }: { decisao: Decisao; slug: string }) {
  const totalDeVotos = decisao.opcoes.reduce((s, o) => s + o.votos, 0)
  const temQuorum = decisao.votantes >= decisao.quorum

  return (
    <Link to={`/hub/${slug}/decisoes/${decisao.id}`}
          className="cartao cartao--clicavel cartao--destacado">
      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
        <span className="etiqueta etiqueta--acento">em votação</span>
        {decisao.fechaEm ? (
          <span className="fraco">fecha {quando(decisao.fechaEm)}</span>
        ) : null}
      </div>

      <h3 style={{ marginBottom: '0.25rem' }}>{decisao.titulo}</h3>
      <p className="fraco" style={{ marginBottom: '0.9rem' }}>{decisao.contexto}</p>

      <div className="pilha pilha--densa" style={{ marginBottom: '0.9rem' }}>
        {decisao.opcoes.map((opcao) => (
          <div key={opcao.id}>
            <div className="linha entre" style={{ marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.88rem',
                             fontWeight: decisao.meuVoto === opcao.id ? 700 : 400 }}>
                {opcao.rotulo}
                {decisao.meuVoto === opcao.id ? ' · seu voto' : ''}
              </span>
              <span className="fraco">{opcao.votos}</span>
            </div>
            <Progresso proporcao={totalDeVotos === 0 ? 0 : opcao.votos / totalDeVotos} />
          </div>
        ))}
      </div>

      <div className="linha entre">
        <span className="fraco">
          {decisao.votantes} de {decisao.quorum} votos para quórum
        </span>
        <span className={`etiqueta ${temQuorum ? 'etiqueta--sucesso' : 'etiqueta--alerta'}`}>
          {temQuorum ? 'quórum atingido' : 'sem quórum'}
        </span>
      </div>

      {decisao.meuVoto === null ? (
        <div className="botao botao--largo" style={{ marginTop: '0.9rem' }}>
          Votar
        </div>
      ) : null}
    </Link>
  )
}
