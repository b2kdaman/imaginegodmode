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
  packOrder: string[]; // Order of pack names
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
  deletePacksByNames: (packNames: string[]) => void;
  renamePack: (oldName: string, newName: string) => void;
  reorderPacks: (newOrder: string[]) => void;
  clearAllPacks: () => void;
  movePromptToPack: (promptIndex: number, sourcePack: string, targetPack: string) => void;

  // Prompt actions
  setCurrentIndex: (index: number) => void;
  addPrompt: () => void;
  removePrompt: () => void;
  updatePromptText: (text: string) => void;
  updatePromptRating: (rating: number) => void;
  nextPrompt: () => void;
  prevPrompt: () => void;
  reorderPrompts: (packName: string, dragIndex: number, hoverIndex: number) => void;
  deletePromptByIndex: (packName: string, index: number) => void;
  deletePromptsByIndices: (packName: string, indices: number[]) => void;
  updatePromptByIndex: (packName: string, index: number, text: string) => void;
  addPromptToPack: (packName: string, text?: string) => void;
  duplicatePromptByIndex: (packName: string, index: number) => void;

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
  packOrder: ['Default'],
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

      // Restore pack order or create default order
      let packOrder = data.packOrder || packNames;
      // Ensure all packs are in the order (add missing ones)
      const missingPacks = packNames.filter(name => !packOrder.includes(name));
      if (missingPacks.length > 0) {
        packOrder = [...packOrder, ...missingPacks];
      }
      // Remove deleted packs from order
      packOrder = packOrder.filter(name => packNames.includes(name));

      set({
        packs: data.packs,
        packOrder,
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
    const { packs, packOrder, currentPack, currentIndex } = get();
    await setStorage({ packs, packOrder, currentPack, currentIndex });
  },

  // Pack actions
  setCurrentPack: (pack) => {
    set({ currentPack: pack, currentIndex: 0 });
    get().saveToStorage();
    trackPackSwitched(pack);
  },

  addPack: (name) => {
    const { packs, packOrder } = get();

    // Safety check: ensure packs exists
    if (!packs) {
      set({
        packs: { [name]: [{ text: '', rating: 0 }] },
        packOrder: [name],
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
        packOrder: [...packOrder, name],
        currentPack: name,
        currentIndex: 0,
      });
      get().saveToStorage();
      trackPackCreated();
    }
  },

  deletePack: (name) => {
    const { packs, packOrder, currentPack } = get();

    // Safety check: ensure packs exists
    if (!packs) {return;}

    const packNames = Object.keys(packs);

    // If deleting the last pack, create a new default pack
    if (packNames.length <= 1) {
      const defaultPack = 'Default';
      set({
        packs: { [defaultPack]: [{ text: '', rating: 0 }] },
        packOrder: [defaultPack],
        currentPack: defaultPack,
        currentIndex: 0,
      });
      get().saveToStorage();
      trackPackDeleted();
      return;
    }

    const newPacks = { ...packs };
    delete newPacks[name];

    // Remove from pack order
    const newPackOrder = packOrder.filter(p => p !== name);

    // Switch to first pack if deleting current
    const newCurrentPack =
      currentPack === name ? newPackOrder[0] : currentPack;

    set({
      packs: newPacks,
      packOrder: newPackOrder,
      currentPack: newCurrentPack,
      currentIndex: 0,
    });
    get().saveToStorage();
    trackPackDeleted();
  },

  deletePacksByNames: (packNames) => {
    const { packs, packOrder, currentPack } = get();

    // Safety check: ensure packs exists
    if (!packs || packNames.length === 0) {return;}

    const allPackNames = Object.keys(packs);

    // If deleting all packs, create a new default pack
    if (packNames.length >= allPackNames.length) {
      const defaultPack = 'Default';
      set({
        packs: { [defaultPack]: [{ text: '', rating: 0 }] },
        packOrder: [defaultPack],
        currentPack: defaultPack,
        currentIndex: 0,
      });
      get().saveToStorage();
      // Track each deletion
      packNames.forEach(() => trackPackDeleted());
      return;
    }

    const packNamesSet = new Set(packNames);
    const newPacks = { ...packs };

    // Delete all specified packs
    packNames.forEach(name => {
      delete newPacks[name];
    });

    // Remove from pack order
    const newPackOrder = packOrder.filter(p => !packNamesSet.has(p));

    // Switch to first remaining pack if current pack was deleted
    const newCurrentPack = packNamesSet.has(currentPack) ? newPackOrder[0] : currentPack;

    set({
      packs: newPacks,
      packOrder: newPackOrder,
      currentPack: newCurrentPack,
      currentIndex: 0,
    });
    get().saveToStorage();
    // Track each deletion
    packNames.forEach(() => trackPackDeleted());
  },

  renamePack: (oldName, newName) => {
    const { packs, packOrder, currentPack } = get();

    // Validation: old pack must exist, new name must not exist and not be empty
    if (!packs[oldName] || packs[newName] || !newName.trim()) {
      return;
    }

    const newPacks = { ...packs };
    newPacks[newName] = newPacks[oldName];
    delete newPacks[oldName];

    // Update pack order with new name
    const newPackOrder = packOrder.map(name => name === oldName ? newName : name);

    set({
      packs: newPacks,
      packOrder: newPackOrder,
      currentPack: currentPack === oldName ? newName : currentPack,
    });
    get().saveToStorage();
  },

  reorderPacks: (newOrder) => {
    set({ packOrder: newOrder });
    get().saveToStorage();
  },

  clearAllPacks: () => {
    // Reset to default state with one empty pack
    set({
      packs: { Default: [{ text: '', rating: 0 }] },
      packOrder: ['Default'],
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

  reorderPrompts: (packName, dragIndex, hoverIndex) => {
    const { packs } = get();

    if (dragIndex === hoverIndex || !packs[packName]) {
      return;
    }

    const prompts = [...packs[packName]];
    const [removed] = prompts.splice(dragIndex, 1);
    prompts.splice(hoverIndex, 0, removed);

    set({
      packs: {
        ...packs,
        [packName]: prompts,
      },
    });
    get().saveToStorage();
  },

  movePromptToPack: (promptIndex, sourcePack, targetPack) => {
    const { packs } = get();

    // Validation
    if (!packs[sourcePack] || !packs[targetPack] || sourcePack === targetPack) {
      return;
    }

    // Get the prompt to move
    const sourcePrompts = [...packs[sourcePack]];
    const promptToMove = sourcePrompts[promptIndex];

    if (!promptToMove) {return;}

    // Don't allow moving if it's the only prompt in source pack
    if (sourcePrompts.length <= 1) {return;}

    // Remove from source pack
    sourcePrompts.splice(promptIndex, 1);

    // Add to target pack
    const targetPrompts = [...packs[targetPack], promptToMove];

    // Update state
    set({
      packs: {
        ...packs,
        [sourcePack]: sourcePrompts,
        [targetPack]: targetPrompts,
      },
    });

    get().saveToStorage();
  },

  deletePromptByIndex: (packName, index) => {
    const { packs, currentPack } = get();
    const prompts = packs[packName];

    if (!prompts || index < 0 || index >= prompts.length) {
      return;
    }

    const newPrompts = prompts.filter((_, i) => i !== index);

    // If deleting from current pack, reset to first prompt
    const updates: any = {
      packs: {
        ...packs,
        [packName]: newPrompts,
      },
    };

    if (packName === currentPack) {
      updates.currentIndex = 0;
    }

    set(updates);

    get().saveToStorage();
    trackPromptDeleted();
  },

  deletePromptsByIndices: (packName, indices) => {
    const { packs, currentPack } = get();
    const prompts = packs[packName];

    if (!prompts || indices.length === 0) {
      return;
    }

    const indicesSet = new Set(indices);
    const newPrompts = prompts.filter((_, i) => !indicesSet.has(i));

    // If deleting from current pack, reset to first prompt
    const updates: any = {
      packs: {
        ...packs,
        [packName]: newPrompts,
      },
    };

    if (packName === currentPack) {
      updates.currentIndex = 0;
    }

    set(updates);

    get().saveToStorage();
    // Track each deletion
    indices.forEach(() => trackPromptDeleted());
  },

  updatePromptByIndex: (packName, index, text) => {
    const { packs } = get();
    const prompts = packs[packName];

    if (!prompts || index < 0 || index >= prompts.length) {
      return;
    }

    const newPrompts = [...prompts];
    newPrompts[index] = {
      ...newPrompts[index],
      text,
    };

    set({
      packs: {
        ...packs,
        [packName]: newPrompts,
      },
    });

    get().saveToStorage();
  },

  addPromptToPack: (packName, text = '') => {
    const { packs } = get();
    const prompts = packs[packName];

    if (!prompts) {
      return;
    }

    const newPrompt: PromptItem = {
      text,
      rating: 0,
    };

    const newPrompts = [...prompts, newPrompt];

    set({
      packs: {
        ...packs,
        [packName]: newPrompts,
      },
    });

    get().saveToStorage();
    trackPromptCreated();
  },

  duplicatePromptByIndex: (packName, index) => {
    const { packs } = get();
    const prompts = packs[packName];

    if (!prompts || index < 0 || index >= prompts.length) {
      return;
    }

    const promptToDuplicate = prompts[index];
    const duplicatedPrompt: PromptItem = {
      text: promptToDuplicate.text,
      rating: promptToDuplicate.rating,
    };

    const newPrompts = [...prompts];
    newPrompts.splice(index + 1, 0, duplicatedPrompt);

    set({
      packs: {
        ...packs,
        [packName]: newPrompts,
      },
    });

    get().saveToStorage();
    trackPromptCreated();
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
