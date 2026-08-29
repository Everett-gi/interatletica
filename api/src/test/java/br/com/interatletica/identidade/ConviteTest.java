package br.com.interatletica.identidade;

import br.com.interatletica.atletica.Papel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * O convite é a única porta de entrada da plataforma. O que se testa aqui é
 * a tranca: quem pode passar, por quanto tempo, e uma vez só.
 */
class ConviteTest {

    private static final UUID ATLETICA = UUID.randomUUID();
    private static final UUID AUTOR = UUID.randomUUID();

    private Convite convite(String email, int validadeDias) {
        return new Convite(ATLETICA, email, Papel.MEMBRO, AUTOR, validadeDias);
    }

    @Test
    @DisplayName("o token cabe no VARCHAR(64) e é seguro para URL")
    void tokenCabeNaColunaEnaUrl() {
        // 32 bytes em Base64 sem padding dão 43 caracteres. O token viaja
        // num link de WhatsApp, então nada de '+', '/' ou '=' — que o
        // encurtador ou o cliente de mensagem escapariam pelo caminho.
        String token = convite("ana@u.br", 7).getToken();

        assertEquals(43, token.length());
        assertTrue(token.matches("^[A-Za-z0-9_-]+$"), "token não é URL-safe: " + token);
    }

    @Test
    @DisplayName("tokens não se repetem")
    void tokensSaoDistintos() {
        // Repetição aqui não é colisão azarada: é um convite abrindo a porta
        // de outra atlética. O uk_convite_token barraria a inserção, mas o
        // sintoma seria convite falhando sem explicação.
        Set<String> vistos = new HashSet<>();
        for (int i = 0; i < 500; i++) {
            assertTrue(vistos.add(convite("ana@u.br", 7).getToken()), "token repetido");
        }
    }

    @Test
    @DisplayName("o e-mail é normalizado na entrada")
    void normalizaEmail() {
        // O Google devolve o e-mail como cadastrado. Guardar "  Ana@U.BR  "
        // cru faria o aceite falhar por comparação de caixa.
        assertEquals("ana@u.br", convite("  Ana@U.BR  ", 7).getEmail());
    }

    @Test
    @DisplayName("a comparação de destinatário ignora caixa e espaço")
    void comparaDestinatarioComTolerancia() {
        Convite convite = convite("ana@u.br", 7);

        assertTrue(convite.enderecadoA("ANA@U.BR"));
        assertTrue(convite.enderecadoA(" ana@u.br "));
        assertFalse(convite.enderecadoA("bruno@u.br"));
        assertFalse(convite.enderecadoA(null), "null não pode casar com ninguém");
    }

    @Test
    @DisplayName("nasce pendente")
    void nascePendente() {
        Convite convite = convite("ana@u.br", 7);

        assertTrue(convite.estaPendente());
        assertFalse(convite.expirou());
    }

    @Test
    @DisplayName("convite vencido não está mais pendente")
    void vencidoNaoEstaPendente() {
        // Validade negativa simula a passagem do tempo. Na prática esse
        // estado é alcançado pelo relógio, não pelo construtor — o CHECK
        // ck_convite_validade impede gravar um convite já vencido.
        Convite convite = convite("ana@u.br", -1);

        assertTrue(convite.expirou());
        assertFalse(convite.estaPendente());
    }

    @Test
    @DisplayName("uso único: aceito deixa de estar pendente")
    void aceitarConsomeOConvite() {
        Convite convite = convite("ana@u.br", 7);
        UUID quemAceitou = UUID.randomUUID();

        convite.aceitar(quemAceitou);

        assertFalse(convite.estaPendente(), "um convite aceito não pode ser reusado");
        assertNotNull(convite.getAceitoEm());
        assertEquals(quemAceitou, convite.getAceitoPor(),
                "quem aceitou precisa ficar registrado: a diretoria muda todo ano");
    }

    @Test
    @DisplayName("revogado deixa de estar pendente")
    void revogarFechaAPorta() {
        Convite convite = convite("ana@u.br", 7);

        convite.revogar();

        assertFalse(convite.estaPendente());
    }

    @Test
    @DisplayName("o papel convidado é preservado — é ele que vira o vínculo")
    void preservaOPapel() {
        // Quem aceita entra com o papel do convite. Trocar isso por um
        // padrão silencioso daria presidência a quem foi chamado de membro,
        // ou o contrário.
        Convite convite = new Convite(ATLETICA, "ana@u.br", Papel.PRESIDENTE, AUTOR, 7);

        assertEquals(Papel.PRESIDENTE, convite.getPapel());
    }
}
