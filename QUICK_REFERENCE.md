# Quick Reference - Cross-Browser Build

## Build Commands

```bash
# Chrome
npm run build:chrome         # Build only
npm run build:chrome:zip     # Build + zip

# Firefox
npm run build:firefox        # Build only
npm run build:firefox:zip    # Build + zip
```

## What Changed?

✅ Created `browserAPI.ts` - cross-browser compatibility
✅ Updated all API calls to use `browserAPI`
✅ Added `manifest.firefox.json` (MV3)
✅ Created smart build script
✅ Automatic manifest switching

## Architecture

**Both browsers use:**
- ✅ Manifest V3
- ✅ Service Workers
- ✅ Same codebase
- ✅ Same features

**Only difference:**
- Chrome: No `browser_specific_settings`
- Firefox: Has `browser_specific_settings` with gecko ID

## How It Works

```
npm run build:firefox
    ↓
Copies manifest.firefox.json → manifest.json
    ↓
Runs normal build
    ↓
Output ready for Firefox!
```

## Test Locally

**Chrome:**
1. `npm run build:chrome`
2. chrome://extensions/ → Load unpacked
3. Select `dist` folder

**Firefox:**
1. `npm run build:firefox`
2. about:debugging#/runtime/this-firefox
3. Load Temporary Add-on → select `dist/manifest.json`

## Publish

**Chrome:** Upload `imaginegodmode-chrome-v{version}.zip`
**Firefox:** Upload `imaginegodmode-firefox-v{version}.zip`

---

**That's it!** One codebase, two browsers, automatic builds! 🚀
