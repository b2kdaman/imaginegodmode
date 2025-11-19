/**
 * Generate PNG icons from godmode.jpeg using sharp
 * Run with: node scripts/generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '../public/icons');
const sourceImage = path.join(iconsDir, 'godmode.jpeg');

console.log('🎨 Generating extension icons from godmode.jpeg...\n');

async function generateIcons() {
  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    throw new Error(`Source image not found: ${sourceImage}`);
  }

  for (const size of sizes) {
    const pngFilename = `icon${size}.png`;
    const pngPath = path.join(iconsDir, pngFilename);

    // Resize godmode.jpeg to each icon size
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(pngPath);

    console.log(`✅ Created ${pngFilename} (${size}x${size})`);
  }

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
