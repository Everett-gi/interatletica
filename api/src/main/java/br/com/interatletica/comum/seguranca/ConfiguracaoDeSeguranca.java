package br.com.interatletica.comum.seguranca;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.DelegatingAuthenticationEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.util.LinkedHashMap;

/**
 * Cadeia de segurança da API.
 *
 * <p>Sessão com cookie, não JWT. A PWA e a API vivem no mesmo domínio (ver
 * Caddyfile), então o cookie é same-site, não há CORS e não há token para a
 * aplicação guardar em {@code localStorage} — que é justamente onde um XSS
 * iria procurar.</p>
 */
@Configuration
@EnableMethodSecurity
public class ConfiguracaoDeSeguranca {

    /** Prefixo das rotas de API. Fora dele, a requisição é navegação de browser. */
    private static final String PADRAO_API = "/api/**";

    private final ServicoOidcDeUsuario servicoOidc;

    public ConfiguracaoDeSeguranca(ServicoOidcDeUsuario servicoOidc) {
        this.servicoOidc = servicoOidc;
    }

    @Bean
    public SecurityFilterChain cadeia(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(rotas -> rotas
                // Sonda do Docker e do Caddy. O Caddy responde 404 em
                // /actuator/* na borda, então isto não é acessível de fora.
                .requestMatchers("/actuator/health/**").permitAll()

                // Página pública de evento: o link do WhatsApp precisa abrir
                // para quem nunca ouviu falar da plataforma.
                .requestMatchers("/api/publico/**").permitAll()

                // "Quem sou eu" responde 204 a anônimo em vez de 401. É a
                // primeira chamada de toda abertura do app, inclusive das
                // visitas deslogadas; 401 aqui encheria o console de erro
                // vermelho em fluxo normal.
                .requestMatchers(HttpMethod.GET, "/api/eu").permitAll()

                // Aceite de convite: quem aceita ainda NÃO é membro. Exigir
                // vínculo aqui fecharia a única porta de entrada da
                // plataforma. Autenticação basta; o token é a autorização.
                .requestMatchers("/api/convites/**").authenticated()

                .requestMatchers(PADRAO_API).authenticated()

                // Arquivos da PWA e fluxo OAuth.
                .anyRequest().permitAll())

            .oauth2Login(login -> login
                .userInfoEndpoint(info -> info.oidcUserService(servicoOidc))
                .defaultSuccessUrl("/", true)
                .failureUrl("/?erro=login"))

            .logout(saida -> saida
                .logoutUrl("/api/sessao/sair")
                .logoutSuccessHandler((req, resp, auth) -> resp.setStatus(HttpStatus.NO_CONTENT.value()))
                .invalidateHttpSession(true)
                .deleteCookies("SESSAO"))

            .exceptionHandling(erros -> erros
                .authenticationEntryPoint(pontoDeEntrada()))

            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(manipuladorDeCsrf()))

            .sessionManagement(sessao -> sessao
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                // Sessão nova a cada login: impede fixação de sessão, em que
                // o atacante planta um JSESSIONID conhecido antes do login.
                .sessionFixation(fixacao -> fixacao.newSession()));

        return http.build();
    }

    /**
     * Requisição de API sem sessão recebe 401 com corpo JSON; navegação de
     * browser é redirecionada ao Google.
     *
     * <p>Sem esta separação, um {@code fetch()} da PWA com sessão expirada
     * seguiria o 302 até o Google e o erro chegaria ao código do cliente como
     * uma falha de CORS opaca — em vez de "sua sessão expirou".</p>
     */
    private AuthenticationEntryPoint pontoDeEntrada() {
        var pontos = new LinkedHashMap<RequestMatcher, AuthenticationEntryPoint>();
        pontos.put(new AntPathRequestMatcher(PADRAO_API), (req, resp, e) -> {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.setContentType(MediaType.APPLICATION_JSON_VALUE);
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write("""
                    {"status":401,"erro":"NAO_AUTENTICADO","mensagem":"Faça login para continuar."}""");
        });

        var delegador = new DelegatingAuthenticationEntryPoint(pontos);
        delegador.setDefaultEntryPoint(
                new LoginUrlAuthenticationEntryPoint("/oauth2/authorization/google"));
        return delegador;
    }

    /**
     * O padrão do Spring Security 6 é {@code XorCsrfTokenRequestAttributeHandler}
     * com carregamento tardio do token. Numa SPA isso quebra de um jeito
     * confuso: o cookie XSRF-TOKEN carrega um valor mascarado, diferente do
     * que o servidor espera de volta no cabeçalho, e o primeiro POST devolve
     * 403 sem explicação.
     *
     * <p>O handler simples com {@code csrfRequestAttributeName = null} força
     * o token a ser resolvido em toda resposta — assim o cookie existe antes
     * do primeiro POST — e mantém cookie e cabeçalho com o mesmo valor.</p>
     */
    private CsrfTokenRequestAttributeHandler manipuladorDeCsrf() {
        var manipulador = new CsrfTokenRequestAttributeHandler();
        manipulador.setCsrfRequestAttributeName(null);
        return manipulador;
    }
}
