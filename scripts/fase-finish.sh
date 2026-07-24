#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Uso: scripts/fase-finish.sh [--checkpoint]"
  echo "  detecta tronco/número/slug a partir do branch atual ({tronco}-fase-N-slug)"
  echo "  sem --checkpoint: merge final (com tag, apaga o branch)"
  echo "  com --checkpoint: merge parcial pra testar em produção (sem tag, branch continua)"
  exit 1
}

MODE="${1:-}"
[ "$MODE" = "--checkpoint" ] || [ -z "$MODE" ] || usage

CURRENT_BRANCH="$(git branch --show-current)"

if [[ "$CURRENT_BRANCH" =~ ^([a-z0-9_-]+)-fase-([0-9]+)-(.+)$ ]]; then
  TRUNK="${BASH_REMATCH[1]}"
  NUM="${BASH_REMATCH[2]}"
  SLUG="${BASH_REMATCH[3]}"
  echo "Detectado: tronco '$TRUNK', fase ${NUM} (${SLUG})"
else
  echo "Não foi possível detectar tronco/número/slug a partir do branch atual ('${CURRENT_BRANCH}')."
  usage
fi

BRANCH="${TRUNK}-fase-${NUM}-${SLUG}"
TAG="${TRUNK}-fase-${NUM}-done"

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
