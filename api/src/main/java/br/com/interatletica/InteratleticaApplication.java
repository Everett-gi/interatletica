package br.com.interatletica;

import br.com.interatletica.comum.OrdemDosAspectos;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * A anotação de transação é declarada aqui, em vez de deixada por conta da
 * auto-configuração, por um motivo só: a ORDEM.
 *
 * <p>O padrão do Spring coloca o proxy transacional como o interceptador
 * mais interno de todos ({@code Ordered.LOWEST_PRECEDENCE}), o que não deixa
 * espaço para o filtro de atlética rodar DENTRO da transação — e o filtro
 * precisa disso, porque ele vive na {@code Session} que só existe depois que
 * a transação abre. Ver {@link OrdemDosAspectos}.</p>
 *
 * <p>{@code proxyTargetClass = true} repete o padrão do Spring Boot. Sem
 * declarar, esta anotação reverteria para proxies JDK e os serviços — que
 * são classes sem interface — passariam a ser proxiados de outro jeito.</p>
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableTransactionManagement(order = OrdemDosAspectos.TRANSACAO, proxyTargetClass = true)
public class InteratleticaApplication {

    public static void main(String[] args) {
        SpringApplication.run(InteratleticaApplication.class, args);
    }
}
