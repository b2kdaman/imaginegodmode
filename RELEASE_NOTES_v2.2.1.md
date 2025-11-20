# Release Notes - v2.2.1

**Release Date:** 2025-11-19

## Overview

Version 2.2.1 brings significant improvements to keyboard shortcuts, button event handling, and introduces a powerful JSON-based theme system with three new retro-inspired themes. This release focuses on reliability, customizability, and maintainability.

---

## 🎨 New Features

### JSON-Based Theme System
Complete overhaul of the theme system for easy customization without code changes:

- **Themes moved to JSON**: All theme definitions now in `public/themes.json`
- **Dynamic loading**: Themes loaded at runtime with caching for performance
- **Fallback themes**: Built-in fallbacks if JSON loading fails
- **Easy customization**: Edit JSON file to add or modify themes
- **Theme guide included**: `public/THEMES_README.md` with customization instructions

### Three New Themes
Added nostalgic retro-inspired themes (now 6 themes total):

#### **Winamp Theme** *(New)*
- Deep blue-black backgrounds (#0C1821, #1B4965, #2E8B95)
- Bright LED-style green text (#00FF00, #5FE3B2, #00FFFF)
- Orange progress bars with green/orange glows
- Nostalgic Winamp classic aesthetic

#### **LimeWire Theme** *(New)*
- Very dark black backgrounds (#0a0a0a, #1a1a1a, #2d2d2d)
- Signature lime green text (#8FD14F, #6FB02B, #B4E87A)
- Nostalgic P2P file-sharing aesthetic
- Lime green progress bars and glowing effects

#### **Steam Theme** *(New)*
- Valve's iconic dark blue slate (#171a21, #1b2838, #2a475e)
- Light blue-gray text (#c7d5e0, #8f98a0, white)
- Steam signature blue accents (#66c0f4)
- Gaming platform aesthetic

**All Available Themes:**
1. Dark (default)
2. Light
3. Dracula
4. Winamp *(new)*
5. LimeWire *(new)*
6. Steam *(new)*

### Global Keyboard Shortcuts
Enhanced keyboard shortcuts to work anywhere on the page, not just when the extension panel is focused.

#### **Space Key (Play/Pause)** - Now Global
- Works from anywhere on the Grok page (except when typing in text fields)
- First tries to find play/pause button in extension UI
- Falls back to directly controlling any visible video element
- Seamlessly toggles between play and pause states

#### **F Key (Fullscreen)** - Now Global
- Works from anywhere on the Grok page (except when typing in text fields)
- First tries extension UI fullscreen button
- Searches for page fullscreen controls as fallback
- Can directly fullscreen any video element if UI buttons not found
- Exits fullscreen if already in fullscreen mode

**User Benefits:**
- No need to focus on extension panel first
- Press Space or F from anywhere on the page
- Works even if panel is collapsed
- Seamless video control experience

---

## 🐛 Bug Fixes

### Fixed "Make Video" Button Triggering

#### Problem
The "Make video" button on Grok's page wasn't being triggered reliably by keyboard shortcuts and the extension's Make button. Simple `.click()` calls weren't triggering React's event handlers properly.

#### Solution
Replaced simple `.click()` with a complete event sequence that properly triggers React's synthetic event system:

```typescript
const events = [
  new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }),
  new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true }),
  new PointerEvent('pointerup', { bubbles: true, cancelable: true, composed: true }),
  new MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true }),
  new MouseEvent('click', { bubbles: true, cancelable: true, composed: true })
];
events.forEach(event => makeVideoBtn.dispatchEvent(event));
```

#### Changes Made
- Updated selector to exact aria-label: `button[aria-label="Make video"]`
- Applied fix to both keyboard shortcuts:
  - `Ctrl/Cmd + Enter` - Click Make video
  - `Ctrl/Cmd + Shift + Enter` - Copy prompt and click Make video
- Fixed PromptView Make button to use same event sequence
- Updated tooltip to show correct keyboard shortcut
- Added console logging for debugging

**Affected Components:**
- Keyboard shortcuts (`useKeyboardShortcuts.ts`)
- Prompt tab Make button (`PromptView.tsx`)

---

## 🔧 Technical Improvements

### Refactored DOM Selectors to Constants

#### Motivation
Centralize all DOM selector strings to improve maintainability and make it easier to update selectors if Grok's page structure changes.

#### Implementation
Added `SELECTORS` constant to `constants.ts`:

```typescript
export const SELECTORS = {
  MAKE_VIDEO_BUTTON: 'button[aria-label="Make video"]',
  TEXTAREA: 'textarea',
  VIDEO_ELEMENT: 'video',
  FULLSCREEN_BUTTON: '[title*="fullscreen" i]',
  FULLSCREEN_BUTTON_ALT: 'button[aria-label*="fullscreen" i]',
  PLAY_PAUSE_BUTTON: '[title*="play" i], [title*="pause" i]',
} as const;
```

#### Benefits
- Single source of truth for all DOM selectors
- Easy to update if page structure changes
- Better code organization and maintainability
- Type-safe selector access

**Updated Files:**
- `src/utils/constants.ts` - Added SELECTORS constant
- `src/components/PromptView.tsx` - Uses SELECTORS
- `src/hooks/useKeyboardShortcuts.ts` - Uses SELECTORS

### Theme System Architecture

#### New Components
- `src/utils/themeLoader.ts` - Dynamic theme loader with caching
- `public/themes.json` - Theme definitions (web accessible resource)
- `public/THEMES_README.md` - Theme customization guide

#### How It Works
1. Themes loaded from JSON at app initialization
2. First load fetches and caches themes
3. Subsequent loads use cached version
4. Fallback themes in code if JSON loading fails
5. Chrome extension API provides access via `chrome.runtime.getURL()`

#### For Theme Creators
Edit `public/themes.json` to add custom themes with 14 color properties:
- Background colors (dark, medium, light)
- Text colors (primary, secondary, hover)
- UI colors (shadow, border, success)
- Progress bar color
- Glow colors (primary, secondary, hover variants)

---

## 📝 Documentation Updates

- Updated README.md with theme system section
- Added Theme Customization guide to README
- Updated Features to mention 6 configurable themes
- Updated Settings View documentation
- Updated keyboard shortcuts documentation to note global functionality
- Added `public/THEMES_README.md` for theme customization
- Updated Future Enhancements checklist

---

## 🔄 Migration Notes

No breaking changes. All existing data, settings, and functionality remain compatible.

### For Theme Users
- All 6 themes available in Settings dropdown
- Existing theme preferences preserved automatically
- Themes now load from `public/themes.json`
- Can customize themes by editing JSON file

### For Developers
- If you've customized DOM selectors, update them in `constants.ts` SELECTORS
- All selector references now use the centralized constant
- Theme system now requires `themes.json` as web accessible resource
- Existing functionality remains unchanged

---

## 🛠️ Technical Details

### Commits Included (ba5ec05...de31267)
1. `6cd375a` - feat: Add Winamp theme and make themes configurable via JSON
2. `d167e86` - feat: Add LimeWire and Steam themes
3. `919c873` - feat: Make Space and F keyboard shortcuts work globally
4. `ffb4431` - fix: Improve "Make video" button triggering with proper event sequence
5. `cb2efff` - fix: Update PromptView Make button to use proper event triggering
6. `f462b50` - refactor: Extract DOM selectors to constants
7. `de31267` - chore: Bump version to 2.2.1

### Files Modified
- `package.json` - Version bump to 2.2.1
- `src/utils/constants.ts` - Version bump + added SELECTORS constant
- `src/utils/themeLoader.ts` - **New file** - Dynamic theme loader
- `src/store/useSettingsStore.ts` - Load themes from JSON, updated Theme type
- `src/components/SettingsView.tsx` - Added theme dropdown options
- `src/components/HelpView.tsx` - Updated theme list to 6 themes
- `src/components/PromptView.tsx` - Fixed Make button + use SELECTORS
- `src/hooks/useKeyboardShortcuts.ts` - Enhanced global shortcuts + use SELECTORS
- `src/App.tsx` - Initialize theme loading
- `public/themes.json` - **New file** - Theme definitions
- `public/THEMES_README.md` - **New file** - Theme customization guide
- `manifest.json` - Added web_accessible_resources for themes.json
- `README.md` - Updated documentation

### New Files Added
- `src/utils/themeLoader.ts` - Theme loading utility
- `public/themes.json` - Theme configuration file
- `public/THEMES_README.md` - Theme customization documentation

---

## 🚀 Installation

### Chrome Web Store
Coming soon - preparing for publication

### Manual Installation (Developer Mode)
1. Download the latest release: `imaginegodmode-v2.2.1.zip`
2. Extract the zip file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select the extracted `dist` folder

### From Source
```bash
git clone https://github.com/b2kdaman/grkgoondl.git
cd grkgoondl
git checkout v2.2.1
npm install
npm run build
# Load the dist folder in Chrome
```

---

## 🎨 Customizing Themes

### Quick Start
1. Open `public/themes.json`
2. Add or modify theme definitions
3. Run `npm run build`
4. Reload extension in Chrome

### Theme Properties
Each theme requires 14 color properties:
- `BACKGROUND_DARK`, `BACKGROUND_MEDIUM`, `BACKGROUND_LIGHT`
- `TEXT_PRIMARY`, `TEXT_SECONDARY`, `TEXT_HOVER`
- `SHADOW`, `BORDER`, `SUCCESS`
- `PROGRESS_BAR`
- `GLOW_PRIMARY`, `GLOW_SECONDARY`
- `GLOW_HOVER_PRIMARY`, `GLOW_HOVER_SECONDARY`

See `public/THEMES_README.md` for detailed instructions.

---

## 🙏 Acknowledgments

This release was developed with assistance from Claude Code.

---

## 📋 Full Changelog

For a complete list of changes, see: [Comparing ba5ec05...v2.2.1](https://github.com/b2kdaman/grkgoondl/compare/ba5ec05...v2.2.1)

---

## 🐞 Known Issues

None reported for this release.

---

## 💬 Feedback & Support

- Report issues: [GitHub Issues](https://github.com/b2kdaman/grkgoondl/issues)
- Feature requests: Create an issue with the `enhancement` label
- Questions: Open a discussion on GitHub

---

**Previous Version:** v2.2.0
**Current Version:** v2.2.1
**Next Version:** TBD
