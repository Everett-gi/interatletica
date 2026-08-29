package br.com.interatletica.atletica;

import br.com.interatletica.atletica.AtleticaDtos.AtleticaResposta;
import br.com.interatletica.atletica.AtleticaDtos.AtleticaResumo;
import br.com.interatletica.atletica.AtleticaDtos.MudancaDeSituacao;
import br.com.interatletica.atletica.AtleticaDtos.NovaAtletica;
import br.com.interatletica.atletica.ServicoDeAtletica.AtleticaCriada;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

/**
 * Rotas que existem ACIMA de qualquer atlética: a vitrine pública e a
 * administração da plataforma.
 *
 * <p>Nenhuma delas fica sob {@code /api/a/{slug}/...}, então nenhuma tem
 * tenant no contexto. É proposital: a vitrine lista todas as atléticas, e
 * criar uma atlética acontece quando ela ainda não existe para ser
 * contexto de nada.</p>
 */
@RestController
public class PlataformaController {

    private final ServicoDeAtletica servico;

    public PlataformaController(ServicoDeAtletica servico) {
        this.servico = servico;
    }

    /** Vitrine: quem já está na plataforma. Aberta, sem login. */
    @GetMapping("/api/publico/atleticas")
    public List<AtleticaResumo> vitrine() {
        return servico.vitrine();
    }

    /** Cabeçalho da página pública da atlética — nome, brasão, cores. */
    @GetMapping("/api/publico/atleticas/{slug}")
    public AtleticaResumo perfilPublico(@PathVariable String slug) {
        return servico.perfilPublico(slug);
    }

    /**
     * Abre uma atlética e devolve o convite do primeiro presidente.
     *
     * <p>Restrito a operador da plataforma. Não existe autocadastro: sem essa
     * porta fechada, moderar atlética falsa vira trabalho de alguém já na
     * primeira semana.</p>
     */
    @PostMapping("/api/atleticas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissao.operador()")
    public AtleticaCriada criar(@Valid @RequestBody NovaAtletica dados) {
        return servico.criar(dados);
    }

    @PutMapping("/api/atleticas/{slug}/situacao")
    @PreAuthorize("@permissao.operador()")
    public AtleticaResposta alterarSituacao(@PathVariable String slug,
                                            @Valid @RequestBody MudancaDeSituacao dados) {
        return servico.alterarSituacao(slug, dados);
    }
}
