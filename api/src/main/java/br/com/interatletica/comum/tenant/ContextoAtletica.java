package br.com.interatletica.comum.tenant;

import java.util.Optional;
import java.util.UUID;

/**
 * Guarda qual atlética está sendo acessada na requisição corrente.
 *
 * <p>Usa {@link ScopedValue} não, e sim {@code ThreadLocal}: com virtual
 * threads habilitadas cada requisição roda na própria thread, então o
 * ThreadLocal continua correto e não vaza entre requisições. O
 * {@link FiltroContextoAtletica} sempre limpa no {@code finally}.</p>
 *
 * <p>Regra do projeto: nenhuma consulta a tabela multi-tenant é feita sem
 * que este contexto esteja preenchido. Quem precisar burlar isso (job
 * administrativo, relatório entre atléticas) usa
 * {@link #executarSemFiltro(Runnable)} de forma explícita e auditável —
 * nunca por esquecimento.</p>
 */
public final class ContextoAtletica {

    private static final ThreadLocal<UUID> ATLETICA_ATUAL = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> FILTRO_SUSPENSO =
            ThreadLocal.withInitial(() -> Boolean.FALSE);

    private ContextoAtletica() {
    }

    public static void definir(UUID atleticaId) {
        ATLETICA_ATUAL.set(atleticaId);
    }

    public static Optional<UUID> atual() {
        return Optional.ofNullable(ATLETICA_ATUAL.get());
    }

    /**
     * @throws EstadoTenantInvalidoException se nenhuma atlética foi resolvida.
     *         Falhar alto é proposital: o modo silencioso de um bug de tenant
     *         é vazar dado de outra atlética.
     */
    public static UUID exigir() {
        UUID id = ATLETICA_ATUAL.get();
        if (id == null) {
            throw new EstadoTenantInvalidoException(
                    "Nenhuma atlética no contexto da requisição.");
        }
        return id;
    }

    public static boolean filtroSuspenso() {
        return Boolean.TRUE.equals(FILTRO_SUSPENSO.get());
    }

    /**
     * Executa um bloco com o filtro de atlética desligado. Uso restrito a
     * rotinas administrativas e a consultas explicitamente entre atléticas.
     */
    public static void executarSemFiltro(Runnable acao) {
        consultarSemFiltro(() -> {
            acao.run();
            return null;
        });
    }

    /**
     * Versão com retorno. Necessária no aceite de convite: a rota
     * {@code /api/convites/{token}} não carrega slug, então nenhuma atlética
     * foi resolvida — e a busca pelo token precisa alcançar o convite de
     * qualquer atlética. Suspender o filtro aqui é explícito e auditável, em
     * vez de depender do contexto estar vazio por acaso.
     *
     * <p>Precisa embrulhar a CHAMADA ao serviço, não o corpo dele: o aspecto
     * consulta esta flag no momento em que a transação abre.</p>
     */
    public static <T> T consultarSemFiltro(java.util.function.Supplier<T> acao) {
        boolean jaSuspenso = filtroSuspenso();
        FILTRO_SUSPENSO.set(Boolean.TRUE);
        try {
            return acao.get();
        } finally {
            // Restaura em vez de limpar: blocos aninhados não devem religar
            // o filtro ao sair do interno.
            if (jaSuspenso) {
                FILTRO_SUSPENSO.set(Boolean.TRUE);
            } else {
                FILTRO_SUSPENSO.remove();
            }
        }
    }

    public static void limpar() {
        ATLETICA_ATUAL.remove();
        FILTRO_SUSPENSO.remove();
    }

    public static class EstadoTenantInvalidoException extends IllegalStateException {
        public EstadoTenantInvalidoException(String mensagem) {
            super(mensagem);
        }
    }
}
