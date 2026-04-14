#!/bin/bash

SITEID="$1"
SLUG_OR_ALL="$2"

if [ -z "$SITEID" ]; then
  echo "Usage: $0 <siteid> [slug|all]"
  exit 1
fi

node generate-responsive-images.js "$SITEID"


# Geração de artigos:
# - Se não passar slug nem 'all': gera modificados (incremental)
# - Se passar slug: gera só aquele
# - Se passar 'all': gera todos (full)
if [ -z "$SLUG_OR_ALL" ]; then
  node core/generate-blog-content.js "$SITEID"
elif [ "$SLUG_OR_ALL" = "all" ]; then
  node core/generate-blog-content.js "$SITEID" all --full
else
  node core/generate-blog-content.js "$SITEID" "$SLUG_OR_ALL"
fi

npm run download-images:"$SITEID"

## Sync site images on VPS
ssh edgar@72.60.57.150 "cd /home/edgar/Repos/fastvistos && sudo ./sync-site-images.sh $SITEID"

npm run dev:watch:"$SITEID"