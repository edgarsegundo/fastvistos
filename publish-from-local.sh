#!/bin/bash

set -euo pipefail  # Interrompe o script em caso de erro, variáveis não definidas ou falhas de pipe

SITEID="$1"

if [ -z "$SITEID" ]; then
echo "Usage: $0 <siteid>"
exit 1
fi

LOG_DIR="$HOME/deploy_logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOG_FILE="$LOG_DIR/deploy_${SITEID}_${TIMESTAMP}.log"

echo "===== START DEPLOY: $SITEID at $(date) =====" | tee -a "$LOG_FILE"

# -------------------------

# Local Steps

# -------------------------

echo "Generating blog content..." | tee -a "$LOG_FILE"
if ! node generate-blog-content.js "$SITEID" 2>&1 | tee -a "$LOG_FILE"; then
echo "ERROR: Failed to generate blog content." | tee -a "$LOG_FILE"
exit 1
fi

echo "Downloading images..." | tee -a "$LOG_FILE"
if ! npm run download-images:"$SITEID" 2>&1 | tee -a "$LOG_FILE"; then
echo "ERROR: Failed to download images." | tee -a "$LOG_FILE"
exit 1
fi

echo "Pushing changes to repo..." | tee -a "$LOG_FILE"
if ! ~/Repos/pu.sh 2>&1 | tee -a "$LOG_FILE"; then
echo "ERROR: Failed to push changes." | tee -a "$LOG_FILE"
exit 1
fi

# -------------------------

# VPS Steps (corrigido)

# -------------------------

echo "Restoring and updating code on VPS..." | tee -a "$LOG_FILE"
ssh edgar@72.60.57.150 'cd /home/edgar/Repos/fastvistos && git reset --hard && git clean -fd && git pull' 2>&1 | tee -a "$LOG_FILE"

echo "Generating responsive images on VPS..." | tee -a "$LOG_FILE"
ssh edgar@72.60.57.150 'export PATH=$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && node generate-responsive-images.js '"$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Building site on VPS..." | tee -a "$LOG_FILE"
ssh edgar@72.60.57.150 'export PATH=$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && npm run build:'"$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Deploying site on VPS..." | tee -a "$LOG_FILE"
ssh edgar@72.60.57.150 'export PATH=$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && node deploy-site.js '"$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "Syncing site images on VPS..." | tee -a "$LOG_FILE"
ssh edgar@72.60.57.150 'export PATH=$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && sudo ./sync-site-images.sh '"$SITEID" 2>&1 | tee -a "$LOG_FILE"

echo "===== DEPLOY COMPLETE: $SITEID at $(date) =====" | tee -a "$LOG_FILE"
