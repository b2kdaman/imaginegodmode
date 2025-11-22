/**
 * Media processing functions
 */

import { pickDownloadUrl } from './helpers';
import { MEDIA_TYPES } from './constants';
import { MediaUrl, PostData, ChildPost } from '@/types';

interface ProcessedMedia {
  urls: string[];
  videosToUpscale: string[];
  hdVideoCount: number;
  mediaUrls: MediaUrl[];
}

/**
 * Process post data and extract media information
 * @param data - Post data response object
 * @returns Processed media data
 */
export const processPostData = (data: PostData): ProcessedMedia => {
  const urls: string[] = [];
  const videosNeedingUpscale: string[] = [];
  const mediaUrls: MediaUrl[] = [];
  let hdVideoCount = 0;

  console.log('[ImagineGodMode] Processing post data:', data);

  // Extract the post from the response
  const post = data.post;

  if (!post) {
    console.error('[ImagineGodMode] No post in response data');
    return {
      urls: [],
      videosToUpscale: [],
      hdVideoCount: 0,
      mediaUrls: [],
    };
  }

  // Process child posts
  if (Array.isArray(post.childPosts) && post.childPosts.length > 0) {
    console.log('[ImagineGodMode] Processing', post.childPosts.length, 'child posts');

    post.childPosts.forEach((cp: ChildPost) => {
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
          id: cp.id,
        });

        console.log('[ImagineGodMode] Added media:', { url, type: isVideo ? 'video' : 'image', isHD });
      }

      if (cp.mediaType === MEDIA_TYPES.VIDEO) {
        const isHd = !!cp.hdMediaUrl;
        if (isHd) {
          hdVideoCount += 1;
          console.log('[ImagineGodMode] Found HD video:', cp.id);
        } else if (cp.id) {
          videosNeedingUpscale.push(cp.id);
          console.log('[ImagineGodMode] Video needs upscale:', cp.id);
        }
      }
    });
  } else {
    console.log('[ImagineGodMode] No child posts found');
  }

  const result = {
    urls: Array.from(new Set(urls)),
    videosToUpscale: Array.from(new Set(videosNeedingUpscale)),
    hdVideoCount,
    mediaUrls,
  };

  console.log('[ImagineGodMode] Processing complete:', result);

  return result;
};
