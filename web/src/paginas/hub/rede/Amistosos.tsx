import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Amistoso, NivelDoAmistoso } from '../../../api/tipos-mercado'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Confirmacao, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { dataEHora, quando } from '../../../formatos'
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
        acoes={
          <button className="botao" disabled
                  title="Publicar amistoso chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Procurar adversário
          </button>
        }
      />

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
                                  {a.interessadas.length} interessadas
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
