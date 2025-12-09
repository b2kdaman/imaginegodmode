# iOS Deployment Guide

Quick reference guide for deploying ImagineGodMode to your iPhone.

## Quick Start (Recommended)

```bash
# 1. Build and open Xcode in one command
npm run ios:deploy

# 2. In Xcode:
#    - Change bundle ID to com.yourname.imagineGodMode
#    - Select your Team (sign in with Apple ID)
#    - Connect iPhone via USB
#    - Press ⌘+R to run

# 3. On iPhone (first time only):
#    Settings → General → VPN & Device Management
#    → Tap your Apple ID → Trust
```

## Available npm Scripts

```bash
npm run ios:build       # Build extension and copy to iOS app
npm run ios:open        # Open Xcode project
npm run ios:deploy      # Build + open (one command)
npm run ios:simulator   # Build and run in iPhone 15 simulator
npm run ios:clean       # Clean Xcode build artifacts
```

## First-Time Setup Checklist

### 1. Build Extension Assets
```bash
npm run ios:build
```

### 2. Open Xcode
```bash
npm run ios:open
```

### 3. Configure Signing
- Click **imagineGodMode** project (left sidebar)
- Select **imagineGodMode** target
- Go to **Signing & Capabilities**
- Change **Bundle Identifier**: `com.yourname.imagineGodMode`
- Select **Team**: Sign in with your Apple ID (free account works)

### 4. Add Extension Files (One-Time)
- Right-click **imagineGodMode** folder in Project Navigator
- **Add Files to "imagineGodMode"...**
- Navigate to `ios/imagineGodMode/imagineGodMode/extension/`
- Select **extension** folder
- ✅ Check **"Create folder references"**
- ✅ Check **imagineGodMode** target
- Click **Add**

### 5. Add Photo Permissions (One-Time)
- Select **imagineGodMode** target
- Go to **Info** tab
- Click **+** to add these keys:

| Key | Value |
|-----|-------|
| `Privacy - Photo Library Additions Usage Description` | `ImagineGodMode needs access to save downloaded images and videos` |
| `Privacy - Photo Library Usage Description` | `ImagineGodMode needs access to your photo library to save media` |

### 6. Connect iPhone
- Connect via USB cable
- Unlock iPhone
- Tap **"Trust This Computer"** on iPhone
- Select your iPhone in Xcode (top left dropdown)

### 7. Build and Run
- Press **⌘+R** or click ▶️ **Run** button
- App installs and launches on your iPhone

### 8. Trust Developer (First Time Only)
On iPhone:
1. **Settings** → **General** → **VPN & Device Management**
2. Under **Developer App**, tap your Apple ID
3. Tap **Trust "[Your Apple ID]"**
4. Confirm **Trust**
5. Launch app again

## Testing in Simulator

Don't have a physical device? Use the simulator:

```bash
npm run ios:simulator
```

This automatically builds and launches in iPhone 15 simulator.

**Note:** Downloads won't work in simulator (no Photos app access).

## Daily Development Workflow

When you modify extension code:

```bash
# 1. Rebuild extension
npm run ios:build

# 2. In Xcode: Clean + Run
# Press ⌘+Shift+K (clean)
# Press ⌘+R (run)
```

Or use npm:
```bash
npm run ios:clean      # Clean build
npm run ios:simulator  # Build and run
```

## Troubleshooting

### "Untrusted Developer" on iPhone
- Settings → General → VPN & Device Management
- Trust your Apple ID under Developer App

### App crashes on launch
- Check Xcode console for errors
- Verify extension files are added to project
- Clean build folder: `npm run ios:clean`

### Extension doesn't appear
- Check Xcode console for injection logs
- Verify files exist in `extension/` folder
- Clean and rebuild

### Downloads not working
- Settings → ImagineGodMode → Allow Photos access
- Check Info.plist has photo permission keys

### Build fails with signing errors
- Change bundle identifier to something unique
- Ensure Team is selected in Signing & Capabilities
- Try toggling "Automatically manage signing"

## File Structure

After `npm run ios:build`, you should have:

```
ios/imagineGodMode/imagineGodMode/extension/
├── chromeStoragePolyfill.js  (8.4KB)
├── content-script.js         (369KB)
├── content-script.css        (19KB)
├── helpers.js                (1.5KB)
└── themes.json               (3.8KB)
```

## Advanced: Build from Command Line

```bash
# Build for connected device
xcodebuild -project ios/imagineGodMode/imagineGodMode.xcodeproj \
  -scheme imagineGodMode \
  -destination 'generic/platform=iOS' \
  build

# Build for simulator
npm run ios:simulator

# Clean build
npm run ios:clean
```

## Distribution

### TestFlight (Beta Testing)
- Requires **paid Apple Developer account** ($99/year)
- Upload to App Store Connect
- Invite testers via email

### App Store (Public Release)
- Requires paid Apple Developer account
- Submit through App Store Connect
- Apple review process (1-3 days typically)

## Support

For detailed setup instructions, see:
- [ios/README.md](README.md) - Complete iOS documentation
- [ios/XCODE_SETUP.md](XCODE_SETUP.md) - Detailed Xcode configuration

For extension-specific issues:
- [../README.md](../README.md) - Main project documentation
