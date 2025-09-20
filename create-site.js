#!/usr/bin/env node

/**
 * Site Creation Script
 * Creates a new site with all necessary folders and configuration files using template files
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Promisify readline question
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

// Generate a random business ID (32 character hex string)
function generateBusinessId() {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Process template file by replacing placeholders
async function processTemplate(templatePath, replacements) {
    try {
        let content = await fs.readFile(templatePath, 'utf-8');

        // Replace all placeholders
        for (const [placeholder, value] of Object.entries(replacements)) {
            const regex = new RegExp(`{{${placeholder}}}`, 'g');
            content = content.replace(regex, value);
        }

        return content;
    } catch (error) {
        console.error(`Error processing template ${templatePath}:`, error.message);
        throw error;
    }
}

// Copy template files recursively
async function copyTemplateFiles(templateDir, targetDir, replacements) {
    try {
        const items = await fs.readdir(templateDir, { withFileTypes: true });

        for (const item of items) {
            const templatePath = join(templateDir, item.name);
            const targetPath = join(targetDir, item.name);

            if (item.isDirectory()) {
                // Create directory and recursively copy contents
                await fs.mkdir(targetPath, { recursive: true });
                await copyTemplateFiles(templatePath, targetPath, replacements);
            } else {
                // Process template file and copy
                const processedContent = await processTemplate(templatePath, replacements);
                await fs.writeFile(targetPath, processedContent, 'utf-8');
            }
        }
    } catch (error) {
        console.error(`Error copying template files:`, error.message);
        throw error;
    }
}

// Validate user inputs
function validateSiteId(siteId) {
    if (!siteId || siteId.length < 2) {
        return 'Site ID must be at least 2 characters long';
    }
    if (!/^[a-z0-9-]+$/.test(siteId)) {
        return 'Site ID can only contain lowercase letters, numbers, and hyphens';
    }
    return null;
}

function validateDomain(domain) {
    if (!domain || domain.length < 3) {
        return 'Domain must be at least 3 characters long';
    }
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
        return 'Domain must be a valid domain name (e.g., example.com)';
    }
    return null;
}

function validateSiteName(siteName) {
    if (!siteName || siteName.length < 2) {
        return 'Site name must be at least 2 characters long';
    }
    if (siteName.length > 50) {
        return 'Site name must be less than 50 characters';
    }
    return null;
}

// Ensure directory exists
async function ensureDir(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// Add npm scripts to package.json for the new site
async function addNpmScripts(siteId) {
    const packageJsonPath = join(__dirname, 'package.json');

    try {
        // Read current package.json
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');

        // Validate and parse JSON
        let packageJson;
        try {
            packageJson = JSON.parse(packageJsonContent);
        } catch (parseError) {
            throw new Error(`Invalid JSON in package.json: ${parseError.message}`);
        }

        // Ensure scripts object exists
        if (!packageJson.scripts || typeof packageJson.scripts !== 'object') {
            packageJson.scripts = {};
        }

        // Define the scripts to add
        const scriptsToAdd = {
            [`dev:${siteId}`]: `node sync-blog.js ${siteId} && SITE_ID=${siteId} astro dev --config multi-sites.config.mjs`,
            [`dev:watch:${siteId}`]: `node dev-with-sync.js ${siteId}`,
            [`build:${siteId}`]: `node sync-blog.js ${siteId} && SITE_ID=${siteId} astro build --config multi-sites.config.mjs && node postbuild-updatable.js ${siteId}`,
            [`preview:${siteId}`]: `SITE_ID=${siteId} astro preview --config multi-sites.config.mjs`,
        };

        let addedScripts = [];

        // Add scripts only if they don't already exist
        for (const [scriptName, scriptCommand] of Object.entries(scriptsToAdd)) {
            if (!packageJson.scripts[scriptName]) {
                packageJson.scripts[scriptName] = scriptCommand;
                addedScripts.push(scriptName);
            }
        }

        if (addedScripts.length > 0) {
            // Create clean JSON string with proper formatting (no trailing commas)
            const cleanJsonString = JSON.stringify(packageJson, null, 2);

            // Validate the generated JSON before writing
            try {
                JSON.parse(cleanJsonString);
            } catch (validateError) {
                throw new Error(`Generated invalid JSON: ${validateError.message}`);
            }

            // Write back to package.json with proper formatting and newline
            await fs.writeFile(packageJsonPath, cleanJsonString + '\n');
            console.log(`📦 Added npm scripts: ${addedScripts.join(', ')}`);
        } else {
            console.log(`📦 All npm scripts for ${siteId} already exist`);
        }
    } catch (error) {
        console.error(`❌ Error adding npm scripts for ${siteId}:`, error.message);
        console.log('💡 You can manually add these scripts to package.json:');
        console.log(
            `   "dev:${siteId}": "node sync-blog.js ${siteId} && SITE_ID=${siteId} astro dev --config multi-sites.config.mjs"`
        );
        console.log(`   "dev:watch:${siteId}": "node dev-with-sync.js ${siteId}"`);
        console.log(
            `   "build:${siteId}": "node sync-blog.js ${siteId} && SITE_ID=${siteId} astro build --config multi-sites.config.mjs"`
        );
        console.log(
            `   "preview:${siteId}": "SITE_ID=${siteId} astro preview --config multi-sites.config.mjs"`
        );
    }
}

// Main site creation function
async function createSite() {
    let replacements = {};
    console.log('🚀 Site Creation Wizard');
    console.log('======================\n');

    try {
        // Get site ID
        const siteId = await question('Enter site ID (lowercase, no spaces, e.g., "mysite"): ');

        const siteIdError = validateSiteId(siteId);
        if (siteIdError) {
            console.error(`❌ ${siteIdError}`);
            console.log('💡 Examples: mysite, my-company, site123');
            rl.close();
            return;
        }

        // Check if site already exists
        const siteDir = join(__dirname, `multi-sites/sites/${siteId}`);
        try {
            await fs.access(siteDir);
            console.error(`❌ Site '${siteId}' already exists in multi-sites/sites/`);
            console.log('🚫 Exiting without making changes.');
            rl.close();
            return;
        } catch {
            // Site doesn't exist, continue
        }

        // Get domain
        const suggestedDomain = `${siteId}.com`;
        console.log(`\nSuggested domain: ${suggestedDomain}`);
        const domainInput = await question(
            `Enter domain (or press Enter for "${suggestedDomain}"): `
        );
        const domain = domainInput || suggestedDomain;

        const domainError = validateDomain(domain);
        if (domainError) {
            console.error(`❌ ${domainError}`);
            rl.close();
            return;
        }

        // Get site name
        const suggestedName = siteId.charAt(0).toUpperCase() + siteId.slice(1).replace(/-/g, ' ');
        console.log(`\nSuggested name: ${suggestedName}`);
        const siteNameInput = await question(
            `Enter site name (or press Enter for "${suggestedName}"): `
        );
        const siteName = siteNameInput || suggestedName;

        const siteNameError = validateSiteName(siteName);
        if (siteNameError) {
            console.error(`❌ ${siteNameError}`);
            rl.close();
            return;
        }

        console.log('\n📋 Site Configuration:');
        console.log(`   Site ID: ${siteId}`);
        console.log(`   Domain: ${domain}`);
        console.log(`   Name: ${siteName}`);


        // Robust confirmation prompt: only accept y/n, repeat if invalid
        let confirm = '';
        while (true) {
            confirm = await question('\nProceed with site creation? (y/N): ');
            if (/^y$/i.test(confirm)) {
                break;
            } else if (/^n$/i.test(confirm) || confirm.trim() === '') {
                console.log('🚫 Site creation cancelled.');
                rl.close();
                return;
            } else {
                console.log('⚠️  Please enter y or n.');
            }
        }

        console.log('\n🔨 Creating site structure...');

        // Generate business ID
        const businessId = generateBusinessId();

        // Prepare template replacements
        replacements = {
            SITE_ID: siteId,
            DOMAIN: domain,
            SITE_NAME: siteName,
            BUSINESS_ID: businessId,
        };

        // Copy template files to new site
        const templateDir = join(__dirname, 'templates/site-template');
        await copyTemplateFiles(templateDir, siteDir, replacements);
        console.log(`📁 Created site structure from templates`);

        // Create root-level Tailwind config from template
        const tailwindTemplate = join(__dirname, 'templates/tailwind.template.config.js');
        const tailwindContent = await processTemplate(tailwindTemplate, replacements);
        await fs.writeFile(join(__dirname, `tailwind.${siteId}.config.js`), tailwindContent);
        console.log(`📝 Created: tailwind.${siteId}.config.js`);

        // Add npm scripts for the new site
        await addNpmScripts(siteId);

        console.log('\n✅ Site created successfully!');
        console.log('\n📋 Next steps:');
        console.log(
            `   1. Update business_id in ${siteId}/site-config.ts with your actual business ID`
        );
        console.log(`   2. Customize styling in tailwind.${siteId}.config.js`);
        console.log(`   3. Add your content to ${siteId}/pages/`);
        console.log(`   4. Run sync to update templates: npm run sync`);
        console.log(`\n💡 Generated business ID: ${businessId}`);
        console.log('    (Replace this with your actual business ID from the database)');
    } catch (error) {
        console.error('❌ Error creating site:', error.message);
    } finally {
        rl.close();
        const child = spawn('npm', ['run', `dev:watch:${replacements.SITE_ID}`], {
            stdio: 'inherit',
        });
    }
}

// Start the site creation process
createSite();
