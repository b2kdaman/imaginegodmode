/**
 * Unified Job Queue Store
 * Manages all batch operations (upscale, download, unlike, relike, purge) as jobs
 * Processes jobs sequentially with progress tracking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Job,
  JobStatus,
  ProcessForUpscaleJobData,
  UpscaleJobData,
  DownloadJobData,
  UnlikeJobData,
  RelikeJobData,
  PurgeJobData,
} from '@/types';
import { upscaleVideoById, fetchPost, downloadMedia } from '@/utils/messaging';
import { unlikePost, likePost, fetchLikedPosts, fetchPostData } from '@/api/grokApi';
import { processPostData } from '@/utils/mediaProcessor';
import { randomDelay } from '@/utils/helpers';
import { TIMING } from '@/utils/constants';
import { sleep, getRandomApiDelay, convertToUnlikedPost } from '@/utils/opsHelpers';
import { addUnlikedPosts, removeUnlikedPosts, clearUnlikedPosts } from '@/utils/storage';
import { usePromptStore } from './usePromptStore';
import { useSettingsStore } from './useSettingsStore';
import { useUserStore } from './useUserStore';

const BATCH_SIZE = 15; // For upscale batching

interface JobQueueStore {
  // State
  jobs: Job[];
  isProcessing: boolean;
  currentJobId: string | null;

  // Actions
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'status' | 'progress' | 'processedItems'>) => string;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startProcessing: () => void;
  stopProcessing: () => void;

  // Internal actions
  _processNextJob: () => Promise<void>;
  _updateJobProgress: (jobId: string, processedItems: number, progress: number) => void;
  _updateJobStatus: (jobId: string, status: JobStatus, error?: string) => void;
  _processProcessForUpscaleJob: (job: Job) => Promise<void>;
  _processUpscaleJob: (job: Job) => Promise<void>;
  _processDownloadJob: (job: Job) => Promise<void>;
  _processUnlikeJob: (job: Job) => Promise<void>;
  _processRelikeJob: (job: Job) => Promise<void>;
  _processPurgeJob: (job: Job) => Promise<void>;
}

export const useJobQueueStore = create<JobQueueStore>()(
  persist(
    (set, get) => ({
      jobs: [],
      isProcessing: false,
      currentJobId: null,

      addJob: (jobData) => {
        const job: Job = {
          ...jobData,
          id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          status: 'pending',
          progress: 0,
          processedItems: 0,
        };

        set((state) => ({
          jobs: [...state.jobs, job],
        }));

        console.log(`[JobQueue] Added ${job.type} job: ${job.id} (${job.totalItems} items)`);

        // Auto-start processing if not already running
        const { isProcessing, startProcessing } = get();
        if (!isProcessing) {
          startProcessing();
        }

        return job.id;
      },

      removeJob: (jobId) => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== jobId),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.status !== 'completed'),
        }));
      },

      clearAll: () => {
        set({
          jobs: [],
          isProcessing: false,
          currentJobId: null,
        });
      },

      startProcessing: () => {
        const { isProcessing, _processNextJob } = get();
        if (isProcessing) {
          return;
        }

        console.log('[JobQueue] Starting job processing');
        set({ isProcessing: true });
        _processNextJob();
      },

      stopProcessing: () => {
        console.log('[JobQueue] Stopping job processing');
        set({ isProcessing: false, currentJobId: null });
      },

      _updateJobProgress: (jobId, processedItems, progress) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? { ...job, processedItems, progress: Math.min(100, Math.max(0, progress)) }
              : job
          ),
        }));
      },

      _updateJobStatus: (jobId, status, error) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, status, error, progress: status === 'completed' ? 100 : job.progress } : job
          ),
        }));
      },

      _processNextJob: async () => {
        const { jobs, isProcessing } = get();

        if (!isProcessing) {
          console.log('[JobQueue] Processing stopped');
          return;
        }

        // Get next pending job
        const nextJob = jobs.find((job) => job.status === 'pending');

        if (!nextJob) {
          console.log('[JobQueue] No pending jobs, stopping');
          set({ isProcessing: false, currentJobId: null });
          return;
        }

        console.log(`[JobQueue] Processing job: ${nextJob.type} (${nextJob.id})`);
        set({ currentJobId: nextJob.id });

        // Update status to processing
        get()._updateJobStatus(nextJob.id, 'processing');

        try {
          // Process based on job type
          switch (nextJob.type) {
            case 'process-for-upscale':
              await get()._processProcessForUpscaleJob(nextJob);
              break;
            case 'upscale':
              await get()._processUpscaleJob(nextJob);
              break;
            case 'download':
              await get()._processDownloadJob(nextJob);
              break;
            case 'unlike':
              await get()._processUnlikeJob(nextJob);
              break;
            case 'relike':
              await get()._processRelikeJob(nextJob);
              break;
            case 'purge-liked':
            case 'purge-archive':
            case 'purge-packs':
              await get()._processPurgeJob(nextJob);
              break;
          }

          // Mark as completed
          get()._updateJobStatus(nextJob.id, 'completed');
          console.log(`[JobQueue] Job completed: ${nextJob.type} (${nextJob.id})`);

          // Auto-download after upscale if enabled
          if (nextJob.type === 'upscale') {
            const { autoDownload } = useSettingsStore.getState();
            if (autoDownload) {
              const upscaleData = nextJob.data as UpscaleJobData;
              const hdUrlMap = upscaleData.hdUrlMap || {};
              const hdUrls = Object.values(hdUrlMap).filter(Boolean);

              if (hdUrls.length > 0) {
                console.log(`[JobQueue] Auto-download enabled: creating download job for ${hdUrls.length} HD videos`);

                // Create download items with filenames
                const downloadItems = hdUrls.map((url, index) => {
                  const urlParts = url.split('/');
                  const filenameWithQuery = urlParts[urlParts.length - 1];
                  const filename = filenameWithQuery.split('?')[0] || `hd_video_${Date.now()}_${index}.mp4`;
                  return {
                    url,
                    filename,
                  };
                });

                // Create download job
                get().addJob({
                  type: 'download',
                  totalItems: downloadItems.length,
                  data: {
                    type: 'download',
                    postIds: upscaleData.postIds,
                    items: downloadItems,
                  },
                });
              }
            }
          }

          // Refresh window after unlike/relike jobs to update the liked posts list
          if (nextJob.type === 'unlike' || nextJob.type === 'relike') {
            console.log(`[JobQueue] ${nextJob.type} job completed, refreshing window in 2 seconds...`);
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[JobQueue] Job failed: ${nextJob.type} (${nextJob.id})`, error);
          get()._updateJobStatus(nextJob.id, 'failed', errorMsg);
        }

        // Process next job if still running
        const { isProcessing: stillProcessing, _processNextJob: processNext } = get();
        if (stillProcessing) {
          set({ currentJobId: null });
          processNext();
        }
      },

      _processProcessForUpscaleJob: async (job) => {
        const data = job.data as ProcessForUpscaleJobData;
        const { postIds } = data;

        // Get max bulk limit setting
        const { maxBulkLimit } = useSettingsStore.getState();
        const limitedPostIds = maxBulkLimit === 'unlimited' ? postIds : postIds.slice(0, maxBulkLimit);

        console.log(`[JobQueue] Processing ${limitedPostIds.length} posts for upscaling${maxBulkLimit !== 'unlimited' ? ` (limited to ${maxBulkLimit})` : ''}`);

        const allVideoIds: string[] = [];
        const allPostIds: string[] = [];

        // Process each post to collect videos that need upscaling
        for (let i = 0; i < limitedPostIds.length; i++) {
          const { isProcessing } = get();
          if (!isProcessing) {
            throw new Error('Processing stopped by user');
          }

          const postId = limitedPostIds[i];

          try {
            console.log(`[JobQueue] Fetching post ${i + 1}/${limitedPostIds.length}: ${postId}`);

            // Fetch full post data
            const postData = await fetchPostData(postId);

            if (postData?.post) {
              // Process post data to extract video IDs that need upscaling
              const processed = processPostData(postData);

              if (processed.videosToUpscale.length > 0) {
                allVideoIds.push(...processed.videosToUpscale);
                allPostIds.push(postId);
                console.log(`[JobQueue] Found ${processed.videosToUpscale.length} videos to upscale in post ${postId}`);
              }
            }
          } catch (error) {
            console.error(`[JobQueue] Failed to process post ${postId}:`, error);
          }

          // Update progress
          const progress = ((i + 1) / limitedPostIds.length) * 100;
          get()._updateJobProgress(job.id, i + 1, progress);

          // Add minimal delay between fetches
          if (i < limitedPostIds.length - 1) {
            await sleep(100);
          }
        }

        // After processing all posts, create upscale job if we found videos
        if (allVideoIds.length > 0) {
          console.log(`[JobQueue] Creating upscale job for ${allVideoIds.length} videos from ${allPostIds.length} posts`);

          get().addJob({
            type: 'upscale',
            totalItems: allVideoIds.length,
            data: {
              type: 'upscale',
              postIds: allPostIds,
              videoIds: allVideoIds,
            },
          });
        } else {
          console.log('[JobQueue] No videos found to upscale');
        }

        console.log(`[JobQueue] Processing complete: ${allVideoIds.length} videos queued for upscaling`);
      },

      _processUpscaleJob: async (job) => {
        const data = job.data as UpscaleJobData;
        const { videoIds } = data;

        // Get max bulk limit setting
        const { maxBulkLimit } = useSettingsStore.getState();
        const limitedVideoIds = maxBulkLimit === 'unlimited' ? videoIds : videoIds.slice(0, maxBulkLimit);
        const totalVideos = limitedVideoIds.length;

        console.log(`[JobQueue] Upscaling ${totalVideos} videos${maxBulkLimit !== 'unlimited' ? ` (limited to ${maxBulkLimit})` : ''}`);

        // Process in batches of 15
        const hdUrlMap: Record<string, string> = {};

        for (let batchStart = 0; batchStart < totalVideos; batchStart += BATCH_SIZE) {
          const { isProcessing } = get();
          if (!isProcessing) {
            throw new Error('Processing stopped by user');
          }

          const batchEnd = Math.min(batchStart + BATCH_SIZE, totalVideos);
          const batchVideoIds = limitedVideoIds.slice(batchStart, batchEnd);

          console.log(
            `[JobQueue] Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}: ${batchVideoIds.length} videos`
          );

          // Fire off upscale requests with staggered delays
          const upscalePromises: Promise<void>[] = [];

          for (let i = 0; i < batchVideoIds.length; i++) {
            const videoId = batchVideoIds[i];

            const promise = upscaleVideoById(videoId).then((response) => {
              const processed = batchStart + i + 1;
              const progress = (processed / totalVideos) * 100;
              get()._updateJobProgress(job.id, processed, progress);

              if (!response.success) {
                console.error(`[JobQueue] Upscale failed for ${videoId}`);
              }
            });

            upscalePromises.push(promise);

            // Stagger requests
            if (i < batchVideoIds.length - 1) {
              await new Promise((resolve) =>
                setTimeout(resolve, randomDelay(TIMING.UPSCALE_DELAY_MIN, TIMING.UPSCALE_DELAY_MAX))
              );
            }
          }

          // Wait for all upscale requests to complete
          await Promise.all(upscalePromises);
          console.log('[JobQueue] Batch upscale requests sent, polling for HD URLs...');

          // Poll for HD URLs
          const batchHdUrls = await pollForHdUrls(data.postIds, batchVideoIds);
          Object.assign(hdUrlMap, batchHdUrls);
        }

        // Store HD URLs in job data
        (job.data as UpscaleJobData).hdUrlMap = hdUrlMap;
        console.log(`[JobQueue] Upscale complete: ${Object.keys(hdUrlMap).length}/${totalVideos} HD URLs obtained`);
      },

      _processDownloadJob: async (job) => {
        const data = job.data as DownloadJobData;
        const { items } = data;

        // Get max bulk limit setting
        const { maxBulkLimit } = useSettingsStore.getState();
        const limitedItems = maxBulkLimit === 'unlimited' ? items : items.slice(0, maxBulkLimit);

        console.log(`[JobQueue] Downloading ${limitedItems.length} files${maxBulkLimit !== 'unlimited' ? ` (limited to ${maxBulkLimit})` : ''}`);

        // Download one file at a time with delays
        for (let i = 0; i < limitedItems.length; i++) {
          const { isProcessing } = get();
          if (!isProcessing) {
            throw new Error('Processing stopped by user');
          }

          const item = limitedItems[i];
          console.log(`[JobQueue] Downloading ${i + 1}/${limitedItems.length}: ${item.filename}`);

          try {
            const response = await downloadMedia([item.url]);

            if (response.success) {
              item.status = 'completed';
              console.log(`[JobQueue] Downloaded: ${item.filename}`);
            } else {
              item.status = 'failed';
              console.error(`[JobQueue] Download failed: ${item.filename}`, response.error);

              // Check if the error is due to extension context invalidation
              if (response.error && response.error.includes('Extension was reloaded or updated')) {
                console.warn('[JobQueue] Extension context invalidated - stopping job processing');
                // Stop processing remaining items
                throw new Error('Extension context invalidated. Please refresh the page to continue.');
              }
            }
          } catch (error) {
            item.status = 'failed';
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[JobQueue] Download error: ${item.filename}`, errorMessage);

            // If this is a context invalidation error, propagate it to stop the job
            if (errorMessage.includes('Extension context invalidated') ||
                errorMessage.includes('Extension was reloaded or updated')) {
              throw error;
            }
          }

          // Update progress
          const progress = ((i + 1) / limitedItems.length) * 100;
          get()._updateJobProgress(job.id, i + 1, progress);

          // Add delay between downloads (except for last item)
          if (i < limitedItems.length - 1) {
            await sleep(TIMING.DOWNLOAD_DELAY);
          }
        }

        const successCount = limitedItems.filter((item) => item.status === 'completed').length;
        console.log(`[JobQueue] Download complete: ${successCount}/${limitedItems.length} successful`);
      },

      _processUnlikeJob: async (job) => {
        const data = job.data as UnlikeJobData;
        const { postIds, posts } = data;

        // Get max bulk limit setting
        const { maxBulkLimit } = useSettingsStore.getState();
        const limitedPostIds = maxBulkLimit === 'unlimited' ? postIds : postIds.slice(0, maxBulkLimit);

        console.log(`[JobQueue] Unliking ${limitedPostIds.length} posts${maxBulkLimit !== 'unlimited' ? ` (limited to ${maxBulkLimit})` : ''}`);
        console.log(`[JobQueue] Posts data available:`, posts.length);

        const unlikedPosts = [];

        // Process one post at a time with delays
        for (let i = 0; i < limitedPostIds.length; i++) {
          const { isProcessing } = get();
          if (!isProcessing) {
            throw new Error('Processing stopped by user');
          }

          const postId = limitedPostIds[i];
          const post = posts.find((p) => p.id === postId);

          if (!post) {
            console.error(`[JobQueue] Post data not found for ${postId}`);
          }

          try {
            const response = await unlikePost(postId);

            if (response.success && post) {
              // Add to unliked archive
              const unlikedPost = convertToUnlikedPost(post);
              unlikedPosts.push(unlikedPost);
              console.log(`[JobQueue] Unliked post ${i + 1}/${limitedPostIds.length}: ${postId}`, unlikedPost);
            } else {
              console.error(`[JobQueue] Unlike failed for ${postId}`, {
                success: response.success,
                hasPost: !!post,
                error: response.error,
              });
            }
          } catch (error) {
            console.error(`[JobQueue] Unlike error for ${postId}:`, error);
          }

          // Update progress
          const progress = ((i + 1) / limitedPostIds.length) * 100;
          get()._updateJobProgress(job.id, i + 1, progress);

          // Force render cycle
          await sleep(50);

          // Add delay between API calls (except for last one)
          if (i < limitedPostIds.length - 1) {
            await sleep(getRandomApiDelay());
          }
        }

        // Save unliked posts to archive
        console.log(`[JobQueue] Preparing to save ${unlikedPosts.length} posts to archive`);
        if (unlikedPosts.length > 0) {
          const { userId } = useUserStore.getState();
          console.log(`[JobQueue] Current userId:`, userId);

          if (!userId) {
            console.error(`[JobQueue] No userId available - cannot save to archive`);
          } else {
            const success = await addUnlikedPosts(unlikedPosts, userId);
            if (success) {
              console.log(`[JobQueue] ✓ Successfully saved ${unlikedPosts.length} posts to unliked archive for user ${userId}`);
            } else {
              console.error(`[JobQueue] ✗ Failed to save unliked posts to archive for user ${userId}`);
            }
          }
        } else {
          console.warn(`[JobQueue] No posts to save to archive (0 successful unlikes)`);
        }

        console.log(`[JobQueue] Unlike complete: ${unlikedPosts.length}/${limitedPostIds.length} successful`);
      },

      _processRelikeJob: async (job) => {
        const data = job.data as RelikeJobData;
        const { postIds } = data;

        // Get max bulk limit setting
        const { maxBulkLimit } = useSettingsStore.getState();
        const limitedPostIds = maxBulkLimit === 'unlimited' ? postIds : postIds.slice(0, maxBulkLimit);

        console.log(`[JobQueue] Re-liking ${limitedPostIds.length} posts${maxBulkLimit !== 'unlimited' ? ` (limited to ${maxBulkLimit})` : ''}`);

        const relikedPostIds: string[] = [];

        // Process one post at a time with delays
        for (let i = 0; i < limitedPostIds.length; i++) {
          const { isProcessing } = get();
          if (!isProcessing) {
            throw new Error('Processing stopped by user');
          }

          const postId = limitedPostIds[i];

          try {
            const response = await likePost(postId);

            if (response.success) {
              relikedPostIds.push(postId);
              console.log(`[JobQueue] Re-liked post ${i + 1}/${limitedPostIds.length}: ${postId}`);
            } else {
              console.error(`[JobQueue] Re-like failed for ${postId}`);
            }
          } catch (error) {
            console.error(`[JobQueue] Re-like error for ${postId}:`, error);
          }

          // Update progress
          const progress = ((i + 1) / limitedPostIds.length) * 100;
          get()._updateJobProgress(job.id, i + 1, progress);

          // Force render cycle
          await sleep(50);

          // Add delay between API calls (except for last one)
          if (i < limitedPostIds.length - 1) {
            await sleep(getRandomApiDelay());
          }
        }

        // Remove re-liked posts from archive
        if (relikedPostIds.length > 0) {
          const { userId } = useUserStore.getState();
          const success = await removeUnlikedPosts(relikedPostIds, userId ?? undefined);
          if (success) {
            console.log(`[JobQueue] Removed ${relikedPostIds.length} posts from unliked archive`);
          } else {
            console.error(`[JobQueue] Failed to remove re-liked posts from archive`);
          }
        }

        console.log(`[JobQueue] Re-like complete: ${relikedPostIds.length}/${limitedPostIds.length} successful`);
      },

      _processPurgeJob: async (job) => {
        const data = job.data as PurgeJobData;
        const { category } = data;

        console.log(`[JobQueue] Purging ${category}`);

        // Update progress to show started
        get()._updateJobProgress(job.id, 0, 0);

        // Add delay for visual feedback
        await sleep(800);

        try {
          switch (category) {
            case 'liked-posts': {
              // Unlike all liked posts
              console.log('[JobQueue] Fetching liked posts for purge...');
              const likedPostsResponse = await fetchLikedPosts(1000);
              if (likedPostsResponse.posts && likedPostsResponse.posts.length > 0) {
                console.log(`[JobQueue] Unliking ${likedPostsResponse.posts.length} liked posts...`);
                for (const post of likedPostsResponse.posts) {
                  try {
                    await unlikePost(post.id);
                  } catch (error) {
                    console.error(`[JobQueue] Failed to unlike post ${post.id}:`, error);
                  }
                }
              }
              console.log('[JobQueue] Purged liked posts');
              break;
            }

            case 'unliked-archive': {
              // Clear unliked archive
              await clearUnlikedPosts();
              console.log('[JobQueue] Purged unliked archive');
              break;
            }

            case 'prompt-packs': {
              // Clear all packs
              usePromptStore.getState().clearAllPacks();
              console.log('[JobQueue] Purged prompt packs');
              break;
            }
          }

          // Update progress to complete
          get()._updateJobProgress(job.id, 1, 100);
        } catch (error) {
          console.error(`[JobQueue] Purge failed for ${category}:`, error);
          throw error;
        }
      },
    }),
    {
      name: 'imaginegodmode-job-queue',
      partialize: (state) => ({
        jobs: state.jobs.filter((job) => job.status !== 'processing'), // Don't persist processing state
      }),
    }
  )
);

/**
 * Helper function to poll for HD URLs after upscaling
 */
async function pollForHdUrls(postIds: string[], videoIds: string[]): Promise<Record<string, string>> {
  const hdUrlMap: Record<string, string> = {};
  const maxAttempts = 60; // 3-5 minutes max
  let attempts = 0;

  while (Object.keys(hdUrlMap).length < videoIds.length && attempts < maxAttempts) {
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
              mediaUrl.type === 'video' &&
              !hdUrlMap[mediaUrl.id]
            ) {
              hdUrlMap[mediaUrl.id] = mediaUrl.url;
            }
          }
        }
      } catch (error) {
        console.error('[JobQueue] Poll error:', error);
      }
    }

    if (Object.keys(hdUrlMap).length < videoIds.length) {
      await new Promise((resolve) =>
        setTimeout(resolve, randomDelay(TIMING.UPSCALE_REFETCH_MIN, TIMING.UPSCALE_REFETCH_MAX))
      );
      attempts++;
    }
  }

  return hdUrlMap;
}
