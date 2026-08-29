package br.com.interatletica.atletica;

public enum SituacaoMembro {

    ATIVO,

    /** Saiu ou foi desligado. Mantido para preservar o histórico de eventos. */
    INATIVO,

    /** Convite aceito aguardando confirmação da diretoria. */
    PENDENTE
}
