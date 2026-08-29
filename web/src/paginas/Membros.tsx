import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Api } from '../api/rotas'
import { Carregando, MensagemDeErro, useBusca, Vazio } from '../componentes/comuns'
import { quando } from '../formatos'
import { rotuloDoPapel } from './Inicio'
import type { Convite, Membro as MembroDto, Papel } from '../api/tipos'

/**
 * Quadro de membros e convites — a tela do presidente.
 *
 * <p>Convidar é atribuição de presidente, e não de diretor, porque quem
 * controla a entrada controla a atlética. É a mesma regra que está no
 * comentário de {@code membro.papel} na migration.</p>
 */
export function Membros() {
  const { slug = '' } = useParams()

  const membros = useBusca<MembroDto[]>(() => Api.membros.listar(slug), [slug])
  const convites = useBusca<Convite[]>(() => Api.convites.listar(slug), [slug])

  return (
    <div className="pilha">
      <header>
        <Link to={`/a/${slug}`} className="fraco">
          ← Voltar
        </Link>
        <h1 style={{ marginTop: '0.35rem' }}>Membros</h1>
      </header>

      <FormularioDeConvite slug={slug} aoConvidar={convites.recarregar} />

      {convites.dados && convites.dados.length > 0 ? (
        <section>
          <h2>Convites pendentes</h2>
          <div className="pilha">
            {convites.dados.map((convite) => (
              <LinhaDeConvite
                key={convite.id}
                slug={slug}
                convite={convite}
                aoRevogar={convites.recarregar}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2>Quadro atual</h2>
        {membros.carregando ? <Carregando /> : null}
        {membros.erro ? <MensagemDeErro erro={membros.erro} /> : null}
        {membros.dados && membros.dados.length === 0 ? (
          <Vazio>Nenhum membro ativo.</Vazio>
        ) : null}
        {membros.dados ? (
          <div className="pilha">
            {membros.dados.map((membro) => (
              <LinhaDeMembro
                key={membro.id}
                slug={slug}
                membro={membro}
                aoMudar={membros.recarregar}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function FormularioDeConvite({
  slug,
  aoConvidar,
}: {
  slug: string
  aoConvidar: () => void
}) {
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState<Papel>('MEMBRO')
  const [enviando, setEnviando] = useState(false)
  const [falha, setFalha] = useState<unknown>(null)
  const [criado, setCriado] = useState<Convite | null>(null)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setFalha(null)
    try {
      setCriado(await Api.convites.criar(slug, email, papel))
      setEmail('')
      aoConvidar()
    } catch (erro) {
      setFalha(erro)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="cartao">
      <h2>Convidar</h2>
      <p className="fraco">
        O convite é endereçado a este e-mail. Só quem entrar com ele consegue
        aceitar — é o que impede um link encaminhado no grupo de matricular o
        grupo inteiro.
      </p>

      {falha ? <MensagemDeErro erro={falha} /> : null}

      {criado ? (
        <div className="aviso aviso--sucesso">
          <strong>Convite pronto para {criado.email}</strong>
          <div className="fraco">Mande este link para a pessoa:</div>
          <code style={{ wordBreak: 'break-all' }}>{criado.link}</code>
        </div>
      ) : null}

      <form onSubmit={(e) => void enviar(e)}>
        <label className="campo">
          <span className="campo__rotulo">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={180}
            placeholder="pessoa@universidade.br"
          />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Papel</span>
          <select value={papel} onChange={(e) => setPapel(e.target.value as Papel)}>
            <option value="MEMBRO">Membro — participa e se inscreve</option>
            <option value="DIRETOR">Diretor — cria e gerencia eventos</option>
            <option value="PRESIDENTE">Presidente — administra e convida</option>
          </select>
        </label>

        <button className="botao" type="submit" disabled={enviando}>
          {enviando ? 'Gerando…' : 'Gerar convite'}
        </button>
      </form>
    </section>
  )
}

function LinhaDeConvite({
  slug,
  convite,
  aoRevogar,
}: {
  slug: string
  convite: Convite
  aoRevogar: () => void
}) {
  const [ocupado, setOcupado] = useState(false)

  return (
    <div className="cartao linha entre">
      <div>
        <strong>{convite.email}</strong>
        <div className="fraco">
          {rotuloDoPapel(convite.papel)} · expira {quando(convite.expiraEm)}
        </div>
      </div>
      <button
        className="botao botao--perigo"
        disabled={ocupado}
        onClick={() => {
          setOcupado(true)
          void Api.convites
            .revogar(slug, convite.id)
            .then(aoRevogar)
            .finally(() => setOcupado(false))
        }}
      >
        Revogar
      </button>
    </div>
  )
}

function LinhaDeMembro({
  slug,
  membro,
  aoMudar,
}: {
  slug: string
  membro: MembroDto
  aoMudar: () => void
}) {
  const [ocupado, setOcupado] = useState(false)
  const [falha, setFalha] = useState<unknown>(null)

  function alterarPapel(papel: Papel) {
    setOcupado(true)
    setFalha(null)
    void Api.membros
      .alterarPapel(slug, membro.id, papel, membro.cargo)
      .then(aoMudar)
      .catch(setFalha)
      .finally(() => setOcupado(false))
  }

  function desligar() {
    if (!window.confirm(`Desligar ${membro.nome} da atlética?`)) {
      return
    }
    setOcupado(true)
    setFalha(null)
    void Api.membros
      .desligar(slug, membro.id)
      .then(aoMudar)
      .catch(setFalha)
      .finally(() => setOcupado(false))
  }

  return (
    <div className="cartao">
      <div className="linha entre">
        <div>
          <strong>{membro.nome}</strong>
          <div className="fraco">{membro.email}</div>
        </div>
        <div className="linha">
          <select
            value={membro.papel}
            disabled={ocupado}
            onChange={(e) => alterarPapel(e.target.value as Papel)}
            style={{ width: 'auto' }}
            aria-label={`Papel de ${membro.nome}`}
          >
            <option value="MEMBRO">Membro</option>
            <option value="DIRETOR">Diretor</option>
            <option value="PRESIDENTE">Presidente</option>
          </select>
          <button className="botao botao--perigo" disabled={ocupado} onClick={desligar}>
            Desligar
          </button>
        </div>
      </div>

      {/* O servidor recusa rebaixar ou desligar a última presidência ativa.
          A mensagem dele explica o porquê melhor do que um genérico. */}
      {falha ? <MensagemDeErro erro={falha} /> : null}
    </div>
  )
}
