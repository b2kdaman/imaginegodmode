/**
 * Settings store for app preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loadThemes, type ThemeColors } from '@/utils/themeLoader';

export type Theme = 'dark' | 'light' | 'dracula' | 'winamp' | 'limewire' | 'steam' | 'discord';
export type Size = 'tiny' | 'small' | 'medium' | 'large';
export type ListLimit = 100 | 200 | 500 | 1000;

interface SettingsState {
  // Persisted settings
  theme: Theme;
  size: Size;
  autoDownload: boolean;
  rememberPostState: boolean;
  simpleShortcut: boolean;
  hideUnsave: boolean;
  enableThePit: boolean;
  enableSound: boolean;
  confirmCopyFrom: boolean;
  globalPromptAddonEnabled: boolean;
  globalPromptAddon: string;
  listLimit: ListLimit;

  // Non-persisted state
  themes: Record<string, ThemeColors>;

  // Actions
  loadThemes: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setSize: (size: Size) => void;
  setAutoDownload: (autoDownload: boolean) => void;
  setRememberPostState: (rememberPostState: boolean) => void;
  setSimpleShortcut: (simpleShortcut: boolean) => void;
  setHideUnsave: (hideUnsave: boolean) => void;
  setEnableThePit: (enableThePit: boolean) => void;
  setEnableSound: (enableSound: boolean) => void;
  setConfirmCopyFrom: (confirmCopyFrom: boolean) => void;
  setGlobalPromptAddonEnabled: (enabled: boolean) => void;
  setGlobalPromptAddon: (addon: string) => void;
  setListLimit: (limit: ListLimit) => void;
  getThemeColors: () => ThemeColors;
  getScale: () => number;
}

// Size to scale mapping
const SIZE_SCALE_MAP: Record<Size, number> = {
  tiny: 0.7,
  small: 0.85,
  medium: 1.0,
  large: 1.15,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default settings
      theme: 'dark',
      size: 'medium',
      autoDownload: false,
      rememberPostState: true,
      simpleShortcut: false,
      hideUnsave: false,
      enableThePit: false,
      enableSound: true,
      confirmCopyFrom: true,
      globalPromptAddonEnabled: false,
      globalPromptAddon: '',
      listLimit: 100,
      themes: {},

      // Actions
      loadThemes: async () => {
        const themes = await loadThemes();
        set({ themes });
      },

      setTheme: (theme: Theme) => set({ theme }),
      setSize: (size: Size) => set({ size }),
      setAutoDownload: (autoDownload: boolean) => set({ autoDownload }),
      setRememberPostState: (rememberPostState: boolean) => set({ rememberPostState }),
      setSimpleShortcut: (simpleShortcut: boolean) => set({ simpleShortcut }),
      setHideUnsave: (hideUnsave: boolean) => set({ hideUnsave }),
      setEnableThePit: (enableThePit: boolean) => set({ enableThePit }),
      setEnableSound: (enableSound: boolean) => set({ enableSound }),
      setConfirmCopyFrom: (confirmCopyFrom: boolean) => set({ confirmCopyFrom }),
      setGlobalPromptAddonEnabled: (globalPromptAddonEnabled: boolean) => set({ globalPromptAddonEnabled }),
      setGlobalPromptAddon: (globalPromptAddon: string) => set({ globalPromptAddon }),
      setListLimit: (listLimit: ListLimit) => set({ listLimit }),

      getThemeColors: () => {
        const { theme, themes } = get();
        return themes[theme] || themes['dark'] || {};
      },

      getScale: () => {
        const { size } = get();
        return SIZE_SCALE_MAP[size];
      },
    }),
    {
      name: 'imaginegodmode-settings',
      partialize: (state) => ({
        theme: state.theme,
        size: state.size,
        autoDownload: state.autoDownload,
        rememberPostState: state.rememberPostState,
        simpleShortcut: state.simpleShortcut,
        hideUnsave: state.hideUnsave,
        enableThePit: state.enableThePit,
        enableSound: state.enableSound,
        confirmCopyFrom: state.confirmCopyFrom,
        globalPromptAddonEnabled: state.globalPromptAddonEnabled,
        globalPromptAddon: state.globalPromptAddon,
        listLimit: state.listLimit,
      }),
    }
  )
);
