import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { AreaDeConhecimento, Experiencia } from '../../../api/tipos-conhecimento'
import type { AtleticaResumo } from '../../../api/tipos'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, numero } from '../../../formatos'
import { AREA } from '../rede/PedidosDeAjuda'
import { useSessao } from '../../../sessao/SessaoContexto'

type Filtro = 'TODAS' | AreaDeConhecimento

/**
 * O banco de experiências (§38).
 *
 * <p>A estrutura fixa — o que funcionou, o que não funcionou, quanto custou,
 * o que faríamos diferente — é o que separa isto de um relato solto. Sem a
 * segunda coluna, vira propaganda; sem o custo, vira conselho sem preço. As
 * quatro perguntas juntas é o que faz uma atlética conseguir decidir se
 * repete a receita.</p>
 */
export function Experiencias() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [compondo, setCompondo] = useState(false)

  const experiencias = useBusca<Experiencia[]>(() => Dados.experiencias(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="O que aprendemos"
        descricao="Relatos com número: o que deu certo, o que deu errado, quanto custou."
        trilha={[
          { rotulo: 'Conhecimento', para: `/hub/${slug}/conhecimento` },
          { rotulo: 'Experiências' },
        ]}
        acoes={minha ? (
          <button className="botao" onClick={() => setCompondo((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Registrar experiência
          </button>
        ) : undefined}
      />

      {compondo && minha ? (
        <FormularioDeExperiencia
          minha={minha}
          aoPublicar={(nova) => {
            experiencias.definir([nova, ...(experiencias.dados ?? [])])
            setCompondo(false)
          }}
          aoCancelar={() => setCompondo(false)}
        />
      ) : null}

      <Conteudo
        busca={experiencias}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="14rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="experiencias" titulo="Nenhuma experiência registrada">
                <p className="fraco">
                  Registre a primeira depois do próximo evento, enquanto os números
                  e os problemas ainda estão frescos. Duas semanas depois ninguém
                  lembra.
                </p>
              </EstadoVazio>
            )
          }

          const visiveis = filtro === 'TODAS'
            ? lista
            : lista.filter((e) => e.area === filtro)

          const contar = (a: AreaDeConhecimento) =>
            lista.filter((e) => e.area === a).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Experiências" icone="experiencias" valor={lista.length} />
                <Metrica rotulo="Atléticas que contribuíram" icone="rede"
                         valor={new Set(lista.map((e) => e.atletica.slug)).size} />
                <Metrica rotulo="Marcadas como úteis" icone="certo"
                         valor={lista.reduce((s, e) => s + e.util, 0)} />
                <Metrica rotulo="Pessoas alcançadas" icone="membros"
                         valor={numero(lista.reduce((s, e) => s + (e.publico ?? 0), 0))}
                         detalhe="somando os eventos relatados" />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Áreas"
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
                  {visiveis.map((e) => (
                    <Link
                      key={e.id}
                      to={`/hub/${slug}/conhecimento/experiencias/${e.id}`}
                      className="cartao cartao--clicavel"
                    >
                      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                        <span className="etiqueta">{AREA[e.area]}</span>
                        <span className="fraco">{e.quando}</span>
                      </div>

                      <h3 style={{ marginBottom: '0.5rem' }}>{e.titulo}</h3>

                      <div className="linha" style={{ gap: '0.45rem',
                                                      marginBottom: '0.8rem' }}>
                        <Brasao atletica={e.atletica} tamanho="p" />
                        <span className="fraco">{e.atletica.nome}</span>
                      </div>

                      <div className="linha" style={{ gap: '1.2rem',
                                                      marginBottom: '0.8rem' }}>
                        <div>
                          <div className="numero-medio" style={{ color: 'var(--sucesso)' }}>
                            {e.funcionou.length}
                          </div>
                          <div className="fraco">acertos</div>
                        </div>
                        <div>
                          <div className="numero-medio" style={{ color: 'var(--alerta)' }}>
                            {e.naoFuncionou.length}
                          </div>
                          <div className="fraco">erros</div>
                        </div>
                        {e.custo !== null ? (
                          <div>
                            <div className="numero-medio">{dinheiro(e.custo)}</div>
                            <div className="fraco">custo</div>
                          </div>
                        ) : null}
                        {e.publico !== null ? (
                          <div>
                            <div className="numero-medio">{numero(e.publico)}</div>
                            <div className="fraco">pessoas</div>
                          </div>
                        ) : null}
                      </div>

                      <div className="linha entre">
                        <span className="linha fraco" style={{ gap: '0.3rem' }}>
                          <Icone nome="certo" tamanho={13} /> {e.util} acharam útil
                        </span>
                        <span className="fraco">{e.respostas} comentários</span>
                      </div>
                    </Link>
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
 * As quatro perguntas, na ordem em que precisam ser respondidas.
 *
 * <p>"O que não funcionou" é obrigatório, e é a razão de a tela existir:
 * relato só de acerto é propaganda, e ninguém aprende com propaganda. É
 * também o campo mais difícil de escrever, então ele vem com exemplo.</p>
 */
function FormularioDeExperiencia({ minha, aoPublicar, aoCancelar }: {
  minha: AtleticaResumo
  aoPublicar: (experiencia: Experiencia) => void
  aoCancelar: () => void
}) {
  const [titulo, setTitulo] = useState('')
  const [area, setArea] = useState<AreaDeConhecimento>('EVENTOS')
  const [contexto, setContexto] = useState('')
  const [funcionou, setFuncionou] = useState('')
  const [naoFuncionou, setNaoFuncionou] = useState('')
  const [fariaDiferente, setFariaDiferente] = useState('')
  const [custo, setCusto] = useState('')
  const [publico, setPublico] = useState('')
  const [salvando, setSalvando] = useState(false)

  /** Uma linha por item: é como as pessoas escrevem lista de verdade. */
  const emLinhas = (texto: string) =>
    texto.split('\n').map((l) => l.trim()).filter((l) => l !== '')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const experiencia = await Dados.publicarExperiencia(minha, {
      titulo: titulo.trim(),
      area,
      contexto: contexto.trim(),
      funcionou: emLinhas(funcionou),
      naoFuncionou: emLinhas(naoFuncionou),
      fariaDiferente: emLinhas(fariaDiferente),
      custo: custo === '' ? null : Number(custo),
      publico: publico === '' ? null : Number(publico),
    })
    setSalvando(false)
    aoPublicar(experiencia)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Registrar experiência</h3>
      <p className="fraco">
        Escreva enquanto os números ainda estão frescos. Uma linha por item nas
        listas — é assim que fica legível para quem vai decidir se repete.
      </p>

      <label className="campo">
        <span className="campo__rotulo">O que vocês fizeram</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
               required maxLength={140} autoFocus
               placeholder="Calourada de 2026 com ingresso solidário" />
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
          <span className="campo__rotulo">Custo total (opcional)</span>
          <input type="number" min={0} value={custo}
                 onChange={(e) => setCusto(e.target.value)} placeholder="4800" />
          <span className="campo__dica">Conselho sem preço é conselho pela metade.</span>
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Contexto</span>
        <textarea value={contexto} onChange={(e) => setContexto(e.target.value)}
                  required
                  placeholder="Tamanho da atlética, época do ano, o que motivou." />
      </label>

      <label className="campo">
        <span className="campo__rotulo">O que funcionou</span>
        <textarea value={funcionou} onChange={(e) => setFuncionou(e.target.value)}
                  required
                  placeholder={'Uma linha por item:\nVenda antecipada pelo formulário\nParceria com a atlética de Direito'} />
      </label>

      <label className="campo">
        <span className="campo__rotulo">O que não funcionou</span>
        <textarea value={naoFuncionou} onChange={(e) => setNaoFuncionou(e.target.value)}
                  required
                  placeholder={'Uma linha por item:\nContratamos som demais para o espaço\nA portaria abriu meia hora atrasada'} />
        <span className="campo__dica">
          É o campo que faz este banco valer alguma coisa. Relato só de acerto
          ninguém lê para aprender.
        </span>
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Público (opcional)</span>
          <input type="number" min={0} value={publico}
                 onChange={(e) => setPublico(e.target.value)} placeholder="320" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">O que fariam diferente</span>
          <textarea value={fariaDiferente}
                    onChange={(e) => setFariaDiferente(e.target.value)}
                    placeholder={'Uma linha por item'} />
        </label>
      </div>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !titulo.trim() || !contexto.trim()
                  || !funcionou.trim() || !naoFuncionou.trim()}>
          {salvando ? 'Publicando…' : 'Publicar para a rede'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
