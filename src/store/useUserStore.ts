/**
 * User store for storing user information from API
 */

import { create } from 'zustand';
import { fetchLikedPosts } from '@/api/grokApi';

interface UserState {
  userId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserId: () => Promise<void>;
  setUserId: (userId: string) => void;
  clearUserId: () => void;
}

const STORAGE_KEY = 'imaginegodmode-user-id';

// Load userId from localStorage
const loadUserIdFromStorage = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('[UserStore] Failed to load userId from localStorage:', error);
    return null;
  }
};

// Save userId to localStorage
const saveUserIdToStorage = (userId: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, userId);
  } catch (error) {
    console.error('[UserStore] Failed to save userId to localStorage:', error);
  }
};

export const useUserStore = create<UserState>((set) => ({
  userId: loadUserIdFromStorage(),
  isLoading: false,
  error: null,

  loadUserId: async () => {
    set({ isLoading: true, error: null });

    try {
      // Try to fetch from API
      const response = await fetchLikedPosts(1);
      if (response.posts && response.posts.length > 0) {
        const userId = response.posts[0].userId;
        saveUserIdToStorage(userId);
        set({ userId, isLoading: false });
        console.log('[UserStore] Loaded userId from API:', userId);
      } else {
        set({ error: 'No posts found', isLoading: false });
        console.warn('[UserStore] No posts found to extract userId');
      }
    } catch (error) {
      console.error('[UserStore] Failed to load userId from API:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load user ID',
        isLoading: false
      });
    }
  },

  setUserId: (userId: string) => {
    saveUserIdToStorage(userId);
    set({ userId });
  },

  clearUserId: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[UserStore] Failed to clear userId from localStorage:', error);
    }
    set({ userId: null });
  },
}));
