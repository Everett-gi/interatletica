import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Meta } from '../../../api/tipos-gestao'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, percentual, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * As metas da gestão.
 *
 * <p>Toda meta aqui tem número e prazo. "Melhorar a comunicação" não é meta,
 * é intenção — e intenção não se cobra na assembleia nem se passa para a
 * gestão seguinte. Três a seis metas com número valem mais que vinte
 * declarações de propósito.</p>
 */
export function Metas() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const presidente = podeAtuarComo(slug, 'PRESIDENTE')
  const metas = useBusca<Meta[]>(() => Dados.metas(slug), [slug])
  const [compondo, setCompondo] = useState(false)

  return (
    <div>
      <CabecalhoDePagina
        titulo="Metas"
        descricao="O que esta gestão se comprometeu a entregar, com número e prazo."
        acoes={presidente ? (
          <button className="botao" onClick={() => setCompondo((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Nova meta
          </button>
        ) : undefined}
      />

      {compondo ? (
        <FormularioDeMeta
          slug={slug}
          aoCriar={(meta) => {
            metas.definir([...(metas.dados ?? []), meta])
            setCompondo(false)
          }}
          aoCancelar={() => setCompondo(false)}
        />
      ) : null}

      <Conteudo
        busca={metas}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="9rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="metas" titulo="Nenhuma meta definida">
                <p className="fraco">
                  Defina de três a seis metas com número. É o que permite dizer,
                  no fim do ano, se a gestão entregou o que prometeu.
                </p>
                {presidente && !compondo ? (
                  <button className="botao" onClick={() => setCompondo(true)}>
                    <Icone nome="mais" tamanho={16} /> Definir a primeira meta
                  </button>
                ) : null}
              </EstadoVazio>
            )
          }

          const atingidas = lista.filter((m) => m.atual >= m.alvo).length
          const medio = lista.reduce(
            (s, m) => s + Math.min(1, m.atual / m.alvo), 0) / lista.length

          const areas = [...new Set(lista.map((m) => m.area))]

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.6rem' }}>
                <Metrica rotulo="Metas definidas" icone="metas" valor={lista.length} />
                <Metrica rotulo="Já atingidas" icone="certo" valor={atingidas}
                         cor={atingidas > 0 ? 'var(--sucesso)' : undefined} />
                <Metrica rotulo="Progresso médio" icone="resultados"
                         valor={percentual(medio)} />
                <Metrica rotulo="Áreas cobertas" icone="grade" valor={areas.length} />
              </div>

              {areas.map((area) => (
                <Secao key={area} titulo={area}>
                  <div className="grade grade--larga">
                    {lista.filter((m) => m.area === area).map((meta) => (
                      <CartaoDeMeta
                        key={meta.id}
                        meta={meta}
                        editavel={presidente}
                        aoAtualizar={(atualizada) => metas.definir(
                          (metas.dados ?? []).map(
                            (m) => (m.id === atualizada.id ? atualizada : m)))}
                      />
                    ))}
                  </div>
                </Secao>
              ))}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function CartaoDeMeta({ meta, editavel, aoAtualizar }: {
  meta: Meta
  editavel: boolean
  aoAtualizar: (meta: Meta) => void
}) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState(String(meta.atual))
  const proporcao = meta.atual / meta.alvo
  const atingida = proporcao >= 1
  const formatar = (valor: number) =>
    meta.unidade === 'reais' ? dinheiro(valor)
      : meta.unidade === '%' ? `${valor}%`
      : `${valor} ${meta.unidade}`

  return (
    <div className={`cartao${atingida ? ' cartao--destacado' : ''}`}>
      <div className="linha entre" style={{ marginBottom: '0.45rem' }}>
        <strong>{meta.titulo}</strong>
        {atingida ? (
          <span className="etiqueta etiqueta--sucesso">atingida</span>
        ) : null}
      </div>

      <div className="linha entre" style={{ alignItems: 'baseline',
                                            marginBottom: '0.55rem' }}>
        <span className="numero-medio">{formatar(meta.atual)}</span>
        <span className="fraco">de {formatar(meta.alvo)}</span>
      </div>

      <Progresso
        proporcao={proporcao}
        tom={atingida ? 'sucesso' : proporcao < 0.4 ? 'alerta' : undefined}
      />

      <div className="linha entre" style={{ marginTop: '0.55rem' }}>
        <span className="fraco">{percentual(proporcao)}</span>
        {meta.prazo ? (
          <span className="fraco">prazo {quando(meta.prazo)}</span>
        ) : null}
      </div>

      {/* O número não se move sozinho, e é essa a intenção: indicador que se
          atualiza sem ninguém olhar é indicador que ninguém confere. */}
      {editavel ? (
        editando ? (
          <div className="linha" style={{ marginTop: '0.7rem' }}>
            <input
              type="number" min={0} value={valor} autoFocus
              onChange={(e) => setValor(e.target.value)}
              aria-label={`Progresso de ${meta.titulo}`}
              style={{ width: '7rem' }}
            />
            <button
              className="botao botao--pequeno"
              onClick={() => {
                void Dados.atualizarProgressoDaMeta(meta.id, Number(valor) || 0)
                  .then((atualizada) => {
                    if (atualizada) aoAtualizar(atualizada)
                    setEditando(false)
                  })
              }}
            >
              Salvar
            </button>
            <button className="botao botao--fantasma botao--pequeno"
                    onClick={() => { setValor(String(meta.atual)); setEditando(false) }}>
              Cancelar
            </button>
          </div>
        ) : (
          <button
            className="botao botao--fantasma botao--pequeno"
            style={{ marginTop: '0.7rem' }}
            onClick={() => setEditando(true)}
          >
            Atualizar o número
          </button>
        )
      ) : null}
    </div>
  )
}

const AREAS_DE_META = [
  'Pessoas', 'Financeiro', 'Eventos', 'Esportes', 'Comunicação', 'Rede', 'Geral',
]

const UNIDADES = [
  { valor: 'membros', rotulo: 'membros' },
  { valor: 'reais', rotulo: 'reais' },
  { valor: '%', rotulo: 'por cento' },
  { valor: 'eventos', rotulo: 'eventos' },
  { valor: 'atletas', rotulo: 'atletas' },
  { valor: 'pessoas', rotulo: 'pessoas' },
]

/**
 * O formulário exige alvo e unidade.
 *
 * <p>São os dois campos que separam meta de intenção. Sem eles não há barra
 * de progresso para desenhar nem resposta para dar em dezembro.</p>
 */
function FormularioDeMeta({ slug, aoCriar, aoCancelar }: {
  slug: string
  aoCriar: (meta: Meta) => void
  aoCancelar: () => void
}) {
  const [titulo, setTitulo] = useState('')
  const [area, setArea] = useState(AREAS_DE_META[0])
  const [alvo, setAlvo] = useState('')
  const [unidade, setUnidade] = useState(UNIDADES[0].valor)
  const [prazo, setPrazo] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const meta = await Dados.criarMeta(slug, {
      titulo: titulo.trim(),
      area,
      alvo: Number(alvo) || 0,
      unidade,
      prazo: prazo === '' ? null : new Date(`${prazo}T23:59:00`).toISOString(),
    })
    setSalvando(false)
    aoCriar(meta)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Nova meta</h3>
      <p className="fraco">
        Escreva o que dá para conferir. "Chegar a 180 membros ativos" fecha o
        ano com sim ou não; "fortalecer a base" fecha com discussão.
      </p>

      <label className="campo">
        <span className="campo__rotulo">A meta</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               required maxLength={140} autoFocus
               placeholder="Chegar a 180 membros ativos" />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Área</span>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS_DE_META.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Prazo (opcional)</span>
          <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Alvo</span>
          <input type="number" min={1} value={alvo} required
                 onChange={(e) => setAlvo(e.target.value)} placeholder="180" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Unidade</span>
          <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
            {UNIDADES.map((u) => (
              <option key={u.valor} value={u.valor}>{u.rotulo}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !titulo.trim() || !alvo}>
          {salvando ? 'Salvando…' : 'Criar meta'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
