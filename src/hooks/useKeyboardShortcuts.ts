/**
 * Keyboard shortcuts hook
 */

import { useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { SELECTORS } from '@/utils/constants';

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
        let fullscreenBtn = document.querySelector(SELECTORS.FULLSCREEN_BUTTON) as HTMLButtonElement;

        // If not found in extension, look for video fullscreen controls on page
        if (!fullscreenBtn) {
          fullscreenBtn = document.querySelector(SELECTORS.FULLSCREEN_BUTTON_ALT) as HTMLButtonElement;
        }

        if (fullscreenBtn) {
          fullscreenBtn.click();
        } else {
          // Fallback: try to fullscreen any visible video element
          const video = document.querySelector(SELECTORS.VIDEO_ELEMENT) as HTMLVideoElement;
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
        let playPauseBtn = document.querySelector(SELECTORS.PLAY_PAUSE_BUTTON) as HTMLButtonElement;

        if (playPauseBtn) {
          playPauseBtn.click();
        } else {
          // Fallback: directly control any visible video element
          const video = document.querySelector(SELECTORS.VIDEO_ELEMENT) as HTMLVideoElement;
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

      // Ctrl/Cmd + Enter: Click "Make video" button
      if (modifierKey && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        setTimeout(() => {
          // Use exact aria-label selector
          const makeVideoBtn = document.querySelector(SELECTORS.MAKE_VIDEO_BUTTON) as HTMLElement;

          if (makeVideoBtn) {
            console.log('[ImagineGodMode] Found Make video button:', makeVideoBtn);

            // Dispatch a proper pointer/mouse event sequence to trigger React handlers
            const events = [
              new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }),
              new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true }),
              new PointerEvent('pointerup', { bubbles: true, cancelable: true, composed: true }),
              new MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true }),
              new MouseEvent('click', { bubbles: true, cancelable: true, composed: true })
            ];

            events.forEach(event => makeVideoBtn.dispatchEvent(event));
          } else {
            console.warn('[ImagineGodMode] Make video button not found');
          }
        }, 100);
      }

      // Ctrl/Cmd + Shift + Enter: Copy prompt and click "Make video"
      if (modifierKey && e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();

        const currentPrompt = getCurrentPrompt();
        const textarea = document.querySelector(SELECTORS.TEXTAREA) as HTMLTextAreaElement;

        if (textarea && currentPrompt) {
          textarea.value = currentPrompt.text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));

          // Trigger React's synthetic event
          const inputEvent = new Event('input', { bubbles: true });
          Object.defineProperty(inputEvent, 'target', { value: textarea, enumerable: true });
          textarea.dispatchEvent(inputEvent);

          setTimeout(() => {
            // Use exact aria-label selector
            const makeVideoBtn = document.querySelector(SELECTORS.MAKE_VIDEO_BUTTON) as HTMLElement;

            if (makeVideoBtn) {
              console.log('[ImagineGodMode] Found Make video button, clicking:', makeVideoBtn);

              // Dispatch a proper pointer/mouse event sequence to trigger React handlers
              const events = [
                new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }),
                new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true }),
                new PointerEvent('pointerup', { bubbles: true, cancelable: true, composed: true }),
                new MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true }),
                new MouseEvent('click', { bubbles: true, cancelable: true, composed: true })
              ];

              events.forEach(event => makeVideoBtn.dispatchEvent(event));
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
