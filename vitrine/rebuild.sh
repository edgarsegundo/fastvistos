#!/bin/bash
# Rebuild + redeploy do vitrine no VPS — mesmo padrão do
# emprego/rebuild.sh (git pull, rebuild, reload nginx, pergunta migrate).
set -e

SERVICE_NAME="vitrine"

echo "Pulling latest code..."
git pull

# Rebuilda o bundle do editor visual (Puck) ANTES do `docker compose build` —
# a imagem do vitrine copia vitrine/core/static/editor/ (Dockerfile: COPY . .),
# então o bundle precisa estar fresco no disco antes do build da imagem, senão
# o admin serve JS velho até o próximo deploy. Roda no HOST (não no
# container): o repo Astro (multi-sites/, node_modules/) é um bind mount
# separado, fora da imagem — ver docs/editor/guia-editor-blocos-context.md.
# Mesmo repo do vitrine/ (monorepo) — o `git pull` acima já trouxe qualquer
# mudança em blocos/editor junto.
echo "Building editor bundle..."
(cd .. && npm run build:editor)

echo "Installing vitrine-deploy.sh (deploybot forced-command script)..."
sudo install -m 755 -o root -g root ops/vitrine-deploy.sh /usr/local/bin/vitrine-deploy.sh

echo "Building and starting container..."
docker compose up -d --build --force-recreate --remove-orphans

echo "Waiting for service '$SERVICE_NAME' to be running..."
until docker compose ps --status running | grep -q "$SERVICE_NAME"; do
  echo "  still waiting..."
  sleep 2
done

echo "Service '$SERVICE_NAME' is running."

echo "Reloading nginx..."
(
  cd ~/Repos/reverse-proxy-config
  docker compose exec -T nginx nginx -s reload || true
)

# Ask about migration (mesmo padrão do emprego/rebuild.sh)
read -p "Do you want to run 'python manage.py migrate'? [y/N]: " choice
choice=${choice:-N}

if [[ "$choice" =~ ^[Yy]$ ]]; then
    echo "Running migrations..."
    docker compose exec -T "$SERVICE_NAME" python manage.py migrate
else
    echo "Skipping migrations."
fi

echo "Done!"
