package br.com.interatletica.comum.tenant;

import jakarta.persistence.EntityManager;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Session;
import br.com.interatletica.comum.OrdemDosAspectos;
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
 * <p>A ordem precisa ser MAIOR que a do proxy transacional para que este
 * aspecto rode DENTRO dele: a transação abre primeiro, e só então o filtro
 * é ligado na Session que ela criou. No Spring AOP, menor ordem roda por
 * fora — ver {@link OrdemDosAspectos}, e o teste que trava a invariante.</p>
 */
@Aspect
@Component
@Order(OrdemDosAspectos.FILTRO_DE_ATLETICA)
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
