/**
 * Zustand store for global upscale queue management
 * Processes videos in batches of 15, downloads completed batch before starting next
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QueueItem, QueueItemStatus } from '@/types';
import { upscaleVideoById, fetchPost, downloadMedia } from '@/utils/messaging';
import { processPostData } from '@/utils/mediaProcessor';
import { randomDelay, extractHdMediaUrl } from '@/utils/helpers';
import { TIMING } from '@/utils/constants';
import { useSettingsStore } from './useSettingsStore';

const BATCH_SIZE = 15;
const MAX_CONCURRENT_DOWNLOADS = 15;

interface UpscaleQueueStore {
  // State
  queue: QueueItem[];
  isProcessing: boolean;
  currentBatchIndex: number;
  batchProgress: number; // 0-100 for current batch
  completedInCurrentBatch: number;
  pendingDownloads: string[]; // HD URLs waiting to download
  isDownloading: boolean;

  // Actions
  addToQueue: (postId: string, videoIds: string[]) => void;
  removeFromQueue: (videoId: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startProcessing: () => void;
  stopProcessing: () => void;

  // Internal actions
  _processNextBatch: () => Promise<void>;
  _updateItemStatus: (videoId: string, status: QueueItemStatus, hdUrl?: string) => void;
  _downloadCompletedBatch: (hdUrls: string[]) => Promise<void>;
  _pollForHdUrls: (videoIds: string[]) => Promise<Map<string, string>>;
}

export const useUpscaleQueueStore = create<UpscaleQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isProcessing: false,
      currentBatchIndex: 0,
      batchProgress: 0,
      completedInCurrentBatch: 0,
      pendingDownloads: [],
      isDownloading: false,

      addToQueue: (postId, videoIds) => {
        const newItems: QueueItem[] = videoIds.map((videoId) => ({
          postId,
          videoId,
          status: 'pending' as QueueItemStatus,
          addedAt: Date.now(),
        }));

        set((state) => {
          // Filter out duplicates
          const existingIds = new Set(state.queue.map((item) => item.videoId));
          const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.videoId));
          return { queue: [...state.queue, ...uniqueNewItems] };
        });

        // Auto-start processing if not already running
        const { isProcessing, startProcessing } = get();
        if (!isProcessing) {
          startProcessing();
        }
      },

      removeFromQueue: (videoId) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.videoId !== videoId),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          queue: state.queue.filter((item) => item.status !== 'completed'),
        }));
      },

      clearAll: () => {
        set({
          queue: [],
          isProcessing: false,
          currentBatchIndex: 0,
          batchProgress: 0,
          completedInCurrentBatch: 0,
          pendingDownloads: [],
        });
      },

      startProcessing: () => {
        const { isProcessing, _processNextBatch } = get();
        if (isProcessing) {return;}

        set({ isProcessing: true });
        _processNextBatch();
      },

      stopProcessing: () => {
        set({ isProcessing: false });
      },

      _updateItemStatus: (videoId, status, hdUrl) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.videoId === videoId ? { ...item, status, hdUrl } : item
          ),
        }));
      },

      _downloadCompletedBatch: async (hdUrls) => {
        if (hdUrls.length === 0) {return;}

        // Check if auto-download is enabled
        const { autoDownload } = useSettingsStore.getState();
        if (!autoDownload) {
          console.log('[ImagineGodMode] Auto-download disabled, skipping batch download');
          return;
        }

        set({ isDownloading: true });

        // Download in chunks of MAX_CONCURRENT_DOWNLOADS
        for (let i = 0; i < hdUrls.length; i += MAX_CONCURRENT_DOWNLOADS) {
          const chunk = hdUrls.slice(i, i + MAX_CONCURRENT_DOWNLOADS);
          console.log(`[ImagineGodMode] Downloading batch chunk: ${chunk.length} files`);
          await downloadMedia(chunk);

          // Small delay between download batches
          if (i + MAX_CONCURRENT_DOWNLOADS < hdUrls.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        set({ isDownloading: false });
      },

      _pollForHdUrls: async (videoIds) => {
        const hdUrlMap = new Map<string, string>();
        const postIds = new Set<string>();

        // Get unique post IDs for the videos
        const { queue } = get();
        videoIds.forEach((videoId) => {
          const item = queue.find((q) => q.videoId === videoId);
          if (item) {postIds.add(item.postId);}
        });

        // Poll until all videos have HD URLs or timeout
        const maxAttempts = 60; // 3-5 minutes max
        let attempts = 0;

        while (hdUrlMap.size < videoIds.length && attempts < maxAttempts) {
          for (const postId of postIds) {
            try {
              const response = await fetchPost(postId);
              if (response.success && response.data) {
                const processed = processPostData(response.data);

                // Check each video we're waiting for
                for (const mediaUrl of processed.mediaUrls) {
                  if (
                    mediaUrl.id &&
                    videoIds.includes(mediaUrl.id) &&
                    mediaUrl.isHD &&
                    mediaUrl.type === 'video'
                  ) {
                    hdUrlMap.set(mediaUrl.id, mediaUrl.url);
                  }
                }
              }
            } catch (error) {
              console.error('[ImagineGodMode] Poll error:', error);
            }
          }

          if (hdUrlMap.size < videoIds.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, randomDelay(TIMING.UPSCALE_REFETCH_MIN, TIMING.UPSCALE_REFETCH_MAX))
            );
            attempts++;
          }
        }

        return hdUrlMap;
      },

      _processNextBatch: async () => {
        const { queue, isProcessing, _updateItemStatus, _downloadCompletedBatch, _pollForHdUrls } =
          get();

        if (!isProcessing) {return;}

        // Get pending items
        const pendingItems = queue.filter((item) => item.status === 'pending');

        if (pendingItems.length === 0) {
          console.log('[ImagineGodMode] Queue empty, stopping processing');
          set({ isProcessing: false, batchProgress: 0, completedInCurrentBatch: 0 });
          return;
        }

        // Get current batch
        const currentBatch = pendingItems.slice(0, BATCH_SIZE);
        const batchVideoIds = currentBatch.map((item) => item.videoId);

        console.log(`[ImagineGodMode] Processing batch of ${currentBatch.length} videos`);
        set({ batchProgress: 0, completedInCurrentBatch: 0 });

        // Mark batch as processing
        currentBatch.forEach((item) => {
          _updateItemStatus(item.videoId, 'processing');
        });

        // Fire off upscale requests with staggered delays
        let completed = 0;
        const upscalePromises: Promise<void>[] = [];
        const responseHdUrlMap = new Map<string, string>();

        for (let i = 0; i < currentBatch.length; i++) {
          const item = currentBatch[i];

          const promise = upscaleVideoById(item.videoId).then((response) => {
            completed++;
            set({
              batchProgress: (completed / currentBatch.length) * 100,
              completedInCurrentBatch: completed,
            });
            console.log(
              `[ImagineGodMode] Upscale request sent ${completed}/${currentBatch.length}: ${item.videoId}`
            );

            if (!response.success) {
              _updateItemStatus(item.videoId, 'failed');
              return;
            }

            const hdMediaUrl = extractHdMediaUrl(response.data);
            if (hdMediaUrl) {
              responseHdUrlMap.set(item.videoId, hdMediaUrl);
            }
          });

          upscalePromises.push(promise);

          // Stagger requests
          if (i < currentBatch.length - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, randomDelay(TIMING.UPSCALE_DELAY_MIN, TIMING.UPSCALE_DELAY_MAX))
            );
          }
        }

        // Wait for all upscale requests to complete
        await Promise.all(upscalePromises);
        console.log('[ImagineGodMode] All upscale requests sent');

        // Poll only unresolved videos not already returned with hdMediaUrl
        const unresolvedVideoIds = batchVideoIds.filter((videoId) => !responseHdUrlMap.has(videoId));
        const hdUrlMap = unresolvedVideoIds.length > 0
          ? await _pollForHdUrls(unresolvedVideoIds)
          : new Map<string, string>();

        // Update items with HD URLs and mark as completed
        const hdUrlsToDownload: string[] = [];
        for (const item of currentBatch) {
          const hdUrl = responseHdUrlMap.get(item.videoId) || hdUrlMap.get(item.videoId);
          if (hdUrl) {
            _updateItemStatus(item.videoId, 'completed', hdUrl);
            hdUrlsToDownload.push(hdUrl);
          } else {
            _updateItemStatus(item.videoId, 'failed');
          }
        }

        // Download completed batch
        if (hdUrlsToDownload.length > 0) {
          console.log(`[ImagineGodMode] Downloading ${hdUrlsToDownload.length} HD videos`);
          await _downloadCompletedBatch(hdUrlsToDownload);
        }

        // Process next batch if still running
        const { isProcessing: stillProcessing, _processNextBatch: processNext } = get();
        if (stillProcessing) {
          set((state) => ({ currentBatchIndex: state.currentBatchIndex + 1 }));
          processNext();
        }
      },
    }),
    {
      name: 'imaginegodmode-upscale-queue',
      partialize: (state) => ({
        queue: state.queue.filter((item) => item.status !== 'processing'), // Don't persist processing state
      }),
    }
  )
);
