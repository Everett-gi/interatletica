package br.com.interatletica.atletica;

/**
 * Nível de permissão dentro de UMA atlética.
 *
 * <p>A ordem de declaração é a hierarquia: quem está antes pode tudo que
 * quem está depois pode. {@link #podeAtuarComo(Papel)} usa o {@code ordinal}
 * para isso, então reordenar as constantes muda o significado das
 * permissões — não reordene sem intenção.</p>
 */
public enum Papel {

    /** Administra a atlética: convida, promove, remove membros, arquiva. */
    PRESIDENTE,

    /** Cria e gerencia eventos, equipes e torneios da atlética. */
    DIRETOR,

    /** Participa: vê eventos internos, se inscreve, entra em equipes. */
    MEMBRO;

    /** {@code PRESIDENTE.podeAtuarComo(DIRETOR)} é verdadeiro; o inverso não. */
    public boolean podeAtuarComo(Papel exigido) {
        return this.ordinal() <= exigido.ordinal();
    }
}
