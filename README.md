# grokGoonify

grokGoonify - Grok Media Post Fetcher + Downloader + Upscaler - Tampermonkey Userscript

A Tampermonkey userscript for fetching, downloading, and upscaling media posts from Grok.com, with text note management.

## Features

- Fetch media post data from Grok.com
- Download media files (images/videos)
- Upscale videos to HD quality
- Modern pill-style UI with text note management
- Real-time status updates
- HD-aware video detection
- Automatic refetch during upscale operations
- Text notes with localStorage persistence and navigation
- Category system for organizing prompts
- 5-star rating system for prompts
- Fullscreen video player support (HD/SD)
- One-click play button (copy prompt and make video)
- Spin feature to batch process list items

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

3. Install the built script from `dist/grokgoonify.user.js`:
   - Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
   - Open Tampermonkey dashboard
   - Click "Create a new script"
   - Copy and paste the contents of `dist/grokgoonify.user.js`
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
4. Output to `dist/grokgoonify.user.js`
5. Copy the built file to your clipboard

The built file (`dist/grokgoonify.user.js`) is ready to install in Tampermonkey.

## Usage

1. Navigate to a Grok.com post page: `https://grok.com/imagine/post/*`
2. The script will automatically inject a pill UI in the bottom-right corner

### Categories & Organization
- **Category dropdown**: Select and switch between different prompt categories
- **+ button**: Add a new category
- **− button**: Delete current category (double-click to confirm)
- **Star rating**: Rate prompts from 0-5 stars

### Text Prompts
- **Text area**: Enter and save prompts (stored in localStorage)
- **Prev/Next**: Navigate between saved prompts in current category
- **Add**: Create a new prompt entry (requires current text to be non-empty)
- **Remove**: Delete current prompt entry
- **▶ Play**: Copy current prompt to page and click "Make a Video" button
- **Ctrl+Enter / Cmd+Enter**: Keyboard shortcut to trigger the Play button
- **From/To**: Copy text from/to the page's video input field
- **Copy**: Copy current prompt to clipboard

### Media Operations
- **Prompt**: Show prompt/category view
- **Fetch**: Fetch media data from the current post
- **Download**: Download all media files
- **Upscale**: Upscale videos to HD quality

### Video Controls
- **Spin**: Batch process list items - click each, run, wait for completion, and repeat
- **⛶ Fullscreen**: Enter fullscreen mode for HD/SD video player

## Script Details

- **Version:** 1.5
- **Compatible with:** Tampermonkey, Greasemonkey
- **Requires:** `GM_download` permission (falls back to standard download if unavailable)
- **Target pages:** `https://grok.com/imagine/post/*` and `https://www.grok.com/imagine/post/*`

## License

See LICENSE file for details.
