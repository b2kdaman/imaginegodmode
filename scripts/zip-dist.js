/**
 * Script to create a zip file of the dist folder for Chrome Web Store or Firefox Add-ons
 */

import { createWriteStream, existsSync, readFileSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { createGzip } from 'zlib';
import archiver from 'archiver';

const DIST_DIR = 'dist';
const OUTPUT_DIR = '.';
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const version = pkg.version;

// Get browser from command line arg (defaults to chrome)
const browser = process.argv[2] || 'chrome';
const OUTPUT_FILE = join(OUTPUT_DIR, `imaginegodmode-${browser}-v${version}.zip`);

async function zipDist() {
  // Check if dist folder exists
  if (!existsSync(DIST_DIR)) {
    console.error('Error: dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log(`Creating ${browser.toUpperCase()} zip file: ${OUTPUT_FILE}`);

  // Create a file to stream archive data to
  const output = createWriteStream(OUTPUT_FILE);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Listen for archive events
  output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✓ Zip created successfully: ${OUTPUT_FILE}`);
    console.log(`  Total size: ${sizeInMB} MB (${archive.pointer()} bytes)`);
  });

  archive.on('error', (err) => {
    console.error('Error creating zip:', err);
    process.exit(1);
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('Warning:', err);
    } else {
      throw err;
    }
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Add the entire dist directory to the archive
  archive.directory(DIST_DIR, false);

  // Finalize the archive
  await archive.finalize();
}

zipDist().catch((err) => {
  console.error('Failed to create zip:', err);
  process.exit(1);
});
