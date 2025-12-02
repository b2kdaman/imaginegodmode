#!/usr/bin/env node
/**
 * Smart build script that handles manifest switching
 * Usage: node scripts/build.js [chrome|firefox]
 */

import { copyFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const browser = process.argv[2] || 'chrome';

if (!['chrome', 'firefox'].includes(browser)) {
  console.error('Usage: node scripts/build.js [chrome|firefox]');
  process.exit(1);
}

console.log(`\n🔨 Building for ${browser.toUpperCase()}...\n`);

// Backup current manifest
if (existsSync('manifest.json')) {
  copyFileSync('manifest.json', 'manifest.backup.json');
}

// Copy the appropriate manifest
if (browser === 'firefox') {
  if (!existsSync('manifest.firefox.json')) {
    console.error('❌ manifest.firefox.json not found!');
    process.exit(1);
  }
  copyFileSync('manifest.firefox.json', 'manifest.json');
  console.log('✓ Using Firefox manifest');
} else {
  // For Chrome, restore from backup or use existing
  if (existsSync('manifest.backup.json')) {
    copyFileSync('manifest.backup.json', 'manifest.json');
  }
  console.log('✓ Using Chrome manifest');
}

try {
  // Run the build
  console.log('\n📦 Running build...\n');
  execSync('npm run lint && vite build', { stdio: 'inherit' });
  console.log(`\n✅ ${browser.toUpperCase()} build complete!\n`);
} catch (error) {
  console.error(`\n❌ Build failed for ${browser}\n`);
  process.exit(1);
}
