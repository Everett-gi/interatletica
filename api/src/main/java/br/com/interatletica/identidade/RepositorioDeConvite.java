package br.com.interatletica.identidade;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioDeConvite extends JpaRepository<Convite, UUID> {

    /**
     * Busca global por token. Quem aceita o convite ainda não tem vínculo
     * com a atlética, e a rota de aceite não carrega slug — o chamador
     * suspende o filtro de atlética explicitamente.
     */
    @Query("select c from Convite c where c.token = :token")
    Optional<Convite> porToken(@Param("token") String token);

    @Query("""
            select c from Convite c
             where c.atleticaId = :atleticaId
               and c.aceitoEm is null
               and c.revogadoEm is null
               and c.expiraEm > :agora
             order by c.criadoEm desc
            """)
    List<Convite> pendentesDaAtletica(@Param("atleticaId") UUID atleticaId,
                                      @Param("agora") OffsetDateTime agora);

    @Query("""
            select c from Convite c
             where c.atleticaId = :atleticaId
               and lower(c.email) = lower(:email)
               and c.aceitoEm is null
               and c.revogadoEm is null
               and c.expiraEm > :agora
            """)
    Optional<Convite> pendentePara(@Param("atleticaId") UUID atleticaId,
                                   @Param("email") String email,
                                   @Param("agora") OffsetDateTime agora);

    /**
     * Convites pendentes de uma pessoa em qualquer atlética — a caixa de
     * entrada que ela vê ao logar. Atendida pelo índice parcial
     * {@code ix_convite_pendente (email) WHERE aceito_em IS NULL AND revogado_em IS NULL}.
     */
    @Query("""
            select c from Convite c
             where lower(c.email) = lower(:email)
               and c.aceitoEm is null
               and c.revogadoEm is null
               and c.expiraEm > :agora
             order by c.criadoEm desc
            """)
    List<Convite> pendentesDoEmail(@Param("email") String email,
                                   @Param("agora") OffsetDateTime agora);
}
