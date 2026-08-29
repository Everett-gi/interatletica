package br.com.interatletica.atletica;

import br.com.interatletica.atletica.AtleticaDtos.AtleticaResposta;
import br.com.interatletica.atletica.AtleticaDtos.AtualizacaoDeAtletica;
import br.com.interatletica.atletica.AtleticaDtos.IdentidadeVisual;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * A atlética vista de dentro. O slug já foi resolvido pelo
 * {@code FiltroContextoAtletica}; os métodos operam sobre o contexto.
 */
@RestController
@RequestMapping("/api/a/{slug}")
public class AtleticaController {

    private final ServicoDeAtletica servico;

    public AtleticaController(ServicoDeAtletica servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("@permissao.membro()")
    public AtleticaResposta perfil() {
        return servico.perfil();
    }

    @PutMapping
    @PreAuthorize("@permissao.presidente()")
    public AtleticaResposta atualizar(@Valid @RequestBody AtualizacaoDeAtletica dados) {
        return servico.atualizar(dados);
    }

    /**
     * Separado do perfil porque muda por outro motivo e com outra frequência:
     * o nome da atlética quase nunca muda, o brasão e as cores mudam a cada
     * gestão nova. Juntar os dois obrigaria a reenviar o perfil inteiro para
     * trocar uma cor.
     */
    @PutMapping("/identidade-visual")
    @PreAuthorize("@permissao.presidente()")
    public AtleticaResposta identidadeVisual(@Valid @RequestBody IdentidadeVisual dados) {
        return servico.atualizarIdentidadeVisual(dados);
    }
}
