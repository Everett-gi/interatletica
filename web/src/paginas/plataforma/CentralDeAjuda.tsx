import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dados, MODO_DEMO } from '../../dados'
import { CabecalhoDePagina, Chips, Confirmacao, EstadoVazio, Secao } from '../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../ui/icones'
import { useSessao } from '../../sessao/SessaoContexto'
import { reiniciarAjuda } from '../../ui/ComoFunciona'
import { reiniciarTour } from '../../layout/TourInicial'

interface Pergunta {
  pergunta: string
  resposta: string
  area: Area
}

type Area = 'PRIMEIROS_PASSOS' | 'PERMISSOES' | 'EVENTOS' | 'REDE' | 'DADOS'

const AREA: Record<Area, { rotulo: string; icone: NomeDoIcone }> = {
  PRIMEIROS_PASSOS: { rotulo: 'Primeiros passos', icone: 'inicio' },
  PERMISSOES: { rotulo: 'Acesso e permissões', icone: 'membros' },
  EVENTOS: { rotulo: 'Eventos e inscrições', icone: 'eventos' },
  REDE: { rotulo: 'Rede e colaboração', icone: 'rede' },
  DADOS: { rotulo: 'Dados e privacidade', icone: 'ajustes' },
}

const PERGUNTAS: Pergunta[] = [
  {
    area: 'PRIMEIROS_PASSOS',
    pergunta: 'Como a minha atlética entra na plataforma?',
    resposta:
      'Uma pessoa cria a atlética e vira presidente dela. A partir daí, a entrada '
      + 'dos demais é por convite endereçado a um e-mail. Não existe cadastro '
      + 'aberto, e é assim de propósito: sem essa porta fechada, moderar cadastro '
      + 'falso vira trabalho de alguém já na primeira semana.',
  },
  {
    area: 'PRIMEIROS_PASSOS',
    pergunta: 'Por onde começar depois de criar a atlética?',
    resposta:
      'Monte a diretoria, convide os membros e defina de três a seis metas com '
      + 'número. Depois disso, o primeiro projeto — de preferência a partir de um '
      + 'modelo da rede, que já traz as tarefas que outra atlética descobriu na '
      + 'prática.',
  },
  {
    area: 'PRIMEIROS_PASSOS',
    pergunta: 'Preciso preencher tudo de uma vez?',
    resposta:
      'Não. A plataforma funciona com o que existir. O financeiro sem lançamento '
      + 'mostra estado vazio, não erro; o patrimônio sem item também. O que ganha '
      + 'valor com o tempo é o histórico, e ele só existe se o registro for feito '
      + 'na hora em que a coisa acontece.',
  },
  {
    area: 'PERMISSOES',
    pergunta: 'Qual a diferença entre presidente, diretor e membro?',
    resposta:
      'Presidente convida, promove e desliga — quem controla a entrada controla a '
      + 'atlética. Diretor cria eventos, administra projetos, tarefas e financeiro. '
      + 'Membro participa, se inscreve e acompanha. O papel mora no vínculo com a '
      + 'atlética, não na pessoa: a mesma conta pode presidir uma e ser membro '
      + 'comum de outra.',
  },
  {
    area: 'PERMISSOES',
    pergunta: 'Por que não vejo o financeiro?',
    resposta:
      'O financeiro é da diretoria. A prestação de contas, porém, pode ser aberta '
      + 'a membros ou ao público — cada mês tem a sua visibilidade, escolhida por '
      + 'quem fecha.',
  },
  {
    area: 'PERMISSOES',
    pergunta: 'Como transfiro a presidência na troca de gestão?',
    resposta:
      'Promova a nova pessoa a presidente antes de sair. A plataforma impede '
      + 'rebaixar a última presidência ativa: uma atlética sem presidente não tem '
      + 'quem convide nem quem promova. Use a tela de Transição para não esquecer '
      + 'os acessos de redes e do e-mail institucional.',
  },
  {
    area: 'EVENTOS',
    pergunta: 'O evento fica visível assim que eu crio?',
    resposta:
      'Não. Todo evento nasce como rascunho e só aparece para outras pessoas '
      + 'quando você publica. Depois de publicado, a visibilidade escolhida — '
      + 'público, rede ou interno — decide quem enxerga.',
  },
  {
    area: 'EVENTOS',
    pergunta: 'Como funciona a lista de espera?',
    resposta:
      'Quando a capacidade se esgota, quem se inscreve entra na espera com '
      + 'posição. Se alguém cancela, a primeira pessoa da fila é promovida '
      + 'automaticamente — ninguém precisa administrar isso à mão.',
  },
  {
    area: 'EVENTOS',
    pergunta: 'Como a portaria confere a entrada?',
    resposta:
      'Cada inscrição gera um código de entrada. Na tela de Portaria, a pessoa da '
      + 'diretoria lê o código e o sistema responde se libera ou não, dizendo o '
      + 'motivo quando recusa.',
  },
  {
    area: 'REDE',
    pergunta: 'O que outras atléticas conseguem ver da minha?',
    resposta:
      'Só o que você marcar como público ou como visível para a rede: perfil, '
      + 'eventos abertos e o que você publicar em experiências, guias e '
      + 'comunidades. Financeiro, documentos internos, tarefas e patrimônio nunca '
      + 'saem da sua atlética.',
  },
  {
    area: 'REDE',
    pergunta: 'Por que compartilhar o que aprendemos?',
    resposta:
      'Porque a próxima gestão da sua atlética também vai ler. O banco de '
      + 'experiências serve à rede e a você: daqui a dois anos, quando ninguém '
      + 'lembrar quanto custou a calourada, o registro estará lá.',
  },
  {
    area: 'REDE',
    pergunta: 'Como funciona a compra coletiva?',
    resposta:
      'Uma atlética abre a compra com produto e quantidade mínima; as outras '
      + 'demonstram interesse com a quantidade que querem. Quando o mínimo é '
      + 'atingido, a organizadora negocia com o fornecedor. A plataforma não '
      + 'intermedia pagamento nem entrega.',
  },
  {
    area: 'DADOS',
    pergunta: 'A plataforma cobra ou processa pagamento?',
    resposta:
      'Não. A loja é vitrine: mostra produto, preço e estoque, e a negociação '
      + 'acontece pelos canais que a atlética já usa. O financeiro registra o que '
      + 'entrou e saiu para a prestação de contas existir — ele não movimenta '
      + 'dinheiro.',
  },
  {
    area: 'DADOS',
    pergunta: 'De quem são os dados da minha atlética?',
    resposta:
      'Da atlética. A plataforma é território comum: nenhuma atlética é dona dela, '
      + 'e cada uma é dona dos seus dados. O isolamento entre atléticas é aplicado '
      + 'no servidor, não só na interface.',
  },
  {
    area: 'DADOS',
    pergunta: 'O que acontece quando alguém sai da atlética?',
    resposta:
      'O vínculo é marcado como encerrado e a pessoa perde o acesso, mas continua '
      + 'no histórico. As inscrições e os resultados que ela produziu precisam '
      + 'apontar para um vínculo que existe — apagar membro apagaria história.',
  },
]

/**
 * A central de ajuda (§83).
 *
 * <p>Perguntas frequentes escritas na primeira pessoa de quem administra uma
 * atlética, e não em linguagem de manual. Cada resposta diz o <em>porquê</em>
 * da regra: "não vejo o financeiro" é uma reclamação até virar "o financeiro
 * é da diretoria, e a prestação de contas pode ser aberta".</p>
 */
export function CentralDeAjuda() {
  const { perfil } = useSessao()
  const [area, setArea] = useState<Area | 'TODAS'>('TODAS')
  const [termo, setTermo] = useState('')
  const [aberta, setAberta] = useState<string | null>(null)
  const [reiniciado, setReiniciado] = useState<'ajuda' | 'tour' | null>(null)
  const [confirmandoReinicio, setConfirmandoReinicio] = useState(false)

  const alvo = termo.trim().toLowerCase()
  const visiveis = PERGUNTAS
    .filter((p) => area === 'TODAS' || p.area === area)
    .filter((p) => alvo === '' ||
      `${p.pergunta} ${p.resposta}`.toLowerCase().includes(alvo))

  const slug = perfil?.atleticas[0]?.atletica.slug

  return (
    <div style={{ maxWidth: "58rem", margin: "0 auto" }}>
      <CabecalhoDePagina
        titulo="Central de ajuda"
        descricao="Como a plataforma funciona, e por que ela funciona assim."
      />

      <div className="barra-de-filtros">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar uma dúvida"
          aria-label="Buscar na ajuda"
        />
      </div>

      <div style={{ marginBottom: '1.3rem' }}>
        <Chips
          rotulo="Assuntos da ajuda"
          selecionado={area}
          aoSelecionar={setArea}
          opcoes={[
            { valor: 'TODAS', rotulo: 'Tudo', contagem: PERGUNTAS.length },
            ...(Object.keys(AREA) as Area[]).map((a) => ({
              valor: a as Area | 'TODAS',
              rotulo: AREA[a].rotulo,
              contagem: PERGUNTAS.filter((p) => p.area === a).length,
            })),
          ]}
        />
      </div>

      {visiveis.length === 0 ? (
        <EstadoVazio icone="ajuda" titulo="Nada encontrado sobre isso">
          <p className="fraco">
            Se a dúvida é sobre organizar a atlética — e não sobre a plataforma —,
            a rede responde melhor: outra atlética provavelmente já passou por isso.
          </p>
          {slug ? (
            <Link to={`/hub/${slug}/rede/ajuda?novo=1`} className="botao">
              Perguntar à rede
            </Link>
          ) : null}
        </EstadoVazio>
      ) : (
        <Secao>
          <div className="pilha pilha--densa">
            {visiveis.map((p) => {
              const expandida = aberta === p.pergunta
              return (
                <div key={p.pergunta} className="cartao">
                  <button
                    className="linha entre"
                    style={{ width: '100%', background: 'none', border: 'none',
                             padding: 0, font: 'inherit', color: 'inherit',
                             cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => setAberta(expandida ? null : p.pergunta)}
                    aria-expanded={expandida}
                  >
                    <span className="linha" style={{ gap: '0.55rem', minWidth: 0 }}>
                      <Icone nome={AREA[p.area].icone} tamanho={17} />
                      <strong>{p.pergunta}</strong>
                    </span>
                    <Icone nome={expandida ? 'cima' : 'baixo'} tamanho={16} />
                  </button>

                  {expandida ? (
                    <p className="suave" style={{ margin: '0.7rem 0 0',
                                                  paddingLeft: '2.15rem' }}>
                      {p.resposta}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </Secao>
      )}

      <Secao
        titulo="Aprender a usar"
        descricao="Cada tela explica o que é na primeira vez que você entra nela. Isso pode ser reativado a qualquer momento."
      >
        <div className="grade">
          <div className="cartao">
            <Icone nome="info" tamanho={22} />
            <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
              Reabrir as explicações
            </h3>
            <p className="fraco" style={{ marginBottom: '0.8rem' }}>
              As caixas de "o que é esta tela" voltam a aparecer em todos os
              módulos. Útil quando entra gente nova na diretoria.
            </p>
            <button
              className="botao botao--discreto"
              onClick={() => { reiniciarAjuda(); setReiniciado('ajuda') }}
            >
              Reabrir em todas as telas
            </button>
          </div>

          <div className="cartao">
            <Icone nome="painel" tamanho={22} />
            <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
              Refazer o tour
            </h3>
            <p className="fraco" style={{ marginBottom: '0.8rem' }}>
              As cinco paradas que mostram como navegar: os grupos, o seletor de
              atlética, a pesquisa e a ajuda de cada tela.
            </p>
            <button
              className="botao botao--discreto"
              onClick={() => { reiniciarTour(); setReiniciado('tour') }}
            >
              Ver de novo ao voltar
            </button>
          </div>

          {/* Só na demonstração: com a API conectada, apagar a própria conta
              não é um botão de ajuda — é um pedido com consequência jurídica,
              que mora nas configurações e passa por confirmação por e-mail. */}
          {MODO_DEMO ? (
            <div className="cartao">
              <Icone nome="historico" tamanho={22} />
              <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                Recomeçar do zero
              </h3>
              <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                Apaga a conta e a atlética que você criou neste navegador e
                devolve a demonstração ao estado de quem chega pela primeira
                vez. Serve para apresentar de novo.
              </p>
              <button
                className="botao botao--discreto"
                onClick={() => setConfirmandoReinicio(true)}
              >
                Apagar e recomeçar
              </button>
            </div>
          ) : null}
        </div>

        {reiniciado ? (
          <div className="aviso aviso--sucesso" style={{ marginTop: '0.9rem' }}>
            {reiniciado === 'ajuda'
              ? 'Pronto. As explicações voltam a aparecer conforme você abrir cada tela.'
              : 'Pronto. O tour começa quando você voltar para a sua atlética.'}
          </div>
        ) : null}
      </Secao>

      {confirmandoReinicio ? (
        <Confirmacao
          titulo="Apagar esta demonstração?"
          consequencia={
            'A conta e a atlética que você criou vivem só neste navegador e '
            + 'não têm senha para voltar a entrar. Tudo o que você montou aqui '
            + 'se perde.'
          }
          rotuloDeConfirmar="Apagar e recomeçar"
          aoConfirmar={() => {
            setConfirmandoReinicio(false)
            // Recarga de verdade, e não navegação do router: a sessão vive
            // também no contexto de React, e trocar de rota com ela em memória
            // levaria de volta a um hub cuja atlética acabou de ser apagada.
            void Dados.recomecarDemo().then(() => window.location.replace('/'))
          }}
          aoCancelar={() => setConfirmandoReinicio(false)}
        />
      ) : null}

      <Secao titulo="Não achou o que procurava?">
        <div className="grade">
          {slug ? (
            <Link to={`/hub/${slug}/conhecimento`} className="cartao cartao--clicavel">
              <Icone nome="guias" tamanho={22} />
              <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                Guias da rede
              </h3>
              <p className="fraco" style={{ margin: 0 }}>
                Como organizar campeonato, captar patrocínio, fechar prestação de
                contas — escrito por outras atléticas.
              </p>
            </Link>
          ) : null}
          {slug ? (
            <Link to={`/hub/${slug}/rede/ajuda?novo=1`} className="cartao cartao--clicavel">
              <Icone nome="ajuda" tamanho={22} />
              <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                Perguntar à rede
              </h3>
              <p className="fraco" style={{ margin: 0 }}>
                Dúvida sobre organizar a atlética costuma ter resposta melhor de
                quem já passou por ela.
              </p>
            </Link>
          ) : null}
          <Link to="/rede" className="cartao cartao--clicavel">
            <Icone nome="rede" tamanho={22} />
            <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
              Conhecer a rede
            </h3>
            <p className="fraco" style={{ margin: 0 }}>
              Ver quais atléticas estão na plataforma e o que abriram para fora.
            </p>
          </Link>
        </div>
      </Secao>
    </div>
  )
}
