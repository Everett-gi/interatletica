package br.com.interatletica.evento;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.EnumType;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Quais atléticas organizam um evento. Interatlética, copa entre faculdades,
 * festa em parceria.
 *
 * <p><strong>Não estende {@code EntidadeDeAtletica} de propósito.</strong> O
 * {@code atletica_id} daqui é a atlética CO-ORGANIZADORA, não a dona da
 * linha. Ligar o filtro faria a anfitriã, ao listar quem organiza o próprio
 * evento, enxergar apenas a si mesma — que é o contrário do que a tabela
 * existe para responder.</p>
 *
 * <p>A anfitriã também aparece aqui, com papel ANFITRIA, para que "eventos de
 * que participo" seja uma consulta só, sem UNION com {@code evento}.</p>
 */
@Entity
@Table(name = "evento_organizador")
public class EventoOrganizador {

    @EmbeddedId
    private Id id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PapelDeOrganizador papel = PapelDeOrganizador.COORGANIZADORA;

    /**
     * Coorganizar é convite, não imposição: a atlética convidada precisa
     * aceitar. Nulo enquanto ela não respondeu — sem isso, qualquer atlética
     * poderia pendurar o nome de outra no próprio evento.
     */
    @Column(name = "aceito_em")
    private OffsetDateTime aceitoEm;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected EventoOrganizador() {
    }

    public EventoOrganizador(UUID eventoId, UUID atleticaId, PapelDeOrganizador papel) {
        this.id = new Id(eventoId, atleticaId);
        this.papel = papel;
        // A anfitriã não convida a si mesma: já entra aceita.
        this.aceitoEm = papel == PapelDeOrganizador.ANFITRIA ? OffsetDateTime.now() : null;
    }

    public void aceitar() {
        this.aceitoEm = OffsetDateTime.now();
    }

    public boolean aceitou() {
        return aceitoEm != null;
    }

    public UUID getEventoId() {
        return id.eventoId;
    }

    public UUID getAtleticaId() {
        return id.atleticaId;
    }

    public PapelDeOrganizador getPapel() {
        return papel;
    }

    public OffsetDateTime getAceitoEm() {
        return aceitoEm;
    }

    @Embeddable
    public static class Id implements Serializable {

        @Column(name = "evento_id", nullable = false)
        private UUID eventoId;

        @Column(name = "atletica_id", nullable = false)
        private UUID atleticaId;

        protected Id() {
        }

        public Id(UUID eventoId, UUID atleticaId) {
            this.eventoId = eventoId;
            this.atleticaId = atleticaId;
        }

        @Override
        public boolean equals(Object outro) {
            if (this == outro) {
                return true;
            }
            return outro instanceof Id id
                    && Objects.equals(eventoId, id.eventoId)
                    && Objects.equals(atleticaId, id.atleticaId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(eventoId, atleticaId);
        }
    }
}
