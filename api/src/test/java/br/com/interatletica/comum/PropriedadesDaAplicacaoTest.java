package br.com.interatletica.comum;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * {@code app.operadores} é a única permissão que não vem do banco: é quem
 * pode criar atlética. Errar para MENOS tranca o operador do lado de fora de
 * um sistema que só ele pode destravar; errar para MAIS entrega a criação de
 * atléticas a quem não deveria.
 */
class PropriedadesDaAplicacaoTest {

    private PropriedadesDaAplicacao com(String... operadores) {
        return new PropriedadesDaAplicacao(
                "https://interatletica.com.br",
                new PropriedadesDaAplicacao.Convite(7),
                List.of(operadores));
    }

    @Test
    @DisplayName("reconhece o operador exato")
    void reconheceOperador() {
        assertTrue(com("ana@u.br").ehOperador("ana@u.br"));
    }

    @Test
    @DisplayName("caixa e espaço no .env não trancam o operador do lado de fora")
    void toleraCaixaEEspaco() {
        // Um .env escrito com maiúscula ou com espaço depois da vírgula é o
        // caso comum, não a exceção. Recusar por isso deixaria a plataforma
        // sem ninguém capaz de criar a primeira atlética.
        PropriedadesDaAplicacao propriedades = com("  Ana@U.BR  ", "bruno@u.br");

        assertTrue(propriedades.ehOperador("ana@u.br"));
        assertTrue(propriedades.ehOperador("ANA@U.BR"));
        assertTrue(propriedades.ehOperador(" bruno@u.br "));
    }

    @Test
    @DisplayName("quem não está na lista não é operador")
    void recusaDesconhecido() {
        assertFalse(com("ana@u.br").ehOperador("carlos@u.br"));
    }

    @Test
    @DisplayName("lista vazia não promove ninguém")
    void listaVaziaNaoPromoveNinguem() {
        // O estado correto depois que as atléticas fundadoras já existem:
        // ninguém pode criar mais nenhuma.
        assertFalse(com().ehOperador("ana@u.br"));
    }

    @Test
    @DisplayName("e-mail nulo não é operador")
    void nuloNaoEhOperador() {
        // Sessão anônima chega aqui com e-mail nulo. Um NullPointerException
        // no meio de uma checagem de permissão vira 500 — e 500 numa
        // checagem de permissão é o tipo de erro que se investiga tarde.
        assertFalse(com("ana@u.br").ehOperador(null));
    }

    @Test
    @DisplayName("lista ausente no .env não quebra a aplicação")
    void listaAusenteViraListaVazia() {
        var propriedades = new PropriedadesDaAplicacao("https://x", null, null);

        assertFalse(propriedades.ehOperador("ana@u.br"));
        assertTrue(propriedades.convite().validadeDias() > 0,
                "sem convite configurado, a validade padrão precisa ser utilizável");
    }
}
