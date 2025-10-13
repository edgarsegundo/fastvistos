#!/bin/bash

# Site deployment script
# Usage: ./deploy-site.sh [siteid]

# Server configuration
SERVER_USER="edgar"
SERVER_HOST="72.60.57.150"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to get available sites from dist folder
get_available_sites() {
    local dist_path="./dist"
    
    if [[ ! -d "$dist_path" ]]; then
        echo -e "${RED}❌ Error: ./dist folder not found. Please build at least one site first.${NC}"
        echo -e "${YELLOW}Example: npm run build:fastvistos${NC}"
        exit 1
    fi
    
    local sites=()
    for dir in "$dist_path"/*; do
        if [[ -d "$dir" && ! "$(basename "$dir")" =~ ^\. ]]; then
            sites+=($(basename "$dir"))
        fi
    done
    
    if [[ ${#sites[@]} -eq 0 ]]; then
        echo -e "${RED}❌ Error: No site folders found in ./dist/${NC}"
        echo -e "${YELLOW}Please build at least one site first.${NC}"
        echo -e "${YELLOW}Example: npm run build:fastvistos${NC}"
        exit 1
    fi
    
    echo "${sites[@]}"
}

# Function to generate site path dynamically
generate_site_path() {
    local site_id=$1
    echo "/var/www/${site_id}"
}

# Function to prompt user to select a site
prompt_site_selection() {
    local sites=($(get_available_sites))
    
    echo ""
    echo -e "${BLUE}🚀 Available sites for deployment:${NC}"
    echo ""
    
    for i in "${!sites[@]}"; do
        local site="${sites[$i]}"
        local path=$(generate_site_path "$site")
        echo -e "${BLUE}$((i+1))) ${site} → ${site}.com (${path})${NC}"
    done
    
    echo ""
    read -p "Please choose a site (1-${#sites[@]}) or enter site name: " answer
    
    # Check if it's a number selection
    if [[ "$answer" =~ ^[0-9]+$ ]] && [[ "$answer" -ge 1 ]] && [[ "$answer" -le "${#sites[@]}" ]]; then
        echo "${sites[$((answer-1))]}"
        return
    fi
    
    # Check if it's a direct site name
    for site in "${sites[@]}"; do
        if [[ "$site" == "$answer" ]]; then
            echo "$site"
            return
        fi
    done
    
    echo -e "${RED}❌ Error: Invalid selection \"$answer\"${NC}"
    echo -e "${YELLOW}Valid options: 1-${#sites[@]} or site names: ${sites[*]}${NC}"
    exit 1
}

show_usage() {
    local sites=($(get_available_sites))
    
    echo ""
    echo "Usage: $0 [siteid]"
    echo ""
    echo "Available sites (auto-detected from ./dist/):"
    for site in "${sites[@]}"; do
        local path=$(generate_site_path "$site")
        echo "  $site → ${site}.com ($path)"
    done
    echo ""
    echo "Examples:"
    echo "  $0 fastvistos"
    echo "  $0 p2digital"
    echo "  $0  (interactive mode)"
    echo ""
}

validate_site_id() {
    local site_id=$1
    local sites=($(get_available_sites))
    
    for site in "${sites[@]}"; do
        if [[ "$site" == "$site_id" ]]; then
            return 0
        fi
    done
    
    echo -e "${RED}❌ Error: Site '$site_id' not found in ./dist/${NC}"
    echo -e "${YELLOW}Available sites: ${sites[*]}${NC}"
    show_usage
    exit 1
}

check_dist_folder() {
    local site_id=$1
    local site_dist_path="./dist/${site_id}"
    
    if [[ ! -d "$site_dist_path" ]]; then
        echo -e "${RED}❌ Error: $site_dist_path folder not found. Please build the site first.${NC}"
        echo -e "${YELLOW}Run: npm run build:$site_id${NC}"
        exit 1
    fi
}

deploy_to_server() {
    local site_id=$1
    local remote_path=$(generate_site_path "$site_id")
    local site_dist_path="./dist/${site_id}/"
    
    echo -e "${BLUE}🚀 Deploying $site_id...${NC}"
    echo -e "${BLUE}📁 Local path: $site_dist_path${NC}"
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
    local rsync_command="rsync -avz --delete ${site_dist_path} ${SERVER_USER}@${SERVER_HOST}:${remote_path}"
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
    echo -e "${BLUE}🌐 Site should be available at: https://${site_id}.com${NC}"
}

main() {
    local site_id=$1

    # If no site ID provided, prompt user to choose
    if [[ -z "$site_id" ]]; then
        site_id=$(prompt_site_selection)
    else
        # Validate the provided site ID
        validate_site_id "$site_id"
    fi

    check_dist_folder "$site_id"
    deploy_to_server "$site_id"

    # Sync images for the site before/after deploy
    ./sync-site-images.sh "$site_id"
}

# Run the script
main "$@"
