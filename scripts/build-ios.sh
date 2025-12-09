#!/bin/bash

#
# build-ios.sh
# Builds extension and copies assets to iOS app bundle
#
# Usage: ./scripts/build-ios.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building ImagineGodMode for iOS...${NC}\n"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Paths
DIST_DIR="$PROJECT_ROOT/dist"
IOS_EXTENSION_DIR="$PROJECT_ROOT/ios/imagineGodMode/imagineGodMode/extension"

echo -e "${YELLOW}📦 Step 1: Building extension...${NC}"
cd "$PROJECT_ROOT"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build complete${NC}\n"

echo -e "${YELLOW}📁 Step 2: Creating iOS extension directory...${NC}"
mkdir -p "$IOS_EXTENSION_DIR"

echo -e "${GREEN}✓ Directory created${NC}\n"

echo -e "${YELLOW}📋 Step 3: Copying extension assets...${NC}"

# Find the actual built file names (they have hashes)
# Exclude the loader file, get the main content script
CONTENT_SCRIPT=$(find "$DIST_DIR/assets" -name "content-script.tsx-*.js" -type f | grep -v "loader" | head -n 1)
CONTENT_CSS=$(find "$DIST_DIR/assets" -name "content-script-*.css" -type f | head -n 1)
HELPERS_SCRIPT=$(find "$DIST_DIR/assets" -name "helpers-*.js" -type f | head -n 1)

# Copy and rename files
if [ -f "$CONTENT_SCRIPT" ]; then
    cp "$CONTENT_SCRIPT" "$IOS_EXTENSION_DIR/content-script.js"
    echo -e "  ${GREEN}✓${NC} content-script.js ($(du -h "$CONTENT_SCRIPT" | cut -f1))"
else
    echo -e "  ${RED}✗${NC} content-script.js not found!"
    exit 1
fi

if [ -f "$CONTENT_CSS" ]; then
    cp "$CONTENT_CSS" "$IOS_EXTENSION_DIR/content-script.css"
    echo -e "  ${GREEN}✓${NC} content-script.css ($(du -h "$CONTENT_CSS" | cut -f1))"
else
    echo -e "  ${RED}✗${NC} content-script.css not found!"
    exit 1
fi

if [ -f "$HELPERS_SCRIPT" ]; then
    cp "$HELPERS_SCRIPT" "$IOS_EXTENSION_DIR/helpers.js"
    echo -e "  ${GREEN}✓${NC} helpers.js ($(du -h "$HELPERS_SCRIPT" | cut -f1))"
else
    echo -e "  ${RED}✗${NC} helpers.js not found!"
    exit 1
fi

if [ -f "$DIST_DIR/themes.json" ]; then
    cp "$DIST_DIR/themes.json" "$IOS_EXTENSION_DIR/themes.json"
    echo -e "  ${GREEN}✓${NC} themes.json ($(du -h "$DIST_DIR/themes.json" | cut -f1))"
else
    echo -e "  ${RED}✗${NC} themes.json not found!"
    exit 1
fi

# chromeStoragePolyfill.js is already in the extension dir (manually created)
if [ -f "$IOS_EXTENSION_DIR/chromeStoragePolyfill.js" ]; then
    echo -e "  ${GREEN}✓${NC} chromeStoragePolyfill.js (already exists)"
else
    echo -e "  ${YELLOW}⚠${NC}  chromeStoragePolyfill.js not found - please ensure it's created"
fi

echo -e "\n${GREEN}✅ iOS build complete!${NC}\n"

echo -e "${YELLOW}Extension assets location:${NC}"
echo -e "  $IOS_EXTENSION_DIR\n"

echo -e "${YELLOW}Files bundled:${NC}"
ls -lh "$IOS_EXTENSION_DIR" | tail -n +2

echo -e "\n${GREEN}🎉 Ready to build in Xcode!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Open ios/imagineGodMode/imagineGodMode.xcodeproj in Xcode"
echo -e "  2. Add extension folder to project (if not already added)"
echo -e "  3. Ensure files are in Build Phases → Copy Bundle Resources"
echo -e "  4. Build and run on simulator or device"
echo -e ""
