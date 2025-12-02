#!/usr/bin/env node
/**
 * Smart build script that handles manifest generation for different browsers
 * Usage: node scripts/build.js [chrome|firefox]
 */

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const browser = process.argv[2] || 'chrome';

if (!['chrome', 'firefox'].includes(browser)) {
  console.error('Usage: node scripts/build.js [chrome|firefox]');
  process.exit(1);
}

console.log(`\n🔨 Building for ${browser.toUpperCase()}...\n`);

// Read the current manifest to determine if it's Chrome or Firefox format
let baseManifest;
try {
  baseManifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));
} catch (error) {
  console.error('❌ Failed to read manifest.json:', error.message);
  process.exit(1);
}

// Check if current manifest is Firefox format (has scripts instead of service_worker)
const isCurrentlyFirefox = baseManifest.background?.scripts !== undefined;

// Generate appropriate manifest
if (browser === 'firefox') {
  // If already Firefox format, use as-is
  if (isCurrentlyFirefox) {
    console.log('✓ Already using Firefox manifest format');
  } else {
    // Convert Chrome format to Firefox format
    try {
      const serviceWorkerPath = baseManifest.background?.service_worker;
      
      if (!serviceWorkerPath) {
        console.error('❌ No service_worker found in manifest.json background section');
        process.exit(1);
      }
      
      // Create Firefox-specific manifest
      const firefoxManifest = {
        ...baseManifest,
        background: {
          scripts: [serviceWorkerPath],
          type: baseManifest.background.type
        },
        browser_specific_settings: {
          gecko: {
            id: "imaginegodmode@b2kdaman.com",
            strict_min_version: "109.0"
          }
        }
      };
      
      // Backup original Chrome manifest
      copyFileSync('manifest.json', 'manifest.chrome.json');
      
      // Write Firefox manifest
      writeFileSync('manifest.json', JSON.stringify(firefoxManifest, null, 2));
      console.log('✓ Generated Firefox manifest');
    } catch (error) {
      console.error('❌ Failed to generate Firefox manifest:', error.message);
      process.exit(1);
    }
  }
} else {
  // Building for Chrome
  if (isCurrentlyFirefox) {
    // Convert Firefox format back to Chrome format or restore from backup
    if (existsSync('manifest.chrome.json')) {
      copyFileSync('manifest.chrome.json', 'manifest.json');
      console.log('✓ Restored Chrome manifest from backup');
    } else {
      // Convert Firefox format to Chrome format
      try {
        const scriptsArray = baseManifest.background?.scripts;
        
        if (!scriptsArray || scriptsArray.length === 0) {
          console.error('❌ No scripts found in manifest.json background section');
          process.exit(1);
        }
        
        // Remove Firefox-specific settings
        const { browser_specific_settings, ...chromeManifest } = baseManifest;
        
        // Convert back to Chrome format
        chromeManifest.background = {
          service_worker: scriptsArray[0],
          type: baseManifest.background.type
        };
        
        writeFileSync('manifest.json', JSON.stringify(chromeManifest, null, 2));
        console.log('✓ Converted to Chrome manifest format');
      } catch (error) {
        console.error('❌ Failed to convert to Chrome manifest:', error.message);
        process.exit(1);
      }
    }
  } else {
    console.log('✓ Already using Chrome manifest format');
  }
}

try {
  // Run the build
  console.log('\n📦 Running build...\n');
  execSync('npm run lint && vite build', { stdio: 'inherit' });
  console.log(`\n✅ ${browser.toUpperCase()} build complete!\n`);
} catch (error) {
  console.error(`❌ Build failed for ${browser}`);
  console.error(error.message);
  process.exit(1);
}
