package br.com.interatletica.atletica;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Toda consulta declara {@code atletica_id} explicitamente, mesmo com o
 * filtro do Hibernate ligado. Redundância proposital: se o filtro falhar
 * em ligar, a consulta de permissão continua correta — e é justamente a de
 * permissão que não pode errar.
 */
public interface RepositorioDeMembro extends JpaRepository<Membro, UUID> {

    @Query("""
            select m from Membro m
             where m.atleticaId = :atleticaId
               and m.usuario.id = :usuarioId
            """)
    Optional<Membro> doVinculo(@Param("atleticaId") UUID atleticaId,
                               @Param("usuarioId") UUID usuarioId);

    @Query("""
            select m from Membro m
              join fetch m.usuario
             where m.atleticaId = :atleticaId
               and m.situacao = br.com.interatletica.atletica.SituacaoMembro.ATIVO
             order by m.papel, m.usuario.nome
            """)
    List<Membro> ativosDaAtletica(@Param("atleticaId") UUID atleticaId);

    @Query("""
            select m from Membro m
              join fetch m.usuario
             where m.atleticaId = :atleticaId
             order by m.situacao, m.papel, m.usuario.nome
            """)
    List<Membro> todosDaAtletica(@Param("atleticaId") UUID atleticaId);

    /** Atléticas em que o usuário tem vínculo ativo — o seletor do topo do app. */
    @Query("""
            select m from Membro m
             where m.usuario.id = :usuarioId
               and m.situacao = br.com.interatletica.atletica.SituacaoMembro.ATIVO
            """)
    List<Membro> vinculosAtivosDoUsuario(@Param("usuarioId") UUID usuarioId);

    /**
     * Ids das atléticas em que a pessoa tem vínculo ativo — deliberadamente
     * ENTRE atléticas.
     *
     * <p>É consulta nativa por um motivo específico: o {@code @Filter} do
     * Hibernate se aplica a HQL e a associações, mas não a SQL nativo. Dentro
     * de uma rota {@code /api/a/{slug}/...} o filtro está ligado, e a mesma
     * pergunta em HQL devolveria só o vínculo com a atlética anfitriã —
     * silenciosamente, sem erro.</p>
     *
     * <p>Quem chama precisa disso justamente para saber de qual atlética a
     * pessoa VEM: alguém do Dragões se inscrevendo num interatlética do
     * Leões não tem vínculo com o anfitrião, e é essa a informação que a
     * coluna {@code inscricao.atletica_id} guarda.</p>
     */
    @Query(value = """
            SELECT m.atletica_id
              FROM membro m
             WHERE m.usuario_id = :usuarioId
               AND m.situacao = 'ATIVO'
            """, nativeQuery = true)
    List<UUID> idsDasAtleticasComVinculoAtivo(@Param("usuarioId") UUID usuarioId);

    /**
     * Impede que o último presidente seja rebaixado ou desligado, o que
     * deixaria a atlética sem ninguém capaz de convidar ou promover.
     */
    @Query("""
            select count(m) from Membro m
             where m.atleticaId = :atleticaId
               and m.papel = br.com.interatletica.atletica.Papel.PRESIDENTE
               and m.situacao = br.com.interatletica.atletica.SituacaoMembro.ATIVO
            """)
    long presidentesAtivos(@Param("atleticaId") UUID atleticaId);
}
