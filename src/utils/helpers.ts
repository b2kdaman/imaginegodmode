/**
 * Utility helper functions
 */

import { URL_CONFIG, DEFAULTS } from './constants';

/**
 * Extract a post ID from a Grok post URL.
 */
const extractPostId = (url: string): string | null => {
  try {
    const parsed = new URL(url, window.location.origin);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] === 'imagine' && parts[1] === 'post') {
      return parts[URL_CONFIG.POST_ID_INDEX] || null;
    }
  } catch {
    // Ignore malformed or transient SPA metadata.
  }

  return null;
};

/**
 * Extract post ID from the current Grok page.
 *
 * Grok can keep window.location at /imagine while opening a post as an
 * overlay. In that state the canonical link is the authoritative active post.
 * @returns Post ID or null if not found
 */
export const getPostIdFromUrl = (): string | null => {
  const locationPostId = extractPostId(window.location.href);
  if (locationPostId) {
    return locationPostId;
  }

  const canonicalUrl = document
    .querySelector<HTMLLinkElement>('link[rel="canonical"][href*="/imagine/post/"]')
    ?.href;

  return canonicalUrl ? extractPostId(canonicalUrl) : null;
};

/**
 * Extract the Imagine conversation ID used by Grok's newer filmstrip API.
 */
export const getConversationIdFromUrl = (): string | null => {
  try {
    const conversationId = new URL(window.location.href).searchParams
      .get('conversation')
      ?.trim();

    return conversationId && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(conversationId)
      ? conversationId
      : null;
  } catch {
    return null;
  }
};
/**
 * Extract the root media container ID used by Grok's filmstrip request.
 *
 * On direct post pages the path identifies the selected child entity, while
 * the conversation query parameter identifies the container whose images and
 * videos populate the filmstrip.
 */
export const getPostContainerIdFromUrl = (): string | null => {
  return getConversationIdFromUrl() || getPostIdFromUrl();
};

/**
 * Return a stable key that changes for both normal navigation and Grok's
 * same-URL post overlays.
 */
export const getPostContextKey = (): string => {
  return `${window.location.href}|${getPostIdFromUrl() || ''}`;
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
