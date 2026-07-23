/**
 * Message passing utilities for Chrome and Firefox extension
 */

import { MessagePayload, MessageResponse, PostData } from '@/types';
import { fetchConversationPostData, fetchPostData, upscaleVideo } from '@/api/grokApi';
import { browserAPI } from './browserAPI';

/**
 * Check if the extension context is still valid
 */
const isExtensionContextValid = (): boolean => {
  try {
    // Try to access browserAPI.runtime.id - if it throws, context is invalidated
    return !!chrome?.runtime?.id;
  } catch {
    return false;
  }
};

/**
 * Send message to background service worker with retry mechanism
 */
export const sendMessageToBackground = async <T = unknown>(
  payload: MessagePayload,
  retries = 3,
  delay = 100
): Promise<MessageResponse<T>> => {
  // Check if extension context is valid before attempting to send message
  if (!isExtensionContextValid()) {
    console.warn('[ImagineGodMode] Extension context invalidated - cannot send message');
    return {
      success: false,
      error: 'Extension was reloaded or updated. Please refresh the page to continue.',
    };
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await browserAPI.runtime.sendMessage(payload);
      return response;
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for extension context invalidation
      if (errorMessage.includes('Extension context invalidated')) {
        console.warn('[ImagineGodMode] Extension context invalidated during message send');
        return {
          success: false,
          error: 'Extension was reloaded or updated. Please refresh the page to continue.',
        };
      }

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

export interface DownloadTask {
  url: string;
  filename?: string;
}

/**
 * Submit download tasks to the background service worker.
 */
export const downloadMedia = async (
  items: Array<string | DownloadTask>
): Promise<MessageResponse> => {
  const tasks = items.map((item) =>
    typeof item === 'string' ? { url: item } : item
  );

  return sendMessageToBackground({
    type: 'DOWNLOAD_MEDIA',
    data: { tasks },
  });
};
/**
 * Fetch post data directly from content script
 */
export const fetchPost = async (postId: string, requestUserId?: string): Promise<MessageResponse<PostData>> => {
  try {
    const data = await fetchPostData(postId, requestUserId);
    if (!data) {
      return {
        success: false,
        error: 'Post not found',
      };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch post',
    };
  }
};

/**
 * Fetch the media collection behind a newer Imagine conversation page.
 */
export const fetchConversationPost = async (
  conversationId: string
): Promise<MessageResponse<PostData>> => {
  try {
    const data = await fetchConversationPostData(conversationId);
    if (!data) {
      return {
        success: false,
        error: 'Conversation media not found',
      };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch conversation media',
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
