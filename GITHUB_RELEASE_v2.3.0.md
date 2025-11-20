# ImagineGodMode v2.3.0 🌍✨

## Major Features

### 🌐 Internationalization (i18n)
Complete multi-language support with **English** and **Spanish** translations!

- **Live language switching** - No page reload required
- **Full UI translation** - Every button, label, tooltip, and modal
- **Smart fallback** - Missing translations automatically use English
- **Persistent preference** - Your language choice is saved

**How to use:** Settings → Language → Select your preferred language

### 🔍 Global Prompt Search
Search across all packs instantly with the new type-ahead search feature!

- **Fast type-ahead search** - Results update as you type
- **Cross-pack search** - Find prompts in any pack
- **Smart result cards** - Preview text, pack name, prompt number, and ratings
- **Quick navigation** - Click to jump directly to any prompt
- **Bilingual support** - Search interface fully translated

**How to use:** Click the 🔍 magnifying glass icon before the pack dropdown

### 🎨 Visual Enhancements
Settings view now features beautiful Material Design Icons:

- 🎨 **Theme** - Palette icon
- ↔️ **Size** - Resize icon
- 🌐 **Language** - Translate icon
- ⬇️ **Auto Download** - Download circle icon
- 💾 **Data Management** - Database icon
- ↔️ **Import Mode** - Swap icon

## Improvements

- ✨ Smaller pack dropdown font for better space utilization
- ✨ Smooth color transitions on search results (no more jumpy scaling)
- ✨ Subtle prompt numbers (50% opacity) in search results
- ✨ Readonly mode for star ratings in search results
- 🔒 Restricted web resource access to grok.com domains only

## What's Changed

### New Components
- `SearchModal` - Type-ahead search with instant results
- `I18nContext` - Translation infrastructure with parameter support

### Translation Files
- `locales/en.json` - Complete English translations
- `locales/es.json` - Complete Spanish translations

### Enhanced Components
All major components now support i18n:
- MainPanel, PromptView, SettingsView
- PackManager, RatingSystem
- All modal components (ConfirmDelete, ImportPack, PackSelect, Search)

## Technical Details

**Translation Coverage:**
- ✅ 130+ translation keys
- ✅ 2 languages (English, Spanish)
- ✅ Parameter interpolation (e.g., `{{packName}}`, `{{count}}`)
- ✅ Fallback mechanism for missing keys

**Statistics:**
- 15 files changed
- 901+ lines added
- 3 new files (contexts, locales)
- 12 components updated

## Upgrade Instructions

1. Load the new version in Chrome Extensions
2. All existing data is preserved (prompts, packs, settings)
3. Default language is English
4. Change language: Settings → Language → Choose Spanish or English
5. Try the new search: Click 🔍 next to pack dropdown

## Coming Soon

- 🌍 More languages (French, German, Portuguese, Japanese)
- 🔍 Advanced search filters (rating, date)
- ⌨️ Search keyboard shortcuts (Ctrl/Cmd+F)

---

**Full Changelog**: https://github.com/b2kdaman/grkgoondl/compare/v2.2.1...v2.3.0

**Built with:** React 18 • TypeScript • Vite • Tailwind CSS • Zustand • Material Design Icons
