# grkgoondl

Grok Media Post Fetcher + Downloader + Upscaler - Tampermonkey Userscript

A Tampermonkey userscript for fetching, downloading, and upscaling media posts from Grok.com.

## Features

- Fetch media post data from Grok.com
- Download media files (images/videos)
- Upscale videos to HD quality
- Modern pill-style UI with text note management
- Real-time status updates
- HD-aware video detection
- Automatic refetch during upscale operations
- Text notes with localStorage persistence and navigation

## Project Structure

The project is organized into modular ES6 modules:

```
src/
├── userscript-header.js  # Tampermonkey header metadata
├── main.js               # Main entry point
├── constants/
│   └── constants.js      # UI constants and configuration
├── api/
│   └── api.js            # API calls to Grok
├── core/
│   ├── core.js           # Core business logic
│   ├── handlers.js       # Event handlers
│   ├── mediaProcessor.js # Media data processing
│   └── state.js          # State management
├── download/
│   └── download.js       # Download functionality
├── lib/
│   └── utils.js          # Utility functions
├── ui/
│   └── ui.js             # UI components and rendering
└── watchers/
    └── urlWatcher.js     # URL change detection
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

- `src/main.js` - Entry point
- `src/constants/constants.js` - UI constants and configuration
- `src/api/api.js` - API functions
- `src/core/core.js` - Core business logic
- `src/core/handlers.js` - Event handlers
- `src/core/mediaProcessor.js` - Media processing
- `src/core/state.js` - State management
- `src/download/download.js` - Download logic
- `src/lib/utils.js` - Utility functions
- `src/ui/ui.js` - UI components with text note management
- `src/watchers/urlWatcher.js` - URL watching

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

### Text Notes
- **Text area**: Enter and save notes (stored in localStorage)
- **Prev/Next**: Navigate between saved text entries
- **Add**: Create a new text entry (requires current text to be non-empty)
- **Remove**: Delete current text entry
- **Copy**: Copy current text to clipboard

### Media Operations
- **Fetch**: Fetch media data from the current post
- **Download**: Download all media files
- **Upscale**: Upscale videos to HD quality
- **⋯**: Toggle details view

## Script Details

- **Version:** 1.6
- **Compatible with:** Tampermonkey, Greasemonkey
- **Requires:** `GM_download` permission (falls back to standard download if unavailable)
- **Target pages:** `https://grok.com/imagine/post/*` and `https://www.grok.com/imagine/post/*`

## License

See LICENSE file for details.
