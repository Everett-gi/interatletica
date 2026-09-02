import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Decisao } from '../../../api/tipos-gestao'
import { Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Confirmacao,
  EstadoVazio,
  Progresso,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataPorExtenso, percentual, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'
import { STATUS_DA_DECISAO } from './Decisoes'

/**
 * Uma decisão: contexto, opções, votação e resultado.
 *
 * <p>Votar pede confirmação porque o voto é público dentro da diretoria e
 * fica registrado com nome — não é um clique como qualquer outro. Trocar de
 * opção move o voto em vez de somar um segundo, que é o erro clássico de
 * enquete improvisada em grupo de mensagens.</p>
 */
export function DetalheDaDecisao() {
  const { slug = '', id = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [confirmando, setConfirmando] = useState<string | null>(null)

  const decisao = useBusca<Decisao | null>(() => Dados.decisao(id), [id])

  async function votar(opcaoId: string) {
    const atualizada = await Dados.votar(id, opcaoId)
    if (atualizada) decisao.definir(atualizada)
  }

  return (
    <div>
      <Conteudo busca={decisao} esqueleto={<Esqueleto altura="20rem" />}>
        {(d) => {
          if (!d) {
            return (
              <EstadoVazio icone="decisoes" titulo="Decisão não encontrada">
                <Link to={`/hub/${slug}/decisoes`} className="botao botao--discreto">
                  Voltar às decisões
                </Link>
              </EstadoVazio>
            )
          }

          const total = d.opcoes.reduce((s, o) => s + o.votos, 0)
          const emVotacao = d.status === 'EM_VOTACAO'
          const escolhida = d.opcoes.find((o) => o.id === d.escolhidaId)
          const temQuorum = d.votantes >= d.quorum
          const opcaoConfirmando = d.opcoes.find((o) => o.id === confirmando)

          return (
            <>
              <CabecalhoDePagina
                titulo={d.titulo}
                descricao={d.contexto}
                trilha={[
                  { rotulo: 'Decisões', para: `/hub/${slug}/decisoes` },
                  { rotulo: d.titulo },
                ]}
                etiqueta={
                  <span className={`etiqueta ${STATUS_DA_DECISAO[d.status].classe}`}>
                    {STATUS_DA_DECISAO[d.status].rotulo}
                  </span>
                }
              />

              <div className="detalhe">
                <div>
                  <Secao
                    titulo={emVotacao ? 'Escolha uma opção' : 'As opções'}
                    descricao={emVotacao && d.meuVoto
                      ? 'Você já votou. Clicar em outra opção move o seu voto.'
                      : undefined}
                  >
                    <div className="pilha pilha--densa">
                      {d.opcoes.map((opcao) => {
                        const meu = d.meuVoto === opcao.id
                        const venceu = d.escolhidaId === opcao.id
                        const proporcao = total === 0 ? 0 : opcao.votos / total

                        return (
                          <div
                            key={opcao.id}
                            className={`cartao${meu || venceu ? ' cartao--destacado' : ''}`}
                          >
                            <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
                              <div style={{ minWidth: 0 }}>
                                <strong>{opcao.rotulo}</strong>
                                {opcao.detalhe ? (
                                  <div className="fraco">{opcao.detalhe}</div>
                                ) : null}
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div className="numero-medio">{opcao.votos}</div>
                                <div className="fraco">{percentual(proporcao)}</div>
                              </div>
                            </div>

                            <Progresso
                              proporcao={proporcao}
                              tom={venceu ? 'sucesso' : undefined}
                            />

                            <div className="linha entre" style={{ marginTop: '0.6rem' }}>
                              <div className="linha" style={{ gap: '0.35rem' }}>
                                {meu ? (
                                  <span className="etiqueta etiqueta--acento">seu voto</span>
                                ) : null}
                                {venceu ? (
                                  <span className="etiqueta etiqueta--sucesso">escolhida</span>
                                ) : null}
                              </div>
                              {emVotacao && diretor && !meu ? (
                                <button
                                  className="botao botao--discreto botao--pequeno"
                                  onClick={() => setConfirmando(opcao.id)}
                                >
                                  Votar nesta
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Secao>

                  {!emVotacao && escolhida ? (
                    <Secao titulo="Resultado">
                      <div className="cartao">
                        <div className="linha" style={{ gap: '0.55rem',
                                                        marginBottom: '0.5rem' }}>
                          <span style={{ color: d.status === 'APROVADA'
                            ? 'var(--sucesso)' : 'var(--perigo)' }}>
                            <Icone nome={d.status === 'APROVADA' ? 'certo' : 'alerta'}
                                   tamanho={20} />
                          </span>
                          <strong style={{ fontSize: '1.02rem' }}>{escolhida.rotulo}</strong>
                        </div>
                        <p className="fraco" style={{ margin: 0 }}>
                          Decidido em {d.fechaEm ? dataPorExtenso(d.fechaEm) : '—'} com{' '}
                          {escolhida.votos} de {total} votos.
                          {d.responsavelNome
                            ? ` Responsável pela execução: ${d.responsavelNome}.`
                            : ''}
                        </p>
                      </div>
                    </Secao>
                  ) : null}
                </div>

                <div>
                  <Secao titulo="A votação">
                    <div className="cartao">
                      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                        <span className="fraco">Votos registrados</span>
                        <strong>{d.votantes}</strong>
                      </div>
                      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                        <span className="fraco">Quórum mínimo</span>
                        <strong>{d.quorum}</strong>
                      </div>
                      <Progresso
                        proporcao={d.votantes / d.quorum}
                        tom={temQuorum ? 'sucesso' : 'alerta'}
                      />
                      <div className="fraco" style={{ marginTop: '0.5rem' }}>
                        {temQuorum
                          ? 'Quórum atingido: a decisão tem validade.'
                          : `Faltam ${d.quorum - d.votantes} votos para valer.`}
                      </div>
                    </div>
                  </Secao>

                  <Secao titulo="Contexto">
                    <div className="cartao">
                      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                        <span className="fraco">Aberta</span>
                        <span>{quando(d.abertaEm)}</span>
                      </div>
                      {d.fechaEm ? (
                        <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                          <span className="fraco">
                            {emVotacao ? 'Fecha' : 'Fechou'}
                          </span>
                          <span>{quando(d.fechaEm)}</span>
                        </div>
                      ) : null}
                      {d.responsavelNome ? (
                        <div className="linha entre">
                          <span className="fraco">Responsável</span>
                          <span>{d.responsavelNome}</span>
                        </div>
                      ) : null}
                      {d.reuniaoId ? (
                        <>
                          <hr className="divisor" />
                          <Link to={`/hub/${slug}/reunioes/${d.reuniaoId}`}
                                className="linha" style={{ gap: '0.45rem' }}>
                            <Icone nome="reunioes" tamanho={16} />
                            <span style={{ flex: 1, minWidth: 0 }}>{d.reuniaoTitulo}</span>
                            <Icone nome="direita" tamanho={14} />
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </Secao>
                </div>
              </div>

              {opcaoConfirmando ? (
                <Confirmacao
                  titulo={`Votar em “${opcaoConfirmando.rotulo}”?`}
                  consequencia={d.meuVoto
                    ? 'Seu voto atual será movido para esta opção. O voto fica registrado com o seu nome.'
                    : 'O voto fica registrado com o seu nome e é visível para a diretoria.'}
                  rotuloDeConfirmar="Confirmar voto"
                  perigo={false}
                  aoConfirmar={() => {
                    void votar(opcaoConfirmando.id)
                    setConfirmando(null)
                  }}
                  aoCancelar={() => setConfirmando(null)}
                />
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
