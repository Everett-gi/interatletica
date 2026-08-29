package br.com.interatletica.comum.seguranca;

import br.com.interatletica.identidade.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Principal da sessão: o {@code OidcUser} do Google acrescido do id interno
 * do usuário.
 *
 * <p>Carregar o id daqui evita reconsultar {@code usuario} por e-mail a cada
 * requisição. O que NÃO é carregado aqui, de propósito, é papel: papel
 * depende de qual atlética está sendo acessada, e a mesma sessão navega
 * entre várias. Autoridade fixa no principal seria errada em toda
 * requisição menos a primeira — quem decide papel é {@link Permissoes},
 * consultando o vínculo da atlética corrente.</p>
 */
public class UsuarioAutenticado implements OidcUser, Serializable {

    private final OidcUser delegado;
    private final UUID usuarioId;
    private final String nome;
    private final String email;
    private final String avatarUrl;

    public UsuarioAutenticado(OidcUser delegado, Usuario usuario) {
        this.delegado = delegado;
        this.usuarioId = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.avatarUrl = usuario.getAvatarUrl();
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getEmail() {
        return email;
    }

    /** Autenticado é autenticado; autorização por atlética é resolvida depois. */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USUARIO"));
    }

    @Override
    public String getName() {
        return nome;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegado.getAttributes();
    }

    @Override
    public Map<String, Object> getClaims() {
        return delegado.getClaims();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return delegado.getUserInfo();
    }

    @Override
    public OidcIdToken getIdToken() {
        return delegado.getIdToken();
    }
}
