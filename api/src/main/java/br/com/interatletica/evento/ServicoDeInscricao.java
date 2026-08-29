package br.com.interatletica.evento;

import br.com.interatletica.atletica.RepositorioDeAtletica;
import br.com.interatletica.atletica.RepositorioDeMembro;
import br.com.interatletica.comum.auditoria.Acoes;
import br.com.interatletica.comum.auditoria.Auditoria;
import br.com.interatletica.comum.erro.RecursoNaoEncontradoException;
import br.com.interatletica.comum.erro.RegraDeNegocioException;
import br.com.interatletica.comum.seguranca.SessaoAtual;
import br.com.interatletica.evento.Evento.MotivoDeFechamento;
import br.com.interatletica.evento.EventoDtos.InscricaoResposta;
import br.com.interatletica.evento.EventoDtos.NovaInscricao;
import br.com.interatletica.evento.EventoDtos.ParticipanteResposta;
import br.com.interatletica.evento.EventoDtos.ResultadoDoCheckin;
import br.com.interatletica.identidade.RepositorioDeUsuario;
import br.com.interatletica.identidade.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Inscrição individual, lista de espera e check-in.
 *
 * <p>É o módulo que substitui a planilha e o formulário — o critério de
 * pronto da Fase 1.</p>
 */
@Service
public class ServicoDeInscricao {

    private static final Logger log = LoggerFactory.getLogger(ServicoDeInscricao.class);

    private final RepositorioDeInscricao repositorio;
    private final ServicoDeEvento servicoDeEvento;
    private final RepositorioDeUsuario repositorioDeUsuario;
    private final RepositorioDeMembro repositorioDeMembro;
    private final RepositorioDeAtletica repositorioDeAtletica;
    private final Auditoria auditoria;

    public ServicoDeInscricao(RepositorioDeInscricao repositorio,
                              ServicoDeEvento servicoDeEvento,
                              RepositorioDeUsuario repositorioDeUsuario,
                              RepositorioDeMembro repositorioDeMembro,
                              RepositorioDeAtletica repositorioDeAtletica,
                              Auditoria auditoria) {
        this.repositorio = repositorio;
        this.servicoDeEvento = servicoDeEvento;
        this.repositorioDeUsuario = repositorioDeUsuario;
        this.repositorioDeMembro = repositorioDeMembro;
        this.repositorioDeAtletica = repositorioDeAtletica;
        this.auditoria = auditoria;
    }

    // -----------------------------------------------------------------
    // Inscrever-se
    // -----------------------------------------------------------------

    @Transactional
    public InscricaoResposta inscrever(UUID eventoId, NovaInscricao dados) {
        UUID usuarioId = SessaoAtual.exigirUsuarioId();
        Evento evento = servicoDeEvento.exigirDaAtleticaAtual(eventoId);

        MotivoDeFechamento motivo = evento.motivoDeFechamento(OffsetDateTime.now());
        if (!motivo.aberta()) {
            throw new RegraDeNegocioException(motivo.name(), motivo.mensagem());
        }
        if (evento.isInscricaoPorEquipe()) {
            throw new RegraDeNegocioException("INSCRICAO_POR_EQUIPE",
                    "Este evento recebe inscrição por equipe, não individual.");
        }

        List<UUID> vinculos = repositorioDeMembro.idsDasAtleticasComVinculoAtivo(usuarioId);
        exigirVisibilidadeCompativel(evento, vinculos);
        UUID origem = resolverOrigem(evento, vinculos, dados.atleticaDeOrigem());

        repositorio.vivaDoUsuario(eventoId, usuarioId).ifPresent(existente -> {
            throw new RegraDeNegocioException("JA_INSCRITO",
                    existente.estaNaEspera()
                            ? "Você já está na lista de espera deste evento."
                            : "Você já está inscrito neste evento.");
        });

        Usuario usuario = repositorioDeUsuario.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário", usuarioId));

        // Quem cancelou e volta ganha uma linha NOVA, com token de check-in
        // novo. É para isso que uk_inscricao_usuario ignora as canceladas:
        // a desistência fica registrada com a data em que aconteceu, em vez
        // de ser sobrescrita pela reinscrição.
        Inscricao inscricao = Inscricao.dePessoa(evento, usuario, origem);
        inscricao.setObservacao(dados.observacao());
        acomodar(evento, inscricao);

        try {
            repositorio.saveAndFlush(inscricao);
        } catch (DataIntegrityViolationException e) {
            // Dois cliques no botão, ou duas abas. O índice único parcial é
            // quem decide o empate; aqui o erro só é traduzido.
            log.info("Inscrição duplicada barrada pelo banco: evento={} usuario={}",
                    eventoId, usuarioId);
            throw new RegraDeNegocioException("JA_INSCRITO",
                    "Você já está inscrito neste evento.");
        }

        auditoria.registrar(Acoes.INSCRICAO_CRIADA, Acoes.E_INSCRICAO, inscricao.getId(),
                Map.of("evento", evento.getTitulo(), "status", inscricao.getStatus().name()));

        return InscricaoResposta.de(inscricao);
    }

    /**
     * Confirma se houver vaga; senão coloca no fim da lista de espera.
     *
     * <p>A contagem e a decisão acontecem na mesma transação, mas duas
     * inscrições simultâneas ainda podem ler a mesma contagem e ambas
     * confirmarem — a última vaga viraria duas. Com evento de atlética o
     * risco é baixo e o estrago é pequeno (uma pessoa a mais na porta);
     * travar a linha do evento a cada inscrição custaria mais do que
     * resolve. Se um dia importar, o lugar de corrigir é aqui, com
     * {@code SELECT ... FOR UPDATE} no evento.</p>
     */
    private void acomodar(Evento evento, Inscricao inscricao) {
        if (!evento.temLimiteDeVagas()) {
            inscricao.confirmar();
            return;
        }
        long confirmadas = repositorio.confirmadas(evento.getId());
        if (confirmadas < evento.getCapacidade()) {
            inscricao.confirmar();
        } else {
            inscricao.colocarNaEspera(repositorio.ultimaPosicaoDeEspera(evento.getId()) + 1);
        }
    }

    private void exigirVisibilidadeCompativel(Evento evento, List<UUID> vinculos) {
        switch (evento.getVisibilidade()) {
            case PUBLICO -> {
                // Qualquer pessoa autenticada. É o caso do link do Instagram.
            }
            case REDE -> {
                if (vinculos.isEmpty()) {
                    throw new RegraDeNegocioException("SOMENTE_REDE",
                            "Este evento é para membros de atléticas da plataforma. "
                                    + "Peça um convite à sua atlética.");
                }
            }
            case INTERNO -> {
                if (!vinculos.contains(evento.getAtleticaId())) {
                    throw new RegraDeNegocioException("SOMENTE_MEMBROS",
                            "Este evento é interno da atlética organizadora.");
                }
            }
        }
    }

    /**
     * De qual atlética esta pessoa está vindo.
     *
     * <p>Alimenta a contagem "quantos vieram de cada atlética", que é o
     * número que a diretoria de um interatlética quer ver. Por isso, quem tem
     * vínculo em mais de uma precisa escolher: adivinhar produziria um
     * relatório errado com aparência de certo.</p>
     */
    private UUID resolverOrigem(Evento evento, List<UUID> vinculos, String slugDeclarado) {
        if (slugDeclarado != null && !slugDeclarado.isBlank()) {
            UUID declarada = repositorioDeAtletica.idPorSlug(slugDeclarado)
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Atlética", slugDeclarado));
            if (!vinculos.contains(declarada)) {
                throw new RegraDeNegocioException("SEM_VINCULO",
                        "Você não é membro ativo da atlética informada.");
            }
            return declarada;
        }
        if (vinculos.contains(evento.getAtleticaId())) {
            return evento.getAtleticaId();
        }
        if (vinculos.size() == 1) {
            return vinculos.get(0);
        }
        if (vinculos.isEmpty()) {
            // Sem vínculo nenhum. A coluna é nula de propósito: o evento
            // público recebe quem não é de atlética alguma.
            return null;
        }
        throw new RegraDeNegocioException("ORIGEM_AMBIGUA",
                "Você é membro de mais de uma atlética. Informe por qual está se inscrevendo.");
    }

    // -----------------------------------------------------------------
    // Cancelar
    // -----------------------------------------------------------------

    /**
     * Cancela a própria inscrição e promove quem está na frente da espera.
     *
     * <p>A promoção acontece aqui, no cancelamento, e não numa rotina
     * periódica: quem desistiu acabou de liberar a vaga, e a pessoa na espera
     * merece saber agora — não na próxima varredura.</p>
     */
    @Transactional
    public void cancelarMinhaInscricao(UUID eventoId) {
        UUID usuarioId = SessaoAtual.exigirUsuarioId();
        Evento evento = servicoDeEvento.exigirDaAtleticaAtual(eventoId);

        Inscricao inscricao = repositorio.vivaDoUsuario(eventoId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Você não está inscrito neste evento."));

        boolean liberouVaga = !inscricao.estaNaEspera();
        inscricao.cancelar();

        auditoria.registrar(Acoes.INSCRICAO_CANCELADA, Acoes.E_INSCRICAO, inscricao.getId(),
                Map.of("evento", evento.getTitulo(), "porOProprio", true));

        if (liberouVaga) {
            promoverDaEspera(evento);
        }
    }

    /** Cancelamento feito pela diretoria — desclassificação, duplicidade. */
    @Transactional
    public void cancelarPelaDiretoria(UUID eventoId, UUID inscricaoId) {
        Evento evento = servicoDeEvento.exigirDaAtleticaAtual(eventoId);
        Inscricao inscricao = exigirDoEvento(inscricaoId, evento);

        if (inscricao.estaCancelada()) {
            throw new RegraDeNegocioException("INSCRICAO_JA_CANCELADA",
                    "Esta inscrição já está cancelada.");
        }

        boolean liberouVaga = !inscricao.estaNaEspera();
        inscricao.cancelar();

        auditoria.registrar(Acoes.INSCRICAO_CANCELADA, Acoes.E_INSCRICAO, inscricaoId,
                Map.of("evento", evento.getTitulo(), "porOProprio", false));

        if (liberouVaga) {
            promoverDaEspera(evento);
        }
    }

    private void promoverDaEspera(Evento evento) {
        if (!evento.temLimiteDeVagas()) {
            return;
        }
        if (repositorio.confirmadas(evento.getId()) >= evento.getCapacidade()) {
            return;
        }
        repositorio.proximoDaEspera(evento.getId()).ifPresent(proximo -> {
            proximo.confirmar();
            auditoria.registrar(Acoes.INSCRICAO_PROMOVIDA, Acoes.E_INSCRICAO, proximo.getId(),
                    Map.of("evento", evento.getTitulo()));
            log.info("Promovido da lista de espera: inscricao={} evento={}",
                    proximo.getId(), evento.getId());
        });
    }

    // -----------------------------------------------------------------
    // Lista de presença
    // -----------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ParticipanteResposta> participantes(UUID eventoId) {
        Evento evento = servicoDeEvento.exigirDaAtleticaAtual(eventoId);
        return repositorio.ativasDoEvento(evento.getId()).stream()
                .map(ParticipanteResposta::de)
                .toList();
    }

    /**
     * A lista de presença como arquivo. É o entregável que substitui a
     * planilha: a diretoria baixa, imprime e leva para a portaria.
     */
    @Transactional(readOnly = true)
    public Exportacao exportarParticipantes(UUID eventoId) {
        Evento evento = servicoDeEvento.exigirDaAtleticaAtual(eventoId);
        List<ParticipanteResposta> participantes = repositorio.ativasDoEvento(evento.getId())
                .stream()
                .map(ParticipanteResposta::de)
                .toList();

        // Um SELECT para todas as atléticas citadas, em vez de um por linha.
        Map<UUID, String> nomes = participantes.stream()
                .map(ParticipanteResposta::atleticaDeOrigem)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .flatMap(id -> repositorioDeAtletica.findById(id).stream())
                .collect(java.util.stream.Collectors.toMap(
                        a -> a.getId(), a -> a.getNome()));

        return new Exportacao(
                ListaDeParticipantesCsv.nomeDoArquivo(evento.getSlug()),
                ListaDeParticipantesCsv.gerar(participantes, nomes));
    }

    /** Quantos vieram de cada atlética — o painel de um interatlética. */
    @Transactional(readOnly = true)
    public List<OrigemDosInscritos> origemDosInscritos(UUID eventoId) {
        Evento evento = servicoDeEvento.exigirDaAtleticaAtual(eventoId);
        return repositorio.totalPorAtleticaDeOrigem(evento.getId()).stream()
                .map(linha -> {
                    UUID atleticaId = (UUID) linha[0];
                    long total = ((Number) linha[1]).longValue();
                    String nome = atleticaId == null
                            ? "Sem atlética"
                            : repositorioDeAtletica.findById(atleticaId)
                                    .map(a -> a.getNome())
                                    .orElse("Atlética removida");
                    return new OrigemDosInscritos(atleticaId, nome, total);
                })
                .toList();
    }

    /** As inscrições da pessoa logada, em qualquer atlética. */
    @Transactional(readOnly = true)
    public List<InscricaoResposta> minhasInscricoes() {
        return repositorio.doUsuario(SessaoAtual.exigirUsuarioId()).stream()
                .map(InscricaoResposta::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<InscricaoResposta> minhaInscricaoNoEvento(UUID eventoId) {
        Evento evento = servicoDeEvento.exigirDaAtleticaAtual(eventoId);
        return repositorio.vivaDoUsuario(evento.getId(), SessaoAtual.exigirUsuarioId())
                .map(InscricaoResposta::de);
    }

    // -----------------------------------------------------------------
    // Check-in na portaria
    // -----------------------------------------------------------------

    /**
     * Leitura do QR code na portaria.
     *
     * <p>Nunca lança exceção por crachá inválido: devolve
     * {@code liberado = false} com o motivo. Quem está na portaria segura uma
     * fila, e a tela precisa dizer "já entrou às 22h14" ou "inscrição
     * cancelada" na hora — não um erro genérico que obrigue a recarregar.</p>
     *
     * <p>O token é conferido contra ESTE evento. Um crachá válido de outra
     * festa é um crachá válido — só não é desta porta.</p>
     */
    @Transactional
    public ResultadoDoCheckin registrarCheckin(UUID eventoId, String token) {
        Evento evento = servicoDeEvento.exigirDaAtleticaAtual(eventoId);

        Optional<Inscricao> encontrada = repositorio.porCheckinToken(token)
                .filter(i -> i.getEvento().getId().equals(evento.getId()));

        if (encontrada.isEmpty()) {
            return new ResultadoDoCheckin(false,
                    "Código não corresponde a nenhuma inscrição deste evento.",
                    null, null, null);
        }

        Inscricao inscricao = encontrada.get();
        String nome = inscricao.getUsuario() != null ? inscricao.getUsuario().getNome() : null;

        if (inscricao.estaCancelada()) {
            return new ResultadoDoCheckin(false, "Inscrição cancelada.",
                    nome, inscricao.getStatus(), null);
        }
        if (inscricao.estaNaEspera()) {
            return new ResultadoDoCheckin(false,
                    "Está na lista de espera — ainda não tem vaga confirmada.",
                    nome, inscricao.getStatus(), null);
        }
        if (inscricao.jaFezCheckin()) {
            return new ResultadoDoCheckin(false,
                    "Esta entrada já foi registrada.",
                    nome, inscricao.getStatus(), inscricao.getCheckinEm());
        }

        inscricao.registrarCheckin(SessaoAtual.exigirUsuarioId());
        auditoria.registrar(Acoes.CHECKIN_REGISTRADO, Acoes.E_INSCRICAO, inscricao.getId(),
                Map.of("evento", evento.getTitulo()));

        return new ResultadoDoCheckin(true, "Entrada liberada.",
                nome, inscricao.getStatus(), inscricao.getCheckinEm());
    }

    private Inscricao exigirDoEvento(UUID inscricaoId, Evento evento) {
        return repositorio.findById(inscricaoId)
                .filter(i -> i.getEvento().getId().equals(evento.getId()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Inscrição", inscricaoId));
    }

    public record OrigemDosInscritos(UUID atleticaId, String nome, long total) {
    }

    public record Exportacao(String nomeDoArquivo, byte[] conteudo) {
    }
}
