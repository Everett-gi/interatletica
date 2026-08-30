import { Link } from 'react-router-dom'
import { Dados } from '../dados'
import type { ItemDaAgendaDaRede, LinhaDoQuadroDeMedalhas } from '../api/tipos-rede'
import {
  Brasao,
  Conteudo,
  EtiquetaDeTipo,
  Esqueleto,
  useBusca,
  Vazio,
} from '../ui/componentes'
import { dataEHora, quando } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'

/**
 * A primeira tela: a agenda de TODAS as atléticas, junta.
 *
 * <p>É o que dá nome à plataforma. Cada atlética já tem seu grupo de
 * WhatsApp e seu Instagram; o que nenhuma tem sozinha é a visão do que está
 * acontecendo na rede — e é aqui que um aluno do Direito descobre que a
 * Engenharia abriu um torneio para fora.</p>
 */
export function Descoberta() {
  const { perfil } = useSessao()
  const agenda = useBusca<ItemDaAgendaDaRede[]>(() => Dados.agendaDaRede(), [])
  const quadro = useBusca<LinhaDoQuadroDeMedalhas[]>(() => Dados.quadroDeMedalhas(), [])

  return (
    <div className="pilha" style={{ gap: '2rem' }}>
      {!perfil ? <Apresentacao /> : null}

      <section>
        <div className="cabecalho-de-secao">
          <div>
            <h2>Acontecendo na rede</h2>
            <p className="fraco" style={{ margin: 0 }}>
              Eventos abertos de todas as atléticas, do mais próximo ao mais distante
            </p>
          </div>
          <Link to="/rede" className="botao botao--discreto botao--pequeno">
            Ver atléticas
          </Link>
        </div>

        <Conteudo
          busca={agenda}
          esqueleto={
            <div className="grade">
              {[0, 1, 2].map((i) => <Esqueleto key={i} altura="9rem" />)}
            </div>
          }
        >
          {(itens) =>
            itens.length === 0 ? (
              <Vazio titulo="Nada marcado por enquanto">
                Quando alguma atlética publicar um evento, ele aparece aqui.
              </Vazio>
            ) : (
              <div className="grade">
                {itens.map((item) => <CartaoDeEvento key={item.evento.id} item={item} />)}
              </div>
            )
          }
        </Conteudo>
      </section>

      <section>
        <div className="cabecalho-de-secao">
          <div>
            <h2>Quadro da temporada</h2>
            <p className="fraco" style={{ margin: 0 }}>
              Pontuação acumulada nas competições entre atléticas
            </p>
          </div>
          <Link to="/quadro" className="botao botao--discreto botao--pequeno">
            Quadro completo
          </Link>
        </div>

        <Conteudo busca={quadro} esqueleto={<Esqueleto altura="12rem" />}>
          {(linhas) => (
            <div className="pilha pilha--densa">
              {linhas.slice(0, 3).map((linha) => (
                <Link
                  key={linha.atletica.slug}
                  to={`/a/${linha.atletica.slug}`}
                  className="cartao cartao--clicavel linha"
                >
                  <PosicaoNoPodio posicao={linha.posicao} />
                  <Brasao atletica={linha.atletica} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{linha.atletica.nome}</strong>
                    <div className="fraco">{linha.atletica.instituicao}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="numero-grande" style={{ fontSize: '1.3rem' }}>
                      {linha.pontos}
                    </div>
                    <div className="fraco">pontos</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Conteudo>
      </section>
    </div>
  )
}

function Apresentacao() {
  return (
    <section
      className="capa"
      style={{ background: 'linear-gradient(135deg, #2b5fd0, #6d28d9)' }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
        Uma agenda só, de todas as atléticas
      </h1>
      <p style={{ maxWidth: '38ch', opacity: 0.92, marginBottom: '1rem' }}>
        Esportes, e-sports e eventos sociais entre atléticas universitárias.
        Território comum: nenhuma é dona da plataforma, cada uma é dona dos
        seus dados.
      </p>
      <div className="linha">
        <Link
          to="/rede"
          className="botao"
          style={{ background: '#fff', color: '#1a2540' }}
        >
          Conhecer as atléticas
        </Link>
      </div>
    </section>
  )
}

function CartaoDeEvento({ item }: { item: ItemDaAgendaDaRede }) {
  const { evento, atletica } = item
  const lotado = item.vagasRestantes === 0

  return (
    <Link to={`/e/${atletica.slug}/${evento.slug}`} className="cartao cartao--clicavel">
      <div className="linha" style={{ marginBottom: '0.6rem' }}>
        <Brasao atletica={atletica} tamanho="p" />
        <span className="fraco" style={{ flex: 1, minWidth: 0 }}>{atletica.nome}</span>
        {item.organizadoras > 1 ? (
          <span className="etiqueta etiqueta--acento">
            {item.organizadoras} atléticas
          </span>
        ) : null}
      </div>

      <h3 style={{ marginBottom: '0.3rem' }}>{evento.titulo}</h3>

      <div className="linha" style={{ gap: '0.35rem', marginBottom: '0.6rem' }}>
        <EtiquetaDeTipo tipo={evento.tipo} />
        {evento.modalidade ? <span className="etiqueta">{evento.modalidade}</span> : null}
      </div>

      <div className="fraco">{dataEHora(evento.inicioEm)} · {quando(evento.inicioEm)}</div>
      {evento.localNome ? <div className="fraco">{evento.localNome}</div> : null}

      <div className="linha entre" style={{ marginTop: '0.7rem' }}>
        <span className="fraco">{item.inscritos} inscritos</span>
        {item.vagasRestantes !== null ? (
          <span className={`etiqueta ${lotado ? 'etiqueta--alerta' : 'etiqueta--sucesso'}`}>
            {lotado ? 'lista de espera' : `${item.vagasRestantes} vagas`}
          </span>
        ) : (
          <span className="etiqueta">vagas ilimitadas</span>
        )}
      </div>
    </Link>
  )
}

export function PosicaoNoPodio({ posicao }: { posicao: number }) {
  const cor = posicao === 1 ? 'var(--ouro)'
    : posicao === 2 ? 'var(--prata)'
    : posicao === 3 ? 'var(--bronze)'
    : 'var(--texto-fraco)'

  return (
    <div
      style={{
        width: '2rem', textAlign: 'center', fontWeight: 800,
        fontSize: '1.1rem', color: cor, flexShrink: 0,
      }}
    >
      {posicao}
      <span className="apenas-leitor">º lugar</span>
    </div>
  )
}
