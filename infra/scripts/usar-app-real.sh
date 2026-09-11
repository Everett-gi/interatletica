#!/usr/bin/env bash
# =====================================================================
# Troca o que o endereço principal serve.
#
#   ./infra/scripts/usar-app-real.sh              # liga o app real
#   ./infra/scripts/usar-app-real.sh demonstracao # volta para a demo
#
# A demonstração continua sempre em demo.{DOMINIO}; o que muda aqui é só
# o endereço principal.
#
# Recusa ligar o app real enquanto a credencial do Google for placeholder:
# sem ela o login falha no próprio Google, e o site principal viraria uma
# porta trancada. É a única trava do script, e existe porque esse erro só
# apareceria para quem tentasse entrar.
# =====================================================================
set -Eeuo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$RAIZ"

ALVO="${1:-real}"
[[ -f .env ]] || { echo ".env não encontrado em $RAIZ" >&2; exit 1; }

valor() { sed -n "s/^$1=//p" .env | tail -n 1; }

definir() {
    local chave="$1"
    VALOR="$2" awk -v c="$chave" '
        BEGIN { v = ENVIRON["VALOR"]; posto = 0 }
        $0 ~ "^" c "=" { print c "=" v; posto = 1; next }
        { print }
        END { if (!posto) print c "=" v }
    ' .env > .env.novo
    install -m 600 .env.novo .env
    rm -f .env.novo
}

case "$ALVO" in
    real)
        segredo="$(valor GOOGLE_CLIENT_SECRET)"
        if [[ -z "$segredo" || "$segredo" == pendente ]]; then
            echo "A chave do Google ainda não está configurada." >&2
            echo "Rode antes: ./infra/scripts/configurar-google.sh" >&2
            exit 2
        fi
        definir WEB_IMAGEM ghcr.io/everett-gi/interatletica-web
        echo "Endereço principal: app real (login com Google)."
        ;;
    demonstracao|demo)
        definir WEB_IMAGEM ghcr.io/everett-gi/interatletica-web-demo
        echo "Endereço principal: demonstração."
        ;;
    *)
        echo "uso: usar-app-real.sh [real|demonstracao]" >&2
        exit 2
        ;;
esac

docker compose pull --quiet web
docker compose up -d web

DOMINIO="$(valor DOMINIO)"
echo "Conferindo…"
curl -fsS --retry 10 --retry-delay 2 --retry-all-errors -o /dev/null \
     "https://${DOMINIO}/versao.json" \
    && curl -fsS "https://${DOMINIO}/versao.json"
echo
echo "Principal:     https://${DOMINIO}"
echo "Demonstração:  https://demo.${DOMINIO}"
