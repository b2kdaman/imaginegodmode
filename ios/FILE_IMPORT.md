# File Import Support for iOS App

The iOS app now supports importing `.pak` and `.json` files directly into the WebView.

## Supported File Types

### 1. JSON Files (`.json`)
- Standard JSON documents
- Conforms to `public.json` UTI
- Can contain prompt packs or other configuration data

### 2. PAK Files (`.pak`)
- Custom ImagineGodMode pack files
- Custom UTI: `com.imaginegodmode.pak`
- Contains prompt pack data in JSON format

## How It Works

### File Type Declaration
The app declares support for these file types in the Xcode project build settings (`project.pbxproj`):
- `INFOPLIST_KEY_CFBundleDocumentTypes` - Defines which file types the app can open
- `INFOPLIST_KEY_UTImportedTypeDeclarations` - Declares the custom `.pak` file type
- `INFOPLIST_KEY_UISupportsDocumentBrowser` - Enables file browsing and import

These keys are automatically included in the generated Info.plist at build time.

### Import Flow

1. **User opens a file** (from Files app, Mail, Safari, etc.)
2. **iOS routes the file** to the app via `onOpenURL`
3. **App receives the file** in `imagineGodModeApp.swift`
4. **File is passed to WebView** via `ContentView` → `WebViewContainer`
5. **FileImportHandler processes the file**:
   - Reads file data
   - Converts to base64
   - Injects into JavaScript context
6. **JavaScript receives the data** via custom event:
   - Event name: `ios-file-import`
   - Event detail contains: `fileName`, `content`, `data`

### JavaScript Integration

The extension should listen for file imports:

```javascript
document.addEventListener('ios-file-import', (event) => {
  const { fileName, content, data } = event.detail;

  // Handle the imported file
  if (fileName.endsWith('.pak') || fileName.endsWith('.json')) {
    // Trigger the import modal with the data
    triggerPackImport(content);
  }
});
```

Or, if a global function is available:

```javascript
window.triggerPackImport = function(jsonContent) {
  // Handle the pack import
  // This should integrate with ImportPackModal
};
```

## Implementation Details

### Files Modified/Created

1. **project.pbxproj** - File type declarations in build settings
2. **FileImportHandler.swift** - Handles file reading and injection
3. **WebView.swift** - Integrates FileImportHandler
4. **imagineGodModeApp.swift** - Handles `onOpenURL` events
5. **ContentView.swift** - Passes file URL to WebView

### Security

- Uses security-scoped resources for file access
- Validates file extensions before processing
- Properly releases file access after reading
- Only accepts `.pak` and `.json` files

### Error Handling

- Unsupported file types are rejected
- File read errors are logged and displayed
- Invalid JSON is caught in JavaScript

## Testing

### Test File Import

1. **Via Files App**:
   - Save a `.pak` or `.json` file to Files
   - Long press → Share → ImagineGodMode

2. **Via Safari**:
   - Download a `.pak` or `.json` file
   - Tap "Open in ImagineGodMode"

3. **Via AirDrop**:
   - Send a `.pak` or `.json` file via AirDrop
   - Select ImagineGodMode to open

### Expected Behavior

✅ File is read successfully
✅ Data is passed to JavaScript
✅ Custom event is dispatched
✅ Extension receives and processes the data
✅ Import modal shows with the file content

## Future Enhancements

- [ ] Add file picker button in UI
- [ ] Support drag-and-drop on iPad
- [ ] Add import history
- [ ] Support batch imports
- [ ] Add file validation before import
- [ ] Show import progress indicator

## Troubleshooting

### File doesn't import
- Check Console for `[FileImportHandler]` logs
- Verify file extension is `.pak` or `.json`
- Ensure file contains valid JSON

### JavaScript not receiving event
- Check if `ios-file-import` event listener is registered
- Verify event is dispatched (check Console)
- Ensure WebView has finished loading before import

### Permission errors
- Check if app has proper entitlements
- Verify file type declarations are in project.pbxproj
- Ensure file access is properly scoped

## Xcode Configuration

The file type support is configured in the Xcode project build settings. No manual Info.plist file is needed - Xcode generates it automatically with these settings:

**Debug and Release configurations include:**
- `INFOPLIST_KEY_CFBundleDocumentTypes` - Declares .json and .pak support
- `INFOPLIST_KEY_UTImportedTypeDeclarations` - Defines the custom .pak UTI
- `INFOPLIST_KEY_UISupportsDocumentBrowser` - Enables document browsing

**To add FileImportHandler.swift to the project:**
1. Open Xcode
2. Right-click on the imagineGodMode group
3. Add Files to "imagineGodMode"
4. Select FileImportHandler.swift
5. Ensure it's added to the imagineGodMode target
6. Build and run
