#!/usr/bin/env bash
# =====================================================================
# Dump do Postgres, compactado, enviado ao Cloudflare R2 via rclone.
# Instalar no cron:  0 3 * * * /caminho/infra/scripts/backup.sh
# =====================================================================
set -Eeuo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$RAIZ"
set -a; source .env; set +a

DESTINO="$RAIZ/backups"
CARIMBO="$(date +%Y%m%d-%H%M%S)"
ARQUIVO="$DESTINO/interatletica-$CARIMBO.sql.gz"
RETENCAO="${BACKUP_RETENCAO_DIAS:-30}"

mkdir -p "$DESTINO"

echo "[backup] gerando dump"
docker compose exec -T db pg_dump \
    -U "$POSTGRES_USER" -d "${POSTGRES_DB:-interatletica}" \
    --clean --if-exists --no-owner \
    | gzip -9 > "$ARQUIVO"

# Um dump vazio e pior que nenhum: sinaliza sucesso falso.
TAMANHO=$(stat -c%s "$ARQUIVO")
if [[ "$TAMANHO" -lt 2048 ]]; then
    rm -f "$ARQUIVO"
    echo "[backup] ERRO: dump com $TAMANHO bytes — descartado" >&2
    exit 1
fi

# Verifica que o gzip nao esta corrompido.
gzip -t "$ARQUIVO" || { echo "[backup] ERRO: arquivo corrompido" >&2; exit 1; }

echo "[backup] local ok ($(numfmt --to=iec "$TAMANHO"))"

if command -v rclone >/dev/null && [[ -n "${RCLONE_REMOTE:-}" ]]; then
    echo "[backup] enviando para $RCLONE_REMOTE"
    rclone copy "$ARQUIVO" "$RCLONE_REMOTE/" --no-traverse
    rclone delete "$RCLONE_REMOTE/" --min-age "${RETENCAO}d" --rmdirs || true
else
    echo "[backup] AVISO: rclone ausente — backup existe apenas nesta maquina" >&2
fi

find "$DESTINO" -name 'interatletica-*.sql.gz' -mtime "+$RETENCAO" -delete
echo "[backup] concluido: $(basename "$ARQUIVO")"
