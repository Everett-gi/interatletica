package br.com.interatletica.evento;

import br.com.interatletica.comum.erro.RegraDeNegocioException;
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
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Evento de uma atlética: jogo, campeonato, festa, reunião.
 *
 * <p>{@code atletica_id} é a atlética ANFITRIÃ e dona do registro.
 * Coorganizadoras ficam em {@code evento_organizador} — um evento
 * interatlética tem uma dona e várias participantes.</p>
 *
 * <p>As transições de status vivem aqui, e não no serviço, porque são
 * invariantes do evento: publicar um evento cancelado ou reabrir inscrição
 * de um evento encerrado tem de ser impossível independentemente de qual
 * caminho chamou.</p>
 */
@Entity
@Table(name = "evento")
@Filter(name = EntidadeDeAtletica.FILTRO, condition = "atletica_id = :atleticaId")
public class Evento extends EntidadeDeAtletica {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 160)
    private String titulo;

    /** Parte do link curto: {@code /a/{atletica}/e/{slug}}. Imutável depois de publicado. */
    @Column(nullable = false, length = 80)
    private String slug;

    @Column(columnDefinition = "text")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoDeEvento tipo;

    /** "Vôlei feminino", "Valorant", "League of Legends". Texto livre. */
    @Column(length = 60)
    private String modalidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusDoEvento status = StatusDoEvento.RASCUNHO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Visibilidade visibilidade = Visibilidade.PUBLICO;

    @Column(name = "inicio_em", nullable = false)
    private OffsetDateTime inicioEm;

    @Column(name = "fim_em")
    private OffsetDateTime fimEm;

    @Column(name = "local_nome", length = 160)
    private String localNome;

    @Column(name = "local_endereco", columnDefinition = "text")
    private String localEndereco;

    @Column(name = "local_mapa_url", columnDefinition = "text")
    private String localMapaUrl;

    /** Nulo significa sem limite — e não "zero vagas". */
    private Integer capacidade;

    @Column(name = "inscricao_abre_em")
    private OffsetDateTime inscricaoAbreEm;

    @Column(name = "inscricao_fecha_em")
    private OffsetDateTime inscricaoFechaEm;

    @Column(name = "inscricao_por_equipe", nullable = false)
    private boolean inscricaoPorEquipe = false;

    @Column(name = "capa_url", columnDefinition = "text")
    private String capaUrl;

    /**
     * Gancho financeiro. Nada é cobrado nesta fase; a coluna existe para que
     * habilitar pagamento depois não seja migration destrutiva.
     */
    private BigDecimal valor;

    @Column(name = "criado_por", nullable = false, updatable = false)
    private UUID criadoPor;

    @Column(name = "publicado_em")
    private OffsetDateTime publicadoEm;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected Evento() {
    }

    public Evento(UUID atleticaId, String titulo, String slug, TipoDeEvento tipo,
                  OffsetDateTime inicioEm, UUID criadoPor) {
        setAtleticaId(atleticaId);
        this.titulo = titulo;
        this.slug = slug;
        this.tipo = tipo;
        this.inicioEm = inicioEm;
        this.criadoPor = criadoPor;
    }

    // -----------------------------------------------------------------
    // Transições de status
    // -----------------------------------------------------------------

    /**
     * Publicar é o que torna o evento visível e inscritível. Só acontece a
     * partir de RASCUNHO: republicar um evento encerrado ressuscitaria a
     * inscrição de algo que já aconteceu.
     */
    public void publicar() {
        if (status != StatusDoEvento.RASCUNHO) {
            throw new RegraDeNegocioException("EVENTO_NAO_E_RASCUNHO",
                    "Só um rascunho pode ser publicado. Este evento está %s."
                            .formatted(status.name().toLowerCase()));
        }
        this.status = StatusDoEvento.PUBLICADO;
        this.publicadoEm = OffsetDateTime.now();
    }

    public void cancelar() {
        if (status == StatusDoEvento.ENCERRADO) {
            throw new RegraDeNegocioException("EVENTO_ENCERRADO",
                    "Um evento que já aconteceu não pode ser cancelado.");
        }
        this.status = StatusDoEvento.CANCELADO;
    }

    public void encerrar() {
        if (status != StatusDoEvento.PUBLICADO) {
            throw new RegraDeNegocioException("EVENTO_NAO_PUBLICADO",
                    "Só um evento publicado pode ser encerrado.");
        }
        this.status = StatusDoEvento.ENCERRADO;
    }

    /**
     * Volta ao rascunho. Permitido só enquanto ninguém se inscreveu — a
     * checagem de inscrições é do serviço, que tem o repositório; aqui fica
     * a parte que depende só do próprio evento.
     */
    public void voltarParaRascunho() {
        if (status != StatusDoEvento.PUBLICADO) {
            throw new RegraDeNegocioException("EVENTO_NAO_PUBLICADO",
                    "Só um evento publicado pode voltar a rascunho.");
        }
        this.status = StatusDoEvento.RASCUNHO;
        this.publicadoEm = null;
    }

    // -----------------------------------------------------------------
    // Regras de inscrição
    // -----------------------------------------------------------------

    /**
     * Explica POR QUE a inscrição está fechada, em vez de devolver só um
     * booleano. A página pública precisa dizer "as inscrições abrem dia 12",
     * não apenas esconder o botão.
     */
    public MotivoDeFechamento motivoDeFechamento(OffsetDateTime agora) {
        if (status == StatusDoEvento.CANCELADO) {
            return MotivoDeFechamento.EVENTO_CANCELADO;
        }
        if (status == StatusDoEvento.ENCERRADO) {
            return MotivoDeFechamento.EVENTO_ENCERRADO;
        }
        if (status != StatusDoEvento.PUBLICADO) {
            return MotivoDeFechamento.EVENTO_NAO_PUBLICADO;
        }
        if (inscricaoAbreEm != null && agora.isBefore(inscricaoAbreEm)) {
            return MotivoDeFechamento.AINDA_NAO_ABRIU;
        }
        if (inscricaoFechaEm != null && agora.isAfter(inscricaoFechaEm)) {
            return MotivoDeFechamento.PRAZO_ENCERRADO;
        }
        // Sem prazo de fechamento definido, o início do evento é o limite:
        // ninguém se inscreve para uma festa que começou ontem.
        if (inscricaoFechaEm == null && agora.isAfter(inicioEm)) {
            return MotivoDeFechamento.EVENTO_JA_COMECOU;
        }
        return MotivoDeFechamento.ABERTA;
    }

    public boolean temLimiteDeVagas() {
        return capacidade != null;
    }

    // -----------------------------------------------------------------
    // Edição
    // -----------------------------------------------------------------

    public void atualizarDescricao(String titulo, String descricao, TipoDeEvento tipo,
                                   String modalidade, Visibilidade visibilidade, String capaUrl) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.tipo = tipo;
        this.modalidade = modalidade;
        this.visibilidade = visibilidade;
        this.capaUrl = capaUrl;
    }

    public void atualizarQuando(OffsetDateTime inicioEm, OffsetDateTime fimEm) {
        if (fimEm != null && fimEm.isBefore(inicioEm)) {
            throw new RegraDeNegocioException("PERIODO_INVALIDO",
                    "O fim do evento não pode ser antes do início.");
        }
        this.inicioEm = inicioEm;
        this.fimEm = fimEm;
    }

    public void atualizarOnde(String localNome, String localEndereco, String localMapaUrl) {
        this.localNome = localNome;
        this.localEndereco = localEndereco;
        this.localMapaUrl = localMapaUrl;
    }

    public void atualizarInscricao(Integer capacidade, OffsetDateTime abreEm,
                                   OffsetDateTime fechaEm, boolean porEquipe) {
        if (capacidade != null && capacidade <= 0) {
            throw new RegraDeNegocioException("CAPACIDADE_INVALIDA",
                    "Deixe a capacidade em branco para vagas ilimitadas.");
        }
        if (abreEm != null && fechaEm != null && fechaEm.isBefore(abreEm)) {
            throw new RegraDeNegocioException("JANELA_INVALIDA",
                    "O fechamento das inscrições não pode ser antes da abertura.");
        }
        this.capacidade = capacidade;
        this.inscricaoAbreEm = abreEm;
        this.inscricaoFechaEm = fechaEm;
        this.inscricaoPorEquipe = porEquipe;
    }

    // -----------------------------------------------------------------

    public UUID getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescricao() {
        return descricao;
    }

    public TipoDeEvento getTipo() {
        return tipo;
    }

    public String getModalidade() {
        return modalidade;
    }

    public StatusDoEvento getStatus() {
        return status;
    }

    public Visibilidade getVisibilidade() {
        return visibilidade;
    }

    public OffsetDateTime getInicioEm() {
        return inicioEm;
    }

    public OffsetDateTime getFimEm() {
        return fimEm;
    }

    public String getLocalNome() {
        return localNome;
    }

    public String getLocalEndereco() {
        return localEndereco;
    }

    public String getLocalMapaUrl() {
        return localMapaUrl;
    }

    public Integer getCapacidade() {
        return capacidade;
    }

    public OffsetDateTime getInscricaoAbreEm() {
        return inscricaoAbreEm;
    }

    public OffsetDateTime getInscricaoFechaEm() {
        return inscricaoFechaEm;
    }

    public boolean isInscricaoPorEquipe() {
        return inscricaoPorEquipe;
    }

    public String getCapaUrl() {
        return capaUrl;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public UUID getCriadoPor() {
        return criadoPor;
    }

    public OffsetDateTime getPublicadoEm() {
        return publicadoEm;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    /**
     * Motivo pelo qual a inscrição não está aberta. {@link #ABERTA} é o único
     * valor que libera.
     */
    public enum MotivoDeFechamento {
        ABERTA(null),
        EVENTO_NAO_PUBLICADO("As inscrições ainda não foram abertas."),
        AINDA_NAO_ABRIU("As inscrições ainda não começaram."),
        PRAZO_ENCERRADO("O prazo de inscrição terminou."),
        EVENTO_JA_COMECOU("Este evento já começou."),
        EVENTO_ENCERRADO("Este evento já aconteceu."),
        EVENTO_CANCELADO("Este evento foi cancelado.");

        private final String mensagem;

        MotivoDeFechamento(String mensagem) {
            this.mensagem = mensagem;
        }

        public boolean aberta() {
            return this == ABERTA;
        }

        public String mensagem() {
            return mensagem;
        }
    }
}
