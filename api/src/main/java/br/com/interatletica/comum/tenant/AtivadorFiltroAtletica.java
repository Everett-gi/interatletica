package br.com.interatletica.comum.tenant;

import jakarta.persistence.EntityManager;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Session;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Liga o filtro de atlética na sessão do Hibernate no início de cada
 * transação de serviço.
 *
 * <p>Precisa ser um aspecto em torno dos serviços, e não do filtro HTTP,
 * porque o filtro do Hibernate vive na {@code Session} — que só existe
 * depois que a transação abre.</p>
 *
 * <p>A ordem 100 coloca este aspecto DENTRO do proxy transacional do
 * Spring: a transação abre primeiro, o filtro é ligado em seguida.</p>
 */
@Aspect
@Component
@Order(100)
public class AtivadorFiltroAtletica {

    private final EntityManager entityManager;

    public AtivadorFiltroAtletica(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Around("@within(org.springframework.transaction.annotation.Transactional) "
          + "|| @annotation(org.springframework.transaction.annotation.Transactional)")
    public Object ligarFiltro(ProceedingJoinPoint ponto) throws Throwable {
        if (ContextoAtletica.filtroSuspenso()) {
            return ponto.proceed();
        }

        UUID atleticaId = ContextoAtletica.atual().orElse(null);
        if (atleticaId == null) {
            // Requisição sem atlética no contexto (login, rota pública de
            // evento). Nenhuma consulta multi-tenant deve ocorrer aqui.
            return ponto.proceed();
        }

        Session sessao = entityManager.unwrap(Session.class);
        sessao.enableFilter(EntidadeDeAtletica.FILTRO)
              .setParameter("atleticaId", atleticaId);
        try {
            return ponto.proceed();
        } finally {
            sessao.disableFilter(EntidadeDeAtletica.FILTRO);
        }
    }
}
