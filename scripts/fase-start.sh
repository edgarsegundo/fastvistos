#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Uso: scripts/fase-start.sh <numero> <slug-curto>"
  echo "Exemplo: scripts/fase-start.sh 1 jsonld-schemas"
  exit 1
fi

NUM="$1"
SLUG="$2"
BRANCH="seo-fase-${NUM}-${SLUG}"

git checkout seo
git pull --ff-only origin seo 2>/dev/null || true
git checkout -b "$BRANCH"

echo "Branch criado: $BRANCH"
echo "Trabalhe com o Claude Code agora (plan mode). Ao terminar, rode:"
echo "  scripts/fase-finish.sh $NUM $SLUG"
