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

# Now run the following scripts on the VPS from your local machine
# Restaura e atualiza o código no VPS
cd /home/edgar/Repos/fastvistos && git restore . && git pull

## Build site on VPS
export PATH=\$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && npm run build:$SITEID

## Deploy site on VPS
export PATH=\$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && node deploy-site.js '$SITEID'

## Sync site images on VPS
export PATH=\$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && sudo ./sync-site-images.sh $SITEID