package br.com.interatletica.atletica;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Contratos HTTP da atlética.
 *
 * <p>Os limites de tamanho e os {@code Pattern} repetem os CHECK da
 * migration de propósito. A duplicação é aceita porque as duas camadas
 * respondem perguntas diferentes: o banco garante que dado inválido não
 * entra, mesmo por script; a validação aqui garante que o usuário recebe
 * "UF inválida" em vez de um 500 vindo de violação de constraint.</p>
 */
public final class AtleticaDtos {

    /** Mesmo formato do {@code ck_atletica_cor_pri} na migration. */
    private static final String HEX = "^#[0-9A-Fa-f]{6}$";

    private AtleticaDtos() {
    }

    public record NovaAtletica(
            @NotBlank(message = "informe o nome da atlética")
            @Size(max = 140)
            String nome,

            @Size(max = 20)
            String sigla,

            @NotBlank(message = "informe a instituição de ensino")
            @Size(max = 160)
            String instituicao,

            @Size(max = 90)
            String cidade,

            @Pattern(regexp = "^[A-Z]{2}$", message = "use a sigla da UF em maiúsculas, ex.: SP")
            String uf,

            // Opcional. Em branco, é derivado do nome. Informado, é a chance
            // de a atlética escolher o próprio endereço público — depois de
            // criada, o slug é imutável.
            @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
                     message = "use apenas letras minúsculas, números e hífen")
            @Size(max = 60)
            String slug,

            @NotBlank(message = "informe o e-mail de quem presidirá a atlética")
            @jakarta.validation.constraints.Email
            @Size(max = 180)
            String emailDoPresidente
    ) {
    }

    public record AtualizacaoDeAtletica(
            @NotBlank @Size(max = 140) String nome,
            @Size(max = 20) String sigla,
            @NotBlank @Size(max = 160) String instituicao,
            @Size(max = 90) String cidade,
            @Pattern(regexp = "^[A-Z]{2}$", message = "use a sigla da UF em maiúsculas")
            String uf,
            @Size(max = 60) String instagram
    ) {
    }

    public record IdentidadeVisual(
            String brasaoUrl,
            @Pattern(regexp = HEX, message = "use cor em hexadecimal, ex.: #1B3A6F")
            String corPrimaria,
            @Pattern(regexp = HEX, message = "use cor em hexadecimal, ex.: #1B3A6F")
            String corSecundaria
    ) {
    }

    public record MudancaDeSituacao(
            @NotNull SituacaoAtletica situacao
    ) {
    }

    /** Perfil completo. */
    public record AtleticaResposta(
            UUID id,
            String slug,
            String nome,
            String sigla,
            String instituicao,
            String cidade,
            String uf,
            String brasaoUrl,
            String corPrimaria,
            String corSecundaria,
            String instagram,
            SituacaoAtletica situacao,
            OffsetDateTime criadoEm
    ) {
        public static AtleticaResposta de(Atletica a) {
            return new AtleticaResposta(a.getId(), a.getSlug(), a.getNome(), a.getSigla(),
                    a.getInstituicao(), a.getCidade(), a.getUf(), a.getBrasaoUrl(),
                    a.getCorPrimaria(), a.getCorSecundaria(), a.getInstagram(),
                    a.getSituacao(), a.getCriadoEm());
        }
    }

    /** O bastante para um card na vitrine ou no seletor do topo do app. */
    public record AtleticaResumo(
            String slug,
            String nome,
            String sigla,
            String instituicao,
            String cidade,
            String uf,
            String brasaoUrl,
            String corPrimaria
    ) {
        public static AtleticaResumo de(Atletica a) {
            return new AtleticaResumo(a.getSlug(), a.getNome(), a.getSigla(), a.getInstituicao(),
                    a.getCidade(), a.getUf(), a.getBrasaoUrl(), a.getCorPrimaria());
        }
    }

    /** Atlética + o papel de quem está perguntando. Alimenta o menu do app. */
    public record MinhaAtletica(
            AtleticaResumo atletica,
            Papel papel,
            String cargo
    ) {
    }
}
