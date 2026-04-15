#!/bin/bash

set -euo pipefail

SITEID="$1"
FULL_OR_SLUG="${2:-}"

if [ -z "$SITEID" ]; then
  echo "Usage: $0 <siteid> [all|slug]"
  exit 1
fi

LOG_DIR="$HOME/deploy_logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOG_FILE="$LOG_DIR/deploy_${SITEID}_${TIMESTAMP}.log"

VPS="edgar@72.60.57.150"
REPO="/home/edgar/Repos/fastvistos"
NODE="export PATH=\$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin"

# Detecta se está rodando no VPS
CURRENT_HOST=$(hostname)
IS_LOCAL=true

if [[ -d "/home/edgar/Repos/fastvistos" ]]; then
  IS_LOCAL=false
fi

run_remote() {
  if [ "$IS_LOCAL" = true ]; then
    ssh "$VPS" "$1"
  else
    eval "$1"
  fi
}

echo "===== START DEPLOY: $SITEID at $(date) =====" | tee -a "$LOG_FILE"

# -------------------------
# Local Steps
# -------------------------

if [ "$IS_LOCAL" = true ]; then
  echo "Pushing changes to repo..." | tee -a "$LOG_FILE"
  if ! ~/Repos/pu.sh 2>&1 | tee -a "$LOG_FILE"; then
    echo "ERROR: Failed to push changes." | tee -a "$LOG_FILE"
    exit 1
  fi
fi

# -------------------------
# VPS Steps (ou local se já estiver no VPS)
# -------------------------

echo "Restoring and updating code..." | tee -a "$LOG_FILE"
run_remote "cd $REPO && git fetch origin && git reset --hard origin/main && git clean -fd" \
  2>&1 | tee -a "$LOG_FILE"

echo "Generating blog content..." | tee -a "$LOG_FILE"
if [ -z "$FULL_OR_SLUG" ]; then
  run_remote "$NODE && cd $REPO && node core/generate-blog-content.js $SITEID" \
    2>&1 | tee -a "$LOG_FILE"
elif [ "$FULL_OR_SLUG" = "all" ]; then
  run_remote "$NODE && cd $REPO && node core/generate-blog-content.js $SITEID --full" \
    2>&1 | tee -a "$LOG_FILE"
else
  run_remote "$NODE && cd $REPO && node core/generate-blog-content.js $SITEID $FULL_OR_SLUG" \
    2>&1 | tee -a "$LOG_FILE"
fi

echo "Downloading images..." | tee -a "$LOG_FILE"
run_remote "$NODE && cd $REPO && npm run download-images:$SITEID" \
  2>&1 | tee -a "$LOG_FILE"

echo "Generating responsive images..." | tee -a "$LOG_FILE"
run_remote "$NODE && cd $REPO && node generate-responsive-images.js $SITEID" \
  2>&1 | tee -a "$LOG_FILE"

echo "===== END DEPLOY: $SITEID at $(date) =====" | tee -a "$LOG_FILE"
