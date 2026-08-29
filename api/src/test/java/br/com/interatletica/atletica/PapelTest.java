package br.com.interatletica.atletica;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A hierarquia de papel é implementada com {@code ordinal()}, o que significa
 * que reordenar as constantes do enum muda silenciosamente quem pode o quê.
 * Estes testes existem para que essa reordenação quebre o build em vez de
 * virar escalada de privilégio.
 */
class PapelTest {

    @Test
    @DisplayName("presidente faz tudo que diretor e membro fazem")
    void presidenteAlcancaOsDemais() {
        assertTrue(Papel.PRESIDENTE.podeAtuarComo(Papel.PRESIDENTE));
        assertTrue(Papel.PRESIDENTE.podeAtuarComo(Papel.DIRETOR));
        assertTrue(Papel.PRESIDENTE.podeAtuarComo(Papel.MEMBRO));
    }

    @Test
    @DisplayName("diretor alcança membro, mas não presidência")
    void diretorNaoSobe() {
        assertTrue(Papel.DIRETOR.podeAtuarComo(Papel.DIRETOR));
        assertTrue(Papel.DIRETOR.podeAtuarComo(Papel.MEMBRO));
        assertFalse(Papel.DIRETOR.podeAtuarComo(Papel.PRESIDENTE),
                "diretor promovendo a si mesmo seria escalada de privilégio");
    }

    @Test
    @DisplayName("membro não alcança ninguém acima")
    void membroFicaOndeEsta() {
        assertTrue(Papel.MEMBRO.podeAtuarComo(Papel.MEMBRO));
        assertFalse(Papel.MEMBRO.podeAtuarComo(Papel.DIRETOR));
        assertFalse(Papel.MEMBRO.podeAtuarComo(Papel.PRESIDENTE));
    }

    @Test
    @DisplayName("a ordem de declaração É a hierarquia")
    void ordemDeclaradaEhAHierarquia() {
        // Se alguém reordenar o enum por ordem alfabética — DIRETOR, MEMBRO,
        // PRESIDENTE — a permissão inverte sem erro de compilação. Este
        // teste é o que transforma isso em build vermelho.
        Papel[] doMaiorParaOMenor = {Papel.PRESIDENTE, Papel.DIRETOR, Papel.MEMBRO};

        for (int maior = 0; maior < doMaiorParaOMenor.length; maior++) {
            for (int menor = maior; menor < doMaiorParaOMenor.length; menor++) {
                assertTrue(doMaiorParaOMenor[maior].podeAtuarComo(doMaiorParaOMenor[menor]),
                        doMaiorParaOMenor[maior] + " deveria alcançar " + doMaiorParaOMenor[menor]);
            }
        }
    }
}
