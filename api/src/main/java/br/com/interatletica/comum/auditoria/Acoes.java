package br.com.interatletica.comum.auditoria;

/**
 * Vocabulário de auditoria. Constantes em vez de literais espalhados porque
 * consulta de auditoria é feita por igualdade exata — um {@code "CONVITE_ACEITO"}
 * digitado como {@code "CONVITE_ACEITE"} some do relatório sem avisar.
 */
public final class Acoes {

    private Acoes() {
    }

    public static final String ATLETICA_CRIADA = "ATLETICA_CRIADA";
    public static final String ATLETICA_ATUALIZADA = "ATLETICA_ATUALIZADA";

    public static final String CONVITE_CRIADO = "CONVITE_CRIADO";
    public static final String CONVITE_ACEITO = "CONVITE_ACEITO";
    public static final String CONVITE_REVOGADO = "CONVITE_REVOGADO";

    public static final String MEMBRO_PAPEL_ALTERADO = "MEMBRO_PAPEL_ALTERADO";
    public static final String MEMBRO_DESLIGADO = "MEMBRO_DESLIGADO";
    public static final String MEMBRO_REATIVADO = "MEMBRO_REATIVADO";

    public static final String EVENTO_CRIADO = "EVENTO_CRIADO";
    public static final String EVENTO_ATUALIZADO = "EVENTO_ATUALIZADO";
    public static final String EVENTO_PUBLICADO = "EVENTO_PUBLICADO";
    public static final String EVENTO_CANCELADO = "EVENTO_CANCELADO";
    public static final String EVENTO_ENCERRADO = "EVENTO_ENCERRADO";

    public static final String INSCRICAO_CRIADA = "INSCRICAO_CRIADA";
    public static final String INSCRICAO_CANCELADA = "INSCRICAO_CANCELADA";
    public static final String INSCRICAO_PROMOVIDA = "INSCRICAO_PROMOVIDA";
    public static final String CHECKIN_REGISTRADO = "CHECKIN_REGISTRADO";

    /** Nomes de entidade, para a coluna {@code entidade}. */
    public static final String E_ATLETICA = "atletica";
    public static final String E_CONVITE = "convite";
    public static final String E_MEMBRO = "membro";
    public static final String E_EVENTO = "evento";
    public static final String E_INSCRICAO = "inscricao";
}
