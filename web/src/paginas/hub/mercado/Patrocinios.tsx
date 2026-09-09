import { useState, type DragEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { EtapaDoPatrocinio, Patrocinio } from '../../../api/tipos-financeiro'
import { Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  Gaveta,
  Secao,
  Segmentado,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dinheiro, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

const ETAPAS: { etapa: EtapaDoPatrocinio; rotulo: string }[] = [
  { etapa: 'PROSPECCAO', rotulo: 'Prospecção' },
  { etapa: 'CONTATO', rotulo: 'Contato' },
  { etapa: 'NEGOCIACAO', rotulo: 'Negociação' },
  { etapa: 'APROVADO', rotulo: 'Aprovado' },
  { etapa: 'CONTRATO', rotulo: 'Contrato' },
  { etapa: 'ATIVO', rotulo: 'Ativo' },
  { etapa: 'ENCERRADO', rotulo: 'Encerrado' },
]

type Visao = 'PIPELINE' | 'LISTA'

/**
 * O funil de patrocínio (§44).
 *
 * <p>Pipeline e não lista, porque a pergunta do diretor financeiro não é
 * "quais empresas conhecemos" — é "o que está travado e há quanto tempo".
 * Um card parado três semanas em "contato" é um follow-up que ninguém fez,
 * e isso só aparece quando as etapas ficam lado a lado.</p>
 */
export function Patrocinios() {
  const { slug = '' } = useParams()
  const [visao, setVisao] = useState<Visao>('PIPELINE')
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<EtapaDoPatrocinio | null>(null)
  const [aberto, setAberto] = useState<Patrocinio | null>(null)
  const [prospectando, setProspectando] = useState(false)
  const { perfil, podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')

  const patrocinios = useBusca<Patrocinio[]>(() => Dados.patrocinios(slug), [slug])

  async function mover(id: string, etapa: EtapaDoPatrocinio) {
    const atuais = patrocinios.dados ?? []
    patrocinios.definir(atuais.map((p) => (p.id === id ? { ...p, etapa } : p)))
    await Dados.moverPatrocinio(id, etapa)
  }

  function aoSoltar(e: DragEvent, etapa: EtapaDoPatrocinio) {
    e.preventDefault()
    setAlvo(null)
    if (arrastando) {
      void mover(arrastando, etapa)
      setArrastando(null)
    }
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Patrocínios"
        descricao="Da primeira lista de empresas ao contrato assinado, com as contrapartidas a entregar."
        acoes={
          <>
            <Segmentado
              rotulo="Forma de ver o funil"
              atual={visao}
              aoTrocar={setVisao}
              opcoes={[
                { valor: 'PIPELINE', rotulo: 'Funil', icone: 'tarefas' },
                { valor: 'LISTA', rotulo: 'Lista', icone: 'lista' },
              ]}
            />
            {diretor ? (
              <button className="botao" onClick={() => setProspectando((v) => !v)}>
                <Icone nome="mais" tamanho={16} /> Novo prospect
              </button>
            ) : null}
          </>
        }
      />

      <Previa oQueFalta="Cadastrar e mover patrocínio ainda não chegam ao servidor." />

      {prospectando ? (
        <FormularioDePatrocinio
          slug={slug}
          responsavelSugerido={perfil?.nome ?? ''}
          aoAbrir={(p) => {
            patrocinios.definir([p, ...(patrocinios.dados ?? [])])
            setProspectando(false)
          }}
          aoCancelar={() => setProspectando(false)}
        />
      ) : null}

      <Conteudo busca={patrocinios} esqueleto={<Esqueleto altura="18rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="patrocinios" titulo="Nenhum patrocínio no funil">
                <p className="fraco">
                  Comece pelo comércio a 500 metros do campus: não é a marca
                  nacional que patrocina atlética no primeiro ano, é a lanchonete
                  que já vive do movimento dos alunos.
                </p>
              </EstadoVazio>
            )
          }

          const ativos = lista.filter((p) => p.etapa === 'ATIVO')
          const emNegociacao = lista.filter(
            (p) => p.etapa === 'NEGOCIACAO' || p.etapa === 'APROVADO' || p.etapa === 'CONTRATO')
          const contratado = ativos.reduce((s, p) => s + (p.valor ?? 0), 0)
          const potencial = emNegociacao.reduce((s, p) => s + (p.valor ?? 0), 0)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Patrocínios ativos" icone="patrocinios"
                         valor={ativos.length} />
                <Metrica rotulo="Contratado no ano" icone="financeiro"
                         valor={dinheiro(contratado)} cor="var(--sucesso)" />
                <Metrica rotulo="Em negociação" icone="parcerias"
                         valor={dinheiro(potencial)}
                         detalhe={`${emNegociacao.length} conversas abertas`} />
                <Metrica rotulo="No funil" icone="lista" valor={lista.length} />
              </div>

              {visao === 'PIPELINE' ? (
                <div className="pipeline">
                  {ETAPAS.map((coluna) => {
                    const daEtapa = lista.filter((p) => p.etapa === coluna.etapa)
                    const valor = daEtapa.reduce((s, p) => s + (p.valor ?? 0), 0)

                    return (
                      <div
                        key={coluna.etapa}
                        className={`coluna ${alvo === coluna.etapa ? 'coluna--alvo' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setAlvo(coluna.etapa) }}
                        onDragLeave={() => setAlvo(null)}
                        onDrop={(e) => aoSoltar(e, coluna.etapa)}
                      >
                        <div className="coluna__titulo">
                          <span>{coluna.rotulo}</span>
                          <span>{daEtapa.length}</span>
                        </div>

                        {valor > 0 ? (
                          <div className="fraco" style={{ marginBottom: '0.5rem' }}>
                            {dinheiro(valor)}
                          </div>
                        ) : null}

                        {daEtapa.map((p) => (
                          <article
                            key={p.id}
                            className={`ficha ${arrastando === p.id ? 'ficha--arrastando' : ''}`}
                            draggable
                            onDragStart={() => setArrastando(p.id)}
                            onDragEnd={() => setArrastando(null)}
                            onClick={() => setAberto(p)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                              {p.empresa}
                            </div>
                            <div className="fraco" style={{ marginBottom: '0.4rem' }}>
                              {p.segmento}
                            </div>
                            {p.valor !== null ? (
                              <div className="etiqueta etiqueta--acento">
                                {dinheiro(p.valor)}
                              </div>
                            ) : null}
                            <div className="fraco" style={{ marginTop: '0.4rem' }}>
                              atualizado {quando(p.atualizadoEm)}
                            </div>
                          </article>
                        ))}

                        {daEtapa.length === 0 ? (
                          <div className="fraco" style={{ padding: '0.5rem',
                                                          textAlign: 'center' }}>
                            vazio
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Secao>
                  <div className="rolagem">
                    <table className="tabela-cartoes">
                      <thead>
                        <tr>
                          <th>Empresa</th>
                          <th>Etapa</th>
                          <th className="numero">Valor</th>
                          <th>Responsável</th>
                          <th>Atualizado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map((p) => (
                          <tr key={p.id} onClick={() => setAberto(p)}
                              style={{ cursor: 'pointer' }}>
                            <td data-rotulo="Empresa">
                              <div style={{ fontWeight: 550 }}>{p.empresa}</div>
                              <div className="fraco">{p.segmento}</div>
                            </td>
                            <td data-rotulo="Etapa">
                              <span className={`etiqueta ${
                                p.etapa === 'ATIVO' ? 'etiqueta--sucesso'
                                  : p.etapa === 'ENCERRADO' ? '' : 'etiqueta--acento'}`}>
                                {ETAPAS.find((e) => e.etapa === p.etapa)?.rotulo}
                              </span>
                            </td>
                            <td data-rotulo="Valor" className="numero">
                              {p.valor === null ? '—' : dinheiro(p.valor)}
                            </td>
                            <td data-rotulo="Responsável">{p.responsavelNome ?? '—'}</td>
                            <td data-rotulo="Atualizado">{quando(p.atualizadoEm)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Secao>
              )}

              {aberto ? (
                <Gaveta titulo={aberto.empresa} aoFechar={() => setAberto(null)}>
                  <div className="linha entre" style={{ marginBottom: '1rem' }}>
                    <span className="etiqueta etiqueta--acento">
                      {ETAPAS.find((e) => e.etapa === aberto.etapa)?.rotulo}
                    </span>
                    {aberto.valor !== null ? (
                      <span className="numero-medio">{dinheiro(aberto.valor)}</span>
                    ) : null}
                  </div>

                  <div className="pilha pilha--densa" style={{ marginBottom: '1.2rem' }}>
                    <Campo rotulo="Segmento" valor={aberto.segmento} />
                    <Campo rotulo="Contato" valor={aberto.contatoNome ?? '—'} />
                    <Campo rotulo="E-mail" valor={aberto.contatoEmail ?? '—'} />
                    <Campo rotulo="Responsável" valor={aberto.responsavelNome ?? '—'} />
                    <Campo
                      rotulo="Vigência"
                      valor={aberto.inicioEm && aberto.fimEm
                        ? `${quando(aberto.inicioEm)} até ${quando(aberto.fimEm)}`
                        : '—'}
                    />
                  </div>

                  <h3>Contrapartidas</h3>
                  {aberto.contrapartidas.length === 0 ? (
                    <div className="aviso aviso--alerta">
                      <strong>Sem contrapartida definida</strong>
                      <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                        Patrocínio sem contrapartida escrita vira doação — e doação
                        não renova. Defina o que a empresa recebe antes de falar
                        em valor.
                      </p>
                    </div>
                  ) : (
                    <div className="pilha pilha--densa">
                      {aberto.contrapartidas.map((c) => (
                        <div key={c} className="linha" style={{ gap: '0.5rem' }}>
                          <span style={{ color: 'var(--sucesso)' }}>
                            <Icone nome="certo" tamanho={16} />
                          </span>
                          <span style={{ fontSize: '0.9rem' }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {aberto.observacao ? (
                    <>
                      <h3 style={{ marginTop: '1.2rem' }}>Observação</h3>
                      <p className="suave" style={{ margin: 0 }}>{aberto.observacao}</p>
                    </>
                  ) : null}

                  <h3 style={{ marginTop: '1.2rem' }}>Mover para</h3>
                  <div className="chips">
                    {ETAPAS.filter((e) => e.etapa !== aberto.etapa).map((e) => (
                      <button
                        key={e.etapa}
                        className="chip"
                        onClick={() => {
                          void mover(aberto.id, e.etapa)
                          setAberto({ ...aberto, etapa: e.etapa })
                        }}
                      >
                        {e.rotulo}
                      </button>
                    ))}
                  </div>
                </Gaveta>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="linha entre" style={{ borderBottom: '1px solid var(--borda)',
                                          paddingBottom: '0.4rem' }}>
      <span className="fraco">{rotulo}</span>
      <span style={{ fontWeight: 550, textAlign: 'right' }}>{valor}</span>
    </div>
  )
}

/**
 * Abrir um prospect no funil.
 *
 * <p>As contrapartidas são o campo que separa patrocínio de doação: sem
 * dizer o que a atlética entrega, a conversa com a empresa não tem como
 * avançar — e a diretoria seguinte não sabe o que foi prometido.</p>
 */
function FormularioDePatrocinio({ slug, responsavelSugerido, aoAbrir, aoCancelar }: {
  slug: string
  responsavelSugerido: string
  aoAbrir: (patrocinio: Patrocinio) => void
  aoCancelar: () => void
}) {
  const [empresa, setEmpresa] = useState('')
  const [segmento, setSegmento] = useState('')
  const [contatoNome, setContatoNome] = useState('')
  const [contatoEmail, setContatoEmail] = useState('')
  const [valor, setValor] = useState('')
  const [contrapartidas, setContrapartidas] = useState('')
  const [responsavel, setResponsavel] = useState(responsavelSugerido)
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const patrocinio = await Dados.abrirPatrocinio(slug, {
      empresa: empresa.trim(),
      segmento: segmento.trim(),
      contatoNome: contatoNome.trim() === '' ? null : contatoNome.trim(),
      contatoEmail: contatoEmail.trim() === '' ? null : contatoEmail.trim(),
      valor: valor === '' ? null : Number(valor),
      contrapartidas: contrapartidas.split('\n')
        .map((x) => x.trim()).filter((x) => x !== ''),
      responsavelNome: responsavel.trim() === '' ? null : responsavel.trim(),
      observacao: observacao.trim() === '' ? null : observacao.trim(),
    })
    setSalvando(false)
    aoAbrir(patrocinio)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Novo prospect</h3>
      <p className="fraco">
        Entra em prospecção, mesmo que a conversa ainda nem tenha começado. O
        funil só serve se registrar também o que não fechou — é o que responde
        "com quem já falamos?" no ano que vem.
      </p>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Empresa</span>
          <input value={empresa} onChange={(e) => setEmpresa(e.target.value)}
                 required maxLength={120} autoFocus placeholder="Ótica Vale" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Segmento</span>
          <input value={segmento} onChange={(e) => setSegmento(e.target.value)}
                 required maxLength={80} placeholder="Varejo óptico" />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Quem é o contato</span>
          <input value={contatoNome} onChange={(e) => setContatoNome(e.target.value)}
                 maxLength={120} placeholder="Nome de quem decide" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">E-mail do contato</span>
          <input type="email" value={contatoEmail}
                 onChange={(e) => setContatoEmail(e.target.value)}
                 maxLength={180} placeholder="contato@empresa.com.br" />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">O que vamos entregar</span>
        <textarea value={contrapartidas}
                  onChange={(e) => setContrapartidas(e.target.value)}
                  rows={4}
                  placeholder={'Uma linha por contrapartida:\nLogo na camisa de jogo\nPost no Instagram a cada rodada\nBanner no ginásio'} />
        <span className="campo__dica">
          Sem isto, patrocínio vira doação — e doação não se renova.
        </span>
      </label>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Valor pretendido (opcional)</span>
          <input type="number" min={0} value={valor}
                 onChange={(e) => setValor(e.target.value)} placeholder="3000" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Quem cuida disto</span>
          <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
                 maxLength={120} />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Observação (opcional)</span>
        <input value={observacao} onChange={(e) => setObservacao(e.target.value)}
               maxLength={200}
               placeholder="Indicação da Atlética Leões; renovam contrato em março." />
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !empresa.trim() || !segmento.trim()}>
          {salvando ? 'Abrindo…' : 'Abrir no funil'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
