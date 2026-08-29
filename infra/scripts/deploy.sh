#!/usr/bin/env bash
# =====================================================================
# Deploy do Interatletica na EC2.
#   ./infra/scripts/deploy.sh [branch]
# =====================================================================
set -Eeuo pipefail

BRANCH="${1:-main}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$RAIZ"

log() { printf '\033[1;36m[deploy]\033[0m %s\n' "$*"; }
erro() { printf '\033[1;31m[erro]\033[0m %s\n' "$*" >&2; exit 1; }

trap 'erro "falhou na linha $LINENO"' ERR

[[ -f .env ]] || erro ".env nao encontrado. Copie de .env.example."

# --- backup antes de qualquer coisa -----------------------------------
log "backup do banco antes do deploy"
./infra/scripts/backup.sh || erro "backup falhou — deploy abortado"

# --- codigo -----------------------------------------------------------
log "atualizando codigo (branch: $BRANCH)"
git fetch --prune origin
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

REVISAO="$(git rev-parse --short HEAD)"
log "revisao: $REVISAO"

# --- build e subida ---------------------------------------------------
log "construindo imagens"
docker compose build --pull

log "subindo servicos"
docker compose up -d --remove-orphans

# --- verificacao ------------------------------------------------------
log "aguardando a API ficar saudavel"
for tentativa in {1..30}; do
    estado="$(docker inspect -f '{{.State.Health.Status}}' interatletica-api 2>/dev/null || echo indisponivel)"
    if [[ "$estado" == "healthy" ]]; then
        log "API saudavel apos $((tentativa * 5))s"
        break
    fi
    if [[ $tentativa -eq 30 ]]; then
        docker compose logs --tail 60 api
        erro "API nao ficou saudavel em 150s"
    fi
    sleep 5
done

log "limpando imagens orfas"
docker image prune -f >/dev/null

log "deploy concluido — revisao $REVISAO no ar"
