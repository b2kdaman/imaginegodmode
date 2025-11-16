/**
 * Zustand store for prompt management
 */

import { create } from 'zustand';
import { PromptItem, Categories } from '@/types';
import { getStorage, setStorage } from '@/utils/storage';

interface PromptStore {
  // State
  categories: Categories;
  currentCategory: string;
  currentIndex: number;
  isLoading: boolean;

  // Actions
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;

  // Category actions
  setCurrentCategory: (category: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;

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
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  // Initial state
  categories: { Default: [{ text: '', rating: 0 }] },
  currentCategory: 'Default',
  currentIndex: 0,
  isLoading: false,

  // Load from chrome storage
  loadFromStorage: async () => {
    set({ isLoading: true });
    const data = await getStorage();

    if (data) {
      set({
        categories: data.categories,
        currentCategory: data.currentCategory,
        currentIndex: data.currentIndex,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  // Save to chrome storage
  saveToStorage: async () => {
    const { categories, currentCategory, currentIndex } = get();
    await setStorage({ categories, currentCategory, currentIndex });
  },

  // Category actions
  setCurrentCategory: (category) => {
    set({ currentCategory: category, currentIndex: 0 });
    get().saveToStorage();
  },

  addCategory: (name) => {
    const { categories } = get();
    if (!categories[name]) {
      set({
        categories: {
          ...categories,
          [name]: [{ text: '', rating: 0 }],
        },
        currentCategory: name,
        currentIndex: 0,
      });
      get().saveToStorage();
    }
  },

  deleteCategory: (name) => {
    const { categories, currentCategory } = get();
    const categoryNames = Object.keys(categories);

    // Don't delete if it's the only category
    if (categoryNames.length <= 1) return;

    const newCategories = { ...categories };
    delete newCategories[name];

    // Switch to first category if deleting current
    const newCurrentCategory =
      currentCategory === name ? Object.keys(newCategories)[0] : currentCategory;

    set({
      categories: newCategories,
      currentCategory: newCurrentCategory,
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
    const { categories, currentCategory } = get();
    const currentPrompts = categories[currentCategory] || [];

    set({
      categories: {
        ...categories,
        [currentCategory]: [...currentPrompts, { text: '', rating: 0 }],
      },
      currentIndex: currentPrompts.length,
    });
    get().saveToStorage();
  },

  removePrompt: () => {
    const { categories, currentCategory, currentIndex } = get();
    const currentPrompts = categories[currentCategory] || [];

    // Don't remove if it's the only prompt
    if (currentPrompts.length <= 1) return;

    const newPrompts = currentPrompts.filter((_, i) => i !== currentIndex);
    const newIndex = Math.min(currentIndex, newPrompts.length - 1);

    set({
      categories: {
        ...categories,
        [currentCategory]: newPrompts,
      },
      currentIndex: newIndex,
    });
    get().saveToStorage();
  },

  updatePromptText: (text) => {
    const { categories, currentCategory, currentIndex } = get();
    const currentPrompts = [...(categories[currentCategory] || [])];

    if (currentPrompts[currentIndex]) {
      currentPrompts[currentIndex] = {
        ...currentPrompts[currentIndex],
        text,
      };

      set({
        categories: {
          ...categories,
          [currentCategory]: currentPrompts,
        },
      });
      get().saveToStorage();
    }
  },

  updatePromptRating: (rating) => {
    const { categories, currentCategory, currentIndex } = get();
    const currentPrompts = [...(categories[currentCategory] || [])];

    if (currentPrompts[currentIndex]) {
      currentPrompts[currentIndex] = {
        ...currentPrompts[currentIndex],
        rating,
      };

      set({
        categories: {
          ...categories,
          [currentCategory]: currentPrompts,
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
    const { categories, currentCategory, currentIndex } = get();
    const prompts = categories[currentCategory] || [];
    return prompts[currentIndex] || null;
  },

  getCurrentPromptCount: () => {
    const { categories, currentCategory } = get();
    return (categories[currentCategory] || []).length;
  },
}));
