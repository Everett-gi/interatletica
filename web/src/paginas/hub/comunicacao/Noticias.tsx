import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Noticia, StatusDaPublicacao } from '../../../api/tipos-comunicacao'
import { Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Gaveta, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataPorExtenso, quando } from '../../../formatos'
import { corDerivada } from '../../../ui/tema'
import { useSessao } from '../../../sessao/SessaoContexto'

export const STATUS_DA_PUBLICACAO: Record<
  StatusDaPublicacao, { rotulo: string; classe: string }
> = {
  IDEIA: { rotulo: 'Ideia', classe: '' },
  PRODUCAO: { rotulo: 'Em produção', classe: 'etiqueta--alerta' },
  AGENDADO: { rotulo: 'Agendado', classe: 'etiqueta--acento' },
  PUBLICADO: { rotulo: 'Publicado', classe: 'etiqueta--sucesso' },
}

type Filtro = 'TODAS' | StatusDaPublicacao

/**
 * As notícias da atlética (§49).
 *
 * <p>Diferente do mural de avisos: aviso é operacional e some depois do
 * evento; notícia é registro e fica. É o que a próxima gestão vai ler para
 * saber o que aconteceu no ano — e o que um patrocinador vê quando procura
 * a atlética.</p>
 */
export function Noticias() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const { perfil } = useSessao()
  const [aberta, setAberta] = useState<Noticia | null>(null)
  const [escrevendo, setEscrevendo] = useState(false)

  const noticias = useBusca<Noticia[]>(() => Dados.noticias(slug), [slug])

  /** Troca a notícia na lista e, se for a aberta, também na gaveta. */
  const substituir = (n: Noticia) => {
    noticias.definir((noticias.dados ?? []).map((x) => (x.id === n.id ? n : x)))
    setAberta((atual) => (atual && atual.id === n.id ? n : atual))
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Notícias"
        descricao="O que a atlética contou para fora. Aviso é operacional; notícia é registro."
        acoes={
          <>
            <Link to={`/hub/${slug}/avisos`} className="botao botao--discreto">
              Mural de avisos
            </Link>
            {diretor ? (
              <button className="botao" onClick={() => setEscrevendo((v) => !v)}>
                <Icone nome="mais" tamanho={16} /> Nova notícia
              </button>
            ) : null}
          </>
        }
      />

      <Previa oQueFalta="Escrever e publicar notícia ainda não chegam ao servidor." />

      {escrevendo ? (
        <FormularioDeNoticia
          slug={slug}
          autorSugerido={perfil?.nome ?? ''}
          aoEscrever={(nova) => {
            noticias.definir([nova, ...(noticias.dados ?? [])])
            setEscrevendo(false)
            setAberta(nova)
          }}
          aoCancelar={() => setEscrevendo(false)}
        />
      ) : null}

      <Conteudo
        busca={noticias}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="13rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="noticias" titulo="Nenhuma notícia publicada">
                <p className="fraco">
                  Depois de cada evento, uma notícia com número. É o material que
                  entra no media kit quando a atlética for procurar patrocínio.
                </p>
              </EstadoVazio>
            )
          }

          const publicadas = lista.filter((n) => n.status === 'PUBLICADO')
          const destaque = publicadas.find((n) => n.destaque)
          const demais = lista.filter((n) => n.id !== destaque?.id)

          const visiveis = filtro === 'TODAS'
            ? demais
            : demais.filter((n) => n.status === filtro)

          const contar = (s: StatusDaPublicacao) =>
            lista.filter((n) => n.status === s).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Publicadas" icone="noticias" valor={publicadas.length} />
                <Metrica rotulo="Em produção" icone="campanhas"
                         valor={contar('PRODUCAO')} />
                <Metrica rotulo="Agendadas" icone="calendario"
                         valor={contar('AGENDADO')} />
                <Metrica rotulo="Ideias" icone="experiencias" valor={contar('IDEIA')} />
              </div>

              {destaque ? (
                <Secao titulo="Destaque">
                  <button
                    className="cartao cartao--clicavel cartao--destacado"
                    style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer',
                             width: '100%' }}
                    onClick={() => setAberta(destaque)}
                  >
                    <div
                      className="capa"
                      style={{ background: corDerivada(destaque.titulo),
                               marginBottom: '0.9rem' }}
                    >
                      <span className="etiqueta"
                            style={{ background: 'rgb(255 255 255 / 0.2)',
                                     borderColor: 'transparent', color: '#fff' }}>
                        {destaque.etiquetas[0] ?? 'notícia'}
                      </span>
                      <h2 style={{ marginTop: '0.6rem', marginBottom: '0.3rem',
                                   fontSize: '1.5rem' }}>
                        {destaque.titulo}
                      </h2>
                      <p style={{ margin: 0, opacity: 0.92 }}>{destaque.chamada}</p>
                    </div>
                    <div className="linha entre">
                      <span className="fraco">
                        por {destaque.autorNome}
                        {destaque.publicadaEm
                          ? ` · ${dataPorExtenso(destaque.publicadaEm)}` : ''}
                      </span>
                      <span className="botao botao--discreto botao--pequeno">Ler</span>
                    </div>
                  </button>
                </Secao>
              ) : null}

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Situação das notícias"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: demais.length },
                    ...(Object.keys(STATUS_DA_PUBLICACAO) as StatusDaPublicacao[])
                      .filter((s) => contar(s) > 0)
                      .map((s) => ({
                        valor: s as Filtro,
                        rotulo: STATUS_DA_PUBLICACAO[s].rotulo,
                        contagem: contar(s),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((n) => (
                    <button
                      key={n.id}
                      className="cartao cartao--clicavel"
                      style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer' }}
                      onClick={() => setAberta(n)}
                    >
                      <div
                        style={{
                          height: '6.5rem', borderRadius: 'var(--raio-m)',
                          background: corDerivada(n.titulo), marginBottom: '0.8rem',
                          display: 'grid', placeItems: 'center', color: '#fff',
                        }}
                        aria-hidden="true"
                      >
                        <Icone nome="noticias" tamanho={26} />
                      </div>

                      <div className="linha entre" style={{ marginBottom: '0.4rem' }}>
                        <span className={`etiqueta ${STATUS_DA_PUBLICACAO[n.status].classe}`}>
                          {STATUS_DA_PUBLICACAO[n.status].rotulo}
                        </span>
                        <span className="fraco">
                          {n.publicadaEm ? quando(n.publicadaEm) : 'sem data'}
                        </span>
                      </div>

                      <h3 style={{ marginBottom: '0.25rem' }}>{n.titulo}</h3>
                      <p className="fraco" style={{ marginBottom: '0.7rem' }}>
                        {n.chamada}
                      </p>

                      <div className="linha entre">
                        <span className="fraco">{n.autorNome}</span>
                        <div className="chips">
                          {n.etiquetas.map((e) => (
                            <span key={e} className="etiqueta">{e}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Secao>

              {aberta ? (
                <Gaveta titulo={aberta.titulo} aoFechar={() => setAberta(null)}>
                  <div
                    style={{
                      height: '8rem', borderRadius: 'var(--raio)',
                      background: corDerivada(aberta.titulo), marginBottom: '1rem',
                      display: 'grid', placeItems: 'center', color: '#fff',
                    }}
                    aria-hidden="true"
                  >
                    <Icone nome="noticias" tamanho={32} />
                  </div>

                  <div className="linha entre" style={{ marginBottom: '0.8rem' }}>
                    <span className={`etiqueta ${STATUS_DA_PUBLICACAO[aberta.status].classe}`}>
                      {STATUS_DA_PUBLICACAO[aberta.status].rotulo}
                    </span>
                    <span className="fraco">
                      {aberta.publicadaEm
                        ? dataPorExtenso(aberta.publicadaEm) : 'ainda sem data'}
                    </span>
                  </div>

                  <p className="suave" style={{ fontWeight: 550 }}>{aberta.chamada}</p>
                  <p className="suave" style={{ whiteSpace: 'pre-wrap' }}>{aberta.corpo}</p>

                  <hr className="divisor" />
                  <div className="linha entre">
                    <span className="fraco">por {aberta.autorNome}</span>
                    <div className="chips">
                      {aberta.etiquetas.map((e) => (
                        <span key={e} className="etiqueta">{e}</span>
                      ))}
                    </div>
                  </div>

                  {/* Publicar é o segundo gesto, separado de escrever: o que
                      a atlética manda para fora costuma passar por mais de um
                      par de olhos. */}
                  {diretor && aberta.status !== 'PUBLICADO' ? (
                    <button
                      className="botao botao--largo"
                      style={{ marginTop: '1rem' }}
                      onClick={() => {
                        void Dados.publicarNoticia(aberta.id)
                          .then((n) => { if (n) substituir(n) })
                      }}
                    >
                      <Icone nome="certo" tamanho={16} /> Publicar agora
                    </button>
                  ) : null}
                </Gaveta>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

/**
 * Escrever uma notícia.
 *
 * <p>A chamada é obrigatória e separada do corpo porque é ela que aparece
 * na lista, no card compartilhado e na página pública. Notícia sem chamada
 * vira título solto num feed — e ninguém clica em título solto.</p>
 */
function FormularioDeNoticia({ slug, autorSugerido, aoEscrever, aoCancelar }: {
  slug: string
  autorSugerido: string
  aoEscrever: (noticia: Noticia) => void
  aoCancelar: () => void
}) {
  const [titulo, setTitulo] = useState('')
  const [chamada, setChamada] = useState('')
  const [corpo, setCorpo] = useState('')
  const [autor, setAutor] = useState(autorSugerido)
  const [etiquetas, setEtiquetas] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const noticia = await Dados.escreverNoticia(slug, {
      titulo: titulo.trim(),
      chamada: chamada.trim(),
      corpo: corpo.trim(),
      autorNome: autor.trim(),
      etiquetas: etiquetas.split(',').map((x) => x.trim()).filter((x) => x !== ''),
    })
    setSalvando(false)
    aoEscrever(noticia)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Nova notícia</h3>
      <p className="fraco">
        Nasce como rascunho, igual ao evento. Publicar é um segundo gesto,
        depois de alguém reler.
      </p>

      <label className="campo">
        <span className="campo__rotulo">Título</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               required maxLength={140} autoFocus
               placeholder="Fênix leva o vôlei feminino no Interatlética de Primavera" />
      </label>

      <label className="campo">
        <span className="campo__rotulo">Chamada</span>
        <input value={chamada} onChange={(e) => setChamada(e.target.value)}
               required maxLength={200}
               placeholder="Duas viradas em três sets e o primeiro título da equipe." />
        <span className="campo__dica">
          É o que aparece na lista e no link compartilhado.
        </span>
      </label>

      <label className="campo">
        <span className="campo__rotulo">Texto</span>
        <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)}
                  required rows={7}
                  placeholder="O que aconteceu, quem participou, o que vem depois." />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Assinatura</span>
          <input value={autor} onChange={(e) => setAutor(e.target.value)}
                 required maxLength={120} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Etiquetas (opcional)</span>
          <input value={etiquetas} onChange={(e) => setEtiquetas(e.target.value)}
                 maxLength={160} placeholder="vôlei, interatlética" />
          <span className="campo__dica">Separe por vírgula.</span>
        </label>
      </div>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !titulo.trim() || !chamada.trim()
                  || !corpo.trim() || !autor.trim()}>
          {salvando ? 'Salvando…' : 'Salvar rascunho'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
