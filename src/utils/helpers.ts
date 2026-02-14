/**
 * Utility helper functions
 */

import { URL_CONFIG, DEFAULTS } from './constants';

/**
 * Extract post ID from current URL
 * @returns Post ID or null if not found
 */
export const getPostIdFromUrl = (): string | null => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  // expected: ["imagine", "post", "<id>"]
  return parts[URL_CONFIG.POST_ID_INDEX] || null;
};

/**
 * Extract filename from URL
 * @param url - URL to extract filename from
 * @param fallbackIndex - Fallback index if filename can't be extracted
 * @returns Filename
 */
export const extractFilename = (url: string, fallbackIndex: number = 0): string => {
  const clean = url.split('?')[0];
  return (
    clean.split('/').filter(Boolean).pop() ||
    `${DEFAULTS.MEDIA_FILENAME_PREFIX}${fallbackIndex + 1}`
  );
};

/**
 * Pick the best download URL from a media object
 * @param obj - Media object
 * @returns Best available URL or null
 */
export const pickDownloadUrl = (obj: { hdMediaUrl?: string; mediaUrl?: string; thumbnailImageUrl?: string } | null | undefined): string | null => {
  if (!obj) {
    return null;
  }
  return obj.hdMediaUrl || obj.mediaUrl || obj.thumbnailImageUrl || null;
};

/**
 * Extract hdMediaUrl from an upscale response payload
 * @param payload - Unknown response payload
 * @returns HD media URL if present
 */
export const extractHdMediaUrl = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const directHdMediaUrl = record.hdMediaUrl;
  if (typeof directHdMediaUrl === 'string' && directHdMediaUrl.length > 0) {
    return directHdMediaUrl;
  }

  const nestedData = record.data;
  if (!nestedData || typeof nestedData !== 'object') {
    return null;
  }

  const nestedHdMediaUrl = (nestedData as Record<string, unknown>).hdMediaUrl;
  if (typeof nestedHdMediaUrl === 'string' && nestedHdMediaUrl.length > 0) {
    return nestedHdMediaUrl;
  }

  return null;
};

/**
 * Create a random delay between min and max milliseconds
 * @param min - Minimum delay in ms
 * @param max - Maximum delay in ms
 * @returns Random delay
 */
export const randomDelay = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

/**
 * Format time string
 * @returns Current time as locale string
 */
export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString();
};

/**
 * Sleep/delay helper
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
