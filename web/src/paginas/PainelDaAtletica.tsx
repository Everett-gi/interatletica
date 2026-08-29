import { Link, useParams } from 'react-router-dom'
import { Api } from '../api/rotas'
import { Conteudo, EtiquetaDeStatus, useBusca, Vazio } from '../componentes/comuns'
import { dataEHora } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'
import type { EventoResumo } from '../api/tipos'

/**
 * O painel da atlética: a agenda de eventos e os atalhos da diretoria.
 *
 * <p>Lista inclui rascunho — é a tela de quem organiza, não a página
 * pública. O que a diretoria mais precisa ver aqui é o que ainda não foi
 * publicado, porque é o que depende dela.</p>
 */
export function PainelDaAtletica() {
  const { slug = '' } = useParams()
  const { vinculo, podeAtuarComo } = useSessao()

  const meu = vinculo(slug)
  const ehDiretor = podeAtuarComo(slug, 'DIRETOR')
  const ehPresidente = podeAtuarComo(slug, 'PRESIDENTE')

  const busca = useBusca<EventoResumo[]>(() => Api.eventos.listar(slug), [slug])

  return (
    <div className="pilha">
      <header className="linha entre">
        <div>
          <h1>{meu?.atletica.nome ?? 'Atlética'}</h1>
          <p className="fraco" style={{ margin: 0 }}>
            {meu?.cargo ?? meu?.papel}
          </p>
        </div>
        <div className="linha">
          {ehPresidente ? (
            <Link to={`/a/${slug}/membros`} className="botao botao--discreto">
              Membros
            </Link>
          ) : null}
          {ehDiretor ? (
            <Link to={`/a/${slug}/eventos/novo`} className="botao">
              Novo evento
            </Link>
          ) : null}
        </div>
      </header>

      <Conteudo busca={busca}>
        {(eventos) =>
          eventos.length === 0 ? (
            <Vazio>
              <h2>Nenhum evento ainda</h2>
              <p>
                {ehDiretor
                  ? 'Crie o primeiro e publique quando estiver pronto.'
                  : 'A diretoria ainda não publicou nada por aqui.'}
              </p>
            </Vazio>
          ) : (
            <div className="pilha">
              {eventos.map((evento) => (
                <Link
                  key={evento.id}
                  to={`/a/${slug}/eventos/${evento.id}`}
                  className="cartao linha entre"
                >
                  <div>
                    <strong>{evento.titulo}</strong>
                    <div className="fraco">
                      {dataEHora(evento.inicioEm)}
                      {evento.localNome ? ` · ${evento.localNome}` : ''}
                    </div>
                  </div>
                  <EtiquetaDeStatus status={evento.status} />
                </Link>
              ))}
            </div>
          )
        }
      </Conteudo>
    </div>
  )
}
