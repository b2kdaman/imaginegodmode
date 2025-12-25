# ImagineGodMode v2.2.1

## 🎨 New Features

### JSON-Based Theme System
Complete overhaul of the theme system for easy customization:

- **Themes moved to JSON** (`public/themes.json`) - No code changes needed
- **Dynamic loading** with caching for performance
- **Fallback themes** built-in if JSON loading fails
- **Customization guide** included in `public/THEMES_README.md`

### Three New Themes
Added nostalgic retro-inspired themes (6 themes total):

- **Winamp Theme** - Deep blue-black with bright LED green text (#00FF00) and orange progress bars
- **LimeWire Theme** - Very dark black with signature lime green (#8FD14F) P2P aesthetic
- **Steam Theme** - Valve's iconic dark blue slate (#171a21) with light blue accents (#66c0f4)

**All Available Themes:** Dark, Light, Dracula, Winamp, LimeWire, Steam

### Global Keyboard Shortcuts
Enhanced shortcuts now work anywhere on the page:

- **Space** - Play/pause video (no need to focus extension panel)
- **F** - Toggle fullscreen (works from anywhere on page)

Both shortcuts intelligently fall back to direct video control when UI buttons aren't found.

## 🐛 Bug Fixes

### Fixed "Make Video" Button Triggering
- Replaced simple `.click()` with complete event sequence to properly trigger React handlers
- Updated to exact selector: `button[aria-label="Make video"]`
- Fixed both keyboard shortcuts (Ctrl/Cmd+Enter, Ctrl/Cmd+Shift+Enter)
- Fixed Prompt tab Make button to match keyboard shortcut behavior
- Added console logging for debugging

**Result:** Keyboard shortcuts and Make button now reliably trigger video generation.

## 🔧 Technical Improvements

### Refactored DOM Selectors
- Centralized all DOM selectors into `SELECTORS` constant
- Single source of truth for maintainability
- Easier to update if Grok's page structure changes
- Type-safe selector access

### Theme System Architecture
- New `themeLoader.ts` utility for dynamic loading with caching
- `themes.json` as web accessible resource
- 14 color properties per theme for full customization
- Fallback themes in code for reliability

## 🎨 Customizing Themes

### Quick Start
1. Edit `public/themes.json`
2. Add or modify theme definitions (14 color properties each)
3. Run `npm run build`
4. Reload extension in Chrome

See `public/THEMES_README.md` for detailed instructions.

## 📦 Installation

### Manual Installation (Developer Mode)
1. Download `imaginegodmode-v2.2.1.zip`
2. Extract and open Chrome extensions (`chrome://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

### From Source
```bash
git clone https://github.com/b2kdaman/grkgoondl.git
cd grkgoondl
git checkout v2.2.1
npm install
npm run build
```

## 📝 Full Release Notes

See [RELEASE_NOTES_v2.2.1.md](./RELEASE_NOTES_v2.2.1.md) for detailed documentation.

## 🔄 What's Changed

* feat: Add Winamp theme and make themes configurable via JSON (6cd375a)
* feat: Add LimeWire and Steam themes (d167e86)
* feat: Make Space and F keyboard shortcuts work globally (919c873)
* fix: Improve "Make video" button triggering with proper event sequence (ffb4431)
* fix: Update PromptView Make button to use proper event triggering (cb2efff)
* refactor: Extract DOM selectors to constants (f462b50)
* chore: Bump version to 2.2.1 (de31267)

**Full Changelog**: https://github.com/b2kdaman/grkgoondl/compare/ba5ec05...v2.2.1

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
