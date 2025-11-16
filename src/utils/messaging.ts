/**
 * Message passing utilities for Chrome extension
 */

import { MessagePayload, MessageResponse } from '@/types';

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
 * Fetch post data via background script
 */
export const fetchPost = async (postId: string): Promise<MessageResponse> => {
  return sendMessageToBackground({
    type: 'FETCH_POST',
    data: { postId },
  });
};

/**
 * Upscale video via background script
 */
export const upscaleVideoById = async (videoId: string): Promise<MessageResponse> => {
  return sendMessageToBackground({
    type: 'UPSCALE_VIDEO',
    data: { videoId },
  });
};
