import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Dados } from '../../dados'
import { useSessao } from '../../sessao/SessaoContexto'
import { Brasao, Carregando } from '../../ui/componentes'
import { Icone } from '../../ui/icones'
import { aplicarCorDaAtletica, iniciais } from '../../ui/tema'

/**
 * As cores oferecidas.
 *
 * <p>Uma paleta em vez de um seletor livre porque qualquer cor precisa
 * continuar legível sobre fundo claro e escuro, e um amarelo #FFFF00 escolhido
 * às pressas produz texto branco sobre amarelo. O ajuste de luminância em
 * `ui/tema.ts` salva a maioria dos casos; começar de um conjunto testado
 * evita precisar salvar.</p>
 */
const CORES = [
  { nome: 'Azul', valor: '#2563EB' },
  { nome: 'Vermelho', valor: '#C2410C' },
  { nome: 'Verde', valor: '#0F766E' },
  { nome: 'Roxo', valor: '#6D28D9' },
  { nome: 'Dourado', valor: '#B8912B' },
  { nome: 'Grafite', valor: '#334155' },
  { nome: 'Rosa', valor: '#BE185D' },
  { nome: 'Oliva', valor: '#4D7C0F' },
]

type Passo = 1 | 2 | 3 | 4

/**
 * A criação da atlética (§81).
 *
 * <p>Quatro passos curtos, e não um formulário com dezoito campos: o §80 é
 * explícito em não mostrar dezenas de campos de uma vez. Diretoria, esportes,
 * primeiro projeto e convites <strong>não</strong> entram aqui — eles viram a
 * lista de primeiros passos depois que a atlética existe, porque são coisas
 * que se fazem no módulo delas, e não num cadastro paralelo que depois
 * precisaria ser refeito no lugar certo.</p>
 */
export function CriarAtletica() {
  const { perfil, carregando, recarregar, aparencia } = useSessao()
  const navegar = useNavigate()

  const [passo, setPasso] = useState<Passo>(1)
  const [nome, setNome] = useState('')
  const [sigla, setSigla] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [cor, setCor] = useState(CORES[0].valor)
  const [criando, setCriando] = useState(false)

  if (carregando) {
    return <Carregando />
  }
  if (!perfil) {
    return <Navigate to="/entrar" replace />
  }

  const podeAvancar =
    passo === 1 ? nome.trim().length >= 3
    : passo === 2 ? instituicao.trim().length >= 3
    : true

  async function criar() {
    setCriando(true)
    const atletica = await Dados.criarAtleticaDemo({
      nome, sigla: sigla || null, instituicao,
      cidade: cidade || null, uf: uf || null, corPrimaria: cor,
    })
    await recarregar()
    navegar(`/hub/${atletica.slug}/boas-vindas`, { replace: true })
  }

  const previa = {
    nome: nome.trim() || 'Sua atlética',
    sigla: sigla.trim() || null,
    brasaoUrl: null,
    corPrimaria: cor,
  }

  return (
    <div style={{ maxWidth: '44rem', margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '0.3rem' }}>Criar a sua atlética</h1>
      <p className="suave" style={{ marginBottom: '1.4rem' }}>
        Quatro perguntas. O resto — diretoria, equipes, eventos — você monta
        depois, no lugar de cada coisa.
      </p>

      <div className="linha" style={{ gap: '0.35rem', marginBottom: '1.4rem' }}>
        {([1, 2, 3, 4] as Passo[]).map((n) => (
          <div
            key={n}
            style={{
              flex: 1, height: '4px', borderRadius: '999px',
              background: n <= passo ? 'var(--acento)' : 'var(--fundo-afundado)',
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="detalhe">
        <div className="cartao">
          <div className="fraco" style={{ marginBottom: '0.6rem' }}>
            Passo {passo} de 4
          </div>

          {passo === 1 ? (
            <>
              <h2>Como ela se chama?</h2>
              <label className="campo">
                <span className="campo__rotulo">Nome da atlética</span>
                <input value={nome} onChange={(e) => setNome(e.target.value)}
                       maxLength={120} autoFocus
                       placeholder="Atlética Dragões" />
                <span className="campo__dica">
                  O nome que aparece na rede e no link público.
                </span>
              </label>
              <label className="campo">
                <span className="campo__rotulo">Sigla (opcional)</span>
                <input value={sigla} onChange={(e) => setSigla(e.target.value)}
                       maxLength={5} placeholder="DRG" style={{ maxWidth: '8rem' }} />
                <span className="campo__dica">
                  Até cinco letras. Aparece no brasão e no seletor do topo.
                </span>
              </label>
            </>
          ) : null}

          {passo === 2 ? (
            <>
              <h2>De qual instituição?</h2>
              <label className="campo">
                <span className="campo__rotulo">Curso e faculdade</span>
                <input value={instituicao} onChange={(e) => setInstituicao(e.target.value)}
                       maxLength={160} autoFocus
                       placeholder="Faculdade de Engenharia, UniVale" />
                <span className="campo__dica">
                  É o que distingue duas atléticas com nome parecido, e o que
                  outras atléticas usam para achar você.
                </span>
              </label>
            </>
          ) : null}

          {passo === 3 ? (
            <>
              <h2>Onde vocês estão?</h2>
              <p className="fraco">
                Serve para achar atléticas vizinhas — quem está no mesmo estado
                é com quem dá para marcar amistoso sem fretar ônibus.
              </p>
              <div className="grade" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <label className="campo">
                  <span className="campo__rotulo">Cidade</span>
                  <input value={cidade} onChange={(e) => setCidade(e.target.value)}
                         maxLength={80} autoFocus placeholder="São Bento do Vale" />
                </label>
                <label className="campo">
                  <span className="campo__rotulo">UF</span>
                  <input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())}
                         maxLength={2} placeholder="SP" />
                </label>
              </div>
            </>
          ) : null}

          {passo === 4 ? (
            <>
              <h2>Qual é a cor de vocês?</h2>
              <p className="fraco">
                A plataforma inteira se pinta com ela enquanto você estiver na
                sua atlética. Território comum, cada uma com a própria cara.
              </p>
              <div className="chips">
                {CORES.map((c) => (
                  <button
                    key={c.valor}
                    type="button"
                    className="chip"
                    aria-pressed={cor === c.valor}
                    onClick={() => {
                      setCor(c.valor)
                      // Pinta na hora: escolher cor sem ver o efeito é escolher
                      // no escuro, e a cor é a única decisão daqui que a pessoa
                      // vai olhar todo dia.
                      aplicarCorDaAtletica(c.valor, aparencia)
                    }}
                  >
                    <span
                      style={{
                        width: '0.85rem', height: '0.85rem', borderRadius: '4px',
                        background: c.valor, display: 'inline-block',
                      }}
                      aria-hidden="true"
                    />
                    {c.nome}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="linha entre" style={{ marginTop: '1.4rem' }}>
            <button
              className="botao botao--fantasma"
              onClick={() => setPasso((p) => (p > 1 ? ((p - 1) as Passo) : p))}
              disabled={passo === 1}
            >
              <Icone nome="esquerda" tamanho={16} /> Voltar
            </button>

            {passo < 4 ? (
              <button
                className="botao"
                onClick={() => setPasso((p) => ((p + 1) as Passo))}
                disabled={!podeAvancar}
              >
                Continuar <Icone nome="direita" tamanho={16} />
              </button>
            ) : (
              <button className="botao" onClick={() => void criar()} disabled={criando}>
                {criando ? 'Criando…' : 'Criar atlética'}
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="cartao">
            <div className="fraco" style={{ marginBottom: '0.7rem' }}>Prévia</div>
            <div className="linha linha--topo">
              <Brasao atletica={previa} tamanho="g" />
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: '1.02rem' }}>{previa.nome}</strong>
                <div className="fraco">
                  {instituicao.trim() || 'Instituição a definir'}
                </div>
                {cidade.trim() ? (
                  <div className="fraco">
                    {cidade.trim()}{uf ? `/${uf}` : ''}
                  </div>
                ) : null}
              </div>
            </div>
            <hr className="divisor" />
            <div className="fraco">
              Brasão gerado a partir de
              {' '}<strong>{iniciais(previa.nome, previa.sigla)}</strong>{' '}
              enquanto vocês não subirem a arte.
            </div>
          </div>

          <div className="aviso" style={{ marginTop: '1rem' }}>
            <strong>Você será a presidência</strong>
            <p className="fraco" style={{ margin: '0.3rem 0 0' }}>
              Quem cria a atlética vira presidente dela, porque alguém precisa
              poder convidar o resto. Dá para transferir depois — inclusive na
              virada de gestão, que é quando isso realmente acontece.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
