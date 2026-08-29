package br.com.interatletica.identidade;

import br.com.interatletica.atletica.Atletica;
import br.com.interatletica.atletica.Membro;
import br.com.interatletica.atletica.RepositorioDeAtletica;
import br.com.interatletica.atletica.RepositorioDeMembro;
import br.com.interatletica.comum.PropriedadesDaAplicacao;
import br.com.interatletica.comum.auditoria.Acoes;
import br.com.interatletica.comum.auditoria.Auditoria;
import br.com.interatletica.comum.erro.RecursoNaoEncontradoException;
import br.com.interatletica.comum.erro.RegraDeNegocioException;
import br.com.interatletica.comum.seguranca.SessaoAtual;
import br.com.interatletica.comum.seguranca.UsuarioAutenticado;
import br.com.interatletica.comum.tenant.ContextoAtletica;
import br.com.interatletica.identidade.ConviteDtos.ConvitePendente;
import br.com.interatletica.identidade.ConviteDtos.ConviteResposta;
import br.com.interatletica.identidade.ConviteDtos.NovoConvite;
import br.com.interatletica.identidade.ConviteDtos.ResultadoDoAceite;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Regras do convite — a única porta de entrada em uma atlética.
 */
@Service
public class ServicoDeConvite {

    private final RepositorioDeConvite repositorio;
    private final RepositorioDeMembro repositorioDeMembro;
    private final RepositorioDeAtletica repositorioDeAtletica;
    private final RepositorioDeUsuario repositorioDeUsuario;
    private final PropriedadesDaAplicacao propriedades;
    private final Auditoria auditoria;

    public ServicoDeConvite(RepositorioDeConvite repositorio,
                            RepositorioDeMembro repositorioDeMembro,
                            RepositorioDeAtletica repositorioDeAtletica,
                            RepositorioDeUsuario repositorioDeUsuario,
                            PropriedadesDaAplicacao propriedades,
                            Auditoria auditoria) {
        this.repositorio = repositorio;
        this.repositorioDeMembro = repositorioDeMembro;
        this.repositorioDeAtletica = repositorioDeAtletica;
        this.repositorioDeUsuario = repositorioDeUsuario;
        this.propriedades = propriedades;
        this.auditoria = auditoria;
    }

    /**
     * Cria — ou reaproveita — o convite para um e-mail.
     *
     * <p>Convidar duas vezes devolve o MESMO convite em vez de erro. A
     * diretoria manda o link pelo WhatsApp e o link se perde na rolagem; o
     * caminho natural é clicar em "convidar" de novo. Recusar isso seria
     * ensinar a diretoria a revogar antes de reconvidar, e acumular convites
     * pendentes duplicados não protege de nada.</p>
     */
    @Transactional
    public ConviteResposta convidar(NovoConvite dados) {
        return convidarPara(ContextoAtletica.exigir(), dados);
    }

    /**
     * Convite com a atlética informada, e não lida do contexto.
     *
     * <p>Existe para a criação de atlética: o operador da plataforma cria a
     * atlética e convida o primeiro presidente na mesma requisição, numa rota
     * que não tem slug — logo, sem tenant no contexto para {@code exigir()}
     * encontrar.</p>
     */
    @Transactional
    public ConviteResposta convidarPara(UUID atleticaId, NovoConvite dados) {
        UUID autor = SessaoAtual.exigirUsuarioId();
        String email = dados.email().trim().toLowerCase();

        repositorioDeUsuario.porEmail(email)
                .flatMap(u -> repositorioDeMembro.doVinculo(atleticaId, u.getId()))
                .filter(Membro::estaAtivo)
                .ifPresent(m -> {
                    throw new RegraDeNegocioException("JA_E_MEMBRO",
                            "%s já é membro ativo desta atlética.".formatted(email));
                });

        Convite convite = repositorio
                .pendentePara(atleticaId, email, OffsetDateTime.now())
                .orElseGet(() -> {
                    Convite novo = new Convite(atleticaId, email, dados.papel(), autor,
                            propriedades.convite().validadeDias());
                    repositorio.save(novo);
                    auditoria.registrar(Acoes.CONVITE_CRIADO, Acoes.E_CONVITE, novo.getId(),
                            Map.of("email", email, "papel", dados.papel().name()));
                    return novo;
                });

        return ConviteResposta.de(convite, propriedades.urlBase());
    }

    @Transactional(readOnly = true)
    public List<ConviteResposta> pendentes() {
        return repositorio.pendentesDaAtletica(ContextoAtletica.exigir(), OffsetDateTime.now())
                .stream()
                .map(convite -> ConviteResposta.de(convite, propriedades.urlBase()))
                .toList();
    }

    @Transactional
    public void revogar(UUID conviteId) {
        Convite convite = repositorio.findById(conviteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Convite", conviteId));

        if (!convite.estaPendente()) {
            throw new RegraDeNegocioException("CONVITE_NAO_PENDENTE",
                    "Este convite já foi aceito, revogado ou expirou.");
        }
        convite.revogar();
        auditoria.registrar(Acoes.CONVITE_REVOGADO, Acoes.E_CONVITE, conviteId);
    }

    /**
     * Mostra o convite ao destinatário antes do aceite: ele precisa saber de
     * qual atlética e com qual papel está entrando.
     *
     * <p>Roda sem atlética no contexto — quem abre o link ainda não tem
     * vínculo nenhum —, então o chamador suspende o filtro de atlética
     * explicitamente.</p>
     */
    @Transactional(readOnly = true)
    public ConvitePendente examinar(String token) {
        Convite convite = exigirConvitePendente(token);
        return resumir(convite);
    }

    @Transactional
    public ResultadoDoAceite aceitar(String token) {
        UsuarioAutenticado autenticado = SessaoAtual.usuario().orElseThrow(
                () -> new IllegalStateException("Aceite de convite sem sessão autenticada."));

        Convite convite = exigirConvitePendente(token);

        // A amarração ao e-mail é o que impede que um link encaminhado no
        // grupo do WhatsApp matricule quem passar por ele.
        if (!convite.enderecadoA(autenticado.getEmail())) {
            throw new RegraDeNegocioException("CONVITE_DE_OUTRO_EMAIL",
                    "Este convite foi enviado para %s. Entre com essa conta para aceitá-lo."
                            .formatted(mascarar(convite.getEmail())));
        }

        Atletica atletica = exigirAtletica(convite.getAtleticaId());
        Usuario usuario = repositorioDeUsuario.findById(autenticado.getUsuarioId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário", autenticado.getUsuarioId()));

        Membro membro = repositorioDeMembro
                .doVinculo(atletica.getId(), usuario.getId())
                .map(existente -> reativar(existente, convite, atletica))
                .orElseGet(() -> repositorioDeMembro.save(
                        new Membro(atletica.getId(), usuario, convite.getPapel())));

        convite.aceitar(usuario.getId());

        auditoria.registrar(Acoes.CONVITE_ACEITO, Acoes.E_MEMBRO, membro.getId(),
                Map.of("atletica", atletica.getSlug(), "papel", convite.getPapel().name()));

        return new ResultadoDoAceite(atletica.getSlug(), atletica.getNome(), convite.getPapel());
    }

    /**
     * Quem saiu e foi reconvidado reativa o vínculo antigo. Criar outro
     * violaria {@code uk_membro_vinculo} e apagaria a data em que essa pessoa
     * entrou pela primeira vez.
     */
    private Membro reativar(Membro existente, Convite convite, Atletica atletica) {
        if (existente.estaAtivo()) {
            throw new RegraDeNegocioException("JA_E_MEMBRO",
                    "Você já é membro de %s.".formatted(atletica.getNome()));
        }
        existente.reativar();
        existente.alterarPapel(convite.getPapel());
        return existente;
    }

    /** Caixa de entrada do usuário logado: convites que o esperam. */
    @Transactional(readOnly = true)
    public List<ConvitePendente> meusConvites(String email) {
        return repositorio.pendentesDoEmail(email, OffsetDateTime.now()).stream()
                .map(this::resumir)
                .toList();
    }

    private ConvitePendente resumir(Convite convite) {
        Atletica atletica = exigirAtletica(convite.getAtleticaId());
        return new ConvitePendente(
                atletica.getNome(),
                atletica.getSlug(),
                atletica.getBrasaoUrl(),
                convite.getPapel(),
                convite.getExpiraEm());
    }

    private Convite exigirConvitePendente(String token) {
        Convite convite = repositorio.porToken(token)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Convite não encontrado. Verifique o link recebido."));

        if (convite.getRevogadoEm() != null) {
            throw new RegraDeNegocioException("CONVITE_REVOGADO",
                    "Este convite foi cancelado pela diretoria.");
        }
        if (convite.getAceitoEm() != null) {
            throw new RegraDeNegocioException("CONVITE_JA_USADO",
                    "Este convite já foi utilizado.");
        }
        if (convite.expirou()) {
            throw new RegraDeNegocioException("CONVITE_EXPIRADO",
                    "Este convite expirou. Peça um novo à diretoria.");
        }
        return convite;
    }

    private Atletica exigirAtletica(UUID id) {
        return repositorioDeAtletica.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atlética", id));
    }

    /**
     * Devolve algo como {@code ma***@gmail.com}. Quem tem o link já veria o
     * e-mail se a mensagem viesse completa; mascarar evita transformar um
     * link vazado em fonte de coleta de e-mails de alunos.
     */
    private String mascarar(String email) {
        int arroba = email.indexOf('@');
        if (arroba <= 2) {
            return "***" + email.substring(Math.max(arroba, 0));
        }
        return email.substring(0, 2) + "***" + email.substring(arroba);
    }
}
