# Extension Icons

To generate PNG icons from the SVG, you can use:

```bash
# Install ImageMagick if not available
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux

# Generate icons
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

For now, the extension will work without icons (Chrome will use default).
