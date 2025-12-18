/**
 * User store for storing user information from API
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchLikedPosts } from '@/api/grokApi';

interface UserState {
  // Persisted state
  userId: string | null;

  // Non-persisted state
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserId: () => Promise<void>;
  setUserId: (userId: string) => void;
  clearUserId: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Default state
      userId: null,
      isLoading: false,
      error: null,

      // Actions
      loadUserId: async () => {
        set({ isLoading: true, error: null });

        try {
          // Try to fetch from API
          const response = await fetchLikedPosts(1);
          if (response.posts && response.posts.length > 0) {
            const userId = response.posts[0].userId;
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

      setUserId: (userId: string) => set({ userId }),

      clearUserId: () => set({ userId: null }),
    }),
    {
      name: 'imaginegodmode-user-id',
      partialize: (state) => ({ userId: state.userId }),
    }
  )
);
