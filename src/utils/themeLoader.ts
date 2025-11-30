/**
 * Theme loader utility - loads themes from public/themes.json
 */

export interface ThemeColors {
  BACKGROUND_DARK: string;
  BACKGROUND_MEDIUM: string;
  BACKGROUND_LIGHT: string;
  TEXT_PRIMARY: string;
  TEXT_SECONDARY: string;
  TEXT_HOVER: string;
  SHADOW: string;
  BORDER: string;
  SUCCESS: string;
  PROGRESS_BAR: string;
  GLOW_PRIMARY: string;
  GLOW_SECONDARY: string;
  GLOW_HOVER_PRIMARY: string;
  GLOW_HOVER_SECONDARY: string;
}

export type ThemesConfig = Record<string, ThemeColors>;

let cachedThemes: ThemesConfig | null = null;

/**
 * Load themes from public/themes.json
 */
export const loadThemes = async (): Promise<ThemesConfig> => {
  if (cachedThemes) {
    return cachedThemes;
  }

  try {
    const response = await fetch(chrome.runtime.getURL('themes.json'));
    if (!response.ok) {
      throw new Error(`Failed to load themes: ${response.statusText}`);
    }
    const themes = await response.json() as ThemesConfig;
    cachedThemes = themes;
    return themes;
  } catch (error) {
    console.error('[ThemeLoader] Error loading themes:', error);
    // Return fallback themes
    return getFallbackThemes();
  }
};

/**
 * Fallback themes in case JSON loading fails
 */
const getFallbackThemes = (): ThemesConfig => ({
  dark: {
    BACKGROUND_DARK: '#1a1a1a',
    BACKGROUND_MEDIUM: '#2a2a2a',
    BACKGROUND_LIGHT: '#3a3a3a',
    TEXT_PRIMARY: '#fff',
    TEXT_SECONDARY: '#b0b0b0',
    TEXT_HOVER: '#d0d0d0',
    SHADOW: 'rgba(0,0,0,0.4)',
    BORDER: 'rgba(255, 255, 255, 0.2)',
    SUCCESS: '#10b981',
    PROGRESS_BAR: 'rgba(255, 255, 255, 0.5)',
    GLOW_PRIMARY: 'rgba(255, 255, 255, 0.6)',
    GLOW_SECONDARY: 'rgba(255, 255, 255, 0.4)',
    GLOW_HOVER_PRIMARY: 'rgba(255, 255, 255, 0.8)',
    GLOW_HOVER_SECONDARY: 'rgba(255, 255, 255, 0.6)',
  },
  light: {
    BACKGROUND_DARK: '#f5f5f5',
    BACKGROUND_MEDIUM: '#ffffff',
    BACKGROUND_LIGHT: '#e8e8e8',
    TEXT_PRIMARY: '#1a1a1a',
    TEXT_SECONDARY: '#666666',
    TEXT_HOVER: '#333333',
    SHADOW: 'rgba(0,0,0,0.15)',
    BORDER: 'rgba(0, 0, 0, 0.2)',
    SUCCESS: '#059669',
    PROGRESS_BAR: 'rgba(0, 0, 0, 0.3)',
    GLOW_PRIMARY: 'rgba(0, 0, 0, 0.4)',
    GLOW_SECONDARY: 'rgba(0, 0, 0, 0.2)',
    GLOW_HOVER_PRIMARY: 'rgba(0, 0, 0, 0.5)',
    GLOW_HOVER_SECONDARY: 'rgba(0, 0, 0, 0.3)',
  },
  dracula: {
    BACKGROUND_DARK: '#282a36',
    BACKGROUND_MEDIUM: '#44475a',
    BACKGROUND_LIGHT: '#6272a4',
    TEXT_PRIMARY: '#f8f8f2',
    TEXT_SECONDARY: '#bd93f9',
    TEXT_HOVER: '#ff79c6',
    SHADOW: 'rgba(0,0,0,0.5)',
    BORDER: 'rgba(189, 147, 249, 0.3)',
    SUCCESS: '#50fa7b',
    PROGRESS_BAR: 'rgba(255, 255, 255, 1)',
    GLOW_PRIMARY: 'rgba(80, 250, 123, 0.6)',
    GLOW_SECONDARY: 'rgba(139, 233, 253, 0.4)',
    GLOW_HOVER_PRIMARY: 'rgba(80, 250, 123, 0.8)',
    GLOW_HOVER_SECONDARY: 'rgba(139, 233, 253, 0.6)',
  },
  winamp: {
    BACKGROUND_DARK: '#0C1821',
    BACKGROUND_MEDIUM: '#1B4965',
    BACKGROUND_LIGHT: '#2E8B95',
    TEXT_PRIMARY: '#00FF00',
    TEXT_SECONDARY: '#5FE3B2',
    TEXT_HOVER: '#00FFFF',
    SHADOW: 'rgba(0,0,0,0.6)',
    BORDER: 'rgba(95, 227, 178, 0.4)',
    SUCCESS: '#00FF00',
    PROGRESS_BAR: 'rgba(255, 165, 0, 1)',
    GLOW_PRIMARY: 'rgba(0, 255, 0, 0.6)',
    GLOW_SECONDARY: 'rgba(255, 165, 0, 0.4)',
    GLOW_HOVER_PRIMARY: 'rgba(0, 255, 0, 0.8)',
    GLOW_HOVER_SECONDARY: 'rgba(255, 165, 0, 0.6)',
  },
  limewire: {
    BACKGROUND_DARK: '#0a0a0a',
    BACKGROUND_MEDIUM: '#1a1a1a',
    BACKGROUND_LIGHT: '#2d2d2d',
    TEXT_PRIMARY: '#8FD14F',
    TEXT_SECONDARY: '#6FB02B',
    TEXT_HOVER: '#B4E87A',
    SHADOW: 'rgba(0,0,0,0.7)',
    BORDER: 'rgba(143, 209, 79, 0.3)',
    SUCCESS: '#8FD14F',
    PROGRESS_BAR: 'rgba(143, 209, 79, 1)',
    GLOW_PRIMARY: 'rgba(143, 209, 79, 0.6)',
    GLOW_SECONDARY: 'rgba(111, 176, 43, 0.4)',
    GLOW_HOVER_PRIMARY: 'rgba(143, 209, 79, 0.8)',
    GLOW_HOVER_SECONDARY: 'rgba(111, 176, 43, 0.6)',
  },
  steam: {
    BACKGROUND_DARK: '#171a21',
    BACKGROUND_MEDIUM: '#1b2838',
    BACKGROUND_LIGHT: '#2a475e',
    TEXT_PRIMARY: '#c7d5e0',
    TEXT_SECONDARY: '#8f98a0',
    TEXT_HOVER: '#ffffff',
    SHADOW: 'rgba(0,0,0,0.6)',
    BORDER: 'rgba(102, 192, 244, 0.3)',
    SUCCESS: '#5cb85c',
    PROGRESS_BAR: 'rgba(102, 192, 244, 1)',
    GLOW_PRIMARY: 'rgba(102, 192, 244, 0.6)',
    GLOW_SECONDARY: 'rgba(103, 193, 245, 0.4)',
    GLOW_HOVER_PRIMARY: 'rgba(102, 192, 244, 0.8)',
    GLOW_HOVER_SECONDARY: 'rgba(103, 193, 245, 0.6)',
  },
});
