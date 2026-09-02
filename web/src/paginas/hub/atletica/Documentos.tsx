import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Documento, PastaDeDocumento } from '../../../api/tipos-gestao'
import { Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import {
  CabecalhoDePagina,
  Chips,
  EstadoVazio,
  Secao,
  Segmentado,
} from '../../../ui/pagina'
import { Icone, type NomeDoIcone } from '../../../ui/icones'
import { quando } from '../../../formatos'
import { useSessao } from '../../../sessao/SessaoContexto'

const PASTAS: { valor: PastaDeDocumento; rotulo: string }[] = [
  { valor: 'ESTATUTO', rotulo: 'Estatuto' },
  { valor: 'ATAS', rotulo: 'Atas' },
  { valor: 'CONTRATOS', rotulo: 'Contratos' },
  { valor: 'FINANCEIRO', rotulo: 'Financeiro' },
  { valor: 'EVENTOS', rotulo: 'Eventos' },
  { valor: 'REGULAMENTOS', rotulo: 'Regulamentos' },
  { valor: 'GESTAO', rotulo: 'Gestão' },
  { valor: 'HISTORICO', rotulo: 'Histórico' },
]

const ICONE_DO_FORMATO: Record<Documento['formato'], NomeDoIcone> = {
  PDF: 'documentos',
  DOCX: 'modelos',
  XLSX: 'resultados',
  IMAGEM: 'midia',
  LINK: 'externo',
}

const VISIBILIDADE: Record<Documento['visibilidade'], { rotulo: string; classe: string }> = {
  PUBLICO: { rotulo: 'público', classe: 'etiqueta--sucesso' },
  REDE: { rotulo: 'rede', classe: 'etiqueta--acento' },
  INTERNO: { rotulo: 'membros', classe: '' },
  DIRETORIA: { rotulo: 'diretoria', classe: 'etiqueta--alerta' },
}

type Visao = 'GRADE' | 'LISTA'
type Filtro = 'TODAS' | PastaDeDocumento

/**
 * A biblioteca de documentos (§30).
 *
 * <p>Pastas e não etiquetas soltas: quem procura o estatuto procura em
 * "Estatuto", e não digitando palavra-chave. A etiqueta de visibilidade em
 * cada item vem do §85 — quem publica precisa ver, de relance, o que está
 * exposto à rede e o que é só da diretoria.</p>
 */
export function Documentos() {
  const { slug = '' } = useParams()
  const { podeAtuarComo } = useSessao()
  const diretor = podeAtuarComo(slug, 'DIRETOR')

  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [visao, setVisao] = useState<Visao>('LISTA')
  const [termo, setTermo] = useState('')

  const documentos = useBusca<Documento[]>(() => Dados.documentos(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Documentos"
        descricao="Estatuto, atas, contratos e regulamentos. O que estiver aqui sobrevive à troca de gestão."
        acoes={
          <>
            <Segmentado
              rotulo="Forma de ver os documentos"
              atual={visao}
              aoTrocar={setVisao}
              opcoes={[
                { valor: 'LISTA', rotulo: 'Lista', icone: 'lista' },
                { valor: 'GRADE', rotulo: 'Grade', icone: 'grade' },
              ]}
            />
            {diretor ? (
              <button className="botao" disabled
                      title="Envio de arquivo chega com a API conectada">
                <Icone nome="mais" tamanho={16} /> Adicionar
              </button>
            ) : null}
          </>
        }
      />

      <div className="barra-de-filtros">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome ou descrição"
          aria-label="Buscar documentos"
        />
      </div>

      <Conteudo busca={documentos} esqueleto={<Esqueleto altura="18rem" />}>
        {(lista) => {
          const alvo = termo.trim().toLowerCase()
          const filtrados = lista
            .filter((d) => filtro === 'TODAS' || d.pasta === filtro)
            .filter((d) => alvo === '' ||
              `${d.nome} ${d.descricao ?? ''}`.toLowerCase().includes(alvo))
            .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))

          const contar = (pasta: PastaDeDocumento) =>
            lista.filter((d) => d.pasta === pasta).length

          return (
            <>
              <div style={{ marginBottom: '1.1rem' }}>
                <Chips
                  rotulo="Pastas"
                  selecionado={filtro}
                  aoSelecionar={setFiltro}
                  opcoes={[
                    { valor: 'TODAS', rotulo: 'Todas', contagem: lista.length },
                    ...PASTAS
                      .filter((p) => contar(p.valor) > 0)
                      .map((p) => ({
                        valor: p.valor as Filtro,
                        rotulo: p.rotulo,
                        contagem: contar(p.valor),
                      })),
                  ]}
                />
              </div>

              {filtrados.length === 0 ? (
                <EstadoVazio icone="documentos" titulo="Nenhum documento aqui">
                  <p className="fraco">
                    {alvo !== ''
                      ? 'Nenhum documento com esse termo. Tente outra palavra.'
                      : 'Guardar o documento na hora em que ele é assinado é o que evita procurá-lo um ano depois.'}
                  </p>
                </EstadoVazio>
              ) : visao === 'GRADE' ? (
                <div className="grade">
                  {filtrados.map((doc) => <CartaoDeDocumento key={doc.id} doc={doc} />)}
                </div>
              ) : (
                <Secao>
                  <div className="rolagem">
                    <table className="tabela-cartoes">
                      <thead>
                        <tr>
                          <th>Documento</th>
                          <th>Pasta</th>
                          <th>Visibilidade</th>
                          <th>Gestão</th>
                          <th>Atualizado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtrados.map((doc) => (
                          <tr key={doc.id}>
                            <td data-rotulo="Documento">
                              <div className="linha" style={{ gap: '0.5rem' }}>
                                <Icone nome={ICONE_DO_FORMATO[doc.formato]} tamanho={16} />
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 550 }}>{doc.nome}</div>
                                  {doc.descricao ? (
                                    <div className="fraco">{doc.descricao}</div>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td data-rotulo="Pasta">
                              {PASTAS.find((p) => p.valor === doc.pasta)?.rotulo}
                            </td>
                            <td data-rotulo="Visibilidade">
                              <span className={`etiqueta ${
                                VISIBILIDADE[doc.visibilidade].classe}`}>
                                {VISIBILIDADE[doc.visibilidade].rotulo}
                              </span>
                            </td>
                            <td data-rotulo="Gestão">{doc.gestaoAno}</td>
                            <td data-rotulo="Atualizado">{quando(doc.atualizadoEm)}</td>
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

function CartaoDeDocumento({ doc }: { doc: Documento }) {
  return (
    <div className="cartao">
      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
        <span className="notificacao__icone">
          <Icone nome={ICONE_DO_FORMATO[doc.formato]} tamanho={17} />
        </span>
        <span className={`etiqueta ${VISIBILIDADE[doc.visibilidade].classe}`}>
          {VISIBILIDADE[doc.visibilidade].rotulo}
        </span>
      </div>
      <strong>{doc.nome}</strong>
      {doc.descricao ? <div className="fraco">{doc.descricao}</div> : null}
      <div className="fraco" style={{ marginTop: '0.5rem' }}>
        {doc.formato}
        {doc.tamanhoEmKb ? ` · ${doc.tamanhoEmKb} kB` : ''} · {quando(doc.atualizadoEm)}
      </div>
    </div>
  )
}
