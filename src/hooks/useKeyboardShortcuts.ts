/**
 * Keyboard shortcuts hook
 */

import { useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SELECTORS } from '@/utils/constants';
import { getPostIdFromUrl } from '@/utils/helpers';
import { getPrefix } from '@/utils/storage';
import { applyPromptAndMake } from '@/utils/promptActions';

export const useKeyboardShortcuts = () => {
  const { getCurrentPrompt } = usePromptStore();
  const { simpleShortcut } = useSettingsStore();

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

      // Determine if we should apply prompt based on simpleShortcut setting
      // If simpleShortcut is enabled: Ctrl/Cmd+Enter applies prompt
      // If simpleShortcut is disabled: Ctrl/Cmd+Shift+Enter applies prompt
      const shouldApplyPrompt = simpleShortcut
        ? (modifierKey && e.key === 'Enter' && !e.shiftKey)
        : (modifierKey && e.key === 'Enter' && e.shiftKey);

      if (shouldApplyPrompt) {
        e.preventDefault();

        const currentPrompt = getCurrentPrompt();

        if (currentPrompt) {
          // Get the prefix for the current post and apply prompt
          const postId = getPostIdFromUrl();
          if (postId) {
            getPrefix(postId).then((prefix) => {
              applyPromptAndMake(currentPrompt.text, prefix, 100);
            });
          } else {
            // No post ID, apply without prefix
            applyPromptAndMake(currentPrompt.text, '', 100);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [getCurrentPrompt, simpleShortcut]);
};
