import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dados } from '../dados'
import type { ResumoDaAtleticaNaRede } from '../api/tipos-rede'
import { Brasao, Conteudo, Esqueleto, useBusca, Vazio } from '../ui/componentes'

/**
 * Todas as atléticas da plataforma.
 *
 * <p>A ordem é alfabética, não por tamanho nem por pontuação. Ranquear a
 * lista institucional faria a plataforma tomar partido — e o quadro de
 * medalhas, que é onde a comparação faz sentido, tem página própria.</p>
 */
export function Rede() {
  const [busca, setBusca] = useState('')
  const atleticas = useBusca<ResumoDaAtleticaNaRede[]>(() => Dados.atleticasDaRede(), [])

  const termo = busca.trim().toLowerCase()
  const filtrar = (lista: ResumoDaAtleticaNaRede[]) =>
    termo === ''
      ? lista
      : lista.filter((r) =>
          [r.atletica.nome, r.atletica.instituicao, r.atletica.cidade ?? '',
           ...r.modalidades].join(' ').toLowerCase().includes(termo))

  return (
    <div className="pilha">
      <header>
        <h1>Atléticas</h1>
        <p className="suave">
          Quem já está na plataforma. A entrada é por convite — não existe
          autocadastro, e é assim de propósito.
        </p>
      </header>

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
          const visiveis = filtrar(lista)
          if (visiveis.length === 0) {
            return <Vazio titulo="Nenhuma atlética encontrada">
              Tente outro termo de busca.
            </Vazio>
          }
          return (
            <div className="grade grade--larga">
              {visiveis.map((resumo) => (
                <CartaoDeAtletica key={resumo.atletica.slug} resumo={resumo} />
              ))}
            </div>
          )
        }}
      </Conteudo>
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
        {resumo.posicaoNoQuadro ? (
          <span className="etiqueta etiqueta--acento">
            {resumo.posicaoNoQuadro}º no quadro
          </span>
        ) : null}
      </div>

      <div className="linha" style={{ gap: '1.2rem' }}>
        <Contagem valor={resumo.membros} rotulo="membros" />
        <Contagem valor={resumo.eventosNoAno} rotulo="eventos" />
        <Contagem valor={resumo.equipes} rotulo="equipes" />
      </div>

      {resumo.modalidades.length > 0 ? (
        <div className="linha" style={{ gap: '0.3rem', marginTop: '0.8rem' }}>
          {resumo.modalidades.slice(0, 3).map((modalidade) => (
            <span key={modalidade} className="etiqueta">{modalidade}</span>
          ))}
        </div>
      ) : null}
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
