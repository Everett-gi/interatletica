import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Viagem } from '../../../api/tipos-esportes'
import { Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Progresso, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, dinheiro, plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

/**
 * As viagens da atlética (§47).
 *
 * <p>Os dois números que mais dão dor de cabeça em véspera de viagem estão
 * no cartão: quantos já pagaram e quantos documentos faltam. Descobrir na
 * rodoviária que três atletas não entregaram autorização é o tipo de
 * problema que só a lista resolve — e resolve antes.</p>
 */
export function Viagens() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const { perfil } = useSessao()
  const viagens = useBusca<Viagem[]>(() => Dados.viagens(slug), [slug])
  const [criando, setCriando] = useState(false)

  return (
    <div>
      <CabecalhoDePagina
        titulo="Viagens"
        descricao="Transporte, hospedagem, pagamentos e documentos de cada deslocamento."
        acoes={diretor ? (
          <button className="botao" onClick={() => setCriando((v) => !v)}>
            <Icone nome="mais" tamanho={16} /> Nova viagem
          </button>
        ) : undefined}
      />

      <Previa oQueFalta="Criar viagem e controlar pagamento ainda não chegam ao servidor." />

      {criando ? (
        <FormularioDeViagem
          slug={slug}
          responsavelSugerido={perfil?.nome ?? ''}
          aoCriar={(v) => {
            viagens.definir([v, ...(viagens.dados ?? [])])
            setCriando(false)
          }}
          aoCancelar={() => setCriando(false)}
        />
      ) : null}

      <Conteudo busca={viagens} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="viagens" titulo="Nenhuma viagem registrada">
                <p className="fraco">
                  Registrar a viagem cedo é o que permite orçar transporte com
                  três empresas em vez de fechar com a única disponível na véspera.
                </p>
              </EstadoVazio>
            )
          }

          const agora = Date.now()
          const proximas = lista
            .filter((v) => new Date(v.saidaEm).getTime() >= agora)
            .sort((a, b) => a.saidaEm.localeCompare(b.saidaEm))
          const passadas = lista
            .filter((v) => new Date(v.saidaEm).getTime() < agora)
            .sort((a, b) => b.saidaEm.localeCompare(a.saidaEm))

          const pendentes = proximas.reduce((s, v) => s + v.documentosPendentes, 0)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.5rem' }}>
                <Metrica rotulo="Viagens marcadas" icone="viagens" valor={proximas.length} />
                <Metrica rotulo="Passageiros" icone="membros"
                         valor={proximas.reduce((s, v) => s + v.passageiros, 0)} />
                <Metrica
                  rotulo="Documentos pendentes" icone="alerta" valor={pendentes}
                  cor={pendentes > 0 ? 'var(--alerta)' : undefined}
                  detalhe={pendentes > 0 ? 'resolver antes do embarque' : 'tudo entregue'}
                />
                <Metrica
                  rotulo="A receber dos passageiros" icone="financeiro"
                  valor={dinheiro(proximas.reduce(
                    (s, v) => s + (v.custoPorPessoa ?? 0) * (v.passageiros - v.pagos), 0))}
                />
              </div>

              <Secao titulo="Próximas">
                {proximas.length === 0 ? (
                  <EstadoVazio titulo="Nenhuma viagem marcada" />
                ) : (
                  <div className="grade grade--larga">
                    {proximas.map((v) => <CartaoDeViagem key={v.id} viagem={v} />)}
                  </div>
                )}
              </Secao>

              {passadas.length > 0 ? (
                <Secao titulo="Realizadas">
                  <div className="pilha pilha--densa">
                    {passadas.map((v) => (
                      <div key={v.id} className="cartao cartao--compacto linha entre">
                        <div style={{ minWidth: 0 }}>
                          <strong>{v.destino}</strong>
                          <div className="fraco">
                            {v.motivo} · {v.passageiros} passageiros · {quando(v.saidaEm)}
                          </div>
                        </div>
                        {v.custoPorPessoa !== null ? (
                          <span className="etiqueta">
                            {dinheiro(v.custoPorPessoa)} por pessoa
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Secao>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}

function CartaoDeViagem({ viagem }: { viagem: Viagem }) {
  const ocupacao = viagem.passageiros / viagem.vagas
  const pagamento = viagem.passageiros === 0 ? 0 : viagem.pagos / viagem.passageiros

  return (
    <div className="cartao">
      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
        <span className="etiqueta etiqueta--acento">{quando(viagem.saidaEm)}</span>
        {viagem.documentosPendentes > 0 ? (
          <span className="etiqueta etiqueta--alerta">
            {viagem.documentosPendentes} docs pendentes
          </span>
        ) : (
          <span className="etiqueta etiqueta--sucesso">documentos ok</span>
        )}
      </div>

      <h3 style={{ marginBottom: '0.15rem' }}>{viagem.destino}</h3>
      <div className="fraco" style={{ marginBottom: '0.9rem' }}>{viagem.motivo}</div>

      <div className="pilha pilha--densa" style={{ marginBottom: '0.9rem' }}>
        <Linha icone="calendario"
               texto={`${dataEHora(viagem.saidaEm)} → ${dataEHora(viagem.retornoEm)}`} />
        {viagem.transporte ? <Linha icone="viagens" texto={viagem.transporte} /> : null}
        {viagem.hospedagem ? <Linha icone="local" texto={viagem.hospedagem} /> : null}
        {viagem.responsavelNome ? (
          <Linha icone="usuario" texto={`Responsável: ${viagem.responsavelNome}`} />
        ) : null}
      </div>

      <div style={{ marginBottom: '0.6rem' }}>
        <div className="linha entre" style={{ marginBottom: '0.2rem' }}>
          <span className="fraco">Ocupação</span>
          <span className="fraco">{viagem.passageiros} de {plural(viagem.vagas, 'vaga')}</span>
        </div>
        <Progresso proporcao={ocupacao} tom={ocupacao >= 1 ? 'sucesso' : undefined} />
      </div>

      <div>
        <div className="linha entre" style={{ marginBottom: '0.2rem' }}>
          <span className="fraco">Pagamentos</span>
          <span className="fraco">
            {viagem.pagos} de {viagem.passageiros}
            {viagem.custoPorPessoa !== null
              ? ` · ${dinheiro(viagem.custoPorPessoa)} cada` : ''}
          </span>
        </div>
        <Progresso proporcao={pagamento}
                   tom={pagamento < 0.5 ? 'alerta' : pagamento >= 1 ? 'sucesso' : undefined} />
      </div>
    </div>
  )
}

function Linha({ icone, texto }: { icone: 'calendario' | 'viagens' | 'local' | 'usuario'; texto: string }) {
  return (
    <div className="linha" style={{ gap: '0.45rem' }}>
      <span style={{ color: 'var(--texto-fraco)' }}><Icone nome={icone} tamanho={15} /></span>
      <span style={{ fontSize: '0.88rem' }}>{texto}</span>
    </div>
  )
}

/**
 * Criar uma viagem.
 *
 * <p>Vagas e custo por pessoa entram no cadastro porque são as duas
 * perguntas que chegam no minuto seguinte ao anúncio. Sem elas, a viagem
 * publicada gera trinta mensagens no grupo perguntando a mesma coisa.</p>
 */
function FormularioDeViagem({ slug, responsavelSugerido, aoCriar, aoCancelar }: {
  slug: string
  responsavelSugerido: string
  aoCriar: (viagem: Viagem) => void
  aoCancelar: () => void
}) {
  const [destino, setDestino] = useState('')
  const [motivo, setMotivo] = useState('')
  const [saida, setSaida] = useState(emUmMes(6))
  const [retorno, setRetorno] = useState(emUmMes(22))
  const [vagas, setVagas] = useState('40')
  const [transporte, setTransporte] = useState('')
  const [hospedagem, setHospedagem] = useState('')
  const [custo, setCusto] = useState('')
  const [responsavel, setResponsavel] = useState(responsavelSugerido)
  const [salvando, setSalvando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const viagem = await Dados.criarViagem(slug, {
      destino: destino.trim(),
      motivo: motivo.trim(),
      saidaEm: new Date(saida).toISOString(),
      retornoEm: new Date(retorno).toISOString(),
      vagas: Number(vagas) || 1,
      transporte: transporte.trim() === '' ? null : transporte.trim(),
      hospedagem: hospedagem.trim() === '' ? null : hospedagem.trim(),
      custoPorPessoa: custo === '' ? null : Number(custo),
      responsavelNome: responsavel.trim() === '' ? null : responsavel.trim(),
    })
    setSalvando(false)
    aoCriar(viagem)
  }

  return (
    <form className="cartao" style={{ marginBottom: '1.4rem' }}
          onSubmit={(e) => void enviar(e)}>
      <h3>Nova viagem</h3>
      <p className="fraco">
        Registrar cedo é o que permite orçar transporte com três empresas em
        vez de fechar com a única disponível na véspera.
      </p>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Destino</span>
          <input value={destino} onChange={(e) => setDestino(e.target.value)}
                 required maxLength={120} autoFocus placeholder="Porto Aurora, PR" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Motivo</span>
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)}
                 required maxLength={140} placeholder="Interatlética Regional" />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Saída</span>
          <input type="datetime-local" value={saida} required
                 onChange={(e) => setSaida(e.target.value)} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Retorno</span>
          <input type="datetime-local" value={retorno} required
                 onChange={(e) => setRetorno(e.target.value)} />
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Vagas</span>
          <input type="number" min={1} value={vagas} required
                 onChange={(e) => setVagas(e.target.value)} />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Custo por pessoa (opcional)</span>
          <input type="number" min={0} value={custo}
                 onChange={(e) => setCusto(e.target.value)} placeholder="180" />
          <span className="campo__dica">
            A plataforma não cobra ninguém — o valor aqui é para combinar.
          </span>
        </label>
      </div>

      <div className="grade grade--dupla">
        <label className="campo">
          <span className="campo__rotulo">Transporte (opcional)</span>
          <input value={transporte} onChange={(e) => setTransporte(e.target.value)}
                 maxLength={120} placeholder="Ônibus fretado, saída do campus" />
        </label>

        <label className="campo">
          <span className="campo__rotulo">Hospedagem (opcional)</span>
          <input value={hospedagem} onChange={(e) => setHospedagem(e.target.value)}
                 maxLength={120} placeholder="Alojamento da atlética anfitriã" />
        </label>
      </div>

      <label className="campo">
        <span className="campo__rotulo">Quem organiza</span>
        <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
               maxLength={120} />
      </label>

      <div className="linha">
        <button className="botao" type="submit"
                disabled={salvando || !destino.trim() || !motivo.trim()}>
          {salvando ? 'Criando…' : 'Criar viagem'}
        </button>
        <button className="botao botao--fantasma" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/** Padrão dos campos de data: daqui a um mês, na hora indicada. */
function emUmMes(hora: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setHours(hora, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    + `T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
