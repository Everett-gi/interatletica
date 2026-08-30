import { Link } from 'react-router-dom'
import { Dados, MODO_DEMO } from '../dados'
import type { Inscricao, Papel } from '../api/tipos'
import {
  Avatar,
  Brasao,
  Conteudo,
  Esqueleto,
  rotuloDoPapel,
  useBusca,
  Vazio,
} from '../ui/componentes'
import { dataEHora, quando } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'

/**
 * Quem eu sou dentro da rede inteira.
 *
 * <p>Reúne o que está espalhado por atlética: onde tenho vínculo, com que
 * papel, e em que eventos estou inscrito. É a única tela que cruza atléticas
 * de propósito — no servidor, a consulta correspondente roda com o filtro de
 * tenant explicitamente suspenso.</p>
 */
export function MeuPerfil() {
  const { perfil, carregando, assumirPapel } = useSessao()
  const inscricoes = useBusca<Inscricao[]>(
    () => (perfil ? Dados.minhasInscricoes() : Promise.resolve([])),
    [perfil?.id],
  )

  if (carregando) {
    return <Esqueleto altura="12rem" />
  }

  if (!perfil) {
    return (
      <Vazio titulo="Você não está conectado">
        <p>Entre para ver seus vínculos e inscrições.</p>
        {MODO_DEMO ? (
          <button className="botao" onClick={() => void assumirPapel('PRESIDENTE')}>
            Entrar na demonstração
          </button>
        ) : (
          <a className="botao" href="/oauth2/authorization/google">Entrar com Google</a>
        )}
      </Vazio>
    )
  }

  return (
    <div className="pilha" style={{ gap: '1.8rem' }}>
      <header className="linha linha--topo">
        <Avatar nome={perfil.nome} url={perfil.avatarUrl} tamanho="m" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ marginBottom: '0.1rem' }}>{perfil.nome}</h1>
          <div className="fraco">{perfil.email}</div>
        </div>
        {perfil.operador ? (
          <span className="etiqueta etiqueta--acento">Operador da plataforma</span>
        ) : null}
      </header>

      {MODO_DEMO ? <TrocaDePapel /> : null}

      <section>
        <div className="cabecalho-de-secao">
          <h2>Meus vínculos</h2>
        </div>
        {perfil.atleticas.length === 0 ? (
          <Vazio titulo="Você ainda não faz parte de uma atlética">
            Peça um convite à diretoria da sua. É a única forma de entrar — e é
            assim de propósito.
          </Vazio>
        ) : (
          <div className="grade">
            {perfil.atleticas.map(({ atletica, papel, cargo }) => (
              <Link key={atletica.slug} to={`/hub/${atletica.slug}`}
                    className="cartao cartao--clicavel linha">
                <Brasao atletica={atletica} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{atletica.nome}</strong>
                  <div className="fraco">{cargo ?? rotuloDoPapel(papel)}</div>
                </div>
                <span className="etiqueta etiqueta--acento">{rotuloDoPapel(papel)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="cabecalho-de-secao">
          <h2>Minhas inscrições</h2>
        </div>
        <Conteudo busca={inscricoes} esqueleto={<Esqueleto altura="6rem" />}>
          {(lista) =>
            lista.length === 0 ? (
              <Vazio titulo="Nenhuma inscrição ativa">
                Os eventos em que você se inscrever aparecem aqui, com o código
                de entrada.
              </Vazio>
            ) : (
              <div className="pilha pilha--densa">
                {lista.map((inscricao) => (
                  <div key={inscricao.id} className="cartao linha entre">
                    <div style={{ minWidth: 0 }}>
                      <strong>{inscricao.eventoTitulo}</strong>
                      <div className="fraco">
                        {dataEHora(inscricao.eventoInicioEm)} ·{' '}
                        {quando(inscricao.eventoInicioEm)}
                      </div>
                    </div>
                    <span
                      className={`etiqueta ${
                        inscricao.status === 'CONFIRMADA'
                          ? 'etiqueta--sucesso'
                          : 'etiqueta--alerta'}`}
                    >
                      {inscricao.status === 'CONFIRMADA'
                        ? 'Confirmada'
                        : `Espera · ${inscricao.posicaoEspera}º`}
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </Conteudo>
      </section>
    </div>
  )
}

/**
 * Controle exclusivo da demonstração: trocar de papel para ver o que cada
 * um enxerga. Sem isso, quem abre o link só conhece a visão de presidente e
 * não percebe que a interface muda conforme a permissão.
 */
function TrocaDePapel() {
  const { perfil, assumirPapel } = useSessao()
  const atual = perfil?.atleticas[0]?.papel

  const opcoes: { valor: Papel | 'VISITANTE'; rotulo: string; explica: string }[] = [
    { valor: 'PRESIDENTE', rotulo: 'Presidente', explica: 'convida, promove, administra' },
    { valor: 'DIRETOR', rotulo: 'Diretor', explica: 'cria eventos e opera a portaria' },
    { valor: 'MEMBRO', rotulo: 'Membro', explica: 'participa e se inscreve' },
    { valor: 'VISITANTE', rotulo: 'Visitante', explica: 'sem sessão' },
  ]

  return (
    <section className="cartao">
      <h3>Ver a plataforma como…</h3>
      <p className="fraco">
        Papel mora no vínculo, não na pessoa: a mesma conta preside uma
        atlética e é membro comum de outra. Troque para ver a diferença.
      </p>
      <div className="linha">
        {opcoes.map((opcao) => (
          <button
            key={opcao.valor}
            className={`botao botao--pequeno ${
              atual === opcao.valor ? '' : 'botao--discreto'}`}
            onClick={() => void assumirPapel(opcao.valor)}
            title={opcao.explica}
          >
            {opcao.rotulo}
          </button>
        ))}
      </div>
    </section>
  )
}
