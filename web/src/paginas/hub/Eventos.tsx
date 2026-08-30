import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { EventoResumo, StatusDoEvento } from '../../api/tipos'
import {
  Abas,
  Conteudo,
  Esqueleto,
  EtiquetaDeStatus,
  EtiquetaDeTipo,
  useBusca,
  Vazio,
} from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
import { dataEHora, quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

type Filtro = 'TODOS' | StatusDoEvento

/**
 * A lista da diretoria — inclui rascunho, ao contrário da agenda pública.
 *
 * <p>O filtro começa em "todos" e não em "publicados": o que a diretoria
 * mais precisa ver aqui é justamente o que ainda não foi publicado, porque
 * é o que depende dela.</p>
 */
export function Eventos() {
  const { slug = '' } = useParams()
  const { vinculo, podeAtuarComo } = useSessao()
  useCorDaAtletica(vinculo(slug)?.atletica.corPrimaria)

  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const eventos = useBusca<EventoResumo[]>(() => Dados.eventosDaAtletica(slug), [slug])
  const diretor = podeAtuarComo(slug, 'DIRETOR')

  const contar = (status: StatusDoEvento) =>
    eventos.dados?.filter((e) => e.status === status).length ?? 0

  return (
    <div className="pilha">
      <header className="linha entre">
        <h1>Eventos</h1>
        {diretor ? (
          <Link to={`/hub/${slug}/eventos/novo`} className="botao">Novo evento</Link>
        ) : null}
      </header>

      <Abas
        atual={filtro}
        aoTrocar={setFiltro}
        opcoes={[
          { valor: 'TODOS', rotulo: 'Todos', contagem: eventos.dados?.length },
          { valor: 'RASCUNHO', rotulo: 'Rascunhos', contagem: contar('RASCUNHO') },
          { valor: 'PUBLICADO', rotulo: 'No ar', contagem: contar('PUBLICADO') },
          { valor: 'ENCERRADO', rotulo: 'Encerrados', contagem: contar('ENCERRADO') },
        ]}
      />

      <Conteudo
        busca={eventos}
        esqueleto={
          <div className="pilha pilha--densa">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="5rem" />)}
          </div>
        }
      >
        {(lista) => {
          const visiveis = filtro === 'TODOS'
            ? lista
            : lista.filter((e) => e.status === filtro)

          if (visiveis.length === 0) {
            return (
              <Vazio titulo="Nenhum evento aqui">
                {filtro === 'TODOS'
                  ? 'Crie o primeiro e publique quando estiver pronto.'
                  : 'Nenhum evento neste estado.'}
              </Vazio>
            )
          }

          return (
            <div className="pilha pilha--densa">
              {visiveis.map((evento) => (
                <Link
                  key={evento.id}
                  to={`/hub/${slug}/eventos/${evento.id}`}
                  className="cartao cartao--clicavel linha entre"
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="linha" style={{ gap: '0.35rem',
                                                    marginBottom: '0.25rem' }}>
                      <EtiquetaDeTipo tipo={evento.tipo} />
                      {evento.visibilidade === 'INTERNO' ? (
                        <span className="etiqueta">só a atlética</span>
                      ) : null}
                      {evento.visibilidade === 'REDE' ? (
                        <span className="etiqueta etiqueta--acento">rede</span>
                      ) : null}
                    </div>
                    <strong>{evento.titulo}</strong>
                    <div className="fraco">
                      {dataEHora(evento.inicioEm)} · {quando(evento.inicioEm)}
                      {evento.localNome ? ` · ${evento.localNome}` : ''}
                    </div>
                  </div>
                  <EtiquetaDeStatus status={evento.status} />
                </Link>
              ))}
            </div>
          )
        }}
      </Conteudo>
    </div>
  )
}
