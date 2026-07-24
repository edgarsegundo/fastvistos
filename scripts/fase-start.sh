#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Uso: scripts/fase-start.sh [<tronco>] <numero> <slug-curto>"
  echo "  com tronco: scripts/fase-start.sh editor 1 fundacao-blocos"
  echo "  sem tronco: scripts/fase-start.sh 1 jsonld-schemas (usa branch atual como tronco)"
  exit 1
}

if [ $# -lt 2 ] || [ $# -gt 3 ]; then
  usage
fi

TRUNK=""
NUM=""
SLUG=""

case "$#" in
  2)
    NUM="$1"
    SLUG="$2"
    CURRENT="$(git branch --show-current)"
    if [[ "$CURRENT" =~ ^([a-z0-9_-]+)-fase- ]]; then
      TRUNK="${BASH_REMATCH[1]}"
      echo "Detectado tronco a partir do branch atual: $TRUNK"
    else
      TRUNK="$CURRENT"
      echo "Usando branch atual como tronco: $TRUNK"
    fi
    ;;
  3)
    TRUNK="$1"
    NUM="$2"
    SLUG="$3"
    ;;
esac

BRANCH="${TRUNK}-fase-${NUM}-${SLUG}"

git checkout "$TRUNK"
git pull --ff-only origin "$TRUNK" 2>/dev/null || true
git checkout -b "$BRANCH"

echo "Branch criado: $BRANCH"
echo "Trabalhe com o Claude Code agora (plan mode). Ao terminar, rode:"
echo "  scripts/fase-finish.sh"
