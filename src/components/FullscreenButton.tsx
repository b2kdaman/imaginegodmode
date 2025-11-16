/**
 * Fullscreen button component for video playback
 */

import React, { useState } from 'react';
import { Button } from './Button';
import { mdiFullscreen } from '@mdi/js';

export const FullscreenButton: React.FC = () => {
  const [errorShown, setErrorShown] = useState(false);

  const handleFullscreen = () => {
    try {
      // Find the visible video element
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

      if (!video) {
        console.error('[GrokGoonify] No video element found for fullscreen');
        setErrorShown(true);
        setTimeout(() => setErrorShown(false), 1000);
        return;
      }

      console.log('[GrokGoonify] Entering fullscreen for video:', video.id);

      // Request fullscreen on the video element
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).mozRequestFullScreen) {
        (video as any).mozRequestFullScreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('[GrokGoonify] Fullscreen error:', error);
      setErrorShown(true);
      setTimeout(() => setErrorShown(false), 1000);
    }
  };

  return (
    <Button
      variant="icon"
      icon={mdiFullscreen}
      onClick={handleFullscreen}
      title="Enter fullscreen"
      className={errorShown ? 'opacity-50' : ''}
    />
  );
};
