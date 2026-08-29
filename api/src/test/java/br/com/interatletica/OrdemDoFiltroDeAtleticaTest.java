package br.com.interatletica;

import br.com.interatletica.comum.tenant.AtivadorFiltroAtletica;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.OrderUtils;
import org.springframework.transaction.interceptor.BeanFactoryTransactionAttributeSourceAdvisor;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifica que o aspecto que liga o filtro de atlética roda DENTRO da
 * transação, e não em volta dela.
 *
 * <p>É uma invariante estrutural, não uma questão de banco — por isso este
 * teste roda em qualquer máquina, sem Docker.</p>
 *
 * <p><strong>Por que isso decide se o multi-tenant funciona.</strong> O
 * filtro do Hibernate vive na {@code Session}, e a {@code Session} só existe
 * depois que a transação abre. Se o aspecto rodar por fora, ele chama
 * {@code entityManager.unwrap(Session.class)} sem transação ativa: o
 * {@code EntityManager} compartilhado do Spring cria uma sessão temporária,
 * o filtro é ligado nela, e ela é descartada. A transação de verdade abre
 * em seguida, com uma sessão limpa — <em>sem filtro</em>.</p>
 *
 * <p>O sintoma seria o pior possível: nenhum erro, nenhuma exceção, e toda
 * consulta devolvendo dados de todas as atléticas. É exatamente a falha
 * silenciosa que o teste arquitetural de {@code @Filter} não consegue
 * enxergar — ele confere se a anotação existe, não se ela chega a valer.</p>
 *
 * <p><strong>Regra de ordenação do Spring AOP:</strong> advisors são
 * ordenados por {@code order} crescente, e quem tem o MENOR valor roda por
 * fora. Logo, para ficar por dentro da transação, o aspecto precisa de um
 * valor MAIOR que o do advisor transacional.</p>
 */
@SpringBootTest(properties = {
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
class OrdemDoFiltroDeAtleticaTest {

    @Autowired
    private ApplicationContext contexto;

    @Test
    @DisplayName("o aspecto do filtro roda por dentro do proxy transacional")
    void filtroRodaDentroDaTransacao() {
        int ordemDoFiltro = OrderUtils.getOrder(
                AtivadorFiltroAtletica.class, Ordered.LOWEST_PRECEDENCE);

        int ordemDaTransacao = contexto
                .getBean(BeanFactoryTransactionAttributeSourceAdvisor.class)
                .getOrder();

        assertTrue(ordemDoFiltro > ordemDaTransacao, """
                O aspecto de tenant está POR FORA da transação.

                  ordem do AtivadorFiltroAtletica: %d
                  ordem do advisor transacional:   %d

                No Spring AOP, MENOR ordem roda por FORA. Com o aspecto por
                fora, ele liga o filtro numa sessão temporária que é
                descartada antes de a transação abrir — e toda consulta passa
                a devolver dados de TODAS as atléticas, sem erro nenhum.

                Correção: fazer a ordem do aspecto ser maior que a do advisor
                transacional. Como o padrão do advisor é Integer.MAX_VALUE,
                isso exige baixá-lo explicitamente com
                @EnableTransactionManagement(order = ...).
                """.formatted(ordemDoFiltro, ordemDaTransacao));
    }
}
