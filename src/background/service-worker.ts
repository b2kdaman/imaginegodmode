/**
 * Background service worker for Chrome and Firefox extension.
 * Handles durable browser download tasks; API calls run in the content script.
 */

import { MessagePayload, MessageResponse } from '../types';
import { extractFilename } from '../utils/helpers';
import { TIMING } from '../utils/constants';
import { browserAPI } from '../utils/browserAPI';

interface DownloadTask {
  url: string;
  filename?: string;
}

browserAPI.runtime.onMessage.addListener((message: MessagePayload, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });

  return true;
});

async function handleMessage(message: MessagePayload): Promise<MessageResponse> {
  switch (message.type) {
    case 'DOWNLOAD_MEDIA':
      if (message.data && typeof message.data === 'object') {
        if ('tasks' in message.data && Array.isArray(message.data.tasks)) {
          return handleDownloadTasks(message.data.tasks as DownloadTask[]);
        }
        // Backward compatibility for messages from an older content script.
        if ('urls' in message.data && Array.isArray(message.data.urls)) {
          return handleDownloadTasks(
            (message.data.urls as string[]).map((url) => ({ url }))
          );
        }
      }
      return {
        success: false,
        error: 'Invalid download task data',
      };

    default:
      return {
        success: false,
        error: 'Unknown message type',
      };
  }
}

async function handleDownloadTasks(tasks: DownloadTask[]): Promise<MessageResponse> {
  try {
    const downloadIds: number[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (!task || typeof task.url !== 'string' || !task.url) {
        throw new Error(`Invalid download task at index ${i}`);
      }

      const filename = task.filename || extractFilename(task.url, i);
      const downloadId = await browserAPI.downloads.download({
        url: task.url,
        filename,
        saveAs: false,
      });
      downloadIds.push(downloadId);

      if (i < tasks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, TIMING.DOWNLOAD_DELAY));
      }
    }

    return {
      success: true,
      data: { downloadIds, count: tasks.length },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download media',
    };
  }
}

console.log('[ImagineGodMode] Background service worker loaded');
