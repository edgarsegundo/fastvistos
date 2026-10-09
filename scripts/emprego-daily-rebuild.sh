#!/bin/bash
# Rebuild diário do site emprego (páginas /candidatos/ e /cidades/ dependem dos
# dados do Django, então precisam ser regeneradas periodicamente).
#
# Roda NA VPS, a partir da raiz do repo fastvistos. Exemplo de cron (04:30 todo dia):
#   30 4 * * * cd /caminho/fastvistos && ./scripts/emprego-daily-rebuild.sh >> /var/log/emprego-rebuild.log 2>&1
#
# Pré-requisitos no .env da raiz: EMPREGO_API_BASE, EMPREGO_SEO_API_KEY,
# EMPREGO_INDEXNOW_KEY (opcional). O deploy-site-vps.sh faz rsync SEM --delete:
# uma página que deixa de ser elegível continua no ar até ser removida à mão.
set -euo pipefail
cd "$(dirname "$0")/.."
# No cron, faltar chave/URL da API deve derrubar o build, não publicar um site sem as páginas.
export EMPREGO_SEO_REQUIRED=1

echo "=== $(date -Is) rebuild emprego ==="
npm run build:emprego
./deploy-site-vps.sh emprego
node scripts/indexnow-emprego.mjs || echo "IndexNow falhou (não bloqueia o deploy)"
echo "=== $(date -Is) concluído ==="
