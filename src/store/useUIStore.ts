/**
 * Zustand store for UI state
 */

import { create } from 'zustand';
import { ViewMode } from '@/types';

interface UIStore {
  // State
  isExpanded: boolean;
  currentView: ViewMode;

  // Actions
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
  setCurrentView: (view: ViewMode) => void;
}

// Load initial currentView from localStorage
const getInitialView = (): ViewMode => {
  try {
    const saved = localStorage.getItem('currentView');
    if (saved && ['prompt', 'ops', 'settings', 'help'].includes(saved)) {
      return saved as ViewMode;
    }
  } catch (error) {
    console.error('Failed to load currentView from localStorage:', error);
  }
  return 'prompt';
};

export const useUIStore = create<UIStore>((set) => ({
  isExpanded: true,
  currentView: getInitialView(),

  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  setCurrentView: (view) => {
    try {
      localStorage.setItem('currentView', view);
    } catch (error) {
      console.error('Failed to save currentView to localStorage:', error);
    }
    set({ currentView: view });
  },
}));
