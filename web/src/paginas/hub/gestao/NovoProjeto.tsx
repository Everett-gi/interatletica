import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Dados } from '../../../dados'
import type { ModeloDeProjeto } from '../../../api/tipos-gestao'
import { Brasao, Conteudo, Esqueleto, useBusca } from '../../../ui/componentes'
import { CabecalhoDePagina, Confirmacao, Secao } from '../../../ui/pagina'
import { Icone } from '../../../ui/icones'
import { atleticaPorSlug } from '../../../demo/dados'
import { TIPO_DE_PROJETO } from './Projetos'

/**
 * Começar um projeto a partir de um modelo (§20).
 *
 * <p>Este é o núcleo estratégico do produto numa tela só. O modelo de
 * calourada dos Leões carrega treze passos — e os três últimos existem
 * porque a edição de 2024 deles teve problema com a vizinhança. Quem usa o
 * modelo herda o erro que outra atlética já pagou, sem precisar cometê-lo.</p>
 *
 * <p>A confirmação antes de trazer o roteiro não é burocracia: um projeto
 * que aparece com 25 linhas sem aviso assusta, e a pessoa apaga tudo achando
 * que o sistema fez besteira.</p>
 */
export function NovoProjeto() {
  const { slug = '' } = useParams()
  const navegar = useNavigate()
  const [escolhido, setEscolhido] = useState<ModeloDeProjeto | null>(null)
  const [nome, setNome] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [criando, setCriando] = useState(false)

  const modelos = useBusca<ModeloDeProjeto[]>(() => Dados.modelosDeProjeto(), [])

  // Sem modelo escolhido, o id não casa com nenhum e a loja devolve um
  // projeto vazio — é o mesmo caminho de código para os dois casos, em vez
  // de uma segunda operação que faria quase a mesma coisa.
  async function criar() {
    setCriando(true)
    const projeto = await Dados.criarProjetoDeModelo(
      slug, escolhido?.id ?? 'em-branco',
      nome.trim() || escolhido?.nome || 'Projeto sem nome')
    navegar(`/hub/${slug}/projetos/${projeto.id}`, { replace: true })
  }

  return (
    <div>
      <CabecalhoDePagina
        titulo="Novo projeto"
        descricao="Escolha um modelo e comece com o roteiro pronto — ou comece em branco."
        trilha={[
          { rotulo: 'Projetos', para: `/hub/${slug}/projetos` },
          { rotulo: 'Novo' },
        ]}
      />

      <Secao>
        <label className="campo" style={{ maxWidth: '32rem' }}>
          <span className="campo__rotulo">Nome do projeto</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={escolhido ? escolhido.nome : 'Interatlética 2027'}
            maxLength={120}
          />
          <span className="campo__dica">
            Se deixar em branco, usamos o nome do modelo escolhido.
          </span>
        </label>
      </Secao>

      <Conteudo
        busca={modelos}
        esqueleto={
          <div className="grade grade--larga">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} altura="13rem" />)}
          </div>
        }
      >
        {(lista) => (
          <>
            <Secao
              titulo="Modelos da rede"
              descricao="Roteiros que outras atléticas já rodaram e refinaram. O número de usos diz quantas vezes o modelo já foi aproveitado."
            >
              <div className="grade grade--larga">
                {lista.map((modelo) => {
                  const origem = modelo.origemAtletica
                    ? atleticaPorSlug(modelo.origemAtletica)
                    : null
                  const selecionado = escolhido?.id === modelo.id

                  return (
                    <button
                      key={modelo.id}
                      className={`cartao cartao--clicavel${
                        selecionado ? ' cartao--destacado' : ''}`}
                      style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer' }}
                      onClick={() => setEscolhido(selecionado ? null : modelo)}
                      aria-pressed={selecionado}
                    >
                      <div className="linha entre" style={{ marginBottom: '0.5rem' }}>
                        <span className="etiqueta">{TIPO_DE_PROJETO[modelo.tipo]}</span>
                        <span className="fraco">{modelo.usos} usos</span>
                      </div>

                      <h3 style={{ marginBottom: '0.25rem' }}>{modelo.nome}</h3>
                      <p className="fraco" style={{ marginBottom: '0.7rem' }}>
                        {modelo.descricao}
                      </p>

                      <div className="linha" style={{ gap: '0.35rem',
                                                      marginBottom: '0.7rem' }}>
                        <span className="etiqueta etiqueta--acento">
                          {modelo.tarefas.length} passos
                        </span>
                        <span className="etiqueta">{modelo.marcos.length} marcos</span>
                        <span className="etiqueta">{modelo.duracaoEmDias} dias</span>
                      </div>

                      {origem ? (
                        <div className="linha" style={{ gap: '0.4rem' }}>
                          <Brasao atletica={origem} tamanho="p" />
                          <span className="fraco">criado pela {origem.nome}</span>
                        </div>
                      ) : (
                        <div className="fraco">modelo da plataforma</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </Secao>

            {escolhido ? (
              <Secao titulo={`O que o modelo “${escolhido.nome}” cria`}>
                <div className="detalhe">
                  <div className="cartao">
                    <h3>Roteiro</h3>
                    <ol className="lista-marcada" style={{ paddingLeft: '1.3rem' }}>
                      {escolhido.tarefas.map((t) => <li key={t}>{t}</li>)}
                    </ol>
                  </div>
                  <div>
                    <div className="cartao" style={{ marginBottom: '1rem' }}>
                      <h3>Marcos</h3>
                      <ul className="lista-marcada">
                        {escolhido.marcos.map((m) => <li key={m}>{m}</li>)}
                      </ul>
                    </div>
                    <button
                      className="botao botao--largo"
                      onClick={() => setConfirmando(true)}
                      disabled={criando}
                    >
                      <Icone nome="certo" tamanho={16} />
                      Usar este modelo
                    </button>
                  </div>
                </div>
              </Secao>
            ) : null}

            <Secao titulo="Ou comece em branco">
              <div className="cartao linha entre">
                <div>
                  <strong>Projeto vazio</strong>
                  <div className="fraco">
                    Sem roteiro nem marcos. Você monta as etapas do zero.
                  </div>
                </div>
                <button
                  className="botao botao--discreto"
                  onClick={() => {
                    setEscolhido(null)
                    setConfirmando(true)
                  }}
                >
                  Criar em branco
                </button>
              </div>
            </Secao>
          </>
        )}
      </Conteudo>

      {confirmando ? (
        <Confirmacao
          titulo={escolhido
            ? `Trazer o roteiro de ${escolhido.tarefas.length} passos?`
            : 'Criar projeto em branco?'}
          consequencia={escolhido
            ? `O projeto “${nome.trim() || escolhido.nome}” nasce com o roteiro `
              + `de ${escolhido.tarefas.length} passos e ${escolhido.marcos.length} marcos, `
              + 'para marcar conforme resolver. O progresso do projeto sai daí. '
              + 'O que precisar de responsável e prazo você promove a tarefa no quadro.'
            : 'O projeto será criado sem roteiro nem marcos.'}
          rotuloDeConfirmar={escolhido ? 'Criar com o roteiro' : 'Criar'}
          perigo={false}
          aoConfirmar={() => { setConfirmando(false); void criar() }}
          aoCancelar={() => setConfirmando(false)}
        />
      ) : null}
    </div>
  )
}
