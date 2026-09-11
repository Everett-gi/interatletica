#!/usr/bin/env bash
# =====================================================================
# Implanta uma revisão no servidor.
#   ./infra/scripts/deploy.sh <sha completo do commit>
#
# Não compila nada: as imagens daquele commit já precisam estar no GHCR,
# e quem as publica é o workflow "Imagens", depois que o CI passa. Quem
# chama este script normalmente é o atualizar.sh, pelo timer do systemd.
#
# Ordem: backup → código → imagens → subida → saúde. Se a API não ficar
# saudável, volta para a revisão anterior e sai com erro.
#
# Tudo dentro de main(): o `git reset` abaixo pode reescrever este mesmo
# arquivo, e o bash lê script aos pedaços enquanto executa. Com a função,
# ele já leu tudo antes da primeira linha rodar.
# =====================================================================
set -Eeuo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

log()  { printf '[deploy] %s\n' "$*"; }
erro() { printf '[deploy] ERRO: %s\n' "$*" >&2; }

# O compose lê IMAGEM_TAG do .env. Gravar ali, e não exportar na sessão,
# é o que faz um `docker compose logs` manual depois enxergar o mesmo
# estado que o deploy deixou.
definir_tag() {
    if grep -q '^IMAGEM_TAG=' .env; then
        sed -i "s/^IMAGEM_TAG=.*/IMAGEM_TAG=$1/" .env
    else
        printf 'IMAGEM_TAG=%s\n' "$1" >> .env
    fi
}

# Encadeado com &&, e não confiando no set -e: chamada dentro de `if`
# desliga o errexit, e um git reset falho seguiria em frente calado.
subir() {
    git reset --quiet --hard "$1" \
        && definir_tag "$1" \
        && docker compose pull --quiet \
        && docker compose up -d --remove-orphans
}

api_saudavel() {
    local estado
    # 6 minutos: a primeira subida roda o Flyway numa CPU de 1/8.
    for ((i = 1; i <= 72; i++)); do
        estado="$(docker inspect -f '{{.State.Health.Status}}' interatletica-api 2>/dev/null || echo ausente)"
        if [[ "$estado" == healthy ]]; then
            log "API saudável após $((i * 5))s"
            return 0
        fi
        [[ "$estado" == unhealthy ]] && return 1
        sleep 5
    done
    return 1
}

# Confere que os containers de pé são mesmo da revisão pedida. Um
# IMAGEM_TAG herdado já fez o compose subir a imagem anterior enquanto o
# log dizia "no ar" — saudável, mas outra revisão.
imagens_da_revisao() {
    local c
    for c in interatletica-api interatletica-web; do
        [[ "$(docker inspect -f '{{.Config.Image}}' "$c" 2>/dev/null)" == *":$1" ]] || {
            erro "$c não está na revisão ${1:0:7}"
            return 1
        }
    done
}

main() {
    local revisao="${1:?uso: deploy.sh <sha completo do commit>}"
    [[ "$revisao" =~ ^[0-9a-f]{40}$ ]] || { erro "revisão inválida: $revisao"; exit 2; }

    cd "$RAIZ"
    [[ -f .env ]] || { erro ".env não encontrado — modelo em .env.example"; exit 1; }

    # No compose, variável de ambiente ganha do .env. Herdada de quem
    # chamou — vazia, ou com a revisão anterior —, ela anularia o valor
    # que definir_tag acabou de gravar. Já aconteceu, na primeira subida.
    unset IMAGEM_TAG

    local anterior
    anterior="$(sed -n 's/^IMAGEM_TAG=//p' .env)"

    # Na primeira implantação o banco ainda não existe, e exigir backup
    # dele travaria o servidor antes de ele nascer.
    if [[ -n "$(docker ps -q --filter name=^interatletica-db$)" ]]; then
        log "backup do banco antes de mexer em qualquer coisa"
        ./infra/scripts/backup.sh || { erro "backup falhou — deploy abortado"; exit 1; }
    else
        log "banco ainda não existe — primeira implantação, sem backup"
    fi

    git fetch --quiet --prune origin
    log "implantando ${revisao:0:7}"

    if subir "$revisao" && api_saudavel && imagens_da_revisao "$revisao"; then
        # Uma semana de imagens fica guardada para voltar sem depender
        # do GHCR; o que é mais velho e não está em uso sai.
        docker image prune -af --filter "until=168h" >/dev/null
        log "revisão ${revisao:0:7} no ar"
        return 0
    fi

    erro "a revisão ${revisao:0:7} não subiu saudável"
    docker compose logs --tail 80 api >&2 || true

    if [[ "$anterior" =~ ^[0-9a-f]{40}$ && "$anterior" != "$revisao" ]]; then
        log "voltando para ${anterior:0:7}"
        if subir "$anterior" && api_saudavel && imagens_da_revisao "$anterior"; then
            log "revisão anterior restaurada"
        else
            erro "a revisão anterior também não subiu — intervenção manual"
        fi
    fi
    exit 1
}

main "$@"
