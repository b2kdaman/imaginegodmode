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
  const res = await fetch(API_ENDPOINTS.POST_GET, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ id: postId }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
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
  console.log('[GrokGoonify] Upscale response for', videoId, json);
  return json;
};
