/**
 * Message passing utilities for Chrome extension
 */

import { MessagePayload, MessageResponse, PostData } from '@/types';
import { fetchPostData, upscaleVideo } from '@/api/grokApi';

/**
 * Send message to background service worker
 */
export const sendMessageToBackground = async <T = any>(
  payload: MessagePayload
): Promise<MessageResponse<T>> => {
  try {
    const response = await chrome.runtime.sendMessage(payload);
    return response;
  } catch (error) {
    console.error('Failed to send message to background:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Download media using Chrome downloads API via background script
 */
export const downloadMedia = async (urls: string[]): Promise<MessageResponse> => {
  return sendMessageToBackground({
    type: 'DOWNLOAD_MEDIA',
    data: { urls },
  });
};

/**
 * Fetch post data directly from content script
 */
export const fetchPost = async (postId: string): Promise<MessageResponse<PostData>> => {
  try {
    const data = await fetchPostData(postId);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[ImagineGodMode] Fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch post',
    };
  }
};

/**
 * Upscale video directly from content script
 */
export const upscaleVideoById = async (videoId: string): Promise<MessageResponse> => {
  try {
    const data = await upscaleVideo(videoId);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[ImagineGodMode] Upscale failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upscale video',
    };
  }
};
