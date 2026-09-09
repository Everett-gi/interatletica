import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Amistoso, NivelDoAmistoso } from '../../../api/tipos-mercado'
import type { AtleticaResumo } from '../../../api/tipos'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Confirmacao, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

const NIVEL: Record<NivelDoAmistoso, { rotulo: string; classe: string }> = {
  INICIANTE: { rotulo: 'iniciante', classe: '' },
  INTERMEDIARIO: { rotulo: 'intermediário', classe: 'etiqueta--acento' },
  AVANCADO: { rotulo: 'avançado', classe: 'etiqueta--alerta' },
}

/**
 * A busca por adversário (§46).
 *
 * <p>O filtro por nível existe por um motivo prático: amistoso entre times de
 * níveis muito diferentes acaba em 8 a 0 e ninguém quer repetir. Declarar o
 * nível na hora de publicar é o que faz o jogo valer para os dois lados.</p>
 */
export function Amistosos() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica

  const [modalidade, setModalidade] = useState('TODAS')
  const [nivel, setNivel] = useState('TODOS')
  const [uf, setUf] = useState('TODOS')
  const [confirmando, setConfirmando] = useState<Amistoso | null>(null)
  const [publicando, setPublicando] = useState(false)

  const amistosos = useBusca<Amistoso[]>(() => Dados.amistosos(), [])

  async function demonstrarInteresse(amistoso: Amistoso) {
    if (!minha) return
    const atualizado = await Dados.demonstrarInteresseEmAmistoso(amistoso.id, minha)
    if (atualizado) {
      amistosos.definir(
        (amistosos.dados ?? []).map((a) => (a.id === amistoso.id ? atualizado : a)))
    }
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Amistosos"
        descricao="Quem está procurando adversário, em que modalidade, quando e onde."
        acoes={minha ? (
          <button className="botao" onClick={() => setPublicando((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Procurar adversário
          </button>
        ) : undefined}
      />

      {publicando && minha ? (
        <FormularioDeAmistoso
          minha={minha}
          aoPublicar={(a) => {
            amistosos.definir([a, ...(amistosos.dados ?? [])])
            setPublicando(false)
          }}
          aoCancelar={() => setPublicando(false)}
        />
      ) : null}

      <Conteudo
        busca={amistosos}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="12rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="amistosos" titulo="Nenhum amistoso publicado">
                <p className="fraco">
                  Publique o primeiro: diga modalidade, data, cidade e nível. É a
                  forma mais rápida de a sua equipe pegar ritmo antes do campeonato.
                </p>
                {minha && !publicando ? (
                  <button className="botao" onClick={() => setPublicando(true)}>
                    <Icone nome="mais" tamanho={16} /> Publicar o primeiro
                  </button>
                ) : null}
              </EstadoVazio>
            )
          }

          const modalidades = [...new Set(lista.map((a) => a.modalidade))]
          const ufs = [...new Set(lista.map((a) => a.uf))]
          const agora = Date.now()

          const visiveis = lista
            .filter((a) => modalidade === 'TODAS' || a.modalidade === modalidade)
            .filter((a) => nivel === 'TODOS' || a.nivel === nivel)
            .filter((a) => uf === 'TODOS' || a.uf === uf)
            .sort((a, b) => a.data.localeCompare(b.data))

          const abertos = lista.filter(
            (a) => a.fechadoCom === null && new Date(a.data).getTime() >= agora)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Procurando adversário" icone="amistosos"
                         valor={abertos.length} />
                <Metrica rotulo="Modalidades" icone="equipes" valor={modalidades.length} />
                <Metrica rotulo="Estados" icone="local" valor={ufs.length} />
                <Metrica rotulo="Já fechados" icone="certo"
                         valor={lista.filter((a) => a.fechadoCom !== null).length} />
              </div>

              <div className="barra-de-filtros">
                <select value={modalidade} onChange={(e) => setModalidade(e.target.value)}
                        aria-label="Filtrar por modalidade">
                  <option value="TODAS">Todas as modalidades</option>
                  {modalidades.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={nivel} onChange={(e) => setNivel(e.target.value)}
                        aria-label="Filtrar por nível">
                  <option value="TODOS">Todos os níveis</option>
                  <option value="INICIANTE">Iniciante</option>
                  <option value="INTERMEDIARIO">Intermediário</option>
                  <option value="AVANCADO">Avançado</option>
                </select>
                <select value={uf} onChange={(e) => setUf(e.target.value)}
                        aria-label="Filtrar por estado">
                  <option value="TODOS">Todos os estados</option>
                  {ufs.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <Secao>
                {visiveis.length === 0 ? (
                  <EstadoVazio icone="amistosos" titulo="Nenhum amistoso com esses filtros">
                    <p className="fraco">
                      Amplie o filtro, ou publique o seu: quem procura adversário
                      costuma achar mais rápido publicando do que esperando.
                    </p>
                  </EstadoVazio>
                ) : (
                  <div className="grade grade--larga">
                    {visiveis.map((a) => {
                      const passou = new Date(a.data).getTime() < agora
                      return (
                        <div key={a.id}
                             className={`cartao${a.tenhoInteresse ? ' cartao--destacado' : ''}`}
                             style={passou ? { opacity: 0.6 } : undefined}>
                          <div className="linha entre" style={{ marginBottom: '0.6rem' }}>
                            <span className="etiqueta etiqueta--acento">{a.modalidade}</span>
                            <span className={`etiqueta ${NIVEL[a.nivel].classe}`}>
                              nível {NIVEL[a.nivel].rotulo}
                            </span>
                          </div>

                          <div className="linha" style={{ gap: '0.55rem',
                                                          marginBottom: '0.7rem' }}>
                            <Brasao atletica={a.atletica} tamanho="m" />
                            <div style={{ minWidth: 0 }}>
                              <strong>{a.atletica.nome}</strong>
                              <div className="fraco">procura adversário</div>
                            </div>
                          </div>

                          <div className="pilha pilha--densa" style={{ marginBottom: '0.8rem' }}>
                            <div className="linha" style={{ gap: '0.45rem' }}>
                              <Icone nome="calendario" tamanho={15} />
                              <span style={{ fontSize: '0.89rem' }}>
                                {dataEHora(a.data)} · {quando(a.data)}
                              </span>
                            </div>
                            <div className="linha" style={{ gap: '0.45rem' }}>
                              <Icone nome="local" tamanho={15} />
                              <span style={{ fontSize: '0.89rem' }}>
                                {a.cidade}/{a.uf}
                              </span>
                            </div>
                            <div className="linha" style={{ gap: '0.45rem' }}>
                              <Icone nome="equipes" tamanho={15} />
                              <span style={{ fontSize: '0.89rem' }}>{a.categoria}</span>
                            </div>
                          </div>

                          {a.observacao ? (
                            <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                              {a.observacao}
                            </p>
                          ) : null}

                          {a.fechadoCom ? (
                            <div className="aviso aviso--sucesso">
                              <div className="linha" style={{ gap: '0.45rem' }}>
                                <Brasao atletica={a.fechadoCom} tamanho="p" />
                                <span style={{ fontSize: '0.9rem' }}>
                                  Fechado com {a.fechadoCom.nome}
                                </span>
                              </div>
                            </div>
                          ) : a.atletica.slug === slug ? (
                            <div className="aviso">
                              <span className="fraco">
                                Publicado pela sua atlética · {a.interessadas.length}{' '}
                                {a.interessadas.length === 1
                                  ? 'interessada' : 'interessadas'}
                              </span>
                            </div>
                          ) : a.tenhoInteresse ? (
                            <div className="linha" style={{ gap: '0.45rem',
                                                            color: 'var(--sucesso)' }}>
                              <Icone nome="certo" tamanho={16} />
                              <span style={{ fontSize: '0.9rem' }}>
                                Interesse enviado. Aguardando resposta.
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="linha entre" style={{ marginBottom: '0.7rem' }}>
                                <div className="pilha-de-avatares">
                                  {a.interessadas.slice(0, 5).map((i) => (
                                    <Brasao key={i.slug} atletica={i} tamanho="p" />
                                  ))}
                                </div>
                                <span className="fraco">
                                  {plural(a.interessadas.length, 'interessada')}
                                </span>
                              </div>
                              <button className="botao botao--largo"
                                      disabled={passou}
                                      onClick={() => setConfirmando(a)}>
                                {passou ? 'Data já passou' : 'Tenho interesse'}
                              </button>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Secao>

              {confirmando ? (
                <Confirmacao
                  titulo={`Demonstrar interesse no amistoso da ${confirmando.atletica.nome}?`}
                  consequencia={
                    `${confirmando.modalidade}, ${confirmando.categoria}, em `
                    + `${confirmando.cidade}/${confirmando.uf}. A diretoria deles `
                    + 'recebe o contato da sua atlética para combinar os detalhes.'
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
 * Publicar a procura por adversário.
 *
 * <p>Cidade, data e nível são os três campos que fazem o anúncio dar em
 * alguma coisa. Sem eles o post vira "alguém quer jogar?", que é o que já
 * não funciona no grupo de mensagens.</p>
 */
function FormularioDeAmistoso({ minha, aoPublicar, aoCancelar }: {
  minha: AtleticaResumo
  aoPublicar: (amistoso: Amistoso) => void
  aoCancelar: () => void
}) {
  const [modalidade, setModalidade] = useState('')
  const [categoria, setCategoria] = useState('Livre')
  const [data, setData] = useState(emDuasSemanas())
  const [cidade, setCidade] = useState(minha.cidade ?? '')
  const [uf, setUf] = useState(minha.uf ?? '')
  const [nivel, setNivel] = useState<NivelDoAmistoso>('INTERMEDIARIO')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const amistoso = await Dados.publicarAmistoso(minha, {
      modalidade: modalidade.trim(),
      categoria: categoria.trim() || 'Livre',
      data: new Date(data).toISOString(),
      cidade: cidade.trim(),
      uf: uf.trim().toUpperCase(),
      nivel,
      observacao: observacao.trim() === '' ? null : observacao.trim(),
    })
    setSalvando(false)
    aoPublicar(amistoso)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Procurar adversário</h3>
      <p className="fraco">
        Declare o nível de verdade. Amistoso que termina 8 a 0 não se repete,
        e é o segundo jogo que faz a equipe pegar ritmo.
      </p>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Modalidade</span>
          <input value={modalidade} onChange={(e) => setModalidade(e.target.value)}
                 required maxLength={60} autoFocus placeholder="Vôlei feminino" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Categoria</span>
          <input value={categoria} onChange={(e) => setCategoria(e.target.value)}
                 maxLength={40} placeholder="Livre" />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Quando</span>
          <input type="datetime-local" value={data} required
                 onChange={(e) => setData(e.target.value)} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Nível</span>
          <select value={nivel}
                  onChange={(e) => setNivel(e.target.value as NivelDoAmistoso)}>
            {(Object.keys(NIVEL) as NivelDoAmistoso[]).map((n) => (
              <option key={n} value={n}>{NIVEL[n].rotulo}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grade" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <label className="campo">
          <span className="campo__rotulo">Cidade</span>
          <input value={cidade} onChange={(e) => setCidade(e.target.value)}
                 required maxLength={80} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">UF</span>
          <input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())}
                 required maxLength={2} />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Observação (opcional)</span>
        <input value={observacao} onChange={(e) => setObservacao(e.target.value)}
               maxLength={200}
               placeholder="Temos quadra e arbitragem; a visitante leva o transporte." />
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !modalidade.trim() || !cidade.trim() || !uf.trim()}>
          {salvando ? 'Publicando…' : 'Publicar para a rede'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/** Padrão do campo de data: daqui a duas semanas, às 19h, em horário local. */
function emDuasSemanas(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  d.setHours(19, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    + `T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
