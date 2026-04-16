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

REPO="/home/edgar/Repos/fastvistos"

echo "===== START DEPLOY: $SITEID at $(date) =====" | tee -a "$LOG_FILE"

cd "$REPO"

echo "Generating blog content..." | tee -a "$LOG_FILE"
if [ -z "$FULL_OR_SLUG" ]; then
  node core/generate-blog-content.js "$SITEID" 2>&1 | tee -a "$LOG_FILE"
elif [ "$FULL_OR_SLUG" = "all" ]; then
  node core/generate-blog-content.js "$SITEID" --full 2>&1 | tee -a "$LOG_FILE"
else
  node core/generate-blog-content.js "$SITEID" "$FULL_OR_SLUG" 2>&1 | tee -a "$LOG_FILE"
fi

echo "Downloading images..." | tee -a "$LOG_FILE"
npm run "download-images:$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Generating responsive images..." | tee -a "$LOG_FILE"
node generate-responsive-images.js "$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Building site..." | tee -a "$LOG_FILE"
npm run "build:$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Deploying site..." | tee -a "$LOG_FILE"
node deploy-site.js "$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Syncing site images..." | tee -a "$LOG_FILE"
sudo ./sync-site-images.sh "$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "===== DEPLOY COMPLETE: $SITEID at $(date) =====" | tee -a "$LOG_FILE"
