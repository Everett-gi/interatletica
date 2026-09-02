import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { EtapaDaParceria, Parceria, TipoDeParceria } from '../../../api/tipos-mercado'
import { Brasao, Conteudo, Esqueleto, Metrica, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  Confirmacao,
  EstadoVazio,
  Secao,
} from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

const TIPO: Record<TipoDeParceria, { rotulo: string; icone: NomeDoIcone }> = {
  EMPRESA: { rotulo: 'Empresa', icone: 'mercado' },
  ATLETICA: { rotulo: 'Entre atléticas', icone: 'rede' },
  INSTITUICAO: { rotulo: 'Instituição', icone: 'atletica' },
}

const ETAPA: Record<EtapaDaParceria, { rotulo: string; classe: string }> = {
  DISPONIVEL: { rotulo: 'Disponível', classe: 'etiqueta--sucesso' },
  INTERESSE: { rotulo: 'Com interessadas', classe: 'etiqueta--acento' },
  NEGOCIACAO: { rotulo: 'Em negociação', classe: 'etiqueta--alerta' },
  ATIVA: { rotulo: 'Ativa', classe: 'etiqueta--sucesso' },
  ENCERRADA: { rotulo: 'Encerrada', classe: '' },
}

type Filtro = 'TODAS' | TipoDeParceria

/**
 * As parcerias (§43).
 *
 * <p>Duas naturezas na mesma tela: parceria com empresa — desconto, permuta,
 * serviço — e parceria entre atléticas, que costuma não envolver dinheiro
 * nenhum. A segunda é a mais subestimada: emprestar quadra e laboratório
 * resolve problema que nenhum patrocínio resolveria.</p>
 */
export function Parcerias() {
  const { slug = '' } = useParams()
  const { vinculo } = useSessao()
  const minha = vinculo(slug)?.atletica
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [confirmando, setConfirmando] = useState<Parceria | null>(null)

  const parcerias = useBusca<Parceria[]>(() => Dados.parcerias(), [])

  async function demonstrarInteresse(parceria: Parceria) {
    if (!minha) return
    const atualizada = await Dados.demonstrarInteresseEmParceria(parceria.id, minha)
    if (atualizada) {
      parcerias.definir(
        (parcerias.dados ?? []).map((p) => (p.id === parceria.id ? atualizada : p)))
    }
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Parcerias"
        descricao="Benefícios abertos à rede, e acordos diretos entre duas atléticas."
        acoes={
          <button className="botao botao--discreto" disabled
                  title="Propor parceria chega com a API conectada">
            <Icone nome="mais" tamanho={16} /> Propor parceria
          </button>
        }
      />

      <Conteudo
        busca={parcerias}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2].map((i) => <Esqueleto key={i} altura="13rem" />)}
          </div>
        }
      >
        {(lista) => {
          if (lista.length === 0) {
            return (
              <EstadoVazio icone="parcerias" titulo="Nenhuma parceria disponível">
                <p className="fraco">
                  Comece propondo uma parceria entre atléticas: trocar acesso a
                  quadra e a espaço costuma não custar nada e resolve muito.
                </p>
              </EstadoVazio>
            )
          }

          const ativas = lista.filter((p) => p.etapa === 'ATIVA')
          const disponiveis = lista.filter(
            (p) => p.etapa === 'DISPONIVEL' || p.etapa === 'INTERESSE')
          const minhas = lista.filter((p) => p.tenhoInteresse)

          const visiveis = filtro === 'TODAS'
            ? lista
            : lista.filter((p) => p.tipo === filtro)

          const contar = (t: TipoDeParceria) => lista.filter((p) => p.tipo === t).length

          return (
            <>
              <div className="grade grade--metricas" style={{ marginBottom: '1.4rem' }}>
                <Metrica rotulo="Disponíveis" icone="parcerias" valor={disponiveis.length} />
                <Metrica rotulo="Ativas na rede" icone="certo" valor={ativas.length} />
                <Metrica rotulo="Sua atlética participa de" icone="atletica"
                         valor={minhas.length} />
                <Metrica rotulo="Atléticas interessadas" icone="rede"
                         valor={new Set(lista.flatMap(
                           (p) => p.interessadas.map((a) => a.slug))).size} />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Tipos de parceria"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...(Object.keys(TIPO) as TipoDeParceria[])
                      .filter((t) => contar(t) > 0)
                      .map((t) => ({
                        valor: t as Filtro,
                        rotulo: TIPO[t].rotulo,
                        contagem: contar(t),
                      })),
                  ]}
                />
              </div>

              <Secao>
                <div className="grade grade--larga">
                  {visiveis.map((p) => (
                    <div key={p.id}
                         className={`cartao${p.tenhoInteresse ? ' cartao--destacado' : ''}`}>
                      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                        <span className="linha etiqueta" style={{ gap: '0.3rem' }}>
                          <Icone nome={TIPO[p.tipo].icone} tamanho={13} />
                          {TIPO[p.tipo].rotulo}
                        </span>
                        <span className={`etiqueta ${ETAPA[p.etapa].classe}`}>
                          {ETAPA[p.etapa].rotulo}
                        </span>
                      </div>

                      <h3 style={{ marginBottom: '0.2rem' }}>{p.titulo}</h3>
                      <div className="fraco" style={{ marginBottom: '0.6rem' }}>
                        {p.parceiroNome}
                        {p.cidade ? ` · ${p.cidade}/${p.uf}` : ''}
                      </div>

                      <p className="fraco" style={{ marginBottom: '0.8rem' }}>
                        {p.descricao}
                      </p>

                      <div className="aviso aviso--sucesso" style={{ marginBottom: '0.9rem' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{p.beneficio}</strong>
                      </div>

                      {p.proponente ? (
                        <div className="linha" style={{ gap: '0.45rem',
                                                        marginBottom: '0.7rem' }}>
                          <Brasao atletica={p.proponente} tamanho="p" />
                          <span className="fraco">proposta por {p.proponente.nome}</span>
                        </div>
                      ) : null}

                      <div className="linha entre" style={{ marginBottom: '0.9rem' }}>
                        <div className="pilha-de-avatares">
                          {p.interessadas.slice(0, 6).map((a) => (
                            <Brasao key={a.slug} atletica={a} tamanho="p" />
                          ))}
                        </div>
                        <span className="fraco">
                          {p.interessadas.length}{' '}
                          {p.interessadas.length === 1
                            ? 'atlética interessada' : 'atléticas interessadas'}
                        </span>
                      </div>

                      {p.validade ? (
                        <div className="fraco" style={{ marginBottom: '0.7rem' }}>
                          válida até {quando(p.validade)}
                        </div>
                      ) : null}

                      {p.tenhoInteresse ? (
                        <div className="linha" style={{ gap: '0.45rem',
                                                        color: 'var(--sucesso)' }}>
                          <Icone nome="certo" tamanho={16} />
                          <span style={{ fontSize: '0.9rem' }}>
                            Sua atlética demonstrou interesse
                          </span>
                        </div>
                      ) : p.etapa === 'ENCERRADA' ? (
                        <span className="fraco">Esta parceria já foi encerrada.</span>
                      ) : (
                        <button className="botao botao--largo"
                                onClick={() => setConfirmando(p)}>
                          Tenho interesse
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Secao>

              {confirmando ? (
                <Confirmacao
                  titulo={`Demonstrar interesse em “${confirmando.titulo}”?`}
                  consequencia={
                    'Sua atlética entra na lista de interessadas e '
                    + (confirmando.proponente
                      ? `a ${confirmando.proponente.nome} recebe o contato para negociar.`
                      : 'o parceiro recebe o contato para negociar.')
                    + ' Isso não fecha acordo nenhum — a negociação continua fora daqui.'
                  }
                  rotuloDeConfirmar="Demonstrar interesse"
                  perigo={false}
                  aoConfirmar={() => {
                    void demonstrarInteresse(confirmando)
                    setConfirmando(null)
                  }}
                  aoCancelar={() => setConfirmando(null)}
                />
              ) : null}
            </>
          )
        }}
      </Conteudo>
    </div>
  )
}
