# Tailwind Theme Migration Guide

## Overview

Phase 1 is complete! CSS variables are now injected dynamically based on the selected theme, and Tailwind config is updated to use them.

## Available Tailwind Classes

### Background Colors
- `bg-theme-bg-dark` → `colors.BACKGROUND_DARK`
- `bg-theme-bg-medium` → `colors.BACKGROUND_MEDIUM`
- `bg-theme-bg-light` → `colors.BACKGROUND_LIGHT`

### Text Colors
- `text-theme-text-primary` → `colors.TEXT_PRIMARY`
- `text-theme-text-secondary` → `colors.TEXT_SECONDARY`
- `text-theme-text-hover` → `colors.TEXT_HOVER`

### Border Colors
- `border-theme-border` → `colors.BORDER`

### Special Colors
- `bg-theme-success` / `text-theme-success` → `colors.SUCCESS`
- `bg-theme-danger` / `text-theme-danger` → `colors.DANGER`
- `bg-theme-progress-bar` → `colors.PROGRESS_BAR`

### Glow Colors
- `bg-theme-glow-primary` → `colors.GLOW_PRIMARY`
- `bg-theme-glow-secondary` → `colors.GLOW_SECONDARY`
- `bg-theme-glow-hover-primary` → `colors.GLOW_HOVER_PRIMARY`
- `bg-theme-glow-hover-secondary` → `colors.GLOW_HOVER_SECONDARY`

## Migration Examples

### Example 1: Simple Background + Text

**Before:**
```tsx
<div
  style={{
    backgroundColor: colors.BACKGROUND_MEDIUM,
    color: colors.TEXT_SECONDARY,
  }}
>
  Content
</div>
```

**After:**
```tsx
<div className="bg-theme-bg-medium text-theme-text-secondary">
  Content
</div>
```

### Example 2: Background with Opacity

**Before:**
```tsx
<div
  style={{
    backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
    color: colors.TEXT_PRIMARY,
  }}
>
  Content
</div>
```

**After:**
```tsx
<div className="bg-theme-bg-medium/[0.67] text-theme-text-primary">
  Content
</div>
```

Note: `aa` in hex = 170/255 ≈ 0.67 opacity

### Example 3: Border

**Before:**
```tsx
<div
  style={{
    border: `1px solid ${colors.BORDER}`,
  }}
>
  Content
</div>
```

**After:**
```tsx
<div className="border border-theme-border">
  Content
</div>
```

### Example 4: Hover States

**Before:**
```tsx
<button
  style={{
    backgroundColor: colors.BACKGROUND_MEDIUM,
    color: colors.TEXT_SECONDARY,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
    e.currentTarget.style.color = colors.TEXT_HOVER;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
    e.currentTarget.style.color = colors.TEXT_SECONDARY;
  }}
>
  Hover Me
</button>
```

**After:**
```tsx
<button className="bg-theme-bg-medium text-theme-text-secondary hover:bg-theme-bg-light hover:text-theme-text-hover transition-colors">
  Hover Me
</button>
```

### Example 5: Accent Color Buttons (Make, Make + Next)

**Before:**
```tsx
<Button
  icon={mdiPlay}
  iconColor={colors.BACKGROUND_DARK}
  style={{
    backgroundColor: colors.TEXT_PRIMARY,
    color: colors.BACKGROUND_DARK,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
    e.currentTarget.style.opacity = '0.9';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
    e.currentTarget.style.opacity = '1';
  }}
>
  Make
</Button>
```

**After:**
```tsx
<Button
  icon={mdiPlay}
  iconColor="var(--color-bg-dark)"
  className="bg-theme-text-primary text-theme-bg-dark hover:opacity-90 transition-opacity"
>
  Make
</Button>
```

### Example 6: Conditional Styling

**Before:**
```tsx
<Button
  className={autoNavigate ? '!bg-slate-400' : ''}
  style={{
    ...(autoNavigate && {
      backgroundColor: colors.TEXT_PRIMARY,
      borderColor: colors.TEXT_PRIMARY,
    }),
  }}
/>
```

**After:**
```tsx
<Button
  className={autoNavigate ? 'bg-theme-text-primary border-theme-text-primary' : ''}
/>
```

## Common Opacity Values

Hex opacity → Tailwind opacity:
- `ff` (100%) → `/100` or no suffix
- `e6` (90%) → `/90`
- `cc` (80%) → `/80`
- `b3` (70%) → `/70`
- `aa` (67%) → `/[0.67]`
- `99` (60%) → `/60`
- `80` (50%) → `/50`
- `66` (40%) → `/40`
- `4d` (30%) → `/30`
- `33` (20%) → `/20`
- `1a` (10%) → `/10`

Usage: `bg-theme-bg-medium/80` = 80% opacity

## Migration Priority

### High Priority (Most Used)
1. ✅ Button components (Make, Make + Next, Auto toggle)
2. PackManager
3. Tabs
4. MainPanel content wrapper

### Medium Priority
1. Modal components
2. Input components (textareas, inputs)
3. Rating system

### Low Priority
1. Rarely changed components
2. Legacy components

## Tips

1. **Keep inline styles for dynamic values**: If opacity/colors are calculated at runtime, keep inline styles
2. **Use Tailwind for static values**: If it's always the same color/opacity, use Tailwind
3. **Combine approaches**: You can use both Tailwind classes AND inline styles
4. **Test theme switching**: Always test with multiple themes after migration

## Testing

After migrating a component:
1. Test with all themes (Dark, Light, Dracula, Winamp, Limewire, Steam, Discord)
2. Test hover states
3. Test disabled states
4. Test mobile/desktop

## Next Steps

- [ ] Migrate Button component
- [ ] Migrate MainPanel
- [ ] Migrate Tabs
- [ ] Migrate Modal components
- [ ] Document any edge cases found during migration
