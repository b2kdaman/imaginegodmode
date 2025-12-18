/**
 * Zustand store for UI state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewMode } from '@/types';

interface UIStore {
  // Persisted state
  currentView: ViewMode;

  // Non-persisted state
  isExpanded: boolean;

  // Actions
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
  setCurrentView: (view: ViewMode) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Default state
      isExpanded: true,
      currentView: 'prompt',

      // Actions
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setExpanded: (expanded) => set({ isExpanded: expanded }),
      setCurrentView: (view) => set({ currentView: view }),
    }),
    {
      name: 'currentView',
      partialize: (state) => ({ currentView: state.currentView }),
    }
  )
);
