#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const SERVER_CONFIG = {
    user: 'edgar',
    host: '72.60.57.150',
};

// Function to get all available sites from dist folder
function getAvailableSites() {
    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) {
        console.error('❌ Error: ./dist folder not found. Please build at least one site first.');
        console.log('Example: npm run build:fastvistos');
        process.exit(1);
    }

    const sites = fs
        .readdirSync(distPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .filter((name) => !name.startsWith('.')); // Filter out hidden directories

    if (sites.length === 0) {
        console.error('❌ Error: No site folders found in ./dist/');
        console.log('Please build at least one site first.');
        console.log('Example: npm run build:fastvistos');
        process.exit(1);
    }

    return sites;
}

// Function to generate site config dynamically
function generateSiteConfig(siteId) {
    return {
        domain: `${siteId}.com`,
        path: `/var/www/${siteId}`,
    };
}

// Function to show available sites and prompt user to choose
async function promptSiteSelection() {
    const sites = getAvailableSites();

    console.log('\n🚀 Available sites for deployment:');
    console.log('');

    sites.forEach((site, index) => {
        const config = generateSiteConfig(site);
        console.log(`${index + 1}) ${site} → ${config.domain} (${config.path})`);
    });

    console.log('');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(`Please choose a site (1-${sites.length}) or enter site name: `, (answer) => {
            rl.close();

            // Check if it's a number selection
            const choice = parseInt(answer);
            if (!isNaN(choice) && choice >= 1 && choice <= sites.length) {
                resolve(sites[choice - 1]);
                return;
            }

            // Check if it's a direct site name
            if (sites.includes(answer)) {
                resolve(answer);
                return;
            }

            console.error(`❌ Error: Invalid selection "${answer}"`);
            console.log(`Valid options: 1-${sites.length} or site names: ${sites.join(', ')}`);
            process.exit(1);
        });
    });
}

function showUsage() {
    const sites = getAvailableSites();

    console.log('\nUsage: node deploy-site.js [siteid]');
    console.log('\nAvailable sites (auto-detected from ./dist/):');
    sites.forEach((siteId) => {
        const config = generateSiteConfig(siteId);
        console.log(`  ${siteId} → ${config.domain} (${config.path})`);
    });
    console.log('\nExamples:');
    console.log('  node deploy-site.js fastvistos');
    console.log('  node deploy-site.js p2digital');
    console.log('  node deploy-site.js  (interactive mode)');
    console.log('');
}

function validateSiteId(siteId) {
    const sites = getAvailableSites();

    if (!sites.includes(siteId)) {
        console.error(`❌ Error: Site '${siteId}' not found in ./dist/`);
        console.log(`Available sites: ${sites.join(', ')}`);
        showUsage();
        process.exit(1);
    }
}

function checkDistFolder(siteId) {
    const siteDistPath = path.join(process.cwd(), 'dist', siteId);

    if (!fs.existsSync(siteDistPath)) {
        console.error(`❌ Error: ./dist/${siteId} folder not found. Please build the site first.`);
        console.log(`Run: npm run build:${siteId}`);
        process.exit(1);
    }
}

function deployToServer(siteId) {
    const siteConfig = generateSiteConfig(siteId);
    const { user, host } = SERVER_CONFIG;
    const remotePath = siteConfig.path;
    const localPath = `./dist/${siteId}/`;

    console.log(`🚀 Deploying ${siteId} to ${siteConfig.domain}...`);
    console.log(`📁 Local path: ${localPath}`);
    console.log(`📁 Remote path: ${remotePath}`);
    console.log('');

    try {
        // Step 1: Ensure remote directory exists with proper permissions (recursive chown)
        console.log('📁 Setting up remote directory...');
        const setupCommand = `ssh ${user}@${host} "sudo mkdir -p ${remotePath} && sudo chown -R ${user}:${user} ${remotePath}"`;
        console.log(`Running: ${setupCommand}`);
        execSync(setupCommand, { stdio: 'inherit' });
        console.log('✅ Remote directory setup completed');

        // Step 2: Rsync files
        console.log('\n📤 Syncing files...');
        const rsyncCommand = `rsync -avz --delete ${localPath} ${user}@${host}:${remotePath}`;
        console.log(`Running: ${rsyncCommand}`);
        execSync(rsyncCommand, { stdio: 'inherit' });
        console.log('✅ Files synced successfully');

        // Step 3: Fix ownership for web server
        console.log('\n🔧 Fixing file ownership for web server...');
        const chownCommand = `ssh ${user}@${host} "sudo chown -R www-data:www-data ${remotePath}"`;
        console.log(`Running: ${chownCommand}`);
        execSync(chownCommand, { stdio: 'inherit' });
        console.log('✅ File ownership updated');

        console.log(`\n🎉 Deployment completed successfully!`);
        console.log(`🌐 Site should be available at: https://${siteConfig.domain}`);
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

async function main() {
    let siteId = process.argv[2];

    // If no site ID provided, prompt user to choose
    if (!siteId) {
        try {
            siteId = await promptSiteSelection();
        } catch (error) {
            console.error('❌ Error during site selection:', error.message);
            process.exit(1);
        }
    } else {
        // Validate the provided site ID
        validateSiteId(siteId);
    }

    checkDistFolder(siteId);
    deployToServer(siteId);
}

// Run the script
main();
