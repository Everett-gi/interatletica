package br.com.interatletica.comum.tenant;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.util.UUID;

/**
 * Superclasse de toda entidade que pertence a uma atlética.
 *
 * <p>Define o filtro do Hibernate uma única vez. Cada entidade concreta
 * precisa declarar:</p>
 *
 * <pre>
 * &#64;Entity
 * &#64;Filter(name = EntidadeDeAtletica.FILTRO, condition = "atletica_id = :atleticaId")
 * public class Evento extends EntidadeDeAtletica { ... }
 * </pre>
 *
 * <p>O {@code @Filter} precisa ficar na entidade concreta — o Hibernate não
 * o herda de uma MappedSuperclass. O teste
 * {@code IsolamentoDeAtleticaTest} varre o classpath e falha o build se
 * alguma entidade herdar daqui sem declarar o filtro, para que ninguém
 * dependa de lembrar disso numa revisão de PR.</p>
 */
@MappedSuperclass
@FilterDef(
        name = EntidadeDeAtletica.FILTRO,
        parameters = @ParamDef(name = "atleticaId", type = UUID.class)
)
public abstract class EntidadeDeAtletica {

    public static final String FILTRO = "filtroAtletica";

    @Column(name = "atletica_id", nullable = false, updatable = false)
    private UUID atleticaId;

    public UUID getAtleticaId() {
        return atleticaId;
    }

    public void setAtleticaId(UUID atleticaId) {
        this.atleticaId = atleticaId;
    }
}
