# ImagineGodMode iOS App

iOS wrapper app for ImagineGodMode extension that loads grok.com in a WKWebView with full extension functionality.

## Architecture

- **WKWebView**: Loads grok.com with injected extension
- **Chrome Storage Bridge**: Mocks `chrome.storage.local` API using UserDefaults
- **Download Manager**: Intercepts downloads and saves to Photos library
- **JavaScript Polyfill**: Bridges JavaScript to native Swift APIs

## Prerequisites

- macOS with Xcode 15+ installed
- Node.js and npm (for building the extension)
- iOS 15+ device or simulator

## Setup Instructions

### 1. Build Extension Assets

From the project root, run:

```bash
./scripts/build-ios.sh
```

This will:
- Build the extension using `npm run build`
- Copy built assets to `ios/imagineGodMode/imagineGodMode/extension/`
- Rename files for easier reference

**Built assets:**
- `content-script.js` (369KB) - Main React app bundle
- `content-script.css` (19KB) - Tailwind CSS styles
- `helpers.js` (1.5KB) - Constants and utilities
- `chromeStoragePolyfill.js` (8.4KB) - Chrome API polyfill
- `themes.json` (3.8KB) - Theme configuration

### 2. Open in Xcode

```bash
open ios/imagineGodMode/imagineGodMode.xcodeproj
```

### 3. Add Extension Files to Project

**Important:** You need to add the extension folder to the Xcode project.

1. In Xcode, right-click on the `imagineGodMode` folder in the Project Navigator
2. Select **Add Files to "imagineGodMode"...**
3. Navigate to `ios/imagineGodMode/imagineGodMode/extension/`
4. Select the entire `extension` folder
5. Make sure **"Create folder references"** is selected (not "Create groups")
6. Click **Add**

### 4. Add Swift Files to Project

Ensure these Swift files are in the project target:

- ✅ `WebView.swift`
- ✅ `ChromeStorageBridge.swift`
- ✅ `DownloadManager.swift`
- ✅ `StorageManager.swift`
- ✅ `ContentView.swift`
- ✅ `imagineGodModeApp.swift`

To verify:
1. Select each file in Project Navigator
2. Check the **Target Membership** in File Inspector (right panel)
3. Ensure `imagineGodMode` target is checked

### 5. Configure Build Phases

1. Click on the project in Project Navigator
2. Select the `imagineGodMode` target
3. Go to **Build Phases** tab
4. Expand **Copy Bundle Resources**
5. Click **+** and add the `extension` folder if not already present

### 6. Configure App Permissions

1. Select the `imagineGodMode` target
2. Go to **Info** tab
3. Add these keys:

| Key | Type | Value |
|-----|------|-------|
| `NSPhotoLibraryAddUsageDescription` | String | `ImagineGodMode needs access to save downloaded images and videos` |
| `NSPhotoLibraryUsageDescription` | String | `ImagineGodMode needs access to your photo library to save media` |

**Or** add to Info.plist directly:

```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>ImagineGodMode needs access to save downloaded images and videos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>ImagineGodMode needs access to your photo library to save media</string>
```

### 7. Build and Run

1. Select a simulator or connected device
2. Press **⌘+R** or click the **Run** button
3. The app should launch and load grok.com
4. The extension UI should appear on the page

## Project Structure

```
ios/imagineGodMode/imagineGodMode/
├── extension/                        # Extension assets (bundled)
│   ├── chromeStoragePolyfill.js     # Chrome API polyfill
│   ├── content-script.js            # Main React app (369KB)
│   ├── content-script.css           # Tailwind styles (19KB)
│   ├── helpers.js                   # Constants & utilities
│   └── themes.json                  # Theme configuration
├── WebView.swift                     # WKWebView container + injection
├── ChromeStorageBridge.swift         # Storage bridge (UserDefaults)
├── DownloadManager.swift             # Download handler (Photos)
├── StorageManager.swift              # App lifecycle & persistence
├── ContentView.swift                 # Main view (WebView container)
└── imagineGodModeApp.swift          # App entry point
```

## How It Works

### 1. WKWebView Injection

When the app loads, `WebView.swift` injects scripts in this order:

```
atDocumentStart:
  1. chromeStoragePolyfill.js  → Defines window.chrome APIs
  2. helpers.js                → Extension constants/utilities

atDocumentEnd:
  3. content-script.js         → Main React application
  4. content-script.css        → Styling (injected via JS)
```

### 2. Chrome Storage Bridge

JavaScript calls:
```javascript
chrome.storage.local.get(['key'], (result) => {
  console.log(result.key);
});
```

Flow:
1. `chromeStoragePolyfill.js` → Posts message to Swift
2. `ChromeStorageBridge.swift` → Reads from UserDefaults
3. Swift evaluates JS callback with data

### 3. Download Handling

JavaScript calls:
```javascript
chrome.downloads.download({ url: 'https://...' }, (downloadId) => {
  console.log('Downloaded:', downloadId);
});
```

Flow:
1. `chromeStoragePolyfill.js` → Posts download message
2. `DownloadManager.swift` → Downloads via URLSession
3. Saves to Photos library via PHPhotoLibrary
4. Returns success/failure to JavaScript

## Features

### Extension Features (Fully Supported)
- ✅ Media fetching and viewing
- ✅ Prompt management with packs
- ✅ Theme switching (8 themes)
- ✅ Rating system (5-star)
- ✅ Search functionality
- ✅ Category management
- ✅ All modals and UI interactions

### iOS Native Features
- ✅ Download to Photos library
- ✅ Persistent storage (UserDefaults)
- ✅ Back/forward navigation
- ✅ Refresh button
- ✅ App lifecycle handling

### Not Implemented (Future)
- ❌ Share extension
- ❌ Native settings UI
- ❌ iOS widgets
- ❌ Background sync
- ❌ iPad optimization

## Troubleshooting

### Extension doesn't appear on page

**Solution:**
1. Check Xcode console for injection logs:
   - `[WebView] Injected chrome storage polyfill`
   - `[WebView] Injected helpers`
   - `[WebView] Injected content script`
   - `[WebView] Injected CSS`
2. Verify extension files are in Build Phases → Copy Bundle Resources
3. Clean build folder (⌘+Shift+K) and rebuild

### Storage not persisting

**Solution:**
1. Check console for ChromeStorageBridge logs
2. Verify message handlers are registered:
   ```swift
   userContentController.add(storageBridge, name: "chromeStorage")
   ```
3. Check UserDefaults keys with prefix `chrome_storage_`

### Downloads not working

**Solution:**
1. Check photo library permissions in Settings → ImagineGodMode
2. Verify Info.plist has required keys
3. Check console for DownloadManager logs
4. Ensure message handler is registered:
   ```swift
   userContentController.add(downloadManager, name: "chromeDownloads")
   ```

### Extension UI appears but is unresponsive

**Solution:**
1. Check JavaScript console in Safari Web Inspector
2. Enable Web Inspector: Settings → Safari → Advanced → Web Inspector
3. Connect device and open Safari → Develop → [Device] → grok.com
4. Check for JavaScript errors

### Build errors

**Common errors:**

1. **"Cannot find 'WKWebView' in scope"**
   - Solution: Add `import WebKit` to the file

2. **"Cannot find type 'PHPhotoLibrary' in scope"**
   - Solution: Add `import Photos` to the file

3. **"No such module 'SwiftData'"**
   - Solution: This is expected after removing SwiftData. Ensure Item.swift is deleted.

4. **"Multiple commands produce 'extension'"**
   - Solution: Remove duplicate extension folder references from Build Phases

## Rebuilding Extension

Whenever you modify the extension code (src/), rebuild for iOS:

```bash
./scripts/build-ios.sh
```

Then in Xcode:
1. Clean build folder (⌘+Shift+K)
2. Build and run (⌘+R)

## Development Tips

### Enable Web Inspector

1. On iOS device: Settings → Safari → Advanced → Web Inspector (ON)
2. Connect device to Mac
3. In Safari on Mac: Develop → [Your Device] → grok.com
4. Inspect extension elements and console logs

### Debug Storage

Check stored data in Swift:
```swift
let defaults = UserDefaults.standard
let keys = defaults.dictionaryRepresentation().keys.filter { $0.hasPrefix("chrome_storage_") }
print("Stored keys:", keys)
```

### Debug Downloads

Monitor download progress:
```swift
func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask,
                didWriteData bytesWritten: Int64, totalBytesWritten: Int64,
                totalBytesExpectedToWrite: Int64) {
    let progress = Double(totalBytesWritten) / Double(totalBytesExpectedToWrite)
    print("Download progress: \(Int(progress * 100))%")
}
```

## Performance Notes

- **Initial load**: ~2-3 seconds (loads grok.com + injects extension)
- **Extension bundle size**: ~400KB total (gzipped: ~120KB)
- **Memory usage**: ~80-150MB (typical for WKWebView + React)
- **Storage**: <1MB for typical usage (prompts + settings)

## Known Limitations

1. **No service worker**: Background tasks not supported in WKWebView
2. **No browser.downloads API**: Only saves to Photos, not Files app
3. **No notifications**: Push notifications require native implementation
4. **No clipboard access**: WKWebView clipboard is sandboxed
5. **No file system access**: Limited to app sandbox

## License

Same as parent project (ImagineGodMode extension).

## Support

For issues specific to iOS app, check:
1. Xcode console logs
2. Safari Web Inspector console
3. Chrome storage in UserDefaults
4. Photo library permissions

For extension functionality issues, refer to main project README.
