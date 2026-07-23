#!/bin/bash
# Script restrito rodado pelo usuário "deploybot" no VPS via SSH
# forced-command (ver ~/.ssh/authorized_keys do deploybot e
# docs/provisionamento-producao.md, Passo 7).
#
# O container/processo do Django NUNCA tem acesso direto a mv/rsync/docker
# exec — só manda um verbo aqui por SSH com uma chave que só pode rodar
# ESTE script (authorized_keys tem `command="..."`, nenhum shell livre).
#
# Instalado em /usr/local/bin/vitrine-deploy.sh pelo rebuild.sh a cada
# deploy (fonte de verdade é este arquivo, versionado no repo).
set -euo pipefail

read -r -a ARGS <<< "$SSH_ORIGINAL_COMMAND"
VERB="${ARGS[0]:-}"

validate_slug() { [[ "$1" =~ ^[a-z0-9-]+$ ]] || { echo "slug inválido: $1" >&2; exit 1; }; }
validate_ts() { [[ "$1" =~ ^[0-9]{8}-[0-9]{6}$ ]] || { echo "timestamp inválido: $1" >&2; exit 1; }; }

WWW_ROOT="/var/www/_saas"          # diretório pai único, ver Passo 3
ASTRO_DIST="/home/edgar/Repos/fastvistos_saas/dist/_saas"   # onde o build gera os arquivos (clone isolado)

case "$VERB" in
  rsync-release)
    SLUG="${ARGS[1]}"; TS="${ARGS[2]}"
    validate_slug "$SLUG"; validate_ts "$TS"
    mkdir -p "$WWW_ROOT/$SLUG/releases/$TS"
    rsync -a --delete "$ASTRO_DIST/$SLUG/" "$WWW_ROOT/$SLUG/releases/$TS/"
    ;;
  switch-symlink)
    SLUG="${ARGS[1]}"; TS="${ARGS[2]}"
    validate_slug "$SLUG"; validate_ts "$TS"
    ln -sfn "$WWW_ROOT/$SLUG/releases/$TS" "$WWW_ROOT/$SLUG/current"
    ;;
  reload-nginx)
    sudo /usr/bin/docker exec nginx nginx -t
    sudo /usr/bin/docker exec nginx nginx -s reload
    ;;
  rename-project)
    OLD="${ARGS[1]}"; NEW="${ARGS[2]}"
    validate_slug "$OLD"; validate_slug "$NEW"
    [ -d "$WWW_ROOT/$OLD" ] || { echo "pasta origem não existe: $WWW_ROOT/$OLD" >&2; exit 1; }
    [ ! -e "$WWW_ROOT/$NEW" ] || { echo "pasta destino já existe: $WWW_ROOT/$NEW" >&2; exit 1; }
    mv "$WWW_ROOT/$OLD" "$WWW_ROOT/$NEW"
    ;;
  write-nginx-conf|certbot-issue|dns-check)
    echo "Verbo '$VERB' ainda não implementado nesta fase (domínio customizado é Fase futura)" >&2
    exit 1
    ;;
  *)
    echo "Verbo desconhecido: $VERB" >&2
    exit 1
    ;;
esac
