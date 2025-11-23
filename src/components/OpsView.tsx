/**
 * Ops and media controls view component
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useMediaStore } from '@/store/useMediaStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getPostIdFromUrl, randomDelay } from '@/utils/helpers';
import { fetchPost, downloadMedia, upscaleVideoById } from '@/utils/messaging';
import { processPostData } from '@/utils/mediaProcessor';
import { TIMING } from '@/utils/constants';
import { Button } from './Button';
import { Icon } from './Icon';
import { mdiDownload, mdiImageSizeSelectLarge, mdiCheckCircle } from '@mdi/js';
import { useUrlWatcher } from '@/hooks/useUrlWatcher';
import { trackVideoUpscaled, trackMediaDownloaded } from '@/utils/analytics';
import { NoPostMessage } from './NoPostMessage';

export const OpsView: React.FC = () => {
  const {
    urls,
    videoIdsToUpscale,
    upscaleProgress,
    isUpscaling,
    hdVideoCount,
    statusText,
    setMediaUrls,
    setVideoIdsToUpscale,
    setUpscaleProgress,
    setIsUpscaling,
    setHdVideoCount,
    setStatusText,
  } = useMediaStore();
  const { autoDownload, getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const [refetchInterval, setRefetchInterval] = useState<number | null>(null);
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

  // Upscale videos
  const handleUpscale = async () => {
    if (videoIdsToUpscale.length === 0) {
      setStatusText('No videos to upscale');
      return;
    }

    setIsUpscaling(true);
    setStatusText('Upscaling videos...');

    // Store the IDs of videos being upscaled for auto-download later
    const upscaledVideoIds = [...videoIdsToUpscale];

    const total = videoIdsToUpscale.length;
    let completed = 0;

    // Fire off upscale requests with staggered start times
    const upscalePromises = [];

    for (let i = 0; i < videoIdsToUpscale.length; i++) {
      const videoId = videoIdsToUpscale[i];

      // Start the upscale (don't await it)
      const promise = upscaleVideoById(videoId).then(() => {
        completed++;
        setUpscaleProgress((completed / total) * 100);
        console.log(`[ImagineGodMode] Upscaled ${completed}/${total}: ${videoId}`);
      });

      upscalePromises.push(promise);

      // Add random delay before starting next one (except for the last one)
      if (i < videoIdsToUpscale.length - 1) {
        const delay = randomDelay(TIMING.UPSCALE_DELAY_MIN, TIMING.UPSCALE_DELAY_MAX);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Wait for all to complete
    await Promise.all(upscalePromises);

    // Track upscale completion
    trackVideoUpscaled(total, true);

    // Start refetch loop with the IDs of videos that were upscaled
    startRefetchLoop(upscaledVideoIds);
  };

  const startRefetchLoop = (upscaledVideoIds: string[]) => {
    const interval = window.setInterval(async () => {
      const postId = getPostIdFromUrl();
      if (!postId) return;

      const response = await fetchPost(postId);
      console.log('[ImagineGodMode] Refetch response:', response);

      if (response.success && response.data) {
        const processed = processPostData(response.data);
        console.log('[ImagineGodMode] Refetch processed:', processed);

        setMediaUrls(processed.mediaUrls);
        setVideoIdsToUpscale(processed.videosToUpscale);
        setHdVideoCount(processed.hdVideoCount);
        setStatusText(
          `Found ${processed.urls.length} media (${processed.hdVideoCount} HD videos)`
        );

        // Check if all videos are HD now (use fresh data, not state)
        if (processed.videosToUpscale.length === 0) {
          setIsUpscaling(false);
          setUpscaleProgress(100);
          setStatusText('Upscale complete!');
          clearInterval(interval);
          setRefetchInterval(null);
          console.log('[ImagineGodMode] Upscale complete, stopped refetch loop');

          // Auto-download if enabled (only the videos that were upscaled)
          if (autoDownload) {
            console.log('[ImagineGodMode] Auto-download enabled, downloading upscaled videos:', upscaledVideoIds);
            setTimeout(async () => {
              setStatusText('Auto-downloading upscaled videos...');
              // Only download videos that were just upscaled (match by ID)
              const upscaledUrls = processed.mediaUrls
                .filter((m) => m.type === 'video' && m.id && upscaledVideoIds.includes(m.id))
                .map((m) => m.url);

              if (upscaledUrls.length === 0) {
                setStatusText('No upscaled videos to download');
                return;
              }

              const response = await downloadMedia(upscaledUrls);

              if (response.success) {
                setStatusText(`Auto-downloaded ${response.data.count} upscaled videos`);
                trackMediaDownloaded(response.data.count, 'auto');
              } else {
                setStatusText('Auto-download failed');
              }
            }, 500); // Small delay to ensure UI updates properly
          }
        }
      }
    }, randomDelay(TIMING.UPSCALE_REFETCH_MIN, TIMING.UPSCALE_REFETCH_MAX));

    setRefetchInterval(interval);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refetchInterval !== null) {
        clearInterval(refetchInterval);
      }
    };
  }, [refetchInterval]);

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

      {/* Progress bar */}
      {isUpscaling && (
        <div
          className="w-full rounded-full h-2 overflow-hidden"
          style={{ backgroundColor: colors.BACKGROUND_MEDIUM }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${upscaleProgress}%`,
              backgroundColor: colors.GLOW_PRIMARY,
            }}
          />
        </div>
      )}

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
          disabled={videoIdsToUpscale.length === 0 || isUpscaling}
          className="flex-1"
          tooltip="Upscale videos to HD quality"
        >
          Upscale
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
