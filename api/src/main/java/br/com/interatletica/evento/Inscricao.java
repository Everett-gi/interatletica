package br.com.interatletica.evento;

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
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Inscrição de uma pessoa OU de uma equipe em um evento.
 *
 * <p><strong>Esta entidade NÃO estende {@code EntidadeDeAtletica}, e isso é
 * deliberado.</strong> A coluna {@code inscricao.atletica_id} guarda a
 * atlética de ORIGEM do inscrito — de onde a pessoa veio —, não a dona do
 * evento. É o que responde "quantos vieram de cada atlética" sem join extra,
 * e num interatlética a maioria das linhas aponta para atléticas que não são
 * a anfitriã.</p>
 *
 * <p>Herdar o filtro aqui esconderia da anfitriã justamente os inscritos de
 * fora — o oposto do que a lista de presença precisa mostrar. O isolamento
 * desta tabela vem do {@code evento_id}: toda consulta parte do evento, que é
 * filtrado por atlética. A coluna também é nula para quem se inscreve sem
 * vínculo com atlética nenhuma, o que já a torna incompatível com o
 * {@code atletica_id NOT NULL} da superclasse.</p>
 */
@Entity
@Table(name = "inscricao")
public class Inscricao {

    private static final SecureRandom ALEATORIO = new SecureRandom();

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false, updatable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", updatable = false)
    private Usuario usuario;

    /**
     * Guardado como UUID cru, e não como relação: {@code Equipe} é da Fase 2.
     * A FK no banco já existe e continua valendo — o que falta é a entidade
     * do lado Java, e antecipá-la só para ter o tipo seria mapear algo que
     * nenhum código ainda usa.
     */
    @Column(name = "equipe_id", updatable = false)
    private UUID equipeId;

    /** Atlética de ORIGEM do inscrito. Nula para quem não tem vínculo. */
    @Column(name = "atletica_id")
    private UUID atleticaDeOrigem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusDaInscricao status = StatusDaInscricao.CONFIRMADA;

    /**
     * Exigido pelo CHECK {@code (status = 'LISTA_ESPERA') = (posicao_espera IS NOT NULL)}:
     * os dois andam juntos ou nenhum dos dois existe.
     */
    @Column(name = "posicao_espera")
    private Integer posicaoEspera;

    @Column(columnDefinition = "text")
    private String observacao;

    /**
     * Conteúdo do QR code entregue ao inscrito. Gerado aqui, e não pelo
     * DEFAULT da coluna, porque a tela de confirmação mostra o QR na mesma
     * resposta do POST — reler a linha só para descobrir o token seria uma
     * ida ao banco para buscar algo que acabamos de escrever.
     */
    @Column(name = "checkin_token", nullable = false, length = 32, updatable = false)
    private String checkinToken = gerarToken();

    @Column(name = "checkin_em")
    private OffsetDateTime checkinEm;

    @Column(name = "checkin_por")
    private UUID checkinPor;

    // Ganchos financeiros, inertes nesta fase.
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", length = 20)
    private StatusDePagamento statusPagamento;

    @Column(name = "cancelado_em")
    private OffsetDateTime canceladoEm;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected Inscricao() {
    }

    public static Inscricao dePessoa(Evento evento, Usuario usuario, UUID atleticaDeOrigem) {
        Inscricao inscricao = new Inscricao();
        inscricao.evento = evento;
        inscricao.usuario = usuario;
        inscricao.atleticaDeOrigem = atleticaDeOrigem;
        return inscricao;
    }

    public static Inscricao deEquipe(Evento evento, UUID equipeId, UUID atleticaDeOrigem) {
        Inscricao inscricao = new Inscricao();
        inscricao.evento = evento;
        inscricao.equipeId = equipeId;
        inscricao.atleticaDeOrigem = atleticaDeOrigem;
        return inscricao;
    }

    /**
     * 16 bytes em hexadecimal: 32 caracteres, exatamente o VARCHAR(32) da
     * coluna, e o mesmo formato do DEFAULT da migration. Precisa ser
     * imprevisível — quem adivinha um token entra na festa no lugar de outro.
     */
    private static String gerarToken() {
        byte[] bytes = new byte[16];
        ALEATORIO.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public void confirmar() {
        this.status = StatusDaInscricao.CONFIRMADA;
        this.posicaoEspera = null;
        this.canceladoEm = null;
    }

    public void colocarNaEspera(int posicao) {
        this.status = StatusDaInscricao.LISTA_ESPERA;
        this.posicaoEspera = posicao;
        this.canceladoEm = null;
    }

    public void cancelar() {
        this.status = StatusDaInscricao.CANCELADA;
        this.posicaoEspera = null;
        this.canceladoEm = OffsetDateTime.now();
    }

    public boolean estaCancelada() {
        return status == StatusDaInscricao.CANCELADA;
    }

    public boolean estaNaEspera() {
        return status == StatusDaInscricao.LISTA_ESPERA;
    }

    public boolean jaFezCheckin() {
        return checkinEm != null;
    }

    public void registrarCheckin(UUID porUsuario) {
        this.checkinEm = OffsetDateTime.now();
        this.checkinPor = porUsuario;
    }

    public UUID getId() {
        return id;
    }

    public Evento getEvento() {
        return evento;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public UUID getEquipeId() {
        return equipeId;
    }

    public UUID getAtleticaDeOrigem() {
        return atleticaDeOrigem;
    }

    public StatusDaInscricao getStatus() {
        return status;
    }

    public Integer getPosicaoEspera() {
        return posicaoEspera;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getCheckinToken() {
        return checkinToken;
    }

    public OffsetDateTime getCheckinEm() {
        return checkinEm;
    }

    public OffsetDateTime getCanceladoEm() {
        return canceladoEm;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public StatusDePagamento getStatusPagamento() {
        return statusPagamento;
    }
}
