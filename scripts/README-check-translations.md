# Translation Coverage Checker

A comprehensive utility script that analyzes translation coverage across the ImagineGodMode codebase.

## Usage

```bash
npm run check-translations
```

## What It Does

The script performs four main checks:

### 1. 📋 Translation Coverage Across Locales

Compares all locale files (`es.json`, `ru.json`, `de.json`) against the base English locale (`en.json`) to identify:
- **Missing keys**: Translation keys that exist in `en.json` but are missing in other locale files
- **Extra keys**: Translation keys that exist in other locales but not in the base English file
- **Coverage statistics**: Shows the completion percentage for each locale

**Example output:**
```
Base locale (en.json) has 256 keys

✓ de.json - Complete (256 keys)
✓ es.json - Complete (256 keys)
⚠ ru.json:
  ✗ Missing 5 keys:
    - help.features.newFeature
    - settings.newSetting
  ✓ Has 251/256 keys
```

### 2. 🔍 Hardcoded Strings Detection

Scans all component files (`.tsx`) to find potential hardcoded user-facing strings that should be using translation keys.

**What it detects:**
- String literals in JSX content (e.g., `<div>Hardcoded Text</div>`)
- String literals in common props (title, tooltip, placeholder, label, message, etc.)

**What it ignores:**
- Numbers and percentages
- Color codes (#fff, #123456)
- CSS classes and properties
- URLs and data URIs
- Icon names (mdi*)
- Constants (ALL_CAPS)
- Very short strings (< 3 characters)
- Import statements and comments

**Example output:**
```
Found 47 potential hardcoded strings:

src/components/PackManager.tsx:
  Line 58: "tooltip"
  tooltip="Manage packs and prompts"
```

### 3. 🔎 Invalid Translation Keys

Validates that all `t()` function calls in the codebase reference keys that actually exist in the base locale file.

**Example output:**
```
✗ Found 3 invalid translation keys:

  "help.nonexistent.key"
    src/components/views/HelpView.tsx
    src/components/common/Tooltip.tsx
```

### 4. 🗑️ Unused Translation Keys

Identifies translation keys that exist in the locale files but are never used in the codebase.

**Note:** Some keys may be flagged as unused but are actually used dynamically (e.g., constructed key names). Review these carefully before removing.

**Example output:**
```
Found 64 potentially unused keys:

  - tabs.oldTab
  - settings.deprecatedSetting
  - help.removedFeature
```

## Exit Codes

- **Exit 0**: No critical errors (warnings are okay)
- **Exit 1**: Critical errors found (missing translations or invalid keys)

## Understanding the Output

### ✅ Green Checkmark
Everything is good! No issues found.

### ⚠️ Yellow Warning
Potential issues that should be reviewed but won't fail the check:
- Hardcoded strings (may be false positives)
- Unused keys (may be used dynamically)

### ❌ Red X
Critical errors that need to be fixed:
- Missing translations in locale files
- Invalid translation keys referenced in code

## Integration with CI/CD

You can add this script to your CI pipeline to ensure translation coverage:

```yaml
# .github/workflows/ci.yml
- name: Check translations
  run: npm run check-translations
```

The script will exit with code 1 if critical errors are found, failing the CI build.

## Tips for Maintaining Translation Coverage

1. **Before adding new UI text:**
   - Add the key to `en.json` first
   - Add translations to all other locale files
   - Use the `t()` function in your component

2. **When removing features:**
   - Remove the translation keys from all locale files
   - The "unused keys" check will help identify orphaned keys

3. **Regular checks:**
   - Run `npm run check-translations` before commits
   - Review warnings periodically (they may indicate real issues)

4. **False positives in hardcoded strings:**
   - Very short strings (< 3 chars) are automatically ignored
   - Common patterns (numbers, colors, URLs) are automatically ignored
   - If a string shouldn't be translated (like a brand name), you can keep it hardcoded

## Common Issues and Solutions

### "Missing translations" for all locales
- **Cause**: You added new keys to `en.json` but forgot to add them to other locales
- **Solution**: Copy the new keys from `en.json` to all other locale files and translate them

### "Invalid translation keys"
- **Cause**: You used `t('some.key')` in code but the key doesn't exist in `en.json`
- **Solution**: Either add the key to `en.json` or fix the typo in your code

### Many "unused keys" warnings
- **Cause**: Keys were added but never used, or code was refactored
- **Solution**: Review each key - if truly unused, remove from all locale files

### "Hardcoded strings" false positives
- **Cause**: The script can't distinguish between user-facing text and technical strings
- **Solution**: Review each case - if it's truly user-facing, convert to use `t()`; otherwise, ignore

## Related Files

- `/src/locales/*.json` - Translation files
- `/src/contexts/I18nContext.tsx` - Translation context
- `/docs/translation-coverage-plan.md` - Translation coverage documentation
