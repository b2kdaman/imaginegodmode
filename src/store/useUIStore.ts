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

export const useUIStore = create<UIStore>((set) => ({
  isExpanded: true,
  currentView: 'prompt',

  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  setCurrentView: (view) => set({ currentView: view }),
}));
