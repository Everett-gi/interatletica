package br.com.interatletica;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.logging.Logger;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Sobe o contexto inteiro sem banco nenhum.
 *
 * <p>Parece um teste que não testa nada. Não é: subir o contexto obriga o
 * Spring Data JPA a <strong>compilar toda {@code @Query} do projeto</strong>
 * contra o metamodelo do Hibernate. Um {@code i.usuario.nome} escrito como
 * {@code i.usuario.name}, um literal de enum com o pacote errado, um
 * {@code join fetch} em associação que não existe — nada disso é erro de
 * compilação Java, e todos derrubam a aplicação no primeiro startup em
 * produção. Aqui derrubam o build.</p>
 *
 * <p>O mesmo vale para o grafo de beans: dependência circular entre serviços
 * e {@code @Component} sem construtor satisfeito aparecem aqui, não no
 * deploy.</p>
 *
 * <p><strong>O que este teste NÃO cobre:</strong> se as entidades batem com
 * o schema real. Isso é papel do {@code ddl-auto: validate} contra Postgres
 * de verdade, exercitado nos testes com Testcontainers — que precisam de
 * Docker. Este teste roda em qualquer máquina, inclusive sem Docker, e é a
 * primeira linha de defesa; não a única.</p>
 */
@SpringBootTest(properties = {
        // Nada pode tentar abrir conexão: Flyway e a leitura de metadados do
        // JDBC são justamente os dois que tentariam.
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false",
        "spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect",
        "spring.datasource.url=jdbc:postgresql://inexistente:5432/nada",
        "spring.datasource.username=ninguem",
        "spring.datasource.password=nenhuma",
        "GOOGLE_CLIENT_ID=id-de-teste",
        "GOOGLE_CLIENT_SECRET=segredo-de-teste"
})
class ContextoDaAplicacaoTest {

    @Autowired
    private ApplicationContext contexto;

    @Test
    @DisplayName("o contexto sobe, com todas as consultas e todos os beans válidos")
    void contextoSobe() {
        assertNotNull(contexto);
    }

    @Test
    @DisplayName("os repositórios existem — é o que prova que as @Query foram compiladas")
    void repositoriosForamCriados() {
        // Se o Spring Data tivesse desistido de criar os proxies, o teste
        // acima passaria mesmo assim e a validação das consultas não teria
        // acontecido.
        var repositorios = contexto.getBeanNamesForType(
                org.springframework.data.repository.Repository.class);

        assertTrue(repositorios.length >= 6,
                "esperava os repositórios de usuário, convite, atlética, membro, evento, "
                        + "inscrição e organizador; encontrei " + repositorios.length);
    }

    /**
     * DataSource que nunca conecta. Substitui o Hikari inteiro: um pool real
     * tentaria abrir conexão ao subir e o teste falharia por falta de banco,
     * em vez de verificar o que veio verificar.
     */
    @TestConfiguration
    static class SemBanco {

        @Bean
        @Primary
        DataSource dataSource() {
            return new DataSource() {
                @Override
                public Connection getConnection() throws SQLException {
                    throw new SQLException("Este teste roda sem banco, de propósito.");
                }

                @Override
                public Connection getConnection(String usuario, String senha) throws SQLException {
                    return getConnection();
                }

                @Override
                public PrintWriter getLogWriter() {
                    return null;
                }

                @Override
                public void setLogWriter(PrintWriter out) {
                }

                @Override
                public void setLoginTimeout(int segundos) {
                }

                @Override
                public int getLoginTimeout() {
                    return 0;
                }

                @Override
                public Logger getParentLogger() {
                    return Logger.getGlobal();
                }

                @Override
                public <T> T unwrap(Class<T> tipo) throws SQLException {
                    throw new SQLException("sem banco");
                }

                @Override
                public boolean isWrapperFor(Class<?> tipo) {
                    return false;
                }
            };
        }
    }
}
