package br.com.interatletica.comum.erro;

import br.com.interatletica.comum.tenant.ContextoAtletica;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class TratadorGlobalDeErros {

    private static final Logger log = LoggerFactory.getLogger(TratadorGlobalDeErros.class);

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> naoEncontrado(RecursoNaoEncontradoException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResposta.de(404, "RECURSO_NAO_ENCONTRADO", e.getMessage()));
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<ErroResposta> regraDeNegocio(RegraDeNegocioException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErroResposta.de(409, e.getCodigo(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> validacao(MethodArgumentNotValidException e) {
        List<ErroResposta.ErroDeCampo> campos = e.getBindingResult().getFieldErrors().stream()
                .map(f -> new ErroResposta.ErroDeCampo(f.getField(), f.getDefaultMessage()))
                .toList();
        return ResponseEntity.badRequest().body(ErroResposta.comCampos(
                400, "DADOS_INVALIDOS", "Verifique os campos informados.", campos));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResposta> acessoNegado(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ErroResposta.de(
                403, "ACESSO_NEGADO", "Você não tem permissão para esta ação."));
    }

    /**
     * Contexto de atlética ausente indica bug de roteamento ou tentativa de
     * acessar recurso de tenant por rota que não resolve tenant. Nos dois
     * casos, a requisição morre aqui e o incidente vai para o log.
     */
    @ExceptionHandler(ContextoAtletica.EstadoTenantInvalidoException.class)
    public ResponseEntity<ErroResposta> tenantInvalido(
            ContextoAtletica.EstadoTenantInvalidoException e) {
        log.error("Requisição a recurso multi-tenant sem atlética resolvida", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErroResposta.de(
                400, "ATLETICA_NAO_IDENTIFICADA",
                "Não foi possível identificar a atlética desta requisição."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> inesperado(Exception e) {
        // A mensagem interna nunca chega ao cliente: fica só no log.
        log.error("Erro não tratado", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ErroResposta.de(
                500, "ERRO_INTERNO", "Erro inesperado. Tente novamente em instantes."));
    }
}
