package br.com.interatletica.evento;

import br.com.interatletica.comum.erro.RegraDeNegocioException;
import br.com.interatletica.evento.Evento.MotivoDeFechamento;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * As regras do ciclo de vida do evento moram na entidade, e não no serviço,
 * justamente para que valham por qualquer caminho de chamada. Estes testes
 * as exercitam sem Spring, sem banco e sem HTTP.
 */
class EventoTest {

    private static final OffsetDateTime AGORA = OffsetDateTime.parse("2026-03-10T20:00:00-03:00");

    private Evento novoEvento() {
        return new Evento(UUID.randomUUID(), "Calourada 2026", "calourada-2026",
                TipoDeEvento.SOCIAL, AGORA.plusDays(7), UUID.randomUUID());
    }

    @Nested
    @DisplayName("ciclo de vida")
    class CicloDeVida {

        @Test
        @DisplayName("nasce como rascunho, sem data de publicação")
        void nasceRascunho() {
            Evento evento = novoEvento();

            assertEquals(StatusDoEvento.RASCUNHO, evento.getStatus());
            assertNull(evento.getPublicadoEm());
        }

        @Test
        @DisplayName("publicar marca o momento da publicação")
        void publicarRegistraMomento() {
            Evento evento = novoEvento();

            evento.publicar();

            assertEquals(StatusDoEvento.PUBLICADO, evento.getStatus());
            assertNotNull(evento.getPublicadoEm());
        }

        @Test
        @DisplayName("republicar um evento encerrado ressuscitaria a inscrição — é recusado")
        void naoRepublicaEncerrado() {
            Evento evento = novoEvento();
            evento.publicar();
            evento.encerrar();

            var erro = assertThrows(RegraDeNegocioException.class, evento::publicar);

            assertEquals("EVENTO_NAO_E_RASCUNHO", erro.getCodigo());
            assertEquals(StatusDoEvento.ENCERRADO, evento.getStatus());
        }

        @Test
        @DisplayName("cancelar um evento que já aconteceu não faz sentido")
        void naoCancelaEncerrado() {
            Evento evento = novoEvento();
            evento.publicar();
            evento.encerrar();

            var erro = assertThrows(RegraDeNegocioException.class, evento::cancelar);

            assertEquals("EVENTO_ENCERRADO", erro.getCodigo());
        }

        @Test
        @DisplayName("um rascunho não pode ser encerrado: nunca chegou a acontecer")
        void naoEncerraRascunho() {
            Evento evento = novoEvento();

            assertThrows(RegraDeNegocioException.class, evento::encerrar);
        }

        @Test
        @DisplayName("voltar a rascunho limpa a data de publicação")
        void despublicarLimpaMomento() {
            Evento evento = novoEvento();
            evento.publicar();

            evento.voltarParaRascunho();

            assertEquals(StatusDoEvento.RASCUNHO, evento.getStatus());
            assertNull(evento.getPublicadoEm(),
                    "com publicadoEm preenchido, o evento pareceria já ter sido divulgado");
        }
    }

    @Nested
    @DisplayName("janela de inscrição")
    class JanelaDeInscricao {

        @Test
        @DisplayName("rascunho não recebe inscrição")
        void rascunhoFechado() {
            Evento evento = novoEvento();

            assertEquals(MotivoDeFechamento.EVENTO_NAO_PUBLICADO,
                    evento.motivoDeFechamento(AGORA));
        }

        @Test
        @DisplayName("publicado e sem janela definida fica aberto até o evento começar")
        void publicadoSemJanelaFicaAberto() {
            Evento evento = novoEvento();
            evento.publicar();

            assertTrue(evento.motivoDeFechamento(AGORA).aberta());
        }

        @Test
        @DisplayName("sem prazo de fechamento, o início do evento é o limite")
        void semPrazoOInicioEhOLimite() {
            // Ninguém se inscreve numa festa que começou ontem — e sem esta
            // regra o evento sem inscricao_fecha_em aceitaria inscrição para
            // sempre.
            Evento evento = novoEvento();
            evento.publicar();

            var depoisDoInicio = evento.getInicioEm().plusHours(1);

            assertEquals(MotivoDeFechamento.EVENTO_JA_COMECOU,
                    evento.motivoDeFechamento(depoisDoInicio));
        }

        @Test
        @DisplayName("antes da abertura, diz que ainda não começou")
        void antesDaAbertura() {
            Evento evento = novoEvento();
            evento.atualizarInscricao(null, AGORA.plusDays(2), AGORA.plusDays(5), false);
            evento.publicar();

            assertEquals(MotivoDeFechamento.AINDA_NAO_ABRIU,
                    evento.motivoDeFechamento(AGORA));
        }

        @Test
        @DisplayName("depois do prazo, diz que encerrou")
        void depoisDoPrazo() {
            Evento evento = novoEvento();
            evento.atualizarInscricao(null, AGORA.minusDays(5), AGORA.minusDays(1), false);
            evento.publicar();

            assertEquals(MotivoDeFechamento.PRAZO_ENCERRADO,
                    evento.motivoDeFechamento(AGORA));
        }

        @Test
        @DisplayName("evento cancelado explica que foi cancelado, não que o prazo passou")
        void canceladoTemMotivoProprio() {
            // A página pública mostra esta mensagem. "O prazo terminou" faria
            // quem se inscreveu achar que só chegou tarde.
            Evento evento = novoEvento();
            evento.publicar();
            evento.cancelar();

            MotivoDeFechamento motivo = evento.motivoDeFechamento(AGORA);

            assertEquals(MotivoDeFechamento.EVENTO_CANCELADO, motivo);
            assertFalse(motivo.aberta());
            assertNotNull(motivo.mensagem());
        }

        @Test
        @DisplayName("todo motivo de fechamento tem mensagem exibível")
        void todoMotivoExplicaOPorque() {
            // A página pública precisa dizer POR QUE o botão sumiu. Um motivo
            // sem mensagem viraria um espaço em branco na tela.
            for (MotivoDeFechamento motivo : MotivoDeFechamento.values()) {
                if (motivo.aberta()) {
                    continue;
                }
                assertNotNull(motivo.mensagem(), motivo + " não tem mensagem");
                assertFalse(motivo.mensagem().isBlank(), motivo + " tem mensagem vazia");
            }
        }
    }

    @Nested
    @DisplayName("edição")
    class Edicao {

        @Test
        @DisplayName("fim antes do início é recusado antes de chegar ao CHECK do banco")
        void recusaPeriodoInvertido() {
            Evento evento = novoEvento();

            var erro = assertThrows(RegraDeNegocioException.class,
                    () -> evento.atualizarQuando(AGORA, AGORA.minusHours(2)));

            assertEquals("PERIODO_INVALIDO", erro.getCodigo());
        }

        @Test
        @DisplayName("capacidade zero é recusada: em branco é que significa ilimitado")
        void recusaCapacidadeZero() {
            Evento evento = novoEvento();

            var erro = assertThrows(RegraDeNegocioException.class,
                    () -> evento.atualizarInscricao(0, null, null, false));

            assertEquals("CAPACIDADE_INVALIDA", erro.getCodigo());
        }

        @Test
        @DisplayName("capacidade em branco significa vagas ilimitadas")
        void semCapacidadeEhIlimitado() {
            Evento evento = novoEvento();
            evento.atualizarInscricao(null, null, null, false);

            assertFalse(evento.temLimiteDeVagas());
        }

        @Test
        @DisplayName("fechamento antes da abertura é recusado")
        void recusaJanelaInvertida() {
            Evento evento = novoEvento();

            var erro = assertThrows(RegraDeNegocioException.class,
                    () -> evento.atualizarInscricao(null, AGORA.plusDays(3), AGORA.plusDays(1), false));

            assertEquals("JANELA_INVALIDA", erro.getCodigo());
        }
    }
}
