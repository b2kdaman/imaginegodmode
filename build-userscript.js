import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { minify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildUserscript() {
  console.log('Building Tampermonkey userscript from modules...');

  // Read the userscript header
  const header = readFileSync(join(__dirname, 'src', 'userscript-header.js'), 'utf8');

  // Bundle all modules using esbuild
  const result = await build({
    entryPoints: [join(__dirname, 'src', 'main.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    write: false,
    minify: false, // We'll minify with terser later to preserve header
    banner: {
      js: header.trim() + '\n\n(function () {\n    \'use strict\';\n',
    },
    footer: {
      js: '\n})();',
    },
  });

  if (result.errors.length > 0) {
    console.error('Build errors:', result.errors);
    process.exit(1);
  }

  // Get bundled code
  const bundledCode = result.outputFiles[0].text;
  
  // Extract just the code (remove header and IIFE wrapper we added)
  const codeStart = bundledCode.indexOf("'use strict';") + "'use strict';".length;
  const codeEnd = bundledCode.lastIndexOf('})();');
  const code = bundledCode.substring(codeStart, codeEnd).trim();

  // Minify the code
  const minified = await minify(code, {
    compress: {
      drop_console: false, // Keep console.log for debugging
      passes: 2,
    },
    format: {
      comments: false,
    },
    mangle: {
      reserved: ['GM_download'], // Don't mangle Tampermonkey API
    },
  });

  if (minified.error) {
    console.error('Minification error:', minified.error);
    process.exit(1);
  }

  // Combine header with minified code
  const output = header + '\n\n(function () {\n    \'use strict\';\n\n' + minified.code + '\n})();';

  // Ensure dist directory exists
  mkdirSync(join(__dirname, 'dist'), { recursive: true });

  // Write the built file
  const outputPath = join(__dirname, 'dist', 'grokgoondl.user.js');
  writeFileSync(outputPath, output, 'utf8');

  console.log(`✅ Built userscript: ${outputPath}`);
  console.log(`   Bundled size: ${(bundledCode.length / 1024).toFixed(2)} KB`);
  console.log(`   Minified size: ${(output.length / 1024).toFixed(2)} KB`);
  console.log(`   Reduction: ${((1 - output.length / bundledCode.length) * 100).toFixed(1)}%`);
}

buildUserscript().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
