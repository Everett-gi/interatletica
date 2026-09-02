import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Reuniao } from '../../../api/tipos-gestao'
import { Avatar, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, hora, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * As reuniões da diretoria (§21).
 *
 * <p>A separação entre agendadas e realizadas não é cosmética: a reunião que
 * já aconteceu vale pela ata, e a que vai acontecer vale pela pauta. São
 * dois conteúdos diferentes com o mesmo nome, e misturá-los faz a ata sumir
 * no meio de convocações.</p>
 */
export function Reunioes() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const reunioes = useBusca<Reuniao[]>(() => Dados.reunioes(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Reuniões"
        descricao="Pauta antes, ata depois. É a ata que prova que a decisão foi coletiva."
        acoes={diretor ? (
          <button className="botao" disabled
                  title="Agendamento chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Agendar reunião
          </button>
        ) : undefined}
      />

      <Conteudo
        busca={reunioes}
        esqueleto={
          <div className="pilha pilha--densa">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="9rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="reunioes" titulo="Nenhuma reunião registrada">
                <p className="fraco">
                  Agende a primeira com pauta escrita. Reunião sem pauta vira
                  conversa, e conversa não gera ata.
                </p>
              </EstadoVazio>
            )
          }

          const agendadas = lista
            .filter((r) => r.status === 'AGENDADA')
            .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm))
          const realizadas = lista
            .filter((r) => r.status !== 'AGENDADA')
            .sort((a, b) => b.inicioEm.localeCompare(a.inicioEm))

          return (
            <>
              <Secao titulo="Próximas" descricao="O que está convocado.">
                {agendadas.length === 0 ? (
                  <EstadoVazio titulo="Nada agendado" />
                ) : (
                  <div className="grade grade--larga">
                    {agendadas.map((r) => (
                      <CartaoDeReuniao key={r.id} reuniao={r} slug={slug} destaque />
                    ))}
                  </div>
                )}
              </Secao>

              {realizadas.length > 0 ? (
                <Secao
                  titulo="Realizadas"
                  descricao="Com ata registrada e as tarefas que saíram de cada uma."
                >
                  <div className="pilha pilha--densa">
                    {realizadas.map((r) => (
                      <Link key={r.id} to={`/hub/${slug}/reunioes/${r.id}`}
                            className="cartao cartao--clicavel linha entre">
                        <div style={{ minWidth: 0 }}>
                          <strong>{r.titulo}</strong>
                          <div className="fraco">
                            {dataEHora(r.inicioEm)} · {r.pautas.length} pautas ·{' '}
                            {r.tarefasGeradas} tarefas geradas
                          </div>
                        </div>
                        <span className={`etiqueta ${r.ata ? 'etiqueta--sucesso' : 'etiqueta--alerta'}`}>
                          {r.ata ? 'ata registrada' : 'sem ata'}
                        </span>
                      </Link>
                    ))}
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

function CartaoDeReuniao({ reuniao, slug, destaque }: {
  reuniao: Reuniao
  slug: string
  destaque?: boolean
}) {
  const confirmados = reuniao.convocados.filter((c) => c.confirmado).length
  const minutos = reuniao.pautas.reduce((s, p) => s + p.minutos, 0)

  return (
    <div className={`cartao${destaque ? ' cartao--destacado' : ''}`}>
      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
        <span className="etiqueta etiqueta--acento">{quando(reuniao.inicioEm)}</span>
        <span className="fraco">{hora(reuniao.inicioEm)}</span>
      </div>

      <h3 style={{ marginBottom: '0.3rem' }}>{reuniao.titulo}</h3>
      <div className="fraco" style={{ marginBottom: '0.7rem' }}>
        {reuniao.local ?? 'Online'}
        {reuniao.linkOnline && reuniao.local ? ' · com link online' : ''}
      </div>

      <div className="linha" style={{ gap: '0.35rem', marginBottom: '0.8rem' }}>
        <span className="etiqueta">{reuniao.convocados.length} convocados</span>
        <span className="etiqueta">{reuniao.pautas.length} pautas</span>
        <span className="etiqueta">{minutos} min previstos</span>
      </div>

      <div className="linha entre">
        <div className="pilha-de-avatares">
          {reuniao.convocados.slice(0, 6).map((c) => (
            <Avatar key={c.nome} nome={c.nome} url={c.avatarUrl} />
          ))}
        </div>
        <span className="fraco">{confirmados} confirmaram</span>
      </div>

      <Link to={`/hub/${slug}/reunioes/${reuniao.id}`}
            className="botao botao--discreto botao--largo"
            style={{ marginTop: '0.9rem' }}>
        Ver a pauta
      </Link>
    </div>
  )
}
