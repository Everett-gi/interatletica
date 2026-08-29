package br.com.interatletica;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Sobe a aplicação contra um PostgreSQL de verdade.
 *
 * <p>É o único teste que responde a pergunta mais perigosa do projeto:
 * <strong>as entidades JPA batem com o schema da migration?</strong> Com
 * {@code ddl-auto: validate}, uma divergência não é aviso — a aplicação não
 * sobe. E como o Hibernate nunca altera tabela, esse erro só aparece no
 * primeiro startup do ambiente que tem banco. Aqui ele aparece no build.</p>
 *
 * <p>Só o fato de o contexto subir já prova três coisas: o Flyway aplicou a
 * migration inteira sem erro de SQL, o Hibernate validou todas as entidades
 * contra as tabelas resultantes, e os tipos que não têm mapeamento óbvio —
 * {@code JSONB}, {@code INET}, índice parcial — não atrapalharam.</p>
 *
 * <p><strong>Pulado quando não há Docker.</strong> A máquina de
 * desenvolvimento do projeto não tem, e fazer o build inteiro falhar por
 * causa disso ensinaria a rodar {@code mvn test -DskipTests} — que é como se
 * perde uma suíte. No CI o Docker existe e o teste roda de verdade; é lá que
 * ele precisa passar.</p>
 */
@SpringBootTest(properties = {
        "GOOGLE_CLIENT_ID=id-de-teste",
        "GOOGLE_CLIENT_SECRET=segredo-de-teste"
})
@Testcontainers
@EnabledIf("dockerDisponivel")
class SchemaCompativelTest {

    /**
     * Mesma imagem do docker-compose. Testar contra uma versão diferente da
     * que roda em produção esconderia justamente as diferenças de versão.
     */
    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    static boolean dockerDisponivel() {
        return DockerClientFactory.instance().isDockerAvailable();
    }

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    @DisplayName("o contexto sobe: Flyway aplicou e o Hibernate validou as entidades")
    void entidadesBatemComOSchema() {
        // Chegar até aqui já é o resultado. A consulta confirma que a
        // conexão é utilizável, e não só que o pool foi construído.
        Integer um = jdbc.queryForObject("SELECT 1", Integer.class);

        assertEquals(1, um);
    }

    @Test
    @DisplayName("a migration criou as 16 tabelas do modelo")
    void migrationCriouAsTabelas() {
        // Guarda contra uma migration que aplica pela metade sem erro — o
        // que acontece se alguém dividir o arquivo e esquecer um pedaço.
        List<String> esperadas = List.of(
                "usuario", "convite", "atletica", "membro",
                "evento", "evento_organizador", "inscricao",
                "equipe", "equipe_membro",
                "torneio", "torneio_participante", "partida", "partida_parcial",
                "tarefa", "aviso", "registro_auditoria");

        List<String> existentes = jdbc.queryForList(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public'", String.class);

        for (String tabela : esperadas) {
            assertTrue(existentes.contains(tabela), "faltou a tabela " + tabela);
        }
    }

    @Test
    @DisplayName("o índice único parcial de inscrição existe — é ele que permite reinscrever")
    void indiceParcialDeInscricaoExiste() {
        // Sem o WHERE status <> 'CANCELADA', quem cancela nunca mais
        // consegue se inscrever no mesmo evento. O índice é a regra de
        // negócio; se ele virar um único total numa migration futura, o
        // sintoma seria "não consigo me inscrever de novo" sem erro claro.
        List<String> definicao = jdbc.queryForList(
                "SELECT indexdef FROM pg_indexes WHERE indexname = 'uk_inscricao_usuario'",
                String.class);

        assertEquals(1, definicao.size(), "índice uk_inscricao_usuario não encontrado");
        assertTrue(definicao.get(0).contains("CANCELADA"),
                "o índice deixou de ser parcial: " + definicao.get(0));
    }

    @Test
    @DisplayName("a auditoria aceita JSONB e INET pelos casts do SQL")
    void auditoriaGravaTiposEspeciais() {
        // Auditoria escreve por SQL, com cast explícito, justamente porque
        // esses dois tipos não têm mapeamento óbvio em JPA. Este teste
        // exercita o caminho real de escrita.
        jdbc.update("""
                INSERT INTO registro_auditoria (acao, entidade, detalhe, ip)
                VALUES (?, ?, cast(? as jsonb), cast(? as inet))
                """, "TESTE", "nada", "{\"chave\":\"valor\"}", "192.168.0.1");

        Integer total = jdbc.queryForObject(
                "SELECT count(*) FROM registro_auditoria WHERE acao = 'TESTE'", Integer.class);

        assertEquals(1, total);
    }
}
