package br.com.interatletica.evento;

/** Espelha {@code ck_evento_visibilidade}. */
public enum Visibilidade {

    /** Qualquer pessoa com o link. É o caso do evento divulgado no Instagram. */
    PUBLICO,

    /** Membros de qualquer atlética da plataforma — o "interatlética". */
    REDE,

    /** Só a atlética dona. Reunião de diretoria, treino fechado. */
    INTERNO
}
