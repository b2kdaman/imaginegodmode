# GrokGoonify Chrome Extension

A Chrome extension for Grok media management built with React, TypeScript, and Tailwind CSS.

## Features

- **Prompt Management**: Save, organize, and manage prompts with categories
- **Star Ratings**: Rate your prompts with 1-5 stars (Material Design Icons)
- **Category System**: Create custom categories to organize prompts
- **Media Downloading**: Download images and videos from Grok posts
- **Video Upscaling**: Batch upscale videos to HD quality
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + Enter`: Click "Make a Video" button
  - `Ctrl/Cmd + Shift + Enter`: Copy prompt and click "Make a Video"
  - `Left Arrow`: Navigate to previous video
  - `Right Arrow`: Navigate to next video
- **Arrow Key Navigation**: Navigate videos with Left/Right arrow keys
- **URL Watcher**: Automatically resets state when navigating between posts
- **Persistent Storage**: All data saved with `chrome.storage.local`
- **Modern UI**: Tab-style navigation, pill-shaped buttons, Material Design Icons
- **Spin Feature**: Batch process list items (from userscript version)

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **CRXJS** - Vite plugin for Chrome extensions
- **Chrome Manifest V3** - Latest extension API

## Installation

### Development Mode

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

4. **Development with auto-reload**:
   ```bash
   npm run dev
   ```
   This will watch for changes and rebuild automatically.

### Usage

1. Navigate to any Grok post: `https://grok.com/imagine/post/*`
2. The extension UI will appear in the bottom-right corner
3. Click the `+` button to expand the panel
4. Switch between "Prompt" and "Ops" tabs

## Project Structure

```
grkgoondl/
├── src/
│   ├── api/              # API layer for Grok endpoints
│   ├── background/       # Background service worker
│   ├── components/       # React components
│   ├── content/          # Content script (injection point)
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   └── index.css         # Global styles (Tailwind)
├── public/               # Static assets (icons)
├── scripts/              # Build scripts
├── dist/                 # Build output (load this in Chrome)
├── archive/              # Archived Tampermonkey userscript
├── manifest.json         # Extension manifest
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## Key Components

### Stores (Zustand)

- **usePromptStore**: Manages prompts, categories, and ratings
- **useMediaStore**: Handles media URLs, upscaling, and status
- **useUIStore**: Controls UI state (expanded/collapsed, view mode)

### Hooks

- **useKeyboardShortcuts**: Global keyboard shortcut handlers
- **useUrlWatcher**: Monitors URL changes and resets state
- **useArrowKeyNavigation**: Arrow key navigation for video controls

### Components

- **MainPanel**: Floating panel container
- **PromptView**: Prompt management interface
- **OpsView**: Media controls and operations
- **CategoryManager**: Category dropdown and CRUD operations
- **RatingSystem**: 5-star rating component
- **Button**: Reusable button component with variants
- **Tabs**: Tab navigation component with active state styling

## Architecture

### Content Script
Injects the React app into Grok pages at `document_idle`.

### Background Service Worker
Handles:
- API calls to Grok endpoints
- File downloads via `chrome.downloads.download()`
- Message passing between content script and background

### Message Passing
Uses `chrome.runtime.sendMessage()` for communication:
- `FETCH_POST` - Fetch post data from API
- `UPSCALE_VIDEO` - Upscale a video
- `DOWNLOAD_MEDIA` - Download media files

### Storage
Uses `chrome.storage.local` for persistent data:
- Categories with prompts and ratings
- Current category and index
- Automatic migration from old format

## Development

### Type Checking
```bash
npm run type-check
```

### Building
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

## Migration from Tampermonkey

This Chrome extension is a complete rewrite of the original Tampermonkey userscript with:

- ✅ Modern React architecture
- ✅ Full TypeScript type safety
- ✅ Chrome extension APIs (no Tampermonkey dependency)
- ✅ Improved state management with Zustand
- ✅ Tailwind CSS for styling
- ✅ Component-based architecture
- ✅ Better separation of concerns

### Key Differences

| Feature | Tampermonkey | Chrome Extension |
|---------|--------------|------------------|
| Storage | `localStorage` | `chrome.storage.local` |
| Downloads | `GM_download()` | `chrome.downloads.download()` |
| State | Global object | Zustand stores |
| UI | Vanilla JS + DOM | React components |
| Styling | Inline styles | Tailwind CSS |
| Build | esbuild | Vite + CRXJS |

## Notes

- **Archived Userscript**: The original Tampermonkey version is in `archive/userscript/`
- Spin automation feature not yet implemented in extension (was in userscript)
- Custom icons included (gold "G" logo at 16px, 48px, 128px)
- Extension requires permissions for `storage`, `downloads`, and `activeTab`
- Works on `https://grok.com/*` and `https://www.grok.com/*`
- All buttons use pill shape with unified dark theme and subtle hover states
- Material Design Icons for professional appearance
- Tab-style navigation with active state using button color (grok-gray)

## Commands

```bash
npm install          # Install dependencies
npm run build        # Build extension for production
npm run dev          # Development mode with hot reload
npm run type-check   # TypeScript type checking
npm run generate-icons  # Regenerate extension icons
```

## Future Enhancements

- [ ] Spin automation (batch process list items)
- [ ] Fullscreen video player support
- [ ] Export/import prompts
- [ ] Sync across devices with `chrome.storage.sync`
- [ ] Dark mode toggle
- [ ] Prompt search and filtering
- [ ] Chrome Web Store publication

## License

See LICENSE file.
