/**
 * Pause/Play button component for video playback control
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiPlay, mdiPause } from '@mdi/js';
import { getPostIdFromUrl } from '@/utils/helpers';

export const PauseButton: React.FC = () => {
  const [errorShown, setErrorShown] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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

  // Update pause state when video state changes
  useEffect(() => {
    const updatePauseState = () => {
      const video = getActiveVideo();
      if (video) {
        setIsPaused(video.paused);
      }
    };

    // Check initial state
    updatePauseState();

    // Listen for play/pause events
    const handlePlay = () => setIsPaused(false);
    const handlePause = () => setIsPaused(true);

    const hdVideo = document.getElementById('hd-video') as HTMLVideoElement;
    const sdVideo = document.getElementById('sd-video') as HTMLVideoElement;

    if (hdVideo) {
      hdVideo.addEventListener('play', handlePlay);
      hdVideo.addEventListener('pause', handlePause);
    }
    if (sdVideo) {
      sdVideo.addEventListener('play', handlePlay);
      sdVideo.addEventListener('pause', handlePause);
    }

    return () => {
      if (hdVideo) {
        hdVideo.removeEventListener('play', handlePlay);
        hdVideo.removeEventListener('pause', handlePause);
      }
      if (sdVideo) {
        sdVideo.removeEventListener('play', handlePlay);
        sdVideo.removeEventListener('pause', handlePause);
      }
    };
  }, []);

  const handleTogglePlayPause = () => {
    try {
      const video = getActiveVideo();

      if (!video) {
        console.error('[ImagineGodMode] No video element found for play/pause');
        setErrorShown(true);
        setTimeout(() => setErrorShown(false), 1000);
        return;
      }

      if (video.paused) {
        console.log('[ImagineGodMode] Playing video:', video.id);
        video.play();
      } else {
        console.log('[ImagineGodMode] Pausing video:', video.id);
        video.pause();
      }
    } catch (error) {
      console.error('[ImagineGodMode] Play/Pause error:', error);
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
      icon={isPaused ? mdiPlay : mdiPause}
      onClick={handleTogglePlayPause}
      tooltip={isPaused ? 'Play video (Space)' : 'Pause video (Space)'}
      className={errorShown ? 'opacity-50' : ''}
    />
  );
};
