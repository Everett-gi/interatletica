import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Campanha } from '../../../api/tipos-comunicacao'
import { Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { percentual, plural, quando } from '../../../formatos'
import { STATUS_DA_PUBLICACAO } from './Noticias'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * As campanhas (§50).
 *
 * <p>Campanha sem meta numérica é postagem avulsa com nome bonito. Aqui toda
 * campanha declara o que quer atingir — 300 camisas, 40 novos membros — e a
 * barra mostra onde está. É o que permite decidir se vale insistir ou
 * mudar de abordagem antes do prazo acabar.</p>
 */
export function Campanhas() {
  const { slug = '' } = useParams()
  const { perfil, podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const campanhas = useBusca<Campanha[]>(() => Dados.campanhas(slug), [slug])
  const [criando, setCriando] = useState(false)

  return (
    <div>
      <CabecalhoDePagina
        titulo="Campanhas"
        descricao="Objetivo com número, calendário de conteúdo e quanto já foi atingido."
        trilha={[
          { rotulo: 'Comunicação', para: `/hub/${slug}/comunicacao` },
          { rotulo: 'Campanhas' },
        ]}
        acoes={diretor ? (
          <button className="botao" onClick={() => setCriando((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Nova campanha
          </button>
        ) : undefined}
      />

      <Previa oQueFalta="Criar campanha e agendar conteúdo ainda não chegam ao servidor." />

      {criando ? (
        <FormularioDeCampanha
          slug={slug}
          responsavelSugerido={perfil?.nome ?? ''}
          aoCriar={(c) => {
            campanhas.definir([c, ...(campanhas.dados ?? [])])
            setCriando(false)
          }}
          aoCancelar={() => setCriando(false)}
        />
      ) : null}

      <Conteudo
        busca={campanhas}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1].map((i) => <Esqueleto key={i} altura="14rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="campanhas" titulo="Nenhuma campanha ativa">
                <p className="fraco">
                  Uma campanha é uma meta com prazo e um calendário de conteúdo.
                  Post feito na véspera é post sem foto boa e sem revisão.
                </p>
              </EstadoVazio>
            )
          }

          const conteudos = lista.flatMap((c) => c.conteudos)
          const publicados = conteudos.filter((c) => c.status === 'PUBLICADO')
          const proximos = conteudos
            .filter((c) => c.status === 'AGENDADO' || c.status === 'PRODUCAO')
            .sort((a, b) => a.publicarEm.localeCompare(b.publicarEm))

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Campanhas" icone="campanhas" valor={lista.length} />
                <Metrica rotulo="Conteúdos publicados" icone="certo"
                         valor={publicados.length} />
                <Metrica rotulo="Na fila" icone="relogio" valor={proximos.length}
                         cor={proximos.length > 6 ? 'var(--alerta)' : undefined} />
                <Metrica rotulo="Ideias sem responsável" icone="alerta"
                         valor={conteudos.filter(
                           (c) => c.status === 'IDEIA' && c.responsavelNome === null).length} />
              </div>

              <div className="detalhe">
                <div>
                  <Secao titulo="Campanhas em curso">
                    <div className="pilha">
                      {lista.map((c) => {
                        const proporcao = c.atual / c.metaValor
                        const feitos = c.conteudos.filter(
                          (x) => x.status === 'PUBLICADO').length
                        return (
                          <Link
                            key={c.id}
                            to={`/hub/${slug}/comunicacao/campanhas/${c.id}`}
                            className="cartao cartao--clicavel"
                          >
                            <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
                              <h3 style={{ marginBottom: 0 }}>{c.nome}</h3>
                              <span className="fraco">termina {quando(c.fimEm)}</span>
                            </div>
                            <p className="fraco" style={{ marginBottom: '0.9rem' }}>
                              {c.objetivo}
                            </p>

                            <div className="linha entre" style={{ marginBottom: '0.3rem' }}>
                              <span className="fraco">
                                {c.atual} de {c.metaValor} {c.metaUnidade}
                              </span>
                              <strong>{percentual(proporcao)}</strong>
                            </div>
                            <Progresso
                              proporcao={proporcao}
                              tom={proporcao >= 1 ? 'sucesso'
                                : proporcao < 0.4 ? 'alerta' : undefined}
                            />

                            <div className="linha entre" style={{ marginTop: '0.8rem' }}>
                              <span className="fraco">
                                {feitos} de {plural(c.conteudos.length, 'conteúdo')}{' '}
                                {c.conteudos.length === 1 ? 'publicado' : 'publicados'}
                              </span>
                              {c.responsavelNome ? (
                                <span className="etiqueta">{c.responsavelNome}</span>
                              ) : null}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </Secao>
                </div>

                <div>
                  <Secao
                    titulo="Calendário editorial"
                    descricao="O que sai nas próximas semanas, em todas as campanhas."
                  >
                    {proximos.length === 0 ? (
                      <EstadoVazio titulo="Nada na fila" />
                    ) : (
                      <div className="pilha pilha--densa">
                        {proximos.slice(0, 8).map((c) => (
                          <div key={c.id} className="cartao cartao--compacto linha entre">
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 550, fontSize: '0.9rem' }}>
                                {c.titulo}
                              </div>
                              <div className="fraco">
                                {c.canal.toLowerCase()} ·{' '}
                                {c.responsavelNome ?? 'sem responsável'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span className={`etiqueta ${
                                STATUS_DA_PUBLICACAO[c.status].classe}`}>
                                {STATUS_DA_PUBLICACAO[c.status].rotulo}
                              </span>
                              <div className="fraco">{quando(c.publicarEm)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Secao>
                </div>
              </div>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

const UNIDADES_DE_META = [
  'camisas', 'novos membros', 'inscrições', 'reais', 'seguidores',
  'presenças', 'doações',
]

/**
 * Criar uma campanha.
 *
 * <p>Meta com número e unidade, como as metas da gestão: "aumentar o
 * engajamento" não fecha o mês com resposta. O calendário de conteúdo entra
 * depois, na ficha — pedir tudo no cadastro é o que faz a campanha nunca
 * sair do papel.</p>
 */
function FormularioDeCampanha({ slug, responsavelSugerido, aoCriar, aoCancelar }: {
  slug: string
  responsavelSugerido: string
  aoCriar: (campanha: Campanha) => void
  aoCancelar: () => void
}) {
  const [nome, setNome] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [meta, setMeta] = useState('')
  const [unidade, setUnidade] = useState(UNIDADES_DE_META[0])
  const [inicio, setInicio] = useState(hoje(0))
  const [fim, setFim] = useState(hoje(30))
  const [responsavel, setResponsavel] = useState(responsavelSugerido)
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const campanha = await Dados.criarCampanha(slug, {
      nome: nome.trim(),
      objetivo: objetivo.trim(),
      metaValor: Number(meta) || 0,
      metaUnidade: unidade,
      inicioEm: new Date(`${inicio}T00:00:00`).toISOString(),
      fimEm: new Date(`${fim}T23:59:00`).toISOString(),
      responsavelNome: responsavel.trim() === '' ? null : responsavel.trim(),
    })
    setSalvando(false)
    aoCriar(campanha)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Nova campanha</h3>
      <p className="fraco">
        Declare o número que você quer atingir. É ele que permite decidir, na
        metade do prazo, se vale insistir ou mudar de abordagem.
      </p>

      <label className="campo">
        <span className="campo__rotulo">Nome</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)}
               required maxLength={120} autoFocus
               placeholder="Camisa de torcida 2027" />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Objetivo</span>
        <textarea value={objetivo} onChange={(e) => setObjetivo(e.target.value)}
                  required rows={3}
                  placeholder="Vender a nova camisa antes do interatlética e financiar o transporte." />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Meta</span>
          <input type="number" min={1} value={meta} required
                 onChange={(e) => setMeta(e.target.value)} placeholder="300" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Unidade</span>
          <input value={unidade} onChange={(e) => setUnidade(e.target.value)}
                 required maxLength={40} list="unidades-de-meta" />
          <datalist id="unidades-de-meta">
            {UNIDADES_DE_META.map((u) => <option key={u} value={u} />)}
          </datalist>
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Começa</span>
          <input type="date" value={inicio} required
                 onChange={(e) => setInicio(e.target.value)} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Termina</span>
          <input type="date" value={fim} required
                 onChange={(e) => setFim(e.target.value)} />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Quem cuida</span>
        <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
               maxLength={120} />
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !nome.trim() || !objetivo.trim() || !meta}>
          {salvando ? 'Criando…' : 'Criar campanha'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/** Data local no formato do <input type="date">, deslocada em dias. */
function hoje(desloc: number): string {
  const d = new Date()
  d.setDate(d.getDate() + desloc)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
