package br.com.interatletica.identidade;

import br.com.interatletica.atletica.AtleticaDtos.MinhaAtletica;
import br.com.interatletica.atletica.ServicoDeAtletica;
import br.com.interatletica.comum.PropriedadesDaAplicacao;
import br.com.interatletica.comum.seguranca.SessaoAtual;
import br.com.interatletica.comum.seguranca.UsuarioAutenticado;
import br.com.interatletica.comum.tenant.ContextoAtletica;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Quem sou eu e onde eu ando.
 *
 * <p>É a primeira chamada que a PWA faz ao abrir: sem ela o app não sabe se
 * mostra "entrar com Google" ou o painel, nem quais atléticas oferecer no
 * seletor. Por isso a resposta traz tudo o que a primeira tela precisa em
 * uma requisição só.</p>
 */
@RestController
public class SessaoController {

    private final ServicoDeAtletica servicoDeAtletica;
    private final ServicoDeConvite servicoDeConvite;
    private final PropriedadesDaAplicacao propriedades;

    public SessaoController(ServicoDeAtletica servicoDeAtletica,
                            ServicoDeConvite servicoDeConvite,
                            PropriedadesDaAplicacao propriedades) {
        this.servicoDeAtletica = servicoDeAtletica;
        this.servicoDeConvite = servicoDeConvite;
        this.propriedades = propriedades;
    }

    /**
     * Aberta a anônimos, e devolve 204 quando não há sessão.
     *
     * <p>Um 401 aqui seria tecnicamente correto e péssimo na prática: o app
     * chama isto em toda abertura, e o console do navegador acumularia um
     * erro vermelho a cada visita de quem não está logado — treinando quem
     * desenvolve a ignorar 401 na aba de rede, que é onde os erros de sessão
     * de verdade aparecem.</p>
     */
    @GetMapping("/api/eu")
    public ResponseEntity<PerfilDaSessao> eu() {
        return SessaoAtual.usuario()
                .map(this::montarPerfil)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    private PerfilDaSessao montarPerfil(UsuarioAutenticado usuario) {
        // Sem filtro: as duas consultas cruzam atléticas de propósito — são
        // exatamente a pergunta "onde esta pessoa está?".
        List<MinhaAtletica> atleticas =
                ContextoAtletica.consultarSemFiltro(servicoDeAtletica::minhas);
        int convites = ContextoAtletica.consultarSemFiltro(
                () -> servicoDeConvite.meusConvites(usuario.getEmail()).size());

        return new PerfilDaSessao(
                usuario.getUsuarioId(),
                usuario.getName(),
                usuario.getEmail(),
                usuario.getAvatarUrl(),
                propriedades.ehOperador(usuario.getEmail()),
                atleticas,
                convites);
    }

    public record PerfilDaSessao(
            UUID id,
            String nome,
            String email,
            String avatarUrl,
            boolean operador,
            List<MinhaAtletica> atleticas,
            int convitesPendentes
    ) {
    }
}
