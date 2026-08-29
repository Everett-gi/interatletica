package br.com.interatletica.identidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Conta única e global da plataforma.
 *
 * <p>Um usuário existe uma vez só, mesmo que participe de cinco atléticas.
 * Papel e cargo NÃO moram aqui — moram em {@code Membro}, porque são
 * relativos a cada vínculo. A mesma pessoa pode ser presidente numa
 * atlética e membro comum em outra.</p>
 *
 * <p>Esta entidade não estende {@code EntidadeDeAtletica}: usuário não
 * pertence a tenant nenhum.</p>
 */
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 180)
    private String email;

    /**
     * Claim {@code sub} do Google. É o identificador estável da conta: o
     * e-mail do usuário pode mudar, o sub não. Toda reconciliação de login
     * é feita por aqui, e o e-mail é só um atributo atualizável.
     */
    @Column(name = "provedor_sub", length = 180)
    private String provedorSub;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(length = 20)
    private String telefone;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "ultimo_acesso_em")
    private OffsetDateTime ultimoAcessoEm;

    // O banco também tem DEFAULT now() e gatilho de atualização. Os dois
    // concordam; manter aqui evita ter de reler a linha só para exibir a
    // data logo depois de criar o registro.
    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected Usuario() {
    }

    public Usuario(String nome, String email, String provedorSub, String avatarUrl) {
        this.nome = nome;
        this.email = email;
        this.provedorSub = provedorSub;
        this.avatarUrl = avatarUrl;
    }

    /**
     * Sincroniza os dados que o provedor de identidade controla. Chamado a
     * cada login: nome e foto mudam no Google e devem refletir aqui.
     */
    public void sincronizarComProvedor(String nome, String email, String avatarUrl) {
        this.nome = nome;
        this.email = email;
        this.avatarUrl = avatarUrl;
    }

    public void vincularProvedor(String provedorSub) {
        this.provedorSub = provedorSub;
    }

    public void registrarAcesso() {
        this.ultimoAcessoEm = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getProvedorSub() {
        return provedorSub;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public OffsetDateTime getUltimoAcessoEm() {
        return ultimoAcessoEm;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }
}
