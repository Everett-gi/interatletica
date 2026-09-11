import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Api } from '../api/rotas'
import type { ConvitePendente } from '../api/tipos'
import { MODO_DEMO } from '../dados'
import { Brasao, Conteudo, Esqueleto, rotuloDoPapel, useBusca } from '../ui/componentes'
import { useSessao } from '../sessao/SessaoContexto'
import { Icone } from '../ui/icones'
import { quando } from '../formatos'
import { lembrarConvite } from './conviteRetomado'

/**
 * A tela do link de convite — a única porta de entrada em uma atlética que
 * já existe.
 *
 * <p>A prévia é pública de propósito. Quem chega aqui pode nunca ter ouvido
 * falar da plataforma, e mandá-lo ao Google antes de dizer do que se trata
 * pede a conta dele sem explicar por quê — o momento exato em que a pessoa
 * desiste. Primeiro o nome da atlética e o papel; o login depois.</p>
 *
 * <p>Dois componentes, e não um com condicional: no modo demonstração não há
 * token para examinar, e chamar o hook de busca só às vezes quebraria a
 * ordem dos hooks.</p>
 */
export function Convite() {
  return MODO_DEMO ? <ExplicacaoDaDemonstracao /> : <ConviteReal />
}

function ConviteReal() {
  const { token = '' } = useParams()
  const { perfil, recarregar } = useSessao()
  const navegar = useNavigate()
  const [aceitando, setAceitando] = useState(false)
  const [falha, setFalha] = useState<unknown>(null)

  const convite = useBusca<ConvitePendente>(() => Api.convite.examinar(token), [token])

  async function aceitar() {
    setAceitando(true)
    setFalha(null)
    try {
      const resultado = await Api.convite.aceitar(token)
      // A sessão muda de forma ao aceitar: quem não tinha vínculo nenhum
      // passa a ter um, e é ele que decide o que a barra lateral mostra.
      await recarregar()
      navegar(`/hub/${resultado.atleticaSlug}`, { replace: true })
    } catch (erro) {
      setFalha(erro)
      setAceitando(false)
    }
  }

  return (
    <div className="cartao" style={{ maxWidth: '34rem', margin: '2rem auto' }}>
      <Conteudo busca={convite} esqueleto={<Esqueleto altura="10rem" />}>
        {(dados) => (
          <>
            <div className="linha linha--topo" style={{ marginBottom: '1rem' }}>
              <Brasao
                atletica={{
                  nome: dados.atleticaNome,
                  sigla: null,
                  brasaoUrl: dados.atleticaBrasaoUrl,
                  corPrimaria: null,
                }}
                tamanho="g"
              />
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>
                  {dados.atleticaNome}
                </h1>
                <p className="fraco" style={{ margin: 0 }}>
                  Convite para entrar como {rotuloDoPapel(dados.papel)} · expira{' '}
                  {quando(dados.expiraEm)}
                </p>
              </div>
            </div>

            {falha ? (
              <div className="aviso aviso--erro" role="alert" style={{ marginBottom: '1rem' }}>
                {falha instanceof Error
                  ? falha.message
                  : 'Não foi possível aceitar este convite.'}
              </div>
            ) : null}

            {perfil ? (
              <>
                <p className="suave">
                  Você está como <strong>{perfil.email}</strong>. O convite é
                  endereçado a um e-mail específico — se não for este, saia e
                  entre com a conta certa.
                </p>
                <button
                  className="botao botao--largo"
                  disabled={aceitando}
                  onClick={() => void aceitar()}
                >
                  {aceitando ? 'Entrando na atlética…' : 'Aceitar o convite'}
                </button>
              </>
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
                  <Icone nome="usuario" tamanho={17} /> Entrar com Google para aceitar
                </a>
                <p className="fraco" style={{ marginTop: '0.7rem', marginBottom: 0 }}>
                  Voltamos para cá assim que você entrar.
                </p>
              </>
            )}
          </>
        )}
      </Conteudo>
    </div>
  )
}

function ExplicacaoDaDemonstracao() {
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
          grupo de WhatsApp e é encaminhado. Sem ela, um único link vazado
          matricula o grupo inteiro.
        </p>
      </div>
      <p className="fraco">
        É a única porta de entrada para uma atlética que já existe.
      </p>
    </div>
  )
}
