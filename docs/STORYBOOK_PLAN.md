# Storybook Implementation Plan for ImagineGodMode

## 📋 Project Analysis

**Current Stack:**
- React 18.3.1 + TypeScript 5.5.3
- Vite 5.3.3 build tool
- Tailwind CSS for styling
- Zustand for state management
- Chrome extension with @crxjs/vite-plugin
- 30 React components across multiple categories

---

## 🎯 Implementation Plan

### **Phase 1: Installation & Setup**

**1.1 Install Storybook Dependencies**
```bash
npm install --save-dev @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/blocks @storybook/test storybook
```

**1.2 Initialize Storybook**
```bash
npx storybook@latest init --type react-vite
```

**1.3 Additional Addons for Chrome Extension Context**
```bash
npm install --save-dev @storybook/addon-themes @storybook/addon-a11y
```

---

### **Phase 2: Configuration**

**2.1 Storybook Main Configuration** (`.storybook/main.ts`)
```typescript
import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Merge with project's Vite config
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    };

    // Define globals for Chrome extension context
    config.define = {
      ...config.define,
      __APP_VERSION__: JSON.stringify('2.9.1'),
    };

    return config;
  },
};

export default config;
```

**2.2 Preview Configuration** (`.storybook/preview.ts`)
```typescript
import type { Preview } from '@storybook/react';
import '../src/index.css'; // Import Tailwind CSS

// Import theme colors
import { THEMES } from '../src/utils/themeLoader';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a1a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
```

---

### **Phase 3: Component Story Organization**

**3.1 Story Structure**
```
src/
├── components/
│   ├── inputs/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx          ← NEW
│   │   ├── Toggle.tsx
│   │   ├── Toggle.stories.tsx          ← NEW
│   │   ├── Dropdown.tsx
│   │   ├── Dropdown.stories.tsx        ← NEW
│   │   ├── Tabs.tsx
│   │   ├── Tabs.stories.tsx            ← NEW
│   │   └── RatingSystem.tsx
│   │       └── RatingSystem.stories.tsx ← NEW
│   ├── common/
│   │   ├── Icon.tsx
│   │   ├── Icon.stories.tsx            ← NEW
│   │   ├── VersionBadge.tsx
│   │   ├── VersionBadge.stories.tsx    ← NEW
│   │   ├── PanelControls.tsx
│   │   ├── PanelControls.stories.tsx   ← NEW
│   │   └── UpscaleQueueIndicator.tsx
│   │       └── UpscaleQueueIndicator.stories.tsx ← NEW
│   ├── buttons/
│   │   ├── PauseButton.tsx
│   │   ├── PauseButton.stories.tsx     ← NEW
│   │   ├── FullscreenButton.tsx
│   │   └── FullscreenButton.stories.tsx ← NEW
│   ├── modals/
│   │   ├── BaseModal.tsx
│   │   ├── BaseModal.stories.tsx       ← NEW
│   │   └── shared/
│   │       ├── PostGrid.tsx
│   │       ├── PostGrid.stories.tsx    ← NEW
│   │       ├── ProgressBar.tsx
│   │       ├── ProgressBar.stories.tsx ← NEW
│   │       ├── SelectionControls.tsx
│   │       └── SelectionControls.stories.tsx ← NEW
│   └── views/
│       └── (complex views - document later)
```

---

### **Phase 4: Priority Components for Stories**

**High Priority (Reusable UI Components):**
1. ✅ **Button** - Primary UI component with variants
2. ✅ **Toggle** - Settings control
3. ✅ **Dropdown** - Input component
4. ✅ **Tabs** - Navigation component
5. ✅ **Icon** - Icon wrapper with MDI
6. ✅ **RatingSystem** - Star rating component
7. ✅ **BaseModal** - Modal foundation
8. ✅ **ProgressBar** - Shared progress component
9. ✅ **SelectionControls** - Bulk action controls
10. ✅ **VersionBadge** - Version display

**Medium Priority:**
11. PanelControls - Control button group
12. UpscaleQueueIndicator - Queue status
13. PauseButton - Media control
14. FullscreenButton - Media control
15. PostGrid - Grid layout component

**Low Priority (Complex/View Components):**
- PackManager
- MainPanel
- View components (PromptView, OpsView, SettingsView, HelpView)
- Complex modals (SearchModal, ConfirmDeleteModal, etc.)

---

### **Phase 5: Mock Data & Decorators**

**5.1 Create Mock Providers** (`.storybook/decorators.tsx`)
```typescript
import React from 'react';
import type { Decorator } from '@storybook/react';

// Mock Zustand stores
export const withMockStores: Decorator = (Story) => {
  // Mock store providers here
  return <Story />;
};

// Mock theme provider
export const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'dark';
  return (
    <div data-theme={theme}>
      <Story />
    </div>
  );
};

// Mock i18n provider
export const withI18n: Decorator = (Story) => {
  // Mock translation context
  return <Story />;
};
```

**5.2 Create Mock Data** (`src/__mocks__/`)
```
src/__mocks__/
├── postData.ts          - Mock post data
├── packData.ts          - Mock pack data
├── themeData.ts         - Theme configurations
└── storeData.ts         - Mock store states
```

---

### **Phase 6: Example Story Templates**

**6.1 Button.stories.tsx** (Example)
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { mdiHeart, mdiDownload } from '@mdi/js';

const meta = {
  title: 'Components/Inputs/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    icon: mdiHeart,
    children: 'Like',
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'icon',
    icon: mdiDownload,
    tooltip: 'Download',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled',
    disabled: true,
  },
};
```

---

### **Phase 7: NPM Scripts**

Add to `package.json`:
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "storybook:test": "test-storybook"
  }
}
```

---

### **Phase 8: Documentation**

**8.1 Introduction Page** (`.storybook/Introduction.mdx`)
- Project overview
- Component library guide
- Design system documentation
- Theme showcase

**8.2 Component Documentation**
- Props tables (auto-generated)
- Usage examples
- Accessibility notes
- Best practices

---

## 📦 **Implementation Steps Summary**

1. **Install** Storybook and addons
2. **Configure** `.storybook/main.ts` and `.storybook/preview.ts`
3. **Create** mock data and decorators
4. **Write stories** for high-priority components (10 components)
5. **Test** stories with `npm run storybook`
6. **Document** component usage and patterns
7. **Build** static Storybook for deployment (`npm run build-storybook`)
8. **Deploy** (optional) to GitHub Pages or Chromatic

---

## ⚡ **Benefits**

✅ **Component isolation** - Test components independently
✅ **Visual testing** - See all component states at a glance
✅ **Documentation** - Auto-generated prop tables and examples
✅ **Theme testing** - Test all 7 themes easily
✅ **Accessibility** - Built-in a11y addon
✅ **Developer experience** - Faster development workflow
✅ **Design system** - Living style guide

---

## 🚀 **Next Steps**

Ready to implement? Start with Phase 1 and work through each phase sequentially. Each phase builds on the previous one, ensuring a smooth implementation process.

For questions or modifications to this plan, refer to the project's main documentation or consult with the development team.

---

**Document Version:** 1.0
**Created:** 2025-01-06
**Last Updated:** 2025-01-06
