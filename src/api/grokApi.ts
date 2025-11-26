/**
 * API functions for fetching data from Grok
 */

import { API_ENDPOINTS } from '@/utils/constants';
import { PostData, LikedPostsResponse } from '@/types';

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
 * Fetch liked posts from Grok API
 * @param limit - Maximum number of posts to fetch
 * @returns Liked posts response
 */
export const fetchLikedPosts = async (limit: number = 40): Promise<LikedPostsResponse> => {
  console.log('[ImagineGodMode API] Fetching liked posts, limit:', limit);

  const res = await fetch(API_ENDPOINTS.POST_LIST, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      limit,
      filter: {
        source: 'MEDIA_POST_SOURCE_LIKED',
      },
    }),
    credentials: 'include',
  });

  console.log('[ImagineGodMode API] Liked posts response status:', res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text();
    console.error('[ImagineGodMode API] Error response:', text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log('[ImagineGodMode API] Liked posts success:', data);
  return data;
};

/**
 * Fetch unliked posts from Grok API
 * @param limit - Maximum number of posts to fetch
 * @param userId - Optional user ID to filter by
 * @returns Unliked posts response
 */
export const fetchUnlikedPosts = async (limit: number = 40, userId?: string): Promise<LikedPostsResponse> => {
  console.log('[ImagineGodMode API] Fetching unliked posts, limit:', limit, 'userId:', userId);

  const filter: any = {
    source: 'MEDIA_POST_SOURCE_IMAGE',
  };

  if (userId) {
    filter.user = userId;
  }

  const res = await fetch(API_ENDPOINTS.POST_LIST, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      limit,
      filter,
    }),
    credentials: 'include',
  });

  console.log('[ImagineGodMode API] Unliked posts response status:', res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text();
    console.error('[ImagineGodMode API] Error response:', text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log('[ImagineGodMode API] Unliked posts success, posts count:', data.posts?.length || 0);
  return data;
};

/**
 * Like a post
 * @param postId - Post ID to like
 * @returns Like response
 */
export const likePost = async (postId: string): Promise<any> => {
  console.log('[ImagineGodMode API] Liking post:', postId);

  const res = await fetch(API_ENDPOINTS.POST_LIKE, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ id: postId }),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[ImagineGodMode API] Like error:', text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json().catch(() => ({}));
  console.log('[ImagineGodMode API] Like success:', data);
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
