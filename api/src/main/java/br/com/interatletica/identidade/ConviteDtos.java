package br.com.interatletica.identidade;

import br.com.interatletica.atletica.Papel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Contratos HTTP do convite, agrupados por serem lidos sempre juntos. */
public final class ConviteDtos {

    private ConviteDtos() {
    }

    public record NovoConvite(
            @NotBlank(message = "informe o e-mail de quem será convidado")
            @Email(message = "e-mail inválido")
            @Size(max = 180)
            String email,

            @NotNull(message = "informe o papel do convidado")
            Papel papel
    ) {
    }

    /**
     * O token só aparece na resposta de criação e na listagem para a
     * diretoria — é o link que ela vai colar no WhatsApp. Não vaza em
     * nenhuma listagem pública.
     */
    public record ConviteResposta(
            UUID id,
            String email,
            Papel papel,
            String link,
            OffsetDateTime expiraEm,
            OffsetDateTime criadoEm
    ) {
        public static ConviteResposta de(Convite convite, String urlBase) {
            return new ConviteResposta(
                    convite.getId(),
                    convite.getEmail(),
                    convite.getPapel(),
                    "%s/convite/%s".formatted(urlBase, convite.getToken()),
                    convite.getExpiraEm(),
                    convite.getCriadoEm());
        }
    }

    /** O que o convidado vê ANTES de aceitar: sem token, sem dado interno. */
    public record ConvitePendente(
            String atleticaNome,
            String atleticaSlug,
            String atleticaBrasaoUrl,
            Papel papel,
            OffsetDateTime expiraEm
    ) {
    }

    public record ResultadoDoAceite(
            String atleticaSlug,
            String atleticaNome,
            Papel papel
    ) {
    }
}
