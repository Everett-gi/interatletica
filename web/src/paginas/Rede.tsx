import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dados } from '../dados'
import type { ItemDaAgendaDaRede, ResumoDaAtleticaNaRede } from '../api/tipos-rede'
import {
  Abas,
  Brasao,
  Conteudo,
  Esqueleto,
  EtiquetaDeTipo,
  useBusca,
  Vazio,
} from '../ui/componentes'
import { dataEHora, quando } from '../formatos'

type Visao = 'ATLETICAS' | 'AGENDA'

/**
 * A rede: as outras atléticas e o que elas abriram para fora.
 *
 * <p>Secundária de propósito. O trabalho do dia a dia é dentro da própria
 * atlética; isto aqui é para achar um campeonato aberto ou saber quem mais
 * está na plataforma. Na versão anterior era a tela inicial, o que colocava
 * a pergunta menos frequente na frente da mais frequente.</p>
 */
export function Rede() {
  const [visao, setVisao] = useState<Visao>('ATLETICAS')
  const [busca, setBusca] = useState('')

  const atleticas = useBusca<ResumoDaAtleticaNaRede[]>(() => Dados.atleticasDaRede(), [])
  const agenda = useBusca<ItemDaAgendaDaRede[]>(() => Dados.agendaDaRede(), [])

  return (
    <div className="pilha">
      <header className="linha entre">
        <div>
          <h1>Outras atléticas</h1>
          <p className="fraco" style={{ margin: 0 }}>
            Quem está na plataforma e o que abriram para fora.
          </p>
        </div>
        <Link to="/rede/quadro" className="botao botao--discreto botao--pequeno">
          Quadro da temporada
        </Link>
      </header>

      <Abas
        atual={visao}
        aoTrocar={setVisao}
        opcoes={[
          { valor: 'ATLETICAS', rotulo: 'Atléticas', contagem: atleticas.dados?.length },
          { valor: 'AGENDA', rotulo: 'Eventos abertos', contagem: agenda.dados?.length },
        ]}
      />

      {visao === 'ATLETICAS' ? (
        <>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, instituição, cidade ou modalidade"
            aria-label="Buscar atléticas"
          />

          <Conteudo
            busca={atleticas}
            esqueleto={
              <div className="grade grade--larga">
                {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="11rem" />)}
              </div>
            }
          >
            {(lista) => {
              const termo = busca.trim().toLowerCase()
              const visiveis = termo === '' ? lista : lista.filter((r) =>
                [r.atletica.nome, r.atletica.instituicao, r.atletica.cidade ?? '',
                 ...r.modalidades].join(' ').toLowerCase().includes(termo))

              if (visiveis.length === 0) {
                return <Vazio titulo="Nenhuma atlética encontrada">
                  Tente outro termo.
                </Vazio>
              }
              return (
                <div className="grade grade--larga">
                  {visiveis.map((r) => <CartaoDeAtletica key={r.atletica.slug} resumo={r} />)}
                </div>
              )
            }}
          </Conteudo>
        </>
      ) : (
        <Conteudo
          busca={agenda}
          esqueleto={
            <div className="grade">
              {[0, 1, 2].map((i) => <Esqueleto key={i} altura="9rem" />)}
            </div>
          }
        >
          {(itens) =>
            itens.length === 0 ? (
              <Vazio titulo="Nada aberto no momento">
                Eventos marcados como públicos ou para a rede aparecem aqui.
              </Vazio>
            ) : (
              <div className="grade">
                {itens.map((item) => <CartaoDeEvento key={item.evento.id} item={item} />)}
              </div>
            )
          }
        </Conteudo>
      )}
    </div>
  )
}

function CartaoDeAtletica({ resumo }: { resumo: ResumoDaAtleticaNaRede }) {
  const { atletica } = resumo

  return (
    <Link to={`/a/${atletica.slug}`} className="cartao cartao--clicavel">
      <div className="linha linha--topo" style={{ marginBottom: '0.8rem' }}>
        <Brasao atletica={atletica} tamanho="g" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: '0.15rem' }}>{atletica.nome}</h3>
          <div className="fraco">{atletica.instituicao}</div>
          {atletica.cidade ? (
            <div className="fraco">{atletica.cidade}/{atletica.uf}</div>
          ) : null}
        </div>
      </div>

      <div className="linha" style={{ gap: '1.2rem' }}>
        <Contagem valor={resumo.membros} rotulo="membros" />
        <Contagem valor={resumo.eventosNoAno} rotulo="eventos" />
        <Contagem valor={resumo.equipes} rotulo="equipes" />
      </div>

      {resumo.modalidades.length > 0 ? (
        <div className="linha" style={{ gap: '0.3rem', marginTop: '0.8rem' }}>
          {resumo.modalidades.slice(0, 3).map((m) => (
            <span key={m} className="etiqueta">{m}</span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}

function CartaoDeEvento({ item }: { item: ItemDaAgendaDaRede }) {
  const { evento, atletica } = item

  return (
    <Link to={`/e/${atletica.slug}/${evento.slug}`} className="cartao cartao--clicavel">
      <div className="linha" style={{ marginBottom: '0.6rem' }}>
        <Brasao atletica={atletica} tamanho="p" />
        <span className="fraco" style={{ flex: 1, minWidth: 0 }}>{atletica.nome}</span>
        {item.organizadoras > 1 ? (
          <span className="etiqueta etiqueta--acento">
            {item.organizadoras} atléticas
          </span>
        ) : null}
      </div>

      <h3 style={{ marginBottom: '0.3rem' }}>{evento.titulo}</h3>

      <div className="linha" style={{ gap: '0.35rem', marginBottom: '0.6rem' }}>
        <EtiquetaDeTipo tipo={evento.tipo} />
        {evento.modalidade ? <span className="etiqueta">{evento.modalidade}</span> : null}
      </div>

      <div className="fraco">{dataEHora(evento.inicioEm)} · {quando(evento.inicioEm)}</div>
      {evento.localNome ? <div className="fraco">{evento.localNome}</div> : null}

      <div className="linha entre" style={{ marginTop: '0.7rem' }}>
        <span className="fraco">{item.inscritos} inscritos</span>
        {item.vagasRestantes !== null ? (
          <span className={`etiqueta ${
            item.vagasRestantes === 0 ? 'etiqueta--alerta' : 'etiqueta--sucesso'}`}>
            {item.vagasRestantes === 0 ? 'lista de espera' : `${item.vagasRestantes} vagas`}
          </span>
        ) : null}
      </div>
    </Link>
  )
}

function Contagem({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{valor}</div>
      <div className="fraco">{rotulo}</div>
    </div>
  )
}
