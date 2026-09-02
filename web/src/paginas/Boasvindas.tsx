import { Link } from 'react-router-dom'
import { MODO_DEMO } from '../dados'
import { Icone, type NomeDoIcone } from '../ui/icones'

/**
 * O que um visitante deslogado vê na raiz.
 *
 * <p>Não é um feed. Quem chega aqui ou quer usar a plataforma, ou quer
 * entender o que ela é antes de decidir. As duas saídas ficam à vista, e a
 * ordem entre elas importa: <strong>começar do zero vem primeiro</strong>,
 * porque é o caminho de quem vai usar; a demonstração preenchida vem depois,
 * porque é o caminho de quem vai apresentar.</p>
 */
export function Boasvindas() {
  return (
    <div className="pilha" style={{ gap: '2rem', maxWidth: '52rem', margin: '0 auto' }}>
      <section
        className="capa"
        style={{ background: 'linear-gradient(135deg, #2b5fd0, #6d28d9)' }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Um escritório digital para a sua atlética — e uma rede para aprender
          com as outras
        </h1>
        <p style={{ maxWidth: '52ch', opacity: 0.93, marginBottom: '1.3rem' }}>
          Gestão, eventos, esportes, financeiro e memória institucional num
          lugar só. E, ao lado, o que nenhuma atlética tem sozinha: o que as
          outras já aprenderam.
        </p>

        <div className="linha">
          <Link className="botao" style={{ background: '#fff', color: '#1a2540' }}
                to="/criar-conta">
            Começar do zero
          </Link>
          <Link className="botao botao--discreto" to="/entrar"
                style={{ borderColor: 'rgb(255 255 255 / 0.5)', color: '#fff' }}>
            Já tenho conta
          </Link>
        </div>
      </section>

      <section>
        <div className="cabecalho-de-secao">
          <div>
            <h2>Uma atlética não precisa descobrir sozinha o que outra já aprendeu</h2>
            <p className="fraco" style={{ margin: 0 }}>
              É a frase que a plataforma inteira existe para tornar verdadeira.
            </p>
          </div>
        </div>

        <div className="grade grade--larga">
          <Cartao
            icone="gestao"
            titulo="Administre a sua atlética"
            texto="Diretoria, tarefas, projetos, reuniões com ata, decisões com votação, financeiro com prestação de contas e o inventário do patrimônio."
          />
          <Cartao
            icone="rede"
            titulo="Encontre as vizinhas"
            texto="Quem está perto, o que abriram para fora, com quem marcar amistoso e quem topa dividir uma compra para baixar o preço."
          />
          <Cartao
            icone="guias"
            titulo="Aproveite o que já foi aprendido"
            texto="Guias, modelos de estatuto e contrato, e relatos com número: o que funcionou, o que não funcionou e quanto custou."
          />
          <Cartao
            icone="transicao"
            titulo="Não recomece a cada gestão"
            texto="Tudo fica registrado com quem fez e quando. A transição vira um checklist, e a diretoria nova sabe como a antiga fazia."
          />
        </div>
      </section>

      <section>
        <div className="cabecalho-de-secao">
          <h2>Como começar</h2>
        </div>

        <div className="grade">
          <Passo numero="1" titulo="Crie a sua conta"
                 texto="O primeiro acesso já cria a conta. Não há senha para inventar." />
          <Passo numero="2" titulo="Crie a sua atlética"
                 texto="Quatro perguntas curtas. Você vira presidente dela e convida o resto." />
          <Passo numero="3" titulo="Siga os primeiros passos"
                 texto="Uma lista curta guia o que fazer, e cada tela explica para que serve." />
        </div>
      </section>

      <section className="cartao">
        <h3>Já é de uma atlética que está aqui?</h3>
        <p className="fraco">
          A entrada é por convite da diretoria, endereçado ao seu e-mail. Não
          existe cadastro aberto de vínculo, e é assim de propósito: sem essa
          porta fechada, moderar vínculo falso vira trabalho de alguém já na
          primeira semana.
        </p>
        <div className="linha">
          <Link to="/rede" className="botao botao--discreto">
            Ver as atléticas na plataforma
          </Link>
          <Link to="/ajuda" className="botao botao--fantasma">
            Central de ajuda
          </Link>
        </div>
      </section>

      {MODO_DEMO ? (
        <section className="cartao cartao--destacado">
          <div className="linha linha--topo" style={{ gap: '0.7rem' }}>
            <Icone nome="painel" tamanho={22} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ marginBottom: '0.2rem' }}>
                Quer ver a plataforma cheia, sem preencher nada?
              </h3>
              <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                A demonstração preenchida abre como presidente de uma atlética
                fictícia com dois anos de história — eventos, campeonato em
                andamento, financeiro fechado e transição de gestão em curso.
                Serve para apresentar; para experimentar, comece do zero.
              </p>
              <Link to="/entrar" className="botao botao--discreto">
                Abrir a demonstração preenchida
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Cartao({ icone, titulo, texto }: {
  icone: NomeDoIcone
  titulo: string
  texto: string
}) {
  return (
    <div className="cartao">
      <div
        style={{
          width: '2.4rem', height: '2.4rem', borderRadius: '10px',
          background: 'var(--acento-tenue)', color: 'var(--acento)',
          display: 'grid', placeItems: 'center', marginBottom: '0.7rem',
        }}
        aria-hidden="true"
      >
        <Icone nome={icone} tamanho={20} />
      </div>
      <h3 style={{ marginBottom: '0.25rem' }}>{titulo}</h3>
      <p className="fraco" style={{ margin: 0 }}>{texto}</p>
    </div>
  )
}

function Passo({ numero, titulo, texto }: {
  numero: string
  titulo: string
  texto: string
}) {
  return (
    <div className="cartao">
      <div className="passo__marca" style={{ marginBottom: '0.6rem' }}>{numero}</div>
      <h3 style={{ marginBottom: '0.2rem' }}>{titulo}</h3>
      <p className="fraco" style={{ margin: 0 }}>{texto}</p>
    </div>
  )
}
