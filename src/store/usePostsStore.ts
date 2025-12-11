/**
 * Zustand store for posts management
 */

import { create } from 'zustand';
import { LikedPost } from '@/types';

interface PostsStore {
  // State
  posts: LikedPost[];
  currentPostId: string | null;

  // Actions
  setPosts: (posts: LikedPost[]) => void;
  setCurrentPostId: (id: string | null) => void;
  ensureCurrentPostInList: (post: LikedPost) => void;
  getNextPostId: () => string | null;
  getPrevPostId: () => string | null;
  getCurrentPostIndex: () => number;
}

export const usePostsStore = create<PostsStore>((set, get) => ({
  // Initial state
  posts: [],
  currentPostId: null,

  // Set posts array
  setPosts: (posts) => set({ posts }),

  // Set current post ID
  setCurrentPostId: (id) => set({ currentPostId: id }),

  // Ensure current post is in the posts list (add if not found)
  ensureCurrentPostInList: (post) => {
    const { posts } = get();
    const postExists = posts.some((p) => p.id === post.id);

    if (!postExists) {
      set({ posts: [...posts, post] });
    }
  },

  // Get next post ID in the list
  getNextPostId: () => {
    const { posts, currentPostId } = get();

    if (!currentPostId || posts.length === 0) {
      return null;
    }

    const currentIndex = posts.findIndex((post) => post.id === currentPostId);

    // If current post not found or is last in list, return null
    if (currentIndex === -1 || currentIndex >= posts.length - 1) {
      return null;
    }

    const nextId = posts[currentIndex + 1].id;
    return nextId;
  },

  // Get previous post ID in the list
  getPrevPostId: () => {
    const { posts, currentPostId } = get();

    if (!currentPostId || posts.length === 0) {
      return null;
    }

    const currentIndex = posts.findIndex((post) => post.id === currentPostId);

    // If current post not found or is first in list, return null
    if (currentIndex <= 0) {
      return null;
    }

    return posts[currentIndex - 1].id;
  },

  // Get current post index in the list (-1 if not found)
  getCurrentPostIndex: () => {
    const { posts, currentPostId } = get();

    if (!currentPostId || posts.length === 0) {
      return -1;
    }

    return posts.findIndex((post) => post.id === currentPostId);
  },
}));
