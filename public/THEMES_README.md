# Themes Configuration

Themes are now configurable via the `themes.json` file in this directory.

## File Location

`public/themes.json`

## Theme Structure

Each theme must define the following color properties:

```json
{
  "theme-name": {
    "BACKGROUND_DARK": "#hexcolor",
    "BACKGROUND_MEDIUM": "#hexcolor",
    "BACKGROUND_LIGHT": "#hexcolor",
    "TEXT_PRIMARY": "#hexcolor",
    "TEXT_SECONDARY": "#hexcolor",
    "TEXT_HOVER": "#hexcolor",
    "SHADOW": "rgba(r,g,b,a)",
    "BORDER": "rgba(r,g,b,a)",
    "SUCCESS": "#hexcolor",
    "PROGRESS_BAR": "rgba(r,g,b,a)",
    "GLOW_PRIMARY": "rgba(r,g,b,a)",
    "GLOW_SECONDARY": "rgba(r,g,b,a)",
    "GLOW_HOVER_PRIMARY": "rgba(r,g,b,a)",
    "GLOW_HOVER_SECONDARY": "rgba(r,g,b,a)"
  }
}
```

## Available Themes

- **dark**: Classic dark theme with neutral grays
- **light**: Clean light theme with white backgrounds
- **dracula**: Popular Dracula color scheme with purple/pink accents
- **winamp**: Retro Winamp-inspired theme with teal backgrounds and green LED text

## Adding Custom Themes

1. Open `public/themes.json`
2. Add a new theme object with all required color properties
3. Update `src/store/useSettingsStore.ts` to add the theme name to the `Theme` type
4. Update `src/components/SettingsView.tsx` to add the theme option to the dropdown
5. Rebuild the extension: `npm run build`

## Color Properties Explained

- **BACKGROUND_DARK**: Darkest background (panel background)
- **BACKGROUND_MEDIUM**: Medium background (buttons, inputs)
- **BACKGROUND_LIGHT**: Lightest background (hover states)
- **TEXT_PRIMARY**: Main text color
- **TEXT_SECONDARY**: Secondary/muted text
- **TEXT_HOVER**: Text color on hover
- **SHADOW**: Box shadow color
- **BORDER**: Border color
- **SUCCESS**: Success indicator color (checkmarks, etc.)
- **PROGRESS_BAR**: Video progress bar color
- **GLOW_PRIMARY**: Primary glow effect color
- **GLOW_SECONDARY**: Secondary glow effect color
- **GLOW_HOVER_PRIMARY**: Primary glow on hover
- **GLOW_HOVER_SECONDARY**: Secondary glow on hover

## Notes

- Colors can be hex (`#RRGGBB`) or rgba (`rgba(r,g,b,a)`)
- The extension will load themes on startup from this JSON file
- If loading fails, fallback themes are hardcoded in `src/utils/themeLoader.ts`
- Changes to `themes.json` require rebuilding the extension
