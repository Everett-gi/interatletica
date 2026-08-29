package br.com.interatletica.evento;

import br.com.interatletica.evento.EventoDtos.ParticipanteResposta;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * A lista de presença em CSV — o arquivo que substitui a planilha.
 *
 * <p>Três escolhas aqui existem para que o arquivo simplesmente ABRA no Excel
 * em português, que é onde ele vai parar:</p>
 *
 * <ul>
 *   <li><strong>Separador ponto e vírgula.</strong> O Excel em configuração
 *       pt-BR usa a vírgula como separador decimal e, por isso, o ponto e
 *       vírgula como separador de campo. Com vírgula, ele joga a linha
 *       inteira na coluna A.</li>
 *   <li><strong>BOM no início.</strong> Sem ele o Excel lê UTF-8 como
 *       Latin-1 e "Inscrição" vira "InscriÃ§Ã£o". O BOM é o único sinal que
 *       ele respeita.</li>
 *   <li><strong>CRLF no fim da linha.</strong> É o que a RFC 4180 pede e o
 *       que evita uma única linha gigante em editores do Windows.</li>
 * </ul>
 */
public final class ListaDeParticipantesCsv {

    private static final char SEPARADOR = ';';
    private static final String FIM_DE_LINHA = "\r\n";
    private static final byte[] BOM = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};

    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter MOMENTO =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final List<String> CABECALHO = List.of(
            "Nome", "E-mail", "Telefone", "Atlética de origem", "Situação",
            "Posição na espera", "Inscrito em", "Check-in em", "Observação");

    private ListaDeParticipantesCsv() {
    }

    /**
     * @param nomesDasAtleticas id → nome, resolvido pelo chamador. Passar o
     *                          mapa pronto evita uma consulta por linha da
     *                          lista, que num interatlética de 400 pessoas
     *                          seriam 400 idas ao banco para repetir meia
     *                          dúzia de nomes.
     */
    public static byte[] gerar(List<ParticipanteResposta> participantes,
                               Map<UUID, String> nomesDasAtleticas) {
        StringBuilder csv = new StringBuilder();
        escreverLinha(csv, CABECALHO);

        for (ParticipanteResposta p : participantes) {
            escreverLinha(csv, List.of(
                    textoOuVazio(p.nome()),
                    textoOuVazio(p.email()),
                    textoOuVazio(p.telefone()),
                    p.atleticaDeOrigem() == null
                            ? "Sem atlética"
                            : nomesDasAtleticas.getOrDefault(p.atleticaDeOrigem(), "—"),
                    descrever(p.status()),
                    p.posicaoEspera() == null ? "" : String.valueOf(p.posicaoEspera()),
                    formatar(p.inscritoEm()),
                    formatar(p.checkinEm()),
                    textoOuVazio(p.observacao())));
        }

        byte[] conteudo = csv.toString().getBytes(StandardCharsets.UTF_8);
        byte[] comBom = new byte[BOM.length + conteudo.length];
        System.arraycopy(BOM, 0, comBom, 0, BOM.length);
        System.arraycopy(conteudo, 0, comBom, BOM.length, conteudo.length);
        return comBom;
    }

    /** Nome de arquivo previsível, ordenável e sem acento: {@code participantes-calourada-2026.csv}. */
    public static String nomeDoArquivo(String slugDoEvento) {
        return "participantes-%s.csv".formatted(slugDoEvento);
    }

    private static void escreverLinha(StringBuilder csv, List<String> campos) {
        for (int i = 0; i < campos.size(); i++) {
            if (i > 0) {
                csv.append(SEPARADOR);
            }
            csv.append(escapar(campos.get(i)));
        }
        csv.append(FIM_DE_LINHA);
    }

    /**
     * Sempre entre aspas, com aspas internas duplicadas. Citar tudo é mais
     * barato que decidir caso a caso — e um campo de observação com ponto e
     * vírgula ou quebra de linha deslocaria todas as colunas seguintes.
     */
    private static String escapar(String campo) {
        return '"' + campo.replace("\"", "\"\"") + '"';
    }

    private static String textoOuVazio(String valor) {
        return valor == null ? "" : valor;
    }

    private static String formatar(java.time.OffsetDateTime momento) {
        // Guardado em UTC, lido por gente em São Paulo. Exportar em UTC faria
        // a festa da meia-noite aparecer no dia seguinte.
        return momento == null ? "" : MOMENTO.format(momento.atZoneSameInstant(FUSO));
    }

    private static String descrever(StatusDaInscricao status) {
        return switch (status) {
            case CONFIRMADA -> "Confirmada";
            case LISTA_ESPERA -> "Lista de espera";
            case CANCELADA -> "Cancelada";
            case PENDENTE -> "Pendente";
        };
    }
}
