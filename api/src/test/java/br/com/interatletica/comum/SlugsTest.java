package br.com.interatletica.comum;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * O contrato que estes testes protegem não é estético: é o
 * {@code CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')} da migration. Um slug
 * fora do formato não vira erro de validação bonitinho — vira violação de
 * constraint, ou seja, 500 na cara de quem só quis criar um evento.
 */
class SlugsTest {

    /** O mesmo regex do banco, para verificar aqui o que o Postgres exigiria. */
    private static final Pattern FORMATO_DO_BANCO =
            Pattern.compile("^[a-z0-9]+(-[a-z0-9]+)*$");

    @Nested
    @DisplayName("geração")
    class Geracao {

        @ParameterizedTest(name = "\"{0}\" vira \"{1}\"")
        @CsvSource({
                "Atlética Dragões do Vale,        atletica-dragoes-do-vale",
                "Calourada 2026,                  calourada-2026",
                "InterAtlética,                   interatletica",
                "Copa de Vôlei — Feminino,        copa-de-volei-feminino",
                "  espaços  nas  pontas  ,        espacos-nas-pontas",
                "Ação!!! Já,                      acao-ja",
                "Ñandú & Cia,                     nandu-cia",
                "TORNEIO DE FIFA,                 torneio-de-fifa"
        })
        void normalizaTextoDeVerdade(String entrada, String esperado) {
            assertEquals(esperado, Slugs.gerar(entrada));
        }

        @Test
        @DisplayName("o cedilha e o til somem junto com o resto do acento")
        void removeAcentoDeQualquerLetra() {
            // O motivo de usar NFD em vez de uma tabela de substituição: uma
            // tabela esqueceria justamente o ç de "Coração" ou o ü de algum
            // nome de instituição.
            assertEquals("coracao-de-jesus", Slugs.gerar("Coração de Jesus"));
            assertEquals("uniao-linguistica", Slugs.gerar("União Linguística"));
        }

        @Test
        @DisplayName("corta no limite sem deixar hífen na ponta")
        void respeitaOLimiteDaColuna() {
            // Cortar em 20 cairia bem em cima de um hífen; o CHECK do banco
            // rejeita slug terminado em hífen.
            String slug = Slugs.gerar("atletica dragoes do vale unidos", 20);

            assertTrue(slug.length() <= 20, "passou do limite: " + slug);
            assertTrue(FORMATO_DO_BANCO.matcher(slug).matches(),
                    "o banco rejeitaria: " + slug);
        }

        @Test
        @DisplayName("texto sem nenhuma letra ou número é recusado, não vira slug vazio")
        void recusaTextoImpossivel() {
            // Slug vazio passaria pela aplicação e explodiria no INSERT.
            assertThrows(IllegalArgumentException.class, () -> Slugs.gerar("!!! ???"));
            assertThrows(IllegalArgumentException.class, () -> Slugs.gerar("   "));
            assertThrows(IllegalArgumentException.class, () -> Slugs.gerar(null));
        }
    }

    @Nested
    @DisplayName("unicidade")
    class Unicidade {

        @Test
        @DisplayName("duas calouradas no mesmo ano não colidem")
        void acrescentaSufixoQuandoJaExiste() {
            Set<String> existentes = new HashSet<>(Set.of("calourada"));

            assertEquals("calourada-2", Slugs.unico("Calourada", 80, existentes::contains));

            existentes.add("calourada-2");
            assertEquals("calourada-3", Slugs.unico("Calourada", 80, existentes::contains));
        }

        @Test
        @DisplayName("o sufixo cabe no limite em vez de estourar a coluna")
        void encolheABaseParaCaberOSufixo() {
            Set<String> existentes = new HashSet<>(Set.of("atletica-dragoes"));

            String slug = Slugs.unico("Atlética Dragões", 16, existentes::contains);

            assertTrue(slug.length() <= 16, "passou do limite: " + slug);
            assertTrue(FORMATO_DO_BANCO.matcher(slug).matches(),
                    "o banco rejeitaria: " + slug);
            assertTrue(existentes.add(slug), "devolveu um slug que já existia: " + slug);
        }

        @Test
        @DisplayName("slug livre é devolvido sem sufixo")
        void naoMexeNoQueJaEstaLivre() {
            assertEquals("calourada", Slugs.unico("Calourada", 80, s -> false));
        }
    }
}
