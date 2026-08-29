package br.com.interatletica.evento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * O isolamento entre atléticas nesta tabela vem do {@code evento_id}: todo
 * método parte de um evento que já foi carregado sob o filtro de atlética.
 * Consultar inscrição por id solto abriria caminho para ler a lista de
 * presença de outra atlética conhecendo um UUID.
 */
public interface RepositorioDeInscricao extends JpaRepository<Inscricao, UUID> {

    @Query("""
            select i from Inscricao i
              join fetch i.usuario
             where i.evento.id = :eventoId
               and i.status <> br.com.interatletica.evento.StatusDaInscricao.CANCELADA
             order by i.status, i.posicaoEspera, i.criadoEm
            """)
    List<Inscricao> ativasDoEvento(@Param("eventoId") UUID eventoId);

    /**
     * A inscrição VIVA desta pessoa neste evento. O filtro por status espelha
     * o índice único parcial {@code uk_inscricao_usuario ... WHERE status <> 'CANCELADA'}:
     * quem cancelou pode se inscrever de novo, então uma linha cancelada não
     * pode contar como inscrição existente.
     */
    @Query("""
            select i from Inscricao i
             where i.evento.id = :eventoId
               and i.usuario.id = :usuarioId
               and i.status <> br.com.interatletica.evento.StatusDaInscricao.CANCELADA
            """)
    Optional<Inscricao> vivaDoUsuario(@Param("eventoId") UUID eventoId,
                                      @Param("usuarioId") UUID usuarioId);

    /** Só CONFIRMADA ocupa vaga. Quem está na espera ainda não entrou. */
    @Query("""
            select count(i) from Inscricao i
             where i.evento.id = :eventoId
               and i.status = br.com.interatletica.evento.StatusDaInscricao.CONFIRMADA
            """)
    long confirmadas(@Param("eventoId") UUID eventoId);

    @Query("""
            select count(i) from Inscricao i
             where i.evento.id = :eventoId
               and i.status = br.com.interatletica.evento.StatusDaInscricao.LISTA_ESPERA
            """)
    long naEspera(@Param("eventoId") UUID eventoId);

    @Query("""
            select coalesce(max(i.posicaoEspera), 0) from Inscricao i
             where i.evento.id = :eventoId
               and i.status = br.com.interatletica.evento.StatusDaInscricao.LISTA_ESPERA
            """)
    int ultimaPosicaoDeEspera(@Param("eventoId") UUID eventoId);

    /** Quem entra quando alguém desiste. */
    @Query("""
            select i from Inscricao i
              left join fetch i.usuario
             where i.evento.id = :eventoId
               and i.status = br.com.interatletica.evento.StatusDaInscricao.LISTA_ESPERA
             order by i.posicaoEspera
             limit 1
            """)
    Optional<Inscricao> proximoDaEspera(@Param("eventoId") UUID eventoId);

    /**
     * Leitura do QR na portaria. Busca pelo token e devolve o evento junto,
     * para que o serviço confira se o crachá é DESTE evento antes de liberar
     * a entrada — um token válido de outro evento não abre esta porta.
     */
    @Query("""
            select i from Inscricao i
              join fetch i.evento
              left join fetch i.usuario
             where i.checkinToken = :token
            """)
    Optional<Inscricao> porCheckinToken(@Param("token") String token);

    /** "Meus eventos": onde esta pessoa está inscrita, em qualquer atlética. */
    @Query("""
            select i from Inscricao i
              join fetch i.evento
             where i.usuario.id = :usuarioId
               and i.status <> br.com.interatletica.evento.StatusDaInscricao.CANCELADA
             order by i.evento.inicioEm desc
            """)
    List<Inscricao> doUsuario(@Param("usuarioId") UUID usuarioId);

    /**
     * Quantos vieram de cada atlética — a pergunta que o {@code atletica_id}
     * de origem existe para responder sem join. Devolve pares
     * {@code [atleticaId, total]}; nulo na primeira posição são os inscritos
     * sem vínculo com atlética nenhuma.
     */
    @Query("""
            select i.atleticaDeOrigem, count(i) from Inscricao i
             where i.evento.id = :eventoId
               and i.status = br.com.interatletica.evento.StatusDaInscricao.CONFIRMADA
             group by i.atleticaDeOrigem
             order by count(i) desc
            """)
    List<Object[]> totalPorAtleticaDeOrigem(@Param("eventoId") UUID eventoId);
}
