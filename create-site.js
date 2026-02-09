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

// Import crypto at module level
import crypto from 'crypto';

// Process template file by replacing placeholders
async function processTemplate(templatePath, replacements) {
    try {
        let content = await fs.readFile(templatePath, 'utf-8');

        // Replace all placeholders
        for (const [placeholder, value] of Object.entries(replacements)) {
            // Fix: Use [PLACEHOLDER] format instead of {{PLACEHOLDER}}
            const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
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

function validateEmail(email) {
    if (!email) return null; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }
    return null;
}

function validatePhone(value, fieldName) {
    if (!value) return null; // Phone fields are optional
    if (!/^\d+$/.test(value)) {
        return `${fieldName} must contain only digits`;
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
            [`dev:${siteId}`]: `node sync-blog.js ${siteId} && SITE_ID=${siteId} astro dev`,
            [`dev:watch:${siteId}`]: `node dev-with-sync.js ${siteId}`,
            [`build:${siteId}`]: `node sync-blog.js ${siteId} && SITE_ID=${siteId} astro build && node postbuild-updatable.js ${siteId}`,
            [`preview:${siteId}`]: `SITE_ID=${siteId} astro preview`,
            [`download-images:${siteId}`]: `node download-blog-images.js ${siteId}`,
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
            `   "dev:${siteId}": "node sync-blog.js ${siteId} && SITE_ID=${siteId} astro dev"`
        );
        console.log(`   "dev:watch:${siteId}": "node dev-with-sync.js ${siteId}"`);
        console.log(
            `   "build:${siteId}": "node sync-blog.js ${siteId} && SITE_ID=${siteId} astro build && node postbuild-updatable.js ${siteId}"`
        );
        console.log(
            `   "preview:${siteId}": "SITE_ID=${siteId} astro preview"`
        );
    }
}

// Main site creation function
async function createSite() {
    let replacements = {};
    console.log('🚀 Site Creation Wizard');
    console.log('========================\n');

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
        const publicSiteDir = join(__dirname, `public/${siteId}`);
        
        try {
            await fs.access(siteDir);
            console.error(`❌ Site '${siteId}' already exists in multi-sites/sites/`);
            console.log('🚫 Exiting without making changes.');
            rl.close();
            return;
        } catch {
            // Site doesn't exist, continue
        }
        
        try {
            await fs.access(publicSiteDir);
            console.error(`❌ Public site directory '${siteId}' already exists in public/`);
            console.log('🚫 Exiting without making changes.');
            rl.close();
            return;
        } catch {
            // Public site doesn't exist, continue
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

        // Derive site name from siteId (capitalize first letter)
        const siteName = siteId.charAt(0).toUpperCase() + siteId.slice(1).replace(/-/g, ' ');

        // Business information prompts (derive from siteId)
        console.log('\n📊 Business Information (for database):');
        console.log('   Leave fields empty to skip optional fields\n');

        // Use siteId as business name and derive display name
        const businessName = siteId;
        const displayName = siteName; // Capitalized version of siteId

        const email = await question('Enter business email (optional): ');
        const emailError = validateEmail(email);
        if (emailError) {
            console.error(`❌ ${emailError}`);
            rl.close();
            return;
        }

        console.log('\nPhone number (optional - leave all empty to skip):');
        const phoneCountryCode = await question('  Country code (e.g., 1, 55): ');
        const phoneCountryError = validatePhone(phoneCountryCode, 'Country code');
        if (phoneCountryError) {
            console.error(`❌ ${phoneCountryError}`);
            rl.close();
            return;
        }

        const phoneAreaCode = await question('  Area code (e.g., 11, 212): ');
        const phoneAreaError = validatePhone(phoneAreaCode, 'Area code');
        if (phoneAreaError) {
            console.error(`❌ ${phoneAreaError}`);
            rl.close();
            return;
        }

        const phoneNumber = await question('  Phone number: ');
        const phoneNumberError = validatePhone(phoneNumber, 'Phone number');
        if (phoneNumberError) {
            console.error(`❌ ${phoneNumberError}`);
            rl.close();
            return;
        }

        console.log('\n📋 Configuration Summary:');
        console.log(`   Site ID: ${siteId}`);
        console.log(`   Display Name: ${displayName}`);
        console.log(`   Domain: ${domain}`);
        console.log(`   Email: ${email || '(not provided)'}`);
        if (phoneCountryCode || phoneAreaCode || phoneNumber) {
            console.log(`   Phone: +${phoneCountryCode || ''} (${phoneAreaCode || ''}) ${phoneNumber || ''}`);
        }

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

        console.log('\n🔨 Creating business in database...');

        // Import BlogService and create business
        const { BlogService } = await import('./multi-sites/core/lib/blog-service.js');
        
        const businessData = {
            name: businessName,
            display_name: displayName,
            canonical_domain: domain,
        };
        
        if (email) businessData.email = email;
        if (phoneCountryCode) businessData.phone1_country_code = phoneCountryCode;
        if (phoneAreaCode) businessData.phone1_area_code = phoneAreaCode;
        if (phoneNumber) businessData.phone1_number = phoneNumber;

        let businessId;
        try {
            const business = await BlogService.createBusiness(businessData);
            businessId = business.id;
            console.log(`✅ Business created with ID: ${businessId}`);
        } catch (error) {
            console.error('❌ Failed to create business in database:', error.message);
            console.log('💡 Please check database connection and try again.');
            rl.close();
            return;
        }

        console.log('\n🔨 Creating site structure...');

        // Prepare template replacements
        replacements = {
            SITE_ID: siteId,
            SITE_NAME: siteName,
            BUSINESS_ID: businessId,
            // Public template placeholders
            COMPANY_NAME: siteName,
            COMPANY_SHORT_NAME: siteName.length > 12 ? siteName.substring(0, 12) : siteName,
            COMPANY_DESCRIPTION: `${siteName} - Professional services and solutions`,
            COMPANY_CATEGORY_1: 'business',
            YOUR_DOMAIN: domain,
        };

        // Copy template files to new site
        const templateDir = join(__dirname, 'templates/site-template');
        await copyTemplateFiles(templateDir, siteDir, replacements);
        console.log(`📁 Created site structure from templates`);

        // Copy public template files to public folder
        const publicTemplateDir = join(__dirname, 'templates/public-template');
        
        // Ensure public directory exists
        await ensureDir(join(__dirname, 'public'));
        
        await copyTemplateFiles(publicTemplateDir, publicSiteDir, replacements);
        console.log(`📁 Created public assets structure in public/${siteId}`);

        // Create root-level Tailwind config from template
        // const tailwindTemplate = join(__dirname, 'templates/tailwind.template.config.js');
        // const tailwindContent = await processTemplate(tailwindTemplate, replacements);
        // await fs.writeFile(join(__dirname, `tailwind.${siteId}.config.js`), tailwindContent);
        // console.log(`📝 Created: tailwind.${siteId}.config.js`);

        // Add npm scripts for the new site
        await addNpmScripts(siteId);

        console.log('\n✅ Site created successfully!');
        console.log('\n📋 Next steps:');
        console.log(`   1. Customize styling in tailwind.${siteId}.config.js`);
        console.log(`   2. Add your content to ${siteId}/pages/`);
        console.log(`   3. Add your assets to public/${siteId}/`);
        console.log(`   4. Run sync to update templates: npm run sync`);
        console.log(`\n💡 Business ID: ${businessId}`);
        console.log('    (Automatically created and linked to your site)');
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
