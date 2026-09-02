import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dados } from '../dados'
import type { ResultadoDeBusca, TipoDeResultado } from '../api/tipos-plataforma'
import { Icone, type NomeDoIcone } from '../ui/icones'
import { useMenu } from './useMenu'

const ROTULO: Record<TipoDeResultado, string> = {
  ATLETICA: 'Atléticas',
  PESSOA: 'Pessoas',
  EVENTO: 'Eventos',
  CAMPEONATO: 'Campeonatos',
  PROJETO: 'Projetos',
  DOCUMENTO: 'Documentos',
  FORNECEDOR: 'Fornecedores',
  PERGUNTA: 'Perguntas',
  GUIA: 'Guias',
  POST: 'Experiências',
  EQUIPE: 'Equipes',
  PAGINA: 'Ir para',
}

const ICONE: Record<TipoDeResultado, NomeDoIcone> = {
  ATLETICA: 'atletica',
  PESSOA: 'usuario',
  EVENTO: 'eventos',
  CAMPEONATO: 'campeonatos',
  PROJETO: 'projetos',
  DOCUMENTO: 'documentos',
  FORNECEDOR: 'fornecedores',
  PERGUNTA: 'perguntas',
  GUIA: 'guias',
  POST: 'experiencias',
  EQUIPE: 'equipes',
  PAGINA: 'direita',
}

/** A ordem em que os grupos aparecem. Destino de navegação vem primeiro
 *  porque quem digita "financeiro" quase sempre quer ir para lá, não achar
 *  um documento com essa palavra. */
const ORDEM: TipoDeResultado[] = [
  'PAGINA', 'EVENTO', 'ATLETICA', 'PROJETO', 'PESSOA', 'DOCUMENTO',
  'PERGUNTA', 'GUIA', 'POST', 'FORNECEDOR', 'CAMPEONATO', 'EQUIPE',
]

/**
 * Pesquisa global (§60 e §98).
 *
 * <p>Os resultados vêm agrupados por tipo, e o que pertence ao contexto atual
 * sobe — pesquisar "regulamento" dentro dos Dragões traz o regulamento dos
 * Dragões antes do dos Leões, sem esconder o dos Leões. Ordenar, não
 * filtrar: esconder resultado de fora seria transformar a busca global numa
 * busca local com nome errado.</p>
 */
export function PesquisaGlobal({ contextoSlug }: { contextoSlug: string }) {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<ResultadoDeBusca[]>([])
  const [buscando, setBuscando] = useState(false)
  const menu = useMenu<HTMLDivElement>()
  const navegar = useNavigate()

  // Debounce: sem ele, cada tecla dispara uma busca, e a resposta da penúltima
  // chega depois da última e sobrescreve o resultado certo.
  useEffect(() => {
    const alvo = termo.trim()
    if (alvo.length < 2) {
      setResultados([])
      setBuscando(false)
      return
    }
    setBuscando(true)
    let cancelado = false
    const relogio = setTimeout(() => {
      void Dados.buscar(alvo, contextoSlug).then((achados) => {
        if (cancelado) return
        setResultados(achados)
        setBuscando(false)
      })
    }, 180)

    return () => { cancelado = true; clearTimeout(relogio) }
  }, [termo, contextoSlug])

  // Ctrl/Cmd + K de qualquer lugar. É o atalho que todo mundo já tenta.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('campo-de-busca')?.focus()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

  function ir(destino: string) {
    setTermo('')
    menu.fechar()
    navegar(destino)
  }

  const grupos = ORDEM
    .map((tipo) => ({ tipo, itens: resultados.filter((r) => r.tipo === tipo) }))
    .filter((g) => g.itens.length > 0)

  const mostrarPainel = menu.aberto && termo.trim().length >= 2

  return (
    <div className="busca" ref={menu.ancora}>
      <span className="busca__lupa" aria-hidden="true">
        <Icone nome="busca" tamanho={17} />
      </span>
      <input
        id="campo-de-busca"
        className="busca__campo"
        type="search"
        value={termo}
        placeholder="Pesquisar pessoas, eventos, documentos…"
        aria-label="Pesquisa global"
        autoComplete="off"
        onFocus={menu.abrir}
        onChange={(e) => { setTermo(e.target.value); menu.abrir() }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && resultados.length > 0) ir(resultados[0].destino)
        }}
      />
      {termo === '' ? <span className="busca__atalho">Ctrl K</span> : null}

      {mostrarPainel ? (
        <div className="painel-flutuante busca__painel" role="listbox"
             aria-label="Resultados da pesquisa">
          {buscando && resultados.length === 0 ? (
            <div className="fraco" style={{ padding: '0.9rem 0.7rem' }}>Procurando…</div>
          ) : grupos.length === 0 ? (
            <div style={{ padding: '0.9rem 0.7rem' }}>
              <div style={{ fontWeight: 600 }}>Nada encontrado para “{termo}”.</div>
              <div className="fraco">
                Tente o nome de uma atlética, de um evento ou de um documento.
              </div>
            </div>
          ) : (
            grupos.map((grupo) => (
              <div key={grupo.tipo}>
                <div className="painel__titulo">{ROTULO[grupo.tipo]}</div>
                {grupo.itens.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    className="item-de-menu"
                    role="option"
                    aria-selected="false"
                    onClick={() => ir(item.destino)}
                  >
                    <Icone nome={ICONE[item.tipo]} tamanho={16} />
                    <span className="item-de-menu__texto">
                      <span className="item-de-menu__titulo">{item.titulo}</span>
                      <span className="item-de-menu__detalhe">{item.detalhe}</span>
                    </span>
                    {item.noContexto && item.tipo !== 'PAGINA' ? (
                      <span className="etiqueta etiqueta--acento">aqui</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
