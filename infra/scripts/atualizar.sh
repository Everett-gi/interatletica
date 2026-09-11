#!/usr/bin/env bash
# =====================================================================
# Chamado pelo timer do systemd a cada 2 minutos.
#
# O servidor puxa; ninguém empurra. Nenhuma chave de acesso a esta
# máquina precisa morar no GitHub: o Actions só publica imagem, e é o
# servidor que percebe a revisão nova e se atualiza.
#
# Implanta quando main andou E as imagens daquele commit já existem no
# GHCR. Se o CI reprovou, a imagem nunca aparece e o servidor fica onde
# está — quem decide o que vai ao ar é o CI, não este script.
#
# Logs: journalctl -u interatletica-atualizar
# =====================================================================
set -Eeuo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$RAIZ"

# Sem .env o servidor ainda não foi configurado; reclamar a cada 2
# minutos no journal não ajudaria ninguém a configurá-lo.
[[ -f .env ]] || exit 0
set -a; source .env; set +a

git fetch --quiet origin main
alvo="$(git rev-parse origin/main)"

[[ "$alvo" == "${IMAGEM_TAG:-}" ]] && exit 0

# Revisão que já falhou não é tentada de novo a cada 2 minutos — cada
# tentativa faz backup e derruba a API por alguns minutos. O próximo
# commit destrava.
[[ -f .revisao-recusada && "$(cat .revisao-recusada)" == "$alvo" ]] && exit 0

for imagem in "$API_IMAGEM" "$WEB_IMAGEM"; do
    docker manifest inspect "$imagem:$alvo" >/dev/null 2>&1 || exit 0
done

if ./infra/scripts/deploy.sh "$alvo"; then
    rm -f .revisao-recusada
else
    printf '%s\n' "$alvo" > .revisao-recusada
    exit 1
fi
