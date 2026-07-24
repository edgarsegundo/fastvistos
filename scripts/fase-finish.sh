#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ] || [ $# -gt 3 ]; then
  echo "Uso: scripts/fase-finish.sh <numero> <slug-curto> [--checkpoint]"
  echo "  sem --checkpoint: merge final (com tag, apaga o branch)"
  echo "  com --checkpoint: merge parcial pra testar em produção (sem tag, branch continua)"
  exit 1
fi

NUM="$1"
SLUG="$2"
MODE="${3:-}"
BRANCH="feat/seo/fase-${NUM}-${SLUG}"
TAG="seo-fase-${NUM}-done"

if [ "$MODE" = "--checkpoint" ]; then
  git checkout feat/seo
  git merge --no-ff "$BRANCH" -m "merge: Fase ${NUM} (${SLUG}) - checkpoint parcial"
  git checkout "$BRANCH"
  echo "Checkpoint da Fase ${NUM} mergeado em feat/seo (sem tag, branch '$BRANCH' continua ativo)."
  echo "Lembre de fazer deploy na VPS a partir de feat/seo pra testar."
else
  git checkout feat/seo
  git merge --no-ff "$BRANCH" -m "merge: Fase ${NUM} (${SLUG}) concluída"
  git tag -a "$TAG" -m "Fase ${NUM} completa: ${SLUG}"
  git branch -d "$BRANCH"
  echo "Fase ${NUM} mergeada em feat/seo e taggeada como ${TAG}."
  echo "Não esqueça:"
  echo "  git push origin feat/seo --tags   (se tiver remoto)"
  echo "  deploy na VPS a partir de feat/seo"
fi
