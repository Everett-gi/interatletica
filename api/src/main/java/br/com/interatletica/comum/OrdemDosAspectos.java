package br.com.interatletica.comum;

/**
 * Ordem dos interceptadores que envolvem os serviços.
 *
 * <p>No Spring AOP, advisors são ordenados por valor CRESCENTE e quem tem o
 * MENOR valor roda por FORA. A cadeia resultante, do mais externo para o
 * mais interno, precisa ser esta:</p>
 *
 * <pre>
 *   segurança de método  (@PreAuthorize, ~100–600 do Spring Security)
 *     └─ transação       ({@link #TRANSACAO})
 *          └─ filtro de atlética ({@link #FILTRO_DE_ATLETICA})
 *               └─ o método
 * </pre>
 *
 * <p><strong>Por que a transação precisa ficar por fora do filtro.</strong>
 * O filtro do Hibernate vive na {@code Session}, e a {@code Session} só
 * existe depois que a transação abre. Com o filtro por fora, o aspecto
 * chamaria {@code unwrap(Session.class)} sem transação ativa: o
 * {@code EntityManager} compartilhado do Spring criaria uma sessão
 * temporária, o filtro seria ligado nela, e ela seria descartada. A
 * transação de verdade abriria em seguida, com sessão limpa e sem filtro —
 * e toda consulta passaria a devolver dados de todas as atléticas, sem erro
 * nenhum.</p>
 *
 * <p><strong>Por que a segurança precisa ficar por fora da transação.</strong>
 * Autorização negada não deve abrir transação. Os interceptadores de
 * {@code @PreAuthorize} do Spring Security ficam abaixo de 1000, então
 * {@link #TRANSACAO} acima desse patamar preserva essa relação.</p>
 *
 * <p>{@code OrdemDoFiltroDeAtleticaTest} trava essa invariante: mexer nos
 * números sem entender o efeito quebra o build em vez de vazar dado.</p>
 */
public final class OrdemDosAspectos {

    private OrdemDosAspectos() {
    }

    /**
     * Acima dos interceptadores de segurança de método do Spring Security,
     * para que a autorização continue rodando antes de abrir transação.
     *
     * <p>O padrão do Spring é {@code Ordered.LOWEST_PRECEDENCE}, que tornaria
     * a transação o interceptador mais interno de todos — e não deixaria
     * espaço para o filtro de atlética rodar dentro dela.</p>
     */
    public static final int TRANSACAO = 1000;

    /** Logo dentro da transação, onde a {@code Session} já existe. */
    public static final int FILTRO_DE_ATLETICA = 1100;
}
