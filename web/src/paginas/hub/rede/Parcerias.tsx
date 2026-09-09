import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { EtapaDaParceria, Parceria, TipoDeParceria } from '../../../api/tipos-mercado'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  Confirmacao,
  EstadoVazio,
  Secao,
} from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'
import type { AtleticaResumo } from '../../../api/tipos'

const TIPO: Record<TipoDeParceria, { rotulo: string; icone: NomeDoIcone }> = {
  EMPRESA: { rotulo: 'Empresa', icone: 'mercado' },
  ATLETICA: { rotulo: 'Entre atléticas', icone: 'rede' },
  INSTITUICAO: { rotulo: 'Instituição', icone: 'atletica' },
}

const ETAPA: Record<EtapaDaParceria, { rotulo: string; classe: string }> = {
  DISPONIVEL: { rotulo: 'Disponível', classe: 'etiqueta--sucesso' },
  INTERESSE: { rotulo: 'Com interessadas', classe: 'etiqueta--acento' },
  NEGOCIACAO: { rotulo: 'Em negociação', classe: 'etiqueta--alerta' },
  ATIVA: { rotulo: 'Ativa', classe: 'etiqueta--sucesso' },
  ENCERRADA: { rotulo: 'Encerrada', classe: '' },
}

type Filtro = 'TODAS' | TipoDeParceria

/**
 * As parcerias (§43).
 *
 * <p>Duas naturezas na mesma tela: parceria com empresa — desconto, permuta,
 * serviço — e parceria entre atléticas, que costuma não envolver dinheiro
 * nenhum. A segunda é a mais subestimada: emprestar quadra e laboratório
 * resolve problema que nenhum patrocínio resolveria.</p>
 */
export function Parcerias() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [confirmando, setConfirmando] = useState<Parceria | null>(null)
  const [propondo, setPropondo] = useState(false)

  const parcerias = useBusca<Parceria[]>(() => Dados.parcerias(), [])

  async function demonstrarInteresse(parceria: Parceria) {
    if (!minha) return
    const atualizada = await Dados.demonstrarInteresseEmParceria(parceria.id, minha)
    if (atualizada) {
      parcerias.definir(
        (parcerias.dados ?? []).map((p) => (p.id === parceria.id ? atualizada : p)))
    }
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Parcerias"
        descricao="Benefícios abertos à rede, e acordos diretos entre duas atléticas."
        acoes={minha ? (
          <button className="botao botao--discreto"
                  onClick={() => setPropondo((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Propor parceria
          </button>
        ) : undefined}
      />

      {propondo && minha ? (
        <FormularioDeParceria
          minha={minha}
          aoPropor={(p) => {
            parcerias.definir([p, ...(parcerias.dados ?? [])])
            setPropondo(false)
          }}
          aoCancelar={() => setPropondo(false)}
        />
      ) : null}

      <Conteudo
        busca={parcerias}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="13rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="parcerias" titulo="Nenhuma parceria disponível">
                <p className="fraco">
                  Comece propondo uma parceria entre atléticas: trocar acesso a
                  quadra e a espaço costuma não custar nada e resolve muito.
                </p>
                {minha && !propondo ? (
                  <button className="botao" onClick={() => setPropondo(true)}>
                    <Icone nome="mais" tamanho={16} /> Propor a primeira
                  </button>
                ) : null}
              </EstadoVazio>
            )
          }

          const ativas = lista.filter((p) => p.etapa === 'ATIVA')
          const disponiveis = lista.filter(
            (p) => p.etapa === 'DISPONIVEL' || p.etapa === 'INTERESSE')
          const minhas = lista.filter((p) => p.tenhoInteresse)

          const visiveis = filtro === 'TODAS'
            ? lista
            : lista.filter((p) => p.tipo === filtro)

          const contar = (t: TipoDeParceria) => lista.filter((p) => p.tipo === t).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Disponíveis" icone="parcerias" valor={disponiveis.length} />
                <Metrica rotulo="Ativas na rede" icone="certo" valor={ativas.length} />
                <Metrica rotulo="Sua atlética participa de" icone="atletica"
                         valor={minhas.length} />
                <Metrica rotulo="Atléticas interessadas" icone="rede"
                         valor={new Set(lista.flatMap(
                           (p) => p.interessadas.map((a) => a.slug))).size} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Tipos de parceria"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(TIPO) as TipoDeParceria[])
                      .filter((t) => contar(t) > 0)
                      .map((t) => ({
                        valor: t as Filtro,
                        rotulo: TIPO[t].rotulo,
                        contagem: contar(t),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((p) => (
                    <div key={p.id}
                         className={`cartao${p.tenhoInteresse ? ' cartao--destacado' : ''}`}>
                      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                        <span className="linha etiqueta" style={{ gap: '0.3rem' }}>
                          <Icone nome={TIPO[p.tipo].icone} tamanho={13} />
                          {TIPO[p.tipo].rotulo}
                        </span>
                        <span className={`etiqueta ${ETAPA[p.etapa].classe}`}>
                          {ETAPA[p.etapa].rotulo}
                        </span>
                      </div>

                      <h3 style={{ marginBottom: '0.2rem' }}>{p.titulo}</h3>
                      <div className="fraco" style={{ marginBottom: '0.6rem' }}>
                        {p.parceiroNome}
                        {p.cidade ? ` · ${p.cidade}/${p.uf}` : ''}
                      </div>

                      <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                        {p.descricao}
                      </p>

                      <div className="aviso aviso--sucesso" style={{ marginBottom: '0.9rem' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{p.beneficio}</strong>
                      </div>

                      {p.proponente ? (
                        <div className="linha" style={{ gap: '0.45rem',
                                                        marginBottom: '0.7rem' }}>
                          <Brasao atletica={p.proponente} tamanho="p" />
                          <span className="fraco">proposta por {p.proponente.nome}</span>
                        </div>
                      ) : null}

                      <div className="linha entre" style={{ marginBottom: '0.9rem' }}>
                        <div className="pilha-de-avatares">
                          {p.interessadas.slice(0, 6).map((a) => (
                            <Brasao key={a.slug} atletica={a} tamanho="p" />
                          ))}
                        </div>
                        <span className="fraco">
                          {p.interessadas.length}{' '}
                          {p.interessadas.length === 1
                            ? 'atlética interessada' : 'atléticas interessadas'}
                        </span>
                      </div>

                      {p.validade ? (
                        <div className="fraco" style={{ marginBottom: '0.7rem' }}>
                          válida até {quando(p.validade)}
                        </div>
                      ) : null}

                      {p.tenhoInteresse ? (
                        <div className="linha" style={{ gap: '0.45rem',
                                                        color: 'var(--sucesso)' }}>
                          <Icone nome="certo" tamanho={16} />
                          <span style={{ fontSize: '0.9rem' }}>
                            Sua atlética demonstrou interesse
                          </span>
                        </div>
                      ) : p.etapa === 'ENCERRADA' ? (
                        <span className="fraco">Esta parceria já foi encerrada.</span>
                      ) : (
                        <button className="botao botao--largo"
                                onClick={() => setConfirmando(p)}>
                          Tenho interesse
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Secao>

              {confirmando ? (
                <Confirmacao
                  titulo={`Demonstrar interesse em “${confirmando.titulo}”?`}
                  consequencia={
                    'Sua atlética entra na lista de interessadas e '
                    + (confirmando.proponente
                      ? `a ${confirmando.proponente.nome} recebe o contato para negociar.`
                      : 'o parceiro recebe o contato para negociar.')
                    + ' Isso não fecha acordo nenhum — a negociação continua fora daqui.'
                  }
                  rotuloDeConfirmar="Demonstrar interesse"
                  perigo={false}
                  aoConfirmar={() => {
                    void demonstrarInteresse(confirmando)
                    setConfirmando(null)
                  }}
                  aoCancelar={() => setConfirmando(null)}
                />
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

/**
 * Propor uma parceria à rede.
 *
 * <p>O benefício é campo separado da descrição, e obrigatório: "parceria com
 * a gráfica do centro" sem dizer o que a outra atlética ganha não é
 * proposta, é aviso. É o benefício que aparece no cartão e que faz alguém
 * clicar.</p>
 */
function FormularioDeParceria({ minha, aoPropor, aoCancelar }: {
  minha: AtleticaResumo
  aoPropor: (parceria: Parceria) => void
  aoCancelar: () => void
}) {
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<TipoDeParceria>('EMPRESA')
  const [parceiro, setParceiro] = useState('')
  const [descricao, setDescricao] = useState('')
  const [beneficio, setBeneficio] = useState('')
  const [validade, setValidade] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const parceria = await Dados.proporParceria(minha, {
      titulo: titulo.trim(),
      tipo,
      parceiroNome: parceiro.trim(),
      descricao: descricao.trim(),
      beneficio: beneficio.trim(),
      validade: validade === '' ? null : new Date(`${validade}T23:59:00`).toISOString(),
      cidade: minha.cidade,
      uf: minha.uf,
    })
    setSalvando(false)
    aoPropor(parceria)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Propor parceria</h3>
      <p className="fraco">
        Um desconto que você fechou sozinho vale para uma atlética. Trazido
        para a rede, vira poder de compra de vinte — e o fornecedor costuma
        melhorar a proposta por causa disso.
      </p>

      <label className="campo">
        <span className="campo__rotulo">O que é</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               required maxLength={140} autoFocus
               placeholder="Desconto em impressão de banner e faixa" />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Tipo</span>
          <select value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoDeParceria)}>
            {(Object.keys(TIPO) as TipoDeParceria[]).map((t) => (
              <option key={t} value={t}>{TIPO[t].rotulo}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span className="campo__rotulo">
            {tipo === 'ATLETICA' ? 'Atlética parceira' : 'Nome do parceiro'}
          </span>
          <input value={parceiro} onChange={(e) => setParceiro(e.target.value)}
                 required maxLength={120}
                 placeholder={tipo === 'ATLETICA' ? 'Atlética Leões' : 'Gráfica Central'} />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">O que a outra atlética ganha</span>
        <input value={beneficio} onChange={(e) => setBeneficio(e.target.value)}
               required maxLength={160}
               placeholder="20% de desconto e prazo de 5 dias" />
        <span className="campo__dica">
          É o que aparece no cartão. Sem isto, a proposta não é proposta.
        </span>
      </label>

      <label className="campo">
        <span className="campo__rotulo">Detalhes</span>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  required
                  placeholder="Como acionar, com quem falar, o que já foi combinado." />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Vale até (opcional)</span>
        <input type="date" value={validade}
               onChange={(e) => setValidade(e.target.value)} />
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !titulo.trim() || !parceiro.trim()
                  || !beneficio.trim() || !descricao.trim()}>
          {salvando ? 'Publicando…' : 'Propor à rede'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
