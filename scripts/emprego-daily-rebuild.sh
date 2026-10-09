#!/bin/bash
# Rebuild diário do site emprego (páginas /candidatos/ e /cidades/ dependem dos
# dados do Django, então precisam ser regeneradas periodicamente).
#
# Build (mesmo do publish-from-local.sh) + deploy via script root fixo + IndexNow. Não faz git,
# blog nem imagens novas; imagens do blog ficam como estão (o deploy as preserva).
# Roda NA VPS, a partir da raiz do repo fastvistos.
#
# Instalação (uma vez, na VPS):
#   sudo install -o root -g root -m 755 scripts/emprego-deploy-root.sh /usr/local/sbin/emprego-deploy
#   echo 'edgar ALL=(root) NOPASSWD: /usr/local/sbin/emprego-deploy' | sudo tee /etc/sudoers.d/emprego-deploy
#   sudo chmod 440 /etc/sudoers.d/emprego-deploy && sudo visudo -cf /etc/sudoers.d/emprego-deploy
# (reinstale o script com o mesmo `sudo install` sempre que scripts/emprego-deploy-root.sh mudar)
#
# Exemplo de cron (04:30 UTC = 01:30 em Brasília):
#   30 4 * * * flock -n /tmp/emprego-rebuild.lock /home/edgar/Repos/fastvistos/scripts/emprego-daily-rebuild.sh >> /home/edgar/deploy_logs/emprego-daily.log 2>&1
#
# Pré-requisitos no .env da raiz: EMPREGO_API_BASE, EMPREGO_SEO_API_KEY, EMPREGO_INDEXNOW_KEY.
# O deploy usa rsync --delete: uma página que deixa de ser elegível some no próximo rebuild.
set -euo pipefail
cd "$(dirname "$0")/.."

# cron não carrega o nvm: mesmo PATH do publish-from-local.sh
export PATH="$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin"
# No cron, faltar chave/URL da API deve derrubar o build, não publicar um site sem as páginas.
export EMPREGO_SEO_REQUIRED=1

echo "=== $(date -Is) rebuild emprego ==="
npm run build:emprego
# -n: nunca pede senha (cron não tem terminal); falha com mensagem clara se o sudoers não estiver instalado
sudo -n /usr/local/sbin/emprego-deploy
node scripts/indexnow-emprego.mjs || echo "IndexNow falhou (não bloqueia o deploy)"
echo "=== $(date -Is) concluído ==="
