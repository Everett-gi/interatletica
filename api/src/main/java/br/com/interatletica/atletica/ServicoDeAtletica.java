package br.com.interatletica.atletica;

import br.com.interatletica.atletica.AtleticaDtos.AtleticaResposta;
import br.com.interatletica.atletica.AtleticaDtos.AtleticaResumo;
import br.com.interatletica.atletica.AtleticaDtos.AtualizacaoDeAtletica;
import br.com.interatletica.atletica.AtleticaDtos.IdentidadeVisual;
import br.com.interatletica.atletica.AtleticaDtos.MinhaAtletica;
import br.com.interatletica.atletica.AtleticaDtos.MudancaDeSituacao;
import br.com.interatletica.atletica.AtleticaDtos.NovaAtletica;
import br.com.interatletica.comum.Slugs;
import br.com.interatletica.comum.auditoria.Acoes;
import br.com.interatletica.comum.auditoria.Auditoria;
import br.com.interatletica.comum.erro.RecursoNaoEncontradoException;
import br.com.interatletica.comum.erro.RegraDeNegocioException;
import br.com.interatletica.comum.seguranca.SessaoAtual;
import br.com.interatletica.comum.tenant.ContextoAtletica;
import br.com.interatletica.identidade.ConviteDtos.ConviteResposta;
import br.com.interatletica.identidade.ConviteDtos.NovoConvite;
import br.com.interatletica.identidade.ServicoDeConvite;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ServicoDeAtletica {

    /** Mesmo limite de {@code atletica.slug VARCHAR(60)}. */
    private static final int TAMANHO_DO_SLUG = 60;

    private final RepositorioDeAtletica repositorio;
    private final RepositorioDeMembro repositorioDeMembro;
    private final ServicoDeConvite servicoDeConvite;
    private final Auditoria auditoria;

    public ServicoDeAtletica(RepositorioDeAtletica repositorio,
                             RepositorioDeMembro repositorioDeMembro,
                             ServicoDeConvite servicoDeConvite,
                             Auditoria auditoria) {
        this.repositorio = repositorio;
        this.repositorioDeMembro = repositorioDeMembro;
        this.servicoDeConvite = servicoDeConvite;
        this.auditoria = auditoria;
    }

    /**
     * Abre uma atlética e convida o primeiro presidente.
     *
     * <p>Os dois passos são um só de propósito. Atlética sem presidente é um
     * registro morto: ninguém pode convidar ninguém, e ela precisaria de
     * intervenção manual no banco para ganhar vida. Sair desta transação com
     * a atlética criada e o convite não criado seria produzir exatamente esse
     * estado — então ou os dois acontecem, ou nenhum.</p>
     *
     * <p>O operador que cria NÃO vira membro. Território comum: quem
     * administra a plataforma não administra atlética nenhuma.</p>
     */
    @Transactional
    public AtleticaCriada criar(NovaAtletica dados) {
        String slug = dados.slug() != null && !dados.slug().isBlank()
                ? dados.slug()
                : Slugs.unico(dados.nome(), TAMANHO_DO_SLUG, repositorio::slugEmUso);

        if (repositorio.slugEmUso(slug)) {
            throw new RegraDeNegocioException("SLUG_EM_USO",
                    "O endereço /%s já pertence a outra atlética.".formatted(slug));
        }

        Atletica atletica = new Atletica(slug, dados.nome().trim(), dados.instituicao().trim());
        atletica.atualizarPerfil(dados.nome().trim(), dados.sigla(), dados.instituicao().trim(),
                dados.cidade(), dados.uf(), null);
        repositorio.save(atletica);

        ConviteResposta convite = servicoDeConvite.convidarPara(atletica.getId(),
                new NovoConvite(dados.emailDoPresidente(), Papel.PRESIDENTE));

        auditoria.registrar(Acoes.ATLETICA_CRIADA, Acoes.E_ATLETICA, atletica.getId(),
                Map.of("slug", slug, "presidenteConvidado", dados.emailDoPresidente()));

        return new AtleticaCriada(AtleticaResposta.de(atletica), convite);
    }

    @Transactional(readOnly = true)
    public AtleticaResposta perfil() {
        return AtleticaResposta.de(exigirAtual());
    }

    /** Vitrine da plataforma, sem login. */
    @Transactional(readOnly = true)
    public List<AtleticaResumo> vitrine() {
        return repositorio.ativas().stream().map(AtleticaResumo::de).toList();
    }

    @Transactional(readOnly = true)
    public AtleticaResumo perfilPublico(String slug) {
        return repositorio.porSlug(slug)
                .map(AtleticaResumo::de)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atlética", slug));
    }

    /** Seletor do topo do app: onde esta pessoa tem vínculo e com que papel. */
    @Transactional(readOnly = true)
    public List<MinhaAtletica> minhas() {
        UUID usuarioId = SessaoAtual.exigirUsuarioId();
        return repositorioDeMembro.vinculosAtivosDoUsuario(usuarioId).stream()
                .map(membro -> repositorio.findById(membro.getAtleticaId())
                        .map(a -> new MinhaAtletica(
                                AtleticaResumo.de(a), membro.getPapel(), membro.getCargo()))
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .sorted(java.util.Comparator.comparing(m -> m.atletica().nome()))
                .toList();
    }

    @Transactional
    public AtleticaResposta atualizar(AtualizacaoDeAtletica dados) {
        Atletica atletica = exigirAtual();
        atletica.atualizarPerfil(dados.nome().trim(), dados.sigla(), dados.instituicao().trim(),
                dados.cidade(), dados.uf(), dados.instagram());
        auditoria.registrar(Acoes.ATLETICA_ATUALIZADA, Acoes.E_ATLETICA, atletica.getId());
        return AtleticaResposta.de(atletica);
    }

    @Transactional
    public AtleticaResposta atualizarIdentidadeVisual(IdentidadeVisual dados) {
        Atletica atletica = exigirAtual();
        atletica.atualizarIdentidadeVisual(
                dados.brasaoUrl(), dados.corPrimaria(), dados.corSecundaria());
        auditoria.registrar(Acoes.ATLETICA_ATUALIZADA, Acoes.E_ATLETICA, atletica.getId(),
                Map.of("campo", "identidadeVisual"));
        return AtleticaResposta.de(atletica);
    }

    /**
     * Suspender ou arquivar é decisão de moderação da plataforma, não da
     * própria atlética — senão uma diretoria em fim de mandato poderia
     * arquivar a atlética e levar o histórico junto.
     */
    @Transactional
    public AtleticaResposta alterarSituacao(String slug, MudancaDeSituacao dados) {
        Atletica atletica = repositorio.porSlug(slug)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atlética", slug));
        atletica.alterarSituacao(dados.situacao());
        auditoria.registrar(Acoes.ATLETICA_ATUALIZADA, Acoes.E_ATLETICA, atletica.getId(),
                Map.of("situacao", dados.situacao().name()));
        return AtleticaResposta.de(atletica);
    }

    private Atletica exigirAtual() {
        UUID id = ContextoAtletica.exigir();
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atlética", id));
    }

    public record AtleticaCriada(AtleticaResposta atletica, ConviteResposta conviteDoPresidente) {
    }
}
