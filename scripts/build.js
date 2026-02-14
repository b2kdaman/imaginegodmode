#!/usr/bin/env node
/**
 * Build script that keeps source manifest default (Chrome) and
 * generates Firefox-specific manifest in dist only.
 * Usage: node scripts/build.js [chrome|firefox]
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const browser = process.argv[2] || 'chrome';

if (!['chrome', 'firefox'].includes(browser)) {
  console.error('Usage: node scripts/build.js [chrome|firefox]');
  process.exit(1);
}

console.log(`\n🔨 Building for ${browser.toUpperCase()}...\n`);

if (browser === 'chrome') {
  console.log('✓ Using default manifest.json (Chrome source of truth)');
}

try {
  // Run the build
  console.log('\n📦 Running build...\n');
  execSync('npm run lint && vite build', { stdio: 'inherit' });

  if (browser === 'firefox') {
    // Transform built manifest only; do not mutate source manifest.json
    const distManifestPath = 'dist/manifest.json';
    const distManifest = JSON.parse(readFileSync(distManifestPath, 'utf-8'));
    const serviceWorkerPath = distManifest.background?.service_worker;

    if (!serviceWorkerPath) {
      console.error('❌ dist/manifest.json is missing background.service_worker');
      process.exit(1);
    }

    const firefoxManifest = {
      ...distManifest,
      background: {
        scripts: [serviceWorkerPath],
        type: distManifest.background.type,
      },
      browser_specific_settings: {
        gecko: {
          id: 'imaginegodmode@b2kdaman.com',
          strict_min_version: '109.0',
        },
      },
    };

    writeFileSync(distManifestPath, JSON.stringify(firefoxManifest, null, 2));
    console.log('✓ Generated Firefox dist/manifest.json');
  }

  console.log(`\n✅ ${browser.toUpperCase()} build complete!\n`);
} catch (error) {
  console.error(`❌ Build failed for ${browser}`);
  console.error(error.message);
  process.exit(1);
}
