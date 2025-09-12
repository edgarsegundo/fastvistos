#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Site configurations
const SITES_CONFIG = {
  fastvistos: {
    domain: 'fastvistos.com',
    path: '/var/www/fastvistos'
  },
  p2digital: {
    domain: 'p2digital.com', 
    path: '/var/www/p2digital'
  }
  // Add more sites as needed
};

// Server configuration
const SERVER_CONFIG = {
  user: 'edgar',
  host: '72.60.57.150'
};

function showUsage() {
  console.log('\nUsage: node deploy-site.js <siteid>');
  console.log('\nAvailable site IDs:');
  Object.keys(SITES_CONFIG).forEach(siteId => {
    const config = SITES_CONFIG[siteId];
    console.log(`  ${siteId} -> ${config.domain} (${config.path})`);
  });
  console.log('\nExample: node deploy-site.js fastvistos\n');
}

function validateSiteId(siteId) {
  if (!SITES_CONFIG[siteId]) {
    console.error(`❌ Error: Site ID '${siteId}' not found.`);
    showUsage();
    process.exit(1);
  }
}

function checkDistFolder() {
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('❌ Error: ./dist folder not found. Please build the site first.');
    console.log('Run: npm run build:' + process.argv[2]);
    process.exit(1);
  }
}

function deployToServer(siteId) {
  const siteConfig = SITES_CONFIG[siteId];
  const { user, host } = SERVER_CONFIG;
  const remotePath = siteConfig.path;
  
  console.log(`🚀 Deploying ${siteId} to ${siteConfig.domain}...`);
  console.log(`📁 Remote path: ${remotePath}`);
  console.log('');

  try {
    // Step 1: Ensure remote directory exists with proper permissions
    console.log('📁 Setting up remote directory...');
    const setupCommand = `ssh ${user}@${host} "sudo mkdir -p ${remotePath} && sudo chown ${user}:${user} ${remotePath}"`;
    console.log(`Running: ${setupCommand}`);
    execSync(setupCommand, { stdio: 'inherit' });
    console.log('✅ Remote directory setup completed');

    // Step 2: Rsync files
    console.log('\n📤 Syncing files...');
    const rsyncCommand = `rsync -avz --delete ./dist/ ${user}@${host}:${remotePath}`;
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

function main() {
  const siteId = process.argv[2];

  if (!siteId) {
    console.error('❌ Error: Site ID is required.');
    showUsage();
    process.exit(1);
  }

  validateSiteId(siteId);
  checkDistFolder();
  deployToServer(siteId);
}

// Run the script
main();
