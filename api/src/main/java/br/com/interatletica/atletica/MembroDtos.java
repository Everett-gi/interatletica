package br.com.interatletica.atletica;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class MembroDtos {

    private MembroDtos() {
    }

    public record MudancaDePapel(
            @NotNull(message = "informe o novo papel")
            Papel papel,

            @Size(max = 80, message = "o cargo cabe em 80 caracteres")
            String cargo
    ) {
    }

    /**
     * O e-mail aparece porque a diretoria precisa dele para falar com o
     * membro fora da plataforma — é a lista de contatos que hoje mora numa
     * planilha. Só quem tem vínculo ativo na atlética enxerga esta lista.
     */
    public record MembroResposta(
            UUID id,
            UUID usuarioId,
            String nome,
            String email,
            String avatarUrl,
            Papel papel,
            String cargo,
            SituacaoMembro situacao,
            OffsetDateTime entrouEm,
            OffsetDateTime saiuEm
    ) {
        public static MembroResposta de(Membro m) {
            return new MembroResposta(
                    m.getId(),
                    m.getUsuario().getId(),
                    m.getUsuario().getNome(),
                    m.getUsuario().getEmail(),
                    m.getUsuario().getAvatarUrl(),
                    m.getPapel(),
                    m.getCargo(),
                    m.getSituacao(),
                    m.getEntrouEm(),
                    m.getSaiuEm());
        }
    }
}
