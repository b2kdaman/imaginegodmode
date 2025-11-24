import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import pkg from './package.json'
import path from 'path'

// Sync manifest version with package.json
const manifestWithVersion = {
  ...manifest,
  version: pkg.version,
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifestWithVersion as any }),
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
