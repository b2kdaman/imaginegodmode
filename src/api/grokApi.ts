/**
 * API functions for fetching data from Grok
 */

import { API_ENDPOINTS } from '@/utils/constants';
import { PostData } from '@/types';

/**
 * Fetch post data from Grok API
 * @param postId - Post ID to fetch
 * @returns Post data
 */
export const fetchPostData = async (postId: string): Promise<PostData> => {
  console.log('[ImagineGodMode API] Fetching post:', postId, 'URL:', API_ENDPOINTS.POST_GET);

  const res = await fetch(API_ENDPOINTS.POST_GET, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ id: postId }),
    credentials: 'include', // Include cookies for authentication
  });

  console.log('[ImagineGodMode API] Response status:', res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text();
    console.error('[ImagineGodMode API] Error response:', text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log('[ImagineGodMode API] Success:', data);
  return data;
};

/**
 * Upscale a video
 * @param videoId - Video ID to upscale
 * @returns Upscale response
 */
export const upscaleVideo = async (videoId: string): Promise<any> => {
  const res = await fetch(API_ENDPOINTS.VIDEO_UPSCALE, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ videoId }),
  });

  if (!res.ok) {
    throw new Error(`Upscale HTTP ${res.status}`);
  }

  const json = await res.json().catch(() => null);
  console.log('[ImagineGodMode] Upscale response for', videoId, json);
  return json;
};
