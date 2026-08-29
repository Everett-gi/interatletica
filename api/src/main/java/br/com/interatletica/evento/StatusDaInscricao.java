package br.com.interatletica.evento;

/** Espelha {@code ck_inscricao_status}. */
public enum StatusDaInscricao {

    CONFIRMADA,

    /** Evento lotado. Guarda {@code posicao_espera}, exigido pelo CHECK. */
    LISTA_ESPERA,

    /** Desistiu. A linha fica: o índice único parcial permite reinscrever. */
    CANCELADA,

    /** Aguarda aprovação da diretoria. Reservado para eventos com triagem. */
    PENDENTE
}
