/**
 * Zustand store for prompt management
 */

import { create } from 'zustand';
import { PromptItem, Packs } from '@/types';
import { getStorage, setStorage, exportPack, importPack, getPostState, setPostState } from '@/utils/storage';
import {
  trackPromptCreated,
  trackPromptDeleted,
  trackPromptRated,
  trackPackCreated,
  trackPackDeleted,
  trackPackSwitched,
  trackPackExported,
  trackPackImported,
} from '@/utils/analytics';

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
  clearAllPacks: () => void;

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
  importPack: (file: File, mode: 'add' | 'replace') => Promise<{ success: boolean; error?: string; packName?: string; importedCount?: number }>;

  // Per-post state management
  loadPostState: (postId: string) => Promise<void>;
  savePostState: (postId: string) => Promise<void>;
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

    if (data && data.packs && typeof data.packs === 'object') {
      // Validate that we have at least one pack
      const packNames = Object.keys(data.packs);
      if (packNames.length === 0) {
        // No packs found, use default
        set({ isLoading: false });
        return;
      }

      // Ensure currentPack exists in packs
      const validCurrentPack = data.packs[data.currentPack]
        ? data.currentPack
        : packNames[0];

      set({
        packs: data.packs,
        currentPack: validCurrentPack,
        currentIndex: data.currentIndex || 0,
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
    trackPackSwitched(pack);
  },

  addPack: (name) => {
    const { packs } = get();

    // Safety check: ensure packs exists
    if (!packs) {
      set({
        packs: { [name]: [{ text: '', rating: 0 }] },
        currentPack: name,
        currentIndex: 0,
      });
      get().saveToStorage();
      return;
    }

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
      trackPackCreated();
    }
  },

  deletePack: (name) => {
    const { packs, currentPack } = get();

    // Safety check: ensure packs exists
    if (!packs) {return;}

    const packNames = Object.keys(packs);

    // Don't delete if it's the only pack
    if (packNames.length <= 1) {return;}

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
    trackPackDeleted();
  },

  clearAllPacks: () => {
    // Reset to default state with one empty pack
    set({
      packs: { Default: [{ text: '', rating: 0 }] },
      currentPack: 'Default',
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
    trackPromptCreated();
  },

  removePrompt: () => {
    const { packs, currentPack, currentIndex } = get();
    const currentPrompts = packs[currentPack] || [];

    // Don't remove if it's the only prompt
    if (currentPrompts.length <= 1) {return;}

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
    trackPromptDeleted();
  },

  updatePromptText: (text) => {
    const { packs, currentPack, currentIndex } = get();
    const currentPrompts = [...(packs[currentPack] || [])];

    // Ensure we have prompts and valid index
    if (currentPrompts.length === 0 || !currentPrompts[currentIndex]) {
      return;
    }

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
  },

  updatePromptRating: (rating) => {
    const { packs, currentPack, currentIndex } = get();
    const currentPrompts = [...(packs[currentPack] || [])];

    // Ensure we have prompts and valid index
    if (currentPrompts.length === 0 || !currentPrompts[currentIndex]) {
      return;
    }

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
    trackPromptRated(rating);
  },

  nextPrompt: () => {
    const { currentIndex } = get();
    const count = get().getCurrentPromptCount();

    // Don't navigate if no prompts
    if (count === 0) {return;}

    const newIndex = currentIndex < count - 1 ? currentIndex + 1 : 0;
    set({ currentIndex: newIndex });
    get().saveToStorage();
  },

  prevPrompt: () => {
    const { currentIndex } = get();
    const count = get().getCurrentPromptCount();

    // Don't navigate if no prompts
    if (count === 0) {return;}

    const newIndex = currentIndex > 0 ? currentIndex - 1 : count - 1;
    set({ currentIndex: newIndex });
    get().saveToStorage();
  },

  // Computed
  getCurrentPrompt: () => {
    const { packs, currentPack, currentIndex } = get();

    // Safety check: ensure packs exists and currentPack exists
    if (!packs || !currentPack || !packs[currentPack]) {
      return null;
    }

    const prompts = packs[currentPack];
    return prompts[currentIndex] || null;
  },

  getCurrentPromptCount: () => {
    const { packs, currentPack } = get();

    // Safety check: ensure packs exists and currentPack exists
    if (!packs || !currentPack || !packs[currentPack]) {
      return 0;
    }

    return packs[currentPack].length;
  },

  // Import/Export
  exportCurrentPack: () => {
    const { packs, currentPack } = get();
    const prompts = packs[currentPack] || [];
    exportPack(currentPack, prompts);
    trackPackExported(prompts.length);
  },

  importPack: async (file: File, mode: 'add' | 'replace') => {
    const { packs } = get();
    const result = await importPack(file, mode, packs);

    if (result.success && result.packs) {
      // Update packs
      const newState: Partial<PromptStore> = {
        packs: result.packs,
        currentIndex: 0,
      };

      // For single pack import, switch to imported pack
      // For multi-pack import, stay on current pack or switch to first imported pack
      if (result.packName) {
        newState.currentPack = result.packName;
      } else if (result.importedCount && result.importedCount > 1) {
        // Multi-pack import: switch to first imported pack
        const importedPackNames = Object.keys(result.packs).filter(name => !packs[name]);
        if (importedPackNames.length > 0) {
          newState.currentPack = importedPackNames[0];
        }
      }

      set(newState);

      // Save to storage
      await get().saveToStorage();

      // Track import with prompt count
      if (result.packName) {
        const importedPrompts = result.packs[result.packName] || [];
        trackPackImported(mode, importedPrompts.length);
      }

      return {
        success: true,
        packName: result.packName,
        importedCount: result.importedCount
      };
    }

    return { success: false, error: result.error };
  },

  // Per-post state management
  loadPostState: async (postId: string) => {
    const state = await getPostState(postId);

    if (state) {
      const { packs } = get();

      // Validate that the pack exists in current packs
      const validPack = packs[state.currentPack] ? state.currentPack : Object.keys(packs)[0];
      const packPrompts = packs[validPack] || [];
      const validIndex = Math.min(state.currentIndex, Math.max(0, packPrompts.length - 1));

      set({
        currentPack: validPack,
        currentIndex: validIndex,
      });
    }
  },

  savePostState: async (postId: string) => {
    const { currentPack, currentIndex } = get();
    await setPostState(postId, { currentPack, currentIndex });
  },
}));
