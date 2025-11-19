/**
 * Keyboard shortcuts hook
 */

import { useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';

export const useKeyboardShortcuts = () => {
  const { getCurrentPrompt } = usePromptStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      // Check if user is typing in a text input
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'TEXTAREA' ||
                       target.tagName === 'INPUT' ||
                       target.isContentEditable;

      // F key: Toggle fullscreen (only when not typing) - works globally
      if (e.key === 'f' && !modifierKey && !isTyping) {
        e.preventDefault();

        // Try to find fullscreen button in extension UI first
        let fullscreenBtn = document.querySelector('[title*="fullscreen" i]') as HTMLButtonElement;

        // If not found in extension, look for video fullscreen controls on page
        if (!fullscreenBtn) {
          fullscreenBtn = document.querySelector('button[aria-label*="fullscreen" i]') as HTMLButtonElement;
        }

        if (fullscreenBtn) {
          fullscreenBtn.click();
        } else {
          // Fallback: try to fullscreen any visible video element
          const video = document.querySelector('video') as HTMLVideoElement;
          if (video) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              video.requestFullscreen().catch(err => {
                console.warn('[ImagineGodMode] Fullscreen request failed:', err);
              });
            }
          }
        }
      }

      // Space key: Play/pause video (only when not typing) - works globally
      if (e.key === ' ' && !modifierKey && !isTyping) {
        e.preventDefault();

        // Try to find play/pause button in extension UI first
        let playPauseBtn = document.querySelector('[title*="play" i], [title*="pause" i]') as HTMLButtonElement;

        if (playPauseBtn) {
          playPauseBtn.click();
        } else {
          // Fallback: directly control any visible video element
          const video = document.querySelector('video') as HTMLVideoElement;
          if (video) {
            if (video.paused) {
              video.play().catch(err => {
                console.warn('[ImagineGodMode] Video play failed:', err);
              });
            } else {
              video.pause();
            }
          }
        }
      }

      // Ctrl/Cmd + Enter: Click "Make a Video" button
      if (modifierKey && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        setTimeout(() => {
          const makeVideoBtn = Array.from(document.querySelectorAll('button')).find(
            (btn) => btn.textContent?.includes('Make a Video')
          );

          if (makeVideoBtn) {
            makeVideoBtn.click();
          }
        }, 100);
      }

      // Ctrl/Cmd + Shift + Enter: Copy prompt and click "Make video"
      if (modifierKey && e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();

        const currentPrompt = getCurrentPrompt();
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;

        if (textarea && currentPrompt) {
          textarea.value = currentPrompt.text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));

          // Trigger React's synthetic event
          const inputEvent = new Event('input', { bubbles: true });
          Object.defineProperty(inputEvent, 'target', { value: textarea, enumerable: true });
          textarea.dispatchEvent(inputEvent);

          setTimeout(() => {
            // Try multiple selectors to find the Make video button
            let makeVideoBtn = document.querySelector('button[aria-label="Make video"]') as HTMLButtonElement;

            if (!makeVideoBtn) {
              makeVideoBtn = document.querySelector('button[aria-label*="Make" i]') as HTMLButtonElement;
            }

            if (!makeVideoBtn) {
              makeVideoBtn = Array.from(document.querySelectorAll('button')).find(
                (btn) => btn.textContent?.trim() === 'Make a Video'
              ) as HTMLButtonElement;
            }

            if (!makeVideoBtn) {
              makeVideoBtn = Array.from(document.querySelectorAll('button')).find(
                (btn) => btn.textContent?.includes('Make') && btn.textContent?.includes('Video')
              ) as HTMLButtonElement;
            }

            if (makeVideoBtn) {
              console.log('[ImagineGodMode] Found Make video button, clicking:', makeVideoBtn);
              makeVideoBtn.click();
            } else {
              console.warn('[ImagineGodMode] Make video button not found');
            }
          }, 200);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [getCurrentPrompt]);
};
