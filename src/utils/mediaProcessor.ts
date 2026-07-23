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

type MediaPost = PostData['post'] | ChildPost;

const isVideoMedia = (post: MediaPost, url: string): boolean => {
  return (
    post.mediaType === MEDIA_TYPES.VIDEO ||
    post.mimeType?.startsWith('video/') ||
    /\.(?:mp4|webm|mov|m4v)(?:[?#]|$)/i.test(url)
  );
};

const getNestedMedia = (post: MediaPost): MediaPost[] => {
  const nested: MediaPost[] = [];

  if (Array.isArray(post.childPosts)) {
    nested.push(...post.childPosts);
  }
  if (Array.isArray(post.images)) {
    nested.push(...post.images);
  }
  if (Array.isArray(post.videos)) {
    nested.push(...post.videos);
  }

  return nested;
};

const normalizePreviewUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    const base = /^\/?users\//i.test(value)
      ? 'https://assets.grok.com/'
      : window.location.origin;
    return new URL(value.replace(/^\//, ''), `${base.replace(/\/$/, '')}/`).toString();
  } catch {
    return value;
  }
};
const replaceAssetFilename = (sourceUrl: string, filename: string): string => {
  try {
    const url = new URL(sourceUrl);
    url.pathname = url.pathname.replace(/\/[^/]+$/, `/${filename}`);
    return url.toString();
  } catch {
    return sourceUrl;
  }
};

/**
 * Extract every media entity shown in Grok's current post filmstrip.
 *
 * The post API currently omits several siblings that are still present in the
 * filmstrip. Duration badges distinguish videos from images, while generated
 * preview URLs can be converted to their original media URLs.
 */
export const extractFilmstripMedia = (): MediaUrl[] => {
  if (typeof document === 'undefined') {
    return [];
  }

  const mediaByEntity = new Map<string, MediaUrl>();
  const items = document.querySelectorAll<HTMLElement>('[data-filmstrip-item="true"]');

  items.forEach((item) => {
    const element = item.querySelector<HTMLImageElement | HTMLVideoElement>('img, video');
    if (!element) {
      return;
    }

    const sourceUrl = element instanceof HTMLVideoElement
      ? element.currentSrc || element.src || element.poster
      : element.currentSrc || element.src;

    if (!sourceUrl) {
      return;
    }

    const generatedMatch = sourceUrl.match(/\/generated\/([^/]+)\/([^/?#]+)/);
    const contentMatch = sourceUrl.match(/\/users\/[^/]+\/([^/]+)\/content(?:[?#]|$)/);
    const hasDuration = /\b\d+:\d{2}\b/.test(item.textContent || '');
    const isVideo = element instanceof HTMLVideoElement || hasDuration;
    const id = generatedMatch?.[1] || contentMatch?.[1];

    let url = sourceUrl;
    if (generatedMatch?.[2] === 'preview_image.jpg') {
      url = replaceAssetFilename(
        sourceUrl,
        isVideo ? 'generated_video.mp4' : 'image.jpg'
      );
    }

    const media: MediaUrl = {
      url,
      previewUrl: sourceUrl,
      type: isVideo ? 'video' : 'image',
      isHD: isVideo ? /(?:_hd|\/hd\/|1080)/i.test(url) : undefined,
      id,
    };
    mediaByEntity.set(`${id || url}:${media.type}`, media);
  });

  return Array.from(mediaByEntity.values());
};

/**
 * Process post data and extract media information
 * @param data - Post data response object
 * @returns Processed media data
 */
export const processPostData = (data: PostData): ProcessedMedia => {
  const urls: string[] = [];
  const videosNeedingUpscale = new Set<string>();
  const mediaUrls: MediaUrl[] = [];
  const hdVideoIds = new Set<string>();

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

  // The current API returns the active entity as the root post. Older
  // responses put media only in childPosts, and some responses also expose
  // images/videos collections, so walk all supported containers.
  const pending: MediaPost[] = [post];
  const visited = new Set<MediaPost>();
  const entities = new Map<string, MediaPost>();

  while (pending.length > 0) {
    const mediaPost = pending.shift();
    if (!mediaPost || visited.has(mediaPost)) {
      continue;
    }
    visited.add(mediaPost);
    pending.push(...getNestedMedia(mediaPost));

    const url = pickDownloadUrl(mediaPost);
    if (!url) {
      continue;
    }

    const entityKey = mediaPost.id || url;
    const existing = entities.get(entityKey);
    if (!existing || (!existing.hdMediaUrl && mediaPost.hdMediaUrl)) {
      entities.set(entityKey, mediaPost);
    }
  }

  console.log('[ImagineGodMode] Processing', entities.size, 'media entities');

  for (const mediaPost of entities.values()) {
    const url = pickDownloadUrl(mediaPost);
    if (!url) {
      continue;
    }

    const isVideo = isVideoMedia(mediaPost, url);
    const isHD = isVideo && (
      !!mediaPost.hdMediaUrl ||
      /(?:_hd|\/hd\/|1080)/i.test(url)
    );

    urls.push(url);
    mediaUrls.push({
      url,
      previewUrl: normalizePreviewUrl(mediaPost.thumbnailImageUrl),
      type: isVideo ? 'video' : 'image',
      isHD: isVideo ? isHD : undefined,
      id: mediaPost.id,
    });

    if (isVideo && mediaPost.id) {
      if (isHD) {
        hdVideoIds.add(mediaPost.id);
        videosNeedingUpscale.delete(mediaPost.id);
        console.log('[ImagineGodMode] Found HD video:', mediaPost.id);
      } else if (!hdVideoIds.has(mediaPost.id)) {
        videosNeedingUpscale.add(mediaPost.id);
        console.log('[ImagineGodMode] Video needs upscale:', mediaPost.id);
      }
    }
    console.log('[ImagineGodMode] Added media:', { url, type: isVideo ? 'video' : 'image', isHD });
  }

  const result = {
    urls: Array.from(new Set(urls)),
    videosToUpscale: Array.from(videosNeedingUpscale),
    hdVideoCount: hdVideoIds.size,
    mediaUrls,
  };

  console.log('[ImagineGodMode] Processing complete:', result);

  return result;
};
