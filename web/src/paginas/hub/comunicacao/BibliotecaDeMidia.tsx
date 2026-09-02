import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Midia, PastaDeMidia } from '../../../api/tipos-comunicacao'
import { Conteudo, Esqueleto, Metrica, Previa, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Gaveta, Secao } from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

const PASTA: Record<PastaDeMidia, string> = {
  LOGO: 'Logo e brasão',
  UNIFORMES: 'Uniformes',
  EVENTOS: 'Eventos',
  CAMPEONATOS: 'Campeonatos',
  CAMPANHAS: 'Campanhas',
  PATROCINADORES: 'Patrocinadores',
  HISTORICO: 'Histórico',
}

const ICONE: Record<Midia['tipo'], NomeDoIcone> = {
  IMAGEM: 'midia',
  VIDEO: 'campanhas',
  VETOR: 'modelos',
}

type Filtro = 'TODAS' | PastaDeMidia

/**
 * A biblioteca de mídia (§51).
 *
 * <p>Miniaturas em grade e pastas por assunto. O caso que a justifica é
 * trivial e recorrente: alguém precisa do brasão em alta na véspera de
 * imprimir a faixa, e o arquivo está no WhatsApp de quem se formou.</p>
 */
export function BibliotecaDeMidia() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [aberta, setAberta] = useState<Midia | null>(null)

  const midias = useBusca<Midia[]>(() => Dados.midias(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Biblioteca de mídia"
        descricao="Brasão, fotos, vídeos e artes — no lugar onde a próxima gestão vai procurar."
        trilha={[
          { rotulo: 'Comunicação', para: `/hub/${slug}/comunicacao` },
          { rotulo: 'Mídia' },
        ]}
        acoes={diretor ? (
          <button className="botao" disabled title="Upload chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Enviar arquivo
          </button>
        ) : undefined}
      />

      <Previa oQueFalta="Enviar e baixar arquivo ainda não chegam ao servidor." />

      <Conteudo busca={midias} esqueleto={<Esqueleto altura="18rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="midia" titulo="A biblioteca está vazia">
                <p className="fraco">
                  Comece pelo brasão em alta resolução. É o arquivo que mais se
                  perde e o que mais se procura na véspera.
                </p>
              </EstadoVazio>
            )
          }

          const visiveis = filtro === 'TODAS'
            ? lista
            : lista.filter((m) => m.pasta === filtro)

          const contar = (p: PastaDeMidia) => lista.filter((m) => m.pasta === p).length
          const total = lista.reduce((s, m) => s + m.tamanhoEmKb, 0)

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Arquivos" icone="midia" valor={lista.length} />
                <Metrica rotulo="Imagens" icone="grade"
                         valor={lista.filter((m) => m.tipo === 'IMAGEM').length} />
                <Metrica rotulo="Vídeos" icone="campanhas"
                         valor={lista.filter((m) => m.tipo === 'VIDEO').length} />
                <Metrica rotulo="Espaço usado" icone="patrimonio"
                         valor={`${(total / 1024).toFixed(0)} MB`} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Pastas de mídia"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(PASTA) as PastaDeMidia[])
                      .filter((p) => contar(p) > 0)
                      .map((p) => ({
                        valor: p as Filtro,
                        rotulo: PASTA[p],
                        contagem: contar(p),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="midias">
                  {visiveis.map((m) => (
                    <button
                      key={m.id}
                      style={{ background: 'none', border: 'none', padding: 0,
                               textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
                      onClick={() => setAberta(m)}
                    >
                      <div className="midia__miniatura" style={{ background: m.cor }}>
                        <Icone nome={ICONE[m.tipo]} tamanho={26} />
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 550,
                                    marginTop: '0.4rem',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap' }}>
                        {m.nome}
                      </div>
                      <div className="fraco" style={{ fontSize: '0.75rem' }}>
                        {m.tamanhoEmKb > 1024
                          ? `${(m.tamanhoEmKb / 1024).toFixed(1)} MB`
                          : `${m.tamanhoEmKb} kB`}
                      </div>
                    </button>
                  ))}
                </div>
              </Secao>

              {aberta ? (
                <Gaveta
                  titulo={aberta.nome}
                  aoFechar={() => setAberta(null)}
                  rodape={
                    <button className="botao botao--largo" disabled
                            title="Download chega com a API conectada">
                      <Icone nome="baixar" tamanho={16} /> Baixar arquivo
                    </button>
                  }
                >
                  <div
                    className="midia__miniatura"
                    style={{ background: aberta.cor, aspectRatio: '16 / 10',
                             marginBottom: '1rem' }}
                  >
                    <Icone nome={ICONE[aberta.tipo]} tamanho={40} />
                  </div>

                  <div className="pilha pilha--densa">
                    <Campo rotulo="Pasta" valor={PASTA[aberta.pasta]} />
                    <Campo rotulo="Tipo" valor={aberta.tipo.toLowerCase()} />
                    <Campo
                      rotulo="Tamanho"
                      valor={aberta.tamanhoEmKb > 1024
                        ? `${(aberta.tamanhoEmKb / 1024).toFixed(1)} MB`
                        : `${aberta.tamanhoEmKb} kB`}
                    />
                    <Campo rotulo="Autor" valor={aberta.autorNome} />
                    <Campo rotulo="Adicionado" valor={quando(aberta.adicionadaEm)} />
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

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="linha entre" style={{ borderBottom: '1px solid var(--borda)',
                                          paddingBottom: '0.4rem' }}>
      <span className="fraco">{rotulo}</span>
      <span style={{ fontWeight: 550, textAlign: 'right' }}>{valor}</span>
    </div>
  )
}
