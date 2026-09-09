import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { CompraColetiva, EtapaDaCompra } from '../../../api/tipos-mercado'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Confirmacao,
  EstadoVazio,
  ItemDaLinha,
  LinhaDoTempo,
  Progresso,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, percentual, plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'
import type { AtleticaResumo } from '../../../api/tipos'
import type { Fornecedor } from '../../../api/tipos-mercado'

const ETAPA: Record<EtapaDaCompra, { rotulo: string; classe: string }> = {
  ABERTA: { rotulo: 'Aberta', classe: 'etiqueta--sucesso' },
  FECHANDO: { rotulo: 'Fechando', classe: 'etiqueta--alerta' },
  FECHADA: { rotulo: 'Grupo fechado', classe: 'etiqueta--acento' },
  EM_EXECUCAO: { rotulo: 'Em execução', classe: 'etiqueta--acento' },
  CONCLUIDA: { rotulo: 'Concluída', classe: '' },
  CANCELADA: { rotulo: 'Cancelada', classe: 'etiqueta--perigo' },
}

const FLUXO: { etapa: EtapaDaCompra; rotulo: string }[] = [
  { etapa: 'ABERTA', rotulo: 'Atléticas demonstram interesse' },
  { etapa: 'FECHANDO', rotulo: 'Quantidade mínima próxima' },
  { etapa: 'FECHADA', rotulo: 'Grupo fechado' },
  { etapa: 'EM_EXECUCAO', rotulo: 'Compra executada' },
  { etapa: 'CONCLUIDA', rotulo: 'Resultado registrado' },
]

/**
 * As compras coletivas (§42).
 *
 * <p>É o módulo em que a rede vira dinheiro no bolso da atlética. Cem
 * medalhas custam caro; novecentas medalhas custam 31% menos por unidade. A
 * plataforma não intermedia pagamento nem compra: ela junta o pedido e
 * mostra quanto falta para o grupo fechar.</p>
 */
export function ComprasColetivas() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica
  const [confirmando, setConfirmando] = useState<CompraColetiva | null>(null)
  const [quantidade, setQuantidade] = useState('50')
  const [abrindo, setAbrindo] = useState(false)

  const compras = useBusca<CompraColetiva[]>(() => Dados.comprasColetivas(), [])

  async function participar(compra: CompraColetiva) {
    if (!minha) return
    const atualizada = await Dados.participarDeCompra(
      compra.id, minha, Number(quantidade) || 1)
    if (atualizada) {
      compras.definir(
        (compras.dados ?? []).map((c) => (c.id === compra.id ? atualizada : c)))
    }
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Compras coletivas"
        descricao="Juntar o pedido de várias atléticas para chegar na faixa de desconto por volume."
        acoes={minha ? (
          <button className="botao botao--discreto"
                  onClick={() => setAbrindo((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Abrir compra
          </button>
        ) : undefined}
      />

      {abrindo && minha ? (
        <FormularioDeCompra
          minha={minha}
          aoAbrir={(c) => {
            compras.definir([c, ...(compras.dados ?? [])])
            setAbrindo(false)
          }}
          aoCancelar={() => setAbrindo(false)}
        />
      ) : null}

      <Conteudo
        busca={compras}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1].map((i) => <Esqueleto key={i} altura="16rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="compras" titulo="Nenhuma compra coletiva aberta">
                <p className="fraco">
                  Abra a primeira: uniformes, medalhas e kits de primeiros socorros
                  são os itens em que o volume mais derruba o preço.
                </p>
                {minha && !abrindo ? (
                  <button className="botao" onClick={() => setAbrindo(true)}>
                    <Icone nome="mais" tamanho={16} /> Abrir a primeira
                  </button>
                ) : null}
              </EstadoVazio>
            )
          }

          const abertas = lista.filter(
            (c) => c.etapa === 'ABERTA' || c.etapa === 'FECHANDO')
          const encerradas = lista.filter(
            (c) => c.etapa !== 'ABERTA' && c.etapa !== 'FECHANDO')
          const economiaMedia = encerradas
            .filter((c) => c.economiaPercentual !== null)
            .reduce((s, c, _, arr) => s + (c.economiaPercentual ?? 0) / arr.length, 0)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Compras abertas" icone="compras" valor={abertas.length} />
                <Metrica rotulo="Atléticas envolvidas" icone="rede"
                         valor={new Set(lista.flatMap(
                           (c) => c.interessados.map((i) => i.atletica.slug))).size} />
                <Metrica rotulo="Economia média" icone="financeiro"
                         valor={economiaMedia > 0 ? `${Math.round(economiaMedia)}%` : '—'}
                         detalhe="nas compras já concluídas" />
                <Metrica rotulo="Participando" icone="certo"
                         valor={lista.filter((c) => c.participo).length} />
              </div>

              <Secao titulo="Abertas" descricao="Ainda dá para entrar.">
                {abertas.length === 0 ? (
                  <EstadoVazio titulo="Nenhuma compra aberta no momento" />
                ) : (
                  <div className="grade grade--larga">
                    {abertas.map((c) => (
                      <CartaoDeCompra
                        key={c.id}
                        compra={c}
                        slug={slug}
                        aoParticipar={() => setConfirmando(c)}
                      />
                    ))}
                  </div>
                )}
              </Secao>

              {encerradas.length > 0 ? (
                <Secao titulo="Encerradas" descricao="O que já foi comprado e quanto rendeu.">
                  <div className="pilha pilha--densa">
                    {encerradas.map((c) => (
                      <div key={c.id} className="cartao linha entre">
                        <div style={{ minWidth: 0 }}>
                          <strong>{c.titulo}</strong>
                          <div className="fraco">
                            {c.quantidadeAtual} unidades ·{' '}
                            {plural(c.interessados.length, 'atlética')}
                            {c.fornecedorNome ? ` · ${c.fornecedorNome}` : ''}
                          </div>
                        </div>
                        <div className="linha">
                          {c.economiaPercentual !== null ? (
                            <span className="etiqueta etiqueta--sucesso">
                              −{c.economiaPercentual}% no preço
                            </span>
                          ) : null}
                          <span className={`etiqueta ${ETAPA[c.etapa].classe}`}>
                            {ETAPA[c.etapa].rotulo}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Secao>
              ) : null}

              <Secao titulo="Como funciona">
                <div className="cartao">
                  <LinhaDoTempo>
                    {FLUXO.map((passo, i) => (
                      <ItemDaLinha key={passo.etapa} estado={i === 0 ? 'ativo' : 'pendente'}>
                        <strong style={{ fontSize: '0.92rem' }}>{passo.rotulo}</strong>
                      </ItemDaLinha>
                    ))}
                  </LinhaDoTempo>
                  <p className="fraco" style={{ marginBottom: 0, marginTop: '0.7rem' }}>
                    A plataforma não intermedia pagamento nem entrega. Ela junta o
                    pedido, mostra quanto falta para fechar e registra o resultado —
                    a negociação acontece entre as atléticas e o fornecedor.
                  </p>
                </div>
              </Secao>

              {confirmando ? (
                <Confirmacao
                  titulo={`Entrar na compra de ${confirmando.produto.toLowerCase()}?`}
                  consequencia={
                    `Sua atlética entra no grupo com ${quantidade} unidades. `
                    + 'Isso é uma demonstração de interesse, não um pedido pago: '
                    + 'a negociação e o pagamento acontecem fora da plataforma.'
                  }
                  rotuloDeConfirmar="Demonstrar interesse"
                  perigo={false}
                  aoConfirmar={() => {
                    void participar(confirmando)
                    setConfirmando(null)
                  }}
                  aoCancelar={() => setConfirmando(null)}
                />
              ) : null}

              {/* Campo de quantidade fora do diálogo: o valor precisa existir
                  antes de confirmar, e um input dentro do alerta de confirmação
                  transforma "confirme" em "preencha". */}
              {abertas.length > 0 ? (
                <Secao titulo="Quantas unidades a sua atlética quer?">
                  <div className="cartao linha">
                    <label className="campo" style={{ marginBottom: 0, maxWidth: '12rem' }}>
                      <span className="campo__rotulo">Quantidade</span>
                      <input
                        type="number"
                        min={1}
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                      />
                    </label>
                    <p className="fraco" style={{ flex: 1, minWidth: '14rem', margin: 0 }}>
                      Use este número ao entrar numa compra acima. Dá para revisar
                      com a organizadora antes do grupo fechar.
                    </p>
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

function CartaoDeCompra({ compra, slug, aoParticipar }: {
  compra: CompraColetiva
  slug: string
  aoParticipar: () => void
}) {
  const proporcao = compra.quantidadeAtual / compra.quantidadeMinima
  const faltam = Math.max(0, compra.quantidadeMinima - compra.quantidadeAtual)

  return (
    <div className={`cartao${compra.participo ? ' cartao--destacado' : ''}`}>
      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
        <span className={`etiqueta ${ETAPA[compra.etapa].classe}`}>
          {ETAPA[compra.etapa].rotulo}
        </span>
        <span className="fraco">fecha {quando(compra.prazo)}</span>
      </div>

      <h3 style={{ marginBottom: '0.2rem' }}>{compra.titulo}</h3>
      <div className="fraco" style={{ marginBottom: '0.7rem' }}>{compra.produto}</div>
      <p className="fraco" style={{ marginBottom: '0.9rem' }}>{compra.descricao}</p>

      <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
        <span className="fraco">
          {compra.quantidadeAtual} de {compra.quantidadeMinima} unidades
        </span>
        <strong>{percentual(proporcao)}</strong>
      </div>
      <Progresso proporcao={proporcao} tom={proporcao >= 1 ? 'sucesso' : undefined} />

      {faltam > 0 ? (
        <div className="fraco" style={{ marginTop: '0.4rem' }}>
          Faltam {faltam} unidades para o grupo fechar.
        </div>
      ) : (
        <div className="fraco" style={{ marginTop: '0.4rem' }}>
          Mínimo atingido. A organizadora pode fechar a qualquer momento.
        </div>
      )}

      <hr className="divisor" />

      <div className="linha entre" style={{ marginBottom: '0.7rem' }}>
        <div className="linha" style={{ gap: '0.45rem', minWidth: 0 }}>
          <Brasao atletica={compra.organizadora} tamanho="p" />
          <span className="fraco">organiza: {compra.organizadora.nome}</span>
        </div>
        {compra.precoEstimado !== null ? (
          <span className="etiqueta">
            ~{dinheiro(compra.precoEstimado, true)} / un.
          </span>
        ) : null}
      </div>

      <div className="linha entre">
        <div className="pilha-de-avatares">
          {compra.interessados.slice(0, 6).map((i) => (
            <Brasao key={i.atletica.slug} atletica={i.atletica} tamanho="p" />
          ))}
        </div>
        <span className="fraco">{plural(compra.interessados.length, 'atlética')}</span>
      </div>

      {compra.fornecedorId ? (
        <Link
          to={`/hub/${slug}/mercado/fornecedores/${compra.fornecedorId}`}
          className="fraco"
          style={{ display: 'block', marginTop: '0.6rem' }}
        >
          Fornecedor: {compra.fornecedorNome}
        </Link>
      ) : null}

      {compra.participo ? (
        <div className="aviso aviso--sucesso" style={{ marginTop: '0.9rem' }}>
          Sua atlética já está no grupo.
        </div>
      ) : (
        <button className="botao botao--largo" style={{ marginTop: '0.9rem' }}
                onClick={aoParticipar}>
          Participar
        </button>
      )}
    </div>
  )
}

/**
 * Abrir uma compra coletiva.
 *
 * <p>A quantidade mínima é o coração da coisa: é o número a partir do qual o
 * fornecedor melhora o preço, e é ele que diz a quem chega se vale entrar.
 * Compra sem mínimo declarado é lista de interessados, não compra.</p>
 */
function FormularioDeCompra({ minha, aoAbrir, aoCancelar }: {
  minha: AtleticaResumo
  aoAbrir: (compra: CompraColetiva) => void
  aoCancelar: () => void
}) {
  const fornecedores = useBusca<Fornecedor[]>(() => Dados.fornecedores(), [])
  const [titulo, setTitulo] = useState('')
  const [produto, setProduto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [minimo, setMinimo] = useState('200')
  const [prazo, setPrazo] = useState(emUmMes())
  const [preco, setPreco] = useState('')
  const [fornecedorId, setFornecedorId] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const compra = await Dados.abrirCompraColetiva(minha, {
      titulo: titulo.trim(),
      produto: produto.trim(),
      descricao: descricao.trim(),
      quantidadeMinima: Number(minimo) || 1,
      prazo: new Date(`${prazo}T23:59:00`).toISOString(),
      precoEstimado: preco === '' ? null : Number(preco),
      fornecedorId: fornecedorId === '' ? null : fornecedorId,
    })
    setSalvando(false)
    aoAbrir(compra)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Abrir compra coletiva</h3>
      <p className="fraco">
        Sua atlética organiza e as outras entram com a quantidade delas. A
        negociação com o fornecedor acontece fora daqui — a plataforma junta o
        grupo, não processa pagamento.
      </p>

      <label className="campo">
        <span className="campo__rotulo">Título</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               required maxLength={140} autoFocus
               placeholder="Camisa de torcida para a temporada 2027" />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">O que é</span>
          <input value={produto} onChange={(e) => setProduto(e.target.value)}
                 required maxLength={120} placeholder="Camisa dry-fit personalizada" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Fornecedor (opcional)</span>
          <select value={fornecedorId}
                  onChange={(e) => setFornecedorId(e.target.value)}>
            <option value="">Ainda não escolhido</option>
            {(fornecedores.dados ?? []).map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Detalhes</span>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  required rows={3}
                  placeholder="Modelo, cores, grade de tamanhos e como a arte de cada atlética entra." />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Quantidade mínima</span>
          <input type="number" min={1} value={minimo} required
                 onChange={(e) => setMinimo(e.target.value)} />
          <span className="campo__dica">
            A partir de quanto o preço melhora. É o que decide se alguém entra.
          </span>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Prazo para entrar</span>
          <input type="date" value={prazo} required
                 onChange={(e) => setPrazo(e.target.value)} />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Preço estimado por unidade (opcional)</span>
        <input type="number" min={0} value={preco}
               onChange={(e) => setPreco(e.target.value)} placeholder="42" />
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !titulo.trim() || !produto.trim()
                  || !descricao.trim()}>
          {salvando ? 'Abrindo…' : 'Abrir para a rede'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/** Padrão do prazo: um mês, que é o tempo que costuma levar para juntar gente. */
function emUmMes(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
