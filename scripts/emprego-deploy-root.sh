#!/bin/bash
# Deploy FIXO do site emprego, feito para ser liberado no sudo sem senha (cron).
#
# NÃO rode direto do repositório com sudo e NÃO aponte o sudoers para o caminho do repo: o
# repositório é gravável pelo usuário edgar, então liberar um script de lá seria dar root a qualquer
# um que consiga editá-lo. Instale uma cópia pertencente ao root (ver scripts/emprego-daily-rebuild.sh):
#   sudo install -o root -g root -m 755 scripts/emprego-deploy-root.sh /usr/local/sbin/emprego-deploy
#
# Faz o mesmo que `node deploy-site.js emprego` (mkdir + rsync --delete + chown), sem aceitar nenhum
# argumento (caminhos fixos), e PROTEGE assets/images/blog/ do --delete: essas imagens vêm do volume
# do docker via sync-site-images.sh (que o publish-from-local.sh roda) e não estão no dist.
set -euo pipefail

SRC=/home/edgar/Repos/fastvistos/dist/emprego/
DEST=/var/www/emprego/

if [ ! -f "${SRC}index.html" ]; then
  echo "❌ ${SRC}index.html não existe: build incompleto, nada foi publicado."
  exit 1
fi

mkdir -p "$DEST"
rsync -a --delete --filter='P /assets/images/blog/***' "$SRC" "$DEST"
chown -R www-data:www-data "$DEST"
echo "✅ emprego publicado em $DEST"
