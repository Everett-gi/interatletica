import { useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type {
  AreaDeConhecimento,
  PedidoDeAjuda,
  StatusDoPedido,
} from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

export const AREA: Record<AreaDeConhecimento, string> = {
  GESTAO: 'Gestão',
  EVENTOS: 'Eventos',
  ESPORTES: 'Esportes',
  FINANCEIRO: 'Financeiro',
  MARKETING: 'Marketing',
  PATROCINIO: 'Patrocínio',
  PESSOAS: 'Pessoas',
  DOCUMENTACAO: 'Documentação',
  JURIDICO: 'Jurídico',
  TECNOLOGIA: 'Tecnologia',
}

const STATUS: Record<StatusDoPedido, { rotulo: string; classe: string }> = {
  ABERTO: { rotulo: 'sem resposta', classe: 'etiqueta--alerta' },
  RESPONDIDO: { rotulo: 'respondido', classe: 'etiqueta--acento' },
  RESOLVIDO: { rotulo: 'resolvido', classe: 'etiqueta--sucesso' },
  ARQUIVADO: { rotulo: 'arquivado', classe: '' },
}

type Filtro = 'TODOS' | AreaDeConhecimento

/**
 * Os pedidos de ajuda (§35).
 *
 * <p>É a porta de entrada do núcleo do produto: uma atlética não precisa
 * descobrir sozinha o que outra já aprendeu. O ciclo completo do fluxo 4 do
 * planejamento acontece aqui — perguntar, receber resposta, marcar a mais
 * útil e transformar aquilo em experiência registrada.</p>
 */
export function PedidosDeAjuda() {
  const { slug = '' } = useParams()
  const [parametros] = useSearchParams()
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [compondo, setCompondo] = useState(parametros.get('novo') === '1')

  const pedidos = useBusca<PedidoDeAjuda[]>(() => Dados.pedidosDeAjuda(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Pedidos de ajuda"
        descricao="Pergunte para quem já passou por isso. E responda quando já tiver passado."
        acoes={
          <button className="botao" onClick={() => setCompondo((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Criar pedido
          </button>
        }
      />

      {compondo ? (
        <FormularioDePedido
          slug={slug}
          aoCriar={(pedido) => {
            pedidos.definir([pedido, ...(pedidos.dados ?? [])])
            setCompondo(false)
          }}
          aoCancelar={() => setCompondo(false)}
        />
      ) : null}

      <Conteudo
        busca={pedidos}
        esqueleto={
          <div className="pilha pilha--densa">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="8rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="ajuda" titulo="Nenhum pedido aberto">
                <p className="fraco">
                  Seja a primeira a perguntar. Quase toda dúvida de atlética já
                  foi resolvida por outra — o problema é que ninguém escreveu.
                </p>
              </EstadoVazio>
            )
          }

          const abertos = lista.filter((p) => p.status === 'ABERTO')
          const resolvidos = lista.filter((p) => p.status === 'RESOLVIDO')
          const respostas = lista.reduce((s, p) => s + p.respostas.length, 0)

          const visiveis = filtro === 'TODOS'
            ? lista
            : lista.filter((p) => p.area === filtro)

          const contar = (a: AreaDeConhecimento) =>
            lista.filter((p) => p.area === a).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Pedidos" icone="ajuda" valor={lista.length} />
                <Metrica rotulo="Sem resposta" icone="alerta" valor={abertos.length}
                         cor={abertos.length > 0 ? 'var(--alerta)' : undefined}
                         detalhe="talvez você saiba responder" />
                <Metrica rotulo="Respostas" icone="comunidades" valor={respostas} />
                <Metrica rotulo="Resolvidos" icone="certo" valor={resolvidos.length} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Áreas"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(AREA) as AreaDeConhecimento[])
                      .filter((a) => contar(a) > 0)
                      .map((a) => ({
                        valor: a as Filtro,
                        rotulo: AREA[a],
                        contagem: contar(a),
                      })),
                  ]}
                />
              </div>

              {abertos.length > 0 && filtro === 'TODOS' ? (
                <Secao
                  titulo="Esperando resposta"
                  descricao="Se a sua atlética já resolveu algo assim, dois minutos aqui poupam semanas de outra."
                >
                  <div className="pilha pilha--densa">
                    {abertos.map((p) => (
                      <CartaoDePedido key={p.id} pedido={p} slug={slug} destaque />
                    ))}
                  </div>
                </Secao>
              ) : null}

              <Secao titulo={filtro === 'TODOS' ? 'Todos os pedidos' : AREA[filtro]}>
                <div className="pilha pilha--densa">
                  {visiveis.map((p) => (
                    <CartaoDePedido key={p.id} pedido={p} slug={slug} />
                  ))}
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function CartaoDePedido({ pedido, slug, destaque = false }: {
  pedido: PedidoDeAjuda
  slug: string
  destaque?: boolean
}) {
  return (
    <Link
      to={`/hub/${slug}/rede/ajuda/${pedido.id}`}
      className={`cartao cartao--clicavel${destaque ? ' cartao--destacado' : ''}`}
    >
      <div className="linha entre" style={{ marginBottom: '0.45rem' }}>
        <span className="etiqueta">{AREA[pedido.area]}</span>
        <span className={`etiqueta ${STATUS[pedido.status].classe}`}>
          {STATUS[pedido.status].rotulo}
        </span>
      </div>

      <h3 style={{ marginBottom: '0.3rem' }}>{pedido.titulo}</h3>
      <p className="fraco" style={{ marginBottom: '0.8rem' }}>{pedido.corpo}</p>

      <div className="linha entre">
        <div className="linha" style={{ gap: '0.45rem', minWidth: 0 }}>
          <Brasao atletica={pedido.atletica} tamanho="p" />
          <span className="fraco">
            {pedido.atletica.nome} · {quando(pedido.abertoEm)}
          </span>
        </div>
        <span className="fraco">
          {pedido.respostas.length}{' '}
          {pedido.respostas.length === 1 ? 'resposta' : 'respostas'}
        </span>
      </div>
    </Link>
  )
}

function FormularioDePedido({ slug, aoCriar, aoCancelar }: {
  slug: string
  aoCriar: (pedido: PedidoDeAjuda) => void
  aoCancelar: () => void
}) {
  const { perfil, vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica
  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')
  const [area, setArea] = useState<AreaDeConhecimento>('GESTAO')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!minha || !perfil) return
    setEnviando(true)
    const pedido = await Dados.criarPedidoDeAjuda(
      minha, perfil.nome, titulo.trim(), corpo.trim(), area)
    setEnviando(false)
    aoCriar(pedido)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Novo pedido de ajuda</h3>
      <p className="fraco">
        Pergunta específica recebe resposta específica. “Como organizar evento?”
        rende conselho genérico; “quanto vocês cobram de cota num interatlética
        de quatro atléticas?” rende número.
      </p>

      <label className="campo">
        <span className="campo__rotulo">Pergunta</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               required maxLength={160}
               placeholder="Como vocês controlam a elegibilidade dos atletas?" />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Contexto</span>
        <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)} required
                  placeholder="Quantos atletas, quais modalidades, o que já tentaram." />
        <span className="campo__dica">
          Quanto mais contexto, mais útil a resposta. Diga o tamanho da atlética
          e o que já foi tentado.
        </span>
      </label>

      <label className="campo">
        <span className="campo__rotulo">Área</span>
        <select value={area} onChange={(e) => setArea(e.target.value as AreaDeConhecimento)}>
          {(Object.keys(AREA) as AreaDeConhecimento[]).map((a) => (
            <option key={a} value={a}>{AREA[a]}</option>
          ))}
        </select>
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={enviando || !titulo.trim() || !corpo.trim()}>
          {enviando ? 'Publicando…' : 'Publicar para a rede'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
