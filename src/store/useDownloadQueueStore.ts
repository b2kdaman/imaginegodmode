/**
 * Zustand store for global download queue management
 * Processes downloads in batches with delays between each download
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { downloadMedia } from '@/utils/messaging';
import { TIMING } from '@/utils/constants';

export type DownloadItemStatus = 'pending' | 'downloading' | 'completed' | 'failed';

export interface DownloadItem {
  url: string;
  filename: string;
  postId: string;
  status: DownloadItemStatus;
  addedAt: number;
  error?: string;
}

interface DownloadQueueStore {
  // State
  queue: DownloadItem[];
  isProcessing: boolean;
  currentDownloadIndex: number;

  // Actions
  addToQueue: (postId: string, urls: Array<{ url: string; filename: string }>) => void;
  removeFromQueue: (url: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startProcessing: () => void;
  stopProcessing: () => void;

  // Internal actions
  _processQueue: () => Promise<void>;
  _updateItemStatus: (url: string, status: DownloadItemStatus, error?: string) => void;
}

export const useDownloadQueueStore = create<DownloadQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isProcessing: false,
      currentDownloadIndex: 0,

      addToQueue: (postId, urls) => {
        const newItems: DownloadItem[] = urls.map(({ url, filename }) => ({
          url,
          filename,
          postId,
          status: 'pending' as DownloadItemStatus,
          addedAt: Date.now(),
        }));

        set((state) => {
          // Filter out duplicates based on URL
          const existingUrls = new Set(state.queue.map((item) => item.url));
          const uniqueNewItems = newItems.filter((item) => !existingUrls.has(item.url));
          return { queue: [...state.queue, ...uniqueNewItems] };
        });

        // Auto-start processing if not already running
        const { isProcessing, startProcessing } = get();
        if (!isProcessing) {
          startProcessing();
        }
      },

      removeFromQueue: (url) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.url !== url),
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
          currentDownloadIndex: 0,
        });
      },

      startProcessing: () => {
        const { isProcessing, _processQueue } = get();
        if (isProcessing) {
          console.log('[DownloadQueue] Already processing');
          return;
        }

        set({ isProcessing: true });
        console.log('[DownloadQueue] Starting queue processing');
        _processQueue();
      },

      stopProcessing: () => {
        set({ isProcessing: false });
        console.log('[DownloadQueue] Stopped processing');
      },

      _processQueue: async () => {
        const { queue, isProcessing, _updateItemStatus } = get();

        if (!isProcessing) {
          console.log('[DownloadQueue] Processing stopped');
          return;
        }

        // Get all pending items
        const pendingItems = queue.filter((item) => item.status === 'pending');

        if (pendingItems.length === 0) {
          console.log('[DownloadQueue] No pending items, stopping');
          set({ isProcessing: false, currentDownloadIndex: 0 });
          return;
        }

        console.log(`[DownloadQueue] Processing ${pendingItems.length} pending downloads`);

        // Process one item at a time
        for (let i = 0; i < pendingItems.length; i++) {
          const item = pendingItems[i];
          const { isProcessing: stillProcessing } = get();

          if (!stillProcessing) {
            console.log('[DownloadQueue] Processing stopped by user');
            break;
          }

          set({ currentDownloadIndex: i });
          console.log(`[DownloadQueue] Downloading ${i + 1}/${pendingItems.length}: ${item.filename}`);

          // Update status to downloading
          _updateItemStatus(item.url, 'downloading');

          try {
            // Download single file
            const response = await downloadMedia([item.url]);

            if (response.success) {
              console.log(`[DownloadQueue] Downloaded: ${item.filename}`);
              _updateItemStatus(item.url, 'completed');
            } else {
              console.error(`[DownloadQueue] Failed: ${item.filename}`, response.error);
              _updateItemStatus(item.url, 'failed', response.error);
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[DownloadQueue] Error downloading ${item.filename}:`, errorMsg);
            _updateItemStatus(item.url, 'failed', errorMsg);
          }

          // Add delay between downloads (except for last item)
          if (i < pendingItems.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, TIMING.DOWNLOAD_DELAY));
          }
        }

        console.log('[DownloadQueue] Queue processing complete');
        set({ isProcessing: false, currentDownloadIndex: 0 });
      },

      _updateItemStatus: (url, status, error) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.url === url
              ? { ...item, status, error }
              : item
          ),
        }));
      },
    }),
    {
      name: 'download-queue-storage',
      partialize: (state) => ({
        queue: state.queue,
      }),
    }
  )
);
