package br.com.interatletica.evento;

/**
 * Espelha {@code ck_inscricao_pgto}. Gancho inerte: nada nesta fase escreve
 * a coluna. Existe para que habilitar cobrança depois seja código novo, e
 * não migration destrutiva em tabela com dado de produção.
 */
public enum StatusDePagamento {

    /** Evento gratuito, ou cortesia concedida pela diretoria. */
    ISENTO,

    PENDENTE,

    PAGO,

    ESTORNADO
}
