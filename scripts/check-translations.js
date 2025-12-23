#!/usr/bin/env node

/**
 * Translation Coverage Checker
 *
 * This script analyzes the codebase for translation issues:
 * 1. Finds hardcoded strings in component files that should use translations
 * 2. Checks for missing translation keys in non-English locale files
 * 3. Identifies unused translation keys
 * 4. Validates t() function calls for non-existent keys
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALE_DIR = path.join(__dirname, '../src/locales');
const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const BASE_LOCALE = 'en';

// Patterns to detect hardcoded strings (common cases to flag)
const HARDCODED_PATTERNS = [
  // String literals in JSX content
  />\s*["']([^"']{3,})["']\s*</g,
  // String literals in props (title, tooltip, placeholder, etc.)
  /(title|tooltip|placeholder|label|text|message|confirmText|description|subMessage)=["']([^"']+)["']/g,
];

// Patterns to exclude (these are likely not user-facing strings)
const EXCLUDE_PATTERNS = [
  /^[0-9]+$/, // Numbers
  /^[0-9]+%$/, // Percentages
  /^#[0-9a-fA-F]{3,8}$/, // Color codes
  /^\.[a-z-]+$/, // CSS classes
  /^[a-z]+:[a-z]+$/, // CSS properties
  /^http/, // URLs
  /^data:/, // Data URIs
  /^mdi/, // Icon names
  /^@/, // Decorators/imports
  /^\$/, // Variables
  /^[A-Z_]+$/, // Constants (all caps)
  /^by b2kdaman$/, // Author credit (might want to keep hardcoded)
  /^ImagineGodMode/, // App name
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Load a JSON file
 */
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}Error loading ${filePath}:${colors.reset}`, error.message);
    return null;
  }
}

/**
 * Get all keys from a nested object with dot notation
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Get all files recursively from a directory
 */
function getFilesRecursively(dir, extension = '.tsx') {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Extract all t() function calls from a file
 */
function extractTranslationKeys(content) {
  const keys = new Set();

  // Match t('key') and t("key")
  const singleQuotePattern = /\bt\(['"]([^'"]+)['"]\)/g;
  let match;

  while ((match = singleQuotePattern.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return Array.from(keys);
}

/**
 * Find potential hardcoded strings in a file
 */
function findHardcodedStrings(filePath, content) {
  const hardcoded = [];
  const lines = content.split('\n');

  // Check if file uses translation hook
  const usesTranslation = content.includes('useTranslation');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      continue;
    }

    // Skip import statements
    if (line.includes('import ')) {
      continue;
    }

    for (const pattern of HARDCODED_PATTERNS) {
      pattern.lastIndex = 0; // Reset regex
      let match;

      while ((match = pattern.exec(line)) !== null) {
        const potentialString = match[1] || match[2];

        if (!potentialString) continue;

        // Skip if it matches exclude patterns
        const shouldExclude = EXCLUDE_PATTERNS.some(excludePattern =>
          excludePattern.test(potentialString)
        );

        if (shouldExclude) continue;

        // Skip if it's already using t() function
        if (line.includes(`t('`) || line.includes(`t("`)) {
          continue;
        }

        // Skip very short strings (likely not user-facing)
        if (potentialString.length < 3) continue;

        hardcoded.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNum + 1,
          string: potentialString,
          context: line.trim().substring(0, 100),
        });
      }
    }
  }

  return hardcoded;
}

/**
 * Check for missing keys in locale files
 */
function checkMissingLocaleKeys() {
  console.log(`\n${colors.bright}${colors.blue}📋 Checking Translation Coverage Across Locales...${colors.reset}\n`);

  // Load base locale
  const baseLocalePath = path.join(LOCALE_DIR, `${BASE_LOCALE}.json`);
  const baseLocale = loadJSON(baseLocalePath);

  if (!baseLocale) {
    console.error(`${colors.red}Failed to load base locale: ${BASE_LOCALE}${colors.reset}`);
    return { hasErrors: true };
  }

  const baseKeys = getAllKeys(baseLocale);
  console.log(`${colors.gray}Base locale (${BASE_LOCALE}.json) has ${baseKeys.length} keys${colors.reset}\n`);

  // Get all locale files
  const localeFiles = fs.readdirSync(LOCALE_DIR)
    .filter(file => file.endsWith('.json') && file !== `${BASE_LOCALE}.json`);

  let totalMissing = 0;
  const missingByLocale = {};

  for (const localeFile of localeFiles) {
    const localePath = path.join(LOCALE_DIR, localeFile);
    const locale = loadJSON(localePath);
    const localeName = localeFile.replace('.json', '');

    if (!locale) continue;

    const localeKeys = getAllKeys(locale);
    const missingKeys = baseKeys.filter(key => !localeKeys.includes(key));
    const extraKeys = localeKeys.filter(key => !baseKeys.includes(key));

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      console.log(`${colors.yellow}${localeName}.json:${colors.reset}`);

      if (missingKeys.length > 0) {
        console.log(`  ${colors.red}✗ Missing ${missingKeys.length} keys:${colors.reset}`);
        missingKeys.slice(0, 10).forEach(key => {
          console.log(`    ${colors.gray}- ${key}${colors.reset}`);
        });
        if (missingKeys.length > 10) {
          console.log(`    ${colors.gray}... and ${missingKeys.length - 10} more${colors.reset}`);
        }
        totalMissing += missingKeys.length;
        missingByLocale[localeName] = missingKeys;
      }

      if (extraKeys.length > 0) {
        console.log(`  ${colors.cyan}⚠ Has ${extraKeys.length} extra keys not in base locale${colors.reset}`);
      }

      console.log(`  ${colors.green}✓ Has ${localeKeys.length - missingKeys.length}/${baseKeys.length} keys${colors.reset}\n`);
    } else {
      console.log(`${colors.green}✓ ${localeName}.json - Complete (${localeKeys.length} keys)${colors.reset}\n`);
    }
  }

  return {
    hasErrors: totalMissing > 0,
    totalMissing,
    missingByLocale,
    baseKeyCount: baseKeys.length,
  };
}

/**
 * Check for hardcoded strings in components
 */
function checkHardcodedStrings() {
  console.log(`\n${colors.bright}${colors.blue}🔍 Scanning Components for Hardcoded Strings...${colors.reset}\n`);

  const componentFiles = getFilesRecursively(COMPONENTS_DIR);
  const allHardcoded = [];

  for (const filePath of componentFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hardcoded = findHardcodedStrings(filePath, content);

    if (hardcoded.length > 0) {
      allHardcoded.push(...hardcoded);
    }
  }

  if (allHardcoded.length > 0) {
    console.log(`${colors.yellow}Found ${allHardcoded.length} potential hardcoded strings:${colors.reset}\n`);

    // Group by file
    const byFile = {};
    allHardcoded.forEach(item => {
      if (!byFile[item.file]) byFile[item.file] = [];
      byFile[item.file].push(item);
    });

    // Show up to 20 files
    const files = Object.keys(byFile).slice(0, 20);

    for (const file of files) {
      console.log(`${colors.cyan}${file}:${colors.reset}`);
      const items = byFile[file].slice(0, 5); // Show up to 5 per file

      items.forEach(item => {
        console.log(`  ${colors.gray}Line ${item.line}:${colors.reset} "${item.string}"`);
        console.log(`  ${colors.gray}${item.context}${colors.reset}\n`);
      });

      if (byFile[file].length > 5) {
        console.log(`  ${colors.gray}... and ${byFile[file].length - 5} more\n${colors.reset}`);
      }
    }

    if (Object.keys(byFile).length > 20) {
      console.log(`${colors.gray}... and ${Object.keys(byFile).length - 20} more files\n${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}✓ No obvious hardcoded strings found!${colors.reset}\n`);
  }

  return {
    hasWarnings: allHardcoded.length > 0,
    count: allHardcoded.length,
  };
}

/**
 * Check for invalid translation keys in components
 */
function checkInvalidKeys() {
  console.log(`\n${colors.bright}${colors.blue}🔎 Checking for Invalid Translation Keys...${colors.reset}\n`);

  // Load base locale to get valid keys
  const baseLocalePath = path.join(LOCALE_DIR, `${BASE_LOCALE}.json`);
  const baseLocale = loadJSON(baseLocalePath);
  const validKeys = new Set(getAllKeys(baseLocale));

  const componentFiles = getFilesRecursively(COMPONENTS_DIR);
  const invalidKeys = [];

  for (const filePath of componentFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const usedKeys = extractTranslationKeys(content);

    for (const key of usedKeys) {
      if (!validKeys.has(key)) {
        invalidKeys.push({
          file: path.relative(process.cwd(), filePath),
          key,
        });
      }
    }
  }

  if (invalidKeys.length > 0) {
    console.log(`${colors.red}✗ Found ${invalidKeys.length} invalid translation keys:${colors.reset}\n`);

    const byKey = {};
    invalidKeys.forEach(item => {
      if (!byKey[item.key]) byKey[item.key] = [];
      byKey[item.key].push(item.file);
    });

    Object.entries(byKey).slice(0, 20).forEach(([key, files]) => {
      console.log(`  ${colors.yellow}"${key}"${colors.reset}`);
      files.slice(0, 3).forEach(file => {
        console.log(`    ${colors.gray}${file}${colors.reset}`);
      });
      if (files.length > 3) {
        console.log(`    ${colors.gray}... and ${files.length - 3} more files${colors.reset}`);
      }
      console.log();
    });
  } else {
    console.log(`${colors.green}✓ All translation keys are valid!${colors.reset}\n`);
  }

  return {
    hasErrors: invalidKeys.length > 0,
    count: invalidKeys.length,
  };
}

/**
 * Check if a key is likely used dynamically (e.g., in loops, interpolation)
 */
function isLikelyDynamicKey(key, content) {
  const keyParts = key.split('.');

  // Pattern 1: settings.themes.*, settings.sizes.*, settings.languages.*
  // These are used in dropdown mappings like: options.map(o => ({ value: o, label: t(`settings.themes.${o}`) }))
  if (key.match(/^settings\.(themes|sizes|languages)\./)) {
    return content.includes('settings.themes') ||
           content.includes('settings.sizes') ||
           content.includes('settings.languages');
  }

  // Pattern 2: help.features.*, help.tooltips.*
  // These are used in feature arrays with dynamic rendering
  if (key.match(/^help\.(features|tooltips)\./)) {
    return content.includes('help.features') || content.includes('help.tooltips');
  }

  // Pattern 3: help.shortcuts.keys.*, help.shortcuts.descriptions.*
  // Used in keyboard shortcuts mapping
  if (key.match(/^help\.shortcuts\.(keys|descriptions)\./)) {
    return content.includes('help.shortcuts');
  }

  // Pattern 4: Keys used with parameter interpolation (contain {{ }})
  // Check if the key's value contains interpolation markers
  return false;
}

/**
 * Check if a translation value uses parameter interpolation
 */
function usesInterpolation(locale, key) {
  const keyParts = key.split('.');
  let value = locale;

  for (const part of keyParts) {
    if (!value || typeof value !== 'object') return false;
    value = value[part];
  }

  return typeof value === 'string' && value.includes('{{');
}

/**
 * Find unused translation keys
 */
function checkUnusedKeys() {
  console.log(`\n${colors.bright}${colors.blue}🗑️  Checking for Unused Translation Keys...${colors.reset}\n`);

  // Load base locale
  const baseLocalePath = path.join(LOCALE_DIR, `${BASE_LOCALE}.json`);
  const baseLocale = loadJSON(baseLocalePath);
  const allKeys = new Set(getAllKeys(baseLocale));

  // Get all used keys from components
  const componentFiles = getFilesRecursively(COMPONENTS_DIR);
  const usedKeys = new Set();
  let allContent = '';

  for (const filePath of componentFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    allContent += content + '\n';
    const keys = extractTranslationKeys(content);
    keys.forEach(key => usedKeys.add(key));
  }

  // Also check hooks and other TypeScript files
  const srcDir = path.join(__dirname, '../src');
  const tsFiles = getFilesRecursively(srcDir, '.tsx').concat(getFilesRecursively(srcDir, '.ts'));

  for (const filePath of tsFiles) {
    if (filePath.includes('/locales/')) continue; // Skip locale files
    const content = fs.readFileSync(filePath, 'utf-8');
    allContent += content + '\n';
    const keys = extractTranslationKeys(content);
    keys.forEach(key => usedKeys.add(key));
  }

  // Filter out keys that are likely used dynamically
  const potentiallyUnused = Array.from(allKeys).filter(key => {
    // Already found in direct usage
    if (usedKeys.has(key)) return false;

    // Check if it's a dynamic key
    if (isLikelyDynamicKey(key, allContent)) return false;

    // Check if it uses interpolation
    if (usesInterpolation(baseLocale, key)) return false;

    return true;
  });

  const dynamicKeyCount = allKeys.size - potentiallyUnused.length - usedKeys.size;

  if (potentiallyUnused.length > 0) {
    console.log(`${colors.yellow}Found ${potentiallyUnused.length} potentially unused keys:${colors.reset}\n`);

    potentiallyUnused.slice(0, 20).forEach(key => {
      console.log(`  ${colors.gray}- ${key}${colors.reset}`);
    });

    if (potentiallyUnused.length > 20) {
      console.log(`  ${colors.gray}... and ${potentiallyUnused.length - 20} more${colors.reset}`);
    }
    console.log();
  } else {
    console.log(`${colors.green}✓ All translation keys are being used!${colors.reset}\n`);
  }

  if (dynamicKeyCount > 0) {
    console.log(`${colors.cyan}ℹ ${dynamicKeyCount} keys detected as dynamically used (e.g., in loops, maps, interpolation)${colors.reset}\n`);
  }

  return {
    hasWarnings: potentiallyUnused.length > 0,
    count: potentiallyUnused.length,
    unusedKeys: potentiallyUnused,
    dynamicKeys: dynamicKeyCount,
  };
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║           Translation Coverage Checker                 ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  const results = {
    locales: checkMissingLocaleKeys(),
    hardcoded: checkHardcodedStrings(),
    invalidKeys: checkInvalidKeys(),
    unusedKeys: checkUnusedKeys(),
  };

  // Summary
  console.log(`${colors.bright}${colors.blue}📊 Summary${colors.reset}\n`);

  let exitCode = 0;

  if (results.locales.hasErrors) {
    console.log(`${colors.red}✗ ${results.locales.totalMissing} missing translations across locale files${colors.reset}`);
    exitCode = 1;
  } else {
    console.log(`${colors.green}✓ All locale files are complete${colors.reset}`);
  }

  if (results.invalidKeys.hasErrors) {
    console.log(`${colors.red}✗ ${results.invalidKeys.count} invalid translation keys in code${colors.reset}`);
    exitCode = 1;
  } else {
    console.log(`${colors.green}✓ No invalid translation keys${colors.reset}`);
  }

  if (results.hardcoded.hasWarnings) {
    console.log(`${colors.yellow}⚠ ${results.hardcoded.count} potential hardcoded strings (review recommended)${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ No obvious hardcoded strings${colors.reset}`);
  }

  if (results.unusedKeys.hasWarnings) {
    console.log(`${colors.yellow}⚠ ${results.unusedKeys.count} potentially unused translation keys${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ All translation keys are in use${colors.reset}`);
  }

  if (results.unusedKeys.dynamicKeys > 0) {
    console.log(`${colors.cyan}ℹ ${results.unusedKeys.dynamicKeys} keys are dynamically used (loops, maps, interpolation)${colors.reset}`);
  }

  console.log();

  if (exitCode === 0) {
    console.log(`${colors.bright}${colors.green}✅ Translation coverage looks good!${colors.reset}\n`);
  } else {
    console.log(`${colors.bright}${colors.red}❌ Translation coverage has errors that need fixing${colors.reset}\n`);
  }

  process.exit(exitCode);
}

// Run the script
main();
