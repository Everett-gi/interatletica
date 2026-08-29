package br.com.interatletica.atletica;

public enum SituacaoAtletica {

    ATIVA,

    /** Suspensa pela moderação: continua visível, mas não publica evento. */
    SUSPENSA,

    /** Encerrou as atividades. Histórico preservado, sem escrita. */
    ARQUIVADA
}
