import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { entrar, FalhaDaApi } from '../api/cliente'
import { Api } from '../api/rotas'
import { Conteudo, MensagemDeErro, useBusca } from '../componentes/comuns'
import { quando } from '../formatos'
import { useSessao } from '../sessao/SessaoContexto'
import { lembrarConvite } from './conviteRetomado'
import { rotuloDoPapel } from './Inicio'
import type { ConvitePendente } from '../api/tipos'

/**
 * A tela do link de convite: {@code /convite/{token}}.
 *
 * <p>A prévia é pública. Quem chega aqui pode nunca ter ouvido falar da
 * plataforma, e mandá-lo ao Google antes de dizer do que se trata faria a
 * tela pedir a conta dele sem explicar por quê — o momento exato em que a
 * pessoa desiste.</p>
 */
export function Convite() {
  const { token = '' } = useParams()
  const { perfil, recarregar } = useSessao()
  const navegar = useNavigate()

  const [aceitando, setAceitando] = useState(false)
  const [falha, setFalha] = useState<unknown>(null)

  const busca = useBusca<ConvitePendente>(() => Api.convite.examinar(token), [token])

  async function aceitar() {
    setAceitando(true)
    setFalha(null)
    try {
      const resultado = await Api.convite.aceitar(token)
      // A sessão em memória ainda não conhece a nova atlética; sem recarregar,
      // a página seguinte acharia que a pessoa não é membro e a expulsaria.
      await recarregar()
      navegar(`/a/${resultado.atleticaSlug}`, { replace: true })
    } catch (erro) {
      setFalha(erro)
    } finally {
      setAceitando(false)
    }
  }

  return (
    <Conteudo busca={busca}>
      {(convite) => (
        <div className="cartao" style={{ maxWidth: '32rem', margin: '2rem auto' }}>
          <p className="fraco">Você foi convidado para</p>
          <h1>{convite.atleticaNome}</h1>
          <p className="suave">
            como <strong>{rotuloDoPapel(convite.papel)}</strong>
          </p>
          <p className="fraco">Este convite expira {quando(convite.expiraEm)}.</p>

          {falha ? <MensagemDeErro erro={falha} /> : null}
          {falha instanceof FalhaDaApi &&
          falha.codigo === 'CONVITE_DE_OUTRO_EMAIL' ? (
            <p className="fraco">
              O convite é endereçado a um e-mail específico — é o que impede
              que um link encaminhado no grupo matricule o grupo inteiro. Saia
              e entre com a conta que recebeu o convite.
            </p>
          ) : null}

          {perfil ? (
            <button
              className="botao botao--largo"
              onClick={() => void aceitar()}
              disabled={aceitando}
            >
              {aceitando ? 'Aceitando…' : 'Aceitar convite'}
            </button>
          ) : (
            <>
              <button
                className="botao botao--largo"
                onClick={() => {
                  lembrarConvite(token)
                  entrar()
                }}
              >
                Entrar com Google para aceitar
              </button>
              <p className="fraco" style={{ marginTop: '0.75rem' }}>
                Voltamos para cá assim que você entrar.
              </p>
            </>
          )}
        </div>
      )}
    </Conteudo>
  )
}
