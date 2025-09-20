#!/usr/bin/env node
// postbuild-updatable.js
// Usage: node postbuild-updatable.js [siteid]

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const siteId = process.argv[2];
if (!siteId) {
  console.error('Usage: node postbuild-updatable.js [siteid]');
  process.exit(1);
}

const distDir = join(__dirname, `dist/${siteId}`);
const distIndex = join(distDir, 'index.html');
const distUpdatable = join(distDir, 'index_updatable.html');
const distEditor = join(distDir, 'updatable-editor.js');
const coreEditorPath = join(__dirname, 'multi-sites/core/lib/updatable-editor.js');

async function main() {
  try {
    // Copy updatable-editor.js to dist/[siteid]/
    await fs.copyFile(coreEditorPath, distEditor);
    // Read and inject script into index_updatable.html
    let html = await fs.readFile(distIndex, 'utf-8');
    const injectScript = '<script src="/updatable-editor.js"></script>';
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${injectScript}\n</body>`);
    } else {
      html += `\n${injectScript}`;
    }
    await fs.writeFile(distUpdatable, html);
    console.log(`📝 Created dist/${siteId}/index_updatable.html with updatable-editor.js injected.`);
  } catch (err) {
    console.error(`❌ Error in postbuild-updatable for ${siteId}:`, err);
    process.exit(1);
  }
}

main();
