import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Api } from '../api/rotas'
import { entrar } from '../api/cliente'
import { Conteudo, useBusca, Vazio } from '../componentes/comuns'
import { quando } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'
import { retomarConvite } from './conviteRetomado'
import type { AtleticaResumo, ConvitePendente, MinhaAtletica } from '../api/tipos'

/**
 * A primeira tela. Muda de acordo com quem está olhando:
 *
 * <ul>
 *   <li><strong>Visitante</strong> vê a vitrine — quais atléticas já estão
 *       aqui — e o convite para entrar.</li>
 *   <li><strong>Quem tem convite pendente</strong> vê o convite ANTES de
 *       tudo: é a ação que destrava o resto do app.</li>
 *   <li><strong>Membro</strong> vê as suas atléticas primeiro.</li>
 * </ul>
 */
export function Inicio() {
  const { perfil, carregando } = useSessao()
  const [conviteRetomado, setConviteRetomado] = useState<string | null>(null)

  /*
   * Quem saiu daqui para o Google por causa de um convite volta para a raiz,
   * porque é para lá que o Spring redireciona depois do login.
   *
   * Precisa ser efeito, e não valor inicial de estado: na primeira
   * renderização a sessão ainda está carregando e `perfil` é null, que aqui
   * significa "não sei ainda", não "deslogado". Ler o token nesse instante
   * consumiria a lembrança e jogaria fora — e o convite sumiria de vez.
   */
  useEffect(() => {
    if (!carregando && perfil) {
      const token = retomarConvite()
      if (token) {
        setConviteRetomado(token)
      }
    }
  }, [carregando, perfil])

  if (conviteRetomado) {
    return <Navigate to={`/convite/${conviteRetomado}`} replace />
  }

  return (
    <div className="pilha">
      {perfil ? <MinhasAtleticas atleticas={perfil.atleticas} /> : <Apresentacao />}
      {perfil && perfil.convitesPendentes > 0 && <ConvitesEsperando />}
      <Vitrine />
    </div>
  )
}

function Apresentacao() {
  return (
    <section className="cartao">
      <h1>Eventos entre atléticas</h1>
      <p className="suave">
        Esportes, e-sports e eventos sociais em um lugar só. Cada atlética é
        dona dos seus dados; a plataforma é território comum.
      </p>
      <p className="fraco">
        A entrada é por convite da sua atlética — não há cadastro aberto.
      </p>
      <button className="botao" onClick={entrar}>
        Entrar com Google
      </button>
    </section>
  )
}

function MinhasAtleticas({ atleticas }: { atleticas: MinhaAtletica[] }) {
  if (atleticas.length === 0) {
    return (
      <Vazio>
        <h2>Você ainda não faz parte de uma atlética</h2>
        <p>
          Peça um convite à diretoria da sua. É a única forma de entrar — e é
          assim de propósito.
        </p>
      </Vazio>
    )
  }

  return (
    <section>
      <h2>Suas atléticas</h2>
      <div className="grade">
        {atleticas.map(({ atletica, papel, cargo }) => (
          <Link key={atletica.slug} to={`/a/${atletica.slug}`} className="cartao">
            <div className="linha">
              <Brasao atletica={atletica} />
              <div>
                <strong>{atletica.nome}</strong>
                <div className="fraco">{cargo ?? rotuloDoPapel(papel)}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ConvitesEsperando() {
  const busca = useBusca<ConvitePendente[]>(() => Api.convite.meus(), [])

  return (
    <section>
      <h2>Convites esperando você</h2>
      <Conteudo busca={busca}>
        {(convites) =>
          convites.length === 0 ? null : (
            <div className="pilha">
              {convites.map((convite) => (
                <div key={convite.atleticaSlug} className="cartao linha entre">
                  <div>
                    <strong>{convite.atleticaNome}</strong>
                    <div className="fraco">
                      como {rotuloDoPapel(convite.papel)} · expira{' '}
                      {quando(convite.expiraEm)}
                    </div>
                  </div>
                  <span className="fraco">
                    Abra o link que a diretoria enviou para aceitar
                  </span>
                </div>
              ))}
            </div>
          )
        }
      </Conteudo>
    </section>
  )
}

function Vitrine() {
  const busca = useBusca<AtleticaResumo[]>(() => Api.vitrine(), [])

  return (
    <section>
      <h2>Atléticas na plataforma</h2>
      <Conteudo busca={busca}>
        {(atleticas) =>
          atleticas.length === 0 ? (
            <Vazio>Nenhuma atlética por aqui ainda.</Vazio>
          ) : (
            <div className="grade">
              {atleticas.map((atletica) => (
                <div key={atletica.slug} className="cartao linha">
                  <Brasao atletica={atletica} />
                  <div>
                    <strong>{atletica.nome}</strong>
                    <div className="fraco">
                      {atletica.instituicao}
                      {atletica.cidade ? ` · ${atletica.cidade}` : ''}
                      {atletica.uf ? `/${atletica.uf}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </Conteudo>
    </section>
  )
}

/**
 * Brasão, ou as iniciais como reserva. Atlética recém-criada não tem imagem,
 * e um quadrado vazio na vitrine faz a plataforma parecer quebrada.
 */
function Brasao({ atletica }: { atletica: AtleticaResumo }) {
  const estilo = {
    width: '2.75rem',
    height: '2.75rem',
    borderRadius: '10px',
    flexShrink: 0,
    objectFit: 'cover' as const,
    background: atletica.corPrimaria ?? 'var(--fundo-elevado)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
  }

  if (atletica.brasaoUrl) {
    return <img src={atletica.brasaoUrl} alt="" style={estilo} />
  }

  const iniciais =
    atletica.sigla ??
    atletica.nome
      .split(' ')
      .filter((parte) => parte.length > 2)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase()

  return (
    <div style={estilo} aria-hidden="true">
      {iniciais}
    </div>
  )
}

export function rotuloDoPapel(papel: string): string {
  switch (papel) {
    case 'PRESIDENTE':
      return 'Presidente'
    case 'DIRETOR':
      return 'Diretor'
    default:
      return 'Membro'
  }
}
