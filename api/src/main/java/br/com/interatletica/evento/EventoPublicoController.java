package br.com.interatletica.evento;

import br.com.interatletica.comum.tenant.ContextoAtletica;
import br.com.interatletica.evento.EventoDtos.EventoPublico;
import br.com.interatletica.evento.EventoDtos.EventoResumo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * O que abre a partir do link mandado no grupo do WhatsApp.
 *
 * <p>Fora de {@code /api/a/{slug}/...}: aqui não há tenant no contexto,
 * porque quem clica pode nunca ter ouvido falar da plataforma e certamente
 * não tem vínculo com atlética nenhuma. O escopo vem do slug do caminho,
 * resolvido dentro do serviço e passado explicitamente às consultas.</p>
 *
 * <p>Nada aqui expõe quem se inscreveu — só quantos. Nome de quem vai a uma
 * festa não é informação pública.</p>
 */
@RestController
@RequestMapping("/api/publico/a/{atleticaSlug}")
public class EventoPublicoController {

    private final ServicoDeEvento servico;

    public EventoPublicoController(ServicoDeEvento servico) {
        this.servico = servico;
    }

    /** Agenda: o que está por vir. */
    @GetMapping("/eventos")
    public List<EventoResumo> agenda(@PathVariable String atleticaSlug) {
        return ContextoAtletica.consultarSemFiltro(() -> servico.agendaPublica(atleticaSlug));
    }

    /** Histórico: o que já aconteceu. */
    @GetMapping("/eventos/realizados")
    public List<EventoResumo> realizados(@PathVariable String atleticaSlug) {
        return ContextoAtletica.consultarSemFiltro(() -> servico.realizados(atleticaSlug));
    }

    @GetMapping("/e/{eventoSlug}")
    public EventoPublico evento(@PathVariable String atleticaSlug,
                                @PathVariable String eventoSlug) {
        return ContextoAtletica.consultarSemFiltro(
                () -> servico.paginaPublica(atleticaSlug, eventoSlug));
    }
}
