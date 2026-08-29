package br.com.interatletica.atletica;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * O tenant. Não estende {@code EntidadeDeAtletica} porque não pertence a
 * uma atlética — ela É a atlética; filtrar esta tabela pelo próprio id não
 * faria sentido e esconderia a página pública de outras atléticas.
 *
 * <p>Entrada é por convite: não existe autocadastro. Sem essa porta fechada,
 * moderar cadastros vira trabalho da diretoria já na primeira semana.</p>
 */
@Entity
@Table(name = "atletica")
public class Atletica {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Identificador em URL pública ({@code /a/{slug}/eventos}) e chave de
     * roteamento do multi-tenant. Imutável depois de publicado: o link já
     * circulou em grupo de WhatsApp e não pode quebrar.
     */
    @Column(nullable = false, length = 60, updatable = false)
    private String slug;

    @Column(nullable = false, length = 140)
    private String nome;

    @Column(length = 20)
    private String sigla;

    @Column(nullable = false, length = 160)
    private String instituicao;

    @Column(length = 90)
    private String cidade;

    @Column(length = 2, columnDefinition = "bpchar")
    private String uf;

    @Column(name = "brasao_url")
    private String brasaoUrl;

    @Column(name = "cor_primaria", length = 7, columnDefinition = "bpchar")
    private String corPrimaria;

    @Column(name = "cor_secundaria", length = 7, columnDefinition = "bpchar")
    private String corSecundaria;

    @Column(length = 60)
    private String instagram;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SituacaoAtletica situacao = SituacaoAtletica.ATIVA;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected Atletica() {
    }

    public Atletica(String slug, String nome, String instituicao) {
        this.slug = slug;
        this.nome = nome;
        this.instituicao = instituicao;
    }

    public boolean podeOperar() {
        return situacao == SituacaoAtletica.ATIVA;
    }

    public void atualizarPerfil(String nome, String sigla, String instituicao, String cidade,
                                String uf, String instagram) {
        this.nome = nome;
        this.sigla = sigla;
        this.instituicao = instituicao;
        this.cidade = cidade;
        this.uf = uf;
        this.instagram = instagram;
    }

    public void atualizarIdentidadeVisual(String brasaoUrl, String corPrimaria, String corSecundaria) {
        this.brasaoUrl = brasaoUrl;
        this.corPrimaria = corPrimaria;
        this.corSecundaria = corSecundaria;
    }

    public void alterarSituacao(SituacaoAtletica situacao) {
        this.situacao = situacao;
    }

    public UUID getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getNome() {
        return nome;
    }

    public String getSigla() {
        return sigla;
    }

    public String getInstituicao() {
        return instituicao;
    }

    public String getCidade() {
        return cidade;
    }

    public String getUf() {
        return uf;
    }

    public String getBrasaoUrl() {
        return brasaoUrl;
    }

    public String getCorPrimaria() {
        return corPrimaria;
    }

    public String getCorSecundaria() {
        return corSecundaria;
    }

    public String getInstagram() {
        return instagram;
    }

    public SituacaoAtletica getSituacao() {
        return situacao;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }
}
