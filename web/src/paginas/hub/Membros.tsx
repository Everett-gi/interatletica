import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Convite, Membro as MembroDto, Papel } from '../../api/tipos'
import {
  Avatar,
  Conteudo,
  Esqueleto,
  rotuloDoPapel,
  useBusca,
  Vazio,
} from '../../ui/componentes'
import { useCorDaAtletica } from '../../ui/useCorDaAtletica'
import { quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

/**
 * Quadro de membros e convites — a tela do presidente.
 *
 * <p>Convidar é atribuição de PRESIDENTE, e não de diretor, porque quem
 * controla a entrada controla a atlética. É a mesma regra escrita no
 * comentário de `membro.papel` na migration.</p>
 */
export function Membros() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  useCorDaAtletica(vinculo(slug)?.atletica.corPrimaria)

  const membros = useBusca<MembroDto[]>(() => Dados.membros(slug), [slug])
  const convites = useBusca<Convite[]>(() => Dados.convites(slug), [slug])

  const ativos = membros.dados?.filter((m) => m.situacao === 'ATIVO') ?? []
  const inativos = membros.dados?.filter((m) => m.situacao !== 'ATIVO') ?? []

  return (
    <div className="pilha" style={{ gap: '1.6rem' }}>
      <header>
        <h1>Membros</h1>
        <p className="fraco" style={{ margin: 0 }}>
          Papel mora no vínculo, não na pessoa: a mesma conta pode presidir
          aqui e ser membro comum em outra atlética.
        </p>
      </header>

      <FormularioDeConvite
        slug={slug}
        aoConvidar={(convite) => convites.definir([convite, ...(convites.dados ?? [])])}
      />

      {convites.dados && convites.dados.length > 0 ? (
        <section>
          <div className="cabecalho-de-secao">
            <h2>Convites pendentes</h2>
          </div>
          <div className="pilha pilha--densa">
            {convites.dados.map((convite) => (
              <div key={convite.id} className="cartao linha entre">
                <div style={{ minWidth: 0 }}>
                  <strong>{convite.email}</strong>
                  <div className="fraco">
                    {rotuloDoPapel(convite.papel)} · expira {quando(convite.expiraEm)}
                  </div>
                </div>
                <button
                  className="botao botao--perigo botao--pequeno"
                  onClick={() => {
                    void Dados.revogarConvite(slug, convite.id)
                    convites.definir(
                      (convites.dados ?? []).filter((c) => c.id !== convite.id))
                  }}
                >
                  Revogar
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="cabecalho-de-secao">
          <h2>Quadro atual</h2>
          <span className="fraco">{ativos.length} ativos</span>
        </div>

        <Conteudo busca={membros} esqueleto={<Esqueleto altura="12rem" />}>
          {() =>
            ativos.length === 0 ? (
              <Vazio titulo="Nenhum membro ativo" />
            ) : (
              <div className="pilha pilha--densa">
                {ativos.map((membro) => (
                  <LinhaDeMembro
                    key={membro.id}
                    slug={slug}
                    membro={membro}
                    presidentesAtivos={ativos.filter((m) => m.papel === 'PRESIDENTE').length}
                    aoMudar={membros.recarregar}
                  />
                ))}
              </div>
            )
          }
        </Conteudo>
      </section>

      {inativos.length > 0 ? (
        <section>
          <div className="cabecalho-de-secao">
            <h2>Histórico</h2>
          </div>
          <p className="fraco">
            Quem saiu continua aqui: as inscrições e os resultados que essa
            pessoa produziu precisam apontar para um vínculo que existe.
          </p>
          <div className="pilha pilha--densa">
            {inativos.map((membro) => (
              <div key={membro.id} className="cartao linha" style={{ opacity: 0.65 }}>
                <Avatar nome={membro.nome} url={membro.avatarUrl} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span>{membro.nome}</span>
                  <div className="fraco">
                    saiu {membro.saiuEm ? quando(membro.saiuEm) : ''}
                  </div>
                </div>
                <span className="etiqueta">inativo</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function FormularioDeConvite({ slug, aoConvidar }: {
  slug: string
  aoConvidar: (convite: Convite) => void
}) {
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState<Papel>('MEMBRO')
  const [enviando, setEnviando] = useState(false)
  const [criado, setCriado] = useState<Convite | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    const convite = await Dados.convidar(slug, email, papel)
    setCriado(convite)
    setEmail('')
    setEnviando(false)
    aoConvidar(convite)
  }

  return (
    <section className="cartao">
      <h3>Convidar</h3>
      <p className="fraco">
        O convite é endereçado a este e-mail. Só quem entrar com ele consegue
        aceitar — é o que impede um link encaminhado no grupo de matricular o
        grupo inteiro.
      </p>

      {criado ? (
        <div className="aviso aviso--sucesso">
          <strong>Convite pronto para {criado.email}</strong>
          <div className="fraco">Mande este link para a pessoa:</div>
          <code style={{ wordBreak: 'break-all' }}>{criado.link}</code>
        </div>
      ) : null}

      <form onSubmit={(e) => void enviar(e)}>
        <div className="grade" style={{ gridTemplateColumns: '2fr 1fr auto',
                                        alignItems: 'end' }}>
          <label className="campo" style={{ marginBottom: 0 }}>
            <span className="campo__rotulo">E-mail</span>
            <input type="email" value={email} required maxLength={180}
                   placeholder="pessoa@universidade.br"
                   onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="campo" style={{ marginBottom: 0 }}>
            <span className="campo__rotulo">Papel</span>
            <select value={papel} onChange={(e) => setPapel(e.target.value as Papel)}>
              <option value="MEMBRO">Membro</option>
              <option value="DIRETOR">Diretor</option>
              <option value="PRESIDENTE">Presidente</option>
            </select>
          </label>

          <button className="botao" type="submit" disabled={enviando}>
            {enviando ? 'Gerando…' : 'Gerar convite'}
          </button>
        </div>
      </form>
    </section>
  )
}

function LinhaDeMembro({ slug, membro, presidentesAtivos, aoMudar }: {
  slug: string
  membro: MembroDto
  presidentesAtivos: number
  aoMudar: () => void
}) {
  const [ocupado, setOcupado] = useState(false)

  // Trava do último presidente: uma atlética sem presidência ativa não tem
  // quem convide nem quem promova, e precisaria de intervenção no banco para
  // voltar a funcionar. O servidor recusa; a interface nem oferece.
  const ultimoPresidente = membro.papel === 'PRESIDENTE' && presidentesAtivos <= 1

  async function alterar(papel: Papel) {
    setOcupado(true)
    await Dados.alterarPapel(slug, membro.id, papel)
    setOcupado(false)
    aoMudar()
  }

  async function desligar() {
    if (!window.confirm(`Desligar ${membro.nome} da atlética?`)) return
    setOcupado(true)
    await Dados.desligarMembro(slug, membro.id)
    setOcupado(false)
    aoMudar()
  }

  return (
    <div className="cartao linha entre">
      <div className="linha" style={{ minWidth: 0, flex: 1 }}>
        <Avatar nome={membro.nome} url={membro.avatarUrl} />
        <div style={{ minWidth: 0 }}>
          <strong>{membro.nome}</strong>
          <div className="fraco">{membro.cargo ?? membro.email}</div>
        </div>
      </div>

      <div className="linha">
        <select
          value={membro.papel}
          disabled={ocupado || ultimoPresidente}
          onChange={(e) => void alterar(e.target.value as Papel)}
          aria-label={`Papel de ${membro.nome}`}
          title={ultimoPresidente
            ? 'Promova outra pessoa a presidente antes de rebaixar esta'
            : undefined}
          style={{ width: 'auto', minWidth: '8rem' }}
        >
          <option value="MEMBRO">Membro</option>
          <option value="DIRETOR">Diretor</option>
          <option value="PRESIDENTE">Presidente</option>
        </select>

        <button
          className="botao botao--perigo botao--pequeno"
          disabled={ocupado || ultimoPresidente}
          onClick={() => void desligar()}
          title={ultimoPresidente
            ? 'Esta é a única presidência ativa da atlética'
            : undefined}
        >
          Desligar
        </button>
      </div>
    </div>
  )
}
