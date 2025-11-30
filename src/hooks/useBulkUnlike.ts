/**
 * Custom hook for bulk unliking posts
 */

import { useState } from 'react';
import { LikedPost } from '@/types';
import { unlikePost } from '@/api/grokApi';
import { addUnlikedPosts, UnlikedPost } from '@/utils/storage';
import { processBatch, convertToUnlikedPost, sleep, navigateTo } from '@/utils/opsHelpers';
import { PROCESSING_DELAYS, NAVIGATION_URLS, LOG_PREFIX, STATUS_MESSAGES } from '@/constants/opsView';

export interface UseBulkUnlikeReturn {
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
  processBulkUnlike: (selectedPostIds: string[], likedPosts: LikedPost[]) => Promise<void>;
}

export const useBulkUnlike = (
  onStatusChange?: (status: string) => void
): UseBulkUnlikeReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const processBulkUnlike = async (
    selectedPostIds: string[],
    likedPosts: LikedPost[]
  ): Promise<void> => {
    setIsProcessing(true);
    setProcessedCount(0);
    setTotalCount(selectedPostIds.length);

    const unlikedPosts: UnlikedPost[] = [];

    const { successCount } = await processBatch({
      items: selectedPostIds,
      processItem: async (postId) => {
        await unlikePost(postId);

        // Find the post in likedPosts to save minimal data
        const post = likedPosts.find((p) => p.id === postId);
        if (post) {
          const unlikedPost = convertToUnlikedPost(post);
          unlikedPosts.push(unlikedPost);
        }

        return postId;
      },
      onProgress: (processed) => {
        setProcessedCount(processed);
      },
      onItemError: (error, postId) => {
        console.error(`${LOG_PREFIX} Failed to unlike post ${postId}:`, error);
      },
    });

    // Save unliked posts to storage
    if (unlikedPosts.length > 0) {
      await addUnlikedPosts(unlikedPosts);
      console.log(`${LOG_PREFIX} ${STATUS_MESSAGES.SAVED_TO_ARCHIVE(unlikedPosts.length)}`);
    }

    setIsProcessing(false);
    const statusMsg = STATUS_MESSAGES.UNLIKED_POSTS(successCount, selectedPostIds.length);
    if (onStatusChange) {
      onStatusChange(statusMsg);
    }

    // Small delay to show completion before navigation
    await sleep(PROCESSING_DELAYS.COMPLETION_DISPLAY);

    // Navigate to favorites page and refresh
    navigateTo(NAVIGATION_URLS.FAVORITES);
  };

  return {
    isProcessing,
    processedCount,
    totalCount,
    processBulkUnlike,
  };
};
