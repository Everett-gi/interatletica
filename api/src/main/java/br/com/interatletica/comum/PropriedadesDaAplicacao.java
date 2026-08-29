package br.com.interatletica.comum;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;
import java.util.Set;

/**
 * Configuração própria da aplicação, sob o prefixo {@code app}.
 *
 * @param urlBase    origem pública, usada para montar links de convite que
 *                   vão para fora (WhatsApp, e-mail). Nunca derivar do host
 *                   da requisição: atrás do Caddy isso produziria
 *                   {@code http://api:8080/...}.
 * @param convite    parâmetros do convite
 * @param operadores e-mails autorizados a CRIAR atléticas na plataforma
 */
@ConfigurationProperties(prefix = "app")
public record PropriedadesDaAplicacao(
        String urlBase,
        Convite convite,
        List<String> operadores
) {

    public PropriedadesDaAplicacao {
        convite = convite != null ? convite : new Convite(7);
        operadores = operadores != null ? operadores : List.of();
    }

    /**
     * Não existe autocadastro de atlética — é decisão de projeto, para que
     * moderar cadastro falso não vire trabalho da diretoria na primeira
     * semana. Alguém precisa abrir a porta, então a lista de quem pode abrir
     * é explícita, versionada no {@code .env} e auditável.
     *
     * <p>Comparação em minúsculas: e-mail não diferencia caixa na prática, e
     * um {@code .env} escrito com maiúscula não deve trancar o operador do
     * lado de fora.</p>
     */
    public boolean ehOperador(String email) {
        if (email == null) {
            return false;
        }
        Set<String> normalizados = operadores.stream()
                .map(e -> e.trim().toLowerCase())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        return normalizados.contains(email.trim().toLowerCase());
    }

    public record Convite(int validadeDias) {
    }
}
