import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import pkg from './package.json'
import path from 'path'
import { readdirSync, unlinkSync, existsSync } from 'fs'

// Sync manifest version with package.json
const manifestWithVersion = {
  ...manifest,
  version: pkg.version,
}

// Plugin to remove background images after build
const removeBackgroundImagesPlugin = () => ({
  name: 'remove-background-images',
  closeBundle() {
    const distAssetsDir = path.resolve(__dirname, 'dist', 'assets');
    if (existsSync(distAssetsDir)) {
      const files = readdirSync(distAssetsDir);
      files.forEach(file => {
        if (file.startsWith('bg-') && file.endsWith('.jpg')) {
          const filePath = path.join(distAssetsDir, file);
          try {
            unlinkSync(filePath);
            console.log(`✓ Removed background image: ${file}`);
          } catch (error) {
            console.error(`✗ Failed to remove ${file}:`, error);
          }
        }
      });
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifestWithVersion as any }),
    removeBackgroundImagesPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      input: {
        // Content script will be injected automatically by CRXJS
      },
    },
  },
})
