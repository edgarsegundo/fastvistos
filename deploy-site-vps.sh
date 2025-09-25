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
    echo "         $0 p2digital"
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
    local site_dist_path="/var/www/${site_id}"
    echo -e "${BLUE}🚀 Deploying site on VPS: $site_id${NC}"
    echo -e "${BLUE}📁 Path: $site_dist_path${NC}"
    echo ""
    # Example: Touch a file to indicate deployment (replace with real logic)
    touch "$site_dist_path/.deployed-$(date +%Y%m%d%H%M%S)"
    echo -e "${GREEN}✅ Deployment marker created in $site_dist_path${NC}"
    # Add your real deployment steps here (e.g., restart services, clear cache, etc.)
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
