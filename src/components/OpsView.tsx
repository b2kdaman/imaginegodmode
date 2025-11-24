/**
 * Ops and media controls view component
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useMediaStore } from '@/store/useMediaStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUpscaleQueueStore } from '@/store/useUpscaleQueueStore';
import { getPostIdFromUrl } from '@/utils/helpers';
import { fetchPost, downloadMedia } from '@/utils/messaging';
import { processPostData } from '@/utils/mediaProcessor';
import { Button } from './Button';
import { Icon } from './Icon';
import { mdiDownload, mdiImageSizeSelectLarge, mdiCheckCircle } from '@mdi/js';
import { useUrlWatcher } from '@/hooks/useUrlWatcher';
import { trackMediaDownloaded } from '@/utils/analytics';
import { NoPostMessage } from './NoPostMessage';

export const OpsView: React.FC = () => {
  const {
    urls,
    videoIdsToUpscale,
    hdVideoCount,
    statusText,
    setMediaUrls,
    setVideoIdsToUpscale,
    setHdVideoCount,
    setStatusText,
  } = useMediaStore();
  const { getThemeColors } = useSettingsStore();
  const { addToQueue, isProcessing: isQueueProcessing } = useUpscaleQueueStore();
  const colors = getThemeColors();

  const [postId, setPostId] = useState<string | null>(null);

  // Fetch post data
  const handleFetchPost = useCallback(async () => {
    const currentPostId = getPostIdFromUrl();
    setPostId(currentPostId);
    console.log('[ImagineGodMode] Post ID:', currentPostId);

    if (!currentPostId) {
      return;
    }

    setStatusText('Fetching post data...');
    console.log('[ImagineGodMode] Fetching post:', currentPostId);

    const response = await fetchPost(currentPostId);
    console.log('[ImagineGodMode] Fetch response:', response);

    if (response.success && response.data) {
      const processed = processPostData(response.data);
      console.log('[ImagineGodMode] Processed data:', processed);

      setMediaUrls(processed.mediaUrls);
      setVideoIdsToUpscale(processed.videosToUpscale);
      setHdVideoCount(processed.hdVideoCount);
      setStatusText(
        `Found ${processed.urls.length} media (${processed.hdVideoCount} HD videos)`
      );
    } else {
      console.error('[ImagineGodMode] Fetch failed:', response);
      setStatusText('Failed to fetch post data');
    }
  }, [setMediaUrls, setVideoIdsToUpscale, setHdVideoCount, setStatusText]);

  // Watch for URL changes and refetch data
  useUrlWatcher(handleFetchPost);

  // Auto-fetch on mount
  useEffect(() => {
    handleFetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Download media
  const handleDownload = async () => {
    setStatusText('Downloading...');
    const urlStrings = urls.map((m) => m.url);
    const response = await downloadMedia(urlStrings);

    if (response.success) {
      setStatusText(`Downloaded ${response.data.count} files`);
      trackMediaDownloaded(response.data.count, 'mixed');
    } else {
      setStatusText('Download failed');
    }
  };

  // Add videos to upscale queue
  const handleUpscale = () => {
    if (videoIdsToUpscale.length === 0) {
      setStatusText('No videos to upscale');
      return;
    }

    if (!postId) {
      setStatusText('No post ID found');
      return;
    }

    // Add to global queue - it will auto-start processing
    addToQueue(postId, videoIdsToUpscale);
    setStatusText(`Added ${videoIdsToUpscale.length} videos to queue`);

    // Clear local upscale list since they're now in queue
    setVideoIdsToUpscale([]);
  };

  // Check if all videos are HD
  const allVideosHD = urls.length > 0 && videoIdsToUpscale.length === 0 && hdVideoCount > 0;

  // If no post ID, show a message
  if (!postId) {
    return <NoPostMessage subMessage="Navigate to a post to manage media" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Status text */}
      <div className="text-sm text-center flex items-center justify-center gap-2" style={{ color: colors.TEXT_SECONDARY }}>
        {allVideosHD && (
          <Icon path={mdiCheckCircle} size={0.7} color={colors.SUCCESS} />
        )}
        <span>{statusText}</span>
      </div>


      {/* Media info */}
      {urls.length > 0 && (
        <div
          className="text-xs text-center"
          style={{ color: `${colors.TEXT_SECONDARY}80` }}
        >
          {urls.length} media files • {hdVideoCount} HD videos
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleUpscale}
          icon={mdiImageSizeSelectLarge}
          disabled={videoIdsToUpscale.length === 0}
          className="flex-1"
          tooltip={isQueueProcessing ? 'Add to upscale queue' : 'Upscale videos to HD quality'}
        >
          {isQueueProcessing ? 'Add to Queue' : 'Upscale'}
        </Button>

        <Button
          onClick={handleDownload}
          icon={mdiDownload}
          disabled={urls.length === 0 || videoIdsToUpscale.length > 0}
          className="flex-1"
          tooltip={
            videoIdsToUpscale.length > 0
              ? 'Upscale all videos to HD first'
              : 'Download all media files'
          }
        >
          Download
        </Button>
      </div>
    </div>
  );
};
