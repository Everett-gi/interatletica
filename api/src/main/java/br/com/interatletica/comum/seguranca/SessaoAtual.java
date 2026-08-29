package br.com.interatletica.comum.seguranca;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

/**
 * Acesso ao usuário da sessão corrente sem arrastar {@code Authentication}
 * por assinatura de método até o fundo da pilha de serviços.
 */
public final class SessaoAtual {

    private SessaoAtual() {
    }

    public static Optional<UsuarioAutenticado> usuario() {
        Authentication autenticacao = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacao == null || !autenticacao.isAuthenticated()) {
            return Optional.empty();
        }
        return autenticacao.getPrincipal() instanceof UsuarioAutenticado u
                ? Optional.of(u)
                : Optional.empty();
    }

    public static Optional<UUID> usuarioId() {
        return usuario().map(UsuarioAutenticado::getUsuarioId);
    }

    /**
     * @throws IllegalStateException se chamado fora de requisição autenticada.
     *         Não é 401: a cadeia de segurança já teria barrado. Chegar aqui
     *         sem usuário é bug de configuração de rota, e deve aparecer como
     *         erro do servidor, não como "faça login".
     */
    public static UUID exigirUsuarioId() {
        return usuarioId().orElseThrow(() -> new IllegalStateException(
                "Rota protegida alcançada sem usuário autenticado na sessão."));
    }
}
