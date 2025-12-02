/**
 * Custom hook for bulk deleting posts
 */

import { useState } from 'react';
import { deletePost } from '@/api/grokApi';
import { processBatch, sleep, navigateTo } from '@/utils/opsHelpers';
import { PROCESSING_DELAYS, NAVIGATION_URLS, LOG_PREFIX } from '@/constants/opsView';

export interface UseBulkDeleteReturn {
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
  processBulkDelete: (selectedPostIds: string[]) => Promise<void>;
}

export const useBulkDelete = (
  onStatusChange?: (status: string) => void
): UseBulkDeleteReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const processBulkDelete = async (
    selectedPostIds: string[]
  ): Promise<void> => {
    setIsProcessing(true);
    setProcessedCount(0);
    setTotalCount(selectedPostIds.length);

    const { successCount } = await processBatch({
      items: selectedPostIds,
      processItem: async (postId) => {
        await deletePost(postId);
        return postId;
      },
      onProgress: (processed) => {
        setProcessedCount(processed);
      },
      onItemError: (error, postId) => {
        console.error(`${LOG_PREFIX} Failed to delete post ${postId}:`, error);
      },
    });

    setIsProcessing(false);
    const statusMsg = `Deleted ${successCount}/${selectedPostIds.length} posts`;
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
    processBulkDelete,
  };
};
