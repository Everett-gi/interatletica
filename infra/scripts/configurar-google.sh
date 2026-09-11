#!/usr/bin/env bash
# =====================================================================
# Liga o login com Google no servidor.
#
#   ./infra/scripts/configurar-google.sh [ID_DO_CLIENTE] [operadores]
#
# A chave secreta NÃO entra por argumento: o script pergunta e lê sem
# ecoar. Argumento fica no histórico do shell e aparece em `ps` enquanto
# o comando roda — segredo não passa por lá. Pelo mesmo motivo a troca no
# .env é feita por awk lendo o valor do ambiente, e não por `sed -i` com
# o segredo na linha de comando.
#
# O ID do cliente pode vir por argumento ou já estar no .env; ele não é
# segredo (viaja na URL do próprio fluxo OAuth).
#
# Os operadores são os e-mails que podem administrar a plataforma,
# separados por vírgula. Opcional.
# =====================================================================
set -Eeuo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$RAIZ"

ID="${1:-}"
OPERADORES="${2:-}"

[[ -f .env ]] || { echo ".env não encontrado em $RAIZ" >&2; exit 1; }

if [[ -z "$ID" ]]; then
    ID="$(sed -n 's/^GOOGLE_CLIENT_ID=//p' .env)"
fi
[[ "$ID" == *.apps.googleusercontent.com ]] || {
    echo "O ID do cliente termina em .apps.googleusercontent.com — confira o valor." >&2
    exit 2
}

# Grava sem deixar rastro: -s não ecoa, e a variável sai do ambiente no
# fim. O valor nunca chega a aparecer na tela nem no histórico.
read -rsp "Chave secreta do cliente (não aparece na tela): " SEGREDO
echo
[[ -n "$SEGREDO" ]] || { echo "Chave vazia — nada foi gravado." >&2; exit 2; }

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

definir GOOGLE_CLIENT_ID "$ID"
definir GOOGLE_CLIENT_SECRET "$SEGREDO"
[[ -n "$OPERADORES" ]] && definir APP_OPERADORES "$OPERADORES"
unset SEGREDO

echo "Gravado. Subindo a API com as credenciais novas…"
docker compose up -d

DOMINIO="$(sed -n 's/^DOMINIO=//p' .env)"
echo
echo "Pronto. Teste o login em https://${DOMINIO}/entrar"
echo "No Google, a URI de redirecionamento precisa ser exatamente:"
echo "  https://${DOMINIO}/login/oauth2/code/google"
