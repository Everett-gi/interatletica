package br.com.interatletica.evento;

import br.com.interatletica.evento.EventoDtos.ParticipanteResposta;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * O CSV é o entregável que substitui a planilha, e ele vai parar no Excel em
 * português. Cada teste aqui protege uma escolha que existe só por causa
 * disso — e que um "refactor de limpeza" desfaria sem perceber.
 */
class ListaDeParticipantesCsvTest {

    private static final UUID DRAGOES = UUID.randomUUID();
    private static final Map<UUID, String> NOMES = Map.of(DRAGOES, "Atlética Dragões");

    private ParticipanteResposta participante(String nome, String email, String observacao,
                                              UUID origem, StatusDaInscricao status,
                                              Integer posicao, OffsetDateTime inscritoEm,
                                              OffsetDateTime checkinEm) {
        return new ParticipanteResposta(UUID.randomUUID(), UUID.randomUUID(), nome, email,
                "(11) 90000-0000", origem, status, posicao, observacao, inscritoEm, checkinEm);
    }

    private String texto(byte[] csv) {
        return new String(csv, StandardCharsets.UTF_8);
    }

    @Test
    @DisplayName("começa com BOM — sem ele o Excel lê UTF-8 como Latin-1")
    void comecaComBom() {
        // "Inscrição" viraria "InscriÃ§Ã£o". O BOM é o único sinal que o
        // Excel respeita para descobrir a codificação.
        byte[] csv = ListaDeParticipantesCsv.gerar(List.of(), Map.of());

        assertArrayEquals(
                new byte[] {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF},
                new byte[] {csv[0], csv[1], csv[2]},
                "o arquivo precisa abrir com BOM");
    }

    @Test
    @DisplayName("separa por ponto e vírgula — o Excel pt-BR ignora a vírgula")
    void separaPorPontoEVirgula() {
        // Com vírgula, o Excel em configuração brasileira joga a linha
        // inteira na coluna A.
        String csv = texto(ListaDeParticipantesCsv.gerar(List.of(), Map.of()));

        assertTrue(csv.startsWith("﻿\"Nome\";\"E-mail\";"),
                "cabeçalho inesperado: " + csv);
    }

    @Test
    @DisplayName("termina as linhas com CRLF, como pede a RFC 4180")
    void terminaComCrlf() {
        String csv = texto(ListaDeParticipantesCsv.gerar(List.of(), Map.of()));

        assertTrue(csv.endsWith("\r\n"), "sem CRLF vira uma linha só no Windows");
    }

    @Test
    @DisplayName("aspas dentro do texto são duplicadas, não removidas")
    void escapaAspas() {
        var linha = participante("Ana", "ana@u.br", "levar o \"kit\" completo",
                DRAGOES, StatusDaInscricao.CONFIRMADA, null,
                OffsetDateTime.parse("2026-03-14T15:00:00Z"), null);

        String csv = texto(ListaDeParticipantesCsv.gerar(List.of(linha), NOMES));

        assertTrue(csv.contains("\"levar o \"\"kit\"\" completo\""),
                "aspas mal escapadas quebram todas as colunas seguintes: " + csv);
    }

    @Test
    @DisplayName("ponto e vírgula na observação não desloca as colunas")
    void observacaoComSeparadorNaoQuebraALinha() {
        // É por isso que TODO campo sai entre aspas, em vez de só os que
        // "precisam": decidir caso a caso é onde o bug mora.
        var linha = participante("Bruno", "bruno@u.br", "alergia: amendoim; lactose",
                DRAGOES, StatusDaInscricao.CONFIRMADA, null,
                OffsetDateTime.parse("2026-03-14T15:00:00Z"), null);

        String csv = texto(ListaDeParticipantesCsv.gerar(List.of(linha), NOMES));
        String[] linhas = csv.split("\r\n");

        assertEquals(2, linhas.length, "a observação virou uma linha nova");
        assertTrue(linhas[1].contains("\"alergia: amendoim; lactose\""), linhas[1]);
    }

    @Test
    @DisplayName("horário sai em São Paulo, não em UTC")
    void converteParaOFusoDeQuemLe() {
        // Guardado em UTC, lido por gente em São Paulo: 02:00Z do dia 15 é
        // 23:00 do dia 14. Exportar em UTC faria a festa da meia-noite
        // aparecer no dia seguinte na lista da portaria.
        var linha = participante("Carla", "carla@u.br", null, DRAGOES,
                StatusDaInscricao.CONFIRMADA, null,
                OffsetDateTime.parse("2026-03-15T02:00:00Z"), null);

        String csv = texto(ListaDeParticipantesCsv.gerar(List.of(linha), NOMES));

        assertTrue(csv.contains("\"14/03/2026 23:00\""),
                "esperava a data convertida para America/Sao_Paulo: " + csv);
    }

    @Test
    @DisplayName("inscrito sem atlética aparece como tal, não em branco")
    void inscritoSemAtleticaTemRotulo() {
        // Célula vazia parece dado faltando; "Sem atlética" é a informação.
        var linha = participante("Diego", "diego@u.br", null, null,
                StatusDaInscricao.CONFIRMADA, null,
                OffsetDateTime.parse("2026-03-14T15:00:00Z"), null);

        String csv = texto(ListaDeParticipantesCsv.gerar(List.of(linha), Map.of()));

        assertTrue(csv.contains("\"Sem atlética\""), csv);
    }

    @Test
    @DisplayName("situação sai por extenso, não como constante do banco")
    void traduzOStatus() {
        // A diretoria imprime este arquivo. "LISTA_ESPERA" é vocabulário de
        // schema, não de quem está na porta com a folha na mão.
        var linha = participante("Elisa", "elisa@u.br", null, DRAGOES,
                StatusDaInscricao.LISTA_ESPERA, 3,
                OffsetDateTime.parse("2026-03-14T15:00:00Z"), null);

        String csv = texto(ListaDeParticipantesCsv.gerar(List.of(linha), NOMES));

        assertTrue(csv.contains("\"Lista de espera\""), csv);
        assertTrue(csv.contains("\"3\""), "a posição na espera não saiu: " + csv);
    }

    @Test
    @DisplayName("todo status do enum tem tradução — nenhum escapa como null")
    void traduzTodosOsStatus() {
        // Se um status novo entrar no enum sem tradução, o switch deixa de
        // compilar. Este teste é o que garante que ele foi EXERCITADO, e não
        // só que compila.
        for (StatusDaInscricao status : StatusDaInscricao.values()) {
            var linha = participante("Fulano", "f@u.br", null, DRAGOES, status,
                    status == StatusDaInscricao.LISTA_ESPERA ? 1 : null,
                    OffsetDateTime.parse("2026-03-14T15:00:00Z"), null);

            String csv = texto(ListaDeParticipantesCsv.gerar(List.of(linha), NOMES));

            assertTrue(csv.contains("\"Fulano\""), status + " não gerou linha");
        }
    }

    @Test
    @DisplayName("campo nulo vira célula vazia, não a palavra null")
    void nuloNaoViraTextoNull() {
        var linha = new ParticipanteResposta(UUID.randomUUID(), null, null, null, null,
                null, StatusDaInscricao.CONFIRMADA, null, null,
                OffsetDateTime.parse("2026-03-14T15:00:00Z"), null);

        String csv = texto(ListaDeParticipantesCsv.gerar(List.of(linha), Map.of()));

        assertTrue(csv.contains("\"\""), "esperava célula vazia: " + csv);
        assertTrue(!csv.contains("null"), "a palavra null vazou para a planilha: " + csv);
    }

    @Test
    @DisplayName("o nome do arquivo carrega o slug do evento")
    void nomeDoArquivoEhReconhecivel() {
        // A diretoria baixa a lista de três eventos no mesmo dia. Sem o slug,
        // vira participantes.csv, participantes(1).csv, participantes(2).csv.
        assertEquals("participantes-calourada-2026.csv",
                ListaDeParticipantesCsv.nomeDoArquivo("calourada-2026"));
    }
}
