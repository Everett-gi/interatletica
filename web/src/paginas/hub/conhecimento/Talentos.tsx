import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { HabilidadeDeTalento, Talento } from '../../../api/tipos-conhecimento'
import { Avatar, Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Chips, EstadoVazio, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'

const HABILIDADE: Record<HabilidadeDeTalento, string> = {
  DESIGN: 'Design',
  FOTOGRAFIA: 'Fotografia',
  VIDEO: 'Vídeo',
  PROGRAMACAO: 'Programação',
  MARKETING: 'Marketing',
  ORGANIZACAO: 'Organização',
  ARBITRAGEM: 'Arbitragem',
  COMUNICACAO: 'Comunicação',
  JURIDICO: 'Jurídico',
}

type Filtro = 'TODAS' | HabilidadeDeTalento

/**
 * O banco de talentos (§54).
 *
 * <p>Metade do que uma atlética contrata fora já existe dentro da rede: quem
 * faz a arte do uniforme, quem cobre o jogo, quem revisa o estatuto. O banco
 * existe para que a busca por essa pessoa não dependa de conhecer alguém que
 * conhece alguém.</p>
 */
export function Talentos() {
  const { slug = '' } = useParams()
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [soDisponiveis, setSoDisponiveis] = useState(false)

  const talentos = useBusca<Talento[]>(() => Dados.talentos(), [])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Banco de talentos"
        descricao="Quem, dentro da rede, faz o que a sua atlética estava prestes a contratar fora."
        trilha={[
          { rotulo: 'Conhecimento', para: `/hub/${slug}/conhecimento` },
          { rotulo: 'Talentos' },
        ]}
        acoes={
          <button className="botao botao--discreto" disabled
                  title="Entrar no banco chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Entrar no banco
          </button>
        }
      />

      <Conteudo
        busca={talentos}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="11rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="talentos" titulo="Ninguém no banco ainda">
                <p className="fraco">
                  Se você faz design, fotografia, vídeo ou revisão de documento,
                  entre no banco. É como outra atlética vai te achar.
                </p>
              </EstadoVazio>
            )
          }

          const visiveis = lista
            .filter((t) => filtro === 'TODAS' || t.habilidades.includes(filtro))
            .filter((t) => !soDisponiveis || t.disponivel)
            .sort((a, b) => b.trabalhos - a.trabalhos)

          const contar = (h: HabilidadeDeTalento) =>
            lista.filter((t) => t.habilidades.includes(h)).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Pessoas no banco" icone="talentos" valor={lista.length} />
                <Metrica rotulo="Disponíveis agora" icone="certo"
                         valor={lista.filter((t) => t.disponivel).length} />
                <Metrica rotulo="Habilidades" icone="grade"
                         valor={new Set(lista.flatMap((t) => t.habilidades)).size} />
                <Metrica rotulo="Trabalhos feitos" icone="projetos"
                         valor={lista.reduce((s, t) => s + t.trabalhos, 0)} />
              </div>

              <div className="barra-de-filtros">
                <Chips
                  rotulo="Habilidades"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(HABILIDADE) as HabilidadeDeTalento[])
                      .filter((h) => contar(h) > 0)
                      .map((h) => ({
                        valor: h as Filtro,
                        rotulo: HABILIDADE[h],
                        contagem: contar(h),
                      })),
                  ]}
                />
                <button
                  className="chip"
                  aria-pressed={soDisponiveis}
                  onClick={() => setSoDisponiveis((v) => !v)}
                >
                  Só disponíveis
                </button>
              </div>

              <Secao>
                {visiveis.length === 0 ? (
                  <EstadoVazio titulo="Ninguém com esse filtro" />
                ) : (
                  <div className="grade grade--larga">
                    {visiveis.map((t) => (
                      <div key={t.usuarioId} className="cartao">
                        <div className="linha linha--topo" style={{ marginBottom: '0.7rem' }}>
                          <Avatar nome={t.nome} url={t.avatarUrl} tamanho="m" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong>{t.nome}</strong>
                            {t.atletica ? (
                              <div className="linha fraco" style={{ gap: '0.35rem' }}>
                                <Brasao atletica={t.atletica} tamanho="p" />
                                {t.atletica.nome}
                              </div>
                            ) : null}
                          </div>
                          <span className={`etiqueta ${
                            t.disponivel ? 'etiqueta--sucesso' : ''}`}>
                            {t.disponivel ? 'disponível' : 'ocupado'}
                          </span>
                        </div>

                        <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                          {t.descricao}
                        </p>

                        <div className="chips" style={{ marginBottom: '0.8rem' }}>
                          {t.habilidades.map((h) => (
                            <span key={h} className="etiqueta etiqueta--acento">
                              {HABILIDADE[h]}
                            </span>
                          ))}
                        </div>

                        <div className="linha entre">
                          <span className="fraco">
                            {t.trabalhos}{' '}
                            {t.trabalhos === 1 ? 'trabalho' : 'trabalhos'} na rede
                          </span>
                          {t.portfolioUrl ? (
                            <a href={t.portfolioUrl} target="_blank" rel="noreferrer"
                               className="linha" style={{ gap: '0.3rem' }}>
                              <Icone nome="externo" tamanho={14} /> portfólio
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Secao>
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
