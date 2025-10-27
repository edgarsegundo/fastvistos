#!/bin/bash

SITEID="$1"

if [ -z "$SITEID" ]; then
  echo "Usage: $0 <siteid>"
  exit 1
fi

# Run these commands locally to generate blog content and download images
## Generate blog content and download images
node generate-blog-content.js "$SITEID"
## Download images
npm run download-images:"$SITEID"
## Push changes to repo
~/Repos/pu.sh

# Now run the following scripts on the VPS from your local machine
# Restaura e atualiza o código no VPS
ssh edgar@72.60.57.150 "cd /home/edgar/Repos/fastvistos && git restore . && git pull"

## Build site on VPS
ssh edgar@72.60.57.150 "export PATH=\$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && npm run build:$SITEID"

## Deploy site on VPS
# ssh edgar@72.60.57.150 "cd /home/edgar/Repos/fastvistos && node deploy-site-v2.js '$SITEID'"

# ssh edgar@72.60.57.150 "cd /home/edgar/Repos/fastvistos && node deploy-site-v2.js '$SITEID'" 2>&1

# ssh edgar@72.60.57.150 "cd /home/edgar/Repos/fastvistos && node test.js" 
# ssh edgar@72.60.57.150 "/home/edgar/.nvm/versions/node/v22.0.0/bin/node /home/edgar/Repos/fastvistos/deploy-site-v2.js '$SITEID'"

## Sync site images on VPS
# ssh edgar@72.60.57.150 "cd /home/edgar/Repos/fastvistos && sudo ./sync-site-images.sh $SITEID"