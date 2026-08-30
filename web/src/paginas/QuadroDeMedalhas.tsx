import { Link } from 'react-router-dom'
import { Dados } from '../dados'
import type { LinhaDoQuadroDeMedalhas } from '../api/tipos-rede'
import { Brasao, Conteudo, Esqueleto, useBusca } from '../ui/componentes'

/**
 * O quadro da temporada.
 *
 * <p>É o número que a rede inteira acompanha, e o motivo de
 * `inscricao.atletica_id` guardar a atlética de ORIGEM do inscrito: sem
 * saber de onde cada pessoa veio, não há como somar nada por atlética.</p>
 */
export function QuadroDeMedalhas() {
  const quadro = useBusca<LinhaDoQuadroDeMedalhas[]>(() => Dados.quadroDeMedalhas(), [])

  return (
    <div className="pilha">
      <header>
        <h1>Quadro de medalhas</h1>
        <p className="suave">
          Temporada 2026 · pontuação acumulada nas competições entre atléticas
        </p>
      </header>

      <Conteudo busca={quadro} esqueleto={<Esqueleto altura="20rem" />}>
        {(linhas) => (
          <>
            <Podio linhas={linhas.slice(0, 3)} />

            <div className="rolagem">
              <table>
                <thead>
                  <tr>
                    <th className="numero">#</th>
                    <th>Atlética</th>
                    <th className="numero"><span title="Ouro">🥇</span></th>
                    <th className="numero"><span title="Prata">🥈</span></th>
                    <th className="numero"><span title="Bronze">🥉</span></th>
                    <th className="numero">Pontos</th>
                    <th className="numero">Var.</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha) => (
                    <tr key={linha.atletica.slug}>
                      <td className="numero">{linha.posicao}</td>
                      <td>
                        <Link to={`/a/${linha.atletica.slug}`} className="linha"
                              style={{ gap: '0.5rem' }}>
                          <Brasao atletica={linha.atletica} tamanho="p" />
                          <span>{linha.atletica.nome}</span>
                        </Link>
                      </td>
                      <td className="numero">{linha.ouro}</td>
                      <td className="numero">{linha.prata}</td>
                      <td className="numero">{linha.bronze}</td>
                      <td className="numero"><strong>{linha.pontos}</strong></td>
                      <td className="numero"><Variacao valor={linha.variacao} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="fraco">
              Critério: 3 pontos por ouro, 2 por prata, 1 por bronze. Empate em
              pontos é desempatado por número de ouros.
            </p>
          </>
        )}
      </Conteudo>
    </div>
  )
}

/**
 * Pódio com as alturas invertidas na ordem certa — 2º, 1º, 3º — porque é
 * assim que um pódio é lido, e não da esquerda para a direita.
 */
function Podio({ linhas }: { linhas: LinhaDoQuadroDeMedalhas[] }) {
  if (linhas.length < 3) return null
  const ordem = [linhas[1], linhas[0], linhas[2]]
  const alturas = ['5rem', '7rem', '3.5rem']
  const cores = ['var(--prata)', 'var(--ouro)', 'var(--bronze)']

  return (
    <div
      className="cartao"
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem', alignItems: 'end', padding: '1.5rem 1rem 1rem',
      }}
    >
      {ordem.map((linha, i) => (
        <div key={linha.atletica.slug} style={{ textAlign: 'center' }}>
          <Link to={`/a/${linha.atletica.slug}`}>
            <div style={{ display: 'grid', placeItems: 'center', marginBottom: '0.5rem' }}>
              <Brasao atletica={linha.atletica} tamanho={i === 1 ? 'g' : 'm'} />
            </div>
            <div style={{ fontWeight: 650, fontSize: '0.88rem' }}>
              {linha.atletica.sigla ?? linha.atletica.nome}
            </div>
          </Link>
          <div className="fraco" style={{ marginBottom: '0.4rem' }}>
            {linha.pontos} pts
          </div>
          <div
            style={{
              height: alturas[i],
              background: cores[i],
              borderRadius: '8px 8px 0 0',
              display: 'grid',
              placeItems: 'center',
              color: '#10161f',
              fontWeight: 800,
              fontSize: '1.3rem',
            }}
          >
            {linha.posicao}
          </div>
        </div>
      ))}
    </div>
  )
}

function Variacao({ valor }: { valor: number }) {
  if (valor === 0) {
    return <span className="fraco" aria-label="sem mudança">=</span>
  }
  const subiu = valor > 0
  return (
    <span style={{ color: subiu ? 'var(--sucesso)' : 'var(--perigo)', fontWeight: 700 }}>
      {subiu ? '▲' : '▼'} {Math.abs(valor)}
      <span className="apenas-leitor">
        {subiu ? ' posições acima' : ' posições abaixo'}
      </span>
    </span>
  )
}
