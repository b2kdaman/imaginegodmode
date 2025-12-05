/**
 * Fullscreen button component for video playback
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiFullscreen } from '@mdi/js';
import { getPostIdFromUrl } from '@/utils/helpers';
import { trackVideoFullscreen } from '@/utils/analytics';

export const FullscreenButton: React.FC = () => {
  const [errorShown, setErrorShown] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  const getActiveVideo = (): HTMLVideoElement | null => {
    const hdVideo = document.getElementById('hd-video') as HTMLVideoElement;
    const sdVideo = document.getElementById('sd-video') as HTMLVideoElement;

    let video: HTMLVideoElement | null = null;

    // Check if HD video is visible
    if (
      hdVideo &&
      hdVideo.offsetWidth > 0 &&
      hdVideo.offsetHeight > 0 &&
      getComputedStyle(hdVideo).display !== 'none' &&
      getComputedStyle(hdVideo).visibility !== 'hidden'
    ) {
      video = hdVideo;
    }
    // Otherwise check if SD video is visible
    else if (
      sdVideo &&
      sdVideo.offsetWidth > 0 &&
      sdVideo.offsetHeight > 0 &&
      getComputedStyle(sdVideo).display !== 'none' &&
      getComputedStyle(sdVideo).visibility !== 'hidden'
    ) {
      video = sdVideo;
    }
    // Fallback to whichever exists
    else {
      video = hdVideo || sdVideo;
    }

    return video;
  };

  // Check if button should be visible
  useEffect(() => {
    const checkVisibility = () => {
      const postId = getPostIdFromUrl();
      const video = getActiveVideo();
      setShouldShow(!!(postId && video));
    };

    // Check initial state
    checkVisibility();

    // Check periodically in case video loads later
    const interval = setInterval(checkVisibility, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFullscreen = () => {
    try {
      const video = getActiveVideo();

      if (!video) {
        console.error('[ImagineGodMode] No video element found for fullscreen');
        setErrorShown(true);
        setTimeout(() => setErrorShown(false), 1000);
        return;
      }

      console.log('[ImagineGodMode] Entering fullscreen for video:', video.id);

      // Track fullscreen button click
      trackVideoFullscreen('button');

      // Request fullscreen on the video element
      // Type assertion for browser-specific fullscreen methods
      interface ExtendedHTMLVideoElement extends HTMLVideoElement {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      }
      const videoElement = video as ExtendedHTMLVideoElement;

      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (videoElement.webkitRequestFullscreen) {
        videoElement.webkitRequestFullscreen();
      } else if (videoElement.mozRequestFullScreen) {
        videoElement.mozRequestFullScreen();
      } else if (videoElement.msRequestFullscreen) {
        videoElement.msRequestFullscreen();
      }
    } catch (error) {
      console.error('[ImagineGodMode] Fullscreen error:', error);
      setErrorShown(true);
      setTimeout(() => setErrorShown(false), 1000);
    }
  };

  // Don't render if no post ID or video element
  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      variant="icon"
      icon={mdiFullscreen}
      onClick={handleFullscreen}
      tooltip="Enter fullscreen (F)"
      className={errorShown ? 'opacity-50' : ''}
    />
  );
};
