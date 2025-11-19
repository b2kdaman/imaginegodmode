/**
 * Zustand store for prompt management
 */

import { create } from 'zustand';
import { PromptItem, Packs } from '@/types';
import { getStorage, setStorage, exportPack, importPack } from '@/utils/storage';

interface PromptStore {
  // State
  packs: Packs;
  currentPack: string;
  currentIndex: number;
  isLoading: boolean;

  // Actions
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;

  // Pack actions
  setCurrentPack: (pack: string) => void;
  addPack: (name: string) => void;
  deletePack: (name: string) => void;

  // Prompt actions
  setCurrentIndex: (index: number) => void;
  addPrompt: () => void;
  removePrompt: () => void;
  updatePromptText: (text: string) => void;
  updatePromptRating: (rating: number) => void;
  nextPrompt: () => void;
  prevPrompt: () => void;

  // Computed
  getCurrentPrompt: () => PromptItem | null;
  getCurrentPromptCount: () => number;

  // Import/Export
  exportCurrentPack: () => void;
  importPack: (file: File, mode: 'add' | 'replace') => Promise<{ success: boolean; error?: string; packName?: string }>;
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  // Initial state
  packs: { Default: [{ text: '', rating: 0 }] },
  currentPack: 'Default',
  currentIndex: 0,
  isLoading: false,

  // Load from chrome storage
  loadFromStorage: async () => {
    set({ isLoading: true });
    const data = await getStorage();

    if (data) {
      set({
        packs: data.packs,
        currentPack: data.currentPack,
        currentIndex: data.currentIndex,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  // Save to chrome storage
  saveToStorage: async () => {
    const { packs, currentPack, currentIndex } = get();
    await setStorage({ packs, currentPack, currentIndex });
  },

  // Pack actions
  setCurrentPack: (pack) => {
    set({ currentPack: pack, currentIndex: 0 });
    get().saveToStorage();
  },

  addPack: (name) => {
    const { packs } = get();
    if (!packs[name]) {
      set({
        packs: {
          ...packs,
          [name]: [{ text: '', rating: 0 }],
        },
        currentPack: name,
        currentIndex: 0,
      });
      get().saveToStorage();
    }
  },

  deletePack: (name) => {
    const { packs, currentPack } = get();
    const packNames = Object.keys(packs);

    // Don't delete if it's the only pack
    if (packNames.length <= 1) return;

    const newPacks = { ...packs };
    delete newPacks[name];

    // Switch to first pack if deleting current
    const newCurrentPack =
      currentPack === name ? Object.keys(newPacks)[0] : currentPack;

    set({
      packs: newPacks,
      currentPack: newCurrentPack,
      currentIndex: 0,
    });
    get().saveToStorage();
  },

  // Prompt actions
  setCurrentIndex: (index) => {
    set({ currentIndex: index });
    get().saveToStorage();
  },

  addPrompt: () => {
    const { packs, currentPack } = get();
    const currentPrompts = packs[currentPack] || [];

    set({
      packs: {
        ...packs,
        [currentPack]: [...currentPrompts, { text: '', rating: 0 }],
      },
      currentIndex: currentPrompts.length,
    });
    get().saveToStorage();
  },

  removePrompt: () => {
    const { packs, currentPack, currentIndex } = get();
    const currentPrompts = packs[currentPack] || [];

    // Don't remove if it's the only prompt
    if (currentPrompts.length <= 1) return;

    const newPrompts = currentPrompts.filter((_, i) => i !== currentIndex);
    const newIndex = Math.min(currentIndex, newPrompts.length - 1);

    set({
      packs: {
        ...packs,
        [currentPack]: newPrompts,
      },
      currentIndex: newIndex,
    });
    get().saveToStorage();
  },

  updatePromptText: (text) => {
    const { packs, currentPack, currentIndex } = get();
    const currentPrompts = [...(packs[currentPack] || [])];

    if (currentPrompts[currentIndex]) {
      currentPrompts[currentIndex] = {
        ...currentPrompts[currentIndex],
        text,
      };

      set({
        packs: {
          ...packs,
          [currentPack]: currentPrompts,
        },
      });
      get().saveToStorage();
    }
  },

  updatePromptRating: (rating) => {
    const { packs, currentPack, currentIndex } = get();
    const currentPrompts = [...(packs[currentPack] || [])];

    if (currentPrompts[currentIndex]) {
      currentPrompts[currentIndex] = {
        ...currentPrompts[currentIndex],
        rating,
      };

      set({
        packs: {
          ...packs,
          [currentPack]: currentPrompts,
        },
      });
      get().saveToStorage();
    }
  },

  nextPrompt: () => {
    const { currentIndex } = get();
    const count = get().getCurrentPromptCount();
    const newIndex = currentIndex < count - 1 ? currentIndex + 1 : 0;
    set({ currentIndex: newIndex });
    get().saveToStorage();
  },

  prevPrompt: () => {
    const { currentIndex } = get();
    const count = get().getCurrentPromptCount();
    const newIndex = currentIndex > 0 ? currentIndex - 1 : count - 1;
    set({ currentIndex: newIndex });
    get().saveToStorage();
  },

  // Computed
  getCurrentPrompt: () => {
    const { packs, currentPack, currentIndex } = get();
    const prompts = packs[currentPack] || [];
    return prompts[currentIndex] || null;
  },

  getCurrentPromptCount: () => {
    const { packs, currentPack } = get();
    return (packs[currentPack] || []).length;
  },

  // Import/Export
  exportCurrentPack: () => {
    const { packs, currentPack } = get();
    const prompts = packs[currentPack] || [];
    exportPack(currentPack, prompts);
  },

  importPack: async (file: File, mode: 'add' | 'replace') => {
    const { packs } = get();
    const result = await importPack(file, mode, packs);

    if (result.success && result.packs && result.packName) {
      // Update packs
      set({
        packs: result.packs,
        currentPack: result.packName, // Switch to imported pack
        currentIndex: 0,
      });

      // Save to storage
      await get().saveToStorage();

      return { success: true, packName: result.packName };
    }

    return { success: false, error: result.error };
  },
}));
