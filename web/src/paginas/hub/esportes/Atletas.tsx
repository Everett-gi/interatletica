import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Atleta, SituacaoDoAtleta } from '../../../api/tipos-esportes'
import { Avatar, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Secao,
  Segmentado,
} from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { plural, quando } from '../../../formatos'

const SITUACAO: Record<SituacaoDoAtleta, { rotulo: string; classe: string }> = {
  ATIVO: { rotulo: 'ativo', classe: 'etiqueta--sucesso' },
  LESIONADO: { rotulo: 'lesionado', classe: 'etiqueta--alerta' },
  SUSPENSO: { rotulo: 'suspenso', classe: 'etiqueta--perigo' },
  INATIVO: { rotulo: 'inativo', classe: '' },
}

type Visao = 'CARTOES' | 'TABELA'
type Filtro = 'TODOS' | SituacaoDoAtleta | 'PENDENTE'

/**
 * Os atletas da atlética.
 *
 * <p>A coluna de documentação não é burocracia inventada: atleta sem
 * matrícula ativa é o motivo número um de recurso em campeonato
 * universitário, e descobrir isso na véspera custa a equipe inteira por WO.
 * Por isso o filtro "documentação pendente" existe e vem destacado.</p>
 */
export function Atletas() {
  const { slug = '' } = useParams()
  const [visao, setVisao] = useState<Visao>('CARTOES')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [termo, setTermo] = useState('')

  const atletas = useBusca<Atleta[]>(() => Dados.atletas(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Atletas"
        descricao="Quem defende a atlética, em que modalidade, e se a documentação está em dia."
        acoes={
          <Segmentado
            rotulo="Forma de ver os atletas"
            atual={visao}
            aoTrocar={setVisao}
            opcoes={[
              { valor: 'CARTOES', rotulo: 'Cartões', icone: 'grade' },
              { valor: 'TABELA', rotulo: 'Tabela', icone: 'lista' },
            ]}
          />
        }
      />

      <div className="barra-de-filtros">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, curso ou modalidade"
          aria-label="Buscar atletas"
        />
      </div>

      <Conteudo busca={atletas} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="atletas" titulo="Nenhum atleta cadastrado">
                <p className="fraco">
                  Cadastre os atletas para poder inscrever equipes em campeonatos
                  e conferir elegibilidade antes do sorteio das chaves.
                </p>
              </EstadoVazio>
            )
          }

          const pendentes = lista.filter((a) => !a.documentacaoEmDia)
          const alvo = termo.trim().toLowerCase()

          const visiveis = lista
            .filter((a) => {
              if (filtro === 'TODOS') return true
              if (filtro === 'PENDENTE') return !a.documentacaoEmDia
              return a.situacao === filtro
            })
            .filter((a) => alvo === '' ||
              `${a.nome} ${a.curso ?? ''} ${a.modalidades.join(' ')}`
                .toLowerCase().includes(alvo))

          const contar = (f: Filtro) => {
            if (f === 'TODOS') return lista.length
            if (f === 'PENDENTE') return pendentes.length
            return lista.filter((a) => a.situacao === f).length
          }

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Atletas" icone="atletas" valor={lista.length} />
                <Metrica rotulo="Ativos" icone="certo"
                         valor={lista.filter((a) => a.situacao === 'ATIVO').length} />
                <Metrica rotulo="Modalidades" icone="equipes"
                         valor={new Set(lista.flatMap((a) => a.modalidades)).size} />
                <Metrica
                  rotulo="Documentação pendente" icone="alerta" valor={pendentes.length}
                  cor={pendentes.length > 0 ? 'var(--alerta)' : undefined}
                  detalhe={pendentes.length > 0
                    ? 'risco de WO em campeonato' : 'tudo em dia'}
                />
              </div>

              {pendentes.length > 0 ? (
                <div className="aviso aviso--alerta" style={{ marginBottom: '1.1rem' }}>
                  <strong>
                    {plural(pendentes.length, 'atleta')} sem documentação em dia
                  </strong>
                  <p className="fraco" style={{ margin: '0.25rem 0 0' }}>
                    Cobrar matrícula e atestado na véspera do campeonato é como a
                    maioria das equipes perde atleta por WO. Peça agora.
                  </p>
                </div>
              ) : null}

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Situação dos atletas"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODOS', rotulo: 'Todos', contagem: contar('TODOS') },
                    { valor: 'ATIVO', rotulo: 'Ativos', contagem: contar('ATIVO') },
                    { valor: 'LESIONADO', rotulo: 'Lesionados', contagem: contar('LESIONADO') },
                    { valor: 'SUSPENSO', rotulo: 'Suspensos', contagem: contar('SUSPENSO') },
                    { valor: 'PENDENTE', rotulo: 'Documentação pendente',
                      contagem: contar('PENDENTE') },
                  ]}
                />
              </div>

              {visiveis.length === 0 ? (
                <EstadoVazio titulo="Nenhum atleta neste filtro" />
              ) : visao === 'CARTOES' ? (
                <div className="grade">
                  {visiveis.map((a) => (
                    <div key={a.usuarioId} className="cartao">
                      <div className="linha linha--topo" style={{ marginBottom: '0.7rem' }}>
                        <Avatar nome={a.nome} url={a.avatarUrl} tamanho="m" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong>{a.nome}</strong>
                          <div className="fraco">{a.curso ?? 'curso não informado'}</div>
                        </div>
                        {a.numero !== null ? (
                          <span className="numero-medio">#{a.numero}</span>
                        ) : null}
                      </div>

                      <div className="linha" style={{ gap: '0.3rem',
                                                      marginBottom: '0.7rem' }}>
                        <span className={`etiqueta ${SITUACAO[a.situacao].classe}`}>
                          {SITUACAO[a.situacao].rotulo}
                        </span>
                        {a.modalidades.map((m) => (
                          <span key={m} className="etiqueta">{m}</span>
                        ))}
                      </div>

                      <div className="linha entre">
                        <span className="fraco">{a.jogos} jogos · {a.pontos} pontos</span>
                        {a.documentacaoEmDia ? (
                          <span className="selo">
                            <Icone nome="verificado" tamanho={14} /> documentação
                          </span>
                        ) : (
                          <span className="etiqueta etiqueta--alerta">doc. pendente</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Secao>
                  <div className="rolagem">
                    <table className="tabela-cartoes">
                      <thead>
                        <tr>
                          <th>Atleta</th>
                          <th>Modalidades</th>
                          <th className="numero">Jogos</th>
                          <th className="numero">Pontos</th>
                          <th>Situação</th>
                          <th>Documentação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visiveis.map((a) => (
                          <tr key={a.usuarioId}>
                            <td data-rotulo="Atleta">
                              <div style={{ fontWeight: 550 }}>{a.nome}</div>
                              <div className="fraco">
                                {a.curso} · desde {quando(a.desde)}
                              </div>
                            </td>
                            <td data-rotulo="Modalidades">{a.modalidades.join(', ')}</td>
                            <td data-rotulo="Jogos" className="numero">{a.jogos}</td>
                            <td data-rotulo="Pontos" className="numero">{a.pontos}</td>
                            <td data-rotulo="Situação">
                              <span className={`etiqueta ${SITUACAO[a.situacao].classe}`}>
                                {SITUACAO[a.situacao].rotulo}
                              </span>
                            </td>
                            <td data-rotulo="Documentação">
                              {a.documentacaoEmDia ? 'em dia' : (
                                <span className="etiqueta etiqueta--alerta">pendente</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Secao>
              )}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
