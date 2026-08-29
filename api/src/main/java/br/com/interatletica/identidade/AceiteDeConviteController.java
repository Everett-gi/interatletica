package br.com.interatletica.identidade;

import br.com.interatletica.comum.seguranca.SessaoAtual;
import br.com.interatletica.comum.tenant.ContextoAtletica;
import br.com.interatletica.identidade.ConviteDtos.ConvitePendente;
import br.com.interatletica.identidade.ConviteDtos.ResultadoDoAceite;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * O lado de quem RECEBE o convite.
 *
 * <p>Fica fora de {@code /api/a/{slug}/...} por necessidade: quem abre o
 * link ainda não é membro de atlética nenhuma, e o link nem carrega slug. Sem
 * atlética na URL, o {@code FiltroContextoAtletica} não resolve tenant — e é
 * por isso que cada chamada aqui suspende o filtro do Hibernate
 * explicitamente, em vez de depender de o contexto estar vazio por acaso.</p>
 */
@RestController
public class AceiteDeConviteController {

    private final ServicoDeConvite servico;

    public AceiteDeConviteController(ServicoDeConvite servico) {
        this.servico = servico;
    }

    /**
     * Prévia pública do convite: qual atlética, qual papel, até quando vale.
     *
     * <p>Aberta sem autenticação de propósito. Se exigisse login, quem clica
     * no link seria mandado ao Google antes de saber do que se trata — e
     * voltaria para uma tela que não explica por que pediu a conta dele. O
     * que se revela aqui, quem tem o token já teria como saber; o e-mail do
     * convidado não é devolvido.</p>
     */
    @GetMapping("/api/publico/convites/{token}")
    public ConvitePendente examinar(@PathVariable String token) {
        return ContextoAtletica.consultarSemFiltro(() -> servico.examinar(token));
    }

    @PostMapping("/api/convites/{token}/aceitar")
    public ResultadoDoAceite aceitar(@PathVariable String token) {
        return ContextoAtletica.consultarSemFiltro(() -> servico.aceitar(token));
    }

    /** Convites esperando o usuário logado, em qualquer atlética. */
    @GetMapping("/api/convites/meus")
    public List<ConvitePendente> meus() {
        String email = SessaoAtual.usuario()
                .orElseThrow(() -> new IllegalStateException(
                        "Rota autenticada alcançada sem sessão."))
                .getEmail();
        return ContextoAtletica.consultarSemFiltro(() -> servico.meusConvites(email));
    }
}
