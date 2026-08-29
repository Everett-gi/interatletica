package br.com.interatletica.identidade;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * As consultas são declaradas com {@code @Query} em vez de derivadas do nome
 * do método. O Spring Data só deriva a partir de nomes em inglês
 * ({@code findByEmail}); manter o vocabulário do domínio em português vale
 * o custo de escrever a JPQL — que fica explícita e revisável.
 */
public interface RepositorioDeUsuario extends JpaRepository<Usuario, UUID> {

    @Query("select u from Usuario u where u.provedorSub = :sub")
    Optional<Usuario> porProvedorSub(@Param("sub") String provedorSub);

    @Query("select u from Usuario u where lower(u.email) = lower(:email)")
    Optional<Usuario> porEmail(@Param("email") String email);
}
