import { Link } from 'react-router-dom'
import { MODO_DEMO } from '../dados'
import { useSessao } from '../sessao/SessaoContexto'

/**
 * O que um visitante deslogado vê na raiz.
 *
 * <p>Não é um feed. Quem chega aqui ou é de uma atlética e quer entrar na
 * dela, ou clicou num link de evento e caiu na raiz por engano. As duas
 * saídas estão à vista, e nada mais — a versão anterior abria com a agenda
 * de todas as atléticas, o que respondia uma pergunta que ninguém fez.</p>
 */
export function Boasvindas() {
  const { perfil, assumirPapel } = useSessao()

  return (
    <div className="pilha" style={{ gap: '1.6rem', maxWidth: '46rem', margin: '0 auto' }}>
      <section
        className="capa"
        style={{ background: 'linear-gradient(135deg, #2b5fd0, #6d28d9)' }}
      >
        <h1 style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>
          Onde as atléticas organizam seus eventos
        </h1>
        <p style={{ maxWidth: '44ch', opacity: 0.93, marginBottom: '1.1rem' }}>
          Campeonatos entre atléticas, jogos e treinos, e a organização da
          diretoria. Um lugar só, no lugar da planilha e do formulário.
        </p>

        {!perfil ? (
          MODO_DEMO ? (
            <button
              className="botao"
              style={{ background: '#fff', color: '#1a2540' }}
              onClick={() => void assumirPapel('PRESIDENTE')}
            >
              Ver a demonstração
            </button>
          ) : (
            <a className="botao" style={{ background: '#fff', color: '#1a2540' }}
               href="/oauth2/authorization/google">
              Entrar com Google
            </a>
          )
        ) : null}
      </section>

      <div className="grade">
        <Passo
          numero="1"
          titulo="Crie o evento"
          texto="Campeonato, jogo, treino ou reunião. Nasce como rascunho — nada fica visível até você publicar."
        />
        <Passo
          numero="2"
          titulo="Mande o link"
          texto="Cada evento tem um endereço curto para colar no grupo. Quem abrir se inscreve ali mesmo."
        />
        <Passo
          numero="3"
          titulo="Confira na hora"
          texto="A lista de inscritos sai pronta, com de qual atlética cada um veio, e a portaria confere a entrada."
        />
      </div>

      <section className="cartao">
        <h3>Já é de uma atlética?</h3>
        <p className="fraco">
          A entrada é por convite da diretoria — não existe cadastro aberto, e
          é assim de propósito: sem essa porta fechada, moderar cadastro falso
          vira trabalho de alguém já na primeira semana.
        </p>
        <Link to="/rede" className="botao botao--discreto">
          Ver as atléticas na plataforma
        </Link>
      </section>
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
      <div
        style={{
          width: '1.8rem', height: '1.8rem', borderRadius: '999px',
          background: 'var(--acento-tenue)', color: 'var(--acento)',
          display: 'grid', placeItems: 'center', fontWeight: 800,
          marginBottom: '0.6rem',
        }}
        aria-hidden="true"
      >
        {numero}
      </div>
      <h3 style={{ marginBottom: '0.2rem' }}>{titulo}</h3>
      <p className="fraco" style={{ margin: 0 }}>{texto}</p>
    </div>
  )
}
