#!/usr/bin/env node

// Development script that runs file watcher + Astro dev server in parallel
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get site ID from command line args or environment
const siteId = process.argv[2] || process.env.SITE_ID || 'fastvistos';

console.log(`🚀 Starting development environment for: ${siteId}`);

// Start file watcher
console.log('👀 Starting file watcher...');
const watcherProcess = spawn('node', ['watch-and-sync.js'], {
  stdio: ['inherit', 'pipe', 'inherit'],
  env: { ...process.env, FORCE_COLOR: '1' }
});

// Color the watcher output
watcherProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(`\x1b[36m[WATCHER]\x1b[0m ${output}`);
});

// Start Astro dev server (after initial sync)
console.log(`🔄 Running initial sync for ${siteId}...`);
const initialSync = spawn('node', ['sync-blog.js', siteId], {
  stdio: 'inherit'
});

initialSync.on('close', (code) => {
  if (code === 0) {
    console.log(`🌟 Starting Astro dev server for ${siteId}...`);
    
    const astroProcess = spawn('npx', ['astro', 'dev', '--config', 'multi-sites.config.mjs'], {
      stdio: ['inherit', 'pipe', 'inherit'],
      env: { ...process.env, SITE_ID: siteId, FORCE_COLOR: '1' }
    });

    // Color the Astro output
    astroProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(`\x1b[32m[ASTRO]\x1b[0m ${output}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      watcherProcess.kill('SIGTERM');
      astroProcess.kill('SIGTERM');
      setTimeout(() => process.exit(0), 1000);
    });

    astroProcess.on('close', (code) => {
      console.log(`Astro dev server exited with code ${code}`);
      watcherProcess.kill('SIGTERM');
      process.exit(code);
    });

  } else {
    console.error('❌ Initial sync failed, aborting...');
    watcherProcess.kill('SIGTERM');
    process.exit(1);
  }
});

watcherProcess.on('close', (code) => {
  console.log(`File watcher exited with code ${code}`);
});
