/**
 * Settings store for app preferences
 */

import { create } from 'zustand';
import { loadThemes, type ThemeColors } from '@/utils/themeLoader';

export type Theme = 'dark' | 'light' | 'dracula' | 'winamp' | 'limewire' | 'steam' | 'discord';
export type Size = 'tiny' | 'small' | 'medium' | 'large';

interface SettingsState {
  theme: Theme;
  size: Size;
  autoDownload: boolean;
  rememberPostState: boolean;
  simpleShortcut: boolean;
  hideUnsave: boolean;
  enableSound: boolean;
  confirmCopyFrom: boolean;
  themes: Record<string, ThemeColors>;
  loadThemes: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setSize: (size: Size) => void;
  setAutoDownload: (autoDownload: boolean) => void;
  setRememberPostState: (rememberPostState: boolean) => void;
  setSimpleShortcut: (simpleShortcut: boolean) => void;
  setHideUnsave: (hideUnsave: boolean) => void;
  setEnableSound: (enableSound: boolean) => void;
  setConfirmCopyFrom: (confirmCopyFrom: boolean) => void;
  getThemeColors: () => ThemeColors;
  getScale: () => number;
}

const STORAGE_KEY = 'imaginegodmode-settings';

// Size to scale mapping
const SIZE_SCALE_MAP: Record<Size, number> = {
  tiny: 0.7,
  small: 0.85,
  medium: 1.0,
  large: 1.15,
};

// Load settings from localStorage
const loadSettings = (): { theme: Theme; size: Size; autoDownload: boolean; rememberPostState: boolean; simpleShortcut: boolean; hideUnsave: boolean; enableSound: boolean; confirmCopyFrom: boolean } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const validThemes: Theme[] = ['dark', 'light', 'dracula', 'winamp', 'limewire', 'steam', 'discord'];
      const validSizes: Size[] = ['tiny', 'small', 'medium', 'large'];
      return {
        theme: validThemes.includes(parsed.theme) ? parsed.theme : 'dark',
        size: validSizes.includes(parsed.size) ? parsed.size : 'medium',
        autoDownload: typeof parsed.autoDownload === 'boolean' ? parsed.autoDownload : false,
        rememberPostState: typeof parsed.rememberPostState === 'boolean' ? parsed.rememberPostState : true,
        simpleShortcut: typeof parsed.simpleShortcut === 'boolean' ? parsed.simpleShortcut : false,
        hideUnsave: typeof parsed.hideUnsave === 'boolean' ? parsed.hideUnsave : false,
        enableSound: typeof parsed.enableSound === 'boolean' ? parsed.enableSound : true,
        confirmCopyFrom: typeof parsed.confirmCopyFrom === 'boolean' ? parsed.confirmCopyFrom : true,
      };
    }
  } catch (error) {
    console.error('[Settings] Failed to load from localStorage:', error);
  }
  return { theme: 'dark', size: 'medium', autoDownload: false, rememberPostState: true, simpleShortcut: false, hideUnsave: false, enableSound: true, confirmCopyFrom: true };
};

// Save settings to localStorage
const saveSettings = (theme: Theme, size: Size, autoDownload: boolean, rememberPostState: boolean, simpleShortcut: boolean, hideUnsave: boolean, enableSound: boolean, confirmCopyFrom: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom }));
  } catch (error) {
    console.error('[Settings] Failed to save to localStorage:', error);
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadSettings(),
  themes: {},

  loadThemes: async () => {
    const themes = await loadThemes();
    set({ themes });
  },

  setTheme: (theme: Theme) => {
    const { size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom } = get();
    saveSettings(theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom);
    set({ theme });
  },

  setSize: (size: Size) => {
    const { theme, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom } = get();
    saveSettings(theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom);
    set({ size });
  },

  setAutoDownload: (autoDownload: boolean) => {
    const { theme, size, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom } = get();
    saveSettings(theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom);
    set({ autoDownload });
  },

  setRememberPostState: (rememberPostState: boolean) => {
    const { theme, size, autoDownload, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom } = get();
    saveSettings(theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom);
    set({ rememberPostState });
  },

  setSimpleShortcut: (simpleShortcut: boolean) => {
    const { theme, size, autoDownload, rememberPostState, hideUnsave, enableSound, confirmCopyFrom } = get();
    saveSettings(theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom);
    set({ simpleShortcut });
  },

  setHideUnsave: (hideUnsave: boolean) => {
    const { theme, size, autoDownload, rememberPostState, simpleShortcut, enableSound, confirmCopyFrom } = get();
    saveSettings(theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom);
    set({ hideUnsave });
  },

  setEnableSound: (enableSound: boolean) => {
    const { theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, confirmCopyFrom } = get();
    saveSettings(theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom);
    set({ enableSound });
  },

  setConfirmCopyFrom: (confirmCopyFrom: boolean) => {
    const { theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound } = get();
    saveSettings(theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableSound, confirmCopyFrom);
    set({ confirmCopyFrom });
  },

  getThemeColors: () => {
    const { theme, themes } = get();
    return themes[theme] || themes['dark'] || {};
  },

  getScale: () => {
    const { size } = get();
    return SIZE_SCALE_MAP[size];
  },
}));
