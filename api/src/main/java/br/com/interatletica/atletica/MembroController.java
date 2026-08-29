package br.com.interatletica.atletica;

import br.com.interatletica.atletica.MembroDtos.MembroResposta;
import br.com.interatletica.atletica.MembroDtos.MudancaDePapel;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/a/{slug}/membros")
public class MembroController {

    private final ServicoDeMembro servico;

    public MembroController(ServicoDeMembro servico) {
        this.servico = servico;
    }

    /** Quadro atual. Visível a qualquer membro: é a lista de quem é quem. */
    @GetMapping
    @PreAuthorize("@permissao.membro()")
    public List<MembroResposta> ativos() {
        return servico.ativos();
    }

    /** Histórico completo, incluindo desligados. Restrito à diretoria. */
    @GetMapping("/historico")
    @PreAuthorize("@permissao.diretor()")
    public List<MembroResposta> todos() {
        return servico.todos();
    }

    /** O papel de quem está perguntando, para o app decidir o que exibir. */
    @GetMapping("/eu")
    @PreAuthorize("@permissao.membro()")
    public MembroResposta meuVinculo() {
        return servico.meuVinculo();
    }

    @PutMapping("/{membroId}/papel")
    @PreAuthorize("@permissao.presidente()")
    public MembroResposta alterarPapel(@PathVariable UUID membroId,
                                       @Valid @RequestBody MudancaDePapel dados) {
        return servico.alterarPapel(membroId, dados);
    }

    /**
     * DELETE desliga o vínculo; não apaga a linha. As inscrições e os
     * resultados de torneio que essa pessoa produziu continuam apontando
     * para um membro existente.
     */
    @DeleteMapping("/{membroId}")
    @PreAuthorize("@permissao.presidente()")
    public ResponseEntity<Void> desligar(@PathVariable UUID membroId) {
        servico.desligar(membroId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{membroId}/reativar")
    @PreAuthorize("@permissao.presidente()")
    public MembroResposta reativar(@PathVariable UUID membroId) {
        return servico.reativar(membroId);
    }
}
