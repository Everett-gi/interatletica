package br.com.interatletica.atletica;

import br.com.interatletica.comum.tenant.EntidadeDeAtletica;
import br.com.interatletica.identidade.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Vínculo usuário × atlética. É AQUI que mora a permissão.
 *
 * <p>A mesma pessoa pode ser presidente numa atlética e membro comum em
 * outra, então papel é propriedade do vínculo — nunca do usuário. Toda
 * verificação de autorização passa por esta tabela com o {@code atletica_id}
 * da requisição corrente.</p>
 */
@Entity
@Table(name = "membro")
@Filter(name = EntidadeDeAtletica.FILTRO, condition = "atletica_id = :atleticaId")
public class Membro extends EntidadeDeAtletica {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, updatable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Papel papel = Papel.MEMBRO;

    /**
     * Rótulo livre exibido na interface ("Diretor de Esports"). Não tem
     * efeito nenhum sobre permissão — quem decide isso é {@link #papel}.
     */
    @Column(length = 80)
    private String cargo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SituacaoMembro situacao = SituacaoMembro.ATIVO;

    @Column(name = "entrou_em", nullable = false)
    private OffsetDateTime entrouEm = OffsetDateTime.now();

    @Column(name = "saiu_em")
    private OffsetDateTime saiuEm;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected Membro() {
    }

    public Membro(UUID atleticaId, Usuario usuario, Papel papel) {
        setAtleticaId(atleticaId);
        this.usuario = usuario;
        this.papel = papel;
    }

    /** Só membro ATIVO tem permissão; o histórico dos demais é preservado. */
    public boolean estaAtivo() {
        return situacao == SituacaoMembro.ATIVO;
    }

    public boolean podeAtuarComo(Papel exigido) {
        return estaAtivo() && papel.podeAtuarComo(exigido);
    }

    public void alterarPapel(Papel novo) {
        this.papel = novo;
    }

    public void alterarCargo(String cargo) {
        this.cargo = cargo;
    }

    /**
     * Desliga o membro sem apagar a linha: as inscrições e os resultados de
     * torneio que ele produziu continuam apontando para um vínculo válido.
     */
    public void desligar() {
        this.situacao = SituacaoMembro.INATIVO;
        this.saiuEm = OffsetDateTime.now();
    }

    public void reativar() {
        this.situacao = SituacaoMembro.ATIVO;
        this.saiuEm = null;
        this.entrouEm = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Papel getPapel() {
        return papel;
    }

    public String getCargo() {
        return cargo;
    }

    public SituacaoMembro getSituacao() {
        return situacao;
    }

    public OffsetDateTime getEntrouEm() {
        return entrouEm;
    }

    public OffsetDateTime getSaiuEm() {
        return saiuEm;
    }
}
