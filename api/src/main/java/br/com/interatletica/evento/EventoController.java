package br.com.interatletica.evento;

import br.com.interatletica.evento.EventoDtos.DadosDoEvento;
import br.com.interatletica.evento.EventoDtos.EventoResposta;
import br.com.interatletica.evento.EventoDtos.EventoResumo;
import br.com.interatletica.evento.EventoDtos.NovoEvento;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * CRUD de evento, do lado de quem organiza.
 *
 * <p>As transições de estado são POSTs em sub-recursos
 * ({@code /publicar}, {@code /cancelar}) e não um PUT em {@code status}.
 * Publicar não é atribuir um valor a um campo: é uma ação com regra própria,
 * que falha por motivos diferentes de "valor inválido" e merece um endereço
 * onde essa regra fica visível.</p>
 */
@RestController
@RequestMapping("/api/a/{slug}/eventos")
public class EventoController {

    private final ServicoDeEvento servico;

    public EventoController(ServicoDeEvento servico) {
        this.servico = servico;
    }

    /** Inclui rascunhos — é o painel da diretoria, não a agenda pública. */
    @GetMapping
    @PreAuthorize("@permissao.membro()")
    public List<EventoResumo> listar() {
        return servico.daAtletica();
    }

    @GetMapping("/{eventoId}")
    @PreAuthorize("@permissao.membro()")
    public EventoResposta porId(@PathVariable UUID eventoId) {
        return servico.porId(eventoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissao.diretor()")
    public EventoResposta criar(@Valid @RequestBody NovoEvento dados) {
        return servico.criar(dados);
    }

    @PutMapping("/{eventoId}")
    @PreAuthorize("@permissao.diretor()")
    public EventoResposta atualizar(@PathVariable UUID eventoId,
                                    @Valid @RequestBody DadosDoEvento dados) {
        return servico.atualizar(eventoId, dados);
    }

    @PostMapping("/{eventoId}/publicar")
    @PreAuthorize("@permissao.diretor()")
    public EventoResposta publicar(@PathVariable UUID eventoId) {
        return servico.publicar(eventoId);
    }

    @PostMapping("/{eventoId}/despublicar")
    @PreAuthorize("@permissao.diretor()")
    public EventoResposta despublicar(@PathVariable UUID eventoId) {
        return servico.voltarParaRascunho(eventoId);
    }

    @PostMapping("/{eventoId}/cancelar")
    @PreAuthorize("@permissao.diretor()")
    public EventoResposta cancelar(@PathVariable UUID eventoId) {
        return servico.cancelar(eventoId);
    }

    @PostMapping("/{eventoId}/encerrar")
    @PreAuthorize("@permissao.diretor()")
    public EventoResposta encerrar(@PathVariable UUID eventoId) {
        return servico.encerrar(eventoId);
    }
}
