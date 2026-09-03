import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Gestao } from '../../../api/tipos-gestao'
import { Avatar, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  ItemDaLinha,
  LinhaDoTempo,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, plural } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * As gestões da atlética (§16).
 *
 * <p>Esta é a tela que sustenta o §87 — <em>memória institucional</em>. A
 * frase que a plataforma existe para impedir é "a diretoria nova não sabe
 * como a antiga fazia", e o antídoto não é um arquivo de PDFs: é cada gestão
 * ter uma página com o que fez, o que deu errado e o que recomenda.</p>
 */
export function Gestoes() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const presidente = podeAtuarComo(slug, 'PRESIDENTE')
  const gestoes = useBusca<Gestao[]>(() => Dados.gestoes(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Gestão"
        descricao="Cada diretoria que passou por aqui, o que entregou e o que deixou anotado para a próxima."
        acoes={presidente ? (
          <Link to={`/hub/${slug}/gestao/transicao`} className="botao">
            <Icone nome="transicao" tamanho={16} /> Preparar transição
          </Link>
        ) : undefined}
      />

      <Conteudo busca={gestoes} esqueleto={<Esqueleto altura="18rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="gestao" titulo="Nenhuma gestão registrada">
                <p className="fraco">
                  Registrar a gestão atual é o que permite a próxima começar
                  sabendo o que aconteceu.
                </p>
              </EstadoVazio>
            )
          }

          const atual = lista.find((g) => !g.encerrada)
          const anteriores = lista.filter((g) => g.encerrada)

          return (
            <>
              {atual ? (
                <Secao titulo="Gestão atual">
                  <CartaoDeGestao gestao={atual} slug={slug} destaque />
                </Secao>
              ) : null}

              {anteriores.length > 0 ? (
                <Secao
                  titulo="Histórico"
                  descricao="Abrir uma gestão anterior mostra integrantes, projetos, conquistas e recomendações."
                >
                  <div className="cartao">
                    <LinhaDoTempo>
                      {anteriores.map((g) => (
                        <ItemDaLinha key={g.ano} estado="feito">
                          <Link
                            to={`/hub/${slug}/gestao/${g.ano}`}
                            className="linha entre"
                            style={{ color: 'inherit' }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <strong>Gestão {g.ano}</strong>
                              <div className="fraco">
                                {g.presidente} · {plural(g.eventosRealizados, 'evento')} ·{' '}
                                {g.projetosConcluidos} projetos
                                {g.saldoFinal !== null
                                  ? ` · fechou com ${dinheiro(g.saldoFinal)}`
                                  : ''}
                              </div>
                            </div>
                            <Icone nome="direita" tamanho={16} />
                          </Link>
                        </ItemDaLinha>
                      ))}
                    </LinhaDoTempo>
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

function CartaoDeGestao({ gestao, slug, destaque = false }: {
  gestao: Gestao
  slug: string
  destaque?: boolean
}) {
  return (
    <div className={`cartao${destaque ? ' cartao--destacado' : ''}`}>
      <div className="linha entre" style={{ marginBottom: '1rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.1rem' }}>Gestão {gestao.ano}</h3>
          <div className="fraco">{gestao.periodo}</div>
        </div>
        <Link to={`/hub/${slug}/gestao/${gestao.ano}`}
              className="botao botao--discreto botao--pequeno">
          Ver o relatório
        </Link>
      </div>

      <div className="grade grade--metricas" style={{ marginBottom: '1rem' }}>
        <Metrica rotulo="Eventos" valor={gestao.eventosRealizados} />
        <Metrica rotulo="Projetos concluídos" valor={gestao.projetosConcluidos} />
        <Metrica rotulo="Membros" valor={gestao.membrosAoFinal} />
        <Metrica
          rotulo="Saldo"
          valor={gestao.saldoFinal === null ? 'em curso' : dinheiro(gestao.saldoFinal)}
        />
      </div>

      <div className="fraco" style={{ marginBottom: '0.45rem' }}>Diretoria</div>
      <div className="grade">
        {gestao.integrantes.map((i) => (
          <div key={i.nome} className="linha">
            <Avatar nome={i.nome} url={i.avatarUrl} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 550, fontSize: '0.9rem' }}>{i.nome}</div>
              <div className="fraco">{i.cargo}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
