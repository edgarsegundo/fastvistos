#!/bin/bash
# Rebuild diário do site emprego (páginas /candidatos/ e /cidades/ dependem dos
# dados do Django, então precisam ser regeneradas periodicamente).
#
# Mesmos passos de build/deploy do publish-from-local.sh (build:emprego +
# deploy-site.js + sync-site-images.sh), só sem git, blog nem imagens novas.
# Roda NA VPS, a partir da raiz do repo fastvistos. Exemplo de cron (04:30 todo dia):
#   30 4 * * * /home/edgar/Repos/fastvistos/scripts/emprego-daily-rebuild.sh >> /home/edgar/deploy_logs/emprego-daily.log 2>&1
#
# Pré-requisitos no .env da raiz: EMPREGO_API_BASE, EMPREGO_SEO_API_KEY,
# EMPREGO_INDEXNOW_KEY (opcional). O deploy-site.js usa rsync --delete: uma página
# que deixa de ser elegível some do site no próximo rebuild.
set -euo pipefail
cd "$(dirname "$0")/.."

# cron não carrega o nvm: mesmo PATH do publish-from-local.sh
export PATH="$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin"
# No cron, faltar chave/URL da API deve derrubar o build, não publicar um site sem as páginas.
export EMPREGO_SEO_REQUIRED=1

echo "=== $(date -Is) rebuild emprego ==="
npm run build:emprego
node deploy-site.js emprego
sudo ./sync-site-images.sh emprego
node scripts/indexnow-emprego.mjs || echo "IndexNow falhou (não bloqueia o deploy)"
echo "=== $(date -Is) concluído ==="
