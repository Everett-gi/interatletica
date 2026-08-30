import { useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Equipe, FuncaoNaEquipe } from '../../api/tipos-rede'
import {
  Avatar,
  Conteudo,
  Esqueleto,
  useBusca,
  Vazio,
} from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
import { useSessao } from '../../sessao/SessaoContexto'

const FUNCAO: Record<FuncaoNaEquipe, { rotulo: string; classe: string }> = {
  CAPITAO: { rotulo: 'Capitão', classe: 'etiqueta--acento' },
  TITULAR: { rotulo: 'Titular', classe: '' },
  RESERVA: { rotulo: 'Reserva', classe: '' },
  TECNICO: { rotulo: 'Técnico', classe: 'etiqueta--alerta' },
}

/**
 * As equipes da atlética.
 *
 * <p>Equipe pertence à ATLÉTICA, não ao evento: o time de vôlei é o mesmo em
 * março e em outubro, e ele se <em>inscreve</em> em eventos. É por isso que
 * esta tela vive no hub e não dentro de um evento.</p>
 */
export function Equipes() {
  const { slug = '' } = useParams()
  const { vinculo, podeAtuarComo } = useSessao()
  useCorDaAtletica(vinculo(slug)?.atletica.corPrimaria)

  const equipes = useBusca<Equipe[]>(() => Dados.equipes(slug), [slug])
  const diretor = podeAtuarComo(slug, 'DIRETOR')

  return (
    <div className="pilha">
      <header className="linha entre">
        <div>
          <h1>Equipes</h1>
          <p className="fraco" style={{ margin: 0 }}>
            O elenco por modalidade. A equipe é da atlética e atravessa os
            eventos — ela se inscreve, não é criada por evento.
          </p>
        </div>
        {diretor ? (
          <button className="botao" disabled title="Disponível com a API conectada">
            Nova equipe
          </button>
        ) : null}
      </header>

      <Conteudo
        busca={equipes}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1].map((i) => <Esqueleto key={i} altura="14rem" />)}
          </div>
        }
      >
        {(times) =>
          times.length === 0 ? (
            <Vazio titulo="Nenhuma equipe cadastrada">
              Cadastre os times para que possam se inscrever em torneios.
            </Vazio>
          ) : (
            <div className="grade grade--larga">
              {times.map((equipe) => <CartaoDeEquipe key={equipe.id} equipe={equipe} />)}
            </div>
          )
        }
      </Conteudo>
    </div>
  )
}

function CartaoDeEquipe({ equipe }: { equipe: Equipe }) {
  // E-sports usa nickname; esporte de quadra usa número. A mesma tabela
  // guarda os dois, e a tela mostra o que faz sentido para a modalidade.
  const usaNick = equipe.elenco.some((a) => a.nick !== null)

  return (
    <section className="cartao">
      <div className="linha entre" style={{ marginBottom: '0.9rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.1rem' }}>{equipe.nome}</h3>
          <div className="fraco">{equipe.modalidade}</div>
        </div>
        <span className="etiqueta">{equipe.elenco.length} atletas</span>
      </div>

      <div className="pilha pilha--densa">
        {equipe.elenco.map((atleta) => (
          <div key={atleta.usuarioId} className="linha">
            <Avatar nome={atleta.nome} url={atleta.avatarUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 550 }}>{atleta.nome}</div>
              {usaNick && atleta.nick ? (
                <code className="fraco">{atleta.nick}</code>
              ) : null}
            </div>
            {atleta.numero !== null ? (
              <span className="fraco" style={{ fontVariantNumeric: 'tabular-nums' }}>
                #{atleta.numero}
              </span>
            ) : null}
            <span className={`etiqueta ${FUNCAO[atleta.funcao].classe}`}>
              {FUNCAO[atleta.funcao].rotulo}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
