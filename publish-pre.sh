#!/bin/bash

SITEID="$1"

if [ -z "$SITEID" ]; then
  echo "Usage: $0 <siteid>"
  exit 1
fi

node generate-blog-content.js "$SITEID"
npm run download-images:"$SITEID"

## Sync site images on VPS
ssh edgar@72.60.57.150 "cd /home/edgar/Repos/fastvistos && sudo ./sync-site-images.sh $SITEID"

npm run dev:watch:"$SITEID"