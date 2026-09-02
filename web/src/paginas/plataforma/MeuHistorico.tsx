import { Link } from 'react-router-dom'
import { Dados } from '../../dados'
import type { Inscricao } from '../../api/tipos'
import type { Equipe } from '../../api/tipos-rede'
import type { Conquista } from '../../api/tipos-plataforma'
import {
  Avatar,
  Brasao,
  Conteudo,
  Esqueleto,
  Metrica,
  rotuloDoPapel,
  useBusca,
} from '../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  ItemDaLinha,
  LinhaDoTempo,
  Secao,
} from '../../ui/pagina'
import { Icone } from '../../ui/icones'
import { dataEHora, quando } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

interface Composicao {
  inscricoes: Inscricao[]
  equipes: Equipe[]
  conquistas: Conquista[]
}

/**
 * O histórico da pessoa dentro da rede (§56).
 *
 * <p>Não é currículo profissional, e o texto na tela diz isso: é histórico
 * institucional. Serve para responder "o que eu fiz na atlética" quando a
 * memória falha — e para a próxima diretoria saber quem já organizou o quê.</p>
 */
export function MeuHistorico() {
  const { perfil, carregando } = useSessao()

  const busca = useBusca<Composicao>(async () => {
    if (!perfil) return { inscricoes: [], equipes: [], conquistas: [] }
    // As conquistas são da atlética, não da pessoa. Aqui aparecem as do
    // primeiro vínculo — que é onde a participação de quem está lendo pesa.
    const principal = perfil.atleticas[0]?.atletica.slug
    const [inscricoes, conquistas] = await Promise.all([
      Dados.minhasInscricoes(),
      principal ? Dados.conquistas(principal) : Promise.resolve([]),
    ])
    const listas = await Promise.all(
      perfil.atleticas.map((v) => Dados.equipes(v.atletica.slug)))
    const equipes = listas.flat()
      .filter((e) => e.elenco.some((a) => a.usuarioId === perfil.id))
    return { inscricoes, equipes, conquistas }
  }, [perfil?.id])

  if (carregando) {
    return <div><Esqueleto altura="16rem" /></div>
  }

  if (!perfil) {
    return (
      <div style={{ maxWidth: "40rem", margin: "0 auto" }}>
        <EstadoVazio icone="usuario" titulo="Você não está conectado">
          <p className="fraco">Entre para ver o seu histórico na rede.</p>
          <Link to="/" className="botao botao--discreto">Voltar ao início</Link>
        </EstadoVazio>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "62rem", margin: "0 auto" }}>
      <CabecalhoDePagina
        titulo="Meu histórico"
        descricao="O que você fez dentro da rede. Não é currículo profissional — é registro institucional."
        trilha={[{ rotulo: 'Meu perfil', para: '/eu' }, { rotulo: 'Histórico' }]}
      />

      <div className="cartao" style={{ marginBottom: '1.6rem' }}>
        <div className="linha linha--topo">
          <Avatar nome={perfil.nome} url={perfil.avatarUrl} tamanho="m" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ marginBottom: '0.1rem' }}>{perfil.nome}</h2>
            <div className="fraco">{perfil.email}</div>
          </div>
          {perfil.operador ? (
            <span className="etiqueta etiqueta--acento">Operador da plataforma</span>
          ) : null}
        </div>
      </div>

      <Conteudo busca={busca} esqueleto={<Esqueleto altura="18rem" />}>
        {(d) => {
          const conquistadas = d.conquistas.filter((c) => c.conquistadaEm !== null)
          const presencas = d.inscricoes.filter((i) => i.checkinEm !== null).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.6rem' }}>
                <Metrica rotulo="Vínculos" icone="atletica"
                         valor={perfil.atleticas.length} />
                <Metrica rotulo="Equipes" icone="equipes" valor={d.equipes.length} />
                <Metrica rotulo="Inscrições" icone="inscricoes"
                         valor={d.inscricoes.length} />
                <Metrica rotulo="Presenças confirmadas" icone="certo" valor={presencas} />
              </div>

              <div className="detalhe">
                <div>
                  <Secao
                    titulo="Cargos e vínculos"
                    descricao="Onde você atua, e com que papel."
                  >
                    {perfil.atleticas.length === 0 ? (
                      <EstadoVazio icone="atletica" titulo="Nenhum vínculo">
                        <p className="fraco">
                          Peça um convite à diretoria da sua atlética. É a única
                          forma de entrar, e é assim de propósito.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha pilha--densa">
                        {perfil.atleticas.map(({ atletica, papel, cargo }) => (
                          <Link key={atletica.slug} to={`/hub/${atletica.slug}`}
                                className="cartao cartao--clicavel linha">
                            <Brasao atletica={atletica} tamanho="m" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong>{atletica.nome}</strong>
                              <div className="fraco">{cargo ?? rotuloDoPapel(papel)}</div>
                              <div className="fraco">{atletica.instituicao}</div>
                            </div>
                            <span className="etiqueta etiqueta--acento">
                              {rotuloDoPapel(papel)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </Secao>

                  <Secao titulo="Equipes em que joguei">
                    {d.equipes.length === 0 ? (
                      <EstadoVazio icone="equipes" titulo="Nenhuma equipe">
                        <p className="fraco">
                          Peça à diretoria de esportes para incluir você no elenco
                          de uma modalidade.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="pilha pilha--densa">
                        {d.equipes.map((e) => {
                          const eu = e.elenco.find((a) => a.usuarioId === perfil.id)
                          return (
                            <div key={e.id} className="cartao cartao--compacto linha entre">
                              <div style={{ minWidth: 0 }}>
                                <strong>{e.nome}</strong>
                                <div className="fraco">{e.modalidade}</div>
                              </div>
                              <div className="linha">
                                {eu?.numero !== null && eu?.numero !== undefined ? (
                                  <span className="fraco">#{eu.numero}</span>
                                ) : null}
                                <span className="etiqueta">
                                  {eu?.funcao.toLowerCase() ?? 'atleta'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Secao>

                  <Secao titulo="Eventos e participações">
                    {d.inscricoes.length === 0 ? (
                      <EstadoVazio icone="eventos" titulo="Nenhuma inscrição">
                        <p className="fraco">
                          Os eventos em que você se inscrever aparecem aqui, com o
                          código de entrada.
                        </p>
                      </EstadoVazio>
                    ) : (
                      <div className="cartao">
                        <LinhaDoTempo>
                          {d.inscricoes.map((i) => (
                            <ItemDaLinha key={i.id}
                                         estado={i.checkinEm ? 'feito' : 'ativo'}>
                              <div className="linha entre">
                                <div style={{ minWidth: 0 }}>
                                  <strong>{i.eventoTitulo}</strong>
                                  <div className="fraco">
                                    {dataEHora(i.eventoInicioEm)}
                                  </div>
                                </div>
                                <span className={`etiqueta ${
                                  i.checkinEm ? 'etiqueta--sucesso'
                                    : i.status === 'CONFIRMADA' ? 'etiqueta--acento'
                                    : 'etiqueta--alerta'}`}>
                                  {i.checkinEm ? 'compareceu'
                                    : i.status === 'CONFIRMADA' ? 'confirmada'
                                    : `espera ${i.posicaoEspera}º`}
                                </span>
                              </div>
                            </ItemDaLinha>
                          ))}
                        </LinhaDoTempo>
                      </div>
                    )}
                  </Secao>
                </div>

                <div>
                  <Secao
                    titulo="Conquistas"
                    descricao="Marcos alcançados pela atlética com a sua participação."
                  >
                    <div className="cartao">
                      <div className="pilha pilha--densa">
                        {d.conquistas.map((c) => (
                          <div key={c.id} className="linha"
                               style={c.conquistadaEm ? undefined : { opacity: 0.4 }}>
                            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
                              {c.icone}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 550, fontSize: '0.9rem' }}>
                                {c.titulo}
                              </div>
                              <div className="fraco">
                                {c.conquistadaEm
                                  ? quando(c.conquistadaEm) : c.descricao}
                              </div>
                            </div>
                            {c.conquistadaEm ? (
                              <Icone nome="certo" tamanho={15} />
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <hr className="divisor" />
                      <div className="fraco">
                        {conquistadas.length} de {d.conquistas.length} alcançadas
                      </div>
                    </div>
                  </Secao>

                  <div className="aviso">
                    <strong>Isto não é um currículo</strong>
                    <p className="fraco" style={{ margin: '0.3rem 0 0' }}>
                      É o registro do que você fez dentro da atlética, para quando a
                      memória falhar — sua ou da próxima diretoria. A plataforma não
                      transforma participação estudantil em avaliação de desempenho.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
