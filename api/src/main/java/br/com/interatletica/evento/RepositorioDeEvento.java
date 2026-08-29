package br.com.interatletica.evento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Toda consulta cruza {@code atleticaId} explicitamente, mesmo com o filtro
 * do Hibernate ligado nas rotas de tenant. As rotas públicas
 * ({@code /api/publico/...}) rodam SEM atlética no contexto — lá o filtro
 * está desligado, e o {@code atleticaId} do parâmetro é o que impede a
 * página pública de uma atlética de servir o evento de outra.
 */
public interface RepositorioDeEvento extends JpaRepository<Evento, UUID> {

    @Query("select e from Evento e where e.atleticaId = :atleticaId and e.slug = :slug")
    Optional<Evento> porSlug(@Param("atleticaId") UUID atleticaId, @Param("slug") String slug);

    @Query("select count(e) > 0 from Evento e where e.atleticaId = :atleticaId and e.slug = :slug")
    boolean slugEmUso(@Param("atleticaId") UUID atleticaId, @Param("slug") String slug);

    @Query("select e from Evento e where e.id = :id and e.atleticaId = :atleticaId")
    Optional<Evento> porIdDaAtletica(@Param("id") UUID id, @Param("atleticaId") UUID atleticaId);

    /** Painel da diretoria: tudo, inclusive rascunho, do mais próximo ao mais distante. */
    @Query("""
            select e from Evento e
             where e.atleticaId = :atleticaId
             order by e.inicioEm desc
            """)
    List<Evento> daAtletica(@Param("atleticaId") UUID atleticaId);

    /**
     * Agenda pública de uma atlética: só o que está publicado e ainda não
     * aconteceu. Eventos INTERNOS ficam de fora — é a linha que impede a
     * reunião de diretoria de aparecer no link do Instagram.
     */
    @Query("""
            select e from Evento e
             where e.atleticaId = :atleticaId
               and e.status = br.com.interatletica.evento.StatusDoEvento.PUBLICADO
               and e.visibilidade <> br.com.interatletica.evento.Visibilidade.INTERNO
               and (e.fimEm is null and e.inicioEm >= :desde
                    or e.fimEm is not null and e.fimEm >= :desde)
             order by e.inicioEm
            """)
    List<Evento> agendaPublica(@Param("atleticaId") UUID atleticaId,
                               @Param("desde") OffsetDateTime desde);

    /** O que já passou, para a página de histórico da atlética. */
    @Query("""
            select e from Evento e
             where e.atleticaId = :atleticaId
               and e.status in (br.com.interatletica.evento.StatusDoEvento.PUBLICADO,
                                br.com.interatletica.evento.StatusDoEvento.ENCERRADO)
               and e.visibilidade <> br.com.interatletica.evento.Visibilidade.INTERNO
               and (e.fimEm is null and e.inicioEm < :ate
                    or e.fimEm is not null and e.fimEm < :ate)
             order by e.inicioEm desc
            """)
    List<Evento> realizados(@Param("atleticaId") UUID atleticaId,
                            @Param("ate") OffsetDateTime ate);
}
