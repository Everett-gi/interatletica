import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { CategoriaDeFornecedor, Fornecedor } from '../../../api/tipos-mercado'
import { Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Estrelas,
  Secao,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'
import type { AtleticaResumo } from '../../../api/tipos'

export const CATEGORIA_DE_FORNECEDOR: Record<CategoriaDeFornecedor, string> = {
  UNIFORMES: 'Uniformes',
  MEDALHAS: 'Medalhas',
  TROFEUS: 'Troféus',
  IMPRESSAO: 'Impressão',
  TRANSPORTE: 'Transporte',
  ARBITRAGEM: 'Arbitragem',
  FOTOGRAFIA: 'Fotografia',
  VIDEO: 'Vídeo',
  ALIMENTACAO: 'Alimentação',
  EVENTOS: 'Estrutura de evento',
  SEGURANCA: 'Segurança',
}

export const FAIXA: Record<NonNullable<Fornecedor['faixaDePreco']>, string> = {
  BAIXA: '$',
  MEDIA: '$$',
  ALTA: '$$$',
}

type Filtro = 'TODOS' | CategoriaDeFornecedor

/**
 * O diretório de fornecedores (§40 e §41).
 *
 * <p>O valor não está no catálogo — está na avaliação. Saber que a gráfica X
 * atendeu doze atléticas e atrasou em duas é informação que nenhuma atlética
 * consegue sozinha, e é ela que evita repetir o erro que outra já pagou.
 * Por isso a nota e o número de atendimentos vêm antes do telefone.</p>
 */
export function Fornecedores() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [termo, setTermo] = useState('')
  const [indicando, setIndicando] = useState(false)

  const fornecedores = useBusca<Fornecedor[]>(() => Dados.fornecedores(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Fornecedores"
        descricao="Quem outras atléticas já contrataram, com nota, prazo e o que deu errado."
        acoes={minha ? (
          <button className="botao botao--discreto"
                  onClick={() => setIndicando((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Indicar fornecedor
          </button>
        ) : undefined}
      />

      {indicando && minha ? (
        <FormularioDeFornecedor
          minha={minha}
          aoIndicar={(f) => {
            fornecedores.definir([f, ...(fornecedores.dados ?? [])])
            setIndicando(false)
          }}
          aoCancelar={() => setIndicando(false)}
        />
      ) : null}

      <div className="barra-de-filtros">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, cidade ou serviço"
          aria-label="Buscar fornecedores"
        />
      </div>

      <Conteudo
        busca={fornecedores}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="12rem" />)}
          </div>
        }
      >
        {(lista) => {
          const alvo = termo.trim().toLowerCase()
          const visiveis = lista
            .filter((f) => filtro === 'TODOS' || f.categoria === filtro)
            .filter((f) => alvo === '' ||
              `${f.nome} ${f.cidade ?? ''} ${f.descricao} ${CATEGORIA_DE_FORNECEDOR[f.categoria]}`
                .toLowerCase().includes(alvo))
            .sort((a, b) => b.nota - a.nota)

          const contar = (c: CategoriaDeFornecedor) =>
            lista.filter((f) => f.categoria === c).length

          const avaliacoes = lista.reduce((s, f) => s + f.avaliacoes, 0)
          const atendimentos = lista.reduce((s, f) => s + f.atleticasAtendidas, 0)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Fornecedores" icone="fornecedores" valor={lista.length} />
                <Metrica rotulo="Avaliações" icone="estrela" valor={avaliacoes}
                         detalhe="escritas por atléticas da rede" />
                <Metrica rotulo="Atendimentos" icone="parcerias" valor={atendimentos} />
                <Metrica rotulo="Categorias" icone="grade"
                         valor={new Set(lista.map((f) => f.categoria)).size} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Categorias de fornecedor"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todos', contagem: lista.length },
                    ...(Object.keys(CATEGORIA_DE_FORNECEDOR) as CategoriaDeFornecedor[])
                      .filter((c) => contar(c) > 0)
                      .map((c) => ({
                        valor: c as Filtro,
                        rotulo: CATEGORIA_DE_FORNECEDOR[c],
                        contagem: contar(c),
                      })),
                  ]}
                />
              </div>

              {visiveis.length === 0 ? (
                <EstadoVazio icone="fornecedores" titulo="Nenhum fornecedor encontrado">
                  <p className="fraco">
                    Tente outro termo, ou peça indicação na seção de pedidos de ajuda —
                    é o caminho mais rápido para achar quem atende a sua região.
                  </p>
                  <Link to={`/hub/${slug}/rede/ajuda`} className="botao botao--discreto">
                    Pedir indicação
                  </Link>
                </EstadoVazio>
              ) : (
                <Secao>
                  <div className="grade grade--larga">
                    {visiveis.map((f) => (
                      <Link
                        key={f.id}
                        to={`/hub/${slug}/mercado/fornecedores/${f.id}`}
                        className="cartao cartao--clicavel"
                      >
                        <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                          <span className="etiqueta">
                            {CATEGORIA_DE_FORNECEDOR[f.categoria]}
                          </span>
                          {f.faixaDePreco ? (
                            <span className="fraco" title="Faixa de preço">
                              {FAIXA[f.faixaDePreco]}
                            </span>
                          ) : null}
                        </div>

                        <h3 style={{ marginBottom: '0.25rem' }}>{f.nome}</h3>

                        <div className="linha" style={{ gap: '0.45rem',
                                                        marginBottom: '0.6rem' }}>
                          <Estrelas nota={f.nota} />
                          <span style={{ fontWeight: 650 }}>{f.nota.toFixed(1)}</span>
                          <span className="fraco">({plural(f.avaliacoes, 'avaliação', 'avaliações')})</span>
                        </div>

                        <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                          {f.descricao}
                        </p>

                        <div className="linha entre">
                          <span className="fraco">
                            {f.cidade ? `${f.cidade}/${f.uf}` : 'sem endereço'}
                            {f.atendeRemoto ? ' · atende remoto' : ''}
                          </span>
                          <span className="etiqueta etiqueta--acento">
                            {plural(f.atleticasAtendidas, 'atlética')}
                          </span>
                        </div>

                        {f.ultimaCompra ? (
                          <div className="fraco" style={{ marginTop: '0.4rem' }}>
                            sua atlética contratou {quando(f.ultimaCompra)}
                          </div>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </Secao>
              )}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

/**
 * Indicar um fornecedor à rede.
 *
 * <p>Nasce sem nota: a reputação vem das avaliações, e catálogo que se
 * cadastra com cinco estrelas próprias é propaganda. O campo de contato é
 * o que a outra atlética vai realmente usar — sem ele o cadastro só ocupa
 * lugar na lista.</p>
 */
function FormularioDeFornecedor({ minha, aoIndicar, aoCancelar }: {
  minha: AtleticaResumo
  aoIndicar: (fornecedor: Fornecedor) => void
  aoCancelar: () => void
}) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<CategoriaDeFornecedor>('UNIFORMES')
  const [descricao, setDescricao] = useState('')
  const [cidade, setCidade] = useState(minha.cidade ?? '')
  const [uf, setUf] = useState(minha.uf ?? '')
  const [contato, setContato] = useState('')
  const [site, setSite] = useState('')
  const [faixa, setFaixa] = useState<NonNullable<Fornecedor['faixaDePreco']>>('MEDIA')
  const [remoto, setRemoto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const fornecedor = await Dados.cadastrarFornecedor(minha, {
      nome: nome.trim(),
      categoria,
      descricao: descricao.trim(),
      cidade: cidade.trim() === '' ? null : cidade.trim(),
      uf: uf.trim() === '' ? null : uf.trim().toUpperCase(),
      contato: contato.trim() === '' ? null : contato.trim(),
      site: site.trim() === '' ? null : site.trim(),
      faixaDePreco: faixa,
      atendeRemoto: remoto,
    })
    setSalvando(false)
    aoIndicar(fornecedor)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Indicar fornecedor</h3>
      <p className="fraco">
        Entra sem nota nenhuma — a reputação vem das avaliações. Depois de
        cadastrar, avalie você mesmo: é a primeira informação que a próxima
        atlética vai ler.
      </p>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)}
                 required maxLength={120} autoFocus placeholder="Gráfica Central" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Categoria</span>
          <select value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaDeFornecedor)}>
            {(Object.keys(CATEGORIA_DE_FORNECEDOR) as CategoriaDeFornecedor[]).map((c) => (
              <option key={c} value={c}>{CATEGORIA_DE_FORNECEDOR[c]}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">O que fazem</span>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  required rows={3}
                  placeholder="Banner, cartaz, adesivo e credencial. Lote mínimo de 50, prazo de 5 dias." />
      </label>

      <div className="grade" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <label className="campo">
          <span className="campo__rotulo">Cidade</span>
          <input value={cidade} onChange={(e) => setCidade(e.target.value)}
                 maxLength={80} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">UF</span>
          <input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())}
                 maxLength={2} />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Contato</span>
          <input value={contato} onChange={(e) => setContato(e.target.value)}
                 maxLength={120} placeholder="(11) 98800-1122" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Site (opcional)</span>
          <input value={site} onChange={(e) => setSite(e.target.value)}
                 maxLength={200} placeholder="https://…" />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Faixa de preço</span>
          <select value={faixa}
                  onChange={(e) => setFaixa(
                    e.target.value as NonNullable<Fornecedor['faixaDePreco']>)}>
            <option value="BAIXA">$ — barato</option>
            <option value="MEDIA">$$ — médio</option>
            <option value="ALTA">$$$ — caro</option>
          </select>
        </label>

        <label className="campo linha" style={{ gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="checkbox" checked={remoto}
            onChange={(e) => setRemoto(e.target.checked)}
            style={{ width: 'auto', minHeight: 'auto' }}
          />
          <span>Atende outras cidades</span>
        </label>
      </div>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !nome.trim() || !descricao.trim()}>
          {salvando ? 'Cadastrando…' : 'Indicar à rede'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
