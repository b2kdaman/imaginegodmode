/**
 * Media processing functions
 */

import { pickDownloadUrl } from './helpers';
import { MEDIA_TYPES } from './constants';
import { MediaUrl } from '@/types';

interface ProcessedMedia {
  urls: string[];
  videosToUpscale: string[];
  hdVideoCount: number;
  mediaUrls: MediaUrl[];
}

/**
 * Process post data and extract media information
 * @param post - Post data object
 * @returns Processed media data
 */
export const processPostData = (post: any): ProcessedMedia => {
  const urls: string[] = [];
  const videosNeedingUpscale: string[] = [];
  const mediaUrls: MediaUrl[] = [];
  let hdVideoCount = 0;

  if (Array.isArray(post.childPosts) && post.childPosts.length > 0) {
    post.childPosts.forEach((cp: any) => {
      const url = pickDownloadUrl(cp);
      if (url) {
        urls.push(url);

        // Determine media type
        const isVideo = cp.mediaType === MEDIA_TYPES.VIDEO;
        const isHD = !!cp.hdMediaUrl;

        mediaUrls.push({
          url,
          type: isVideo ? 'video' : 'image',
          isHD: isVideo ? isHD : undefined,
        });
      }

      if (cp.mediaType === MEDIA_TYPES.VIDEO) {
        const isHd = !!cp.hdMediaUrl;
        if (isHd) {
          hdVideoCount += 1;
        } else if (cp.id) {
          videosNeedingUpscale.push(cp.id);
        }
      }
    });
  }

  return {
    urls: Array.from(new Set(urls)),
    videosToUpscale: Array.from(new Set(videosNeedingUpscale)),
    hdVideoCount,
    mediaUrls,
  };
};
