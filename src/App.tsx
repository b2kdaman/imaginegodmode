/**
 * Main App component
 */

import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { MainPanel } from './components/MainPanel';
import { usePromptStore } from './store/usePromptStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useArrowKeyNavigation } from './hooks/useArrowKeyNavigation';
import { useVideoProgress } from './hooks/useVideoProgress';
import { I18nProvider } from './contexts/I18nContext';
import { initAnalytics } from './utils/analytics';

export const App: React.FC = () => {
  const { loadFromStorage } = usePromptStore();
  const { loadThemes } = useSettingsStore();

  // Initialize data from storage and load themes
  useEffect(() => {
    loadFromStorage();
    loadThemes();
    initAnalytics();
  }, [loadFromStorage, loadThemes]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts();

  // Set up arrow key navigation
  useArrowKeyNavigation();

  // Set up video progress watcher (button glow + progress bar)
  useVideoProgress();

  return (
    <I18nProvider>
      <MainPanel />
      <Tooltip id="app-tooltip" className="z-[999999]" />
    </I18nProvider>
  );
};
