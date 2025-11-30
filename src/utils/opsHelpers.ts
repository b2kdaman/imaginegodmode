/**
 * Helper utilities for OpsView operations
 */

import { LikedPost } from '@/types';
import { UnlikedPost } from './storage';
import { PROCESSING_DELAYS } from '@/constants/opsView';

/**
 * Sleep/delay utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get a random delay between API calls
 */
export const getRandomApiDelay = (): number => {
  return PROCESSING_DELAYS.MIN_API_CALL + Math.random() * PROCESSING_DELAYS.MAX_API_CALL;
};

/**
 * Convert LikedPost to UnlikedPost format
 */
export const convertToUnlikedPost = (post: LikedPost): UnlikedPost => {
  return {
    id: post.id,
    prompt: post.prompt,
    thumbnailImageUrl: post.thumbnailImageUrl,
    mediaUrl: post.mediaUrl,
    unlikedAt: Date.now(),
    childPostCount: post.childPosts?.length || 0,
  };
};

/**
 * Navigate to a specific URL
 */
export const navigateTo = (url: string): void => {
  window.location.href = url;
};

/**
 * Process a batch operation with progress tracking
 */
export interface BatchProcessOptions<T, R> {
  items: T[];
  processItem: (item: T, index: number) => Promise<R>;
  onProgress?: (processed: number, total: number) => void;
  onItemSuccess?: (result: R, item: T, index: number) => void;
  onItemError?: (error: Error, item: T, index: number) => void;
  delayBetweenItems?: boolean;
  initialDelay?: boolean;
}

export interface BatchProcessResult<R> {
  successCount: number;
  results: (R | null)[];
}

export async function processBatch<T, R>({
  items,
  processItem,
  onProgress,
  onItemSuccess,
  onItemError,
  delayBetweenItems = true,
  initialDelay = true,
}: BatchProcessOptions<T, R>): Promise<BatchProcessResult<R>> {
  const results: (R | null)[] = [];
  let successCount = 0;

  // Initial delay to ensure UI is rendered
  if (initialDelay) {
    await sleep(PROCESSING_DELAYS.INITIAL_RENDER);
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    try {
      const result = await processItem(item, i);
      results.push(result);
      successCount++;

      if (onItemSuccess) {
        onItemSuccess(result, item, i);
      }
    } catch (error) {
      results.push(null);
      if (onItemError) {
        onItemError(error as Error, item, i);
      }
    }

    // Update progress
    if (onProgress) {
      onProgress(i + 1, items.length);
    }

    // Force render cycle
    await sleep(PROCESSING_DELAYS.RENDER_CYCLE);

    // Add delay between items (except for last one)
    if (delayBetweenItems && i < items.length - 1) {
      await sleep(getRandomApiDelay());
    }
  }

  return { successCount, results };
}
