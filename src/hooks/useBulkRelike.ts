/**
 * Custom hook for bulk re-liking posts from archive
 */

import { useState } from 'react';
import { likePost } from '@/api/grokApi';
import { removeUnlikedPosts } from '@/utils/storage';
import { processBatch, sleep, navigateTo } from '@/utils/opsHelpers';
import { PROCESSING_DELAYS, NAVIGATION_URLS, LOG_PREFIX, STATUS_MESSAGES } from '@/constants/opsView';

export interface UseBulkRelikeReturn {
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
  processBulkRelike: (selectedPostIds: string[]) => Promise<void>;
}

export const useBulkRelike = (
  onStatusChange?: (status: string) => void
): UseBulkRelikeReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const processBulkRelike = async (selectedPostIds: string[]): Promise<void> => {
    setIsProcessing(true);
    setProcessedCount(0);
    setTotalCount(selectedPostIds.length);

    const { successCount } = await processBatch({
      items: selectedPostIds,
      processItem: async (postId) => {
        await likePost(postId);
        return postId;
      },
      onProgress: (processed) => {
        setProcessedCount(processed);
      },
      onItemError: (error, postId) => {
        console.error(`${LOG_PREFIX} Failed to re-like post ${postId}:`, error);
      },
    });

    // Remove re-liked posts from archive
    if (successCount > 0) {
      const relikedIds = selectedPostIds.slice(0, successCount);
      await removeUnlikedPosts(relikedIds);
      console.log(`${LOG_PREFIX} ${STATUS_MESSAGES.REMOVED_FROM_ARCHIVE(relikedIds.length)}`);
    }

    setIsProcessing(false);
    const statusMsg = STATUS_MESSAGES.RELIKED_POSTS(successCount, selectedPostIds.length);
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
    processBulkRelike,
  };
};
