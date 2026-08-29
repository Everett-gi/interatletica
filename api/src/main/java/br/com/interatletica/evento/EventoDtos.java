package br.com.interatletica.evento;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class EventoDtos {

    private EventoDtos() {
    }

    /**
     * Campos do evento na criação e na edição.
     *
     * <p>Um record só para os dois casos, em vez de {@code NovoEvento} e
     * {@code AtualizacaoDeEvento} idênticos lado a lado: os campos são os
     * mesmos, e duas cópias divergiriam na primeira vez que alguém
     * acrescentasse um campo em apenas uma delas. O que difere entre criar e
     * editar — slug e status — não vem daqui.</p>
     */
    public record DadosDoEvento(
            @NotBlank(message = "informe o título do evento")
            @Size(max = 160)
            String titulo,

            String descricao,

            @NotNull(message = "informe o tipo do evento")
            TipoDeEvento tipo,

            @Size(max = 60)
            String modalidade,

            @NotNull(message = "informe quem pode ver o evento")
            Visibilidade visibilidade,

            @NotNull(message = "informe quando o evento começa")
            OffsetDateTime inicioEm,

            OffsetDateTime fimEm,

            @Size(max = 160)
            String localNome,

            String localEndereco,

            String localMapaUrl,

            // Em branco = vagas ilimitadas. Zero seria "nenhuma vaga", que o
            // CHECK ck_evento_capacidade rejeita.
            @Positive(message = "deixe em branco para vagas ilimitadas")
            Integer capacidade,

            OffsetDateTime inscricaoAbreEm,

            OffsetDateTime inscricaoFechaEm,

            boolean inscricaoPorEquipe,

            String capaUrl
    ) {
    }

    public record NovoEvento(
            //  é o que faz a validação DESCER para os campos de
            // DadosDoEvento. Só com , o record aninhado é conferido
            // quanto à presença e mais nada: um título em branco passaria
            // direto e só seria barrado pelo NOT NULL do banco, como 500.
            @NotNull @Valid DadosDoEvento dados,

            // Opcional: em branco, é derivado do título.
            @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
                     message = "use apenas letras minúsculas, números e hífen")
            @Size(max = 80)
            String slug
    ) {
    }

    /** Visão da diretoria: tudo, inclusive o que ainda é rascunho. */
    public record EventoResposta(
            UUID id,
            String slug,
            String titulo,
            String descricao,
            TipoDeEvento tipo,
            String modalidade,
            StatusDoEvento status,
            Visibilidade visibilidade,
            OffsetDateTime inicioEm,
            OffsetDateTime fimEm,
            String localNome,
            String localEndereco,
            String localMapaUrl,
            Integer capacidade,
            OffsetDateTime inscricaoAbreEm,
            OffsetDateTime inscricaoFechaEm,
            boolean inscricaoPorEquipe,
            String capaUrl,
            OffsetDateTime publicadoEm,
            long inscritosConfirmados,
            long naListaDeEspera
    ) {
        public static EventoResposta de(Evento e, long confirmados, long espera) {
            return new EventoResposta(e.getId(), e.getSlug(), e.getTitulo(), e.getDescricao(),
                    e.getTipo(), e.getModalidade(), e.getStatus(), e.getVisibilidade(),
                    e.getInicioEm(), e.getFimEm(), e.getLocalNome(), e.getLocalEndereco(),
                    e.getLocalMapaUrl(), e.getCapacidade(), e.getInscricaoAbreEm(),
                    e.getInscricaoFechaEm(), e.isInscricaoPorEquipe(), e.getCapaUrl(),
                    e.getPublicadoEm(), confirmados, espera);
        }
    }

    /** Card de listagem. */
    public record EventoResumo(
            UUID id,
            String slug,
            String titulo,
            TipoDeEvento tipo,
            String modalidade,
            StatusDoEvento status,
            Visibilidade visibilidade,
            OffsetDateTime inicioEm,
            String localNome,
            String capaUrl
    ) {
        public static EventoResumo de(Evento e) {
            return new EventoResumo(e.getId(), e.getSlug(), e.getTitulo(), e.getTipo(),
                    e.getModalidade(), e.getStatus(), e.getVisibilidade(), e.getInicioEm(),
                    e.getLocalNome(), e.getCapaUrl());
        }
    }

    /**
     * A página que abre a partir do link do WhatsApp.
     *
     * <p>Não traz a lista de inscritos: nome de quem vai a uma festa não é
     * informação pública. Traz o número, que é o que responde "ainda tem
     * vaga?".</p>
     */
    public record EventoPublico(
            // O id é exposto porque a página pública precisa dele para
            // montar a chamada de inscrição. A chave é UUID justamente para
            // isso: não dá para enumerar eventos de outra atlética a partir
            // dela, ao contrário de um id sequencial.
            UUID id,
            String atleticaSlug,
            String atleticaNome,
            String atleticaBrasaoUrl,
            String slug,
            String titulo,
            String descricao,
            TipoDeEvento tipo,
            String modalidade,
            StatusDoEvento status,
            OffsetDateTime inicioEm,
            OffsetDateTime fimEm,
            String localNome,
            String localEndereco,
            String localMapaUrl,
            String capaUrl,
            Integer capacidade,
            Integer vagasRestantes,
            long inscritosConfirmados,
            boolean inscricaoAberta,
            String motivoDoFechamento,
            OffsetDateTime inscricaoAbreEm,
            OffsetDateTime inscricaoFechaEm
    ) {
    }

    public record NovaInscricao(
            @Size(max = 500, message = "a observação cabe em 500 caracteres")
            String observacao,

            /*
             * Por qual atlética a pessoa está entrando. Opcional: quem tem um
             * vínculo só não precisa escolher. É o que alimenta a contagem
             * "quantos vieram de cada atlética" num interatlética, e por isso
             * quem tem vínculo em várias precisa dizer — adivinhar produziria
             * um número errado com cara de certo.
             */
            @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "atlética inválida")
            @Size(max = 60)
            String atleticaDeOrigem
    ) {
    }

    /** O comprovante de quem se inscreveu, com o conteúdo do QR de entrada. */
    public record InscricaoResposta(
            UUID id,
            StatusDaInscricao status,
            Integer posicaoEspera,
            String checkinToken,
            OffsetDateTime checkinEm,
            OffsetDateTime criadoEm,
            String eventoTitulo,
            OffsetDateTime eventoInicioEm
    ) {
        public static InscricaoResposta de(Inscricao i) {
            return new InscricaoResposta(i.getId(), i.getStatus(), i.getPosicaoEspera(),
                    i.getCheckinToken(), i.getCheckinEm(), i.getCriadoEm(),
                    i.getEvento().getTitulo(), i.getEvento().getInicioEm());
        }
    }

    /**
     * Uma linha da lista de presença. É o que substitui a planilha: nome,
     * contato, de onde veio e se entrou.
     */
    public record ParticipanteResposta(
            UUID inscricaoId,
            UUID usuarioId,
            String nome,
            String email,
            String telefone,
            UUID atleticaDeOrigem,
            StatusDaInscricao status,
            Integer posicaoEspera,
            String observacao,
            OffsetDateTime inscritoEm,
            OffsetDateTime checkinEm
    ) {
        public static ParticipanteResposta de(Inscricao i) {
            var usuario = i.getUsuario();
            return new ParticipanteResposta(
                    i.getId(),
                    usuario != null ? usuario.getId() : null,
                    usuario != null ? usuario.getNome() : null,
                    usuario != null ? usuario.getEmail() : null,
                    usuario != null ? usuario.getTelefone() : null,
                    i.getAtleticaDeOrigem(),
                    i.getStatus(),
                    i.getPosicaoEspera(),
                    i.getObservacao(),
                    i.getCriadoEm(),
                    i.getCheckinEm());
        }
    }

    /** Resultado da leitura do QR na portaria. */
    public record ResultadoDoCheckin(
            boolean liberado,
            String mensagem,
            String nome,
            StatusDaInscricao status,
            OffsetDateTime checkinEm
    ) {
    }
}
