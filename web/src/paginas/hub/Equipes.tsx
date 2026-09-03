import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Equipe, FuncaoNaEquipe } from '../../api/tipos-rede'
import { Avatar, Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../ui/pagina'
import { Icone } from '../../ui/icones'
import { useSessao } from '../../sessao/SessaoContexto'

const FUNCAO: Record<FuncaoNaEquipe, { rotulo: string; classe: string }> = {
  CAPITAO: { rotulo: 'Capitão', classe: 'etiqueta--acento' },
  TITULAR: { rotulo: 'Titular', classe: '' },
  RESERVA: { rotulo: 'Reserva', classe: '' },
  TECNICO: { rotulo: 'Técnico', classe: 'etiqueta--alerta' },
}

/**
 * As equipes da atlética.
 *
 * <p>Equipe pertence à ATLÉTICA, não ao evento: o time de vôlei é o mesmo em
 * março e em outubro, e ele se <em>inscreve</em> em eventos. É por isso que
 * esta tela vive no hub e não dentro de um evento.</p>
 */
export function Equipes() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [modalidade, setModalidade] = useState('TODAS')
  const [compondo, setCompondo] = useState(false)

  const equipes = useBusca<Equipe[]>(() => Dados.equipes(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Equipes"
        descricao="O elenco por modalidade. A equipe é da atlética e atravessa os eventos — ela se inscreve, não é criada por evento."
        acoes={diretor ? (
          <button className="botao" onClick={() => setCompondo((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Nova equipe
          </button>
        ) : undefined}
      />

      <Previa oQueFalta="Cadastrar equipe e montar elenco ainda não chegam ao servidor." />

      {compondo ? (
        <FormularioDeEquipe
          slug={slug}
          modalidadesJaUsadas={[...new Set((equipes.dados ?? []).map((e) => e.modalidade))]}
          aoCriar={(equipe) => {
            equipes.definir([...(equipes.dados ?? []), equipe])
            setCompondo(false)
          }}
          aoCancelar={() => setCompondo(false)}
        />
      ) : null}

      <Conteudo
        busca={equipes}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1].map((i) => <Esqueleto key={i} altura="14rem" />)}
          </div>
        }
      >
        {(times) => {
          if (times.length === 0) {
            return (
              <EstadoVazio icone="equipes" titulo="Nenhuma equipe cadastrada">
                <p className="fraco">
                  Cadastre os times para que possam se inscrever em torneios e
                  para que a documentação dos atletas seja conferida antes do
                  sorteio das chaves.
                </p>
                {diretor && !compondo ? (
                  <button className="botao" onClick={() => setCompondo(true)}>
                    <Icone nome="mais" tamanho={16} /> Cadastrar a primeira equipe
                  </button>
                ) : null}
              </EstadoVazio>
            )
          }

          const modalidades = [...new Set(times.map((e) => e.modalidade))]
          const visiveis = modalidade === 'TODAS'
            ? times
            : times.filter((e) => e.modalidade === modalidade)
          const atletas = new Set(times.flatMap((e) => e.elenco.map((a) => a.usuarioId)))

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Equipes" icone="equipes" valor={times.length} />
                <Metrica rotulo="Modalidades" icone="grade" valor={modalidades.length} />
                <Metrica rotulo="Atletas" icone="atletas" valor={atletas.size}
                         para={`/hub/${slug}/atletas`}
                         detalhe="pessoas distintas nos elencos" />
                <Metrica rotulo="Ativas" icone="certo"
                         valor={times.filter((e) => e.ativa).length} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Modalidades"
                  selecionado={modalidade}
                  aoSelecionar={setModalidade}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: times.length },
                    ...modalidades.map((m) => ({
                      valor: m,
                      rotulo: m,
                      contagem: times.filter((e) => e.modalidade === m).length,
                    })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((equipe) => (
                    <CartaoDeEquipe key={equipe.id} equipe={equipe} slug={slug} />
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

/** As modalidades mais comuns, para não obrigar ninguém a digitar "Futsal". */
const MODALIDADES = [
  'Futsal masculino', 'Futsal feminino', 'Vôlei masculino', 'Vôlei feminino',
  'Basquete masculino', 'Basquete feminino', 'Handebol', 'Futebol de campo',
  'Natação', 'Atletismo', 'Xadrez', 'League of Legends', 'Counter-Strike',
  'Valorant', 'Cheerleading', 'Bateria',
]

/**
 * Cadastrar uma equipe.
 *
 * <p>Três campos, e o elenco fica para a ficha dela. Pedir o elenco inteiro
 * no cadastro é o que faz a diretoria adiar o cadastro — e uma equipe sem
 * elenco já serve para se inscrever num torneio.</p>
 */
function FormularioDeEquipe({ slug, modalidadesJaUsadas, aoCriar, aoCancelar }: {
  slug: string
  modalidadesJaUsadas: string[]
  aoCriar: (equipe: Equipe) => void
  aoCancelar: () => void
}) {
  const [nome, setNome] = useState('')
  const [tag, setTag] = useState('')
  const [modalidade, setModalidade] = useState('')
  const [salvando, setSalvando] = useState(false)

  const opcoes = [...new Set([...modalidadesJaUsadas, ...MODALIDADES])]

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const equipe = await Dados.criarEquipe(slug, {
      nome: nome.trim(),
      tag: tag.trim() === '' ? null : tag.trim().toUpperCase(),
      modalidade: modalidade.trim(),
    })
    setSalvando(false)
    aoCriar(equipe)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Nova equipe</h3>
      <p className="fraco">
        O elenco entra depois, na ficha da equipe. Uma equipe sem elenco já
        pode se inscrever em torneio.
      </p>

      <label className="campo">
        <span className="campo__rotulo">Nome da equipe</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)}
               required maxLength={80} autoFocus
               placeholder="Vôlei feminino" />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Modalidade</span>
          <input value={modalidade} onChange={(e) => setModalidade(e.target.value)}
                 required maxLength={60} list="modalidades-conhecidas"
                 placeholder="Vôlei feminino" />
          <datalist id="modalidades-conhecidas">
            {opcoes.map((m) => <option key={m} value={m} />)}
          </datalist>
          <span className="campo__dica">
            Escolha da lista ou escreva a sua.
          </span>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Sigla (opcional)</span>
          <input value={tag} onChange={(e) => setTag(e.target.value)}
                 maxLength={6} placeholder="VF" />
          <span className="campo__dica">Aparece na tabela do campeonato.</span>
        </label>
      </div>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !nome.trim() || !modalidade.trim()}>
          {salvando ? 'Cadastrando…' : 'Cadastrar equipe'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function CartaoDeEquipe({ equipe, slug }: { equipe: Equipe; slug: string }) {
  // E-sports usa nickname; esporte de quadra usa número. A mesma tabela
  // guarda os dois, e a tela mostra o que faz sentido para a modalidade.
  const usaNick = equipe.elenco.some((a) => a.nick !== null)

  return (
    <section className="cartao">
      <div className="linha entre" style={{ marginBottom: '0.9rem' }}>
        <div style={{ minWidth: 0 }}>
          <Link to={`/hub/${slug}/equipes/${equipe.id}`} style={{ color: 'inherit' }}>
            <h3 style={{ marginBottom: '0.1rem' }}>{equipe.nome}</h3>
          </Link>
          <div className="fraco">{equipe.modalidade}</div>
        </div>
        <span className="etiqueta">{equipe.elenco.length} atletas</span>
      </div>

      {equipe.elenco.length === 0 ? (
        <p className="fraco" style={{ margin: 0 }}>
          Elenco vazio. Monte na ficha da equipe — os nomes saem da lista de
          membros da atlética.
        </p>
      ) : null}

      <div className="pilha pilha--densa">
        {equipe.elenco.slice(0, 5).map((atleta) => (
          <div key={atleta.usuarioId} className="linha">
            <Avatar nome={atleta.nome} url={atleta.avatarUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 550 }}>{atleta.nome}</div>
              {usaNick && atleta.nick ? (
                <code className="fraco">{atleta.nick}</code>
              ) : null}
            </div>
            {atleta.numero !== null ? (
              <span className="fraco" style={{ fontVariantNumeric: 'tabular-nums' }}>
                #{atleta.numero}
              </span>
            ) : null}
            <span className={`etiqueta ${FUNCAO[atleta.funcao].classe}`}>
              {FUNCAO[atleta.funcao].rotulo}
            </span>
          </div>
        ))}
      </div>

      {equipe.elenco.length > 5 ? (
        <div className="fraco" style={{ marginTop: '0.5rem' }}>
          e mais {equipe.elenco.length - 5} no elenco
        </div>
      ) : null}

      <Link to={`/hub/${slug}/equipes/${equipe.id}`}
            className="botao botao--discreto botao--largo"
            style={{ marginTop: '0.9rem' }}>
        Ver a equipe
      </Link>
    </section>
  )
}
