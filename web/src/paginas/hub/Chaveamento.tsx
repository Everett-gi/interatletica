import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Partida, ParticipanteDoTorneio, Torneio } from '../../api/tipos-rede'
import {
  Carregando,
  Dialogo,
  MensagemDeErro,
  useBusca,
  Vazio,
} from '../../ui/componentes'
import { Previa } from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
import { dataEHora } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

/**
 * O chaveamento.
 *
 * <p>É o que a coluna `proxima_partida_id` + `slot_proximo` existe para
 * desenhar: sem esse par, o banco teria uma lista solta de partidas e a
 * navegação entre rodadas viraria adivinhação. Com ele, registrar o placar
 * de uma quartas move o vencedor para o slot certo da semifinal
 * automaticamente — que é o que acontece ao salvar aqui.</p>
 */
export function Chaveamento() {
  const { slug = '', eventoId = '' } = useParams()
  const { vinculo, podeAtuarComo } = useSessao()
  useCorDaAtletica(vinculo(slug)?.atletica.corPrimaria)

  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const busca = useBusca<Torneio | null>(
    () => Dados.torneioDoEvento(eventoId), [eventoId])
  const [emEdicao, setEmEdicao] = useState<Partida | null>(null)

  if (busca.carregando) return <Carregando />
  if (busca.erro) return <MensagemDeErro erro={busca.erro} />
  if (!busca.dados) return <Vazio titulo="Torneio não encontrado" />

  const torneio = busca.dados
  const rodadas = agruparPorRodada(torneio.partidas)
  const porId = new Map(torneio.participantes.map((p) => [p.id, p]))

  return (
    <div className="pilha">
      <header>
        <Link to={`/hub/${slug}/eventos/${eventoId}`} className="fraco">
          ← Voltar ao evento
        </Link>
        <h1 style={{ marginTop: '0.3rem' }}>{torneio.nome}</h1>
        <div className="fraco">
          {torneio.modalidade} · {torneio.participantes.length} participantes
        </div>
      </header>

      <Previa oQueFalta="Registrar placar ainda não chega ao servidor." />

      <div className="chave">
        {rodadas.map(({ rodada, partidas }) => (
          <div key={rodada} className="chave__rodada">
            <div className="chave__titulo">{nomeDaRodada(rodada, rodadas.length)}</div>
            {partidas.map((partida) => (
              <Confronto
                key={partida.id}
                partida={partida}
                porId={porId}
                aoEditar={diretor ? () => setEmEdicao(partida) : undefined}
              />
            ))}
          </div>
        ))}
      </div>

      <Classificacao participantes={torneio.participantes} />

      {emEdicao ? (
        <DialogoDePlacar
          torneioId={torneio.id}
          partida={emEdicao}
          porId={porId}
          aoFechar={() => setEmEdicao(null)}
          aoSalvar={(atualizado) => {
            busca.definir(atualizado)
            setEmEdicao(null)
          }}
        />
      ) : null}
    </div>
  )
}

function agruparPorRodada(partidas: Partida[]) {
  const mapa = new Map<number, Partida[]>()
  partidas.forEach((p) => {
    mapa.set(p.rodada, [...(mapa.get(p.rodada) ?? []), p])
  })
  return [...mapa.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rodada, lista]) => ({
      rodada,
      partidas: lista.sort((a, b) => a.ordem - b.ordem),
    }))
}

/** A última rodada é a final, a penúltima a semi — conta de trás para frente. */
function nomeDaRodada(rodada: number, total: number): string {
  const daFinal = total - rodada
  if (daFinal === 0) return 'Final'
  if (daFinal === 1) return 'Semifinais'
  if (daFinal === 2) return 'Quartas'
  if (daFinal === 3) return 'Oitavas'
  return `${rodada}ª rodada`
}

function Confronto({ partida, porId, aoEditar }: {
  partida: Partida
  porId: Map<string, ParticipanteDoTorneio>
  aoEditar?: () => void
}) {
  const emAndamento = partida.status === 'EM_ANDAMENTO'
  const encerrada = partida.status === 'ENCERRADA'

  const lado = (id: string | null, placar: number | null) => {
    const participante = id ? porId.get(id) : undefined
    const venceu = encerrada && partida.vencedorId === id
    const perdeu = encerrada && partida.vencedorId !== id && id !== null

    return (
      <div className={`confronto__lado ${
        venceu ? 'confronto__lado--vencedor' : perdeu ? 'confronto__lado--perdedor' : ''}`}>
        {participante?.seed ? (
          <span className="fraco" style={{ minWidth: '1rem' }}>{participante.seed}</span>
        ) : null}
        <span className="confronto__nome">
          {participante
            ? participante.nomeExibicao
            : <span className="confronto__vazio">a definir</span>}
        </span>
        <span className="confronto__placar">{placar ?? '–'}</span>
      </div>
    )
  }

  return (
    <div className={`confronto ${emAndamento ? 'confronto--andamento' : ''}`}>
      {lado(partida.participanteAId, partida.placarA)}
      {lado(partida.participanteBId, partida.placarB)}

      <div className="confronto__rodape">
        <span>
          {emAndamento ? '● ao vivo' : partida.inicioEm ? dataEHora(partida.inicioEm) : '—'}
        </span>
        {aoEditar && partida.participanteAId && partida.participanteBId ? (
          <button
            className="botao botao--fantasma botao--pequeno"
            style={{ minHeight: 'auto', padding: '0 0.3rem' }}
            onClick={aoEditar}
          >
            {encerrada ? 'editar' : 'placar'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function DialogoDePlacar({ torneioId, partida, porId, aoFechar, aoSalvar }: {
  torneioId: string
  partida: Partida
  porId: Map<string, ParticipanteDoTorneio>
  aoFechar: () => void
  aoSalvar: (torneio: Torneio) => void
}) {
  const [a, setA] = useState(partida.placarA ?? 0)
  const [b, setB] = useState(partida.placarB ?? 0)
  const [salvando, setSalvando] = useState(false)

  const nomeA = porId.get(partida.participanteAId ?? '')?.nomeExibicao ?? 'A'
  const nomeB = porId.get(partida.participanteBId ?? '')?.nomeExibicao ?? 'B'
  // Melhor de 3 decide em 2; melhor de 5, em 3.
  const vitoriasNecessarias = Math.ceil(partida.melhorDe / 2)
  const valido = a !== b && Math.max(a, b) === vitoriasNecessarias

  async function salvar() {
    setSalvando(true)
    const atualizado = await Dados.registrarPlacar(torneioId, partida.id, a, b)
    setSalvando(false)
    if (atualizado) aoSalvar(atualizado)
  }

  return (
    <Dialogo titulo={partida.rotulo ?? 'Registrar placar'} aoFechar={aoFechar}>
      <p className="fraco">
        Melhor de {partida.melhorDe} — vence quem chegar a {vitoriasNecessarias}.
      </p>

      <div className="pilha pilha--densa">
        <LinhaDePlacar nome={nomeA} valor={a} aoMudar={setA} maximo={vitoriasNecessarias} />
        <LinhaDePlacar nome={nomeB} valor={b} aoMudar={setB} maximo={vitoriasNecessarias} />
      </div>

      {!valido ? (
        <p className="fraco" style={{ marginTop: '0.7rem' }}>
          O vencedor precisa ter exatamente {vitoriasNecessarias}, e não pode
          haver empate.
        </p>
      ) : (
        <div className="aviso aviso--sucesso" style={{ marginTop: '0.7rem' }}>
          {a > b ? nomeA : nomeB} avança
          {partida.proximaPartidaId
            ? ' para o slot ' + partida.slotProximo + ' da próxima partida.'
            : ' — é a final.'}
        </div>
      )}

      <button
        className="botao botao--largo"
        style={{ marginTop: '0.8rem' }}
        disabled={!valido || salvando}
        onClick={() => void salvar()}
      >
        {salvando ? 'Salvando…' : 'Salvar placar'}
      </button>
    </Dialogo>
  )
}

function LinhaDePlacar({ nome, valor, aoMudar, maximo }: {
  nome: string
  valor: number
  aoMudar: (v: number) => void
  maximo: number
}) {
  return (
    <div className="linha entre">
      <span style={{ flex: 1, minWidth: 0 }}>{nome}</span>
      <div className="linha" style={{ gap: '0.3rem' }}>
        <button className="botao botao--discreto botao--pequeno"
                onClick={() => aoMudar(Math.max(0, valor - 1))}
                aria-label={`Diminuir placar de ${nome}`}>−</button>
        <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 700,
                       fontVariantNumeric: 'tabular-nums' }}>
          {valor}
        </span>
        <button className="botao botao--discreto botao--pequeno"
                onClick={() => aoMudar(Math.min(maximo, valor + 1))}
                aria-label={`Aumentar placar de ${nome}`}>+</button>
      </div>
    </div>
  )
}

function Classificacao({ participantes }: { participantes: ParticipanteDoTorneio[] }) {
  const ativos = participantes.filter((p) => p.situacao === 'ATIVO')
  const fora = participantes.filter((p) => p.situacao !== 'ATIVO')

  return (
    <section className="grade">
      <div className="cartao">
        <h3>Ainda na disputa ({ativos.length})</h3>
        <div className="pilha pilha--densa">
          {ativos.map((p) => (
            <div key={p.id} className="linha">
              <span className="fraco" style={{ minWidth: '1.4rem' }}>{p.seed}</span>
              <span>{p.nomeExibicao}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cartao">
        <h3>Eliminados ({fora.length})</h3>
        <div className="pilha pilha--densa">
          {fora.length === 0 ? (
            <span className="fraco">Ninguém eliminado ainda.</span>
          ) : fora.map((p) => (
            <div key={p.id} className="linha fraco">
              <span style={{ minWidth: '1.4rem' }}>{p.seed}</span>
              <span style={{ textDecoration: 'line-through' }}>{p.nomeExibicao}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
