package br.com.interatletica.comum;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;

/**
 * Geração de slug para URL pública.
 *
 * <p>O banco valida o formato com {@code CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')}
 * em {@code atletica} e em {@code evento}. Esta classe existe para que o
 * usuário nunca esbarre nesse CHECK: "Atlética Dragões do Vale" vira
 * {@code atletica-dragoes-do-vale} antes de chegar ao INSERT.</p>
 */
public final class Slugs {

    private static final int TAMANHO_MAXIMO_PADRAO = 60;

    private Slugs() {
    }

    /**
     * "Atlética Dragões — 2026!" torna-se {@code atletica-dragoes-2026}.
     *
     * <p>A decomposição NFD separa a letra do acento, e o filtro seguinte
     * descarta os acentos como caracteres próprios. Fazer isso com um
     * {@code replace} por par de caracteres esqueceria o ç, o ü ou o ñ do
     * nome de alguma instituição.</p>
     */
    public static String gerar(String texto, int tamanhoMaximo) {
        if (texto == null || texto.isBlank()) {
            throw new IllegalArgumentException("Não é possível gerar slug de texto vazio.");
        }

        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        String bruto = semAcento.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        if (bruto.isEmpty()) {
            throw new IllegalArgumentException(
                    "Não foi possível gerar um endereço a partir de: " + texto);
        }

        // Cortar no limite pode deixar um hífen na ponta, o que o CHECK
        // rejeita — daí o segundo aparo depois do corte.
        String cortado = bruto.length() <= tamanhoMaximo
                ? bruto
                : bruto.substring(0, tamanhoMaximo);
        return cortado.replaceAll("-+$", "");
    }

    public static String gerar(String texto) {
        return gerar(texto, TAMANHO_MAXIMO_PADRAO);
    }

    /**
     * Acrescenta {@code -2}, {@code -3}… até achar um livre.
     *
     * <p>Dois eventos "Calourada" no mesmo ano são o caso comum, não a
     * exceção: {@code uk_evento_slug (atletica_id, slug)} rejeitaria o
     * segundo, e devolver "endereço já existe" para quem só quis criar um
     * evento seria transferir um detalhe do banco para o usuário.</p>
     *
     * <p>Há corrida entre a checagem e o INSERT. Ela é resolvida pelo índice
     * único: quem perder recebe violação de constraint e o chamador tenta de
     * novo. Este método reduz a colisão ao caso raro; não é o que garante
     * unicidade.</p>
     */
    public static String unico(String base, int tamanhoMaximo, Predicate<String> jaExiste) {
        String slug = gerar(base, tamanhoMaximo);
        if (!jaExiste.test(slug)) {
            return slug;
        }
        for (int sufixo = 2; sufixo < 1000; sufixo++) {
            String candidato = comSufixo(slug, sufixo, tamanhoMaximo);
            if (!jaExiste.test(candidato)) {
                return candidato;
            }
        }
        throw new IllegalStateException("Não foi possível gerar endereço único para: " + base);
    }

    private static String comSufixo(String slug, int sufixo, int tamanhoMaximo) {
        String cauda = "-" + sufixo;
        int espaco = tamanhoMaximo - cauda.length();
        String cabeca = slug.length() <= espaco ? slug : slug.substring(0, espaco);
        return cabeca.replaceAll("-+$", "") + cauda;
    }
}
