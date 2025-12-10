/**
 * Zustand store for The Pit feature
 */

import { create } from 'zustand';
import { PitState } from '@/types';

interface PitStore extends PitState {
  // Actions
  setSelectedPostId: (id: string | null) => void;
  setManualMode: (enabled: boolean) => void;
  setManualPrompt: (text: string) => void;
  setSelectedPack: (packName: string) => void;
  setSelectedPromptIndex: (index: number) => void;
  setTries: (count: number) => void;
  setStopOnFirstSuccess: (enabled: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATE: PitState = {
  selectedPostId: null,
  manualMode: true,
  manualPrompt: '',
  selectedPack: 'Default',
  selectedPromptIndex: 0,
  tries: 3,
  stopOnFirstSuccess: false,
};

export const usePitStore = create<PitStore>((set) => ({
  // Initial state
  ...DEFAULT_STATE,

  // Set selected post ID
  setSelectedPostId: (id) => set({ selectedPostId: id }),

  // Set manual mode
  setManualMode: (enabled) => set({ manualMode: enabled }),

  // Set manual prompt text
  setManualPrompt: (text) => set({ manualPrompt: text }),

  // Set selected pack
  setSelectedPack: (packName) => set({ selectedPack: packName, selectedPromptIndex: 0 }),

  // Set selected prompt index
  setSelectedPromptIndex: (index) => set({ selectedPromptIndex: index }),

  // Set tries count
  setTries: (count) => set({ tries: count }),

  // Set stop on first success
  setStopOnFirstSuccess: (enabled) => set({ stopOnFirstSuccess: enabled }),

  // Reset to default state
  reset: () => set(DEFAULT_STATE),
}));
