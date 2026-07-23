/**
 * API functions for fetching data from Grok
 */

import { API_ENDPOINTS } from '@/utils/constants';
import { PostData, LikedPostsResponse } from '@/types';

/**
 * Generate a UUID v4 in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a random base64-like string for statsig ID (88 characters)
 * Format: base64 characters including +, /, and alphanumeric
 */
const generateStatsigId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

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
  hdMediaUrl?: string;
}

/**
 * Fetch post data from Grok API
 * @param postId - Post ID to fetch
 * @param requestUserId - Current Grok user ID, when available
 * @returns Post data or null if post not found
 */
export const fetchPostData = async (postId: string, requestUserId?: string): Promise<PostData | null> => {
  try {
    const res = await fetch(API_ENDPOINTS.POST_GET, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: postId, ...(requestUserId ? { requestUserId } : {}) }),
      credentials: 'include',
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const errorData = JSON.parse(text);
        if (errorData?.code === 5 || errorData?.message?.includes('not found')) {
          return null;
        }
        if (errorData?.code === 16 || res.status === 401) {
          console.warn('[ImagineGodMode] Not authenticated - please log in to Grok');
          return null;
        }
      } catch {
        // Not JSON, continue with normal error handling
      }
      if (res.status === 404 || res.status === 401) {
        return null;
      }
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[ImagineGodMode] fetchPostData error:', error);
    return null;
  }
};

interface ConversationAssetMetadata {
  assetId?: string;
  mimeType?: string;
  createTime?: string;
  summary?: string;
  previewImageKey?: string;
  key?: string;
  auxKeys?: Record<string, string>;
  isDeleted?: boolean;
  width?: number;
  height?: number;
  hdKey?: string;
  hd1080Key?: string;
}

interface ConversationResponse {
  responseId?: string;
  sender?: string;
  fileAttachments?: string[];
  fileAttachmentAssetMetadata?: ConversationAssetMetadata[];
}

interface ConversationResponsesPayload {
  conversationId?: string;
  responses?: ConversationResponse[];
}

const isHumanResponse = (response: ConversationResponse): boolean =>
  response.sender?.toLowerCase() === 'human';

const GROK_ASSET_ORIGIN = 'https://assets.grok.com/';

const normalizeAssetUrl = (value?: string): string => {
  if (!value) {
    return '';
  }

  try {
    return new URL(value, GROK_ASSET_ORIGIN).toString();
  } catch {
    return value;
  }
};

const getAssetUrl = (asset: ConversationAssetMetadata): string =>
  normalizeAssetUrl(
    asset.key || asset.previewImageKey || asset.auxKeys?.['preview-image']
  );

const fetchMissingConversationAssets = async (
  assetIds: string[]
): Promise<ConversationAssetMetadata[]> => {
  if (assetIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams({ pageSize: String(assetIds.length) });
  assetIds.forEach((assetId) => params.append('assetIds', assetId));

  try {
    const res = await fetch(`/rest/assets?${params.toString()}`, {
      method: 'GET',
      headers: { accept: '*/*' },
      credentials: 'include',
    });
    if (!res.ok) {
      return [];
    }

    const data = await res.json() as { assets?: ConversationAssetMetadata[] };
    return data.assets || [];
  } catch (error) {
    console.warn('[ImagineGodMode] Failed to backfill conversation assets:', error);
    return [];
  }
};

/**
 * Fetch all media attached to an Imagine conversation.
 *
 * Grok's newer Imagine pages use the conversation query parameter to hydrate
 * their filmstrip from app-chat responses instead of /rest/media/post/get.
 */
export const fetchConversationPostData = async (
  conversationId: string
): Promise<PostData | null> => {
  try {
    const params = new URLSearchParams({
      conversationKind: 'CONVERSATION_KIND_IMAGINE',
    });
    const res = await fetch(
      `/rest/app-chat/conversations/${encodeURIComponent(conversationId)}/responses?${params.toString()}`,
      {
        method: 'GET',
        headers: { accept: '*/*' },
        credentials: 'include',
      }
    );

    if (!res.ok) {
      console.warn(
        '[ImagineGodMode] Conversation response fetch failed:',
        res.status,
        res.statusText
      );
      return null;
    }

    const payload = await res.json() as ConversationResponsesPayload;
    const responses = payload.responses || [];
    const firstHumanResponseId = responses
      .filter(isHumanResponse)
      .sort((a, b) => (a.responseId || '').localeCompare(b.responseId || ''))[0]
      ?.responseId;

    const includedResponses = responses.filter(
      (response) => !isHumanResponse(response) || response.responseId === firstHumanResponseId
    );
    const directAssets = includedResponses.flatMap(
      (response) => response.fileAttachmentAssetMetadata || []
    );
    const directAssetIds = new Set(
      directAssets
        .map((asset) => asset.assetId)
        .filter((assetId): assetId is string => !!assetId)
    );
    const missingAssetIds = Array.from(new Set(
      includedResponses
        .flatMap((response) => response.fileAttachments || [])
        .filter((assetId) => !directAssetIds.has(assetId))
    ));
    const backfilledAssets = await fetchMissingConversationAssets(missingAssetIds);

    const assetsById = new Map<string, ConversationAssetMetadata>();
    [...directAssets, ...backfilledAssets].forEach((asset) => {
      if (asset.assetId) {
        assetsById.set(asset.assetId, asset);
      }
    });

    const media = Array.from(assetsById.values())
      .filter((asset) => !asset.isDeleted && !!getAssetUrl(asset))
      .sort((a, b) => (a.createTime || '').localeCompare(b.createTime || ''))
      .map((asset) => {
        const isVideo = asset.mimeType?.startsWith('video/') === true;
        return {
          id: asset.assetId || '',
          userId: '',
          createTime: asset.createTime || '',
          prompt: asset.summary || '',
          mediaType: isVideo ? 'MEDIA_POST_TYPE_VIDEO' : 'MEDIA_POST_TYPE_IMAGE',
          mediaUrl: getAssetUrl(asset),
          mimeType: asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
          audioUrls: [],
          childPosts: [],
          resolution: asset.width && asset.height
            ? { width: asset.width, height: asset.height }
            : undefined,
          thumbnailImageUrl: normalizeAssetUrl(
            asset.previewImageKey || asset.auxKeys?.['preview-image']
          ) || undefined,
          hdMediaUrl: normalizeAssetUrl(asset.hd1080Key || asset.hdKey) || undefined,
        };
      });

    const resolvedConversationId = payload.conversationId || conversationId;
    const images = media.filter((asset) => !asset.mimeType.startsWith('video/'));
    const videos = media.filter((asset) => asset.mimeType.startsWith('video/'));

    return {
      post: {
        id: resolvedConversationId,
        userId: '',
        createTime: media[0]?.createTime || '',
        prompt: '',
        mediaType: '',
        mediaUrl: '',
        mimeType: '',
        audioUrls: [],
        childPosts: [],
        images,
        videos,
      },
    };
  } catch (error) {
    console.error('[ImagineGodMode] fetchConversationPostData error:', error);
    return null;
  }
};
/**
 * Fetch liked posts from Grok API
 * @param limit - Maximum number of posts to fetch
 * @returns Liked posts response
 */
export const fetchLikedPosts = async (limit: number = DEFAULT_POST_FETCH_LIMIT): Promise<LikedPostsResponse> => {
  console.log('[ImagineGodMode API] Fetching liked posts, limit:', limit);

  try {
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
      if (res.status === 401) {
        console.warn('[ImagineGodMode] Not authenticated - please log in to Grok');
        return { posts: [] };
      }
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log('[ImagineGodMode API] Liked posts success:', data);
    return data;
  } catch (error) {
    console.error('[ImagineGodMode] fetchLikedPosts error:', error);
    return { posts: [] };
  }
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

  try {
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
      if (res.status === 401) {
        console.warn('[ImagineGodMode] Not authenticated - please log in to Grok');
        return { posts: [] };
      }
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log('[ImagineGodMode API] Unliked posts success, posts count:', data.posts?.length || 0);
    return data;
  } catch (error) {
    console.error('[ImagineGodMode] fetchUnlikedPosts error:', error);
    return { posts: [] };
  }
};

/**
 * Like a post
 * @param postId - Post ID to like
 * @returns Like response
 */
export const likePost = async (postId: string): Promise<SimpleApiResponse> => {
  console.log('[ImagineGodMode API] Liking post:', postId);

  try {
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
      return { success: false, error: `HTTP ${res.status}: ${text}` };
    }

    const data = await res.json().catch(() => ({}));
    console.log('[ImagineGodMode API] Like success:', data);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ImagineGodMode API] Like exception:', errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Unlike a post
 * @param postId - Post ID to unlike
 * @returns Unlike response
 */
export const unlikePost = async (postId: string): Promise<SimpleApiResponse> => {
  console.log('[ImagineGodMode API] Unliking post:', postId);

  try {
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
      return { success: false, error: `HTTP ${res.status}: ${text}` };
    }

    const data = await res.json().catch(() => ({}));
    console.log('[ImagineGodMode API] Unlike success:', data);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ImagineGodMode API] Unlike exception:', errorMsg);
    return { success: false, error: errorMsg };
  }
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

/**
 * Generate video from image with prompt
 * @param parentPostId - Parent post ID (image to animate)
 * @param prompt - Text prompt for video generation
 * @param aspectRatio - Aspect ratio (default: "1:1")
 * @param videoLength - Video length in seconds (default: 6)
 * @returns Generation response
 */
export const generateVideo = async (
  parentPostId: string,
  prompt: string,
  aspectRatio: string = '1:1',
  videoLength: number = 6
): Promise<SimpleApiResponse> => {
  console.log('[ImagineGodMode API] Generating video:', {
    parentPostId,
    prompt,
    aspectRatio,
    videoLength,
  });

  const imageUrl = `https://imagine-public.x.ai/imagine-public/share-images/${parentPostId}.png`;
  const fullPrompt = `${imageUrl}  ${prompt}`;

  // Generate new IDs for each request
  const requestId = generateUUID();
  const statsigId = generateStatsigId();

  const res = await fetch(API_ENDPOINTS.VIDEO_GENERATE, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'x-statsig-id': statsigId,
      'x-xai-request-id': requestId,
    },
    body: JSON.stringify({
      temporary: true,
      modelName: 'grok-3',
      message: fullPrompt,
      toolOverrides: {
        videoGen: true,
      },
      responseMetadata: {
        experiments: [],
        modelConfigOverride: {
          modelMap: {
            videoGenModelConfig: {
              parentPostId,
              aspectRatio,
              videoLength,
            },
          },
        },
      },
    }),
    credentials: 'include',
  });

  console.log('[ImagineGodMode API] Video generation response status:', res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text();
    console.error('[ImagineGodMode API] Video generation error:', text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  // The response is a streaming response - we need to read it as a stream
  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response body reader');
  }

  const decoder = new TextDecoder();
  let wasModerated = false;
  let videoId: string | undefined;
  let finalProgress = 0;
  let accumulatedText = '';

  try {
    // Read the stream until completion or progress reaches 100%
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('[ImagineGodMode API] Stream completed');
        break;
      }

      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;

      // Try to parse any complete JSON objects in the accumulated text
      // Split by }{ pattern to handle concatenated JSON objects
      const jsonArrayText = `[${accumulatedText.replace(/\}\{/g, '},{')}]`;

      let streamObjects: Array<{
        result?: {
          response?: {
            streamingVideoGenerationResponse?: {
              videoId: string;
              progress: number;
              moderated?: boolean;
            };
          };
        };
      }> = [];
      try {
        streamObjects = JSON.parse(jsonArrayText);
      } catch (_error) {
        // Not enough data yet to parse complete JSON, continue reading
        continue;
      }

      // Process all available stream objects
      for (const obj of streamObjects) {
        const streamingResponse = obj?.result?.response?.streamingVideoGenerationResponse;
        if (streamingResponse) {
          videoId = streamingResponse.videoId;
          const progress = streamingResponse.progress;

          console.log('[ImagineGodMode API] Video generation progress:', progress + '%', 'videoId:', videoId);

          // Check if video was moderated at ANY progress step
          if (streamingResponse.moderated === true) {
            wasModerated = true;
            console.log('[ImagineGodMode API] Video was moderated at progress', progress + '%:', videoId);
          }

          // Update final progress
          if (progress > finalProgress) {
            finalProgress = progress;
          }

          // If we reached 100% or were moderated, we can stop
          if (progress >= 100 || wasModerated) {
            console.log('[ImagineGodMode API] Stopping stream read - progress:', progress + '%, moderated:', wasModerated);
            reader.cancel();
            break;
          }
        }
      }

      // If we detected moderation or completion, break out of the read loop
      if (wasModerated || finalProgress >= 100) {
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (wasModerated) {
    throw new Error(`Video generation was moderated/rejected (videoId: ${videoId})`);
  }

  console.log('[ImagineGodMode API] Video generation success:', {
    videoId,
    finalProgress,
    moderated: wasModerated,
  });

  return { success: true };
};
