/**
 * Zustand store for Packs Management Modal state
 * Eliminates prop drilling and centralizes modal state management
 */

import { create } from 'zustand';

interface PacksManagementStore {
  // State
  selectedPackName: string | null;
  isPackDragging: boolean;
  draggedPromptIndex: number | null;
  statusMessage: string;
  isNotificationVisible: boolean;
  isSelectionMode: boolean;
  selectedPromptIndices: Set<number>;
  isPackSelectionMode: boolean;
  selectedPackNames: Set<string>;

  // Actions
  setSelectedPackName: (packName: string) => void;
  setIsPackDragging: (isDragging: boolean) => void;
  setDraggedPromptIndex: (index: number | null) => void;
  setStatusMessage: (message: string) => void;
  setIsNotificationVisible: (visible: boolean) => void;
  setIsSelectionMode: (isSelectionMode: boolean) => void;
  togglePromptSelection: (index: number) => void;
  selectAllPrompts: (indices: number[]) => void;
  deselectAllPrompts: () => void;
  setIsPackSelectionMode: (isPackSelectionMode: boolean) => void;
  togglePackSelection: (packName: string) => void;
  selectAllPacks: (packNames: string[]) => void;
  deselectAllPacks: () => void;
  resetState: () => void;
}

const initialState = {
  selectedPackName: null,
  isPackDragging: false,
  draggedPromptIndex: null,
  statusMessage: '',
  isNotificationVisible: false,
  isSelectionMode: false,
  selectedPromptIndices: new Set<number>(),
  isPackSelectionMode: false,
  selectedPackNames: new Set<string>(),
};

export const usePacksManagementStore = create<PacksManagementStore>((set) => ({
  ...initialState,

  setSelectedPackName: (packName) => set({ selectedPackName: packName, selectedPromptIndices: new Set() }),
  setIsPackDragging: (isDragging) => set({ isPackDragging: isDragging }),
  setDraggedPromptIndex: (index) => set({ draggedPromptIndex: index }),
  setStatusMessage: (message) => set({ statusMessage: message }),
  setIsNotificationVisible: (visible) => set({ isNotificationVisible: visible }),
  setIsSelectionMode: (isSelectionMode) => set({ isSelectionMode, selectedPromptIndices: new Set() }),
  togglePromptSelection: (index) => set((state) => {
    const newSelection = new Set(state.selectedPromptIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    return { selectedPromptIndices: newSelection };
  }),
  selectAllPrompts: (indices) => set({ selectedPromptIndices: new Set(indices) }),
  deselectAllPrompts: () => set({ selectedPromptIndices: new Set() }),
  setIsPackSelectionMode: (isPackSelectionMode) => set({ isPackSelectionMode, selectedPackNames: new Set() }),
  togglePackSelection: (packName) => set((state) => {
    const newSelection = new Set(state.selectedPackNames);
    if (newSelection.has(packName)) {
      newSelection.delete(packName);
    } else {
      newSelection.add(packName);
    }
    return { selectedPackNames: newSelection };
  }),
  selectAllPacks: (packNames) => set({ selectedPackNames: new Set(packNames) }),
  deselectAllPacks: () => set({ selectedPackNames: new Set() }),
  resetState: () => set({ ...initialState, selectedPromptIndices: new Set(), selectedPackNames: new Set() }),
}));
