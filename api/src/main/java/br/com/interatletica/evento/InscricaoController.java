package br.com.interatletica.evento;

import br.com.interatletica.evento.EventoDtos.InscricaoResposta;
import br.com.interatletica.evento.EventoDtos.NovaInscricao;
import br.com.interatletica.evento.EventoDtos.ParticipanteResposta;
import br.com.interatletica.evento.EventoDtos.ResultadoDoCheckin;
import br.com.interatletica.evento.ServicoDeInscricao.Exportacao;
import br.com.interatletica.evento.ServicoDeInscricao.OrigemDosInscritos;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

/**
 * Inscrição, lista de presença e check-in.
 *
 * <p>Repare em quem pode o quê: <strong>inscrever-se não exige vínculo com a
 * atlética anfitriã</strong>, apenas sessão. É o que permite alguém do
 * Dragões se inscrever no interatlética do Leões — o caso que dá nome à
 * plataforma. Quem decide se aquela pessoa pode entrar é a visibilidade do
 * evento, verificada no serviço, e não o papel dela na atlética dona.</p>
 *
 * <p>Já ver a lista de quem se inscreveu é da diretoria: são nome, e-mail e
 * telefone de alunos.</p>
 */
@RestController
@RequestMapping("/api/a/{slug}/eventos/{eventoId}")
public class InscricaoController {

    private final ServicoDeInscricao servico;

    public InscricaoController(ServicoDeInscricao servico) {
        this.servico = servico;
    }

    @PostMapping("/inscricao")
    @ResponseStatus(HttpStatus.CREATED)
    public InscricaoResposta inscrever(@PathVariable UUID eventoId,
                                       @Valid @RequestBody NovaInscricao dados) {
        return servico.inscrever(eventoId, dados);
    }

    /** Devolve 204 quando não há inscrição — a ausência não é erro. */
    @GetMapping("/inscricao")
    public ResponseEntity<InscricaoResposta> minhaInscricao(@PathVariable UUID eventoId) {
        return servico.minhaInscricaoNoEvento(eventoId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @DeleteMapping("/inscricao")
    public ResponseEntity<Void> cancelarMinhaInscricao(@PathVariable UUID eventoId) {
        servico.cancelarMinhaInscricao(eventoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/participantes")
    @PreAuthorize("@permissao.diretor()")
    public List<ParticipanteResposta> participantes(@PathVariable UUID eventoId) {
        return servico.participantes(eventoId);
    }

    @GetMapping("/participantes/origem")
    @PreAuthorize("@permissao.diretor()")
    public List<OrigemDosInscritos> origem(@PathVariable UUID eventoId) {
        return servico.origemDosInscritos(eventoId);
    }

    /**
     * O arquivo que a diretoria imprime e leva para a portaria.
     *
     * <p>{@code text/csv} com {@code charset=UTF-8} declarado, e o BOM dentro
     * do conteúdo: navegador e Excel leem sinais diferentes, e só os dois
     * juntos evitam acento quebrado nas duas pontas.</p>
     */
    @GetMapping("/participantes.csv")
    @PreAuthorize("@permissao.diretor()")
    public ResponseEntity<byte[]> exportar(@PathVariable UUID eventoId) {
        Exportacao arquivo = servico.exportarParticipantes(eventoId);
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(arquivo.nomeDoArquivo(), StandardCharsets.UTF_8)
                        .build().toString())
                .body(arquivo.conteudo());
    }

    @DeleteMapping("/inscricoes/{inscricaoId}")
    @PreAuthorize("@permissao.diretor()")
    public ResponseEntity<Void> cancelarPelaDiretoria(@PathVariable UUID eventoId,
                                                      @PathVariable UUID inscricaoId) {
        servico.cancelarPelaDiretoria(eventoId, inscricaoId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Leitura do QR na portaria.
     *
     * <p>Responde 200 mesmo quando a entrada é recusada — o corpo carrega
     * {@code liberado} e o motivo. É POST porque grava o horário de entrada,
     * e o token vai no corpo, não na URL: caberia numa query string, mas de
     * lá acabaria no log de acesso do Caddy, e o log passaria a guardar
     * credenciais de entrada de todo mundo que passou pela porta.</p>
     */
    @PostMapping("/checkin")
    @PreAuthorize("@permissao.diretor()")
    public ResultadoDoCheckin checkin(@PathVariable UUID eventoId,
                                      @RequestBody LeituraDeQr leitura) {
        return servico.registrarCheckin(eventoId, leitura.token());
    }

    public record LeituraDeQr(String token) {
    }
}
