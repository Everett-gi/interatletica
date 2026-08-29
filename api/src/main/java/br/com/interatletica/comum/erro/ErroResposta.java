package br.com.interatletica.comum.erro;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Corpo padrão de erro da API. Um formato só, para todos os erros — o
 * cliente trata em um lugar apenas.
 *
 * @param status  código HTTP
 * @param erro    identificador estável, em maiúsculas (ex.: RECURSO_NAO_ENCONTRADO)
 * @param mensagem texto exibível ao usuário final, em português
 * @param campos  erros de validação por campo, quando houver
 */
public record ErroResposta(
        int status,
        String erro,
        String mensagem,
        List<ErroDeCampo> campos,
        OffsetDateTime momento
) {
    public static ErroResposta de(int status, String erro, String mensagem) {
        return new ErroResposta(status, erro, mensagem, List.of(), OffsetDateTime.now());
    }

    public static ErroResposta comCampos(int status, String erro, String mensagem,
                                         List<ErroDeCampo> campos) {
        return new ErroResposta(status, erro, mensagem, campos, OffsetDateTime.now());
    }

    public record ErroDeCampo(String campo, String mensagem) {
    }
}
