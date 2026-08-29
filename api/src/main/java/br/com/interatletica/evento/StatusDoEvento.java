package br.com.interatletica.evento;

/** Espelha {@code ck_evento_status}. */
public enum StatusDoEvento {

    /** Em edição. Não aparece em lugar nenhum fora da diretoria. */
    RASCUNHO,

    /** No ar. É o único status que aceita inscrição. */
    PUBLICADO,

    /** Aconteceu. Continua visível, com a lista de presença congelada. */
    ENCERRADO,

    /** Não vai acontecer. Continua visível para quem se inscreveu descobrir. */
    CANCELADO
}
