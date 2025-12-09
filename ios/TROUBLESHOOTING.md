# iOS App Troubleshooting

## Error: Extension Files Not Found

If you see these errors in Xcode console:
```
[WebView] Failed to load script: chromeStoragePolyfill.js
[WebView] Failed to load script: helpers.js
[WebView] Failed to load script: content-script.js
[WebView] Failed to load CSS: content-script.css
```

**Cause:** The extension files aren't added to the Xcode project.

**Fix:**

### Step 1: Build Extension Files
```bash
npm run ios:build
```

This creates files in `ios/imagineGodMode/imagineGodMode/extension/`

### Step 2: Add Files to Xcode Project

1. Open Xcode: `npm run ios:open`
2. In **Project Navigator** (left sidebar), right-click on **imagineGodMode** folder (yellow folder icon)
3. Select **"Add Files to 'imagineGodMode'..."**
4. Navigate to: `ios/imagineGodMode/imagineGodMode/`
5. Select the **`extension`** folder
6. **IMPORTANT:** Check these options:
   - ✅ **"Create folder references"** (blue folder icon, NOT yellow)
   - ✅ **"Add to targets: imagineGodMode"**
7. Click **Add**

### Step 3: Verify Files Are Bundled

1. Click on **imagineGodMode** project (top of sidebar)
2. Select **imagineGodMode** target
3. Go to **Build Phases** tab
4. Expand **Copy Bundle Resources**
5. You should see the **extension** folder listed
6. If not, click **+** and add it

### Step 4: Clean and Rebuild

```bash
npm run ios:clean
# Then in Xcode: ⌘+R (or npm run ios:simulator)
```

---

## Error: Sandbox Network Settings

If you see:
```
networkd_settings_read_from_file Sandbox is preventing this process from reading networkd settings file
```

**This is a warning, not an error.** It won't prevent the app from working. The app doesn't need to read system network settings.

**To silence it (optional):**

1. Click on **imagineGodMode** project
2. Select **imagineGodMode** target
3. Go to **Signing & Capabilities** tab
4. Find **App Sandbox** capability
5. Under **Network**, ensure **Outgoing Connections (Client)** is checked ✅

---

## Error: WebProcess Crashed

If you see:
```
WebProcessProxy::processDidTerminateOrFailedToLaunch: reason=Crash
```

**Common Causes:**

### Cause 1: Extension Files Not Bundled
See "Extension Files Not Found" section above.

### Cause 2: Running on Unsupported Simulator
Some older simulators have WKWebView issues.

**Fix:**
- Use **iPhone 15** or newer simulator
- Or test on a physical device

### Cause 3: Sandbox Restrictions

**Fix:** Add entitlements file:

1. In Xcode, select **imagineGodMode** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **App Sandbox** (if not already added)
5. Enable these permissions:
   - ✅ **Outgoing Connections (Client)**
   - ✅ **Incoming Connections (Server)** - OFF
   - ✅ **Camera** - OFF
   - ✅ **Microphone** - OFF
   - ✅ **USB** - OFF
   - ✅ **Printing** - OFF
   - ✅ **Bluetooth** - OFF
   - ✅ **Downloads Folder** - Read/Write
   - ✅ **Pictures Folder** - Read/Write
   - ✅ **Music Folder** - OFF
   - ✅ **Movies Folder** - Read/Write

Or use the provided entitlements file:

1. Drag `imagineGodMode.entitlements` into the project
2. Select **imagineGodMode** target
3. Go to **Signing & Capabilities**
4. Under **App Sandbox**, it should show "imagineGodMode.entitlements"

---

## Error: Invalid Metal Format

If you see:
```
unable to load binary archive for shader library
The file has an invalid format
```

**Cause:** Running on incompatible simulator or macOS version mismatch.

**Fix:**
- Use a physical iOS device
- Or update to latest Xcode and iOS simulator
- Or change deployment target to iOS 16+ (in Build Settings)

---

## Error: Target Process Does Not Exist

If you see:
```
Error acquiring assertion: Specified target process 11667 does not exist
```

**This happens when the app crashes.** Check other errors first (extension files, sandbox, etc.)

---

## Complete Fresh Setup

If nothing works, try a complete fresh setup:

```bash
# 1. Clean everything
npm run ios:clean
rm -rf ios/imagineGodMode/imagineGodMode/extension

# 2. Rebuild extension
npm run ios:build

# 3. Open Xcode
npm run ios:open

# 4. In Xcode:
#    - Delete extension folder from project (if it exists)
#    - Right-click imagineGodMode folder → Add Files
#    - Select extension folder
#    - ✅ Create folder references
#    - ✅ Add to targets: imagineGodMode

# 5. Verify Build Phases
#    - Check extension is in Copy Bundle Resources

# 6. Clean and run
#    - Press ⌘+Shift+K (clean)
#    - Press ⌘+R (run)
```

---

## Quick Checklist

Before building, verify:

- [ ] Extension files exist in `ios/imagineGodMode/imagineGodMode/extension/`
- [ ] Extension folder added to Xcode with "folder references" (blue icon)
- [ ] Extension folder in Build Phases → Copy Bundle Resources
- [ ] Bundle identifier is unique (e.g., `com.yourname.imagineGodMode`)
- [ ] Team selected in Signing & Capabilities
- [ ] App Sandbox capability added with network permissions
- [ ] Info.plist has photo library usage keys
- [ ] Using iPhone 15 or newer simulator (or physical device)

---

## Still Having Issues?

1. Check Xcode console for specific error messages
2. Verify all Swift files have target membership
3. Try on a physical device instead of simulator
4. Post the full error log for more specific help

---

## Common Xcode Console Messages (Normal)

These are **normal** and can be ignored:

```
networkd_settings_read_from_file Sandbox is preventing...
AFIsDeviceGreymatterEligible Missing entitlements...
```

These indicate **real problems** that need fixing:

```
[WebView] Failed to load script...
WebProcessProxy::processDidTerminateOrFailedToLaunch...
unable to load binary archive for shader library...
```
