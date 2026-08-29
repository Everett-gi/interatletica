package br.com.interatletica.atletica;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioDeAtletica extends JpaRepository<Atletica, UUID> {

    @Query("select a from Atletica a where a.slug = :slug")
    Optional<Atletica> porSlug(@Param("slug") String slug);

    @Query("select a.id from Atletica a where a.slug = :slug")
    Optional<UUID> idPorSlug(@Param("slug") String slug);

    @Query("select count(a) > 0 from Atletica a where a.slug = :slug")
    boolean slugEmUso(@Param("slug") String slug);

    /** Vitrine da plataforma: só atléticas operantes, em ordem alfabética. */
    @Query("select a from Atletica a where a.situacao = br.com.interatletica.atletica.SituacaoAtletica.ATIVA order by a.nome")
    List<Atletica> ativas();
}
