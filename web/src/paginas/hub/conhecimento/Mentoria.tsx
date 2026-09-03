import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { AreaDeConhecimento, OfertaDeMentoria } from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { AREA } from '../rede/PedidosDeAjuda'
import { useSessao } from '../../../sessao/SessaoContexto'
import type { AtleticaResumo } from '../../../api/tipos'

type Filtro = 'TODAS' | AreaDeConhecimento

/**
 * A mentoria entre atléticas (§53).
 *
 * <p>É a diferença entre uma resposta e um acompanhamento. Pedido de ajuda
 * resolve dúvida pontual; mentoria é uma atlética experiente andando junto
 * de outra por um semestre — para colocar a prestação de contas em dia, para
 * fechar o primeiro patrocínio, para organizar o primeiro interatlética.</p>
 */
export function Mentoria() {
  const { slug = '' } = useParams()
  const { perfil, vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [ofertando, setOfertando] = useState(false)

  const mentorias = useBusca<OfertaDeMentoria[]>(() => Dados.mentorias(), [])

  /** Troca uma oferta na lista sem refazer a busca. */
  const substituir = (m: OfertaDeMentoria) => mentorias.definir(
    (mentorias.dados ?? []).map((x) => (x.id === m.id ? m : x)))

  return (
    <div>
      <CabecalhoDePagina
        titulo="Mentoria"
        descricao="Atléticas experientes acompanhando quem está começando — por área."
        trilha={[
          { rotulo: 'Conhecimento', para: `/hub/${slug}/conhecimento` },
          { rotulo: 'Mentoria' },
        ]}
        acoes={minha ? (
          <button className="botao botao--discreto"
                  onClick={() => setOfertando((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Oferecer mentoria
          </button>
        ) : undefined}
      />

      {ofertando && minha ? (
        <FormularioDeMentoria
          minha={minha}
          nomeSugerido={perfil?.nome ?? ''}
          aoOfertar={(oferta) => {
            mentorias.definir([oferta, ...(mentorias.dados ?? [])])
            setOfertando(false)
          }}
          aoCancelar={() => setOfertando(false)}
        />
      ) : null}

      <Conteudo
        busca={mentorias}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="12rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="mentoria" titulo="Nenhuma mentoria disponível">
                <p className="fraco">
                  Se a sua atlética domina alguma área, ofereça acompanhamento.
                  É a forma mais direta de a rede crescer com qualidade.
                </p>
                {minha && !ofertando ? (
                  <button className="botao" onClick={() => setOfertando(true)}>
                    <Icone nome="mais" tamanho={16} /> Oferecer a primeira
                  </button>
                ) : null}
              </EstadoVazio>
            )
          }

          const disponiveis = lista.filter((m) => m.disponivel)
          const visiveis = filtro === 'TODAS'
            ? lista
            : lista.filter((m) => m.area === filtro)

          const contar = (a: AreaDeConhecimento) =>
            lista.filter((m) => m.area === a).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Mentorias abertas" icone="mentoria"
                         valor={disponiveis.length} />
                <Metrica rotulo="Atléticas mentoras" icone="rede"
                         valor={new Set(lista.map((m) => m.atletica.slug)).size} />
                <Metrica rotulo="Atléticas atendidas" icone="certo"
                         valor={lista.reduce((s, m) => s + m.atleticasAtendidas, 0)} />
                <Metrica rotulo="Áreas cobertas" icone="grade"
                         valor={new Set(lista.map((m) => m.area)).size} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Áreas de mentoria"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(AREA) as AreaDeConhecimento[])
                      .filter((a) => contar(a) > 0)
                      .map((a) => ({
                        valor: a as Filtro,
                        rotulo: AREA[a],
                        contagem: contar(a),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((m) => (
                    <div key={m.id}
                         className="cartao"
                         style={m.disponivel ? undefined : { opacity: 0.6 }}>
                      <div className="linha entre" style={{ marginBottom: '0.6rem' }}>
                        <span className="etiqueta">{AREA[m.area]}</span>
                        <span className={`etiqueta ${
                          m.disponivel ? 'etiqueta--sucesso' : ''}`}>
                          {m.disponivel ? 'aceitando' : 'lotada'}
                        </span>
                      </div>

                      <h3 style={{ marginBottom: '0.3rem' }}>{m.titulo}</h3>
                      <p className="fraco" style={{ marginBottom: '0.9rem' }}>
                        {m.descricao}
                      </p>

                      <div className="linha" style={{ gap: '0.5rem',
                                                      marginBottom: '0.9rem' }}>
                        <Brasao atletica={m.atletica} tamanho="m" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '0.92rem' }}>{m.atletica.nome}</strong>
                          <div className="fraco">com {m.responsavelNome}</div>
                        </div>
                      </div>

                      <div className="linha entre">
                        <span className="fraco">
                          {m.atleticasAtendidas}{' '}
                          {m.atleticasAtendidas === 1
                            ? 'atlética já atendida' : 'atléticas já atendidas'}
                        </span>
                        {minha && m.atletica.slug === minha.slug ? (
                          <button
                            className="botao botao--fantasma botao--pequeno"
                            disabled={!m.disponivel}
                            onClick={() => {
                              void Dados.encerrarMentoria(m.id)
                                .then((x) => { if (x) substituir(x) })
                            }}
                          >
                            {m.disponivel ? 'Encerrar a oferta' : 'Encerrada'}
                          </button>
                        ) : (
                          <button
                            className={m.solicitei
                              ? 'botao botao--pequeno' : 'botao botao--discreto botao--pequeno'}
                            disabled={!m.disponivel || m.solicitei}
                            title={m.disponivel ? undefined : 'Sem vaga no momento'}
                            onClick={() => {
                              void Dados.solicitarMentoria(m.id)
                                .then((x) => { if (x) substituir(x) })
                            }}
                          >
                            {m.solicitei ? 'Solicitada' : 'Solicitar'}
                          </button>
                        )}
                      </div>
                    </div>
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

/**
 * Oferecer mentoria.
 *
 * <p>O campo do responsável é obrigatório e vem preenchido com quem está
 * logado: mentoria assinada por "a atlética" é mentoria que ninguém atende.
 * Quem recebe o pedido precisa saber a quem chamar.</p>
 */
function FormularioDeMentoria({ minha, nomeSugerido, aoOfertar, aoCancelar }: {
  minha: AtleticaResumo
  nomeSugerido: string
  aoOfertar: (oferta: OfertaDeMentoria) => void
  aoCancelar: () => void
}) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [area, setArea] = useState<AreaDeConhecimento>('GESTAO')
  const [responsavel, setResponsavel] = useState(nomeSugerido)
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const oferta = await Dados.ofertarMentoria(minha, {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      area,
      responsavelNome: responsavel.trim(),
    })
    setSalvando(false)
    aoOfertar(oferta)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Oferecer mentoria</h3>
      <p className="fraco">
        Mentoria é acompanhamento, não resposta avulsa — costuma durar um
        semestre. Se a dúvida é pontual, o lugar dela é em Pedidos de ajuda.
      </p>

      <label className="campo">
        <span className="campo__rotulo">No que vocês podem acompanhar</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               required maxLength={140} autoFocus
               placeholder="Primeiro interatlética: da inscrição ao relatório" />
      </label>

      <label className="campo">
        <span className="campo__rotulo">O que está incluído</span>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  required
                  placeholder="Quantos encontros, o que vocês revisam junto, o que esperam da outra atlética." />
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Área</span>
          <select value={area}
                  onChange={(e) => setArea(e.target.value as AreaDeConhecimento)}>
            {(Object.keys(AREA) as AreaDeConhecimento[]).map((a) => (
              <option key={a} value={a}>{AREA[a]}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span className="campo__rotulo">Quem atende</span>
          <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
                 required maxLength={120} placeholder="Nome de quem vai acompanhar" />
        </label>
      </div>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !titulo.trim() || !descricao.trim()
                  || !responsavel.trim()}>
          {salvando ? 'Publicando…' : 'Publicar para a rede'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
