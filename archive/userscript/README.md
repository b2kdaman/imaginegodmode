# GrokGoonify Userscript (Archived)

This directory contains the **original Tampermonkey userscript** version of GrokGoonify.

**⚠️ This version is archived and no longer actively maintained.**

The project has been migrated to a **Chrome extension with React** (see root directory).

## What's Here

- `src/` - Original vanilla JavaScript source code
- `build-userscript.js` - Build script using esbuild
- `dist/` - Built userscript output
- `package.json` - Dependencies for userscript

## Original Features

- Vanilla JavaScript with ES6 modules
- Built with esbuild + terser
- Used Tampermonkey APIs (`GM_download`, `localStorage`)
- ~1,800 lines of UI code
- 36KB minified output

## Why Migrated?

The Chrome extension offers:
- ✅ Modern React architecture
- ✅ TypeScript type safety
- ✅ Better state management (Zustand)
- ✅ No Tampermonkey dependency
- ✅ Chrome extension APIs
- ✅ Improved maintainability

## Building (Legacy)

```bash
cd archive/userscript
npm install
npm run build:userscript
```

Output: `dist/grokgoonify.user.js`

## Migration Notes

See main README.md for the new Chrome extension implementation.

Last userscript version: **1.5.0**
