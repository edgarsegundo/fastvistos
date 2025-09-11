import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add npm scripts to package.json for the new site
async function addNpmScripts(siteId) {
  const packageJsonPath = join(__dirname, 'package.json');
  
  try {
    console.log(`🔍 Testing npm script addition for site: ${siteId}`);
    console.log(`📁 Package.json path: ${packageJsonPath}`);
    
    // Read current package.json
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    console.log(`📋 Current scripts count: ${Object.keys(packageJson.scripts).length}`);
    
    // Define the scripts to add
    const scriptsToAdd = {
      [`dev:${siteId}`]: `node sync-blog.js ${siteId} && SITE_ID=${siteId} astro dev --config multi-sites.config.mjs`,
      [`dev:watch:${siteId}`]: `node dev-with-sync.js ${siteId}`,
      [`build:${siteId}`]: `node sync-blog.js ${siteId} && SITE_ID=${siteId} astro build --config multi-sites.config.mjs`,
      [`preview:${siteId}`]: `SITE_ID=${siteId} astro preview --config multi-sites.config.mjs`
    };
    
    console.log(`🎯 Scripts to potentially add:`, Object.keys(scriptsToAdd));
    
    let addedScripts = [];
    
    // Add scripts only if they don't already exist
    for (const [scriptName, scriptCommand] of Object.entries(scriptsToAdd)) {
      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = scriptCommand;
        addedScripts.push(scriptName);
        console.log(`✅ Will add: ${scriptName}`);
      } else {
        console.log(`⚠️ Already exists: ${scriptName}`);
      }
    }
    
    if (addedScripts.length > 0) {
      // Write back to package.json with proper formatting
      console.log(`💾 Writing ${addedScripts.length} scripts to package.json...`);
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`📦 Added npm scripts: ${addedScripts.join(', ')}`);
    } else {
      console.log(`📦 All npm scripts for ${siteId} already exist`);
    }
    
  } catch (error) {
    console.error(`❌ Error adding npm scripts for ${siteId}:`, error.message);
    console.error(`🔍 Error stack:`, error.stack);
  }
}

// Test with mysite3
await addNpmScripts('mysite3');
