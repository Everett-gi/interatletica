import { useParams } from 'react-router-dom'
import { MODO_DEMO } from '../dados'
import { rotuloDoPapel, Vazio } from '../ui/componentes'
import { useSessao } from '../sessao/SessaoContexto'
import { lembrarConvite } from './conviteRetomado'

/**
 * A tela do link de convite.
 *
 * <p>A prévia é pública de propósito. Quem chega aqui pode nunca ter ouvido
 * falar da plataforma, e mandá-lo ao Google antes de dizer do que se trata
 * faz a tela pedir a conta dele sem explicar por quê — o momento exato em
 * que a pessoa desiste.</p>
 *
 * <p>No modo demonstração não há token real para examinar: a tela explica o
 * mecanismo em vez de fingir um aceite que não acontece.</p>
 */
export function Convite() {
  const { token = '' } = useParams()
  const { perfil } = useSessao()

  if (MODO_DEMO) {
    return (
      <div className="cartao" style={{ maxWidth: '34rem', margin: '2rem auto' }}>
        <h1>Convite</h1>
        <p className="suave">
          Esta é a tela que abre quando alguém recebe um link de convite. Na
          demonstração não há token válido para aceitar.
        </p>
        <div className="aviso">
          <strong>Como funciona</strong>
          <p className="fraco" style={{ marginBottom: 0 }}>
            O convite é endereçado a um e-mail específico, tem validade e é de
            uso único. A amarração ao e-mail existe porque o link viaja por
            grupo de WhatsApp e é encaminhado — sem ela, um único link vazado
            matricula o grupo inteiro.
          </p>
        </div>
        <p className="fraco">
          É a única porta de entrada: não existe autocadastro de atlética nem
          de membro.
        </p>
      </div>
    )
  }

  return (
    <div className="cartao" style={{ maxWidth: '34rem', margin: '2rem auto' }}>
      <h1>Convite</h1>
      {perfil ? (
        <p className="suave">
          Você entrou como {perfil.nome}. Aceite para vincular sua conta à
          atlética que convidou você{perfil.atleticas[0]
            ? ` como ${rotuloDoPapel(perfil.atleticas[0].papel)}`
            : ''}.
        </p>
      ) : (
        <>
          <p className="suave">
            Entre com a conta que recebeu o convite para aceitá-lo.
          </p>
          <a
            className="botao botao--largo"
            href="/oauth2/authorization/google"
            onClick={() => lembrarConvite(token)}
          >
            Entrar com Google para aceitar
          </a>
          <p className="fraco" style={{ marginTop: '0.7rem' }}>
            Voltamos para cá assim que você entrar.
          </p>
        </>
      )}
      <Vazio>Fluxo completo disponível com a API conectada.</Vazio>
    </div>
  )
}
