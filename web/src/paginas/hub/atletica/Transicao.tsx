import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { AreaDaTransicao, Transicao as TransicaoDto } from '../../../api/tipos-gestao'
import { Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  EstadoVazio,
  ItemDaLinha,
  LinhaDoTempo,
  Progresso,
  Secao,
} from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { percentual, plural, quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

const AREA: Record<AreaDaTransicao, { rotulo: string; icone: NomeDoIcone; porque: string }> = {
  DOCUMENTOS: {
    rotulo: 'Documentos',
    icone: 'documentos',
    porque: 'Estatuto, atas e regimento: sem eles a nova diretoria não prova que existe.',
  },
  FINANCEIRO: {
    rotulo: 'Financeiro',
    icone: 'financeiro',
    porque: 'Saldo conferido e contas listadas. Começar sem saber o que se deve é o pior começo.',
  },
  PROJETOS: {
    rotulo: 'Projetos',
    icone: 'projetos',
    porque: 'O que continua em andamento e quem assume cada frente.',
  },
  FORNECEDORES: {
    rotulo: 'Fornecedores',
    icone: 'fornecedores',
    porque: 'Contato, contrato e histórico. Redescobrir fornecedor custa dinheiro e prazo.',
  },
  PATRIMONIO: {
    rotulo: 'Patrimônio',
    icone: 'patrimonio',
    porque: 'O que a atlética tem, onde está e com quem. Sem isso o inventário some.',
  },
  ACESSOS: {
    rotulo: 'Acessos',
    icone: 'ajustes',
    porque: 'Redes, e-mail e banco. É o item que mais atlética perde na troca de gestão.',
  },
  PENDENCIAS: {
    rotulo: 'Pendências',
    icone: 'alerta',
    porque: 'O relatório final e a reunião de passagem, que fecham o ciclo.',
  },
}

const ORDEM: AreaDaTransicao[] = [
  'DOCUMENTOS', 'FINANCEIRO', 'PROJETOS', 'FORNECEDORES',
  'PATRIMONIO', 'ACESSOS', 'PENDENCIAS',
]

/**
 * A transição de gestão (§17).
 *
 * <p>Um checklist com caixinhas e um motivo escrito ao lado de cada área.
 * O motivo não é enfeite: quem está preenchendo isto às vésperas da posse
 * precisa saber por que aquele item importa, senão marca tudo e entrega uma
 * pasta vazia com aparência de completa.</p>
 */
export function Transicao() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const presidente = podeAtuarComo(slug, 'PRESIDENTE')
  const transicao = useBusca<TransicaoDto | null>(() => Dados.transicao(slug), [slug])

  async function alternar(id: string, concluido: boolean) {
    const atualizada = await Dados.marcarItemDaTransicao(id, concluido)
    transicao.definir(atualizada)
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Transição de gestão"
        descricao="O que precisa passar de uma diretoria para a outra — e por quê."
        trilha={[
          { rotulo: 'Gestão', para: `/hub/${slug}/gestao` },
          { rotulo: 'Transição' },
        ]}
      />

      <Conteudo busca={transicao} esqueleto={<Esqueleto altura="22rem" />}>
        {(t) => {
          if (!t) {
            return (
              <EstadoVazio icone="transicao" titulo="Nenhuma transição em preparo">
                <p className="fraco">
                  A transição é aberta pela presidência quando o processo eleitoral
                  começa. Até lá, o que importa é manter documentos, financeiro e
                  patrimônio em dia — é isso que ela vai coletar.
                </p>
              </EstadoVazio>
            )
          }

          const feitos = t.itens.filter((i) => i.concluido).length
          const proporcao = feitos / t.itens.length

          return (
            <>
              <div className="cartao cartao--destacado" style={{ marginBottom: '1.6rem' }}>
                <div className="linha entre" style={{ marginBottom: '0.6rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem' }}>
                      Gestão {t.deAno} → {t.paraAno}
                    </strong>
                    <div className="fraco">
                      Entrega prevista {quando(t.entregaEm)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="numero-medio">{percentual(proporcao)}</div>
                    <div className="fraco">{feitos} de {plural(t.itens.length, 'item', 'itens')}</div>
                  </div>
                </div>
                <Progresso proporcao={proporcao}
                           tom={proporcao === 1 ? 'sucesso' : undefined} />
              </div>

              <div className="detalhe">
                <div>
                  {ORDEM.map((area) => {
                    const itens = t.itens.filter((i) => i.area === area)
                    if (itens.length === 0) return null
                    const daArea = itens.filter((i) => i.concluido).length

                    return (
                      <Secao
                        key={area}
                        titulo={AREA[area].rotulo}
                        descricao={AREA[area].porque}
                        acao={
                          <span className={`etiqueta ${
                            daArea === itens.length ? 'etiqueta--sucesso' : ''}`}>
                            {daArea}/{itens.length}
                          </span>
                        }
                      >
                        <div className="pilha pilha--densa">
                          {itens.map((item) => (
                            <label
                              key={item.id}
                              className="cartao cartao--compacto linha linha--topo"
                              style={{ cursor: presidente ? 'pointer' : 'default' }}
                            >
                              <input
                                type="checkbox"
                                checked={item.concluido}
                                disabled={!presidente}
                                onChange={(e) => void alternar(item.id, e.target.checked)}
                                style={{ width: '1.1rem', height: '1.1rem',
                                         minHeight: 'auto', marginTop: '0.2rem',
                                         flexShrink: 0 }}
                                aria-label={item.titulo}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontWeight: 550,
                                  textDecoration: item.concluido ? 'line-through' : undefined,
                                  color: item.concluido ? 'var(--texto-fraco)' : undefined,
                                }}>
                                  {item.titulo}
                                </div>
                                {item.detalhe ? (
                                  <div className="fraco">{item.detalhe}</div>
                                ) : null}
                              </div>
                              {item.responsavelNome ? (
                                <span className="etiqueta">{item.responsavelNome}</span>
                              ) : null}
                            </label>
                          ))}
                        </div>
                      </Secao>
                    )
                  })}
                </div>

                <div>
                  <Secao titulo="O fluxo">
                    <div className="cartao">
                      <LinhaDoTempo>
                        {ORDEM.map((area) => {
                          const itens = t.itens.filter((i) => i.area === area)
                          const completa = itens.length > 0
                            && itens.every((i) => i.concluido)
                          const iniciada = itens.some((i) => i.concluido)
                          return (
                            <ItemDaLinha
                              key={area}
                              estado={completa ? 'feito' : iniciada ? 'ativo' : 'pendente'}
                            >
                              <div className="linha" style={{ gap: '0.45rem' }}>
                                <Icone nome={AREA[area].icone} tamanho={15} />
                                <span style={{ fontWeight: 550 }}>{AREA[area].rotulo}</span>
                              </div>
                              <div className="fraco">
                                {itens.filter((i) => i.concluido).length} de {itens.length}
                              </div>
                            </ItemDaLinha>
                          )
                        })}
                        <ItemDaLinha estado={proporcao === 1 ? 'ativo' : 'pendente'}>
                          <div className="linha" style={{ gap: '0.45rem' }}>
                            <Icone nome="transicao" tamanho={15} />
                            <span style={{ fontWeight: 550 }}>Entrega para a nova gestão</span>
                          </div>
                          <div className="fraco">{quando(t.entregaEm)}</div>
                        </ItemDaLinha>
                      </LinhaDoTempo>
                    </div>
                  </Secao>

                  <div className="aviso">
                    <strong>Por que isto existe</strong>
                    <p className="fraco" style={{ margin: '0.3rem 0 0' }}>
                      A frase que a plataforma quer tornar impossível é
                      “a diretoria nova não sabe como a antiga fazia”. Marcar
                      caixa não resolve sozinho; o que resolve é o que fica
                      registrado em cada módulo antes de marcar.
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
