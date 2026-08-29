package br.com.interatletica.comum.erro;

public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String recurso, Object identificador) {
        super("%s não encontrado: %s".formatted(recurso, identificador));
    }

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
