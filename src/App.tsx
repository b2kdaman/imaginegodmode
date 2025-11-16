/**
 * Main App component
 */

import React, { useEffect } from 'react';
import { MainPanel } from './components/MainPanel';
import { usePromptStore } from './store/usePromptStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUrlWatcher } from './hooks/useUrlWatcher';
import { useArrowKeyNavigation } from './hooks/useArrowKeyNavigation';

export const App: React.FC = () => {
  const { loadFromStorage } = usePromptStore();

  // Initialize data from storage
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts();

  // Set up URL watcher
  useUrlWatcher();

  // Set up arrow key navigation
  useArrowKeyNavigation();

  return <MainPanel />;
};
