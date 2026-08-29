package br.com.interatletica.evento;

/** Espelha {@code ck_eo_papel}. */
public enum PapelDeOrganizador {

    /** A dona do registro. Aparece também em evento_organizador para que
     *  "eventos de que participo" seja uma consulta só. */
    ANFITRIA,

    /** Divide a organização: cria tarefa, vê inscritos, edita o evento. */
    COORGANIZADORA,

    /** Foi chamada a participar. Vê o evento; não o administra. */
    CONVIDADA
}
