package br.com.interatletica.comum.erro;

/**
 * Violação de regra de domínio: inscrição em evento já encerrado, convite
 * expirado, equipe acima do limite de jogadores. Vira 409 na API.
 */
public class RegraDeNegocioException extends RuntimeException {

    private final String codigo;

    public RegraDeNegocioException(String codigo, String mensagem) {
        super(mensagem);
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }
}
