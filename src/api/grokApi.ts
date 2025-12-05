/**
 * API functions for fetching data from Grok
 */

import { API_ENDPOINTS } from '@/utils/constants';
import { PostData, LikedPostsResponse } from '@/types';

/**
 * Default limit for fetching posts from the API
 */
export const DEFAULT_POST_FETCH_LIMIT = 100;

/**
 * Media post source types enum
 */
export enum MediaPostSource {
  Invalid = 'MEDIA_POST_SOURCE_INVALID',
  Public = 'MEDIA_POST_SOURCE_PUBLIC',
  Liked = 'MEDIA_POST_SOURCE_LIKED',
  Owned = 'MEDIA_POST_SOURCE_OWNED',
  CharacterMentioned = 'MEDIA_POST_SOURCE_CHARACTER_MENTIONED',
}

/**
 * Simple API response type for like/unlike/delete operations
 */
export interface SimpleApiResponse {
  success: boolean;
  error?: string;
}

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
export const fetchLikedPosts = async (limit: number = DEFAULT_POST_FETCH_LIMIT): Promise<LikedPostsResponse> => {
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
        source: MediaPostSource.Liked,
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
export const fetchUnlikedPosts = async (limit: number = DEFAULT_POST_FETCH_LIMIT, userId?: string): Promise<LikedPostsResponse> => {
  console.log('[ImagineGodMode API] Fetching unliked posts, limit:', limit, 'userId:', userId);

  const filter: { source: MediaPostSource; userId?: string } = {
    source: MediaPostSource.Invalid,
  };

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
export const likePost = async (postId: string): Promise<SimpleApiResponse> => {
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
 * Unlike a post
 * @param postId - Post ID to unlike
 * @returns Unlike response
 */
export const unlikePost = async (postId: string): Promise<SimpleApiResponse> => {
  console.log('[ImagineGodMode API] Unliking post:', postId);

  const res = await fetch(API_ENDPOINTS.POST_UNLIKE, {
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
    console.error('[ImagineGodMode API] Unlike error:', text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json().catch(() => ({}));
  console.log('[ImagineGodMode API] Unlike success:', data);
  return data;
};

/**
 * Delete a post
 * @param postId - Post ID to delete
 * @returns Delete response
 */
export const deletePost = async (postId: string): Promise<SimpleApiResponse> => {
  console.log('[ImagineGodMode API] Deleting post:', postId);

  const res = await fetch(API_ENDPOINTS.POST_DELETE, {
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
    console.error('[ImagineGodMode API] Delete error:', text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json().catch(() => ({}));
  console.log('[ImagineGodMode API] Delete success:', data);
  return data;
};

/**
 * Upscale a video
 * @param videoId - Video ID to upscale
 * @returns Upscale response
 */
export const upscaleVideo = async (videoId: string): Promise<SimpleApiResponse> => {
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
