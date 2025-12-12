/**
 * Message passing utilities for Chrome and Firefox extension
 */

import { MessagePayload, MessageResponse, PostData } from '@/types';
import { fetchPostData, upscaleVideo } from '@/api/grokApi';
import { browserAPI } from './browserAPI';

/**
 * Send message to background service worker with retry mechanism
 */
export const sendMessageToBackground = async <T = unknown>(
  payload: MessagePayload,
  retries = 3,
  delay = 100
): Promise<MessageResponse<T>> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await browserAPI.runtime.sendMessage(payload);
      return response;
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if it's a "Receiving end does not exist" error (service worker inactive)
      if (errorMessage.includes('Receiving end does not exist')) {
        if (!isLastAttempt) {
          console.log(`[ImagineGodMode] Service worker inactive, retrying (${attempt + 1}/${retries})...`);
          // Wait before retry to give service worker time to wake up
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          continue;
        }
      }

      console.error('Failed to send message to background:', error);
      return {
        success: false,
        error: isLastAttempt
          ? `${errorMessage}. Try reloading the extension or refreshing the page.`
          : errorMessage,
      };
    }
  }

  // This should never be reached, but TypeScript requires it
  return {
    success: false,
    error: 'Failed after all retry attempts',
  };
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
