/**
 * Main App component
 */

import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { MainPanel } from './components/MainPanel';
import { usePromptStore } from './store/usePromptStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useUserStore } from './store/useUserStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useArrowKeyNavigation } from './hooks/useArrowKeyNavigation';
import { useVideoProgress } from './hooks/useVideoProgress';
import { I18nProvider } from './contexts/I18nContext';
import { initAnalytics } from './utils/analytics';

export const App: React.FC = () => {
  const { loadFromStorage } = usePromptStore();
  const { loadThemes, hideUnsave } = useSettingsStore();
  const { loadUserId } = useUserStore();

  // Initialize data from storage and load themes
  useEffect(() => {
    loadFromStorage();
    loadThemes();
    loadUserId();
    initAnalytics();
  }, [loadFromStorage, loadThemes, loadUserId]);

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
      <Tooltip id="app-tooltip" className="z-[999999] !text-xs !max-w-[20rem]" />
    </I18nProvider>
  );
};
