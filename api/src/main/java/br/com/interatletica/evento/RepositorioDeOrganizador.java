package br.com.interatletica.evento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioDeOrganizador
        extends JpaRepository<EventoOrganizador, EventoOrganizador.Id> {

    @Query("select o from EventoOrganizador o where o.id.eventoId = :eventoId")
    List<EventoOrganizador> doEvento(@Param("eventoId") UUID eventoId);

    @Query("""
            select o from EventoOrganizador o
             where o.id.eventoId = :eventoId
               and o.id.atleticaId = :atleticaId
            """)
    Optional<EventoOrganizador> doVinculo(@Param("eventoId") UUID eventoId,
                                          @Param("atleticaId") UUID atleticaId);

    /**
     * Eventos em que a atlética participa de alguma forma — inclusive os que
     * ela mesma organiza, porque a anfitriã também tem linha aqui. É o que
     * evita um UNION entre {@code evento} e {@code evento_organizador} na
     * tela mais visitada do app.
     */
    @Query("""
            select o.id.eventoId from EventoOrganizador o
             where o.id.atleticaId = :atleticaId
               and o.aceitoEm is not null
            """)
    List<UUID> eventosDaAtletica(@Param("atleticaId") UUID atleticaId);
}
