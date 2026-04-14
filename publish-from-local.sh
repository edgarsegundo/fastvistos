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

echo "===== START DEPLOY: $SITEID at $(date) =====" | tee -a "$LOG_FILE"

# -------------------------
# Local Steps
# -------------------------

echo "Pushing changes to repo..." | tee -a "$LOG_FILE"
if ! ~/Repos/pu.sh 2>&1 | tee -a "$LOG_FILE"; then
  echo "ERROR: Failed to push changes." | tee -a "$LOG_FILE"
  exit 1
fi

# -------------------------
# VPS Steps
# -------------------------

echo "Restoring and updating code on VPS..." | tee -a "$LOG_FILE"
ssh "$VPS" "cd $REPO && git fetch origin && git reset --hard origin/main && git clean -fd" 2>&1 | tee -a "$LOG_FILE"

echo "Generating blog content on VPS..." | tee -a "$LOG_FILE"
if [ -z "$FULL_OR_SLUG" ]; then
  ssh "$VPS" "$NODE && cd $REPO && node core/generate-blog-content.js $SITEID" 2>&1 | tee -a "$LOG_FILE"
elif [ "$FULL_OR_SLUG" = "all" ]; then
  ssh "$VPS" "$NODE && cd $REPO && node core/generate-blog-content.js $SITEID --full" 2>&1 | tee -a "$LOG_FILE"
else
  ssh "$VPS" "$NODE && cd $REPO && node core/generate-blog-content.js $SITEID $FULL_OR_SLUG" 2>&1 | tee -a "$LOG_FILE"
fi

echo "Downloading images on VPS..." | tee -a "$LOG_FILE"
ssh "$VPS" "$NODE && cd $REPO && npm run download-images:$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Generating responsive images on VPS..." | tee -a "$LOG_FILE"
ssh "$VPS" "$NODE && cd $REPO && node generate-responsive-images.js $SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Building site on VPS..." | tee -a "$LOG_FILE"
ssh "$VPS" "$NODE && cd $REPO && npm run build:$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Deploying site on VPS..." | tee -a "$LOG_FILE"
ssh "$VPS" "$NODE && cd $REPO && node deploy-site.js $SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Syncing site images on VPS..." | tee -a "$LOG_FILE"
ssh "$VPS" "$NODE && cd $REPO && sudo ./sync-site-images.sh $SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "===== DEPLOY COMPLETE: $SITEID at $(date) =====" | tee -a "$LOG_FILE"