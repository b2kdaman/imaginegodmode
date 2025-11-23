/**
 * Settings store for app preferences
 */

import { create } from 'zustand';
import { loadThemes, type ThemeColors } from '@/utils/themeLoader';

export type Theme = 'dark' | 'light' | 'dracula' | 'winamp' | 'limewire' | 'steam';
export type Size = 'tiny' | 'small' | 'medium' | 'large';

interface SettingsState {
  theme: Theme;
  size: Size;
  autoDownload: boolean;
  rememberPostState: boolean;
  themes: Record<string, ThemeColors>;
  loadThemes: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setSize: (size: Size) => void;
  setAutoDownload: (autoDownload: boolean) => void;
  setRememberPostState: (rememberPostState: boolean) => void;
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
const loadSettings = (): { theme: Theme; size: Size; autoDownload: boolean; rememberPostState: boolean } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const validThemes: Theme[] = ['dark', 'light', 'dracula', 'winamp', 'limewire', 'steam'];
      const validSizes: Size[] = ['tiny', 'small', 'medium', 'large'];
      return {
        theme: validThemes.includes(parsed.theme) ? parsed.theme : 'dark',
        size: validSizes.includes(parsed.size) ? parsed.size : 'medium',
        autoDownload: typeof parsed.autoDownload === 'boolean' ? parsed.autoDownload : false,
        rememberPostState: typeof parsed.rememberPostState === 'boolean' ? parsed.rememberPostState : true,
      };
    }
  } catch (error) {
    console.error('[Settings] Failed to load from localStorage:', error);
  }
  return { theme: 'dark', size: 'medium', autoDownload: false, rememberPostState: true };
};

// Save settings to localStorage
const saveSettings = (theme: Theme, size: Size, autoDownload: boolean, rememberPostState: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, size, autoDownload, rememberPostState }));
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
    const { size, autoDownload, rememberPostState } = get();
    saveSettings(theme, size, autoDownload, rememberPostState);
    set({ theme });
  },

  setSize: (size: Size) => {
    const { theme, autoDownload, rememberPostState } = get();
    saveSettings(theme, size, autoDownload, rememberPostState);
    set({ size });
  },

  setAutoDownload: (autoDownload: boolean) => {
    const { theme, size, rememberPostState } = get();
    saveSettings(theme, size, autoDownload, rememberPostState);
    set({ autoDownload });
  },

  setRememberPostState: (rememberPostState: boolean) => {
    const { theme, size, autoDownload } = get();
    saveSettings(theme, size, autoDownload, rememberPostState);
    set({ rememberPostState });
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
