package br.com.interatletica.comum.auditoria;

import br.com.interatletica.comum.seguranca.SessaoAtual;
import br.com.interatletica.comum.tenant.ContextoAtletica;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;
import java.util.UUID;

/**
 * Registro de quem fez o quê.
 *
 * <p>A diretoria muda todo ano; três semanas depois ninguém lembra quem
 * cancelou a inscrição do time. Esta tabela responde isso.</p>
 *
 * <p><strong>Escrita por SQL, não por entidade JPA.</strong> Duas razões, e
 * a segunda é a que decide:</p>
 *
 * <ol>
 *   <li>Auditoria é fluxo só de escrita. Não precisa de identidade, dirty
 *       checking nem cache de primeiro nível — só de INSERT.</li>
 *   <li>As colunas {@code detalhe JSONB} e {@code ip INET} não têm mapeamento
 *       óbvio em JPA. Com {@code ddl-auto: validate}, errar o tipo não dá
 *       aviso: a aplicação não sobe. O {@code cast} explícito no SQL tira
 *       essa classe de erro do caminho.</li>
 * </ol>
 *
 * <p>Falha ao auditar NUNCA derruba a operação auditada. Perder um registro
 * é ruim; recusar a inscrição de um aluno porque o log falhou é pior.</p>
 */
@Component
public class Auditoria {

    private static final Logger log = LoggerFactory.getLogger(Auditoria.class);

    private static final String INSERCAO = """
            INSERT INTO registro_auditoria
                   (atletica_id, usuario_id, acao, entidade, entidade_id, detalhe, ip)
            VALUES (?, ?, ?, ?, ?, cast(? as jsonb), cast(? as inet))
            """;

    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public Auditoria(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    public void registrar(String acao, String entidade, UUID entidadeId) {
        registrar(acao, entidade, entidadeId, Map.of());
    }

    public void registrar(String acao, String entidade, UUID entidadeId, Map<String, ?> detalhe) {
        try {
            jdbc.update(INSERCAO,
                    ContextoAtletica.atual().orElse(null),
                    SessaoAtual.usuarioId().orElse(null),
                    acao,
                    entidade,
                    entidadeId,
                    detalhe == null || detalhe.isEmpty() ? null : json.writeValueAsString(detalhe),
                    ipDaRequisicao());
        } catch (Exception e) {
            log.error("Falha ao registrar auditoria: acao={} entidade={} id={}",
                    acao, entidade, entidadeId, e);
        }
    }

    /**
     * Em produção o valve {@code remoteip} do Tomcat já traduziu
     * X-Forwarded-For, então {@code getRemoteAddr()} é o IP real do cliente e
     * não o do Caddy. Ler o cabeçalho na mão aqui aceitaria um
     * X-Forwarded-For forjado pelo próprio cliente.
     */
    private String ipDaRequisicao() {
        if (RequestContextHolder.getRequestAttributes()
                instanceof ServletRequestAttributes atributos) {
            HttpServletRequest requisicao = atributos.getRequest();
            String remoto = requisicao.getRemoteAddr();
            return remoto == null || remoto.isBlank() ? null : remoto;
        }
        return null;
    }
}
