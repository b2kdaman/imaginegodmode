/**
 * Settings store for app preferences
 */

import { create } from 'zustand';
import { loadThemes, type ThemeColors } from '@/utils/themeLoader';

export type Theme = 'dark' | 'light' | 'dracula' | 'winamp';
export type Size = 'tiny' | 'small' | 'medium' | 'large';

interface SettingsState {
  theme: Theme;
  size: Size;
  autoDownload: boolean;
  themes: Record<string, ThemeColors>;
  loadThemes: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setSize: (size: Size) => void;
  setAutoDownload: (autoDownload: boolean) => void;
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
const loadSettings = (): { theme: Theme; size: Size; autoDownload: boolean } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const validThemes: Theme[] = ['dark', 'light', 'dracula', 'winamp'];
      const validSizes: Size[] = ['tiny', 'small', 'medium', 'large'];
      return {
        theme: validThemes.includes(parsed.theme) ? parsed.theme : 'dark',
        size: validSizes.includes(parsed.size) ? parsed.size : 'medium',
        autoDownload: typeof parsed.autoDownload === 'boolean' ? parsed.autoDownload : false,
      };
    }
  } catch (error) {
    console.error('[Settings] Failed to load from localStorage:', error);
  }
  return { theme: 'dark', size: 'medium', autoDownload: false };
};

// Save settings to localStorage
const saveSettings = (theme: Theme, size: Size, autoDownload: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, size, autoDownload }));
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
    const { size, autoDownload } = get();
    saveSettings(theme, size, autoDownload);
    set({ theme });
  },

  setSize: (size: Size) => {
    const { theme, autoDownload } = get();
    saveSettings(theme, size, autoDownload);
    set({ size });
  },

  setAutoDownload: (autoDownload: boolean) => {
    const { theme, size } = get();
    saveSettings(theme, size, autoDownload);
    set({ autoDownload });
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
