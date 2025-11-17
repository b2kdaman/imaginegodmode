/**
 * Main App component
 */

import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { MainPanel } from './components/MainPanel';
import { usePromptStore } from './store/usePromptStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useArrowKeyNavigation } from './hooks/useArrowKeyNavigation';
import { useVideoProgress } from './hooks/useVideoProgress';

export const App: React.FC = () => {
  const { loadFromStorage } = usePromptStore();

  // Initialize data from storage
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts();

  // Set up arrow key navigation
  useArrowKeyNavigation();

  // Set up video progress watcher (button glow + progress bar)
  useVideoProgress();

  return (
    <>
      <MainPanel />
      <Tooltip id="app-tooltip" className="z-[999999]" />
    </>
  );
};
