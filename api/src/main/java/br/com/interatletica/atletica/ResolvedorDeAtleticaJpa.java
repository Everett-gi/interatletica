package br.com.interatletica.atletica;

import br.com.interatletica.comum.tenant.FiltroContextoAtletica;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Traduz o slug da URL no id da atlética, para o
 * {@link FiltroContextoAtletica}.
 *
 * <p>Roda em TODA requisição de tenant, antes de qualquer coisa útil
 * acontecer. Sem cache seria uma ida ao banco por requisição só para
 * descobrir um mapeamento que nunca muda — {@code atletica.slug} é imutável
 * por decisão de projeto (o link já circulou no grupo do WhatsApp).</p>
 *
 * <p><strong>Só resultado positivo é memorizado.</strong> Cachear "slug
 * inexistente" deixaria qualquer um crescer o mapa indefinidamente pedindo
 * {@code /api/a/<aleatório>}; o custo de reconsultar um slug que não existe
 * é do atacante, não da memória do servidor.</p>
 *
 * <p>Uma atlética removida deixa entrada obsoleta aqui até o próximo
 * restart. O efeito é consulta que não devolve nada — nunca dado de outra
 * atlética, porque o id memorizado é o daquela linha e de mais nenhuma.</p>
 */
@Component
public class ResolvedorDeAtleticaJpa implements FiltroContextoAtletica.ResolvedorDeAtletica {

    private final RepositorioDeAtletica repositorio;
    private final Map<String, UUID> memoria = new ConcurrentHashMap<>();

    public ResolvedorDeAtleticaJpa(RepositorioDeAtletica repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> idPorSlug(String slug) {
        UUID memorizado = memoria.get(slug);
        if (memorizado != null) {
            return Optional.of(memorizado);
        }
        Optional<UUID> encontrado = repositorio.idPorSlug(slug);
        encontrado.ifPresent(id -> memoria.put(slug, id));
        return encontrado;
    }

    /** Chamado ao remover uma atlética, para não deixar entrada obsoleta. */
    public void esquecer(String slug) {
        memoria.remove(slug);
    }
}
