#!/bin/bash

# Site deployment script
# Usage: ./deploy-site.sh <siteid>

# Server configuration
SERVER_USER="edgar"
SERVER_HOST="72.60.57.150"

# Site configurations
declare -A SITE_PATHS
SITE_PATHS["fastvistos"]="/var/www/fastvistos"
SITE_PATHS["p2digital"]="/var/www/p2digital"

# Add more sites as needed:
# SITE_PATHS["newsite"]="/var/www/newsite"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_usage() {
    echo ""
    echo "Usage: $0 <siteid>"
    echo ""
    echo "Available site IDs:"
    for site in "${!SITE_PATHS[@]}"; do
        echo "  $site -> ${SITE_PATHS[$site]}"
    done
    echo ""
    echo "Example: $0 fastvistos"
    echo ""
}

validate_site_id() {
    local site_id=$1
    if [[ -z "${SITE_PATHS[$site_id]}" ]]; then
        echo -e "${RED}❌ Error: Site ID '$site_id' not found.${NC}"
        show_usage
        exit 1
    fi
}

check_dist_folder() {
    if [[ ! -d "./dist" ]]; then
        echo -e "${RED}❌ Error: ./dist folder not found. Please build the site first.${NC}"
        echo -e "${YELLOW}Run: npm run build:$1${NC}"
        exit 1
    fi
}

deploy_to_server() {
    local site_id=$1
    local remote_path="${SITE_PATHS[$site_id]}"
    
    echo -e "${BLUE}🚀 Deploying $site_id...${NC}"
    echo -e "${BLUE}📁 Remote path: $remote_path${NC}"
    echo ""

    # Step 1: Setup remote directory
    echo -e "${YELLOW}📁 Setting up remote directory...${NC}"
    local setup_command="ssh ${SERVER_USER}@${SERVER_HOST} \"sudo mkdir -p ${remote_path} && sudo chown ${SERVER_USER}:${SERVER_USER} ${remote_path}\""
    echo "Running: $setup_command"
    
    if eval $setup_command; then
        echo -e "${GREEN}✅ Remote directory setup completed${NC}"
    else
        echo -e "${RED}❌ Remote directory setup failed${NC}"
        exit 1
    fi

    # Step 2: Rsync files
    echo ""
    echo -e "${YELLOW}📤 Syncing files...${NC}"
    local rsync_command="rsync -avz --delete ./dist/ ${SERVER_USER}@${SERVER_HOST}:${remote_path}"
    echo "Running: $rsync_command"
    
    if $rsync_command; then
        echo -e "${GREEN}✅ Files synced successfully${NC}"
    else
        echo -e "${RED}❌ Rsync failed${NC}"
        exit 1
    fi

    # Step 3: Fix ownership for web server
    echo ""
    echo -e "${YELLOW}🔧 Fixing file ownership for web server...${NC}"
    local chown_command="ssh ${SERVER_USER}@${SERVER_HOST} \"sudo chown -R www-data:www-data ${remote_path}\""
    echo "Running: $chown_command"
    
    if eval $chown_command; then
        echo -e "${GREEN}✅ File ownership updated${NC}"
    else
        echo -e "${RED}❌ File ownership update failed${NC}"
        exit 1
    fi

    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}🌐 Site should be available at the configured domain${NC}"
}

main() {
    local site_id=$1

    if [[ -z "$site_id" ]]; then
        echo -e "${RED}❌ Error: Site ID is required.${NC}"
        show_usage
        exit 1
    fi

    validate_site_id "$site_id"
    check_dist_folder "$site_id"
    deploy_to_server "$site_id"
}

# Run the script
main "$@"
