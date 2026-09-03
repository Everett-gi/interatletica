import { useState, type FormEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Dados, MODO_DEMO } from '../../dados'
import type { Convite, Membro as MembroDto, Papel } from '../../api/tipos'
import {
  Avatar,
  Conteudo,
  Esqueleto,
  Metrica,
  rotuloDoPapel,
  useBusca,
} from '../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  Confirmacao,
  EstadoVazio,
  Secao,
  Segmentado,
} from '../../ui/pagina'
import { Icone } from '../../ui/icones'
import { quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

type Visao = 'CARTOES' | 'TABELA'
type Filtro = 'TODOS' | Papel | 'INATIVOS'

/**
 * Quadro de membros e convites.
 *
 * <p>Convidar é atribuição de PRESIDENTE, e não de diretor, porque quem
 * controla a entrada controla a atlética. É a mesma regra escrita no
 * comentário de `membro.papel` na migration.</p>
 *
 * <p>Quem saiu continua listado: as inscrições e os resultados que essa
 * pessoa produziu precisam apontar para um vínculo que existe. Apagar
 * membro apagaria história.</p>
 */
export function Membros() {
  const { slug = '' } = useParams()
  const [parametros] = useSearchParams()
  const { podeAtuarComo } = useSessao()
  const presidente = podeAtuarComo(slug, 'PRESIDENTE')

  const [visao, setVisao] = useState<Visao>('CARTOES')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [termo, setTermo] = useState('')
  const [convidando, setConvidando] = useState(parametros.get('convidar') === '1')

  const membros = useBusca<MembroDto[]>(() => Dados.membros(slug), [slug])
  const convites = useBusca<Convite[]>(() => Dados.convites(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Membros"
        descricao="Papel mora no vínculo, não na pessoa: a mesma conta pode presidir aqui e ser membro comum em outra atlética."
        acoes={
          <>
            <Segmentado
              rotulo="Forma de ver os membros"
              atual={visao}
              aoTrocar={setVisao}
              opcoes={[
                { valor: 'CARTOES', rotulo: 'Cartões', icone: 'grade' },
                { valor: 'TABELA', rotulo: 'Tabela', icone: 'lista' },
              ]}
            />
            {presidente ? (
              <button className="botao" onClick={() => setConvidando((v) => !v)}>
                <Icone nome="mais" tamanho={16} /> Convidar
              </button>
            ) : null}
          </>
        }
      />

      {convidando && presidente ? (
        <FormularioDeConvite
          slug={slug}
          aoConvidar={(convite) => convites.definir([convite, ...(convites.dados ?? [])])}
          aoFechar={() => setConvidando(false)}
        />
      ) : null}

      {convites.dados && convites.dados.length > 0 ? (
        <Secao
          titulo="Convites pendentes"
          descricao="Cada convite é endereçado a um e-mail. Só quem entrar com ele consegue aceitar."
        >
          <div className="pilha pilha--densa">
            {convites.dados.map((convite) => (
              <div key={convite.id} className="cartao cartao--compacto linha entre">
                <div style={{ minWidth: 0 }}>
                  <strong>{convite.email}</strong>
                  <div className="fraco">
                    {rotuloDoPapel(convite.papel)} · expira {quando(convite.expiraEm)}
                  </div>
                </div>
                <div className="linha">
                  {/* Só na demonstração: com a API conectada quem aceita é o
                      convidado, pelo link que chegou no e-mail dele. Sem este
                      atalho a demonstração trava numa atlética de uma pessoa
                      só — que não mostra diretoria, nem responsável de
                      tarefa, nem quórum de decisão. */}
                  {MODO_DEMO && presidente ? (
                    <button
                      className="botao botao--discreto botao--pequeno"
                      title="Atalho da demonstração: faz o convidado aceitar"
                      onClick={() => {
                        void Dados.simularAceite(slug, convite.id, nomeDoEmail(convite.email))
                          .then(() => {
                            convites.definir(
                              (convites.dados ?? []).filter((c) => c.id !== convite.id))
                            membros.recarregar()
                          })
                      }}
                    >
                      Simular o aceite
                    </button>
                  ) : null}
                  {presidente ? (
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
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Secao>
      ) : null}

      <Conteudo busca={membros} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => {
          const ativos = lista.filter((m) => m.situacao === 'ATIVO')
          const inativos = lista.filter((m) => m.situacao !== 'ATIVO')
          const alvo = termo.trim().toLowerCase()

          const base = filtro === 'INATIVOS' ? inativos
            : filtro === 'TODOS' ? ativos
            : ativos.filter((m) => m.papel === filtro)

          const visiveis = base.filter((m) => alvo === '' ||
            `${m.nome} ${m.email} ${m.cargo ?? ''}`.toLowerCase().includes(alvo))

          const contar = (p: Papel) => ativos.filter((m) => m.papel === p).length
          const presidentesAtivos = contar('PRESIDENTE')

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Membros ativos" icone="membros" valor={ativos.length} />
                <Metrica rotulo="Diretoria" icone="diretoria"
                         valor={contar('PRESIDENTE') + contar('DIRETOR')}
                         para={`/hub/${slug}/diretoria`} />
                <Metrica rotulo="Convites abertos" icone="inscricoes"
                         valor={convites.dados?.length ?? 0} />
                <Metrica rotulo="No histórico" icone="historico" valor={inativos.length}
                         detalhe="quem já passou pela atlética" />
              </div>

              <div className="barra-de-filtros">
                <input
                  type="search"
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Buscar por nome, cargo ou e-mail"
                  aria-label="Buscar membros"
                />
                <Chips
                  rotulo="Filtros de membro"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Ativos', contagem: ativos.length },
                    { valor: 'PRESIDENTE', rotulo: 'Presidência',
                      contagem: contar('PRESIDENTE') },
                    { valor: 'DIRETOR', rotulo: 'Diretoria', contagem: contar('DIRETOR') },
                    { valor: 'MEMBRO', rotulo: 'Membros', contagem: contar('MEMBRO') },
                    { valor: 'INATIVOS', rotulo: 'Histórico', contagem: inativos.length },
                  ]}
                />
              </div>

              {visiveis.length === 0 ? (
                <EstadoVazio icone="membros" titulo="Ninguém neste filtro">
                  <p className="fraco">
                    {filtro === 'INATIVOS'
                      ? 'Ninguém saiu da atlética ainda.'
                      : 'Ajuste a busca ou convide alguém para começar.'}
                  </p>
                </EstadoVazio>
              ) : visao === 'CARTOES' ? (
                <Secao>
                  <div className="grade">
                    {visiveis.map((membro) => (
                      <CartaoDeMembro
                        key={membro.id}
                        slug={slug}
                        membro={membro}
                        podeGerenciar={presidente && membro.situacao === 'ATIVO'}
                        presidentesAtivos={presidentesAtivos}
                        aoMudar={membros.recarregar}
                      />
                    ))}
                  </div>
                </Secao>
              ) : (
                <Secao>
                  <div className="rolagem">
                    <table className="tabela-cartoes">
                      <thead>
                        <tr>
                          <th>Membro</th>
                          <th>Cargo</th>
                          <th>Papel</th>
                          <th>Desde</th>
                          <th>Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visiveis.map((m) => (
                          <tr key={m.id}>
                            <td data-rotulo="Membro">
                              <div style={{ fontWeight: 550 }}>{m.nome}</div>
                              <div className="fraco">{m.email}</div>
                            </td>
                            <td data-rotulo="Cargo">{m.cargo ?? '—'}</td>
                            <td data-rotulo="Papel">
                              <span className={`etiqueta ${
                                m.papel === 'PRESIDENTE' ? 'etiqueta--acento' : ''}`}>
                                {rotuloDoPapel(m.papel)}
                              </span>
                            </td>
                            <td data-rotulo="Desde">{quando(m.entrouEm)}</td>
                            <td data-rotulo="Situação">
                              {m.situacao === 'ATIVO' ? (
                                <span className="etiqueta etiqueta--sucesso">ativo</span>
                              ) : (
                                <span className="etiqueta">
                                  saiu {m.saiuEm ? quando(m.saiuEm) : ''}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Secao>
              )}

              {filtro === 'INATIVOS' ? (
                <div className="aviso" style={{ marginTop: '1.2rem' }}>
                  <strong>Por que quem saiu continua aqui</strong>
                  <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                    As inscrições e os resultados que essa pessoa produziu precisam
                    apontar para um vínculo que existe. Apagar membro apagaria
                    história — o desligamento marca a saída sem destruir o passado.
                  </p>
                </div>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function CartaoDeMembro({ slug, membro, podeGerenciar, presidentesAtivos, aoMudar }: {
  slug: string
  membro: MembroDto
  podeGerenciar: boolean
  presidentesAtivos: number
  aoMudar: () => void
}) {
  const [ocupado, setOcupado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [editandoCargo, setEditandoCargo] = useState(false)
  const [cargo, setCargo] = useState(membro.cargo ?? '')

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
    setOcupado(true)
    await Dados.desligarMembro(slug, membro.id)
    setOcupado(false)
    aoMudar()
  }

  return (
    <div className="cartao" style={membro.situacao === 'ATIVO' ? undefined : { opacity: 0.65 }}>
      <div className="linha linha--topo" style={{ marginBottom: '0.8rem' }}>
        <Avatar nome={membro.nome} url={membro.avatarUrl} tamanho="m" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{membro.nome}</strong>
          <div className="fraco">
            {membro.cargo ?? rotuloDoPapel(membro.papel)}
            {podeGerenciar && !editandoCargo ? (
              <>
                {' · '}
                <button
                  className="ligacao"
                  onClick={() => setEditandoCargo(true)}
                >
                  {membro.cargo ? 'trocar o cargo' : 'dar um cargo'}
                </button>
              </>
            ) : null}
          </div>
          <div className="fraco">
            {membro.situacao === 'ATIVO'
              ? `desde ${quando(membro.entrouEm)}`
              : `saiu ${membro.saiuEm ? quando(membro.saiuEm) : ''}`}
          </div>
        </div>
        <span className={`etiqueta ${
          membro.papel === 'PRESIDENTE' ? 'etiqueta--acento' : ''}`}>
          {rotuloDoPapel(membro.papel)}
        </span>
      </div>

      {/* Papel diz o que a pessoa PODE fazer; cargo diz do que ela cuida.
          Sem o segundo, "diretor" não informa nada — e é o escopo escrito
          que evita presidente fazendo tudo (§14). */}
      {editandoCargo ? (
        <div className="linha" style={{ marginBottom: '0.7rem' }}>
          <input
            value={cargo} autoFocus maxLength={60}
            onChange={(e) => setCargo(e.target.value)}
            aria-label={`Cargo de ${membro.nome}`}
            placeholder="Diretora financeira"
            style={{ flex: 1, minWidth: '8rem' }}
          />
          <button
            className="botao botao--pequeno"
            disabled={ocupado}
            onClick={() => {
              setOcupado(true)
              void Dados.definirCargo(slug, membro.id, cargo).then(() => {
                setOcupado(false)
                setEditandoCargo(false)
                aoMudar()
              })
            }}
          >
            Salvar
          </button>
          <button className="botao botao--fantasma botao--pequeno"
                  onClick={() => { setCargo(membro.cargo ?? ''); setEditandoCargo(false) }}>
            Cancelar
          </button>
        </div>
      ) : null}

      {podeGerenciar ? (
        <div className="linha">
          <select
            value={membro.papel}
            disabled={ocupado || ultimoPresidente}
            onChange={(e) => void alterar(e.target.value as Papel)}
            aria-label={`Papel de ${membro.nome}`}
            title={ultimoPresidente
              ? 'Promova outra pessoa a presidente antes de rebaixar esta'
              : undefined}
            style={{ flex: 1, minWidth: '8rem', minHeight: '38px' }}
          >
            <option value="MEMBRO">Membro</option>
            <option value="DIRETOR">Diretor</option>
            <option value="PRESIDENTE">Presidente</option>
          </select>

          <button
            className="botao botao--perigo botao--pequeno"
            disabled={ocupado || ultimoPresidente}
            onClick={() => setConfirmando(true)}
            title={ultimoPresidente
              ? 'Esta é a única presidência ativa da atlética'
              : undefined}
          >
            Desligar
          </button>
        </div>
      ) : null}

      {confirmando ? (
        <Confirmacao
          titulo={`Desligar ${membro.nome} da atlética?`}
          consequencia={
            'A pessoa perde acesso à área da diretoria, mas continua no histórico: '
            + 'as inscrições e os resultados que ela produziu precisam apontar para '
            + 'um vínculo que existe.'
          }
          rotuloDeConfirmar="Desligar"
          aoConfirmar={() => { setConfirmando(false); void desligar() }}
          aoCancelar={() => setConfirmando(false)}
        />
      ) : null}
    </div>
  )
}

function FormularioDeConvite({ slug, aoConvidar, aoFechar }: {
  slug: string
  aoConvidar: (convite: Convite) => void
  aoFechar: () => void
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
    <section className="cartao" style={{ marginBottom: '1.4rem' }}>
      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
        <h3 style={{ margin: 0 }}>Convidar</h3>
        <button className="icone-botao" onClick={aoFechar} aria-label="Fechar">
          <Icone nome="fechar" tamanho={17} />
        </button>
      </div>

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

/**
 * Um nome apresentável a partir do e-mail do convite.
 *
 * <p>Serve só ao aceite simulado da demonstração: no fluxo real o nome vem
 * da conta Google de quem aceita.</p>
 */
function nomeDoEmail(email: string): string {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter((parte) => parte !== '')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')
}
