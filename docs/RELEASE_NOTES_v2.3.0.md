# Release Notes - Version 2.3.0

**Release Date:** 2025-01-20

## 🎉 What's New

### Internationalization (i18n) Support
- **Multi-language support** with English and Spanish translations
- **Live language switching** - Change language without page reload
- **Language selector** in Settings view with visual icon
- **Complete UI translation** - All buttons, labels, tooltips, and modals fully translated
- **Parameter interpolation** support for dynamic values (e.g., pack names, counts)
- **Fallback mechanism** - Automatically falls back to English for missing translations
- **Persistent preference** - Language choice saved in localStorage

### Search Functionality
- **Type-ahead search** - Search prompts across all packs with instant results
- **Search button** - New magnifying glass icon button before pack dropdown
- **Smart search modal** with:
  - Real-time search results as you type
  - Result cards showing prompt text preview (truncated to 2 lines)
  - Pack name and prompt number (50% opacity for subtle display)
  - Star ratings displayed in results
  - Result count indicator
  - Quick navigation - Click any result to jump to that pack and prompt
- **Bilingual search** - Fully translated search interface
- **Keyboard-friendly** - Auto-focus on search input when modal opens

### Visual Enhancements
- **Settings icons** - All settings labels now include Material Design Icons:
  - 🎨 Palette icon for Theme
  - ↔️ Resize icon for Size
  - 🌐 Translate icon for Language
  - ⬇️ Download icon for Auto Download
  - 💾 Database icon for Data Management
  - ↔️ Swap icon for Import Mode
- **Smaller dropdown font** - Pack dropdown now uses smaller font (text-xs) for compact display
- **Improved hover effects** - Search results have smooth color transitions with consistent border radius

## 🐛 Bug Fixes

### Security & Permissions
- **Restricted web_accessible_resources** - Limited theme.json access to specific grok.com domains only
- Improved extension security by narrowing resource access scope

### UI Improvements
- **Fixed search result hover** - Removed inconsistent border roundness on hover
- **Rating system readonly mode** - Added readonly prop to RatingSystem component for search results

## 📦 New Files

### Internationalization Infrastructure
- `src/contexts/I18nContext.tsx` - Translation context and hook
- `src/locales/en.json` - Complete English translations
- `src/locales/es.json` - Complete Spanish translations

### Search Feature
- `src/components/SearchModal.tsx` - Type-ahead search modal component

## 🔧 Modified Components

### Core Components
- `src/App.tsx` - Wrapped with I18nProvider for translation support
- `src/components/MainPanel.tsx` - Translated tab labels and UI elements
- `src/components/SettingsView.tsx` - Added language selector and icons to all labels
- `src/components/PromptView.tsx` - Translated all UI strings
- `src/components/PackManager.tsx` - Added search button and translated strings
- `src/components/RatingSystem.tsx` - Added readonly mode support

### Modal Components
- `src/components/ConfirmDeleteModal.tsx` - Full translation support
- `src/components/PackSelectModal.tsx` - Full translation support
- `src/components/ImportPackModal.tsx` - Full translation support
- `src/components/SearchModal.tsx` - New search modal with full i18n

## 📝 Translation Coverage

### Translated Elements
- ✅ Tab labels (Prompt, Ops, Settings, Help)
- ✅ All button labels and tooltips
- ✅ Settings labels and options
- ✅ Modal titles and messages
- ✅ Status messages and notifications
- ✅ Placeholder text
- ✅ Search interface
- ✅ Pack management UI
- ✅ Theme and size option labels

### Supported Languages
- 🇺🇸 **English** (en) - Complete
- 🇪🇸 **Spanish** (es) - Complete

## 🎨 UI/UX Improvements

1. **Consistent iconography** - Material Design Icons throughout settings
2. **Better visual hierarchy** - Icons help users quickly identify settings
3. **Compact pack selector** - Smaller font improves space usage
4. **Smooth animations** - Color transitions on hover without scale effects
5. **Search discoverability** - Prominent search button for easy access
6. **Bilingual interface** - Seamless switching between languages

## 🔄 Breaking Changes

None - This release is fully backward compatible with v2.2.1

## 📊 Statistics

- **15 files changed**
- **901 insertions** (+)
- **83 deletions** (-)
- **3 new files** (contexts, locales)
- **12 modified components**
- **2 new translation files**

## 🚀 Upgrade Notes

1. Update extension from Chrome Extensions page or reload unpacked extension
2. All existing data (prompts, packs, settings) will be preserved
3. Default language is English - change in Settings → Language
4. Search feature is immediately available via the magnifying glass icon

## 🎯 Future Enhancements

- Additional language translations (French, German, Portuguese, Japanese, etc.)
- Advanced search filters (by rating, pack, date)
- Search history
- Keyboard shortcuts for search (Ctrl/Cmd+F)

## 🙏 Credits

- Translation infrastructure: React Context API with parameter interpolation
- Icons: Material Design Icons (@mdi/js, @mdi/react)
- Built with: React 18, TypeScript, Vite, Tailwind CSS

---

**Full Changelog:** [v2.2.1...v2.3.0](https://github.com/b2kdaman/grkgoondl/compare/v2.2.1...v2.3.0)
