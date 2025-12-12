/**
 * Background service worker for Chrome and Firefox extension
 * Handles downloads only - API calls made directly from content script
 */

import { MessagePayload, MessageResponse } from '../types';
import { extractFilename } from '../utils/helpers';
import { TIMING } from '../utils/constants';
import { browserAPI } from '../utils/browserAPI';

// Message listener
browserAPI.runtime.onMessage.addListener((message: MessagePayload, _sender, sendResponse) => {
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
    case 'DOWNLOAD_MEDIA':
      if (message.data && typeof message.data === 'object' && 'urls' in message.data) {
        return handleDownloadMedia((message.data as { urls: string[] }).urls);
      }
      return {
        success: false,
        error: 'Invalid message data',
      };

    default:
      return {
        success: false,
        error: 'Unknown message type',
      };
  }
}

/**
 * Download media files using browser downloads API
 */
async function handleDownloadMedia(urls: string[]): Promise<MessageResponse> {
  try {
    const downloadIds: number[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const filename = extractFilename(url, i);

      // Add &dl=1 parameter to download URL
      const downloadUrl = url.includes('?') ? `${url}&dl=1` : `${url}?dl=1`;

      // Download using browser API
      const downloadId = await browserAPI.downloads.download({
        url: downloadUrl,
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

console.log('[ImagineGodMode] Background service worker loaded');
