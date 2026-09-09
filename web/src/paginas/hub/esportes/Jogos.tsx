import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Jogo, ResultadoDoJogo } from '../../../api/tipos-esportes'
import type { Equipe } from '../../../api/tipos-rede'
import { Brasao, Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, percentual, plural, quando } from '../../../formatos'
import { atleticaPorSlug } from '../../../demo/dados'
import { useSessao } from '../../../sessao/SessaoContexto'

const RESULTADO: Record<ResultadoDoJogo, { rotulo: string; classe: string }> = {
  VITORIA: { rotulo: 'vitória', classe: 'etiqueta--sucesso' },
  EMPATE: { rotulo: 'empate', classe: 'etiqueta--alerta' },
  DERROTA: { rotulo: 'derrota', classe: 'etiqueta--perigo' },
  PENDENTE: { rotulo: 'a jogar', classe: '' },
}

type Filtro = 'TODOS' | 'PROXIMOS' | 'DISPUTADOS'

/**
 * Os jogos da atlética.
 *
 * <p>Inclui o que não está dentro de campeonato: amistoso, treino contra
 * outra atlética, jogo de preparação. Se só o chaveamento contasse, metade
 * da temporada esportiva ficaria sem registro — e é justamente essa metade
 * que some entre uma gestão e outra.</p>
 */
export function Jogos() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [marcando, setMarcando] = useState(false)
  const [comSumula, setComSumula] = useState<Jogo | null>(null)

  const jogos = useBusca<Jogo[]>(() => Dados.jogos(slug), [slug])

  /** Troca um jogo na lista sem refazer a busca. */
  const substituir = (j: Jogo) => jogos.definir(
    (jogos.dados ?? []).map((x) => (x.id === j.id ? j : x)))

  return (
    <div>
      <CabecalhoDePagina
        titulo="Jogos"
        descricao="Amistosos, jogos de campeonato e o resultado de cada um."
        acoes={diretor ? (
          <button className="botao" onClick={() => setMarcando((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Marcar jogo
          </button>
        ) : undefined}
      />

      <Previa oQueFalta="Marcar jogo e registrar súmula ainda não chegam ao servidor." />

      {marcando ? (
        <FormularioDeJogo
          slug={slug}
          aoMarcar={(j) => {
            jogos.definir([j, ...(jogos.dados ?? [])])
            setMarcando(false)
          }}
          aoCancelar={() => setMarcando(false)}
        />
      ) : null}

      {comSumula ? (
        <FormularioDeSumula
          jogo={comSumula}
          aoRegistrar={(j) => { substituir(j); setComSumula(null) }}
          aoCancelar={() => setComSumula(null)}
        />
      ) : null}

      <Conteudo busca={jogos} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="jogos" titulo="Nenhum jogo registrado">
                <p className="fraco">
                  Marque um amistoso pela seção Amistosos da rede: outra atlética
                  já está procurando adversário na sua modalidade.
                </p>
              </EstadoVazio>
            )
          }

          const disputados = lista.filter((j) => j.resultado !== 'PENDENTE')
          const vitorias = disputados.filter((j) => j.resultado === 'VITORIA').length
          const agora = Date.now()

          const visiveis = lista
            .filter((j) => {
              if (filtro === 'PROXIMOS') return new Date(j.inicioEm).getTime() >= agora
              if (filtro === 'DISPUTADOS') return j.resultado !== 'PENDENTE'
              return true
            })
            .sort((a, b) => b.inicioEm.localeCompare(a.inicioEm))

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Jogos no ano" icone="jogos" valor={lista.length} />
                <Metrica rotulo="Vitórias" icone="certo" valor={vitorias}
                         cor="var(--sucesso)" />
                <Metrica
                  rotulo="Aproveitamento" icone="resultados"
                  valor={disputados.length === 0
                    ? '—' : percentual(vitorias / disputados.length)}
                  detalhe={`${plural(disputados.length, 'jogo')} `
                    + `${disputados.length === 1 ? 'disputado' : 'disputados'}`}
                />
                <Metrica rotulo="Marcados" icone="calendario"
                         valor={lista.filter(
                           (j) => new Date(j.inicioEm).getTime() >= agora).length} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Filtro de jogos"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todos', contagem: lista.length },
                    { valor: 'PROXIMOS', rotulo: 'Próximos',
                      contagem: lista.filter(
                        (j) => new Date(j.inicioEm).getTime() >= agora).length },
                    { valor: 'DISPUTADOS', rotulo: 'Disputados',
                      contagem: disputados.length },
                  ]}
                />
              </div>

              <Secao>
                <div className="pilha pilha--densa">
                  {visiveis.map((j) => {
                    const adversaria = j.adversarioAtleticaSlug
                      ? atleticaPorSlug(j.adversarioAtleticaSlug) : undefined
                    const futuro = new Date(j.inicioEm).getTime() >= agora

                    return (
                      <div key={j.id}
                           className={`cartao${futuro ? ' cartao--destacado' : ''}`}>
                        <div className="linha entre" style={{ marginBottom: '0.55rem' }}>
                          <div className="linha" style={{ gap: '0.35rem' }}>
                            <span className="etiqueta">{j.modalidade}</span>
                            {j.competicao ? (
                              <span className="etiqueta etiqueta--acento">{j.competicao}</span>
                            ) : null}
                          </div>
                          <span className="fraco">{quando(j.inicioEm)}</span>
                        </div>

                        <div className="linha entre" style={{ gap: '1rem' }}>
                          <div className="linha" style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ minWidth: 0 }}>
                              <strong>{j.equipeNome}</strong>
                              <div className="fraco">nossa equipe</div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            {j.resultado === 'PENDENTE' ? (
                              <span className="fraco">×</span>
                            ) : (
                              <div className="numero-medio">
                                {j.placarNos} × {j.placarDeles}
                              </div>
                            )}
                            <span className={`etiqueta ${RESULTADO[j.resultado].classe}`}>
                              {RESULTADO[j.resultado].rotulo}
                            </span>
                          </div>

                          <div className="linha" style={{ flex: 1, minWidth: 0,
                                                          justifyContent: 'flex-end' }}>
                            <div style={{ minWidth: 0, textAlign: 'right' }}>
                              <strong>{j.adversario}</strong>
                              <div className="fraco">
                                {adversaria?.nome ?? 'adversário'}
                              </div>
                            </div>
                            {adversaria ? (
                              <Brasao atletica={adversaria} tamanho="p" />
                            ) : null}
                          </div>
                        </div>

                        <div className="linha entre" style={{ marginTop: '0.7rem' }}>
                          <span className="fraco">
                            {dataEHora(j.inicioEm)}
                            {j.local ? ` · ${j.local}` : ''}
                          </span>
                          {diretor ? (
                            <button
                              className="botao botao--fantasma botao--pequeno"
                              onClick={() => setComSumula(j)}
                            >
                              {j.resultado === 'PENDENTE'
                                ? 'Registrar súmula' : 'Corrigir placar'}
                            </button>
                          ) : null}
                        </div>

                        {j.destaques.length > 0 ? (
                          <>
                            <hr className="divisor" />
                            <div className="linha" style={{ gap: '0.35rem' }}>
                              {j.destaques.map((d) => (
                                <span key={d} className="etiqueta">{d}</span>
                              ))}
                            </div>
                          </>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

/**
 * Marcar um jogo.
 *
 * <p>A equipe sai da lista cadastrada, e não de campo livre: jogo lançado
 * com o nome digitado errado não aparece na ficha da equipe nem no
 * aproveitamento dela, e ninguém descobre por quê.</p>
 */
function FormularioDeJogo({ slug, aoMarcar, aoCancelar }: {
  slug: string
  aoMarcar: (jogo: Jogo) => void
  aoCancelar: () => void
}) {
  const equipes = useBusca<Equipe[]>(() => Dados.equipes(slug), [slug])
  const [equipeId, setEquipeId] = useState('')
  const [adversario, setAdversario] = useState('')
  const [inicioEm, setInicioEm] = useState(emUmaSemana())
  const [local, setLocal] = useState('')
  const [competicao, setCompeticao] = useState('')
  const [salvando, setSalvando] = useState(false)

  const lista = equipes.dados ?? []
  const escolhida = lista.find((e) => e.id === equipeId) ?? lista[0]

  if (!equipes.carregando && lista.length === 0) {
    return (
      <div className="aviso aviso--alerta" style={{ marginBottom: '1.4rem' }}>
        <strong>Cadastre uma equipe primeiro</strong>
        <p className="fraco" style={{ margin: '0.3rem 0 0.7rem' }}>
          O jogo pertence a uma equipe da atlética — é assim que ele entra no
          aproveitamento dela e no calendário de quem joga.
        </p>
        <div className="linha">
          <Link to={`/hub/${slug}/equipes`} className="botao botao--pequeno">
            Ir para as equipes
          </Link>
          <button className="botao botao--fantasma botao--pequeno" onClick={aoCancelar}>
            Fechar
          </button>
        </div>
      </div>
    )
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!escolhida) return
    setSalvando(true)
    const jogo = await Dados.marcarJogo(slug, {
      modalidade: escolhida.modalidade,
      equipeNome: escolhida.nome,
      adversario: adversario.trim(),
      adversarioAtleticaSlug: null,
      inicioEm: new Date(inicioEm).toISOString(),
      local: local.trim() === '' ? null : local.trim(),
      competicao: competicao.trim() === '' ? null : competicao.trim(),
    })
    setSalvando(false)
    aoMarcar(jogo)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Marcar jogo</h3>
      <p className="fraco">
        Entra na agenda sem placar. A súmula você registra depois de jogado —
        é o mesmo cartão.
      </p>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Nossa equipe</span>
          <select value={escolhida?.id ?? ''}
                  onChange={(e) => setEquipeId(e.target.value)}>
            {lista.map((e) => (
              <option key={e.id} value={e.id}>{e.nome} · {e.modalidade}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Adversário</span>
          <input value={adversario} onChange={(e) => setAdversario(e.target.value)}
                 required maxLength={120} placeholder="Atlética Leões" />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Quando</span>
          <input type="datetime-local" value={inicioEm} required
                 onChange={(e) => setInicioEm(e.target.value)} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Local (opcional)</span>
          <input value={local} onChange={(e) => setLocal(e.target.value)}
                 maxLength={120} placeholder="Ginásio da Engenharia" />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Competição (opcional)</span>
        <input value={competicao} onChange={(e) => setCompeticao(e.target.value)}
               maxLength={120} placeholder="Interatlética de Primavera" />
        <span className="campo__dica">Deixe em branco se for amistoso.</span>
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !adversario.trim() || !escolhida}>
          {salvando ? 'Marcando…' : 'Marcar jogo'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/**
 * A súmula.
 *
 * <p>O resultado não é escolhido: sai do placar. Deixar marcar "vitória" com
 * placar de derrota é como a tabela de um campeonato passa a discordar dos
 * jogos que a formaram.</p>
 */
function FormularioDeSumula({ jogo, aoRegistrar, aoCancelar }: {
  jogo: Jogo
  aoRegistrar: (jogo: Jogo) => void
  aoCancelar: () => void
}) {
  const [nos, setNos] = useState(String(jogo.placarNos ?? 0))
  const [deles, setDeles] = useState(String(jogo.placarDeles ?? 0))
  const [destaques, setDestaques] = useState(jogo.destaques.join(', '))
  const [salvando, setSalvando] = useState(false)

  const a = Number(nos) || 0
  const b = Number(deles) || 0
  const previsto = a > b ? 'vitória' : a < b ? 'derrota' : 'empate'

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const atualizado = await Dados.registrarSumula(jogo.id, a, b,
      destaques.split(',').map((x) => x.trim()).filter((x) => x !== ''))
    setSalvando(false)
    if (atualizado) aoRegistrar(atualizado)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Súmula — {jogo.equipeNome} × {jogo.adversario}</h3>

      <div className="linha" style={{ gap: '0.8rem', alignItems: 'flex-end' }}>
        <label className="campo" style={{ flex: 1 }}>
          <span className="campo__rotulo">{jogo.equipeNome}</span>
          <input type="number" min={0} value={nos} required
                 onChange={(e) => setNos(e.target.value)} />
        </label>
        <span className="fraco" style={{ paddingBottom: '0.9rem' }}>×</span>
        <label className="campo" style={{ flex: 1 }}>
          <span className="campo__rotulo">{jogo.adversario}</span>
          <input type="number" min={0} value={deles} required
                 onChange={(e) => setDeles(e.target.value)} />
        </label>
      </div>

      <p className="fraco">
        Com este placar o jogo entra como <strong>{previsto}</strong>. O
        resultado sai do placar; não há como marcar um e escrever outro.
      </p>

      <label className="campo">
        <span className="campo__rotulo">Destaques (opcional)</span>
        <input value={destaques} onChange={(e) => setDestaques(e.target.value)}
               maxLength={200} placeholder="Marina Alves (2 gols), virada no 2º tempo" />
        <span className="campo__dica">Separe por vírgula.</span>
      </label>

      <div className="linha">
        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? 'Registrando…' : 'Registrar súmula'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/** Padrão do campo de data: daqui a uma semana, às 19h, em horário local. */
function emUmaSemana(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setHours(19, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    + `T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
