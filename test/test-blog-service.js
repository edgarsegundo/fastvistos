#!/usr/bin/env node

/**
 * Test runner for blog-service tests
 * Usage: node test-blog-service.js [--unit|--integration]
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const testType = args.includes('--unit')
    ? 'unit'
    : args.includes('--integration')
      ? 'integration'
      : args.includes('--real')
        ? 'real'
        : 'real'; // Default to real database tests

if (testType === 'unit') {
    console.log('🧪 Running BlogService unit tests...\n');

    const testFile = join(__dirname, 'multi-sites/core/lib/blog-service.test.js');

    const testProcess = spawn('tsx', ['--test', testFile], {
        stdio: 'inherit',
        cwd: process.cwd(),
    });

    testProcess.on('close', (code) => {
        if (code === 0) {
            console.log('\n✅ All unit tests passed!');
        } else {
            console.log(`\n❌ Unit tests failed with exit code ${code}`);
        }
        process.exit(code);
    });

    testProcess.on('error', (error) => {
        console.error('❌ Error running unit tests:', error);
        process.exit(1);
    });
} else if (testType === 'real') {
    console.log('🗄️ Running BlogService real database tests...\n');

    const testFile = join(__dirname, 'multi-sites/core/lib/blog-service-real.test.js');

    const testProcess = spawn('tsx', ['--test', testFile], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env }, // Pass all environment variables including DATABASE_URL
    });

    testProcess.on('close', (code) => {
        if (code === 0) {
            console.log('\n✅ All real database tests passed!');
        } else {
            console.log(`\n❌ Real database tests failed with exit code ${code}`);
        }
        process.exit(code);
    });

    testProcess.on('error', (error) => {
        console.error('❌ Error running real database tests:', error);
        process.exit(1);
    });
} else if (testType === 'integration') {
    console.log('🔗 Running BlogService integration tests...\n');

    // Import and run integration tests with real database
    try {
        const { runIntegrationTests } = await import(
            '../multi-sites/core/lib/blog-service-integration.test.js'
        );
        await runIntegrationTests();
    } catch (error) {
        if (error.message.includes('Cannot find module')) {
            console.error(
                '❌ Could not import BlogService or integration test. Make sure the database is configured.'
            );
        } else {
            console.error('❌ Integration test failed:', error.message);
        }
        process.exit(1);
    }
}
