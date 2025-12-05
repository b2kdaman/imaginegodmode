import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color code (e.g., "#5865f2")
 * @returns {Object} RGB object {r, g, b}
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Process background image: greyscale + color tint
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save processed image
 * @param {Object} tintColor - RGB color object {r, g, b}
 * @param {number} tintOpacity - Tint opacity (0-1)
 */
async function processBackground(inputPath, outputPath, tintColor, tintOpacity = 0.25) {
  try {
    console.log(`  Processing: ${outputPath}`);
    console.log(`  Tint: RGB(${tintColor.r}, ${tintColor.g}, ${tintColor.b}) @ ${tintOpacity * 100}% opacity`);

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Create a solid color overlay for tinting
    const tintOverlay = await sharp({
      create: {
        width: metadata.width,
        height: metadata.height,
        channels: 4,
        background: {
          r: tintColor.r,
          g: tintColor.g,
          b: tintColor.b,
          alpha: tintOpacity
        }
      }
    })
    .png()
    .toBuffer();

    // Process: greyscale -> apply tint overlay
    await sharp(inputPath)
      .greyscale()
      .composite([{
        input: tintOverlay,
        blend: 'over'
      }])
      .toFile(outputPath);

    console.log(`  ✓ Saved\n`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error:`, error.message);
    return false;
  }
}

// Load themes configuration
const themesPath = join(rootDir, 'public', 'themes.json');
const themes = JSON.parse(readFileSync(themesPath, 'utf-8'));

// Theme color mappings - using each theme's primary accent color
const themeColors = {
  dark: '#3b82f6',        // Blue
  light: '#6366f1',       // Indigo
  dracula: '#bd93f9',     // Purple (from TEXT_SECONDARY)
  winamp: '#5FE3B2',      // Cyan/Teal (from TEXT_SECONDARY)
  limewire: '#8FD14F',    // Lime Green (from TEXT_PRIMARY)
  steam: '#66c0f4',       // Steam Blue (from SUCCESS)
  discord: '#5865f2',     // Discord Blurple (from SUCCESS)
};

// Main execution
const inputImage = join(rootDir, 'assets', 'bg.jpg');
const outputDir = join(rootDir, 'public', 'assets');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Check if input exists
if (!existsSync(inputImage)) {
  console.error(`✗ Input image not found: ${inputImage}`);
  process.exit(1);
}

console.log('🎨 Processing backgrounds for all themes...\n');

// Process each theme
const processPromises = Object.keys(themes).map(async (themeName) => {
  const colorHex = themeColors[themeName];
  const colorRgb = hexToRgb(colorHex);
  const outputPath = join(outputDir, `bg-${themeName}.jpg`);

  console.log(`📸 Theme: ${themeName.toUpperCase()}`);
  const success = await processBackground(inputImage, outputPath, colorRgb, 0.25);
  return { themeName, success };
});

// Wait for all to complete
Promise.all(processPromises).then(results => {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n' + '='.repeat(50));
  console.log(`✓ Background processing complete!`);
  console.log(`  Successful: ${successful}/${results.length}`);
  if (failed > 0) {
    console.log(`  Failed: ${failed}`);
  }
  console.log(`  Output directory: ${outputDir}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    process.exit(1);
  }
});
