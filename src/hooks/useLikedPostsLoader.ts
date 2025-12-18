/**
 * Custom hook for loading liked posts
 */

import { useState } from 'react';
import { LikedPost } from '@/types';
import { fetchLikedPosts } from '@/api/grokApi';
import { useSettingsStore } from '@/store/useSettingsStore';
import { LOG_PREFIX, STATUS_MESSAGES } from '@/constants/opsView';

export interface UseLikedPostsLoaderReturn {
  likedPosts: LikedPost[];
  isLoading: boolean;
  loadLikedPosts: () => Promise<LikedPost[]>;
}

export const useLikedPostsLoader = (
  onStatusChange?: (status: string) => void
): UseLikedPostsLoaderReturn => {
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { listLimit } = useSettingsStore();

  const loadLikedPosts = async (): Promise<LikedPost[]> => {
    setIsLoading(true);
    try {
      const response = await fetchLikedPosts(listLimit);
      const posts = response.posts || [];
      setLikedPosts(posts);
      return posts;
    } catch (error) {
      console.error(`${LOG_PREFIX} ${STATUS_MESSAGES.FETCH_LIKED_FAILED}`, error);
      if (onStatusChange) {
        onStatusChange(STATUS_MESSAGES.FETCH_LIKED_FAILED);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likedPosts,
    isLoading,
    loadLikedPosts,
  };
};
