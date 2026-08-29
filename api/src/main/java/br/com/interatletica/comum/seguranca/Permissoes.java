package br.com.interatletica.comum.seguranca;

import br.com.interatletica.atletica.Membro;
import br.com.interatletica.atletica.Papel;
import br.com.interatletica.atletica.RepositorioDeAtletica;
import br.com.interatletica.atletica.RepositorioDeMembro;
import br.com.interatletica.comum.PropriedadesDaAplicacao;
import br.com.interatletica.comum.tenant.ContextoAtletica;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Autorização por atlética, para uso em {@code @PreAuthorize}:
 *
 * <pre>
 * &#64;PreAuthorize("@permissao.diretor()")
 * public EventoResposta criar(...)
 * </pre>
 *
 * <p>Papel não pode virar {@code GrantedAuthority} no login porque depende
 * de qual atlética a requisição está acessando — a mesma sessão navega entre
 * várias, e a mesma pessoa é presidente numa e membro em outra. A pergunta
 * "qual é o papel?" só tem resposta com a atlética em mãos, então é aqui,
 * com o {@link ContextoAtletica} já resolvido pelo filtro HTTP, que ela é
 * respondida.</p>
 *
 * <p><strong>Regra de escrita:</strong> {@link #diretor()} e
 * {@link #presidente()} exigem também que a atlética esteja ATIVA. Atlética
 * suspensa ou arquivada continua legível — o histórico não some — mas não
 * aceita escrita. {@link #membro()} não faz essa checagem justamente por ser
 * a permissão de leitura.</p>
 */
@Component("permissao")
public class Permissoes {

    private final RepositorioDeMembro repositorioDeMembro;
    private final RepositorioDeAtletica repositorioDeAtletica;
    private final PropriedadesDaAplicacao propriedades;

    public Permissoes(RepositorioDeMembro repositorioDeMembro,
                      RepositorioDeAtletica repositorioDeAtletica,
                      PropriedadesDaAplicacao propriedades) {
        this.repositorioDeMembro = repositorioDeMembro;
        this.repositorioDeAtletica = repositorioDeAtletica;
        this.propriedades = propriedades;
    }

    /**
     * Operador da plataforma: quem pode CRIAR atléticas.
     *
     * <p>É a única permissão que não vem do banco, e sim de
     * {@code app.operadores} no {@code .env}. Colocá-la numa tabela criaria a
     * pergunta "quem promove o primeiro operador?" e, com ela, um endereço de
     * escalada de privilégio dentro do próprio sistema. Em arquivo de
     * ambiente, mudar essa lista exige acesso ao servidor — que é exatamente
     * o nível de acesso que a decisão merece.</p>
     *
     * <p>Território comum: operador abre a porta e sai. Ele não vira membro
     * nem presidente de nada — quem preside é quem recebe o convite.</p>
     */
    public boolean operador() {
        return SessaoAtual.usuario()
                .map(u -> propriedades.ehOperador(u.getEmail()))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean membro() {
        return vinculo().filter(Membro::estaAtivo).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean diretor() {
        return temPapelParaEscrever(Papel.DIRETOR);
    }

    @Transactional(readOnly = true)
    public boolean presidente() {
        return temPapelParaEscrever(Papel.PRESIDENTE);
    }

    /**
     * O vínculo do usuário logado com a atlética da requisição, para quando
     * o serviço precisa do próprio {@code Membro} — e não só do sim/não.
     */
    @Transactional(readOnly = true)
    public Membro exigirVinculoAtivo() {
        return vinculo()
                .filter(Membro::estaAtivo)
                .orElseThrow(() -> new AccessDeniedException(
                        "Você não é membro ativo desta atlética."));
    }

    private boolean temPapelParaEscrever(Papel exigido) {
        return atleticaOperante() && vinculo()
                .filter(m -> m.podeAtuarComo(exigido))
                .isPresent();
    }

    private boolean atleticaOperante() {
        return ContextoAtletica.atual()
                .flatMap(repositorioDeAtletica::findById)
                .filter(a -> a.podeOperar())
                .isPresent();
    }

    private Optional<Membro> vinculo() {
        Optional<UUID> atletica = ContextoAtletica.atual();
        Optional<UUID> usuario = SessaoAtual.usuarioId();
        if (atletica.isEmpty() || usuario.isEmpty()) {
            // Rota sem tenant resolvido, ou sessão anônima. Não é erro: é
            // resposta negativa a "esta pessoa pode?".
            return Optional.empty();
        }
        return repositorioDeMembro.doVinculo(atletica.get(), usuario.get());
    }
}
