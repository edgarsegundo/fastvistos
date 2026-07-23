#!/bin/bash
# Rebuild + redeploy do vitrine no VPS — mesmo padrão do
# emprego/rebuild.sh (git pull, rebuild, reload nginx, pergunta migrate).
set -e

SERVICE_NAME="vitrine"

echo "Pulling latest code..."
git pull

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
