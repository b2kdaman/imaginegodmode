# grkgoondl

Grok Media Post Fetcher + Downloader + Upscaler - Tampermonkey Userscript

A Tampermonkey userscript for fetching, downloading, and upscaling media posts from Grok.com.

## Features

- Fetch media post data from Grok.com
- Download media files (images/videos)
- Upscale videos to HD quality
- Modern pill-style UI
- Real-time status updates
- HD-aware video detection
- Automatic refetch during upscale operations

## Project Structure

The project is organized into modular ES6 modules:

```
src/
├── userscript-header.js  # Tampermonkey header metadata
├── main.js               # Main entry point
├── utils.js              # Utility functions
├── api.js                # API calls to Grok
├── download.js           # Download functionality
├── state.js              # State management
├── ui.js                 # UI components and rendering
├── mediaProcessor.js     # Media data processing
├── core.js               # Core business logic
├── handlers.js           # Event handlers
└── urlWatcher.js         # URL change detection
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the userscript:
   ```bash
   npm run build
   ```

3. Install the built script from `dist/grokgoondl.user.js`:
   - Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
   - Open Tampermonkey dashboard
   - Click "Create a new script"
   - Copy and paste the contents of `dist/grokgoondl.user.js`
   - Save the script

## Development

### Working with Modules

The source code is split into separate ES6 modules in the `src/` directory. Edit the modules directly:

- `src/utils.js` - Utility functions
- `src/api.js` - API functions
- `src/download.js` - Download logic
- `src/state.js` - State management
- `src/ui.js` - UI components
- `src/mediaProcessor.js` - Media processing
- `src/core.js` - Core business logic
- `src/handlers.js` - Event handlers
- `src/urlWatcher.js` - URL watching
- `src/main.js` - Entry point

### Building

To build a bundled and minified version from the modules:

```bash
npm run build
```

This will:
1. Bundle all ES6 modules using esbuild
2. Minify the code with terser
3. Preserve the Tampermonkey header
4. Output to `dist/grokgoondl.user.js`

The built file (`dist/grokgoondl.user.js`) is ready to install in Tampermonkey.

## Usage

1. Navigate to a Grok.com post page: `https://grok.com/imagine/post/*`
2. The script will automatically inject a pill UI in the bottom-right corner
3. Click "Fetch" to fetch media data
4. Click "Download" to download all media files
5. Click "Upscale" to upscale videos to HD quality
6. Click "⋯" to toggle details view

## Script Details

- **Version:** 1.6
- **Compatible with:** Tampermonkey, Greasemonkey
- **Requires:** `GM_download` permission (falls back to standard download if unavailable)
- **Target pages:** `https://grok.com/imagine/post/*` and `https://www.grok.com/imagine/post/*`

## License

See LICENSE file for details.
