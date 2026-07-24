#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Uso: scripts/fase-finish.sh [<numero> <slug-curto>] [--checkpoint]"
  echo "  sem número/slug: detecta a partir do branch atual (seo-fase-N-slug)"
  echo "  sem --checkpoint: merge final (com tag, apaga o branch)"
  echo "  com --checkpoint: merge parcial pra testar em produção (sem tag, branch continua)"
  exit 1
}

MODE=""
NUM=""
SLUG=""

case "$#" in
  0)
    ;;
  1)
    [ "$1" = "--checkpoint" ] || usage
    MODE="$1"
    ;;
  2)
    NUM="$1"
    SLUG="$2"
    ;;
  3)
    NUM="$1"
    SLUG="$2"
    MODE="$3"
    ;;
  *)
    usage
    ;;
esac

if [ -z "$NUM" ]; then
  CURRENT_BRANCH="$(git branch --show-current)"
  if [[ "$CURRENT_BRANCH" =~ ^seo-fase-([0-9]+)-(.+)$ ]]; then
    NUM="${BASH_REMATCH[1]}"
    SLUG="${BASH_REMATCH[2]}"
    echo "Detectado a partir do branch atual: fase ${NUM} (${SLUG})"
  else
    echo "Não foi possível detectar número/slug a partir do branch atual ('${CURRENT_BRANCH}')."
    usage
  fi
fi

BRANCH="seo-fase-${NUM}-${SLUG}"
TAG="seo-fase-${NUM}-done"

if [ "$MODE" = "--checkpoint" ]; then
  git checkout seo
  git merge --no-ff "$BRANCH" -m "merge: Fase ${NUM} (${SLUG}) - checkpoint parcial"
  git checkout "$BRANCH"
  echo "Checkpoint da Fase ${NUM} mergeado em seo (sem tag, branch '$BRANCH' continua ativo)."
  echo "Lembre de fazer deploy na VPS a partir de seo pra testar."
else
  git checkout seo
  git merge --no-ff "$BRANCH" -m "merge: Fase ${NUM} (${SLUG}) concluída"
  git tag -a "$TAG" -m "Fase ${NUM} completa: ${SLUG}"
  git branch -d "$BRANCH"
  echo "Fase ${NUM} mergeada em seo e taggeada como ${TAG}."
  echo "Não esqueça:"
  echo "  git push origin seo --tags   (se tiver remoto)"
  echo "  deploy na VPS a partir de seo"
fi
