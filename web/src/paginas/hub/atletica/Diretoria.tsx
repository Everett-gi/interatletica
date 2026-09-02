import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { Membro } from '../../../api/tipos'
import { Avatar, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, EstadoVazio, Secao, Segmentado } from '../../../ui/pagina'
import { quando } from '../../../formatos'

type Visao = 'ORGANOGRAMA' | 'LISTA'

/**
 * A estrutura da diretoria (§15).
 *
 * <p>Duas visões porque servem a duas perguntas. O organograma responde "quem
 * responde a quem" — a que um calouro faz, e que uma lista alfabética não
 * responde. A lista responde "quem é fulano e como falo com ele", que é a
 * pergunta de todo dia.</p>
 *
 * <p>Os níveis saem do cargo escrito pela própria atlética. Impor uma
 * hierarquia fixa quebraria toda atlética que organiza a diretoria de outro
 * jeito — e cada uma organiza do seu.</p>
 */
export function Diretoria() {
  const { slug = '' } = useParams()
  const [visao, setVisao] = useState<Visao>('ORGANOGRAMA')
  const membros = useBusca<Membro[]>(() => Dados.membros(slug), [slug])

  return (
    <div>
      <CabecalhoDePagina
        titulo="Diretoria"
        descricao="Quem ocupa cada cargo nesta gestão. O papel mora no vínculo com a atlética, não na pessoa."
        acoes={
          <Segmentado
            rotulo="Forma de ver a diretoria"
            atual={visao}
            aoTrocar={setVisao}
            opcoes={[
              { valor: 'ORGANOGRAMA', rotulo: 'Organograma', icone: 'diretoria' },
              { valor: 'LISTA', rotulo: 'Lista', icone: 'lista' },
            ]}
          />
        }
      />

      <Conteudo busca={membros} esqueleto={<Esqueleto altura="16rem" />}>
        {(lista) => {
          const ativos = lista.filter((m) => m.situacao === 'ATIVO')
          const presidencia = ativos.filter((m) => m.papel === 'PRESIDENTE')
          const diretores = ativos.filter((m) => m.papel === 'DIRETOR')
          const membrosComuns = ativos.filter((m) => m.papel === 'MEMBRO')

          if (presidencia.length === 0 && diretores.length === 0) {
            return (
              <EstadoVazio icone="diretoria" titulo="A diretoria ainda não foi montada">
                <p className="fraco">
                  Promova membros a diretor na tela de Membros. Cargo com escopo
                  escrito evita presidente fazendo tudo.
                </p>
              </EstadoVazio>
            )
          }

          if (visao === 'LISTA') {
            return (
              <>
                <Secao titulo="Presidência">
                  <div className="grade">
                    {presidencia.map((m) => <CartaoDePessoa key={m.id} membro={m} />)}
                  </div>
                </Secao>
                <Secao titulo="Diretorias">
                  <div className="grade">
                    {diretores.map((m) => <CartaoDePessoa key={m.id} membro={m} />)}
                  </div>
                </Secao>
                {membrosComuns.length > 0 ? (
                  <Secao titulo="Comissões e membros"
                         descricao="Quem apoia a diretoria sem cargo formal.">
                    <div className="grade">
                      {membrosComuns.map((m) => <CartaoDePessoa key={m.id} membro={m} />)}
                    </div>
                  </Secao>
                ) : null}
              </>
            )
          }

          // O segundo nível são os cargos que respondem direto à presidência —
          // vice, financeiro e secretaria, pelo vocabulário mais comum. O
          // terceiro é o resto da diretoria. Quando o cargo não casa com
          // nenhum termo, cai no terceiro nível, e não some.
          const ehSegundoNivel = (cargo: string | null) => {
            const c = (cargo ?? '').toLowerCase()
            return c.includes('vice') || c.includes('financ') || c.includes('tesour')
              || c.includes('secret')
          }
          const segundoNivel = diretores.filter((m) => ehSegundoNivel(m.cargo))
          const terceiroNivel = diretores.filter((m) => !ehSegundoNivel(m.cargo))

          return (
            <div className="cartao">
              <div className="organograma">
                <div className="organograma__nivel">
                  {presidencia.map((m) => (
                    <NoDoOrganograma key={m.id} membro={m} topo />
                  ))}
                </div>

                {segundoNivel.length > 0 ? (
                  <>
                    <div className="organograma__haste" />
                    <div className="organograma__travessa" />
                    <div className="organograma__haste" />
                    <div className="organograma__nivel">
                      {segundoNivel.map((m) => <NoDoOrganograma key={m.id} membro={m} />)}
                    </div>
                  </>
                ) : null}

                {terceiroNivel.length > 0 ? (
                  <>
                    <div className="organograma__haste" />
                    <div className="organograma__travessa" />
                    <div className="organograma__haste" />
                    <div className="organograma__nivel">
                      {terceiroNivel.map((m) => <NoDoOrganograma key={m.id} membro={m} />)}
                    </div>
                  </>
                ) : null}
              </div>

              <p className="fraco" style={{ marginTop: '1rem', marginBottom: 0 }}>
                Os níveis vêm do cargo que a própria atlética escreveu. Renomear
                um cargo reorganiza o desenho — a plataforma não impõe uma
                hierarquia fixa porque cada atlética organiza a sua de um jeito.
              </p>
            </div>
          )
        }}
      </Conteudo>
    </div>
  )
}

function NoDoOrganograma({ membro, topo = false }: { membro: Membro; topo?: boolean }) {
  return (
    <div className={`no-org${topo ? ' no-org--topo' : ''}`}>
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: '0.35rem' }}>
        <Avatar nome={membro.nome} url={membro.avatarUrl} tamanho="m" />
      </div>
      <div style={{ fontWeight: 620, fontSize: '0.9rem' }}>{membro.nome}</div>
      <div className="fraco">{membro.cargo ?? 'Diretoria'}</div>
    </div>
  )
}

function CartaoDePessoa({ membro }: { membro: Membro }) {
  return (
    <div className="cartao linha">
      <Avatar nome={membro.nome} url={membro.avatarUrl} tamanho="m" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong>{membro.nome}</strong>
        <div className="fraco">{membro.cargo ?? 'Membro'}</div>
        <div className="fraco">desde {quando(membro.entrouEm)}</div>
      </div>
    </div>
  )
}
