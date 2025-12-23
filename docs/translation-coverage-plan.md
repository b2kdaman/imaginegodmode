# Translation Coverage Plan - ImagineGodMode

**Document Version:** 1.0
**Date:** 2025-12-23
**Project:** ImagineGodMode Browser Extension
**Current Languages:** English (en), Spanish (es), Russian (ru), German (de)

---

## Executive Summary

This document provides a comprehensive audit of translation coverage across the ImagineGodMode extension and identifies all hardcoded strings that need to be migrated to the i18n system. The project currently has **258 translation keys** in the base English locale, with support for 4 languages.

### Coverage Status
- **✅ Fully Translated:** ~85% of UI strings
- **⚠️ Partially Translated:** ~10% (tooltips in HelpView)
- **❌ Not Translated:** ~5% (hardcoded section titles, feature descriptions, keyboard shortcuts)

---

## Current Translation Infrastructure

### Translation Files Location
- **Path:** `/src/locales/`
- **Files:**
  - `en.json` - English (base) - 258 lines
  - `es.json` - Spanish - 297 lines
  - `ru.json` - Russian - 406 lines
  - `de.json` - German - 312 lines

### Translation Context System
- **Implementation:** `/src/contexts/I18nContext.tsx`
- **Hook:** `useTranslation()` returns `{ locale, setLocale, t }`
- **Translation Function:** `t(key: string, params?: Record<string, string | number>)`
- **Features:**
  - Nested keys with dot notation (e.g., `t('settings.packsAndPrompts')`)
  - Parameter interpolation: `{{paramName}}`
  - Automatic fallback to English
  - localStorage persistence (`i18n_locale`)

### Current Translation Structure

```
en.json
├── tabs (6 keys)
├── common (14 keys)
├── panel (3 keys)
├── prompt (8 keys)
├── settings (60+ keys)
│   ├── themes (7 keys)
│   ├── sizes (4 keys)
│   ├── languages (4 keys)
│   └── tooltips (10 keys)
├── ops (10 keys)
├── help (40+ keys)
│   ├── features (7 keys)
│   ├── shortcuts (5 keys)
│   └── tooltips (24 keys)
├── packManager (5 keys)
└── modals (80+ keys)
    ├── likeManagement
    ├── confirmDelete
    ├── confirmDeletion
    ├── delete
    ├── download
    ├── unlike
    ├── upscale
    ├── like
    ├── unlikedArchive
    ├── importPack
    ├── selectPack
    ├── searchPrompts
    └── purge
```

---

## Components Analysis

### 1. HelpView.tsx (`/src/components/views/HelpView.tsx`)

**Translation Status:** ⚠️ Partially Translated

#### Section Titles (HARDCODED - Need Translation)
| Line | Current Value | Proposed Key | Priority |
|------|---------------|--------------|----------|
| 53 | `"Available Features"` | `help.sections.availableFeatures` | HIGH |
| 87 | `"Keyboard Shortcuts"` | `help.sections.keyboardShortcuts` | HIGH |
| 244 | `"About"` | `help.sections.about` | HIGH |
| 267 | `"Sign In"` | `help.sections.signIn` | HIGH |

#### Feature Descriptions (HARDCODED - Need Translation)
Lines 21-41 contain 21 feature text strings that are hardcoded:

| Line | Feature Text | Proposed Key |
|------|--------------|--------------|
| 21 | "Firefox and Chrome cross-browser support" | `help.features.crossBrowser` |
| 22 | "Save and organize prompts with packs" | `help.features.saveOrganize` |
| 23 | "Create, delete, and switch between packs" | `help.features.packManagement` |
| 24 | "Rate prompts with 1-5 star ratings" | `help.features.ratePrompts` |
| 25 | "Navigate prompts with arrow keys" | `help.features.arrowKeys` |
| 26 | "Import and export packs (add or replace mode)" | `help.features.importExport` |
| 27 | "Generate new packs with AI using Grok prompt templates" | `help.features.aiGenerate` |
| 28 | "Download images and videos (when all videos are HD)" | `help.features.downloadMedia` |
| 29 | "Parallel video upscaling to HD quality" | `help.features.parallelUpscale` |
| 30 | "Bulk operations: Delete, upscale, relike, unlike posts" | `help.features.bulkOperations` |
| 31 | "Purge all data feature for complete data cleanup" | `help.features.purgeData` |
| 32 | "Shift-click batch selection in bulk operations modal" | `help.features.batchSelection` |
| 33 | "Make + Next: Automate prompt application and post navigation" | `help.features.makeNext` |
| 34 | "Real-time video generation progress" | `help.features.realtimeProgress` |
| 35 | "Play/pause video control" | `help.features.playPause` |
| 36 | "Fullscreen video playback" | `help.features.fullscreen` |
| 37 | "Hide unsave button option" | `help.features.hideUnsave` |
| 38 | "Theme customization (Dark, Light, Dracula, Winamp, LimeWire, Steam, Discord)" | `help.features.themeCustomization` |
| 39 | "UI size scaling (Tiny to Large)" | `help.features.uiScaling` |
| 40 | "Auto-download media when generation completes" | `help.features.autoDownloadMedia` |
| 41 | "Multi-language support (English, Spanish, Russian)" | `help.features.multiLanguage` |

**Note:** Tooltips for these features are already using `t('help.tooltips.*')` - Good!

#### Keyboard Shortcuts (HARDCODED - Need Translation)
| Line | Shortcut Description | Proposed Key |
|------|---------------------|--------------|
| 132 | "Make a Video" | `help.shortcuts.descriptions.makeVideo` |
| 180 | "Copy & Make" | `help.shortcuts.descriptions.copyMake` |
| 206 | "Navigate videos" | `help.shortcuts.descriptions.navigateVideos` |
| 221 | "Toggle fullscreen" | `help.shortcuts.descriptions.toggleFullscreen` |
| 236 | "Play/pause video" | `help.shortcuts.descriptions.playPause` |

#### Keyboard Labels (HARDCODED - Should be Translation Keys)
| Line | Key Label | Proposed Key |
|------|-----------|--------------|
| 107, 144 | "Ctrl" | `help.shortcuts.keys.ctrl` |
| 118, 155 | "Cmd" | `help.shortcuts.keys.cmd` |
| 129 | "Enter" | `help.shortcuts.keys.enter` |
| 166 | "Shift" | `help.shortcuts.keys.shift` |
| 192, 203 | "←", "→" | `help.shortcuts.keys.arrowLeft`, `help.shortcuts.keys.arrowRight` |
| 218 | "F" | `help.shortcuts.keys.f` |
| 233 | "Space" | `help.shortcuts.keys.space` |

#### About Section (HARDCODED - Need Translation)
| Line | Content | Proposed Key |
|------|---------|--------------|
| 257 | "Chrome/Firefox extension for Grok media management" | `help.about.description` |
| 258 | "by b2kdaman" | `help.about.author` |
| 259 | "Firefox support by wyntre" | `help.about.firefoxSupport` |
| 282 | "Sign in to X.ai" | `help.signIn.linkText` |

---

### 2. OpsView.tsx (`/src/components/views/OpsView.tsx`)

**Translation Status:** ⚠️ Partially Translated

#### Section Titles (HARDCODED - Need Translation)
| Line | Current Value | Proposed Key | Priority |
|------|---------------|--------------|----------|
| 421 | `"Bulk Actions"` | `ops.sections.bulkActions` | HIGH |

#### Button Tooltips (HARDCODED - Need Translation)
| Line | Current Value | Proposed Key | Priority |
|------|---------------|--------------|----------|
| 437 | `"Upscale videos from multiple liked posts"` | `ops.tooltips.upscaleAllLiked` | HIGH |
| 448 | `"Download all media from multiple liked posts"` | `ops.tooltips.downloadAllLiked` | HIGH |
| 459 | `"Unlike posts or re-like from archive"` | `ops.tooltips.manageLikes` | HIGH |
| 479 | `"Delete multiple posts permanently"` | `ops.tooltips.deleteMultiple` | MEDIUM |

#### Button Labels (HARDCODED - Need Translation)
| Line | Current Value | Proposed Key | Priority |
|------|---------------|--------------|----------|
| 439 | `"Upscale All Liked"` | `ops.buttons.upscaleAllLiked` | HIGH |
| 450 | `"Download All Liked"` | `ops.buttons.downloadAllLiked` | HIGH |
| 461 | `"Manage Likes"` | `ops.buttons.manageLikes` | HIGH |
| 439, 450, 461 | `"Loading"` | `common.loading` | HIGH |

---

### 3. PromptView.tsx (`/src/components/views/PromptView.tsx`)

**Translation Status:** ⚠️ Partially Translated

#### Modal Confirmation (HARDCODED - Need Translation)
| Line | Current Value | Proposed Key | Priority |
|------|---------------|--------------|----------|
| 602 | `"Replace Prompt Text?"` | `modals.confirmReplace.title` | HIGH |
| 603 | `"This will replace the current prompt text. Are you sure you want to continue?"` | `modals.confirmReplace.message` | HIGH |
| 604 | `"Replace"` | `modals.confirmReplace.confirmText` | HIGH |

#### Status Messages (HARDCODED - Need Translation)
| Line | Current Value | Proposed Key | Priority |
|------|---------------|--------------|----------|
| 389 | `"Navigate to a post to manage prompts"` | `prompt.status.navigateToPost` | MEDIUM |

---

### 4. PitView.tsx (`/src/components/views/PitView.tsx`)

**Translation Status:** ⚠️ Partially Translated

#### Tooltips (HARDCODED - Need Translation)
| Line | Current Value | Proposed Key | Priority |
|------|---------------|--------------|----------|
| 288 | `"Previous post"` | `pit.navigation.previousPost` | MEDIUM |
| 346 | `"Next post"` | `pit.navigation.nextPost` | MEDIUM |
| 388 | `"Enter your prompt..."` | `pit.prompt.placeholder` | MEDIUM |
| 443 | `"Previous prompt"` | `pit.navigation.previousPrompt` | MEDIUM |
| 455 | `"Next prompt"` | `pit.navigation.nextPrompt` | MEDIUM |
| 571 | `"Under construction"` | `pit.status.underConstruction` | LOW |

---

### 5. SettingsView.tsx (`/src/components/views/SettingsView.tsx`)

**Translation Status:** ✅ Fully Translated

All section titles and settings are already using the i18n system via `t('settings.*')` keys. No action needed.

---

### 6. QueueView.tsx (`/src/components/views/QueueView.tsx`)

**Translation Status:** ✅ Assumed Fully Translated

Queue view uses job status and progress indicators. Would need to verify for any hardcoded strings.

---

### 7. MainPanel.tsx (`/src/components/MainPanel.tsx`)

**Translation Status:** ✅ Fully Translated

Tab names and panel controls are using `t('tabs.*')` and `t('panel.*')` keys.

---

## Implementation Roadmap

### Phase 1: High Priority Strings (CRITICAL)
**Estimated Keys to Add:** 50-60

1. **HelpView Section Titles** (4 keys)
   - Add `help.sections.*` keys for all CollapsibleSection titles

2. **HelpView Feature Descriptions** (21 keys)
   - Move hardcoded feature text to `help.features.*`
   - Keep existing `help.tooltips.*` unchanged

3. **HelpView Keyboard Shortcuts** (5 keys)
   - Add `help.shortcuts.descriptions.*` for action descriptions

4. **OpsView Bulk Actions** (7 keys)
   - Add `ops.sections.bulkActions`
   - Add `ops.tooltips.*` for all button tooltips
   - Add `ops.buttons.*` for button labels

5. **PromptView Modals** (3 keys)
   - Add `modals.confirmReplace.*` for replace confirmation

### Phase 2: Medium Priority Strings
**Estimated Keys to Add:** 15-20

1. **HelpView Keyboard Labels** (7 keys)
   - Add `help.shortcuts.keys.*` for keyboard key labels

2. **HelpView About Section** (4 keys)
   - Add `help.about.*` and `help.signIn.*`

3. **PitView Navigation** (5 keys)
   - Add `pit.navigation.*` and `pit.prompt.*`

4. **PromptView Status Messages** (1 key)
   - Add `prompt.status.*`

### Phase 3: Low Priority / Future Enhancements
**Estimated Keys to Add:** 5-10

1. **PitView Construction Status** (1 key)
2. **Common Loading States** (1 key - `common.loading`)
3. **Any remaining edge cases discovered during testing**

### Phase 4: Quality Assurance

1. **Translation Verification**
   - Verify all 4 languages (en, es, ru, de) have complete coverage
   - Test RTL language support if needed in future
   - Ensure parameter interpolation works correctly

2. **Visual Testing**
   - Test all UI sections in each language
   - Verify text doesn't overflow containers
   - Check tooltip positioning with different text lengths

3. **Fallback Testing**
   - Verify English fallback works for missing keys
   - Test behavior with incomplete translations

---

## Translation Key Additions Summary

### New Keys to Add by Category

#### help.sections (4 keys)
```json
"help": {
  "sections": {
    "availableFeatures": "Available Features",
    "keyboardShortcuts": "Keyboard Shortcuts",
    "about": "About",
    "signIn": "Sign In"
  }
}
```

#### help.features (21 keys - replace hardcoded text)
```json
"help": {
  "features": {
    "crossBrowser": "Firefox and Chrome cross-browser support",
    "saveOrganize": "Save and organize prompts with packs",
    "packManagement": "Create, delete, and switch between packs",
    // ... (18 more features)
  }
}
```

#### help.shortcuts.descriptions (5 keys)
```json
"help": {
  "shortcuts": {
    "descriptions": {
      "makeVideo": "Make a Video",
      "copyMake": "Copy & Make",
      "navigateVideos": "Navigate videos",
      "toggleFullscreen": "Toggle fullscreen",
      "playPause": "Play/pause video"
    }
  }
}
```

#### help.shortcuts.keys (7 keys)
```json
"help": {
  "shortcuts": {
    "keys": {
      "ctrl": "Ctrl",
      "cmd": "Cmd",
      "enter": "Enter",
      "shift": "Shift",
      "arrowLeft": "←",
      "arrowRight": "→",
      "f": "F",
      "space": "Space"
    }
  }
}
```

#### help.about (4 keys)
```json
"help": {
  "about": {
    "description": "Chrome/Firefox extension for Grok media management",
    "author": "by b2kdaman",
    "firefoxSupport": "Firefox support by wyntre"
  },
  "signIn": {
    "linkText": "Sign in to X.ai"
  }
}
```

#### ops.sections (1 key)
```json
"ops": {
  "sections": {
    "bulkActions": "Bulk Actions"
  }
}
```

#### ops.tooltips (4 keys)
```json
"ops": {
  "tooltips": {
    "upscaleAllLiked": "Upscale videos from multiple liked posts",
    "downloadAllLiked": "Download all media from multiple liked posts",
    "manageLikes": "Unlike posts or re-like from archive",
    "deleteMultiple": "Delete multiple posts permanently"
  }
}
```

#### ops.buttons (3 keys)
```json
"ops": {
  "buttons": {
    "upscaleAllLiked": "Upscale All Liked",
    "downloadAllLiked": "Download All Liked",
    "manageLikes": "Manage Likes"
  }
}
```

#### common (1 new key)
```json
"common": {
  "loading": "Loading"
}
```

#### modals.confirmReplace (3 keys)
```json
"modals": {
  "confirmReplace": {
    "title": "Replace Prompt Text?",
    "message": "This will replace the current prompt text. Are you sure you want to continue?",
    "confirmText": "Replace"
  }
}
```

#### prompt.status (1 key)
```json
"prompt": {
  "status": {
    "navigateToPost": "Navigate to a post to manage prompts"
  }
}
```

#### pit.navigation (4 keys)
```json
"pit": {
  "navigation": {
    "previousPost": "Previous post",
    "nextPost": "Next post",
    "previousPrompt": "Previous prompt",
    "nextPrompt": "Next prompt"
  },
  "prompt": {
    "placeholder": "Enter your prompt..."
  },
  "status": {
    "underConstruction": "Under construction"
  }
}
```

---

## Total Key Count

| Category | Current Keys | New Keys | Total After Migration |
|----------|-------------|----------|----------------------|
| help | ~47 | +42 | ~89 |
| ops | 10 | +8 | 18 |
| modals | ~80 | +3 | ~83 |
| prompt | 8 | +1 | 9 |
| pit | 0 | +7 | 7 |
| common | 14 | +1 | 15 |
| **TOTAL** | **~258** | **~62** | **~320** |

---

## Component-by-Component Implementation Checklist

### HelpView.tsx
- [ ] Replace section title props with `t('help.sections.*')`
- [ ] Move feature text array to use `t('help.features.*')`
- [ ] Replace keyboard shortcut descriptions with `t('help.shortcuts.descriptions.*')`
- [ ] Replace keyboard key labels with `t('help.shortcuts.keys.*')`
- [ ] Replace About section text with `t('help.about.*')`
- [ ] Replace Sign In link text with `t('help.signIn.linkText')`
- [ ] Add all new keys to en.json
- [ ] Translate all new keys to es.json
- [ ] Translate all new keys to ru.json
- [ ] Translate all new keys to de.json

### OpsView.tsx
- [ ] Replace "Bulk Actions" title with `t('ops.sections.bulkActions')`
- [ ] Replace button labels with `t('ops.buttons.*')`
- [ ] Replace button tooltips with `t('ops.tooltips.*')`
- [ ] Replace "Loading" with `t('common.loading')`
- [ ] Add all new keys to all language files

### PromptView.tsx
- [ ] Replace ConfirmModal props with `t('modals.confirmReplace.*')`
- [ ] Replace status message with `t('prompt.status.navigateToPost')`
- [ ] Add all new keys to all language files

### PitView.tsx
- [ ] Replace navigation tooltips with `t('pit.navigation.*')`
- [ ] Replace prompt placeholder with `t('pit.prompt.placeholder')`
- [ ] Replace status message with `t('pit.status.underConstruction')`
- [ ] Add all new keys to all language files

---

## File Modification Summary

### Files Requiring Changes
1. `/src/locales/en.json` - Add ~62 new keys
2. `/src/locales/es.json` - Add ~62 new keys
3. `/src/locales/ru.json` - Add ~62 new keys
4. `/src/locales/de.json` - Add ~62 new keys
5. `/src/components/views/HelpView.tsx` - Replace hardcoded strings with `t()` calls
6. `/src/components/views/OpsView.tsx` - Replace hardcoded strings with `t()` calls
7. `/src/components/views/PromptView.tsx` - Replace hardcoded strings with `t()` calls
8. `/src/components/views/PitView.tsx` - Replace hardcoded strings with `t()` calls

### Files Already Compliant
- `/src/components/views/SettingsView.tsx` ✅
- `/src/components/MainPanel.tsx` ✅
- `/src/contexts/I18nContext.tsx` ✅

---

## Testing Strategy

### Manual Testing Checklist
For each language (en, es, ru, de):
- [ ] Switch to language in Settings
- [ ] Navigate to Help tab
  - [ ] Verify section titles are translated
  - [ ] Verify all feature descriptions are translated
  - [ ] Verify keyboard shortcuts are translated
  - [ ] Verify About section is translated
- [ ] Navigate to Ops tab
  - [ ] Verify Bulk Actions section title is translated
  - [ ] Verify all button labels are translated
  - [ ] Verify all tooltips are translated
- [ ] Navigate to Prompt tab
  - [ ] Trigger replace confirmation modal
  - [ ] Verify modal content is translated
- [ ] Navigate to The Pit tab (if enabled)
  - [ ] Verify navigation tooltips are translated
  - [ ] Verify prompt placeholder is translated

### Automated Testing Considerations
- Unit tests for translation key existence
- Snapshot tests for each language
- Visual regression tests for UI overflow/truncation
- E2E tests for language switching

---

## Migration Notes

### Best Practices
1. **Maintain Consistency:** Use existing naming patterns in locale files
2. **Parameter Interpolation:** Use `{{paramName}}` syntax for dynamic values
3. **Nested Structure:** Keep related keys grouped under common parent keys
4. **Fallback Strategy:** Always ensure English (en) is complete as the fallback language
5. **String Length:** Consider translation expansion (some languages are 30% longer)

### Known Issues to Address
1. **Dynamic Theme Names:** Theme names in dropdown are hardcoded but have translation keys - ensure dropdown uses `t()` function
2. **Language List Updates:** "Multi-language support" feature description needs to include German
3. **Keyboard Key Localization:** Consider if key labels should be localized (e.g., "Ctrl" vs "Strg" in German)

### Future Considerations
1. **Additional Languages:** Framework supports easy addition of new languages
2. **RTL Support:** May need CSS updates for Arabic/Hebrew in future
3. **Pluralization:** Current system uses simple `{{plural}}` - may need more sophisticated plural rules
4. **Date/Number Formatting:** Not currently in scope but may be needed for timestamps

---

## Appendix: Related Files

### Core i18n Files
- `/src/contexts/I18nContext.tsx` - Translation context provider
- `/src/locales/en.json` - English translations (base)
- `/src/locales/es.json` - Spanish translations
- `/src/locales/ru.json` - Russian translations
- `/src/locales/de.json` - German translations

### Component Files with Hardcoded Strings
- `/src/components/views/HelpView.tsx:21-41` - Feature descriptions array
- `/src/components/views/HelpView.tsx:53,87,244,267` - Section titles
- `/src/components/views/HelpView.tsx:132,180,206,221,236` - Keyboard shortcut descriptions
- `/src/components/views/HelpView.tsx:257-259,282` - About section content
- `/src/components/views/OpsView.tsx:421,437,448,459,479` - Bulk actions strings
- `/src/components/views/PromptView.tsx:602-604` - Modal confirmation
- `/src/components/views/PitView.tsx:288,346,388,443,455,571` - Navigation and status

### Store Files (Settings)
- `/src/store/useSettingsStore.ts` - Settings store including language preference

---

## Conclusion

This translation coverage plan identifies **~62 new translation keys** needed across **4 component files** to achieve 100% i18n coverage. The implementation is organized into 4 phases based on priority, with HelpView and OpsView being the highest priority targets.

**Next Steps:**
1. Review and approve this plan
2. Begin Phase 1 implementation (High Priority strings)
3. Add keys to all 4 language files simultaneously
4. Update component files to use `t()` function
5. Test thoroughly in all languages
6. Deploy and monitor for any missed strings

**Estimated Effort:**
- Translation key additions: ~2-3 hours
- Component modifications: ~3-4 hours
- Testing across 4 languages: ~2-3 hours
- **Total:** ~7-10 hours

---

**Document Maintained By:** Translation Team
**Last Updated:** 2025-12-23
**Next Review:** After Phase 1 completion
