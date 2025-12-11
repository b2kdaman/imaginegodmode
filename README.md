# ImagineGodMode

A multi-platform application for Grok media management built with React, TypeScript, and Tailwind CSS.

- **Chrome Extension**: Full-featured extension for Chrome/Edge browsers with all features
- **iOS App**: Native iOS wrapper using WKWebView with extension functionality

## Features

- **Analytics**: Comprehensive Google Analytics 4 integration for anonymous usage tracking (always enabled, see [PRIVACY.md](PRIVACY.md))
  - Modal lifecycle tracking (open/close for all modals)
  - Prompt interaction tracking (navigation, clipboard copy, to/from page actions)
  - Bulk operation analytics (select all, deselect all, confirmations with counts)
  - Video player control tracking (play/pause, fullscreen via button or keyboard)
  - Keyboard shortcut usage tracking (F, Space, Ctrl+Enter combinations)
- **Prompt Management**: Save, organize, and manage prompts with packs
- **Per-Post State**: Each post remembers its own selected pack, prompt, and prefix independently (optional, controlled via Settings)
- **Prompt Prefix**: Per-post prefix text that automatically prepends to prompts when making videos (stored separately for each post)
- **Star Ratings**: Rate your prompts with 1-5 stars (Material Design Icons)
- **Pack System**: Create custom packs to organize prompts with confirmation dialog for deletion and text truncation
- **Packs Management Modal**: Comprehensive pack and prompt management interface
  - **Split-Panel Design**: Left panel for packs (33%), right panel for prompts (67%)
  - **Drag & Drop Reordering**: Reorder packs and prompts within the same pack with visual feedback
  - **Pack Operations**: Create, rename, delete packs with inline editing
    - Inline rename with save/cancel buttons
    - Automatic pack creation when all packs deleted (creates "Default")
    - Smart pack switching after deletion to first available pack
  - **Prompt Operations**: Full CRUD operations for prompts
    - Edit prompt text in textarea with save/cancel buttons
    - Add new prompts directly to current pack
    - Duplicate prompts with single click
    - Delete prompts without "last prompt" restriction
  - **Individual Deletion**: Delete single prompts or packs with confirmation modals
  - **Selection Mode for Prompts**: Toggle selection mode to select multiple prompts with checkboxes
    - Click anywhere on prompt to select/deselect
    - Select All / Deselect All controls
    - Batch delete multiple prompts at once
    - Batch move selected prompts to another pack via dropdown
    - Selected count displayed in header
  - **Selection Mode for Packs**: Toggle selection mode to select multiple packs with checkboxes
    - Click anywhere on pack to select/deselect
    - Select All / Deselect All controls
    - Batch delete multiple packs with confirmation dialog
    - Selected count displayed in header
  - **Smart Prompt Counting**: Displays actual non-empty prompt count in pack badges
  - **Empty State Handling**: Shows all prompts including empty ones for easy management
  - **Drop Notifications**: Toast-style notifications at top with slide-in/fade-out animations
  - **Visual Feedback**: Drag-over highlighting with theme-aware colors, green highlight for selected items
  - **Pack Transfer**: Drag prompts between packs to reorganize content
  - **AI Pack Generation**: Copy Grok system prompt for generating themed prompt packs
- **Global Search**: Type-ahead search across all packs with instant results
  - Search button with magnifying glass icon
  - Real-time search results with prompt preview
  - Display pack name, prompt number, and star ratings
  - Click to navigate directly to any prompt
- **Import/Export**: Flexible pack management with multi-format support
  - **Multi-Select Export**: Choose specific packs to export with checkbox interface
  - **Select All/Deselect All**: Quick selection controls for batch operations
  - **Smart Export Format**: Single pack → v1.0 format, Multiple packs → v2.0 format
  - **Minified JSON**: Compact file sizes with base64 encoding in .pak files
  - **Backward Compatible Import**: Supports both v1.0 (single) and v2.0 (multi-pack) formats
  - **Visual Validation**: Real-time JSON validation with format detection and pack counts
  - **Theme-Aware UI**: Export button with accent color hover states
  - **Merge or Replace Modes**: Import new packs or overwrite existing ones
- **Media Downloading**: Download images and videos from Grok posts (disabled until all videos are HD)
- **Auto Download**: Optional setting to automatically download all media after upscaling completes
- **Video Upscaling**: Parallel upscale requests with staggered start times for optimal performance
- **Upscale Queue**: Global queue system for batch processing videos across posts
  - Processes 15 videos at a time per batch
  - Auto-downloads completed batch before starting next
  - Persists across post navigation
  - Dedicated Queue View tab with icon-only badge showing pending/processing count
  - Full queue management interface with progress tracking, stats, and controls
- **Bulk Operations**: Batch process multiple posts with visual selection interface
  - **Upscale All Liked**: Select from liked posts to upscale videos in bulk
  - **Unlike Multiple Posts**: Manage liked posts with bulk unlike functionality
  - **Delete Multiple Posts**: Permanently delete multiple posts with confirmation dialog
  - **Unliked Archive**: View and re-like previously unliked posts from local storage archive (per-user with automatic migration)
  - Large modal interface (90vw × 85vh) with 5-column grid layout
  - Heart/broken heart indicators for intuitive like/unlike selection
  - Click anywhere on item to toggle selection (no navigation)
  - Shift-click for batch selection/deselection (standard multi-select behavior)
  - Reusable shared components for consistent UX across all bulk operation modals
  - Real-time progress bar with 0.5-1 second delays between API calls
  - Visual progress updates with smooth animations
  - Automatic redirect to /favorites after bulk operations
  - Local storage of unliked posts with minimal metadata (ID, prompt, thumbnail, timestamp)
- **Post Navigation**: Quick navigation between posts in your favorites list
  - Previous/Next buttons in Prompt view for seamless browsing
  - Automatically loads liked posts on mount for instant navigation
  - Buttons disabled when no previous/next post available
  - Uses posts from favorites or fetched posts from bulk operations
- **Make + Next**: Workflow automation for batch processing posts
  - Applies current prompt, clicks Make button, and automatically navigates to next post
  - Full-width button in Prompt view for easy access
  - Disabled when no next post available
  - Uses fetched posts from "Upscale All Liked" or "Show Unliked"
  - 1-second delay between Make and navigation for proper execution
  - **Auto Mode**: Toggle button to automatically repeat Make + Next workflow
    - Icon button with visual active state (slate background, dark icon)
    - Random 1-1.5 second delay between iterations
    - Automatically stops when reaching the end of the post list
    - Toggle off anytime to stop automation
- **Video Progress Tracking**: Real-time progress bar and button glow during video generation
- **HD Status Indicator**: Green check icon appears when all videos are HD quality
- **Video Controls**: Play/pause button with synchronized state tracking
- **Fullscreen Video Player**: Intelligent fullscreen button that detects visible video (HD or SD)
- **Internationalization (i18n)**: Multi-language support with live language switching
  - English, Spanish, and Russian translations
  - Persistent language preference
  - All UI elements translated including tooltips, buttons, and modals
- **Theme Customization**: Choose from 7 themes (Dark, Light, Dracula, Winamp, LimeWire, Steam, Discord) with full UI color adaptation
- **Configurable Themes**: Themes loaded from JSON file for easy customization
- **UI Scaling**: Adjust panel size from Tiny (70%) to Large (115%)
- **Visual Settings**: Settings labels enhanced with Material Design Icons for better UX
- **Simple Shortcut Setting**: Optional setting to use `Ctrl/Cmd + Enter` instead of `Ctrl/Cmd + Shift + Enter` for applying prompts
- **Hide Unsave Button**: Optional setting to hide the "Unsave" button from the Grok page interface (off by default)
- **Sound Effects Control**: Optional setting to enable/disable UI sound effects (on by default) - controls cyberpunk-style audio feedback for purge modal interactions
- **Confirm Copy From**: Optional setting to show confirmation dialog when copying from page would replace existing prompt text (on by default)
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + Shift + Enter`: Apply current prompt with prefix and click "Make a Video" (default)
  - `Ctrl/Cmd + Enter`: Apply current prompt with prefix and click "Make a Video" (when Simple Shortcut enabled)
  - `Left Arrow`: Navigate to previous video
  - `Right Arrow`: Navigate to next video
  - `F`: Toggle fullscreen (works globally, even without extension panel open)
  - `Space`: Play/pause video (works globally, even without extension panel open)
- **Arrow Key Navigation**: Navigate videos with Left/Right arrow keys
- **Automatic Data Refetch**: Automatically refetches post data when navigating between posts
- **Persistent Storage**: All data saved with `chrome.storage.local` (prompts) and `localStorage` (settings, currentView)
- **Extension Context Validation**: Graceful handling of extension reloads with proper error suppression
- **Persistent View State**: Remembers last opened tab (Prompt/Ops/Settings/Help) across sessions
- **Modern UI**: Bottom-placed tabs with icon-only queue tab, pill-shaped buttons, Material Design Icons, dynamic theming, glassmorphism design with frosted glass effects
- **Glassmorphism Design**: Semi-transparent UI elements with backdrop blur creating modern frosted glass aesthetic
  - Main panel and buttons: 67% opacity + 12px blur
  - All modals: 67% opacity + 16px blur
  - Consistent glass effect across entire extension UI
  - Cross-browser compatibility with WebkitBackdropFilter support
- **Glow Animation Effects**: Interactive hover effects with light sweep animations
  - Universal glow hook for reusable animations across components
  - Multi-item glow support for tabs, dropdowns, and lists
  - Configurable animation duration, intensity, and effects
  - Theme-aware glow colors matching UI theme
  - Scale animation disabled on buttons for cleaner interactions
- **The Pit (Video Generation)**: Automated video generation with batch processing **(Under Construction)**
  - Select source post from liked posts with image preview
  - Navigate through liked posts with prev/next controls
  - Manual prompt mode or pack-based prompt selection
  - Configurable number of generation attempts (1-10 tries)
  - Stop on first success toggle for early termination
  - Real-time progress tracking (succeeded/failed counts)
  - Automatic moderation detection treats moderated videos as failures
  - Sequential execution - waits for each video to complete before starting next
  - Streaming progress monitoring - tracks generation progress to 100%
  - Staggered API calls with 1-2 second delays to avoid rate limiting
  - 403 error detection with immediate stop and user notification
  - Dynamic request headers (unique UUID and Statsig IDs per request)
  - Loads all liked posts automatically for easy post selection
- **Spin Feature**: Batch process list items (from userscript version)

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety with strict mode
- **Zustand** - Lightweight state management (settings, media, posts, modals)
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **CRXJS** - Vite plugin for Chrome extensions
- **Chrome Manifest V3** - Latest extension API
- **Google Analytics 4** - Anonymous usage analytics via Measurement Protocol

## Architecture

### Modal System
The extension features a modern, scalable modal architecture:
- **Centralized State**: Zustand-based modal store for optimal performance
- **Reusable Components**: GridSelectionModal base for all bulk operation modals
- **Composition Utilities**: Shared footer buttons, warning banners, and validation displays
- **Focus Management**: Custom hooks for accessibility (focus trapping, animations)
- **Type Safety**: Comprehensive TypeScript definitions for all modal patterns
- **Code Reduction**: DeleteModal refactored from 387 to 124 lines (67% reduction)

### Key Components
- **GridSelectionModal**: Base component for Delete, Unlike, Upscale, and Archive modals
- **PacksManagementModal**: Full-featured pack and prompt management with drag & drop
- **useShiftSelection**: Custom hook providing shift-click multi-selection behavior
- **ModalFooterButtons**: Three reusable footer patterns (Confirm, Action, BulkAction)
- **WarningBanner**: Themed warning/info banners for modal alerts
- **ValidationDisplay**: Form validation with success/error states

## Installation

### Chrome Extension (Development Mode)

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

### iOS App

For iOS app setup instructions, see [ios/README.md](ios/README.md).

**Quick start**:
```bash
# Build extension assets for iOS
./scripts/build-ios.sh

# Open in Xcode
open ios/imagineGodMode/imagineGodMode.xcodeproj
```

**Features**:
- Full extension functionality in native iOS app
- WKWebView-based wrapper loading grok.com
- Chrome Storage bridge using UserDefaults
- Photo library download support
- Back/forward navigation and refresh controls

### Usage

1. Navigate to Grok Imagine: `https://grok.com/imagine` or any post: `https://grok.com/imagine/post/*`
2. The extension UI will appear in the bottom-right corner with smooth expand/collapse animations
3. Click the expand button to open the panel
4. Switch between "Prompt", "Ops", "Settings", "Help", and "Queue" tabs (bottom navigation with smooth transitions)
5. **Prompt View**: Manage and organize your prompts
   - Each post remembers its own pack selection and prompt position
   - Prefix input: Add prefix text that automatically prepends to prompts (with comma) when pressing Make
   - Prefix, pack, and prompt index are stored per-post and persist across sessions
   - Search prompts: Click magnifying glass icon to search across all packs
   - Rate prompts with stars
   - Navigate with arrow buttons or keyboard
   - Copy and play prompts
   - **Make + Next**: Automatically apply prompt, make video, and navigate to next post (requires fetched posts)
6. **Ops View**: Automatically fetches post data when opened
   - Primary action: Upscale videos (parallel processing with staggered starts)
   - Secondary action: Download media (enabled only when all videos are HD)
   - Real-time status updates and progress tracking
   - Green check icon appears when all videos are HD quality
   - **Upscale All Liked**: Bulk upscale videos from multiple liked posts
     - Opens large modal (90vw × 85vh) with 5-column image grid
     - All posts selected by default, click to toggle selection
     - Centered checkbox indicator for clear visual feedback
     - Click anywhere on item to toggle (no navigation on click)
     - Shift-click for batch selection/deselection
     - Processes selected posts and adds videos to upscale queue
   - **Unlike Multiple Posts**: Manage liked posts with bulk unlike
     - Opens large modal with 5-column grid of liked posts
     - Centered heart/broken heart indicators for intuitive selection
     - Click anywhere on item to toggle (no navigation on click)
     - Shift-click for batch selection/deselection
     - Real-time progress bar during bulk unlike operation
     - Automatic redirect to /favorites after completion
     - Automatically saves unliked posts to archive
     - 0.5-1 second delays between API calls for faster processing
   - **Delete Multiple Posts**: Permanently delete posts with safety confirmation
     - Opens large modal with 5-column grid layout
     - Centered delete icon indicator when selected
     - Click anywhere on item to toggle selection
     - Shift-click for batch selection/deselection
     - Warning banner: "Deleting posts is permanent and cannot be undone!"
     - Two-step confirmation: select posts → confirm deletion dialog
     - Real-time progress tracking during deletion
   - **Unliked Archive**: Browse and restore previously unliked posts
     - Opens archive modal showing all unliked posts with timestamps
     - Re-like multiple posts at once to restore them to favorites
     - Automatically removes from archive after successful re-like
     - Local storage with minimal data (no network required to browse)
7. **Settings View**: Customize your experience
   - Choose theme: Dark, Light, Dracula, Winamp, LimeWire, Steam, or Discord
   - Themes are configurable via `public/themes.json`
   - Adjust UI size: Tiny to Large
   - Select language: English, Spanish (Español), or Russian (Русский)
   - Enable Auto Download to automatically download media after upscaling
   - Toggle Remember Pack Per Post to control per-post state persistence (enabled by default)
   - Toggle Simple Shortcut to use Ctrl/Cmd+Enter instead of Ctrl/Cmd+Shift+Enter for applying prompts
   - Toggle Hide Unsave to hide the "Unsave" button from the page (off by default)
   - Toggle Enable Sound to control UI sound effects (on by default) - affects purge modal audio feedback
   - Toggle Confirm Copy From to show confirmation when replacing existing prompt text (on by default)
   - All settings labels include visual icons for easy identification
   - **Tooltips**: Hover over any setting row for detailed explanations
   - **Data Management**:
     - Export packs: Select any pack to export to .pak file (base64 encoded for backup/sharing)
     - Import packs: Upload .pak/.json files or paste raw JSON with real-time validation
     - Import modes: Add (create new) or Replace (overwrite existing)
     - Copy Grok prompt: System prompt for generating custom packs via AI
   - **Purge All Data**: Nuclear option to reset all data (5-click activation with arrow key challenge)
     - Unlikes all liked posts
     - Clears unliked archive
     - Deletes all prompt packs
     - Interactive arrow key sequence for safety with timed countdown
     - Real-time progress tracking for each purge step (pending → in progress → completed)
     - Visual status indicators with color-coded icons and animations
     - 2-second completion display before final confirmation
     - Cyberpunk-themed UI with animations and sound effects
8. **Help View**: Comprehensive feature documentation
   - Complete list of all extension features with descriptions
   - Interactive tooltips on hover for detailed explanations
   - Keyboard shortcuts reference with visual key indicators
   - About section with version and credits
   - Multi-language support for all help content
9. **Queue View**: Dedicated upscale queue management interface
   - Real-time progress tracking for current batch
   - Queue statistics (pending, processing, completed, failed counts)
   - Visual queue list showing up to 20 items with status indicators
   - Queue controls: Resume/Pause processing, Clear completed, Clear all
   - Icon-only tab with badge showing active queue count
   - Empty state message when queue is empty
10. **The Pit View**: Automated video generation from images **(Under Construction)**
   - **Post Selection**: Navigate through liked posts with image preview
     - Automatically loads all liked posts on view open
     - Prev/Next buttons to browse through posts
     - Shows current post index and total count
     - Thumbnail preview with loading state
   - **Prompt Configuration**:
     - Manual mode: Free-form text input for custom prompts
     - Pack mode: Select from existing prompt packs and navigate prompts
     - Pack dropdown with all available prompt packs
     - Prompt navigation with prev/next controls
   - **Generation Settings**:
     - Tries: Configure number of generation attempts (1-10)
     - Stop on First Success: Toggle to stop after first successful generation
   - **Churning (Batch Generation)** - Currently disabled during development:
     - Sequential execution ensures videos generate one at a time
     - Streaming response reader waits for 100% completion before proceeding
     - Real-time progress display showing current attempt number
     - Live success/failure counters with color coding (green/red)
     - Automatic moderation detection: Moderated videos counted as failures
     - 403 error handling with immediate stop and error message display
     - Dynamic request headers generated per request for API compliance
     - 1-2 second delays between requests to prevent rate limiting
11. **Video Controls**: Use the play/pause button or press Space to control video playback
12. **Fullscreen**: Click the fullscreen button or press F to enter fullscreen mode

## Project Structure

```
grkgoondl/
├── src/
│   ├── api/              # API layer for Grok endpoints
│   ├── background/       # Background service worker
│   ├── components/       # React components (organized by type)
│   │   ├── buttons/      # Button components (FullscreenButton, PauseButton)
│   │   ├── common/       # Shared components (Icon, NoPostMessage, UpscaleQueueIndicator)
│   │   ├── inputs/       # Input components (Button, RatingSystem, Tabs)
│   │   ├── modals/       # Modal components (Upscale, Unlike, UnlikedArchive, Import, etc.)
│   │   ├── views/        # Main view components (Prompt, Ops, Settings, Help, Queue)
│   │   ├── MainPanel.tsx # Main panel container with expand/collapse animations
│   │   └── PackManager.tsx # Pack management component
│   ├── constants/        # Constants and configuration
│   ├── content/          # Content script (injection point)
│   ├── contexts/         # React contexts (i18n)
│   ├── hooks/            # Custom React hooks (bulk operations, loaders, glow animations)
│   ├── locales/          # Translation files (en.json, es.json, ru.json)
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and helpers
│   ├── App.tsx           # Main app component
│   └── index.css         # Global styles (Tailwind)
├── ios/                  # iOS app implementation
│   ├── README.md         # iOS-specific documentation
│   ├── XCODE_SETUP.md    # Xcode setup instructions
│   └── imagineGodMode/   # Xcode project
│       └── imagineGodMode/
│           ├── WebView.swift              # WKWebView container
│           ├── ChromeStorageBridge.swift  # Chrome API bridge
│           ├── DownloadManager.swift      # Photo library integration
│           ├── StorageManager.swift       # App lifecycle handling
│           ├── ContentView.swift          # Main view
│           ├── imagineGodModeApp.swift   # App entry point
│           └── extension/                 # Built extension assets
├── public/               # Static assets (icons, themes.json)
├── scripts/              # Build scripts
│   └── build-ios.sh      # iOS build script
├── dist/                 # Build output (load this in Chrome)
├── archive/              # Archived Tampermonkey userscript
├── manifest.json         # Extension manifest
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## Key Components

### Stores (Zustand)

- **usePromptStore**: Manages prompts, packs, ratings, and import/export operations
- **useMediaStore**: Handles media URLs, upscaling, and status
- **useUIStore**: Controls UI state (expanded/collapsed, view mode)
- **useSettingsStore**: Manages theme, size, auto-download, remember-post-state, simple-shortcut, hide-unsave, enable-sound, and confirm-copy-from preferences with localStorage persistence
- **useUpscaleQueueStore**: Global upscale queue with batch processing (15 at a time), auto-download, and localStorage persistence
- **usePostsStore**: Manages fetched posts list and navigation helpers for "Make + Next" workflow
- **useUserStore**: Manages user ID from API with localStorage persistence and automatic initialization
- **usePitStore**: Manages The Pit state (selected post, manual mode, prompt, pack selection, tries, stop-on-first-success)

### Contexts

- **I18nContext**: Internationalization context providing translation functions and locale management
  - `useTranslation()` hook for accessing translations
  - Parameter interpolation support (e.g., `{{packName}}`)
  - Fallback to English for missing translations
  - Persistent language preference in localStorage

### Hooks

- **useKeyboardShortcuts**: Global keyboard shortcut handlers
- **useUrlWatcher**: Monitors URL changes, resets state, and triggers data refetch callback
- **useArrowKeyNavigation**: Arrow key navigation for video controls
- **useVideoProgress**: Real-time video generation progress tracking with polling
- **useBulkUnlike**: Custom hook for bulk unliking posts with progress tracking and archive saving
- **useBulkRelike**: Custom hook for bulk re-liking posts from archive with progress tracking
- **useBulkDelete**: Custom hook for bulk deleting posts with progress tracking and confirmation
- **useLikedPostsLoader**: Hook for loading and managing liked posts with loading state
- **useShiftSelection**: Reusable hook for shift-click multi-selection behavior across bulk operation modals
- **useGlowAnimation**: Universal glow animation hook for button hover effects with configurable settings
- **useMultiGlowAnimation**: Multi-item glow animation hook for tabs, dropdowns, and lists with individual tracking

### Components

**Views** (src/components/views/)
- **PromptView**: Prompt management interface with "Make + Next" workflow button
- **OpsView**: Media controls with queue-based upscaling, HD-gated downloads, bulk operations (Upscale All Liked, Unlike Multiple Posts, Delete Multiple Posts)
- **SettingsView**: Theme, size, language, auto-download, remember-post-state, simple-shortcut, hide-unsave, enable-sound, confirm-copy-from preferences, data management with import/export, and purge all data functionality
- **HelpView**: Help and documentation interface
- **QueueView**: Dedicated upscale queue management with progress tracking, stats, queue list, and controls
- **PitView**: Automated video generation interface with post selection, prompt configuration, generation settings, real-time progress tracking, and moderation detection

**Modals** (src/components/modals/)
- **BaseModal**: Reusable modal foundation with animations, high z-index, portal rendering, and flexible configuration
- **UpscaleAllModal**: Large modal (90vw × 85vh) with 5-column grid for bulk upscaling videos from liked posts
- **UnlikeModal**: Large modal with 5-column grid, heart/broken heart indicators, and bulk unlike functionality with auto-redirect and archive saving
- **DeleteModal**: Confirmation modal for bulk deleting posts with nested confirmation dialog for extra safety
- **UnlikedArchiveModal**: Archive browser for viewing and re-liking previously unliked posts with timestamps and progress tracking
- **PurgeModal**: Interactive modal with random arrow key sequence challenge, cyberpunk UI, animations, and Web Audio API sound effects
- **SearchModal**: Type-ahead search modal for finding prompts across all packs
- **PackSelectModal**: Modal for selecting which pack to export
- **ImportPackModal**: Modal for importing packs via paste or file upload with validation
- **ConfirmDeleteModal**: Confirmation dialog for pack deletion with warning message
- **ConfirmModal**: Generic confirmation modal with variant support (danger/warning/info) for reusable confirmation dialogs

**Shared Modal Components** (src/components/modals/shared/)
- **ProgressBar**: Reusable progress bar component for bulk operations with animated loading indicator
- **SelectionControls**: Reusable select/deselect all buttons for consistent bulk selection UX
- **PostGrid**: Reusable grid component for displaying posts with selection state, hover effects, video count badges, and customizable overlays

All modals extend BaseModal for consistent animations, behavior, and appearance.

**Buttons** (src/components/buttons/)
- **PauseButton**: Play/pause control with synchronized video state tracking
- **FullscreenButton**: Intelligent fullscreen toggle with video detection

**Inputs** (src/components/inputs/)
- **Button**: Reusable button component with theme-aware styling, hover states, and glow animations
- **Dropdown**: Custom dropdown component with portal-based rendering for proper z-index stacking and glow animations
  - Theme-aware styling with hover effects and smooth transitions
  - Context-aware z-index (uses higher value when inside modals)
  - Portal rendering to dedicated container with fixed positioning
  - Dynamic position calculation with scroll and resize handling
  - Click-outside detection for seamless UX
  - Glow animation effects on hover for trigger and options
- **RatingSystem**: 5-star rating component with white icons and optional readonly mode
- **Tabs**: Tab navigation component with theme support, bottom placement, icon-only mode, badges, and glow animations
- **Toggle**: Reusable toggle switch component with theme-aware SUCCESS color for active state and glow animations on hover

**Common** (src/components/common/)
- **Icon**: Material Design Icons wrapper
- **NoPostMessage**: Reusable component displayed when no post ID is found in URL
- **UpscaleQueueIndicator**: Minimal queue status button with expandable panel showing progress, stats, and queue items

**Root** (src/components/)
- **MainPanel**: Floating panel container with pause, fullscreen, collapse buttons, version badge, smooth expand/collapse animations, and tab transition effects
- **PackManager**: Pack dropdown with search button, text truncation, and CRUD operations

## Architecture

### Content Script
Injects the React app into Grok pages at `document_idle`.

### Background Service Worker
Handles:
- File downloads via `chrome.downloads.download()`
- Message passing between content script and background

**Note**: API calls (`fetchPost`, `upscaleVideo`) moved to content script for direct page context and cookie access. Background worker now only handles downloads which require `chrome.downloads` API.

### Message Passing
Uses `chrome.runtime.sendMessage()` for communication:
- `DOWNLOAD_MEDIA` - Download media files (background worker)

**Direct API calls** (content script with credentials):
- `fetchPost()` - Fetch post data from Grok API
- `upscaleVideo()` - Upscale video with authentication

### Storage
Uses multiple storage mechanisms with context validation:
- **chrome.storage.local**: Packs with prompts and ratings, prompt prefixes per-post, per-post state (selected pack and prompt index), unliked posts archive with minimal metadata per-user
- **localStorage**: Theme, size, language, auto-download preferences, user ID, and currentView (last opened tab) for instant loading
- **Extension Context Validation**: All storage operations check for valid extension context to gracefully handle extension reloads
- **Unliked Posts Archive**:
  - Per-user storage: Each Grok user ID has separate unliked posts
  - Automatic user ID detection from fetchLikedPosts API on extension init
  - Backward compatibility: Old format automatically migrated to current user
  - Stores minimal data (ID, prompt, thumbnail URL, media URL, timestamp, child post count) for efficient browsing and re-liking
  - Multi-account support: Switch between Grok accounts without data conflicts
- **Import/Export**:
  - Per-pack .pak export (base64 encoded) with timestamped filenames
  - Import via .pak/.json file upload or raw JSON paste with real-time validation
  - Automatic base64 decoding for .pak files, direct JSON parsing for .json files
  - Add/Replace modes with pack name conflict handling
  - Version tracking and comprehensive data validation
  - Interactive Grok prompt for AI-generated pack creation

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
- **Theme System**: Seven built-in themes (Dark, Light, Dracula, Winamp, LimeWire, Steam, Discord) with full color palette adaptation including theme-aware accent colors
- **Configurable Themes**: Themes loaded from `public/themes.json` for easy customization without code changes
- **Theme-Aware Accents**: Success indicators and toggle switches adapt to each theme's color scheme for consistent visual design
- **UI Scaling**: CSS transform-based scaling maintains crisp rendering at all sizes
- All buttons use pill shape with theme-aware styling and hover states
- Material Design Icons for professional appearance
- Tab-style navigation with bottom placement and theme-aware active states
- Fullscreen mode with proper CSS styling for video display
- Video progress polling every 500ms with auto-removal on completion
- Console initialization tag with styled branding using theme colors
- API architecture refactored: content script handles authenticated calls, background worker handles downloads
- Settings persist in localStorage for instant theme/size/language/auto-download/remember-post-state/simple-shortcut/hide-unsave/enable-sound/confirm-copy-from application on load
- **Hide Unsave Feature**: Dynamic CSS injection to hide Unsave button when enabled
  - Uses `useEffect` hook to inject/remove style element
  - CSS selector targets `button[aria-label="Unsave"]`
  - Cleanup on unmount and setting toggle
- **Internationalization**: Complete i18n infrastructure with English, Spanish, and Russian translations
- **Tooltip System**: Enhanced global tooltip system with consistent styling
  - Smaller text size (`text-xs`) for better readability
  - Max width of 20rem with automatic text wrapping
  - Whole-row hover areas in Settings and Help views
  - Detailed explanations for all features and settings
  - Multi-language tooltip support across all three languages
  - Live language switching without reload
  - Translation context with parameter interpolation
  - Fallback mechanism for missing keys
  - All UI elements fully translated (buttons, labels, tooltips, modals)
- **Visual Enhancement**: Settings labels enhanced with Material Design Icons (palette, resize, translate, download, database, swap)
- **Upscale Queue System**: Global queue processes videos in batches of 15
  - Batch processing with staggered delays to avoid rate limiting
  - Auto-downloads completed batch (max 15 files) before starting next
  - Queue persists to localStorage across navigation
  - Visual indicator with pulsing badge when processing
  - Expandable panel with progress bar, stats, and queue management
- **Download Protection**: Download button disabled until all videos are HD quality
- **Auto Download**: Queue automatically downloads each completed batch of upscaled videos
- **Remember Pack Per Post**: Optional toggle (enabled by default) to save/restore selected pack and prompt index per post
- **HD Status Visual**: Green check icon displays in Ops view when all videos are HD quality
- **Video State Sync**: Play/pause button automatically syncs with video element state via event listeners
- **Global Keyboard Shortcuts**: F (fullscreen) and Space (play/pause) work globally across the page, with fallbacks to direct video element control
- **Extension Reload Handling**: Storage operations validate extension context and fail gracefully during reloads
- **Smart URL Watching**: URL changes trigger automatic data refetch via callback pattern in OpsView component
- **Pack Import/Export**:
  - Per-pack exports with descriptive filenames (imaginegodmode-pack-Name-Date.pak)
  - Base64 encoded .pak files for secure storage and sharing
  - PackSelectModal for choosing which pack to export
  - ImportPackModal with paste/upload options supporting .pak and .json files
  - Automatic base64 decoding for .pak files, raw JSON paste support
  - Real-time validation showing pack name, prompt count, and error details
  - Add mode prevents overwriting, Replace mode allows updates
  - Grok AI integration: Copy system prompt to generate custom packs via conversation
- **Analytics**: Google Analytics 4 (GA4) integration for anonymous usage tracking
  - Mandatory analytics (no opt-out) - see [PRIVACY.md](PRIVACY.md)
  - Anonymous client IDs using UUID v4
  - Session tracking with 30-minute timeout
  - Comprehensive event tracking:
    - Feature usage, prompt/pack actions, media operations, settings changes
    - Modal lifecycle events (open/close for all modals: upscale, unlike, archive, search, delete, import/export)
    - Prompt interactions (navigation, clipboard copy, to/from page, Make+Next)
    - Bulk operations (select/deselect all, confirmations with item counts, completion metrics)
    - Video controls (play/pause, fullscreen) with method tracking (button vs keyboard)
    - Keyboard shortcut usage (F, Space, Ctrl+Enter, Ctrl+Shift+Enter)
  - No personal data, prompt content, or identifying information collected
  - Uses GA4 Measurement Protocol (no script loading)
- **Modal System**: Unified modal architecture with BaseModal component
  - Smooth fade-in and slide-in animations (0.2s/0.3s)
  - Portal rendering to document.body for proper stacking
  - Modals persist when extension panel is collapsed (no state loss)
  - Consistent behavior: overlay click, close button, keyboard shortcuts
  - Flexible sizing: configurable width, height, padding, overlay opacity
  - Optional footer for action buttons with theme-aware styling
  - DRY principle reduces code duplication across 7+ modals (~250 lines saved)
- **Z-Index Management**: Centralized layering system for predictable element stacking
  - Hierarchical constants defined in `constants.ts` (10000-10600 range)
  - Main panel (10000) → Video progress (10100) → Dropdown (10200) → Tooltip (10300) → Modal (10400) → Modal dropdown (10500) → Modal tooltip (10600)
  - Context-aware dropdowns automatically use higher z-index when rendered inside modals
  - Portal-based rendering with fixed positioning for reliable overlay behavior
  - Prevents z-index conflicts and ensures proper layering across all UI elements
- **Loading Indicators**: Animated spinner icons for all loading states
  - Material Design Icons rotating spinner (mdiLoading) replaces static "..." text
  - Tailwind's animate-spin for smooth rotation animation
  - Consistent across all components: buttons, modals, progress bars, queue indicator
  - Button component supports iconClassName prop for animation classes
  - Dynamic icon switching in loading states for better visual feedback
- **Web Audio API Integration**: Procedural sound generation for UI feedback
  - Cyberpunk-style aggressive sound design for purge modal
  - Frequency sweeps and square wave synthesis
  - No external audio files required (all sounds generated in-browser)
  - Success melody with C major progression and harmonic layers
  - Error sounds with harsh downward frequency sweeps
  - Sound effects can be toggled on/off via Settings (enabled by default)
  - Settings preference checked before playing any sound
- **Glassmorphism UI**: Modern frosted glass design throughout the extension
  - Semi-transparent backgrounds with backdrop blur on all UI elements
  - Main panel, buttons, and controls: 67% opacity (`aa` suffix) + 12px blur
  - All modals: 67% opacity + 16px blur for deeper glass effect
  - Cross-browser support with both `backdropFilter` and `WebkitBackdropFilter`
  - Hover states maintain transparency for consistent glass aesthetic
  - Flexbox gap-based spacing in modals for cleaner layout (gap-2 = 8px)
  - Compact modal padding (p-3 = 12px) for modern, space-efficient design
- **Component Refactoring**: Modular architecture for bulk operation modals
  - Shared components eliminate code duplication across UnlikeModal, UnlikedArchiveModal, and UpscaleAllModal
  - PostGrid component handles all grid rendering logic with customizable overlays and badges
  - ProgressBar component provides consistent progress tracking UI
  - SelectionControls component standardizes select/deselect all buttons
  - useShiftSelection hook encapsulates shift-click selection logic
  - Reduced ~400+ lines of duplicate code with reusable abstractions
- **Animation System**: Smooth transitions and effects throughout the UI
  - Panel expand/collapse with scale and fade animations
  - Tab switching with slide transitions
  - Glow effects on button and dropdown hovers
  - Progress bar animations with smooth loading indicators
  - Configurable animation hooks for reusability
- **The Pit Improvements**: Enhanced video generation API reliability
  - Sequential execution prevents parallel API calls
  - Streaming response reader monitors progress to 100% completion
  - UUID v4 generation for `x-xai-request-id` header (unique per request)
  - Base64-like random string generation for `x-statsig-id` header (88 chars)
  - 403 error detection stops churning immediately with user-friendly error display
  - Removed debug console.log statements from PostsStore for cleaner logs

## Theme Customization

Themes are fully customizable via the `public/themes.json` configuration file.

### Available Themes

- **Dark**: Classic dark theme with neutral grays
- **Light**: Clean light theme with white backgrounds
- **Dracula**: Popular Dracula color scheme with purple/pink accents
- **Winamp**: Retro Winamp-inspired theme with teal backgrounds and green LED text
- **LimeWire**: Nostalgic P2P aesthetic with signature lime green on black
- **Steam**: Valve's iconic dark blue slate with light blue accents
- **Discord**: Authentic Discord dark theme with signature blurple accents

### Creating Custom Themes

1. Edit `public/themes.json`
2. Add or modify theme entries with required color properties
3. Update `src/store/useSettingsStore.ts` to add theme name to `Theme` type
4. Update `src/components/SettingsView.tsx` dropdown options
5. Rebuild: `npm run build`

See `public/THEMES_README.md` for detailed theme customization guide.

## Commands

### Extension Commands
```bash
npm install             # Install dependencies
npm run build           # Build extension for production
npm run build:zip       # Build and create zip for Chrome Web Store
npm run zip             # Create zip from existing dist folder
npm run dev             # Development mode with hot reload
npm run type-check      # TypeScript type checking
npm run generate-icons  # Regenerate extension icons
npm run process-bg      # Process background images with theme-specific color tints
```

### iOS Commands
```bash
npm run ios:build       # Build extension assets and copy to iOS app
npm run ios:open        # Open Xcode project
npm run ios:deploy      # Build + open Xcode (recommended workflow)
npm run ios:simulator   # Build and run in iPhone 15 simulator
npm run ios:clean       # Clean Xcode build artifacts
```

Or use the shell script directly:
```bash
./scripts/build-ios.sh  # Build extension assets and copy to iOS app
```

## Future Enhancements

- [ ] Spin automation (batch process list items)
- [x] Fullscreen video player support
- [x] Video progress tracking
- [x] Theme customization (Dark, Light, Dracula, Winamp, LimeWire, Steam, Discord)
- [x] Configurable themes via JSON
- [x] UI scaling (Tiny to Large)
- [x] Export/import packs (JSON format with merge/replace modes)
- [x] Internationalization (English and Spanish)
- [x] Visual icon enhancements for settings
- [x] Prompt search and filtering (type-ahead search across all packs)
- [x] "Make + Next" workflow automation for batch processing posts
- [ ] Advanced search filters (by rating, date)
- [ ] Search keyboard shortcuts (Ctrl/Cmd+F)
- [ ] Additional language translations (French, German, Portuguese, etc.)
- [ ] Sync across devices with `chrome.storage.sync`
- [ ] Chrome Web Store publication

## License

See LICENSE file.
