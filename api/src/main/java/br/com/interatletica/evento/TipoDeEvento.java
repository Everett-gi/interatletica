package br.com.interatletica.evento;

/** Espelha {@code ck_evento_tipo}. */
public enum TipoDeEvento {

    /** Jogo, campeonato, treino aberto. */
    ESPORTIVO,

    /** Modalidades de e-sports. Separado de ESPORTIVO porque a inscrição
     *  pede nick de jogo e a tabela de partidas conta mapas, não sets. */
    ESPORTS,

    /** Festa, calourada, confraternização. */
    SOCIAL,

    /** Reunião de diretoria, treino fechado — nunca aparece em vitrine. */
    INTERNO
}
