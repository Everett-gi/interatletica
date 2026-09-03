import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Equipe, FuncaoNaEquipe } from '../../../api/tipos-rede'
import type { Jogo } from '../../../api/tipos-esportes'
import type { Membro } from '../../../api/tipos'
import { Avatar, Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, percentual, quando } from '../../../formatos'
import { atleticaPorSlug } from '../../../demo/dados'
import { useSessao } from '../../../sessao/SessaoContexto'

const FUNCAO: Record<FuncaoNaEquipe, { rotulo: string; classe: string }> = {
  CAPITAO: { rotulo: 'Capitão', classe: 'etiqueta--acento' },
  TITULAR: { rotulo: 'Titular', classe: '' },
  RESERVA: { rotulo: 'Reserva', classe: '' },
  TECNICO: { rotulo: 'Técnico', classe: 'etiqueta--alerta' },
}

interface Composicao {
  equipe: Equipe | undefined
  jogos: Jogo[]
  membros: Membro[]
}

/**
 * A ficha de uma equipe (§26).
 *
 * <p>Elenco, calendário, resultados e títulos numa página só, porque é assim
 * que a pergunta chega: "como está o vôlei feminino?" — e não "quem são os
 * atletas do vôlei feminino" separado de "quais foram os jogos do vôlei
 * feminino".</p>
 */
export function DetalheDaEquipe() {
  const { slug = '', id = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [escalando, setEscalando] = useState(false)

  const busca = useBusca<Composicao>(async () => {
    const [equipes, jogos, membros] = await Promise.all([
      Dados.equipes(slug),
      Dados.jogos(slug),
      Dados.membros(slug),
    ])
    return { equipe: equipes.find((e) => e.id === id), jogos, membros }
  }, [slug, id])

  /** Troca a equipe no resultado da busca sem refazer as três chamadas. */
  const trocarEquipe = (equipe: Equipe) => {
    const atual = busca.dados
    if (atual) busca.definir({ ...atual, equipe })
  }

  return (
    <div>
      <Conteudo busca={busca} esqueleto={<Esqueleto altura="20rem" />}>
        {({ equipe, jogos, membros }) => {
          if (!equipe) {
            return (
              <EstadoVazio icone="equipes" titulo="Equipe não encontrada">
                <Link to={`/hub/${slug}/equipes`} className="botao botao--discreto">
                  Voltar às equipes
                </Link>
              </EstadoVazio>
            )
          }

          const daEquipe = jogos.filter((j) => j.equipeNome === equipe.nome)
          const disputados = daEquipe.filter((j) => j.resultado !== 'PENDENTE')
          const vitorias = disputados.filter((j) => j.resultado === 'VITORIA').length
          const proximos = daEquipe
            .filter((j) => new Date(j.inicioEm) >= new Date())
            .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm))
          // E-sports usa nickname; esporte de quadra usa número. A mesma
          // tabela guarda os dois, e a tela mostra o que faz sentido.
          const usaNick = equipe.elenco.some((a) => a.nick !== null)

          return (
            <>
              <CabecalhoDePagina
                titulo={equipe.nome}
                descricao={`${equipe.modalidade} · ${equipe.elenco.length} atletas`}
                trilha={[
                  { rotulo: 'Equipes', para: `/hub/${slug}/equipes` },
                  { rotulo: equipe.nome },
                ]}
                etiqueta={
                  <span className={`etiqueta ${equipe.ativa ? 'etiqueta--sucesso' : ''}`}>
                    {equipe.ativa ? 'ativa' : 'inativa'}
                  </span>
                }
              />

              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Atletas" icone="atletas" valor={equipe.elenco.length} />
                <Metrica rotulo="Jogos disputados" icone="jogos" valor={disputados.length} />
                <Metrica
                  rotulo="Aproveitamento" icone="resultados"
                  valor={disputados.length === 0
                    ? '—' : percentual(vitorias / disputados.length)}
                  detalhe={`${vitorias} vitórias`}
                />
                <Metrica rotulo="Próximos jogos" icone="calendario" valor={proximos.length} />
              </div>

              <div className="detalhe">
                <div>
                  <Secao
                    titulo="Elenco"
                    acao={diretor ? (
                      <button
                        className="botao botao--fantasma botao--pequeno"
                        onClick={() => setEscalando((v) => !v)}
                      >
                        <Icone nome="mais" tamanho={15} /> Escalar alguém
                      </button>
                    ) : undefined}
                  >
                    {escalando ? (
                      <FormularioDeEscalacao
                        equipe={equipe}
                        membros={membros}
                        aoEscalar={(atualizada) => {
                          trocarEquipe(atualizada)
                          setEscalando(false)
                        }}
                        aoCancelar={() => setEscalando(false)}
                      />
                    ) : null}

                    <div className="cartao">
                      {equipe.elenco.length === 0 ? (
                        <p className="fraco" style={{ margin: 0 }}>
                          Ninguém escalado ainda. O elenco sai da lista de
                          membros da atlética — quem não é membro não joga
                          por ela.
                        </p>
                      ) : null}
                      <div className="pilha pilha--densa">
                        {equipe.elenco.map((atleta) => (
                          <div key={atleta.usuarioId} className="linha">
                            <Avatar nome={atleta.nome} url={atleta.avatarUrl} tamanho="m" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 550 }}>{atleta.nome}</div>
                              {usaNick && atleta.nick ? (
                                <code className="fraco">{atleta.nick}</code>
                              ) : null}
                            </div>
                            {atleta.numero !== null ? (
                              <span className="numero-medio">#{atleta.numero}</span>
                            ) : null}
                            <span className={`etiqueta ${FUNCAO[atleta.funcao].classe}`}>
                              {FUNCAO[atleta.funcao].rotulo}
                            </span>
                            {diretor ? (
                              <button
                                className="icone-botao"
                                aria-label={`Tirar ${atleta.nome} do elenco`}
                                onClick={() => {
                                  void Dados.tirarDaEquipe(equipe.id, atleta.usuarioId)
                                    .then((e) => { if (e) trocarEquipe(e) })
                                }}
                              >
                                <Icone nome="fechar" tamanho={15} />
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Secao>

                  <Secao titulo="Jogos"
                         acao={
                           <Link to={`/hub/${slug}/jogos`}
                                 className="botao botao--fantasma botao--pequeno">
                             Ver todos
                           </Link>
                         }>
                    {daEquipe.length === 0 ? (
                      <EstadoVazio icone="jogos" titulo="Nenhum jogo registrado">
                        <p className="fraco">
                          Marque um amistoso pela seção Amistosos da rede: outra
                          atlética já está procurando adversário nesta modalidade.
                        </p>
                        <Link to={`/hub/${slug}/rede/amistosos`}
                              className="botao botao--discreto">
                          Procurar adversário
                        </Link>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha pilha--densa">
                        {[...daEquipe]
                          .sort((a, b) => b.inicioEm.localeCompare(a.inicioEm))
                          .map((j) => {
                            const adversaria = j.adversarioAtleticaSlug
                              ? atleticaPorSlug(j.adversarioAtleticaSlug) : undefined
                            return (
                              <div key={j.id} className="cartao cartao--compacto linha entre">
                                <div className="linha" style={{ minWidth: 0, gap: '0.5rem' }}>
                                  {adversaria ? (
                                    <Brasao atletica={adversaria} tamanho="p" />
                                  ) : null}
                                  <div style={{ minWidth: 0 }}>
                                    <strong>{j.adversario}</strong>
                                    <div className="fraco">
                                      {dataEHora(j.inicioEm)}
                                      {j.competicao ? ` · ${j.competicao}` : ''}
                                    </div>
                                  </div>
                                </div>
                                {j.resultado === 'PENDENTE' ? (
                                  <span className="etiqueta">{quando(j.inicioEm)}</span>
                                ) : (
                                  <span className={`etiqueta ${
                                    j.resultado === 'VITORIA' ? 'etiqueta--sucesso'
                                      : j.resultado === 'DERROTA' ? 'etiqueta--perigo'
                                      : 'etiqueta--alerta'}`}>
                                    {j.placarNos} × {j.placarDeles}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </Secao>
                </div>

                <div>
                  <Secao titulo="A equipe">
                    <div className="cartao">
                      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                        <span className="fraco">Modalidade</span>
                        <span>{equipe.modalidade}</span>
                      </div>
                      {equipe.tag ? (
                        <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                          <span className="fraco">Sigla</span>
                          <span>{equipe.tag}</span>
                        </div>
                      ) : null}
                      <div className="linha entre">
                        <span className="fraco">Capitão</span>
                        <span>
                          {equipe.elenco.find((a) => a.funcao === 'CAPITAO')?.nome ?? '—'}
                        </span>
                      </div>
                      <hr className="divisor" />
                      <p className="fraco" style={{ margin: 0 }}>
                        A equipe é da atlética e atravessa os eventos: ela se
                        inscreve em torneios, não é criada por evento.
                      </p>
                    </div>
                  </Secao>

                  <Secao titulo="Próximos compromissos">
                    {proximos.length === 0 ? (
                      <EstadoVazio titulo="Nada marcado" />
                    ) : (
                      <div className="pilha pilha--densa">
                        {proximos.map((j) => (
                          <div key={j.id} className="cartao cartao--compacto">
                            <strong style={{ fontSize: '0.92rem' }}>
                              contra {j.adversario}
                            </strong>
                            <div className="fraco">
                              {dataEHora(j.inicioEm)} · {quando(j.inicioEm)}
                            </div>
                            {j.local ? (
                              <div className="linha fraco" style={{ gap: '0.3rem' }}>
                                <Icone nome="local" tamanho={13} /> {j.local}
                              </div>
                            ) : null}
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

/**
 * Escalar alguém que já é membro.
 *
 * <p>A lista só oferece membros ativos, e some quem já está no elenco. Deixar
 * digitar um nome livre abriria a porta para atleta que não pertence à
 * atlética — que é exatamente o que a conferência de elegibilidade num
 * interatlética procura.</p>
 */
function FormularioDeEscalacao({ equipe, membros, aoEscalar, aoCancelar }: {
  equipe: Equipe
  membros: Membro[]
  aoEscalar: (equipe: Equipe) => void
  aoCancelar: () => void
}) {
  const jaNoElenco = new Set(equipe.elenco.map((a) => a.usuarioId))
  const disponiveis = membros.filter(
    (m) => m.situacao === 'ATIVO' && !jaNoElenco.has(m.usuarioId))

  const [usuarioId, setUsuarioId] = useState(disponiveis[0]?.usuarioId ?? '')
  const [funcao, setFuncao] = useState<FuncaoNaEquipe>('TITULAR')
  const [numero, setNumero] = useState('')
  const [nick, setNick] = useState('')
  const [salvando, setSalvando] = useState(false)

  if (disponiveis.length === 0) {
    return (
      <div className="aviso" style={{ marginBottom: '0.9rem' }}>
        <strong>Todo mundo já está escalado</strong>
        <p className="fraco" style={{ margin: '0.3rem 0 0' }}>
          Para escalar mais gente, convide novos membros para a atlética.
        </p>
        <button className="botao botao--fantasma botao--pequeno"
                style={{ marginTop: '0.5rem' }} onClick={aoCancelar}>
          Fechar
        </button>
      </div>
    )
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const membro = disponiveis.find((m) => m.usuarioId === usuarioId)
    if (!membro) return
    setSalvando(true)
    const atualizada = await Dados.escalarNaEquipe(equipe.id, {
      usuarioId: membro.usuarioId,
      nome: membro.nome,
      avatarUrl: membro.avatarUrl,
      funcao,
      numero: numero === '' ? null : Number(numero),
      nick: nick.trim() === '' ? null : nick.trim(),
    })
    setSalvando(false)
    if (atualizada) aoEscalar(atualizada)
  }

  return (
    <form className="cartao" style={{ marginBottom: '0.9rem' }}
          onSubmit={(e) => void enviar(e)}>
      <label className="campo">
        <span className="campo__rotulo">Quem</span>
        <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
          {disponiveis.map((m) => (
            <option key={m.usuarioId} value={m.usuarioId}>{m.nome}</option>
          ))}
        </select>
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Função</span>
          <select value={funcao}
                  onChange={(e) => setFuncao(e.target.value as FuncaoNaEquipe)}>
            {(Object.keys(FUNCAO) as FuncaoNaEquipe[]).map((f) => (
              <option key={f} value={f}>{FUNCAO[f].rotulo}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Número (opcional)</span>
          <input type="number" min={0} max={99} value={numero}
                 onChange={(e) => setNumero(e.target.value)} placeholder="10" />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Nickname (opcional)</span>
        <input value={nick} onChange={(e) => setNick(e.target.value)}
               maxLength={40} placeholder="Só nas modalidades de e-sports" />
      </label>

      <div className="linha">
        <button className="botao botao--pequeno" type="submit" disabled={salvando}>
          {salvando ? 'Escalando…' : 'Escalar'}
        </button>
        <button className="botao botao--fantasma botao--pequeno" type="button"
                onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
