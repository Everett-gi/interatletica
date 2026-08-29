package br.com.interatletica.identidade;

import br.com.interatletica.atletica.Papel;
import br.com.interatletica.comum.tenant.EntidadeDeAtletica;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * Convite para entrar numa atlética. Uso único, com validade e destinatário.
 *
 * <p>O convite é endereçado a um e-mail, e não apenas ao portador do token,
 * porque o link viaja por grupo de WhatsApp e é encaminhado. Sem essa
 * amarração, um único link vazado matricula o grupo inteiro — e a moderação
 * volta a ser trabalho manual da diretoria, que é exatamente o que o convite
 * existe para evitar.</p>
 */
@Entity
@Table(name = "convite")
@Filter(name = EntidadeDeAtletica.FILTRO, condition = "atletica_id = :atleticaId")
public class Convite extends EntidadeDeAtletica {

    /**
     * 32 bytes de {@link SecureRandom} em Base64 sem padding: 43 caracteres,
     * dentro do VARCHAR(64) da coluna. É o segredo que autoriza a entrada,
     * então precisa ser imprevisível — {@code UUID.randomUUID()} também
     * serviria, mas gera 122 bits contra 256 e não deixa a intenção clara.
     */
    private static final SecureRandom ALEATORIO = new SecureRandom();

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 180)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Papel papel = Papel.MEMBRO;

    @Column(nullable = false, length = 64, updatable = false)
    private String token;

    @Column(name = "criado_por", nullable = false, updatable = false)
    private UUID criadoPor;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "aceito_em")
    private OffsetDateTime aceitoEm;

    @Column(name = "aceito_por")
    private UUID aceitoPor;

    @Column(name = "revogado_em")
    private OffsetDateTime revogadoEm;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected Convite() {
    }

    public Convite(UUID atleticaId, String email, Papel papel, UUID criadoPor, int validadeDias) {
        setAtleticaId(atleticaId);
        this.email = email.trim().toLowerCase();
        this.papel = papel;
        this.criadoPor = criadoPor;
        this.token = gerarToken();
        this.expiraEm = OffsetDateTime.now().plusDays(validadeDias);
    }

    private static String gerarToken() {
        byte[] bytes = new byte[32];
        ALEATORIO.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public boolean estaPendente() {
        return aceitoEm == null && revogadoEm == null && !expirou();
    }

    public boolean expirou() {
        return expiraEm.isBefore(OffsetDateTime.now());
    }

    /** Comparação em minúsculas: o Google devolve o e-mail como cadastrado. */
    public boolean enderecadoA(String outroEmail) {
        return outroEmail != null && email.equalsIgnoreCase(outroEmail.trim());
    }

    public void aceitar(UUID usuarioId) {
        this.aceitoEm = OffsetDateTime.now();
        this.aceitoPor = usuarioId;
    }

    public void revogar() {
        this.revogadoEm = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public Papel getPapel() {
        return papel;
    }

    public String getToken() {
        return token;
    }

    public UUID getCriadoPor() {
        return criadoPor;
    }

    public OffsetDateTime getExpiraEm() {
        return expiraEm;
    }

    public OffsetDateTime getAceitoEm() {
        return aceitoEm;
    }

    /** Quem aceitou. O convite é endereçado, mas quem entra é auditado. */
    public UUID getAceitoPor() {
        return aceitoPor;
    }

    public OffsetDateTime getRevogadoEm() {
        return revogadoEm;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }
}
