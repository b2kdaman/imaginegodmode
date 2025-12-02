# Firefox Compatibility Guide

Your extension now works with both Chrome and Firefox using **Manifest V3** and **service workers** on both platforms!

## What Changed?

### ✅ Cross-Browser API Layer
Created `src/utils/browserAPI.ts` that automatically detects which browser API to use:
- Firefox: Uses native `browser.*` API
- Chrome: Uses `chrome.*` API
- Same code works everywhere!

### ✅ Updated Files
All Chrome-specific API calls replaced with `browserAPI`:
- `src/background/service-worker.ts`
- `src/utils/messaging.ts`
- `src/utils/storage.ts`

### ✅ Smart Build System
Created `scripts/build.js` that automatically:
- Swaps manifests based on target browser
- Runs the build
- Creates browser-specific zips

### ✅ Manifest V3 for Both
Both Chrome and Firefox use MV3 with service workers:
- `manifest.json` - Chrome version
- `manifest.firefox.json` - Firefox version (only difference: `browser_specific_settings`)

## Build Commands

```bash
# Chrome
npm run build:chrome         # Build for Chrome
npm run build:chrome:zip     # Build + create Chrome zip

# Firefox  
npm run build:firefox        # Build for Firefox
npm run build:firefox:zip    # Build + create Firefox zip

# Default (Chrome)
npm run build                # Defaults to Chrome
```

## How It Works

### Build Process:
1. Run `npm run build:firefox`
2. Script copies `manifest.firefox.json` → `manifest.json`
3. Runs normal build process
4. Output in `dist/` folder ready for Firefox

### The Smart Part:
- Manifest switching is automatic
- No manual file copying needed
- One command builds everything
- Creates browser-specific zip files

## Testing

### Chrome:
```bash
npm run build:chrome
# Load unpacked from chrome://extensions/
```

### Firefox:
```bash
npm run build:firefox
# Load temporary from about:debugging#/runtime/this-firefox
```

## Key Differences

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest Version | 3 | 3 |
| Background | Service Worker | Service Worker |
| API Namespace | chrome.* | browser.* |
| Unique Field | None | browser_specific_settings |

## Browser API Pattern

**Before (Chrome only):**
```typescript
chrome.storage.local.get(key)
chrome.runtime.sendMessage(msg)
```

**After (Both browsers):**
```typescript
import { browserAPI } from './browserAPI';

browserAPI.storage.local.get(key)
browserAPI.runtime.sendMessage(msg)
```

## Why This Approach?

✅ **MV3 on Both** - Modern, efficient service workers
✅ **Single Codebase** - Same source works everywhere
✅ **Automatic Builds** - No manual manifest swapping
✅ **Type Safe** - Full TypeScript support
✅ **Future Proof** - Easy to add more browsers

## Publishing

### Chrome Web Store:
```bash
npm run build:chrome:zip
# Upload imaginegodmode-chrome-v{version}.zip
```

### Firefox Add-ons:
```bash
npm run build:firefox:zip
# Upload imaginegodmode-firefox-v{version}.zip
```

## Troubleshooting

**Build fails?**
- Ensure Node.js v20+ is installed
- Run `npm install` first
- Check TypeScript errors with `npm run lint`

**Extension won't load?**
- Check browser console for errors
- Verify manifest.json in dist/ is correct
- Ensure all permissions are granted

**API not working?**
- Check browserAPI is imported
- Verify you're using browserAPI, not chrome/browser directly
- Check browser console for errors

## What's Compatible?

✅ All storage operations
✅ All download operations
✅ Message passing
✅ Content scripts
✅ Service workers
✅ UI and React components
✅ All extension features

## Requirements

- **Chrome:** Version 88+ (MV3 support)
- **Firefox:** Version 109+ (MV3 + service worker support)
- **Node.js:** Version 20+ (for building)

## File Structure

```
your-extension/
├── manifest.json              # Chrome manifest (auto-switched)
├── manifest.firefox.json      # Firefox manifest (source)
├── src/
│   ├── utils/
│   │   └── browserAPI.ts     # Cross-browser polyfill ⭐
│   └── background/
│       └── service-worker.ts  # Works on both browsers ⭐
├── scripts/
│   ├── build.js              # Smart build script ⭐
│   └── zip-dist.js           # Creates browser-specific zips
└── package.json              # Updated with new commands
```

## Success! 🎉

Your extension is now fully cross-browser compatible with:
- Modern MV3 architecture
- Efficient service workers
- Automatic build system
- Single codebase
- Easy publishing workflow

Build it once, deploy everywhere!
