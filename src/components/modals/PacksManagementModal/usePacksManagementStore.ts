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

  // Actions
  setSelectedPackName: (packName: string) => void;
  setIsPackDragging: (isDragging: boolean) => void;
  setDraggedPromptIndex: (index: number | null) => void;
  setStatusMessage: (message: string) => void;
  setIsNotificationVisible: (visible: boolean) => void;
  resetState: () => void;
}

const initialState = {
  selectedPackName: null,
  isPackDragging: false,
  draggedPromptIndex: null,
  statusMessage: '',
  isNotificationVisible: false,
};

export const usePacksManagementStore = create<PacksManagementStore>((set) => ({
  ...initialState,

  setSelectedPackName: (packName) => set({ selectedPackName: packName }),
  setIsPackDragging: (isDragging) => set({ isPackDragging: isDragging }),
  setDraggedPromptIndex: (index) => set({ draggedPromptIndex: index }),
  setStatusMessage: (message) => set({ statusMessage: message }),
  setIsNotificationVisible: (visible) => set({ isNotificationVisible: visible }),
  resetState: () => set(initialState),
}));
