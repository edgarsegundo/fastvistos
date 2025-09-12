#!/usr/bin/env node

// Watch core blog files and auto-sync when they change
import chokidar from 'chokidar';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Current working directory:', process.cwd());
console.log('📂 Finding files to watch...');

// Test with glob to see what files match
import { glob } from 'glob';
let filesToWatch = [];
try {
    filesToWatch = await glob('multi-sites/core/**/*.astro');
    console.log('📋 Files found by glob:');
    filesToWatch.forEach((file) => console.log(`   - ${file}`));
} catch (error) {
    console.error('❌ Glob error:', error);
    process.exit(1);
}

// Files to watch for changes
const watchPaths = filesToWatch.length > 0 ? filesToWatch : ['multi-sites/core/**/*.astro'];

let isRunning = false;

function runSync() {
    if (isRunning) {
        console.log('⏳ Sync already running, skipping...');
        return;
    }

    isRunning = true;
    console.log('🔄 Core blog files changed, syncing...');

    const syncProcess = spawn('node', ['sync-blog.js'], {
        stdio: 'inherit',
        cwd: process.cwd(),
    });

    syncProcess.on('close', (code) => {
        isRunning = false;
        if (code === 0) {
            console.log('✅ Blog sync completed successfully');
        } else {
            console.log(`❌ Blog sync failed with code ${code}`);
        }
    });

    syncProcess.on('error', (error) => {
        isRunning = false;
        console.error('❌ Error running sync:', error);
    });
}

// Initialize watcher
const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true, // Don't trigger on startup
    followSymlinks: false,
    cwd: process.cwd(),
    disableGlobbing: false,
    usePolling: true, // Enable polling as fallback
    interval: 1000,
    binaryInterval: 1000,
    alwaysStat: false,
    depth: 99,
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100,
    },
});

// Handle file changes
watcher
    .on('change', (path) => {
        console.log(`📝 Changed: ${path}`);
        runSync();
    })
    .on('add', (path) => {
        console.log(`➕ Added: ${path}`);
        runSync();
    })
    .on('unlink', (path) => {
        console.log(`🗑️ Removed: ${path}`);
        runSync();
    })
    .on('ready', () => {
        console.log('\n✅ Watcher ready!');
        console.log('✨ Edit any file in the core blog templates to trigger sync!');
    })
    .on('error', (error) => {
        console.error('❌ Watcher error:', error);
    });

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Stopping file watcher...');
    watcher.close().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
    watcher.close().then(() => process.exit(0));
});
