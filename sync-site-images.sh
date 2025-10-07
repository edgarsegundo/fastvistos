#!/bin/bash
# Usage: ./sync-site-images.sh <siteid>

set -e

SITEID="$1"
if [ -z "$SITEID" ]; then
  echo "Usage: $0 <siteid>"
  exit 1
fi

# Customize these variables for your environment
SRC="/var/lib/docker/volumes/microservicesadm_mediafiles/_data/images/${SITEID}__*"
DEST_USER="edgar"
DEST_HOST="72.60.57.150"
DEST_PATH="/var/www/${SITEID}/assets/images/blog/"

# Rsync command
rsync -avz --progress "$SRC" "${DEST_USER}@${DEST_HOST}:${DEST_PATH}" || { echo "❌ Rsync failed!"; exit 1; }

echo "✅ Images for site '$SITEID' synced successfully!"
