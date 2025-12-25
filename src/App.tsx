/**
 * Main App component
 */

import React, { useEffect } from 'react';
import { MainPanel } from './components/MainPanel';
import { usePromptStore } from './store/usePromptStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useUserStore } from './store/useUserStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useArrowKeyNavigation } from './hooks/useArrowKeyNavigation';
import { useVideoProgress } from './hooks/useVideoProgress';
import { I18nProvider } from './contexts/I18nContext';
import { initAnalytics } from './utils/analytics';
import { CustomTooltip } from './components/common/CustomTooltip';

export const App: React.FC = () => {
  const { loadFromStorage } = usePromptStore();
  const { loadThemes, hideUnsave, theme, getThemeColors } = useSettingsStore();
  const { loadUserId } = useUserStore();

  // Initialize data from storage and load themes
  useEffect(() => {
    loadFromStorage();
    loadThemes();
    loadUserId();
    initAnalytics();
  }, [loadFromStorage, loadThemes, loadUserId]);

  // Inject theme CSS variables for Tailwind
  useEffect(() => {
    const colors = getThemeColors();

    const styleId = 'theme-variables';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `:root {
      --color-bg-dark: ${colors.BACKGROUND_DARK};
      --color-bg-medium: ${colors.BACKGROUND_MEDIUM};
      --color-bg-light: ${colors.BACKGROUND_LIGHT};
      --color-text-primary: ${colors.TEXT_PRIMARY};
      --color-text-secondary: ${colors.TEXT_SECONDARY};
      --color-text-hover: ${colors.TEXT_HOVER};
      --color-shadow: ${colors.SHADOW};
      --color-border: ${colors.BORDER};
      --color-success: ${colors.SUCCESS};
      --color-danger: ${colors.DANGER};
      --color-progress-bar: ${colors.PROGRESS_BAR};
      --color-glow-primary: ${colors.GLOW_PRIMARY};
      --color-glow-secondary: ${colors.GLOW_SECONDARY};
      --color-glow-hover-primary: ${colors.GLOW_HOVER_PRIMARY};
      --color-glow-hover-secondary: ${colors.GLOW_HOVER_SECONDARY};
    }`;

    return () => {
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, [theme, getThemeColors]);

  // Apply CSS rule to hide Unsave button when setting is enabled (global effect)
  useEffect(() => {
    const styleId = 'hide-unsave-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (hideUnsave) {
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = 'button[aria-label="Unsave"] { display: none !important; }';
    } else {
      if (styleElement) {
        styleElement.remove();
      }
    }

    return () => {
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, [hideUnsave]);


  // Set up keyboard shortcuts
  useKeyboardShortcuts();

  // Set up arrow key navigation
  useArrowKeyNavigation();

  // Set up video progress watcher (button glow + progress bar)
  useVideoProgress();

  return (
    <I18nProvider>
      <MainPanel />
      <CustomTooltip />
    </I18nProvider>
  );
};
