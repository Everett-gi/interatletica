import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../dados'
import type { PassoDeOnboarding } from '../../api/tipos-plataforma'
import { Conteudo, Esqueleto, useBusca } from '../../ui/componentes'
import { CabecalhoDePagina, Progresso, Secao } from '../../ui/pagina'
import { Icone } from '../../ui/icones'
import { percentual } from '../../formatos'
import { useSessao } from '../../sessao/SessaoContexto'

/**
 * Os primeiros passos da atlética (§80 e §81).
 *
 * <p>Uma lista curta em vez de um formulário gigante. O §80 é explícito: não
 * mostrar dezenas de campos de uma vez. Cada passo leva à tela onde ele
 * acontece de verdade — a plataforma não pede que a pessoa preencha um
 * cadastro paralelo para depois refazer tudo no lugar certo.</p>
 *
 * <p>A ordem também não é arbitrária: identidade, pessoas e metas antes de
 * evento. Atlética que publica evento antes de ter diretoria definida
 * descobre na véspera que ninguém é responsável por nada.</p>
 */
export function Onboarding() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  const atletica = vinculo(slug)?.atletica

  const passos = useBusca<PassoDeOnboarding[]>(() => Dados.onboarding(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo={`Bem-vindo${atletica ? `, ${atletica.nome}` : ''}`}
        descricao="Os primeiros passos para a plataforma servir para alguma coisa. Dá para fazer aos poucos."
      />

      <Conteudo
        busca={passos}
        esqueleto={
          <div className="pilha pilha--densa">
            {[0, 1, 2, 3, 4].map((i) => <Esqueleto key={i} altura="4.5rem" />)}
          </div>
        }
      >
        {(lista) => {
          const feitos = lista.filter((p) => p.concluido).length
          const proporcao = feitos / lista.length
          const proximo = lista.find((p) => !p.concluido)

          return (
            <>
              <div className="cartao cartao--destacado" style={{ marginBottom: '1.6rem' }}>
                <div className="linha entre" style={{ marginBottom: '0.6rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem' }}>
                      {feitos} de {lista.length} passos concluídos
                    </strong>
                    <div className="fraco">
                      {proximo
                        ? `Próximo: ${proximo.titulo.toLowerCase()}`
                        : 'Tudo pronto. A partir daqui é uso do dia a dia.'}
                    </div>
                  </div>
                  <div className="numero-medio">{percentual(proporcao)}</div>
                </div>
                <Progresso proporcao={proporcao}
                           tom={proporcao === 1 ? 'sucesso' : undefined} />
              </div>

              <Secao>
                <div className="pilha pilha--densa">
                  {lista.map((passo, i) => {
                    const agora = !passo.concluido && passo.id === proximo?.id
                    return (
                      <div
                        key={passo.id}
                        className={`passo${passo.concluido ? ' passo--feito' : ''}${
                          agora ? ' passo--agora' : ''}`}
                      >
                        <span className="passo__marca">
                          {passo.concluido ? <Icone nome="certo" tamanho={14} /> : i + 1}
                        </span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600,
                            color: passo.concluido ? 'var(--texto-fraco)' : undefined,
                          }}>
                            {passo.titulo}
                          </div>
                          <div className="fraco">{passo.descricao}</div>
                        </div>

                        {passo.destino ? (
                          <Link
                            to={`/hub/${slug}/${passo.destino}`}
                            className={agora
                              ? 'botao botao--pequeno'
                              : 'botao botao--discreto botao--pequeno'}
                          >
                            {passo.acao}
                          </Link>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </Secao>

              <Secao titulo="Enquanto isso">
                <div className="grade">
                  <Link to={`/hub/${slug}/conhecimento`} className="cartao cartao--clicavel">
                    <Icone nome="guias" tamanho={22} />
                    <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                      Leia um guia
                    </h3>
                    <p className="fraco" style={{ margin: 0 }}>
                      O que outras atléticas aprenderam sobre eventos, patrocínio e
                      prestação de contas.
                    </p>
                  </Link>
                  <Link to={`/hub/${slug}/rede`} className="cartao cartao--clicavel">
                    <Icone nome="rede" tamanho={22} />
                    <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                      Conheça as vizinhas
                    </h3>
                    <p className="fraco" style={{ margin: 0 }}>
                      Quem está perto de você é com quem dá para marcar amistoso sem
                      fretar ônibus.
                    </p>
                  </Link>
                  <Link to="/ajuda" className="cartao cartao--clicavel">
                    <Icone nome="info" tamanho={22} />
                    <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                      Central de ajuda
                    </h3>
                    <p className="fraco" style={{ margin: 0 }}>
                      Como a plataforma funciona, e por que funciona assim.
                    </p>
                  </Link>
                </div>
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
