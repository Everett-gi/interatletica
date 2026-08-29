import { api } from './cliente'
import type {
  Atletica,
  AtleticaResumo,
  Convite,
  ConvitePendente,
  DadosDoEvento,
  Evento,
  EventoPublico,
  EventoResumo,
  Inscricao,
  Membro,
  OrigemDosInscritos,
  Papel,
  Participante,
  PerfilDaSessao,
  ResultadoDoAceite,
  ResultadoDoCheckin,
} from './tipos'

/**
 * Os endereços da API, num lugar só.
 *
 * <p>Espalhar strings de URL pelos componentes faz com que renomear uma rota
 * vire uma busca por texto no projeto inteiro — e a que passar despercebida
 * só falha em produção, quando alguém clicar.</p>
 */

const a = (slug: string) => `/api/a/${encodeURIComponent(slug)}`

export const Api = {
  /** 204 quando ninguém está logado. Não é erro: é visitante. */
  sessao: () => api.getOpcional<PerfilDaSessao>('/api/eu'),

  vitrine: () => api.get<AtleticaResumo[]>('/api/publico/atleticas'),

  convite: {
    examinar: (token: string) =>
      api.get<ConvitePendente>(`/api/publico/convites/${encodeURIComponent(token)}`),
    aceitar: (token: string) =>
      api.post<ResultadoDoAceite>(`/api/convites/${encodeURIComponent(token)}/aceitar`),
    meus: () => api.get<ConvitePendente[]>('/api/convites/meus'),
  },

  atletica: {
    perfil: (slug: string) => api.get<Atletica>(a(slug)),
    atualizar: (slug: string, dados: unknown) => api.put<Atletica>(a(slug), dados),
    identidadeVisual: (slug: string, dados: unknown) =>
      api.put<Atletica>(`${a(slug)}/identidade-visual`, dados),
    publica: (slug: string) =>
      api.get<AtleticaResumo>(`/api/publico/atleticas/${encodeURIComponent(slug)}`),
  },

  membros: {
    listar: (slug: string) => api.get<Membro[]>(`${a(slug)}/membros`),
    historico: (slug: string) => api.get<Membro[]>(`${a(slug)}/membros/historico`),
    eu: (slug: string) => api.get<Membro>(`${a(slug)}/membros/eu`),
    alterarPapel: (slug: string, membroId: string, papel: Papel, cargo: string | null) =>
      api.put<Membro>(`${a(slug)}/membros/${membroId}/papel`, { papel, cargo }),
    desligar: (slug: string, membroId: string) =>
      api.remover(`${a(slug)}/membros/${membroId}`),
    reativar: (slug: string, membroId: string) =>
      api.post<Membro>(`${a(slug)}/membros/${membroId}/reativar`),
  },

  convites: {
    listar: (slug: string) => api.get<Convite[]>(`${a(slug)}/convites`),
    criar: (slug: string, email: string, papel: Papel) =>
      api.post<Convite>(`${a(slug)}/convites`, { email, papel }),
    revogar: (slug: string, conviteId: string) =>
      api.remover(`${a(slug)}/convites/${conviteId}`),
  },

  eventos: {
    listar: (slug: string) => api.get<EventoResumo[]>(`${a(slug)}/eventos`),
    porId: (slug: string, id: string) => api.get<Evento>(`${a(slug)}/eventos/${id}`),
    criar: (slug: string, dados: DadosDoEvento, slugDoEvento?: string) =>
      api.post<Evento>(`${a(slug)}/eventos`, { dados, slug: slugDoEvento ?? null }),
    atualizar: (slug: string, id: string, dados: DadosDoEvento) =>
      api.put<Evento>(`${a(slug)}/eventos/${id}`, dados),
    publicar: (slug: string, id: string) =>
      api.post<Evento>(`${a(slug)}/eventos/${id}/publicar`),
    despublicar: (slug: string, id: string) =>
      api.post<Evento>(`${a(slug)}/eventos/${id}/despublicar`),
    cancelar: (slug: string, id: string) =>
      api.post<Evento>(`${a(slug)}/eventos/${id}/cancelar`),
    encerrar: (slug: string, id: string) =>
      api.post<Evento>(`${a(slug)}/eventos/${id}/encerrar`),
  },

  inscricao: {
    criar: (slug: string, eventoId: string, observacao: string | null,
            atleticaDeOrigem: string | null) =>
      api.post<Inscricao>(`${a(slug)}/eventos/${eventoId}/inscricao`,
        { observacao, atleticaDeOrigem }),
    /** 204 quando a pessoa não está inscrita. */
    minha: (slug: string, eventoId: string) =>
      api.getOpcional<Inscricao>(`${a(slug)}/eventos/${eventoId}/inscricao`),
    cancelar: (slug: string, eventoId: string) =>
      api.remover(`${a(slug)}/eventos/${eventoId}/inscricao`),
    minhas: () => api.get<Inscricao[]>('/api/eu/inscricoes'),
  },

  participantes: {
    listar: (slug: string, eventoId: string) =>
      api.get<Participante[]>(`${a(slug)}/eventos/${eventoId}/participantes`),
    origem: (slug: string, eventoId: string) =>
      api.get<OrigemDosInscritos[]>(`${a(slug)}/eventos/${eventoId}/participantes/origem`),
    /**
     * Navegação do browser, e não fetch: o CSV precisa virar download com
     * nome de arquivo, e é o Content-Disposition da resposta que faz isso.
     * Baixar por fetch obrigaria a montar um Blob e um link sintético para
     * chegar no mesmo lugar.
     */
    urlDoCsv: (slug: string, eventoId: string) =>
      `${a(slug)}/eventos/${eventoId}/participantes.csv`,
    cancelarInscricao: (slug: string, eventoId: string, inscricaoId: string) =>
      api.remover(`${a(slug)}/eventos/${eventoId}/inscricoes/${inscricaoId}`),
  },

  portaria: {
    checkin: (slug: string, eventoId: string, token: string) =>
      api.post<ResultadoDoCheckin>(`${a(slug)}/eventos/${eventoId}/checkin`, { token }),
  },

  publico: {
    agenda: (atleticaSlug: string) =>
      api.get<EventoResumo[]>(`/api/publico/a/${encodeURIComponent(atleticaSlug)}/eventos`),
    realizados: (atleticaSlug: string) =>
      api.get<EventoResumo[]>(
        `/api/publico/a/${encodeURIComponent(atleticaSlug)}/eventos/realizados`),
    evento: (atleticaSlug: string, eventoSlug: string) =>
      api.get<EventoPublico>(
        `/api/publico/a/${encodeURIComponent(atleticaSlug)}/e/${encodeURIComponent(eventoSlug)}`),
  },
}
