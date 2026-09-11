#!/usr/bin/env bash
# =====================================================================
# Prepara uma VM Ubuntu 24.04 para rodar a Interatlética.
# Feito para a E2.1.Micro da Oracle (free tier: 1 GB, 1/8 de OCPU).
#
#   sudo ./infra/scripts/preparar-servidor.sh
#
# Numa máquina recém-criada, sem o repositório ainda:
#   curl -fsSL https://raw.githubusercontent.com/Everett-gi/interatletica/main/infra/scripts/preparar-servidor.sh | sudo bash
#
# Idempotente: rodar de novo não estraga nada. Não cria o .env — ele
# guarda segredo e é escrito à mão, a partir do .env.example.
# =====================================================================
set -Eeuo pipefail
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a

RAIZ=/opt/interatletica
REPOSITORIO=https://github.com/Everett-gi/interatletica.git
USUARIO="${SUDO_USER:-ubuntu}"
APT="apt-get -o DPkg::Lock::Timeout=300 -q"

[[ $EUID -eq 0 ]] || { echo "rode com sudo" >&2; exit 1; }
passo() { printf '\n== %s\n' "$*"; }

passo "fuso de São Paulo"
# O backup das 3h30 é 3h30 de quem lê o log, não de Greenwich.
timedatectl set-timezone America/Sao_Paulo

passo "swap de 2 GB"
# 1 GB segura banco + JVM + Caddy, mas sem folga. O swap é a diferença
# entre ficar lento num pico e o OOM killer derrubar o Postgres.
if ! swapon --show=NAME --noheadings | grep -qx /swapfile; then
    if [[ ! -f /swapfile ]]; then
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap -q /swapfile
    fi
    swapon /swapfile
fi
grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
# Vai para o swap o que está parado de verdade (os agentes da Oracle,
# por exemplo), e não o heap da JVM.
printf 'vm.swappiness=10\nvm.vfs_cache_pressure=50\n' > /etc/sysctl.d/99-interatletica.conf
sysctl -q --system

passo "firewall do host: 80, 443 e 443/udp (HTTP/3)"
# A imagem Ubuntu da Oracle vem com iptables rejeitando tudo além do SSH.
# A regra entra antes do REJECT final, e direto no rules.v4 em vez de via
# `netfilter-persistent save`: com o Docker rodando, o save gravaria as
# cadeias dele junto, e no boot seguinte elas voltariam duplicadas.
#
# Isso é o firewall da máquina. A Security List da VCN, no console da
# Oracle, é outra camada e também precisa liberar 80 e 443.
REGRAS=/etc/iptables/rules.v4
for par in "tcp 80" "tcp 443" "udp 443"; do
    read -r proto porta <<< "$par"
    padrao="^-A INPUT -p $proto .*--dport $porta .*-j ACCEPT"
    if [[ -f $REGRAS ]] && ! grep -qE -- "$padrao" "$REGRAS"; then
        sed -i "/^-A INPUT -j REJECT/i -A INPUT -p $proto -m state --state NEW -m $proto --dport $porta -j ACCEPT" "$REGRAS"
    fi
    if ! iptables -S INPUT | grep -qE -- "$padrao"; then
        pos="$(iptables -L INPUT --line-numbers -n | awk '$2 == "REJECT" { print $1; exit }')"
        iptables -I INPUT "${pos:-1}" -p "$proto" -m state --state NEW -m "$proto" --dport "$porta" -j ACCEPT
    fi
done

passo "serviços que não servem aqui"
# rpcbind é do NFS e escutava em 0.0.0.0:111 sem motivo.
systemctl disable --now rpcbind.socket rpcbind.service >/dev/null 2>&1 || true

passo "pacotes base"
$APT update >/dev/null
$APT install -y ca-certificates curl git >/dev/null

passo "Docker (repositório oficial)"
if ! command -v docker >/dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    . /etc/os-release
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-$VERSION_CODENAME} stable" \
        > /etc/apt/sources.list.d/docker.list
    $APT update >/dev/null
    $APT install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
fi

# Log com rotação: o json-file padrão cresce sem limite até encher o
# disco. live-restore mantém os containers de pé enquanto o daemon
# reinicia — numa atualização do próprio Docker, por exemplo.
mkdir -p /etc/docker
novo="$(mktemp)"
cat > "$novo" <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true
}
JSON
if ! cmp -s "$novo" /etc/docker/daemon.json; then
    install -m 0644 "$novo" /etc/docker/daemon.json
    systemctl restart docker
fi
rm -f "$novo"
usermod -aG docker "$USUARIO"

passo "repositório em $RAIZ"
[[ -d $RAIZ/.git ]] || git clone --quiet "$REPOSITORIO" "$RAIZ"
chown -R "$USUARIO:$USUARIO" "$RAIZ"

passo "timers do systemd"
cat > /etc/systemd/system/interatletica-atualizar.service <<EOF
[Unit]
Description=Interatlética: implanta a revisão nova de main, se houver
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=$USUARIO
WorkingDirectory=$RAIZ
ExecStart=$RAIZ/infra/scripts/atualizar.sh
# Backup, pull e subida da API numa CPU de 1/8.
TimeoutStartSec=20min
EOF

cat > /etc/systemd/system/interatletica-atualizar.timer <<'EOF'
[Unit]
Description=Interatlética: procura revisão nova a cada 2 minutos

[Timer]
OnBootSec=2min
# Conta a partir do fim da execução anterior: um deploy longo nunca
# encavala no seguinte.
OnUnitInactiveSec=2min

[Install]
WantedBy=timers.target
EOF

cat > /etc/systemd/system/interatletica-backup.service <<EOF
[Unit]
Description=Interatlética: backup diário do banco
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
User=$USUARIO
WorkingDirectory=$RAIZ
ExecStart=$RAIZ/infra/scripts/backup.sh
EOF

cat > /etc/systemd/system/interatletica-backup.timer <<'EOF'
[Unit]
Description=Interatlética: backup do banco às 3h30

[Timer]
OnCalendar=*-*-* 03:30:00
# Máquina desligada às 3h30 faz o backup assim que voltar.
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now interatletica-atualizar.timer interatletica-backup.timer >/dev/null 2>&1

passo "pronto"
[[ -f $RAIZ/.env ]] || echo "Falta $RAIZ/.env (modelo: .env.example). Até ele existir, o timer espera sem fazer nada."
