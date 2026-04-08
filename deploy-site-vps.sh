#!/bin/bash

# VPS deployment script
# Usage: ./deploy-site-vps.sh <siteid>

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to generate site path dynamically
generate_site_path() {
    local site_id=$1
    echo "/var/www/${site_id}"
}

show_usage() {
    echo ""
    echo -e "${YELLOW}Usage: $0 <siteid>${NC}"
    echo ""
    echo "Example: $0 fastvistos"
    echo "         $0 centraldevistos"
    echo ""
}

validate_site_id() {
    local site_id=$1
    local site_dist_path="/var/www/${site_id}"
    if [[ ! -d "$site_dist_path" ]]; then
        echo -e "${RED}❌ Error: $site_dist_path folder not found on VPS.${NC}"
        exit 1
    fi
}

deploy_on_vps() {
    local site_id=$1
    local remote_path="/var/www/${site_id}"
    local site_dist_path="./dist/${site_id}/"
    echo -e "${BLUE}🚀 Deploying site on VPS: $site_id${NC}"
    echo -e "${BLUE}📁 Local path: $site_dist_path${NC}"
    echo -e "${BLUE}📁 Deploy path: $remote_path${NC}"
    echo ""

    # Step 1: Setup deployment directory (only if it does not exist)
    if [[ ! -d "$remote_path" ]]; then
        echo -e "${YELLOW}📁 Setting up deployment directory...${NC}"
        if sudo mkdir -p "$remote_path" && sudo chown "$USER:$USER" "$remote_path"; then
            echo -e "${GREEN}✅ Deployment directory setup completed${NC}"
        else
            echo -e "${RED}❌ Deployment directory setup failed${NC}"
            exit 1
        fi
    fi

    # Step 2: Sync files locally
    echo ""
    echo -e "${YELLOW}📤 Syncing files...${NC}"
    
    # The --delete flag means:
    # Any files or directories in the destination that are not present in the source will be removed.
    # I'm removing this option --delete because I need to preserve the folder webpage_sections 
    # How it was before: sudo rsync -avz --delete "$site_dist_path" "$remote_path"
    if sudo rsync -avz "$site_dist_path" "$remote_path"; then
        echo -e "${GREEN}✅ Files synced successfully${NC}"
    else
        echo -e "${RED}❌ Rsync failed${NC}"
        exit 1
    fi

    # Step 3: Fix ownership for web server
    echo ""
    echo -e "${YELLOW}🔧 Fixing file ownership for web server...${NC}"
    # if sudo chown -R www-data:www-data "$remote_path"; then
    if sudo chown -R edgar:edgar "$remote_path"; then
        echo -e "${GREEN}✅ File ownership updated${NC}"
    else
        echo -e "${RED}❌ File ownership update failed${NC}"
        exit 1
    fi

    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}🌐 Site should be available at: https://${site_id}.com${NC}"
}

main() {
    local site_id=$1
    if [[ -z "$site_id" ]]; then
        echo -e "${RED}❌ Error: siteid is required.${NC}"
        show_usage
        exit 1
    fi
    validate_site_id "$site_id"
    deploy_on_vps "$site_id"
}

main "$@"
