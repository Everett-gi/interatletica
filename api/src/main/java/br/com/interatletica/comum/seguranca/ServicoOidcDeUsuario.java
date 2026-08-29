package br.com.interatletica.comum.seguranca;

import br.com.interatletica.identidade.RepositorioDeUsuario;
import br.com.interatletica.identidade.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ponte entre a conta do Google e a tabela {@code usuario}.
 *
 * <p>Roda uma vez por login. Reconcilia nesta ordem:</p>
 *
 * <ol>
 *   <li><strong>Por {@code sub}</strong> — identificador estável do Google.
 *       É o caminho normal de todo login a partir do segundo.</li>
 *   <li><strong>Por e-mail verificado</strong> — vincula o {@code sub} a uma
 *       conta que já existia. Acontece quando a pessoa foi convidada e ainda
 *       não tinha logado.</li>
 *   <li><strong>Criação</strong> — primeiro acesso à plataforma.</li>
 * </ol>
 *
 * <p>O passo 2 só ocorre com {@code email_verified = true}. Vincular por
 * e-mail não verificado permitiria a qualquer pessoa criar uma conta em um
 * provedor com o e-mail de outra e assumir o vínculo dela — inclusive uma
 * presidência de atlética. O Google sempre marca contas próprias como
 * verificadas; a checagem existe porque o custo é uma linha e a falha é
 * tomada de conta.</p>
 */
@Service
public class ServicoOidcDeUsuario extends OidcUserService {

    private static final Logger log = LoggerFactory.getLogger(ServicoOidcDeUsuario.class);

    private final RepositorioDeUsuario repositorio;

    public ServicoOidcDeUsuario(RepositorioDeUsuario repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest requisicao) throws OAuth2AuthenticationException {
        OidcUser doProvedor = super.loadUser(requisicao);

        String sub = doProvedor.getSubject();
        String email = doProvedor.getEmail();
        String nome = doProvedor.getFullName() != null ? doProvedor.getFullName() : email;
        String avatar = doProvedor.getPicture();
        boolean emailVerificado = Boolean.TRUE.equals(doProvedor.getEmailVerified());

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("email_ausente"),
                    "A conta Google não expôs um e-mail. Verifique as permissões concedidas.");
        }

        Usuario usuario = repositorio.porProvedorSub(sub)
                .map(existente -> {
                    existente.sincronizarComProvedor(nome, email, avatar);
                    return existente;
                })
                .orElseGet(() -> vincularOuCriar(sub, email, nome, avatar, emailVerificado));

        if (!usuario.isAtivo()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("conta_desativada"),
                    "Esta conta está desativada.");
        }

        usuario.registrarAcesso();
        // O @Transactional garante o flush; não é preciso chamar save() num
        // objeto já gerenciado — e chamar esconderia que ele é gerenciado.
        return new UsuarioAutenticado(doProvedor, usuario);
    }

    private Usuario vincularOuCriar(String sub, String email, String nome,
                                    String avatar, boolean emailVerificado) {
        return repositorio.porEmail(email)
                .map(existente -> {
                    if (!emailVerificado) {
                        log.warn("Login com e-mail não verificado tentou assumir conta existente: {}", email);
                        throw new OAuth2AuthenticationException(
                                new OAuth2Error("email_nao_verificado"),
                                "Verifique seu e-mail no provedor antes de entrar.");
                    }
                    log.info("Vinculando provedor a conta preexistente: {}", email);
                    existente.vincularProvedor(sub);
                    existente.sincronizarComProvedor(nome, email, avatar);
                    return existente;
                })
                .orElseGet(() -> {
                    log.info("Primeiro acesso, criando usuário: {}", email);
                    return repositorio.save(new Usuario(nome, email, sub, avatar));
                });
    }
}
