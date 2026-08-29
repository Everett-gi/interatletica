package br.com.interatletica.evento;

import br.com.interatletica.comum.tenant.ContextoAtletica;
import br.com.interatletica.evento.EventoDtos.InscricaoResposta;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * "Meus eventos": onde a pessoa logada está inscrita, em qualquer atlética.
 *
 * <p>Fica em {@code /api/eu/...}, e não sob {@code /api/a/{slug}/...}, porque
 * a resposta cruza atléticas de propósito. Sob uma rota de tenant o filtro do
 * Hibernate estaria ligado e a lista traria só as inscrições de uma delas —
 * silenciosamente, que é o pior jeito de errar.</p>
 */
@RestController
public class MinhasInscricoesController {

    private final ServicoDeInscricao servico;

    public MinhasInscricoesController(ServicoDeInscricao servico) {
        this.servico = servico;
    }

    @GetMapping("/api/eu/inscricoes")
    public List<InscricaoResposta> minhas() {
        return ContextoAtletica.consultarSemFiltro(servico::minhasInscricoes);
    }
}
