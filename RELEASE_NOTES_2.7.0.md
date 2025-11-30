# Release Notes - Version 2.7.0

**Release Date:** 2025-01-30

## 🎉 What's New

### Bulk Operations Enhancements
- **Shift-click batch selection** - Hold Shift and click to select multiple posts at once in bulk operations modal
- **Improved modal positioning** - Bulk operations modal now pinned to bottom with 400px max height for better accessibility
- **Full-width button layout** - Bulk operation buttons reorganized into column layout for clearer action hierarchy
- **New bulk operations**:
  - Bulk upscale liked posts
  - Bulk like unliked posts
- **Increased fetch limit** - Post fetch limit increased from 40 to 100 using `MAX_POST_FETCH_LIMIT` constant for better performance

### Type Safety Improvements
- **MediaPostSource enum** - Added type-safe source filtering for media posts
- Improved code maintainability with better type checking

### Language Support
- **Russian language support** - Full Russian translation added to i18n system

## 🐛 Bug Fixes

### Content Script Injection
- **Expanded injection scope** - Content script now injects on all `/imagine` paths, not just specific routes

## 🔧 Modified Components

### Bulk Operations
- `src/components/BulkOperationsModal.tsx` - Added shift-click selection, pinned positioning, full-width buttons
- `src/services/bulkOperations.ts` - New bulk upscale and like operations

### Content Scripts
- Content script injection patterns updated to match all `/imagine/*` paths

### Configuration
- Added `MAX_POST_FETCH_LIMIT` constant (100) for consistent fetch limits
- `MediaPostSource` enum for type-safe source filtering

## 📝 Translation Coverage

### Supported Languages
- 🇺🇸 **English** (en) - Complete
- 🇪🇸 **Spanish** (es) - Complete
- 🇷🇺 **Russian** (ru) - Complete (New!)

## 🎨 UI/UX Improvements

1. **Batch selection workflow** - Shift-click makes selecting multiple posts much faster
2. **Better modal positioning** - Bottom-pinned modal stays accessible while scrolling
3. **Clearer action buttons** - Full-width column layout improves button readability
4. **More posts loaded** - 100 post limit means fewer pagination interruptions

## 🔄 Breaking Changes

None - This release is fully backward compatible with v2.6.0

## 📊 Statistics

- **5 feature commits**
- **3 refactoring improvements**
- **1 bug fix**
- **1 new language** (Russian)
- **Fetch limit increased** 2.5x (40 → 100)

## 🚀 Upgrade Notes

1. Update extension from Chrome Extensions page or reload unpacked extension
2. All existing data (prompts, packs, settings) will be preserved
3. Russian language now available in Settings → Language
4. New bulk operations immediately available in Ops tab
5. Shift-click to batch select posts in bulk operations modal

## 🎯 Future Enhancements

- Additional bulk operations (batch delete, batch download, etc.)
- Configurable fetch limits in settings
- Keyboard shortcuts for bulk operations
- Selection count indicator in bulk operations modal

## 🙏 Credits

- Translation infrastructure: React Context API with parameter interpolation
- Icons: Material Design Icons (@mdi/js, @mdi/react)
- Built with: React 18, TypeScript, Vite, Tailwind CSS

---

**Full Changelog:** [v2.6.0...v2.7.0](https://github.com/b2kdaman/grkgoondl/compare/v2.6.0...v2.7.0)
