package br.com.interatletica;

import br.com.interatletica.comum.tenant.EntidadeDeAtletica;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import org.hibernate.annotations.Filter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Teste arquitetural do isolamento entre atléticas.
 *
 * <p>O filtro do Hibernate não é herdado de uma {@code @MappedSuperclass}:
 * cada entidade concreta precisa declarar o seu {@code @Filter}. Esquecer
 * essa anotação não gera erro de compilação, não gera exceção em runtime e
 * não aparece em teste funcional — a consulta simplesmente devolve os dados
 * de todas as atléticas.</p>
 *
 * <p>Este teste transforma esse esquecimento silencioso em build vermelho.
 * É a defesa mais barata que existe contra o único bug capaz de matar a
 * plataforma politicamente: uma atlética enxergar os dados de outra.</p>
 */
class IsolamentoDeAtleticaTest {

    private static final String PACOTE_RAIZ = "br.com.interatletica";

    /**
     * Entidades que têm {@code atletica_id} mas NÃO são escopadas por
     * atlética. Cada uma precisa de um motivo escrito aqui: a lista existe
     * para forçar a decisão a ser consciente, não para abrir exceções.
     *
     * <ul>
     *   <li><strong>Inscricao</strong> — o {@code atletica_id} é a atlética
     *       de ORIGEM do inscrito, não a dona do evento. Filtrar por ele
     *       esconderia da anfitriã justamente os inscritos de fora, que é o
     *       que um interatlética existe para receber. O escopo vem do
     *       {@code evento_id}.</li>
     *   <li><strong>EventoOrganizador</strong> — o {@code atletica_id} é a
     *       coorganizadora. Com o filtro ligado, a anfitriã listando quem
     *       organiza o próprio evento enxergaria apenas a si mesma.</li>
     * </ul>
     */
    private static final Set<String> ESCOPADAS_PELO_PAI =
            Set.of("Inscricao", "EventoOrganizador");

    @Test
    @DisplayName("toda entidade de atlética declara o filtro de isolamento")
    void todaEntidadeDeAtleticaDeclaraFiltro() throws ClassNotFoundException {
        List<String> semFiltro = new ArrayList<>();
        List<String> comCondicaoErrada = new ArrayList<>();

        for (Class<?> entidade : entidadesMapeadas()) {
            if (!EntidadeDeAtletica.class.isAssignableFrom(entidade)) {
                continue;
            }

            Filter filtro = entidade.getAnnotation(Filter.class);
            if (filtro == null || !EntidadeDeAtletica.FILTRO.equals(filtro.name())) {
                semFiltro.add(entidade.getSimpleName());
                continue;
            }
            if (!filtro.condition().replace(" ", "").contains("atletica_id=:atleticaId")) {
                comCondicaoErrada.add(entidade.getSimpleName());
            }
        }

        assertTrue(semFiltro.isEmpty(), """
                Entidades que herdam de EntidadeDeAtletica sem declarar o filtro: %s

                Adicione na classe:
                  @Filter(name = EntidadeDeAtletica.FILTRO, condition = "atletica_id = :atleticaId")
                """.formatted(semFiltro));

        assertTrue(comCondicaoErrada.isEmpty(),
                "Entidades com condição de filtro divergente do padrão: " + comCondicaoErrada);
    }

    /**
     * O caminho de fuga do teste acima: declarar {@code atletica_id} na
     * própria entidade em vez de herdar de {@link EntidadeDeAtletica}.
     *
     * <p>A entidade fica multi-tenant no banco e sem filtro nenhum no
     * código, e o primeiro teste — que só olha quem herda — passa. Quem
     * escrever isso não estará burlando nada de propósito: é o que acontece
     * naturalmente ao copiar uma entidade existente e trocar os campos.</p>
     */
    @Test
    @DisplayName("entidade com atletica_id ou herda a superclasse ou está na lista de exceções")
    void entidadeComColunaDeAtleticaEscolheUmDosDoisCaminhos() throws ClassNotFoundException {
        List<String> soltas = new ArrayList<>();

        for (Class<?> entidade : entidadesMapeadas()) {
            if (EntidadeDeAtletica.class.isAssignableFrom(entidade)
                    || ESCOPADAS_PELO_PAI.contains(entidade.getSimpleName())) {
                continue;
            }
            if (temColunaDeAtletica(entidade)) {
                soltas.add(entidade.getSimpleName());
            }
        }

        assertTrue(soltas.isEmpty(), """
                Entidades com atletica_id que não estendem EntidadeDeAtletica: %s

                Escolha um dos dois:
                  1. estender EntidadeDeAtletica e declarar o @Filter; ou
                  2. entrar em ESCOPADAS_PELO_PAI, neste arquivo, COM a
                     justificativa de por que o filtro seria errado ali.
                """.formatted(soltas));
    }

    /**
     * Uma varredura que não encontra nada faz os dois testes acima passarem
     * sem verificar coisa alguma. Já aconteceu de o pacote raiz mudar e a
     * suíte continuar verde por semanas — este teste é o que impede o
     * isolamento de ficar sem guarda em silêncio.
     */
    @Test
    @DisplayName("a varredura de entidades realmente encontra entidades")
    void varreduraNaoEstaVazia() throws ClassNotFoundException {
        List<Class<?>> entidades = entidadesMapeadas();

        assertFalse(entidades.isEmpty(),
                "Nenhuma @Entity encontrada em " + PACOTE_RAIZ
                        + ". Os testes de isolamento estariam passando sem verificar nada.");

        boolean algumaEscopada = entidades.stream()
                .anyMatch(EntidadeDeAtletica.class::isAssignableFrom);
        assertTrue(algumaEscopada,
                "Nenhuma entidade estende EntidadeDeAtletica. Ou o modelo mudou de forma, "
                        + "ou a varredura está olhando para o lugar errado.");
    }

    private boolean temColunaDeAtletica(Class<?> entidade) {
        for (Class<?> nivel = entidade; nivel != null && nivel != Object.class;
             nivel = nivel.getSuperclass()) {
            for (Field campo : nivel.getDeclaredFields()) {
                Column coluna = campo.getAnnotation(Column.class);
                if (coluna != null && "atletica_id".equals(coluna.name())) {
                    return true;
                }
                if (campo.getName().equals("atleticaId")) {
                    return true;
                }
            }
        }
        return false;
    }

    private List<Class<?>> entidadesMapeadas() throws ClassNotFoundException {
        var scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));

        List<Class<?>> classes = new ArrayList<>();
        for (BeanDefinition definicao : scanner.findCandidateComponents(PACOTE_RAIZ)) {
            classes.add(Class.forName(definicao.getBeanClassName()));
        }
        return classes;
    }
}
