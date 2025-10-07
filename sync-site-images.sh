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

## Ensure permissions are correct on remote folder (assumes user has access)
# chown/chmod not needed if user/group is set up properly

sudo usermod -aG systemd-journal edgar

# Rsync command
sudo bash -c "rsync -avz --progress /var/lib/docker/volumes/microservicesadm_mediafiles/_data/images/${SITEID}__* ${DEST_USER}@${DEST_HOST}:/var/www/${SITEID}/assets/images/blog/"


echo "✅ Images for site '$SITEID' synced successfully!"
