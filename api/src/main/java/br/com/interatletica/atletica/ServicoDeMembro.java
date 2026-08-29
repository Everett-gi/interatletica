package br.com.interatletica.atletica;

import br.com.interatletica.atletica.MembroDtos.MembroResposta;
import br.com.interatletica.atletica.MembroDtos.MudancaDePapel;
import br.com.interatletica.comum.auditoria.Acoes;
import br.com.interatletica.comum.auditoria.Auditoria;
import br.com.interatletica.comum.erro.RecursoNaoEncontradoException;
import br.com.interatletica.comum.erro.RegraDeNegocioException;
import br.com.interatletica.comum.seguranca.SessaoAtual;
import br.com.interatletica.comum.tenant.ContextoAtletica;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Gestão do quadro de membros de uma atlética.
 *
 * <p>Todo método opera sobre a atlética do contexto da requisição. Buscar
 * pelo id do membro sem cruzar com {@code atletica_id} deixaria um
 * presidente rebaixar membro de outra atlética só por conhecer o UUID — o
 * filtro do Hibernate já barra isso, e a checagem explícita em
 * {@link #exigirMembroDaAtleticaAtual} é a segunda tranca.</p>
 */
@Service
public class ServicoDeMembro {

    private final RepositorioDeMembro repositorio;
    private final Auditoria auditoria;

    public ServicoDeMembro(RepositorioDeMembro repositorio, Auditoria auditoria) {
        this.repositorio = repositorio;
        this.auditoria = auditoria;
    }

    @Transactional(readOnly = true)
    public List<MembroResposta> ativos() {
        return repositorio.ativosDaAtletica(ContextoAtletica.exigir()).stream()
                .map(MembroResposta::de)
                .toList();
    }

    /** Inclui desligados: é o histórico que a diretoria seguinte vai querer. */
    @Transactional(readOnly = true)
    public List<MembroResposta> todos() {
        return repositorio.todosDaAtletica(ContextoAtletica.exigir()).stream()
                .map(MembroResposta::de)
                .toList();
    }

    @Transactional
    public MembroResposta alterarPapel(UUID membroId, MudancaDePapel dados) {
        Membro membro = exigirMembroDaAtleticaAtual(membroId);
        Papel anterior = membro.getPapel();

        if (anterior == Papel.PRESIDENTE && dados.papel() != Papel.PRESIDENTE) {
            impedirPerdaDoUltimoPresidente(membro,
                    "Promova outra pessoa a presidente antes de rebaixar esta.");
        }

        membro.alterarPapel(dados.papel());
        membro.alterarCargo(dados.cargo());

        auditoria.registrar(Acoes.MEMBRO_PAPEL_ALTERADO, Acoes.E_MEMBRO, membroId,
                Map.of("de", anterior.name(), "para", dados.papel().name()));
        return MembroResposta.de(membro);
    }

    @Transactional
    public void desligar(UUID membroId) {
        Membro membro = exigirMembroDaAtleticaAtual(membroId);

        if (!membro.estaAtivo()) {
            throw new RegraDeNegocioException("MEMBRO_JA_DESLIGADO",
                    "Este membro já está desligado.");
        }
        if (membro.getPapel() == Papel.PRESIDENTE) {
            impedirPerdaDoUltimoPresidente(membro,
                    "Passe a presidência a outra pessoa antes de sair.");
        }

        membro.desligar();
        auditoria.registrar(Acoes.MEMBRO_DESLIGADO, Acoes.E_MEMBRO, membroId,
                Map.of("usuario", membro.getUsuario().getEmail()));
    }

    @Transactional
    public MembroResposta reativar(UUID membroId) {
        Membro membro = exigirMembroDaAtleticaAtual(membroId);

        if (membro.estaAtivo()) {
            throw new RegraDeNegocioException("MEMBRO_JA_ATIVO",
                    "Este membro já está ativo.");
        }
        membro.reativar();
        auditoria.registrar(Acoes.MEMBRO_REATIVADO, Acoes.E_MEMBRO, membroId);
        return MembroResposta.de(membro);
    }

    /** O próprio vínculo de quem está pedindo — usado pelo app para saber o que exibir. */
    @Transactional(readOnly = true)
    public MembroResposta meuVinculo() {
        UUID atleticaId = ContextoAtletica.exigir();
        UUID usuarioId = SessaoAtual.exigirUsuarioId();
        return repositorio.doVinculo(atleticaId, usuarioId)
                .map(MembroResposta::de)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Você não tem vínculo com esta atlética."));
    }

    /**
     * Uma atlética sem presidente ativo não tem quem convide, promova ou
     * repasse a presidência: ela precisaria de intervenção manual no banco
     * para voltar a funcionar. O caso aparece de verdade na virada de gestão,
     * quando o presidente que sai desliga a si mesmo antes de promover o
     * sucessor.
     */
    private void impedirPerdaDoUltimoPresidente(Membro membro, String saida) {
        if (repositorio.presidentesAtivos(membro.getAtleticaId()) <= 1) {
            throw new RegraDeNegocioException("ULTIMO_PRESIDENTE",
                    "Esta é a única presidência ativa da atlética. " + saida);
        }
    }

    private Membro exigirMembroDaAtleticaAtual(UUID membroId) {
        UUID atleticaId = ContextoAtletica.exigir();
        return repositorio.findById(membroId)
                .filter(m -> atleticaId.equals(m.getAtleticaId()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Membro", membroId));
    }
}
