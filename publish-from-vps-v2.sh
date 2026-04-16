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

echo "===== START DEPLOY: $SITEID at $(date) =====" | tee -a "$LOG_FILE"

# -------------------------
# Local Steps (push só daqui)
# -------------------------

echo "Pushing changes to repo..." | tee -a "$LOG_FILE"
if ! ~/Repos/pu.sh 2>&1 | tee -a "$LOG_FILE"; then
  echo "ERROR: Failed to push changes." | tee -a "$LOG_FILE"
  exit 1
fi

# -------------------------
# VPS helper
# -------------------------

run_vps() {
  ssh "$VPS" "bash -lc '$1'" 2>&1 | tee -a "$LOG_FILE"
}

# -------------------------
# VPS Steps
# -------------------------

echo "Restoring and updating code on VPS..." | tee -a "$LOG_FILE"
run_vps "cd $REPO && git fetch origin && git reset --hard origin/main && git clean -fd"

echo "Generating blog content on VPS..." | tee -a "$LOG_FILE"
if [ -z "$FULL_OR_SLUG" ]; then
  run_vps "cd $REPO && node core/generate-blog-content.js $SITEID"
elif [ "$FULL_OR_SLUG" = "all" ]; then
  run_vps "cd $REPO && node core/generate-blog-content.js $SITEID --full"
else
  run_vps "cd $REPO && node core/generate-blog-content.js $SITEID $FULL_OR_SLUG"
fi

echo "Downloading images on VPS..." | tee -a "$LOG_FILE"
run_vps "cd $REPO && npm run download-images:$SITEID"

echo "Generating responsive images on VPS..." | tee -a "$LOG_FILE"
run_vps "cd $REPO && node generate-responsive-images.js $SITEID"

echo "Building site on VPS..." | tee -a "$LOG_FILE"
run_vps "cd $REPO && npm run build:$SITEID"

echo "Deploying site on VPS..." | tee -a "$LOG_FILE"
run_vps "cd $REPO && node deploy-site.js $SITEID"

echo "Syncing site images on VPS..." | tee -a "$LOG_FILE"
run_vps "cd $REPO && sudo ./sync-site-images.sh $SITEID"

echo "===== DEPLOY COMPLETE: $SITEID at $(date) =====" | tee -a "$LOG_FILE"
