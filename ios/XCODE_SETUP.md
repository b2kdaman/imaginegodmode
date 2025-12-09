# Xcode Setup Checklist

Quick reference for setting up the iOS app in Xcode.

## Prerequisites

```bash
# 1. Build extension assets
./scripts/build-ios.sh

# 2. Open Xcode project
open ios/imagineGodMode/imagineGodMode.xcodeproj
```

## Xcode Configuration Steps

### ✅ Step 1: Add Extension Folder to Project

1. In Project Navigator, right-click **imagineGodMode** folder
2. Select **Add Files to "imagineGodMode"...**
3. Navigate to: `ios/imagineGodMode/imagineGodMode/extension/`
4. Select the **extension** folder
5. Choose **"Create folder references"** (blue folder icon)
6. Ensure **"Add to targets: imagineGodMode"** is checked
7. Click **Add**

**Verify:** Extension folder should appear with blue folder icon in Project Navigator.

### ✅ Step 2: Add Swift Files to Target

Check that these files are added to the imagineGodMode target:

| File | Status |
|------|--------|
| `WebView.swift` | ✅ Should be in project |
| `ChromeStorageBridge.swift` | ✅ Should be in project |
| `DownloadManager.swift` | ✅ Should be in project |
| `StorageManager.swift` | ✅ Should be in project |
| `ContentView.swift` | ✅ Modified |
| `imagineGodModeApp.swift` | ✅ Modified |
| ~~`Item.swift`~~ | ❌ Removed (not needed) |

**To verify each file:**
1. Select file in Project Navigator
2. Open **File Inspector** (⌥⌘1 or right panel)
3. Under **Target Membership**, ensure **imagineGodMode** is checked

### ✅ Step 3: Configure Build Phases

1. Click project name in Project Navigator (top level)
2. Select **imagineGodMode** target
3. Go to **Build Phases** tab
4. Expand **Copy Bundle Resources**
5. Verify **extension** folder is listed
   - If not, click **+** → Add Other → Select `extension` folder

**Extension folder should contain:**
- chromeStoragePolyfill.js
- content-script.js (369KB)
- content-script.css (19KB)
- helpers.js
- themes.json

### ✅ Step 4: Add Photo Library Permissions

**Option A: Via Info Tab**

1. Select **imagineGodMode** target
2. Go to **Info** tab
3. Expand **Custom iOS Target Properties**
4. Click **+** button, add these keys:

| Key | Type | Value |
|-----|------|-------|
| Privacy - Photo Library Additions Usage Description | String | ImagineGodMode needs access to save downloaded images and videos |
| Privacy - Photo Library Usage Description | String | ImagineGodMode needs access to your photo library to save media |

**Option B: Edit Info.plist Directly**

If your project has an Info.plist file:
1. Open `Info.plist`
2. Add these entries:

```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>ImagineGodMode needs access to save downloaded images and videos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>ImagineGodMode needs access to your photo library to save media</string>
```

### ✅ Step 5: Build Settings (Optional)

**Minimum Deployment Target:** iOS 15.0

1. Select **imagineGodMode** target
2. Go to **Build Settings** tab
3. Search for "deployment target"
4. Set **iOS Deployment Target** to 15.0 or higher

### ✅ Step 6: Signing & Capabilities

1. Select **imagineGodMode** target
2. Go to **Signing & Capabilities** tab
3. Select your **Team**
4. Xcode will automatically manage signing

**For device testing:**
- Ensure your Apple ID is added in Xcode Preferences
- Device must trust your developer certificate

## Build & Run

### Option 1: Simulator

1. Select simulator from device menu (e.g., iPhone 15 Pro)
2. Press **⌘+R** or click Run button
3. Wait for build to complete
4. App should launch and load grok.com

### Option 2: Physical Device

1. Connect iPhone/iPad via USB
2. Trust computer on device if prompted
3. Select device from device menu
4. Press **⌘+R** or click Run button
5. If app doesn't launch, check Settings → General → VPN & Device Management
6. Trust developer certificate

## Verification Checklist

After app launches, verify:

- [ ] App opens to grok.com
- [ ] Page loads completely
- [ ] Extension UI appears on page (ImagineGodMode panel)
- [ ] Can toggle extension panel open/closed
- [ ] Can navigate with back/forward buttons
- [ ] Can refresh page
- [ ] Extension features work (prompts, themes, etc.)

**Check Xcode Console for these logs:**
```
[WebView] Injected chrome storage polyfill
[WebView] Injected helpers
[WebView] Injected content script
[WebView] Injected CSS
[WebView] Finished loading: https://grok.com
[ChromePolyfill] Chrome Storage & Downloads polyfill loaded for iOS
[ImagineGodMode] ImagineGodMode v2.11.0 by b2kdaman
```

## Common Issues

### Extension files not found during build

**Error:** `"extension/content-script.js" not found`

**Solution:**
1. Verify extension folder is in **Build Phases → Copy Bundle Resources**
2. Ensure folder reference is blue (not yellow)
3. Clean build folder: **Product → Clean Build Folder** (⌘+Shift+K)
4. Rebuild

### Swift files showing errors

**Error:** `Cannot find 'WKWebView' in scope`

**Solution:**
1. Check imports at top of file:
   ```swift
   import WebKit    // for WKWebView
   import Photos    // for PHPhotoLibrary
   ```
2. If still errors, clean and rebuild

### Extension doesn't appear on page

**Solution:**
1. Check console for injection logs (see Verification Checklist above)
2. If no logs appear:
   - Verify extension files are copied to app bundle
   - Check Build Phases → Copy Bundle Resources
   - Ensure files are in the extension folder
3. Try Safari Web Inspector:
   - Device: Settings → Safari → Advanced → Web Inspector (ON)
   - Mac Safari: Develop → [Device] → grok.com
   - Check Console for errors

### Photo permissions not requested

**Solution:**
1. Verify Info.plist keys are added (Step 4)
2. Trigger a download to test
3. Check Settings → ImagineGodMode → Photos
4. If no permission entry, keys are missing

### Build succeeds but app crashes on launch

**Solution:**
1. Check Xcode console for crash logs
2. Common causes:
   - Missing extension files
   - Incorrect file paths
   - SwiftData references not removed
3. Verify Item.swift is deleted
4. Verify no references to SwiftData in code

## Debug Tips

### Enable Verbose Logging

Add to WebView.swift initialization:
```swift
if #available(iOS 16.4, *) {
    webView.isInspectable = true
}
```

### Monitor Storage

In ChromeStorageBridge.swift, add logging:
```swift
private func handleGet(id: String, keys: [String]?) {
    print("[Storage] GET request for keys: \(keys ?? ["all"])")
    // ... rest of function
}
```

### Monitor Downloads

In DownloadManager.swift, track progress:
```swift
func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask,
                didWriteData bytesWritten: Int64, totalBytesWritten: Int64,
                totalBytesExpectedToWrite: Int64) {
    let progress = Int((Double(totalBytesWritten) / Double(totalBytesExpectedToWrite)) * 100)
    print("[Download] Progress: \(progress)%")
}
```

## Next Steps

Once the app is working:

1. **Test Extension Features:**
   - Create/edit prompts
   - Switch themes
   - Download media
   - Search functionality
   - Verify storage persists across app restarts

2. **Test Native Features:**
   - Back/forward navigation
   - Pull to refresh
   - App backgrounding/foregrounding
   - Photo library integration

3. **Deploy:**
   - Archive for TestFlight
   - Submit to App Store
   - Or use for personal development

## Resources

- [iOS README](./README.md) - Full documentation
- [WKWebView Documentation](https://developer.apple.com/documentation/webkit/wkwebview)
- [PHPhotoLibrary Documentation](https://developer.apple.com/documentation/photokit/phphotolibrary)
- Main extension: `../src/` directory

## Getting Help

If you encounter issues:

1. Check Xcode console logs
2. Use Safari Web Inspector
3. Review extension files are correctly bundled
4. Verify all Swift files compile without errors
5. Check photo permissions in iOS Settings

For extension-specific issues, test in browser first.
