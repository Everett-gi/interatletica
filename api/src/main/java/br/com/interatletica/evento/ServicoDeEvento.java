package br.com.interatletica.evento;

import br.com.interatletica.atletica.Atletica;
import br.com.interatletica.atletica.RepositorioDeAtletica;
import br.com.interatletica.comum.Slugs;
import br.com.interatletica.comum.auditoria.Acoes;
import br.com.interatletica.comum.auditoria.Auditoria;
import br.com.interatletica.comum.erro.RecursoNaoEncontradoException;
import br.com.interatletica.comum.erro.RegraDeNegocioException;
import br.com.interatletica.comum.seguranca.SessaoAtual;
import br.com.interatletica.comum.tenant.ContextoAtletica;
import br.com.interatletica.evento.Evento.MotivoDeFechamento;
import br.com.interatletica.evento.EventoDtos.DadosDoEvento;
import br.com.interatletica.evento.EventoDtos.EventoPublico;
import br.com.interatletica.evento.EventoDtos.EventoResposta;
import br.com.interatletica.evento.EventoDtos.EventoResumo;
import br.com.interatletica.evento.EventoDtos.NovoEvento;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ServicoDeEvento {

    /** Mesmo limite de {@code evento.slug VARCHAR(80)}. */
    private static final int TAMANHO_DO_SLUG = 80;

    private final RepositorioDeEvento repositorio;
    private final RepositorioDeInscricao repositorioDeInscricao;
    private final RepositorioDeOrganizador repositorioDeOrganizador;
    private final RepositorioDeAtletica repositorioDeAtletica;
    private final Auditoria auditoria;

    public ServicoDeEvento(RepositorioDeEvento repositorio,
                           RepositorioDeInscricao repositorioDeInscricao,
                           RepositorioDeOrganizador repositorioDeOrganizador,
                           RepositorioDeAtletica repositorioDeAtletica,
                           Auditoria auditoria) {
        this.repositorio = repositorio;
        this.repositorioDeInscricao = repositorioDeInscricao;
        this.repositorioDeOrganizador = repositorioDeOrganizador;
        this.repositorioDeAtletica = repositorioDeAtletica;
        this.auditoria = auditoria;
    }

    // -----------------------------------------------------------------
    // Diretoria
    // -----------------------------------------------------------------

    @Transactional
    public EventoResposta criar(NovoEvento pedido) {
        UUID atleticaId = ContextoAtletica.exigir();
        DadosDoEvento dados = pedido.dados();

        String slug = pedido.slug() != null && !pedido.slug().isBlank()
                ? pedido.slug()
                : Slugs.unico(dados.titulo(), TAMANHO_DO_SLUG,
                        candidato -> repositorio.slugEmUso(atleticaId, candidato));

        if (repositorio.slugEmUso(atleticaId, slug)) {
            throw new RegraDeNegocioException("SLUG_EM_USO",
                    "Já existe um evento nesta atlética com o endereço /%s.".formatted(slug));
        }

        Evento evento = new Evento(atleticaId, dados.titulo().trim(), slug, dados.tipo(),
                dados.inicioEm(), SessaoAtual.exigirUsuarioId());
        aplicar(evento, dados);
        repositorio.save(evento);

        // A anfitriã entra em evento_organizador junto com o evento: é o que
        // faz "eventos de que participo" ser uma consulta só, sem UNION.
        repositorioDeOrganizador.save(new EventoOrganizador(
                evento.getId(), atleticaId, PapelDeOrganizador.ANFITRIA));

        auditoria.registrar(Acoes.EVENTO_CRIADO, Acoes.E_EVENTO, evento.getId(),
                Map.of("titulo", evento.getTitulo(), "slug", slug));

        return responder(evento);
    }

    @Transactional
    public EventoResposta atualizar(UUID eventoId, DadosDoEvento dados) {
        Evento evento = exigirDaAtleticaAtual(eventoId);
        aplicar(evento, dados);
        auditoria.registrar(Acoes.EVENTO_ATUALIZADO, Acoes.E_EVENTO, eventoId);
        return responder(evento);
    }

    @Transactional
    public EventoResposta publicar(UUID eventoId) {
        Evento evento = exigirDaAtleticaAtual(eventoId);
        evento.publicar();
        auditoria.registrar(Acoes.EVENTO_PUBLICADO, Acoes.E_EVENTO, eventoId,
                Map.of("titulo", evento.getTitulo()));
        return responder(evento);
    }

    /**
     * Cancelar não apaga: quem se inscreveu precisa abrir o link e descobrir
     * que o evento caiu. Apagar o registro devolveria 404 a quem já tinha o
     * link — e a pessoa apareceria no local no dia.
     */
    @Transactional
    public EventoResposta cancelar(UUID eventoId) {
        Evento evento = exigirDaAtleticaAtual(eventoId);
        evento.cancelar();
        auditoria.registrar(Acoes.EVENTO_CANCELADO, Acoes.E_EVENTO, eventoId,
                Map.of("titulo", evento.getTitulo(),
                       "inscritos", repositorioDeInscricao.confirmadas(eventoId)));
        return responder(evento);
    }

    @Transactional
    public EventoResposta encerrar(UUID eventoId) {
        Evento evento = exigirDaAtleticaAtual(eventoId);
        evento.encerrar();
        auditoria.registrar(Acoes.EVENTO_ENCERRADO, Acoes.E_EVENTO, eventoId);
        return responder(evento);
    }

    /**
     * Despublicar só enquanto ninguém se inscreveu. Depois da primeira
     * inscrição, tirar o evento do ar deixaria a pessoa com um comprovante
     * que não abre — o caminho correto passa a ser cancelar, que avisa.
     */
    @Transactional
    public EventoResposta voltarParaRascunho(UUID eventoId) {
        Evento evento = exigirDaAtleticaAtual(eventoId);

        long inscritos = repositorioDeInscricao.confirmadas(eventoId)
                + repositorioDeInscricao.naEspera(eventoId);
        if (inscritos > 0) {
            throw new RegraDeNegocioException("EVENTO_COM_INSCRITOS",
                    "Este evento já tem %d inscrito(s). Cancele em vez de despublicar."
                            .formatted(inscritos));
        }

        evento.voltarParaRascunho();
        auditoria.registrar(Acoes.EVENTO_ATUALIZADO, Acoes.E_EVENTO, eventoId,
                Map.of("acao", "voltou a rascunho"));
        return responder(evento);
    }

    @Transactional(readOnly = true)
    public List<EventoResumo> daAtletica() {
        return repositorio.daAtletica(ContextoAtletica.exigir()).stream()
                .map(EventoResumo::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventoResposta porId(UUID eventoId) {
        return responder(exigirDaAtleticaAtual(eventoId));
    }

    // -----------------------------------------------------------------
    // Público
    // -----------------------------------------------------------------

    /**
     * A página que abre a partir do link do WhatsApp.
     *
     * <p>Roda sem atlética no contexto — quem clica no link pode nunca ter
     * ouvido falar da plataforma. O escopo vem do {@code atleticaId} resolvido
     * pelo slug e passado explicitamente à consulta.</p>
     */
    @Transactional(readOnly = true)
    public EventoPublico paginaPublica(String atleticaSlug, String eventoSlug) {
        Atletica atletica = repositorioDeAtletica.porSlug(atleticaSlug)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atlética", atleticaSlug));

        Evento evento = repositorio.porSlug(atletica.getId(), eventoSlug)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Evento", eventoSlug));

        // Rascunho e evento interno não existem para o público. 404 em vez de
        // 403: confirmar "existe, mas você não pode ver" já entrega que a
        // atlética está planejando alguma coisa.
        if (evento.getStatus() == StatusDoEvento.RASCUNHO
                || evento.getVisibilidade() == Visibilidade.INTERNO) {
            throw new RecursoNaoEncontradoException("Evento", eventoSlug);
        }

        long confirmados = repositorioDeInscricao.confirmadas(evento.getId());
        MotivoDeFechamento motivo = evento.motivoDeFechamento(OffsetDateTime.now());

        Integer vagasRestantes = evento.temLimiteDeVagas()
                ? Math.max(0, evento.getCapacidade() - (int) confirmados)
                : null;

        return new EventoPublico(
                evento.getId(),
                atletica.getSlug(), atletica.getNome(), atletica.getBrasaoUrl(),
                evento.getSlug(), evento.getTitulo(), evento.getDescricao(), evento.getTipo(),
                evento.getModalidade(), evento.getStatus(), evento.getInicioEm(),
                evento.getFimEm(), evento.getLocalNome(), evento.getLocalEndereco(),
                evento.getLocalMapaUrl(), evento.getCapaUrl(), evento.getCapacidade(),
                vagasRestantes, confirmados, motivo.aberta(), motivo.mensagem(),
                evento.getInscricaoAbreEm(), evento.getInscricaoFechaEm());
    }

    @Transactional(readOnly = true)
    public List<EventoResumo> agendaPublica(String atleticaSlug) {
        Atletica atletica = repositorioDeAtletica.porSlug(atleticaSlug)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atlética", atleticaSlug));
        return repositorio.agendaPublica(atletica.getId(), OffsetDateTime.now()).stream()
                .map(EventoResumo::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventoResumo> realizados(String atleticaSlug) {
        Atletica atletica = repositorioDeAtletica.porSlug(atleticaSlug)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atlética", atleticaSlug));
        return repositorio.realizados(atletica.getId(), OffsetDateTime.now()).stream()
                .map(EventoResumo::de)
                .toList();
    }

    // -----------------------------------------------------------------

    /** Carrega o evento cruzando com a atlética do contexto. */
    Evento exigirDaAtleticaAtual(UUID eventoId) {
        return repositorio.porIdDaAtletica(eventoId, ContextoAtletica.exigir())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Evento", eventoId));
    }

    private void aplicar(Evento evento, DadosDoEvento dados) {
        evento.atualizarDescricao(dados.titulo().trim(), dados.descricao(), dados.tipo(),
                dados.modalidade(), dados.visibilidade(), dados.capaUrl());
        evento.atualizarQuando(dados.inicioEm(), dados.fimEm());
        evento.atualizarOnde(dados.localNome(), dados.localEndereco(), dados.localMapaUrl());
        evento.atualizarInscricao(dados.capacidade(), dados.inscricaoAbreEm(),
                dados.inscricaoFechaEm(), dados.inscricaoPorEquipe());
    }

    private EventoResposta responder(Evento evento) {
        return EventoResposta.de(evento,
                repositorioDeInscricao.confirmadas(evento.getId()),
                repositorioDeInscricao.naEspera(evento.getId()));
    }
}
