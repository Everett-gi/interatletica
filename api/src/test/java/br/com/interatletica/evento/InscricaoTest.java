package br.com.interatletica.evento;

import br.com.interatletica.identidade.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InscricaoTest {

    private static final UUID ATLETICA = UUID.randomUUID();

    private Evento evento() {
        return new Evento(ATLETICA, "Calourada", "calourada", TipoDeEvento.SOCIAL,
                OffsetDateTime.parse("2026-03-14T21:00:00-03:00"), UUID.randomUUID());
    }

    private Usuario usuario() {
        return new Usuario("Ana", "ana@u.br", "sub-123", null);
    }

    private Inscricao dePessoa() {
        return Inscricao.dePessoa(evento(), usuario(), ATLETICA);
    }

    @Nested
    @DisplayName("sujeito da inscrição")
    class Sujeito {

        @Test
        @DisplayName("inscrição de pessoa não carrega equipe")
        void pessoaNaoTemEquipe() {
            // ck_inscricao_sujeito exige exatamente um dos dois. Preencher
            // ambos, ou nenhum, é violação de constraint.
            Inscricao inscricao = dePessoa();

            assertNotNull(inscricao.getUsuario());
            assertNull(inscricao.getEquipeId());
        }

        @Test
        @DisplayName("inscrição de equipe não carrega usuário")
        void equipeNaoTemUsuario() {
            Inscricao inscricao = Inscricao.deEquipe(evento(), UUID.randomUUID(), ATLETICA);

            assertNotNull(inscricao.getEquipeId());
            assertNull(inscricao.getUsuario());
        }

        @Test
        @DisplayName("a atlética de origem pode ser nula — é quem não tem vínculo")
        void origemPodeSerNula() {
            // Evento público recebe quem não é de atlética nenhuma. É por
            // isso que a coluna é anulável, e por isso que Inscricao não
            // estende EntidadeDeAtletica.
            Inscricao inscricao = Inscricao.dePessoa(evento(), usuario(), null);

            assertNull(inscricao.getAtleticaDeOrigem());
        }
    }

    @Nested
    @DisplayName("token de check-in")
    class TokenDeCheckin {

        @Test
        @DisplayName("são 32 caracteres hexadecimais, como o DEFAULT da coluna")
        void formatoBateComAColuna() {
            // A coluna é VARCHAR(32) e o DEFAULT do banco produz
            // replace(gen_random_uuid()::text, '-', '') — 32 hex. Gerar em
            // outro formato caberia hoje e estouraria no dia em que alguém
            // inserisse pela aplicação e pelo banco na mesma tabela.
            String token = dePessoa().getCheckinToken();

            assertEquals(32, token.length());
            assertTrue(token.matches("^[0-9a-f]{32}$"), "formato inesperado: " + token);
        }

        @Test
        @DisplayName("não se repetem — um token adivinhado é uma entrada roubada")
        void tokensSaoDistintos() {
            Set<String> vistos = new HashSet<>();
            for (int i = 0; i < 500; i++) {
                assertTrue(vistos.add(dePessoa().getCheckinToken()), "token repetido");
            }
        }
    }

    @Nested
    @DisplayName("situação")
    class Situacao {

        @Test
        @DisplayName("nasce confirmada e sem posição de espera")
        void nasceConfirmada() {
            Inscricao inscricao = dePessoa();

            assertEquals(StatusDaInscricao.CONFIRMADA, inscricao.getStatus());
            assertNull(inscricao.getPosicaoEspera());
        }

        @Test
        @DisplayName("na espera, status e posição andam juntos")
        void esperaTemPosicao() {
            // ck_inscricao_espera exige a equivalência: LISTA_ESPERA se e
            // somente se posicao_espera preenchida. Um sem o outro não entra.
            Inscricao inscricao = dePessoa();

            inscricao.colocarNaEspera(3);

            assertTrue(inscricao.estaNaEspera());
            assertEquals(3, inscricao.getPosicaoEspera());
        }

        @Test
        @DisplayName("promover da espera limpa a posição")
        void confirmarLimpaAPosicao() {
            // Posição residual numa inscrição confirmada viola o CHECK — e é
            // exatamente o que acontece quando alguém desiste e o próximo da
            // fila é promovido.
            Inscricao inscricao = dePessoa();
            inscricao.colocarNaEspera(3);

            inscricao.confirmar();

            assertEquals(StatusDaInscricao.CONFIRMADA, inscricao.getStatus());
            assertNull(inscricao.getPosicaoEspera());
        }

        @Test
        @DisplayName("cancelar limpa a posição e marca o momento")
        void cancelarLimpaAPosicao() {
            Inscricao inscricao = dePessoa();
            inscricao.colocarNaEspera(2);

            inscricao.cancelar();

            assertTrue(inscricao.estaCancelada());
            assertNull(inscricao.getPosicaoEspera());
            assertNotNull(inscricao.getCanceladoEm());
        }

        @Test
        @DisplayName("reinscrever depois de cancelar limpa a data do cancelamento")
        void confirmarLimpaOCancelamento() {
            // A linha cancelada é ignorada pelo índice único parcial, então
            // uma nova inscrição é criada. Mas se alguém reaproveitar a
            // instância, o cancelado_em residual mentiria sobre o estado.
            Inscricao inscricao = dePessoa();
            inscricao.cancelar();

            inscricao.confirmar();

            assertFalse(inscricao.estaCancelada());
            assertNull(inscricao.getCanceladoEm());
        }
    }

    @Nested
    @DisplayName("check-in")
    class Checkin {

        @Test
        @DisplayName("começa sem entrada registrada")
        void comecaSemCheckin() {
            assertFalse(dePessoa().jaFezCheckin());
        }

        @Test
        @DisplayName("registrar entrada marca o horário")
        void registrarMarcaOHorario() {
            // É este horário que a portaria mostra quando alguém tenta
            // entrar duas vezes com o mesmo crachá.
            Inscricao inscricao = dePessoa();

            inscricao.registrarCheckin(UUID.randomUUID());

            assertTrue(inscricao.jaFezCheckin());
            assertNotNull(inscricao.getCheckinEm());
        }
    }
}
