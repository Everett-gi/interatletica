package br.com.interatletica.identidade;

import br.com.interatletica.identidade.ConviteDtos.ConviteResposta;
import br.com.interatletica.identidade.ConviteDtos.NovoConvite;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Convites vistos de dentro da atlética.
 *
 * <p>O {@code slug} da rota não é lido por nenhum método: ele já foi
 * consumido pelo {@code FiltroContextoAtletica}, que resolveu a atlética e a
 * publicou no contexto da requisição. Ele aparece na assinatura do
 * {@code @RequestMapping} porque é o que torna a rota multi-tenant — e some
 * dos parâmetros porque repeti-lo em cada método seria ruído.</p>
 *
 * <p>Convidar é atribuição de PRESIDENTE, como diz o comentário de
 * {@code membro.papel} na migration: diretor cria eventos, presidente
 * administra quem entra. Quem controla a entrada controla a atlética.</p>
 */
@RestController
@RequestMapping("/api/a/{slug}/convites")
public class ConviteController {

    private final ServicoDeConvite servico;

    public ConviteController(ServicoDeConvite servico) {
        this.servico = servico;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissao.presidente()")
    public ConviteResposta convidar(@Valid @RequestBody NovoConvite dados) {
        return servico.convidar(dados);
    }

    @GetMapping
    @PreAuthorize("@permissao.presidente()")
    public List<ConviteResposta> pendentes() {
        return servico.pendentes();
    }

    @DeleteMapping("/{conviteId}")
    @PreAuthorize("@permissao.presidente()")
    public ResponseEntity<Void> revogar(@PathVariable UUID conviteId) {
        servico.revogar(conviteId);
        return ResponseEntity.noContent().build();
    }
}
