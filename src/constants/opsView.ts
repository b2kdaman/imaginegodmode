/**
 * Constants for OpsView component
 */

// Processing delays (in milliseconds)
export const PROCESSING_DELAYS = {
  INITIAL_RENDER: 100,        // Initial delay to ensure modal is rendered
  RENDER_CYCLE: 50,           // Delay to force React render cycle
  COMPLETION_DISPLAY: 500,    // Delay to show completion before navigation
  MIN_API_CALL: 450,          // Minimum delay between API calls
  MAX_API_CALL: 500,          // Maximum random additional delay
} as const;

// URLs
export const NAVIGATION_URLS = {
  FAVORITES: 'https://grok.com/imagine/favorites',
  POST: (postId: string) => `https://grok.com/imagine/post/${postId}`,
} as const;

// Status messages
export const STATUS_MESSAGES = {
  FETCHING: 'Fetching post data...',
  DOWNLOADING: 'Downloading...',
  NO_VIDEOS: 'No videos to upscale',
  NO_POST_ID: 'No post ID found',
  FETCH_FAILED: 'Failed to fetch post data',
  DOWNLOAD_FAILED: 'Download failed',
  FETCH_LIKED_FAILED: 'Failed to fetch liked posts',
  FOUND_MEDIA: (count: number, hdCount: number) =>
    `Found ${count} media (${hdCount} HD videos)`,
  DOWNLOADED: (count: number) => `Downloaded ${count} files`,
  ADDED_TO_QUEUE: (count: number) => `Added ${count} videos to queue`,
  PROCESSING_POSTS: (count: number) => `Processing ${count} posts...`,
  ADDED_VIDEOS_TO_QUEUE: (videoCount: number, postCount: number) =>
    `Added ${videoCount} videos from ${postCount} posts to queue`,
  UNLIKED_POSTS: (success: number, total: number) =>
    `Unliked ${success} of ${total} posts`,
  RELIKED_POSTS: (success: number, total: number) =>
    `Re-liked ${success} of ${total} posts`,
  SAVED_TO_ARCHIVE: (count: number) =>
    `Saved ${count} unliked posts to archive`,
  REMOVED_FROM_ARCHIVE: (count: number) =>
    `Removed ${count} re-liked posts from archive`,
} as const;

// Log prefixes
export const LOG_PREFIX = '[ImagineGodMode]';
