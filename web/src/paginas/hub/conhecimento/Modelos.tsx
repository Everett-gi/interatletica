import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { AreaDeConhecimento, Modelo } from '../../../api/tipos-conhecimento'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Gaveta,
  Secao,
} from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { AREA } from '../rede/PedidosDeAjuda'

const ICONE: Record<Modelo['formato'], NomeDoIcone> = {
  DOCX: 'modelos',
  XLSX: 'resultados',
  PDF: 'documentos',
  TEXTO: 'documentos',
  CHECKLIST: 'tarefas',
}

type Filtro = 'TODAS' | AreaDeConhecimento

/**
 * A biblioteca de modelos (§39).
 *
 * <p>Estatuto, ata, contrato, regulamento. São os documentos que travam uma
 * atlética nova por semanas — não porque sejam difíceis, mas porque ninguém
 * sabe o que precisa constar. A prévia mostra a estrutura antes de usar, que
 * é o que responde "isso serve para mim?".</p>
 */
export function Modelos() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [aberto, setAberto] = useState<Modelo | null>(null)

  const modelos = useBusca<Modelo[]>(() => Dados.modelos(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Modelos"
        descricao="Documentos prontos, com a estrutura que os cartórios e as assembleias esperam."
        trilha={[
          { rotulo: 'Conhecimento', para: `/hub/${slug}/conhecimento` },
          { rotulo: 'Modelos' },
        ]}
      />

      <Conteudo
        busca={modelos}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="10rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="modelos" titulo="Nenhum modelo publicado">
                <p className="fraco">
                  Compartilhe um documento que a sua atlética já usa. O que é
                  rotina para você trava outra atlética há meses.
                </p>
              </EstadoVazio>
            )
          }

          const visiveis = filtro === 'TODAS'
            ? lista
            : lista.filter((m) => m.area === filtro)

          const contar = (a: AreaDeConhecimento) =>
            lista.filter((m) => m.area === a).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Modelos" icone="modelos" valor={lista.length} />
                <Metrica rotulo="Usos na rede" icone="certo"
                         valor={lista.reduce((s, m) => s + m.usos, 0)} />
                <Metrica rotulo="Áreas" icone="grade"
                         valor={new Set(lista.map((m) => m.area)).size} />
                <Metrica rotulo="Atléticas autoras" icone="rede"
                         valor={new Set(lista.map((m) => m.autorAtletica?.slug)
                           .filter(Boolean)).size} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Áreas dos modelos"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todos', contagem: lista.length },
                    ...(Object.keys(AREA) as AreaDeConhecimento[])
                      .filter((a) => contar(a) > 0)
                      .map((a) => ({
                        valor: a as Filtro,
                        rotulo: AREA[a],
                        contagem: contar(a),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((m) => (
                    <button
                      key={m.id}
                      className="cartao cartao--clicavel"
                      style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer' }}
                      onClick={() => setAberto(m)}
                    >
                      <div className="linha entre" style={{ marginBottom: '0.6rem' }}>
                        <span className="notificacao__icone">
                          <Icone nome={ICONE[m.formato]} tamanho={17} />
                        </span>
                        <span className="etiqueta">{m.formato}</span>
                      </div>

                      <h3 style={{ marginBottom: '0.25rem' }}>{m.nome}</h3>
                      <p className="fraco" style={{ marginBottom: '0.9rem' }}>
                        {m.descricao}
                      </p>

                      <div className="linha entre">
                        {m.autorAtletica ? (
                          <div className="linha" style={{ gap: '0.4rem', minWidth: 0 }}>
                            <Brasao atletica={m.autorAtletica} tamanho="p" />
                            <span className="fraco">{m.autorAtletica.sigla}</span>
                          </div>
                        ) : (
                          <span className="fraco">plataforma</span>
                        )}
                        <span className="etiqueta etiqueta--acento">{m.usos} usos</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Secao>

              {aberto ? (
                <Gaveta
                  titulo={aberto.nome}
                  aoFechar={() => setAberto(null)}
                  rodape={
                    <button className="botao botao--largo" disabled
                            title="Download chega com a API conectada">
                      <Icone nome="baixar" tamanho={16} /> Usar este modelo
                    </button>
                  }
                >
                  <div className="linha entre" style={{ marginBottom: '0.9rem' }}>
                    <span className="etiqueta">{AREA[aberto.area]}</span>
                    <span className="etiqueta etiqueta--acento">{aberto.usos} usos</span>
                  </div>

                  <p className="suave">{aberto.descricao}</p>

                  <h3>O que este modelo contém</h3>
                  <div className="cartao" style={{ marginBottom: '1.2rem' }}>
                    <ol className="lista-marcada" style={{ paddingLeft: '1.2rem' }}>
                      {aberto.previa.map((linha) => <li key={linha}>{linha}</li>)}
                    </ol>
                  </div>

                  {aberto.autorAtletica ? (
                    <>
                      <h3>Quem compartilhou</h3>
                      <Link to={`/a/${aberto.autorAtletica.slug}`}
                            className="cartao cartao--clicavel linha">
                        <Brasao atletica={aberto.autorAtletica} tamanho="m" />
                        <div style={{ minWidth: 0 }}>
                          <strong>{aberto.autorAtletica.nome}</strong>
                          <div className="fraco">{aberto.autorAtletica.instituicao}</div>
                        </div>
                      </Link>
                    </>
                  ) : null}

                  <div className="fraco" style={{ marginTop: '1rem' }}>
                    Atualizado {quando(aberto.atualizadoEm)}. Modelo é ponto de
                    partida: revise com quem entende do assunto na sua instituição
                    antes de registrar.
                  </div>
                </Gaveta>
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
