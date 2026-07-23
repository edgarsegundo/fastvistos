#!/bin/bash
# Rebuild + redeploy do vitrine no VPS — mesmo padrão do
# emprego/rebuild.sh, adaptado (migrate já roda automático no run.sh,
# não precisa perguntar interativamente).
set -e

SERVICE_NAME="vitrine"

echo "Pulling latest code..."
git pull

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

echo "Done!"
