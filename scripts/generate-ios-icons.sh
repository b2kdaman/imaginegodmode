#!/bin/bash

# Script to generate iOS app icons from bg.jpg
# Uses sips (macOS built-in image tool)

SOURCE_IMAGE="assets/bg.jpg"
OUTPUT_DIR="ios/imagineGodMode/imagineGodMode/Assets.xcassets/AppIcon.appiconset"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ Source image not found: $SOURCE_IMAGE"
    exit 1
fi

echo "🎨 Generating iOS app icons from $SOURCE_IMAGE..."

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# iOS App Icon sizes (all required sizes for iOS)
# Format: "filename:size"
declare -a SIZES=(
    "icon-20@2x.png:40"
    "icon-20@3x.png:60"
    "icon-29@2x.png:58"
    "icon-29@3x.png:87"
    "icon-40@2x.png:80"
    "icon-40@3x.png:120"
    "icon-60@2x.png:120"
    "icon-60@3x.png:180"
    "icon-1024.png:1024"
)

# Generate each icon size
for entry in "${SIZES[@]}"; do
    IFS=':' read -r filename size <<< "$entry"
    output_path="$OUTPUT_DIR/$filename"

    echo "  📱 Generating $filename (${size}x${size})"
    sips -z "$size" "$size" "$SOURCE_IMAGE" --out "$output_path" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "     ✅ Created $filename"
    else
        echo "     ❌ Failed to create $filename"
    fi
done

# Create Contents.json for the icon set
cat > "$OUTPUT_DIR/Contents.json" << 'EOF'
{
  "images" : [
    {
      "filename" : "icon-20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "icon-60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "icon-1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "✅ iOS app icons generated successfully!"
echo ""
echo "📁 Icons saved to: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "  1. The icons are ready in your Xcode project"
echo "  2. Clean build in Xcode: ⌘+Shift+K"
echo "  3. Run the app: ⌘+R"
echo "  4. The new icon should appear on your device/simulator"
