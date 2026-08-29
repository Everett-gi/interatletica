package br.com.interatletica.comum.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Resolve a atlética da requisição a partir da URL e publica no
 * {@link ContextoAtletica}.
 *
 * <p>Convenção de rota: {@code /api/a/{slug}/...}. O slug fica na URL, e não
 * em cabeçalho, porque assim o link que a diretoria manda no grupo do
 * WhatsApp já carrega o contexto e é compartilhável.</p>
 *
 * <p>Este filtro apenas RESOLVE. Ele não autoriza: verificar se o usuário
 * logado é membro daquela atlética é responsabilidade da camada de
 * segurança, que roda depois.</p>
 */
@Component
@Order(10)
public class FiltroContextoAtletica extends OncePerRequestFilter {

    private static final Pattern ROTA_ATLETICA =
            Pattern.compile("^/api/a/([a-z0-9]+(?:-[a-z0-9]+)*)(?:/.*)?$");

    private final ResolvedorDeAtletica resolvedor;

    public FiltroContextoAtletica(ResolvedorDeAtletica resolvedor) {
        this.resolvedor = resolvedor;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest requisicao,
                                    HttpServletResponse resposta,
                                    FilterChain cadeia) throws ServletException, IOException {
        try {
            extrairSlug(requisicao.getRequestURI())
                    .flatMap(resolvedor::idPorSlug)
                    .ifPresent(ContextoAtletica::definir);
            cadeia.doFilter(requisicao, resposta);
        } finally {
            // Obrigatório: a thread volta ao pool com o contexto sujo se falhar.
            ContextoAtletica.limpar();
        }
    }

    private Optional<String> extrairSlug(String uri) {
        Matcher m = ROTA_ATLETICA.matcher(uri);
        return m.matches() ? Optional.of(m.group(1)) : Optional.empty();
    }

    /** Contrato de resolução, implementado no módulo de atlética. */
    public interface ResolvedorDeAtletica {
        Optional<UUID> idPorSlug(String slug);
    }
}
