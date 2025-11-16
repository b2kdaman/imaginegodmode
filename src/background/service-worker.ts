/**
 * Background service worker for Chrome extension
 * Handles API calls and downloads
 */

import { MessagePayload, MessageResponse } from '../types';
import { fetchPostData, upscaleVideo } from '../api/grokApi';
import { extractFilename } from '../utils/helpers';
import { TIMING } from '../utils/constants';

// Message listener
chrome.runtime.onMessage.addListener((message: MessagePayload, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });

  // Return true to indicate we will send response asynchronously
  return true;
});

/**
 * Handle messages from content script
 */
async function handleMessage(message: MessagePayload): Promise<MessageResponse> {
  switch (message.type) {
    case 'FETCH_POST':
      return handleFetchPost(message.data.postId);

    case 'UPSCALE_VIDEO':
      return handleUpscaleVideo(message.data.videoId);

    case 'DOWNLOAD_MEDIA':
      return handleDownloadMedia(message.data.urls);

    default:
      return {
        success: false,
        error: 'Unknown message type',
      };
  }
}

/**
 * Fetch post data from Grok API
 */
async function handleFetchPost(postId: string): Promise<MessageResponse> {
  try {
    const data = await fetchPostData(postId);
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
}

/**
 * Upscale video
 */
async function handleUpscaleVideo(videoId: string): Promise<MessageResponse> {
  try {
    const data = await upscaleVideo(videoId);
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upscale video',
    };
  }
}

/**
 * Download media files using Chrome downloads API
 */
async function handleDownloadMedia(urls: string[]): Promise<MessageResponse> {
  try {
    const downloadIds: number[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const filename = extractFilename(url, i);

      // Download using Chrome API
      const downloadId = await chrome.downloads.download({
        url,
        filename,
        saveAs: false,
      });

      downloadIds.push(downloadId);

      // Add delay between downloads
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, TIMING.DOWNLOAD_DELAY));
      }
    }

    return {
      success: true,
      data: { downloadIds, count: urls.length },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download media',
    };
  }
}

console.log('[GrokGoonify] Background service worker loaded');
