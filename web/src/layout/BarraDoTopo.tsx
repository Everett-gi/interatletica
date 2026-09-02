import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dados, MODO_DEMO } from '../dados'
import type { Notificacao, CategoriaDeNotificacao } from '../api/tipos-plataforma'
import { sair as sairDaSessao } from '../api/cliente'
import { useSessao } from '../sessao/SessaoContexto'
import { Avatar, Brasao, useBusca } from '../ui/componentes'
import { Icone, type NomeDoIcone } from '../ui/icones'
import { Gaveta } from '../ui/pagina'
import { quando } from '../formatos'
import { PesquisaGlobal } from './PesquisaGlobal'
import { ACOES_RAPIDAS } from './navegacao'
import { useMenu } from './useMenu'

/**
 * A barra do topo: onde estou, o que procuro, o que me espera, quem sou.
 *
 * <p>São quatro perguntas e quatro controles, nesta ordem — e nenhum a mais.
 * Topo que acumula atalho vira faixa de ícones sem significado, que é
 * exatamente o que o §103 manda evitar.</p>
 */
export function BarraDoTopo({ slug, aoAbrirMenu }: {
  slug: string
  aoAbrirMenu: () => void
}) {
  const [gavetaAberta, setGavetaAberta] = useState(false)
  const notificacoes = useBusca<Notificacao[]>(() => Dados.notificacoes(), [])
  const naoLidas = notificacoes.dados?.filter((n) => !n.lida).length ?? 0

  return (
    <>
      <header className="app__topo">
        <button
          className="icone-botao so-mobile"
          onClick={aoAbrirMenu}
          aria-label="Abrir a navegação"
          aria-controls="navegacao-principal"
        >
          <Icone nome="menu" />
        </button>

        <SeletorDeContexto slug={slug} />

        <PesquisaGlobal contextoSlug={slug} />

        <span className="espaco" />

        <MenuDeCriacao slug={slug} />

        <button
          className="icone-botao"
          onClick={() => setGavetaAberta(true)}
          aria-label={naoLidas > 0
            ? `Notificações: ${naoLidas} não lidas`
            : 'Notificações'}
        >
          <Icone nome="sino" />
          {naoLidas > 0 ? (
            <span className="icone-botao__ponto">{naoLidas > 9 ? '9+' : naoLidas}</span>
          ) : null}
        </button>

        <Link to="/ajuda" className="icone-botao so-desktop" aria-label="Central de ajuda">
          <Icone nome="info" />
        </Link>

        <MenuDoPerfil />
      </header>

      {gavetaAberta ? (
        <CentralDeNotificacoes
          slug={slug}
          notificacoes={notificacoes.dados ?? []}
          carregando={notificacoes.carregando}
          aoAtualizar={notificacoes.definir}
          aoFechar={() => setGavetaAberta(false)}
        />
      ) : null}
    </>
  )
}

// ---------------------------------------------------------------------
// Seletor de contexto (§8)
// ---------------------------------------------------------------------

/**
 * Em qual organização eu estou trabalhando.
 *
 * <p>A mesma conta preside uma atlética e é membro comum de outra — o papel
 * mora no vínculo, não na pessoa. Sem este seletor visível o tempo todo, a
 * pergunta "por que não consigo criar evento aqui?" não tem resposta na
 * tela.</p>
 */
function SeletorDeContexto({ slug }: { slug: string }) {
  const { perfil, vinculo } = useSessao()
  const menu = useMenu<HTMLDivElement>()
  const atual = vinculo(slug)

  if (!perfil || !atual) return null

  return (
    <div className="contexto" ref={menu.ancora}>
      <button
        className="contexto__botao"
        onClick={menu.alternar}
        aria-expanded={menu.aberto}
        aria-haspopup="menu"
      >
        <Brasao atletica={atual.atletica} tamanho="p" />
        <span className="contexto__nome">
          {atual.atletica.sigla ?? atual.atletica.nome}
        </span>
        <Icone nome="baixo" tamanho={14} />
      </button>

      {menu.aberto ? (
        <div className="painel-flutuante contexto__painel" role="menu">
          <div className="painel__titulo">Minhas organizações</div>
          {perfil.atleticas.map((v) => (
            <Link
              key={v.atletica.slug}
              to={`/hub/${v.atletica.slug}`}
              className="item-de-menu"
              role="menuitem"
              onClick={menu.fechar}
            >
              <Brasao atletica={v.atletica} tamanho="p" />
              <span className="item-de-menu__texto">
                <span className="item-de-menu__titulo">{v.atletica.nome}</span>
                <span className="item-de-menu__detalhe">
                  {v.cargo ?? v.papel.toLowerCase()}
                </span>
              </span>
              {v.atletica.slug === slug ? <Icone nome="certo" tamanho={16} /> : null}
            </Link>
          ))}
          <div className="menu__separador" />
          <Link to="/rede" className="item-de-menu" role="menuitem" onClick={menu.fechar}>
            <Icone nome="mais" tamanho={16} />
            <span className="item-de-menu__texto">
              <span className="item-de-menu__titulo">Participar de outra atlética</span>
              <span className="item-de-menu__detalhe">A entrada é por convite da diretoria</span>
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------
// Ações rápidas (§99)
// ---------------------------------------------------------------------

function MenuDeCriacao({ slug }: { slug: string }) {
  const { podeAtuarComo } = useSessao()
  const menu = useMenu<HTMLDivElement>()
  const disponiveis = ACOES_RAPIDAS.filter(
    (acao) => acao.exige === undefined || podeAtuarComo(slug, acao.exige))

  if (disponiveis.length === 0) return null

  return (
    <div className="contexto" ref={menu.ancora}>
      <button
        className="botao botao--pequeno"
        onClick={menu.alternar}
        aria-expanded={menu.aberto}
        aria-haspopup="menu"
      >
        <Icone nome="mais" tamanho={16} />
        <span className="so-desktop">Criar</span>
      </button>

      {menu.aberto ? (
        <div className="painel-flutuante contexto__painel" role="menu">
          <div className="painel__titulo">Criar</div>
          {disponiveis.map((acao) => (
            <Link
              key={acao.para}
              to={`/hub/${slug}/${acao.para}`}
              className="item-de-menu"
              role="menuitem"
              onClick={menu.fechar}
            >
              <Icone nome={acao.icone} tamanho={16} />
              <span className="item-de-menu__texto">
                <span className="item-de-menu__titulo">{acao.rotulo}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------
// Perfil (§7)
// ---------------------------------------------------------------------

function MenuDoPerfil() {
  const { perfil, aparencia, trocarAparencia } = useSessao()
  const menu = useMenu<HTMLDivElement>()
  const navegar = useNavigate()

  if (!perfil) return null

  return (
    <div className="contexto" ref={menu.ancora}>
      <button
        className="icone-botao"
        onClick={menu.alternar}
        aria-expanded={menu.aberto}
        aria-haspopup="menu"
        aria-label="Menu do perfil"
        style={{ padding: 0 }}
      >
        <Avatar nome={perfil.nome} url={perfil.avatarUrl} />
      </button>

      {menu.aberto ? (
        <div className="painel-flutuante contexto__painel" role="menu">
          <div style={{ padding: '0.6rem 0.65rem 0.4rem' }}>
            <div style={{ fontWeight: 650 }}>{perfil.nome}</div>
            <div className="fraco">{perfil.email}</div>
          </div>
          <div className="menu__separador" />
          <Link to="/eu" className="item-de-menu" role="menuitem" onClick={menu.fechar}>
            <Icone nome="usuario" tamanho={16} />
            <span className="item-de-menu__texto">
              <span className="item-de-menu__titulo">Meu perfil</span>
            </span>
          </Link>
          <Link to="/eu/historico" className="item-de-menu" role="menuitem"
                onClick={menu.fechar}>
            <Icone nome="historico" tamanho={16} />
            <span className="item-de-menu__texto">
              <span className="item-de-menu__titulo">Meu histórico</span>
            </span>
          </Link>
          {perfil.operador ? (
            <Link to="/administracao" className="item-de-menu" role="menuitem"
                  onClick={menu.fechar}>
              <Icone nome="ajustes" tamanho={16} />
              <span className="item-de-menu__texto">
                <span className="item-de-menu__titulo">Administração da rede</span>
              </span>
            </Link>
          ) : null}
          <button className="item-de-menu" role="menuitem" onClick={trocarAparencia}>
            <Icone nome={aparencia === 'escura' ? 'sol' : 'lua'} tamanho={16} />
            <span className="item-de-menu__texto">
              <span className="item-de-menu__titulo">
                Tema {aparencia === 'escura' ? 'claro' : 'escuro'}
              </span>
            </span>
          </button>
          <div className="menu__separador" />
          <button
            className="item-de-menu"
            role="menuitem"
            onClick={() => {
              menu.fechar()
              if (MODO_DEMO) {
                void Dados.sairDemo().then(() => navegar('/', { replace: true }))
              } else {
                void sairDaSessao()
              }
            }}
          >
            <Icone nome="sair" tamanho={16} />
            <span className="item-de-menu__texto">
              <span className="item-de-menu__titulo">Sair</span>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------
// Notificações (§59)
// ---------------------------------------------------------------------

const CATEGORIA: Record<CategoriaDeNotificacao, { rotulo: string; icone: NomeDoIcone }> = {
  GESTAO: { rotulo: 'Gestão', icone: 'gestao' },
  EVENTOS: { rotulo: 'Eventos', icone: 'eventos' },
  REDE: { rotulo: 'Rede', icone: 'rede' },
  MENSAGENS: { rotulo: 'Mensagens', icone: 'comunidades' },
  FINANCEIRO: { rotulo: 'Financeiro', icone: 'financeiro' },
  ESPORTES: { rotulo: 'Esportes', icone: 'jogos' },
}

type Filtro = 'TODAS' | CategoriaDeNotificacao

function CentralDeNotificacoes({
  slug, notificacoes, carregando, aoAtualizar, aoFechar,
}: {
  slug: string
  notificacoes: Notificacao[]
  carregando: boolean
  aoAtualizar: (lista: Notificacao[]) => void
  aoFechar: () => void
}) {
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const navegar = useNavigate()

  const visiveis = filtro === 'TODAS'
    ? notificacoes
    : notificacoes.filter((n) => n.categoria === filtro)

  const categorias = [...new Set(notificacoes.map((n) => n.categoria))]

  function abrir(item: Notificacao) {
    void Dados.marcarNotificacaoLida(item.id).then(aoAtualizar)
    if (item.destino) {
      aoFechar()
      navegar(`/hub/${item.atleticaSlug ?? slug}/${item.destino}`)
    }
  }

  return (
    <Gaveta titulo="Notificações" aoFechar={aoFechar}>
      <div className="chips" style={{ marginBottom: '0.8rem' }}>
        <button className="chip" aria-pressed={filtro === 'TODAS'}
                onClick={() => setFiltro('TODAS')}>
          Todas <span style={{ opacity: 0.7 }}>{notificacoes.length}</span>
        </button>
        {categorias.map((categoria) => (
          <button
            key={categoria}
            className="chip"
            aria-pressed={filtro === categoria}
            onClick={() => setFiltro(categoria)}
          >
            {CATEGORIA[categoria].rotulo}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="fraco">Carregando…</div>
      ) : visiveis.length === 0 ? (
        <div className="vazio">
          <h3>Nada por aqui</h3>
          <p style={{ margin: 0 }}>
            Prazos, convites e respostas da rede aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="pilha pilha--densa">
          {visiveis.map((item) => (
            <button
              key={item.id}
              className={`notificacao${item.lida ? '' : ' notificacao--nova'}${
                item.urgente ? ' notificacao--urgente' : ''}`}
              onClick={() => abrir(item)}
            >
              <span className="notificacao__icone">
                <Icone nome={CATEGORIA[item.categoria].icone} tamanho={16} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600 }}>{item.titulo}</span>
                <span className="fraco" style={{ display: 'block' }}>{item.detalhe}</span>
                <span className="fraco" style={{ display: 'block', marginTop: '0.15rem' }}>
                  {quando(item.quando)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {notificacoes.some((n) => !n.lida) ? (
        <button
          className="botao botao--discreto botao--largo"
          style={{ marginTop: '1rem' }}
          onClick={() => void Dados.marcarTodasLidas().then(aoAtualizar)}
        >
          Marcar todas como lidas
        </button>
      ) : null}
    </Gaveta>
  )
}
