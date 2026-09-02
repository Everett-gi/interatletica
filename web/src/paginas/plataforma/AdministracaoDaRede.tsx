import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dados } from '../../dados'
import type { PainelDaRede, SituacaoDeDenuncia } from '../../api/tipos-plataforma'
import {
  Abas,
  Brasao,
  Conteudo,
  Esqueleto,
  Metrica,
  Previa,
  useBusca,
} from '../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao, Variacao } from '../../ui/pagina'
import { Icone } from '../../ui/icones'
import { numero, quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

type Aba = 'VISAO' | 'VERIFICACAO' | 'MODERACAO'

const SITUACAO: Record<SituacaoDeDenuncia, { rotulo: string; classe: string }> = {
  ABERTA: { rotulo: 'aberta', classe: 'etiqueta--alerta' },
  EM_ANALISE: { rotulo: 'em análise', classe: 'etiqueta--acento' },
  PROCEDENTE: { rotulo: 'procedente', classe: 'etiqueta--perigo' },
  IMPROCEDENTE: { rotulo: 'improcedente', classe: '' },
}

/**
 * O painel de quem administra a rede inteira (§95 e §96).
 *
 * <p>Existe porque território comum precisa de zelador: verificação de
 * atlética, denúncia e moderação não podem depender de uma atlética julgar
 * outra. Só quem tem papel de operador da plataforma chega aqui.</p>
 */
export function AdministracaoDaRede() {
  const { perfil, carregando } = useSessao()
  const [aba, setAba] = useState<Aba>('VISAO')

  const painel = useBusca<PainelDaRede>(() => Dados.painelDaRede(), [])

  if (carregando) {
    return <div><Esqueleto altura="18rem" /></div>
  }

  if (!perfil?.operador) {
    return (
      <div style={{ maxWidth: "40rem", margin: "0 auto" }}>
        <EstadoVazio icone="ajustes" titulo="Área restrita">
          <p className="fraco">
            Esta é a administração da rede, acessível a quem opera a plataforma —
            não à diretoria de uma atlética. Se você precisa reportar algo, use a
            denúncia dentro do próprio conteúdo.
          </p>
          <Link to="/" className="botao botao--discreto">Voltar ao início</Link>
        </EstadoVazio>
      </div>
    )
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Administração da rede"
        descricao="A saúde da plataforma inteira: crescimento, verificação e moderação."
        etiqueta={<span className="etiqueta etiqueta--acento">operador</span>}
      />

      <Previa oQueFalta="Aprovar verificação e julgar denúncia ainda não chegam ao servidor." />

      <Abas
        atual={aba}
        aoTrocar={setAba}
        opcoes={[
          { valor: 'VISAO', rotulo: 'Visão geral' },
          { valor: 'VERIFICACAO', rotulo: 'Verificação',
            contagem: painel.dados?.aguardandoVerificacao.length },
          { valor: 'MODERACAO', rotulo: 'Moderação',
            contagem: painel.dados?.denunciasAbertas },
        ]}
      />

      <Conteudo busca={painel} esqueleto={<Esqueleto altura="20rem" />}>
        {(d) => (
          <>
            {aba === 'VISAO' ? (
              <>
                <div className="grade grade--metricas" style={{ marginBottom: '1.6rem' }}>
                  <Metrica rotulo="Atléticas" icone="atletica" valor={numero(d.atleticas)}
                           extra={<Variacao percentual={d.crescimento} />} />
                  <Metrica rotulo="Usuários" icone="membros" valor={numero(d.usuarios)} />
                  <Metrica rotulo="Eventos" icone="eventos" valor={numero(d.eventos)} />
                  <Metrica rotulo="Novas atléticas" icone="mais" valor={d.novasAtleticas}
                           detalhe="nos últimos 30 dias" />
                </div>

                <div className="detalhe">
                  <div>
                    <Secao titulo="Atléticas por mês">
                      <div className="cartao">
                        <Colunas pontos={d.atleticasPorMes} />
                      </div>
                    </Secao>

                    <Secao titulo="Eventos criados por mês">
                      <div className="cartao">
                        <Colunas pontos={d.eventosPorMes} />
                      </div>
                    </Secao>
                  </div>

                  <div>
                    <Secao titulo="Precisa de atenção">
                      <div className="pilha pilha--densa">
                        <div className="cartao cartao--compacto linha entre">
                          <span>Denúncias abertas</span>
                          <span className={`etiqueta ${
                            d.denunciasAbertas > 0 ? 'etiqueta--alerta' : ''}`}>
                            {d.denunciasAbertas}
                          </span>
                        </div>
                        <div className="cartao cartao--compacto linha entre">
                          <span>Aguardando verificação</span>
                          <span className="etiqueta">
                            {d.aguardandoVerificacao.length}
                          </span>
                        </div>
                      </div>
                    </Secao>

                    <div className="aviso">
                      <strong>Território comum</strong>
                      <p className="fraco" style={{ margin: '0.3rem 0 0' }}>
                        Nenhuma atlética é dona da plataforma. A administração da
                        rede existe para arbitrar o que nenhuma atlética pode
                        arbitrar sobre outra — verificação e moderação —, e nada
                        além disso.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {aba === 'VERIFICACAO' ? (
              <Secao
                titulo="Pedidos de verificação"
                descricao="O selo confirma que a atlética existe e é reconhecida pela instituição. Aparece discretamente no perfil (§94)."
              >
                {d.aguardandoVerificacao.length === 0 ? (
                  <EstadoVazio icone="verificado" titulo="Nenhum pedido pendente" />
                ) : (
                  <div className="pilha pilha--densa">
                    {d.aguardandoVerificacao.map(({ atletica, pedidoEm }) => (
                      <div key={atletica.slug} className="cartao linha entre">
                        <div className="linha" style={{ minWidth: 0 }}>
                          <Brasao atletica={atletica} tamanho="m" />
                          <div style={{ minWidth: 0 }}>
                            <strong>{atletica.nome}</strong>
                            <div className="fraco">{atletica.instituicao}</div>
                            <div className="fraco">pedido {quando(pedidoEm)}</div>
                          </div>
                        </div>
                        <div className="linha">
                          <button className="botao botao--discreto botao--pequeno" disabled>
                            Recusar
                          </button>
                          <button className="botao botao--pequeno" disabled>
                            <Icone nome="verificado" tamanho={14} /> Verificar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Secao>
            ) : null}

            {aba === 'MODERACAO' ? (
              <Secao
                titulo="Denúncias"
                descricao="Conteúdo reportado por atléticas da rede. Toda ação fica registrada no histórico administrativo (§93)."
              >
                {d.denuncias.length === 0 ? (
                  <EstadoVazio icone="certo" titulo="Nenhuma denúncia" />
                ) : (
                  <div className="rolagem">
                    <table className="tabela-cartoes">
                      <thead>
                        <tr>
                          <th>Conteúdo</th>
                          <th>Motivo</th>
                          <th>Denunciante</th>
                          <th>Quando</th>
                          <th>Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.denuncias.map((den) => (
                          <tr key={den.id}>
                            <td data-rotulo="Conteúdo">{den.conteudo}</td>
                            <td data-rotulo="Motivo">{den.motivo}</td>
                            <td data-rotulo="Denunciante">{den.autorAtletica}</td>
                            <td data-rotulo="Quando">{quando(den.quando)}</td>
                            <td data-rotulo="Situação">
                              <span className={`etiqueta ${SITUACAO[den.situacao].classe}`}>
                                {SITUACAO[den.situacao].rotulo}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Secao>
            ) : null}
          </>
        )}
      </Conteudo>
    </div>
  )
}

/** Barras verticais simples: seis meses cabem sem biblioteca de gráfico. */
function Colunas({ pontos }: { pontos: { rotulo: string; valor: number }[] }) {
  const maximo = Math.max(1, ...pontos.map((p) => p.valor))
  const minimo = Math.min(...pontos.map((p) => p.valor))
  // A base não é zero: com valores entre 1.100 e 1.240, barras a partir do
  // zero ficariam todas iguais e o crescimento sumiria.
  const base = Math.max(0, minimo - (maximo - minimo) * 0.6)

  return (
    <div>
      <div className="linha" style={{ alignItems: 'flex-end', gap: '0.5rem',
                                      height: '8rem' }}>
        {pontos.map((p) => (
          <div key={p.rotulo} style={{ flex: 1, display: 'flex',
                                       flexDirection: 'column',
                                       justifyContent: 'flex-end', height: '100%' }}>
            <div className="fraco" style={{ fontSize: '0.72rem', textAlign: 'center',
                                            marginBottom: '0.2rem' }}>
              {numero(p.valor)}
            </div>
            <div
              style={{
                height: `${((p.valor - base) / (maximo - base)) * 100}%`,
                background: 'var(--acento)',
                borderRadius: '5px 5px 0 0',
                minHeight: '4px',
              }}
              role="img"
              aria-label={`${p.rotulo}: ${p.valor}`}
            />
          </div>
        ))}
      </div>
      <div className="linha" style={{ gap: '0.5rem', marginTop: '0.4rem' }}>
        {pontos.map((p) => (
          <span key={p.rotulo} className="fraco"
                style={{ flex: 1, textAlign: 'center', fontSize: '0.74rem' }}>
            {p.rotulo}
          </span>
        ))}
      </div>
      <p className="fraco" style={{ marginTop: '0.6rem', marginBottom: 0 }}>
        A base do gráfico não é zero: com valores próximos entre si, barras a
        partir do zero ficariam idênticas e o crescimento sumiria.
      </p>
    </div>
  )
}
