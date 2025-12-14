/**
 * Hook for managing upscale all modal and operations
 */

import { useState, useCallback } from 'react';
import { usePostsStore } from '@/store/usePostsStore';
import { useUpscaleQueueStore } from '@/store/useUpscaleQueueStore';
import { useLikedPostsLoader } from './useLikedPostsLoader';
import { trackModalOpened, trackModalClosed } from '@/utils/analytics';
import { fetchPostData } from '@/api/grokApi';
import { processPostData } from '@/utils/mediaProcessor';
import { LikedPost } from '@/types';

interface UseUpscaleAllReturn {
  isModalOpen: boolean;
  likedPosts: LikedPost[];
  isLoading: boolean;
  openModal: () => Promise<void>;
  closeModal: () => void;
  handleBulkUpscale: (selectedPostIds: string[]) => Promise<void>;
}

export const useUpscaleAll = (
  setStatusText?: (text: string) => void
): UseUpscaleAllReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setPosts } = usePostsStore();
  const { addToQueue } = useUpscaleQueueStore();
  const { likedPosts, isLoading, loadLikedPosts } = useLikedPostsLoader(setStatusText);

  const openModal = useCallback(async () => {
    const posts = await loadLikedPosts();
    setPosts(posts);
    if (posts.length > 0) {
      setIsModalOpen(true);
      trackModalOpened('upscale_all');
    }
  }, [loadLikedPosts, setPosts]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    trackModalClosed('upscale_all');
  }, []);

  const handleBulkUpscale = useCallback(async (selectedPostIds: string[]) => {
    setIsModalOpen(false);
    setStatusText?.(`Processing ${selectedPostIds.length} post${selectedPostIds.length === 1 ? '' : 's'}...`);

    let totalVideosAdded = 0;

    // Process each selected post
    for (const postId of selectedPostIds) {
      try {
        // Fetch full post data
        const postData = await fetchPostData(postId);

        if (postData?.post) {
          // Process post data to extract video IDs that need upscaling
          const processed = processPostData(postData);

          if (processed.videosToUpscale.length > 0) {
            // Add videos to queue
            addToQueue(postId, processed.videosToUpscale);
            totalVideosAdded += processed.videosToUpscale.length;
          }
        }
      } catch (error) {
        console.error(`Failed to process post ${postId}:`, error);
      }
    }

    setStatusText?.(
      `Added ${totalVideosAdded} video${totalVideosAdded === 1 ? '' : 's'} from ${selectedPostIds.length} post${selectedPostIds.length === 1 ? '' : 's'} to upscale queue`
    );
  }, [addToQueue, setStatusText]);

  return {
    isModalOpen,
    likedPosts,
    isLoading,
    openModal,
    closeModal,
    handleBulkUpscale,
  };
};
