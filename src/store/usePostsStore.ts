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

    // Try to find current post directly
    let currentIndex = posts.findIndex((post) => post.id === currentPostId);

    // If not found, it might be a child post - search for parent
    if (currentIndex === -1) {
      currentIndex = posts.findIndex((post) => {
        // Check if current ID is in childPosts
        if (post.childPosts && post.childPosts.length > 0) {
          return post.childPosts.some((child) => child.id === currentPostId);
        }
        // Check if current ID is in images array
        if (post.images && post.images.length > 0) {
          return post.images.some((img) => img.id === currentPostId);
        }
        // Check if current ID is in videos array
        if (post.videos && post.videos.length > 0) {
          return post.videos.some((vid) => vid.id === currentPostId);
        }
        return false;
      });
    }

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

    // Try to find current post directly
    let currentIndex = posts.findIndex((post) => post.id === currentPostId);

    // If not found, it might be a child post - search for parent
    if (currentIndex === -1) {
      currentIndex = posts.findIndex((post) => {
        // Check if current ID is in childPosts
        if (post.childPosts && post.childPosts.length > 0) {
          return post.childPosts.some((child) => child.id === currentPostId);
        }
        // Check if current ID is in images array
        if (post.images && post.images.length > 0) {
          return post.images.some((img) => img.id === currentPostId);
        }
        // Check if current ID is in videos array
        if (post.videos && post.videos.length > 0) {
          return post.videos.some((vid) => vid.id === currentPostId);
        }
        return false;
      });
    }

    // If current post not found or is first in list, return null
    if (currentIndex <= 0) {
      return null;
    }

    const prevId = posts[currentIndex - 1].id;
    return prevId;
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
