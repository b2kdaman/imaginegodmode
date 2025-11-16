/**
 * Generate PNG icons from SVG using sharp
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

console.log('🎨 Generating extension icons...\n');

async function generateIcons() {
  for (const size of sizes) {
    const svgContent = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.15)}" fill="#1a1a1a"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#2a2a2a" stroke="#FFD700" stroke-width="${Math.max(1, size/32)}"/>
  <text x="${size/2}" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${size * 0.5}" fill="#FFD700" text-anchor="middle" font-weight="bold">G</text>
</svg>`.trim();

    const pngFilename = `icon${size}.png`;
    const pngPath = path.join(iconsDir, pngFilename);

    // Convert SVG to PNG using sharp
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
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
