/**
 * Ops and media controls view component
 */

import React, { useEffect, useState } from 'react';
import { useMediaStore } from '@/store/useMediaStore';
import { getPostIdFromUrl } from '@/utils/helpers';
import { fetchPost, downloadMedia, upscaleVideoById } from '@/utils/messaging';
import { processPostData } from '@/utils/mediaProcessor';
import { randomDelay } from '@/utils/helpers';
import { TIMING } from '@/utils/constants';
import { Button } from './Button';
import { mdiDownload, mdiImageSizeSelectLarge } from '@mdi/js';

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

  const [refetchInterval, setRefetchInterval] = useState<number | null>(null);

  // Fetch post data
  const handleFetchPost = async () => {
    const postId = getPostIdFromUrl();
    if (!postId) {
      setStatusText('No post ID found');
      return;
    }

    setStatusText('Fetching post data...');
    const response = await fetchPost(postId);

    if (response.success && response.data) {
      const processed = processPostData(response.data);
      setMediaUrls(processed.mediaUrls);
      setVideoIdsToUpscale(processed.videosToUpscale);
      setHdVideoCount(processed.hdVideoCount);
      setStatusText(
        `Found ${processed.urls.length} media (${processed.hdVideoCount} HD videos)`
      );
    } else {
      setStatusText('Failed to fetch post data');
    }
  };

  // Download media
  const handleDownload = async () => {
    if (urls.length === 0) {
      await handleFetchPost();
      return;
    }

    setStatusText('Downloading...');
    const urlStrings = urls.map((m) => m.url);
    const response = await downloadMedia(urlStrings);

    if (response.success) {
      setStatusText(`Downloaded ${response.data.count} files`);
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

    const total = videoIdsToUpscale.length;
    let completed = 0;

    for (const videoId of videoIdsToUpscale) {
      await upscaleVideoById(videoId);
      completed++;
      setUpscaleProgress((completed / total) * 100);

      if (completed < total) {
        const delay = randomDelay(TIMING.UPSCALE_DELAY_MIN, TIMING.UPSCALE_DELAY_MAX);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Start refetch loop
    startRefetchLoop();
  };

  const startRefetchLoop = () => {
    const interval = window.setInterval(async () => {
      await handleFetchPost();

      // Check if all videos are HD now
      if (videoIdsToUpscale.length === 0) {
        setIsUpscaling(false);
        setUpscaleProgress(100);
        setStatusText('Upscale complete!');
        if (refetchInterval !== null) {
          clearInterval(refetchInterval);
          setRefetchInterval(null);
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

  return (
    <div className="flex flex-col gap-3">
      {/* Status text */}
      <div className="text-sm text-white/70 text-center">{statusText}</div>

      {/* Progress bar */}
      {isUpscaling && (
        <div className="w-full bg-grok-gray rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${upscaleProgress}%` }}
          />
        </div>
      )}

      {/* Media info */}
      {urls.length > 0 && (
        <div className="text-xs text-white/50 text-center">
          {urls.length} media files • {hdVideoCount} HD videos
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          icon={mdiDownload}
          className="flex-1"
        >
          Download
        </Button>

        <Button
          onClick={handleUpscale}
          icon={mdiImageSizeSelectLarge}
          disabled={videoIdsToUpscale.length === 0 || isUpscaling}
          className="flex-1"
        >
          Upscale
        </Button>
      </div>
    </div>
  );
};
