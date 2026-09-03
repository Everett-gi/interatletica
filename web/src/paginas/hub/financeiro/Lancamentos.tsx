import { useState, type FormEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type {
  CategoriaFinanceira,
  Lancamento,
  NaturezaDoLancamento,
  SituacaoDoLancamento,
} from '../../../api/tipos-financeiro'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, plural } from '../../../formatos'
import { CATEGORIA } from './Financeiro'

const SITUACAO: Record<SituacaoDoLancamento, { rotulo: string; classe: string }> = {
  CONFIRMADO: { rotulo: 'confirmado', classe: 'etiqueta--sucesso' },
  PREVISTO: { rotulo: 'previsto', classe: 'etiqueta--alerta' },
  ATRASADO: { rotulo: 'atrasado', classe: 'etiqueta--perigo' },
  CANCELADO: { rotulo: 'cancelado', classe: '' },
}

type Filtro = 'TODOS' | SituacaoDoLancamento

/**
 * A lista de receitas ou de despesas.
 *
 * <p>Uma tela para as duas naturezas: o que muda é o sinal e o vocabulário,
 * não o comportamento. Duplicar em dois arquivos garantiria que um dos dois
 * ficasse para trás na primeira melhoria.</p>
 */
export function Lancamentos({ natureza }: { natureza: NaturezaDoLancamento }) {
  const { slug = '' } = useParams()
  const [parametros] = useSearchParams()
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [compondo, setCompondo] = useState(parametros.get('novo') === '1')

  const lancamentos = useBusca<Lancamento[]>(() => Dados.lancamentos(slug), [slug])
  const receita = natureza === 'RECEITA'

  return (
    <div>
      <CabecalhoDePagina
        titulo={receita ? 'Receitas' : 'Despesas'}
        descricao={receita
          ? 'Tudo o que entrou ou está previsto para entrar.'
          : 'Tudo o que saiu ou está comprometido.'}
        trilha={[
          { rotulo: 'Financeiro', para: `/hub/${slug}/financeiro` },
          { rotulo: receita ? 'Receitas' : 'Despesas' },
        ]}
        acoes={
          <button className="botao" onClick={() => setCompondo((v) => !v)}>
            <Icone nome="mais" tamanho={16} />
            {receita ? 'Nova receita' : 'Nova despesa'}
          </button>
        }
      />

      {compondo ? (
        <FormularioDeLancamento
          slug={slug}
          natureza={natureza}
          aoRegistrar={(novo) => {
            lancamentos.definir([novo, ...(lancamentos.dados ?? [])])
            setCompondo(false)
          }}
          aoCancelar={() => setCompondo(false)}
        />
      ) : null}

      <Conteudo busca={lancamentos} esqueleto={<Esqueleto altura="16rem" />}>
        {(todos) => {
          const daNatureza = todos.filter((l) => l.natureza === natureza)

          if (daNatureza.length === 0) {
            return (
              <EstadoVazio
                icone={receita ? 'receitas' : 'despesas'}
                titulo={receita ? 'Nenhuma receita registrada' : 'Nenhuma despesa registrada'}
              >
                <p className="fraco">
                  Uma linha por fato, não por comprovante. Cinco notas do mesmo
                  fornecedor no mesmo evento viram um lançamento só.
                </p>
              </EstadoVazio>
            )
          }

          const confirmados = daNatureza.filter((l) => l.situacao === 'CONFIRMADO')
          const previstos = daNatureza.filter(
            (l) => l.situacao === 'PREVISTO' || l.situacao === 'ATRASADO')
          const atrasados = daNatureza.filter((l) => l.situacao === 'ATRASADO')

          const visiveis = filtro === 'TODOS'
            ? daNatureza
            : daNatureza.filter((l) => l.situacao === filtro)

          const contar = (f: Filtro) => f === 'TODOS'
            ? daNatureza.length
            : daNatureza.filter((l) => l.situacao === f).length

          const somar = (lista: Lancamento[]) =>
            lista.reduce((s, l) => s + l.valor, 0)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica
                  rotulo={receita ? 'Recebido' : 'Pago'}
                  icone={receita ? 'receitas' : 'despesas'}
                  valor={dinheiro(somar(confirmados))}
                  cor={receita ? 'var(--sucesso)' : undefined}
                />
                <Metrica
                  rotulo={receita ? 'A receber' : 'A pagar'} icone="relogio"
                  valor={dinheiro(somar(previstos))}
                />
                <Metrica
                  rotulo="Em atraso" icone="alerta" valor={dinheiro(somar(atrasados))}
                  cor={atrasados.length > 0 ? 'var(--perigo)' : undefined}
                  detalhe={plural(atrasados.length, 'lançamento')}
                />
                <Metrica rotulo="Lançamentos" icone="lista" valor={daNatureza.length} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Situação dos lançamentos"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todos', contagem: contar('TODOS') },
                    { valor: 'CONFIRMADO', rotulo: 'Confirmados',
                      contagem: contar('CONFIRMADO') },
                    { valor: 'PREVISTO', rotulo: 'Previstos', contagem: contar('PREVISTO') },
                    { valor: 'ATRASADO', rotulo: 'Atrasados', contagem: contar('ATRASADO') },
                  ]}
                />
              </div>

              <Secao>
                <div className="rolagem">
                  <table className="tabela-cartoes">
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Competência</th>
                        <th>Situação</th>
                        <th className="numero">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiveis.map((l) => (
                        <tr key={l.id}>
                          <td data-rotulo="Descrição">
                            <div style={{ fontWeight: 550 }}>{l.descricao}</div>
                            {l.eventoTitulo ? (
                              <div className="fraco">{l.eventoTitulo}</div>
                            ) : null}
                            {l.observacao ? (
                              <div className="fraco">{l.observacao}</div>
                            ) : null}
                          </td>
                          <td data-rotulo="Categoria">{CATEGORIA[l.categoria]}</td>
                          <td data-rotulo="Competência">{l.competencia}</td>
                          <td data-rotulo="Situação">
                            <span className={`etiqueta ${SITUACAO[l.situacao].classe}`}>
                              {SITUACAO[l.situacao].rotulo}
                            </span>
                          </td>
                          <td data-rotulo="Valor" className="numero">
                            <span className={`dinheiro dinheiro--${
                              receita ? 'positivo' : 'negativo'}`}>
                              {receita ? '+' : '−'}{dinheiro(l.valor, true)}
                            </span>
                            {l.comprovanteNome ? (
                              <div className="fraco">
                                <Icone nome="documentos" tamanho={12} /> comprovante
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function FormularioDeLancamento({ slug, natureza, aoRegistrar, aoCancelar }: {
  slug: string
  natureza: NaturezaDoLancamento
  aoRegistrar: (lancamento: Lancamento) => void
  aoCancelar: () => void
}) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState<CategoriaFinanceira>('OUTRO')
  const [situacao, setSituacao] = useState<SituacaoDoLancamento>('CONFIRMADO')
  const [salvando, setSalvando] = useState(false)

  const hoje = new Date()
  const competencia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const criado = await Dados.registrarLancamento(slug, {
      natureza,
      descricao: descricao.trim(),
      categoria,
      valor: Number(valor.replace(',', '.')),
      competencia,
      situacao,
      eventoId: null,
      eventoTitulo: null,
      projetoId: null,
      responsavelNome: null,
      comprovanteNome: null,
      observacao: null,
    })
    setSalvando(false)
    aoRegistrar(criado)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.3rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>{natureza === 'RECEITA' ? 'Nova receita' : 'Nova despesa'}</h3>
      <p className="fraco">
        Uma linha por fato. O valor entra no saldo assim que a situação for
        “confirmado”.
      </p>

      <div className="grade" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <label className="campo">
          <span className="campo__rotulo">Descrição</span>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)}
                 required maxLength={160}
                 placeholder={natureza === 'RECEITA'
                   ? 'Cota de patrocínio — Ótica Vale'
                   : 'Arbitragem da Interatlética'} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Valor (R$)</span>
          <input value={valor} onChange={(e) => setValor(e.target.value)}
                 required inputMode="decimal" placeholder="1200,00" />
        </label>
      </div>

      <div className="grade" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="campo">
          <span className="campo__rotulo">Categoria</span>
          <select value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaFinanceira)}>
            {(Object.keys(CATEGORIA) as CategoriaFinanceira[]).map((c) => (
              <option key={c} value={c}>{CATEGORIA[c]}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Situação</span>
          <select value={situacao}
                  onChange={(e) => setSituacao(e.target.value as SituacaoDoLancamento)}>
            <option value="CONFIRMADO">Confirmado — já entrou ou saiu</option>
            <option value="PREVISTO">Previsto — combinado, ainda não movimentou</option>
            <option value="ATRASADO">Atrasado — passou do prazo</option>
          </select>
        </label>
      </div>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !descricao.trim() || !valor.trim()}>
          {salvando ? 'Registrando…' : 'Registrar'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
