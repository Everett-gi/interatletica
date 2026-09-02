import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Gestao } from '../../../api/tipos-gestao'
import { Avatar, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro } from '../../../formatos'

/**
 * O relatório de uma gestão (§88).
 *
 * <p>A ordem das três listas do fim — conquistas, problemas, recomendações —
 * é deliberada, e a do meio é a que costuma faltar. Relatório que só lista
 * vitória não ajuda ninguém: o que a próxima diretoria precisa saber é qual
 * fornecedor atrasou, qual evento deu prejuízo e por quê.</p>
 */
export function RelatorioDaGestao() {
  const { slug = '', ano = '' } = useParams()
  const gestao = useBusca<Gestao | null>(
    () => Dados.gestao(slug, Number(ano)), [slug, ano])

  return (
    <div>
      <Conteudo busca={gestao} esqueleto={<Esqueleto altura="20rem" />}>
        {(g) => {
          if (!g) {
            return (
              <EstadoVazio icone="gestao" titulo="Gestão não encontrada">
                <p className="fraco">Talvez o ano tenha sido digitado errado no endereço.</p>
              </EstadoVazio>
            )
          }

          return (
            <>
              <CabecalhoDePagina
                titulo={`Relatório da gestão ${g.ano}`}
                descricao={g.periodo}
                trilha={[
                  { rotulo: 'Gestão', para: `/hub/${slug}/gestao` },
                  { rotulo: String(g.ano) },
                ]}
                etiqueta={
                  <span className={`etiqueta ${g.encerrada ? '' : 'etiqueta--sucesso'}`}>
                    {g.encerrada ? 'encerrada' : 'em curso'}
                  </span>
                }
              />

              <div className="grade grade--metricas" style={{ marginBottom: '1.8rem' }}>
                <Metrica rotulo="Eventos realizados" icone="eventos"
                         valor={g.eventosRealizados} />
                <Metrica rotulo="Projetos concluídos" icone="projetos"
                         valor={g.projetosConcluidos} />
                <Metrica rotulo="Membros ao final" icone="membros"
                         valor={g.membrosAoFinal} />
                <Metrica
                  rotulo="Saldo final" icone="financeiro"
                  valor={g.saldoFinal === null ? '—' : dinheiro(g.saldoFinal)}
                  detalhe={g.saldoFinal === null ? 'gestão em curso' : undefined}
                />
              </div>

              <div className="detalhe">
                <div>
                  <Secao titulo="O que deu certo">
                    <ListaDeFatos itens={g.conquistas} icone="certo" tom="var(--sucesso)"
                                  vazio="Nada registrado como conquista." />
                  </Secao>

                  <Secao
                    titulo="O que deu errado"
                    descricao="A parte mais útil do relatório, e a que quase sempre falta."
                  >
                    <ListaDeFatos itens={g.problemas} icone="alerta" tom="var(--alerta)"
                                  vazio="Nenhum problema registrado." />
                  </Secao>

                  <Secao
                    titulo="Recomendações para a próxima gestão"
                    descricao="O que esta diretoria faria diferente se começasse hoje."
                  >
                    <ListaDeFatos itens={g.recomendacoes} icone="info" tom="var(--acento)"
                                  vazio="Nenhuma recomendação registrada." />
                  </Secao>
                </div>

                <div>
                  <Secao titulo="Diretoria">
                    <div className="cartao">
                      <div className="pilha pilha--densa">
                        {g.integrantes.map((i) => (
                          <div key={i.nome} className="linha">
                            <Avatar nome={i.nome} url={i.avatarUrl} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 550, fontSize: '0.9rem' }}>
                                {i.nome}
                              </div>
                              <div className="fraco">{i.cargo}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Secao>

                  <Secao titulo="Documentos da gestão">
                    {g.documentos.length === 0 ? (
                      <EstadoVazio titulo="Nenhum documento anexado" />
                    ) : (
                      <div className="pilha pilha--densa">
                        {g.documentos.map((doc) => (
                          <div key={doc} className="cartao cartao--compacto linha">
                            <Icone nome="documentos" tamanho={17} />
                            <span style={{ flex: 1, minWidth: 0, fontSize: '0.9rem' }}>
                              {doc}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Secao>
                </div>
              </div>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function ListaDeFatos({ itens, icone, tom, vazio }: {
  itens: string[]
  icone: 'certo' | 'alerta' | 'info'
  tom: string
  vazio: string
}) {
  if (itens.length === 0) {
    return <p className="fraco">{vazio}</p>
  }
  return (
    <div className="cartao">
      <div className="pilha pilha--densa">
        {itens.map((item) => (
          <div key={item} className="linha linha--topo" style={{ gap: '0.55rem' }}>
            <span style={{ color: tom, marginTop: '0.15rem' }}>
              <Icone nome={icone} tamanho={17} />
            </span>
            <span style={{ flex: 1 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
