/**
 * Global arrow key navigation hook
 * Simulates clicks on Previous/Next video buttons or navigates between posts
 */

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePostsStore } from '@/store/usePostsStore';
import { navigateToPost } from '@/utils/promptActions';

export const useArrowKeyNavigation = () => {
  const { navigatePostsWithArrows } = useSettingsStore();
  const { getPrevPostId, getNextPostId } = usePostsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Left arrow
      if (e.key === 'ArrowLeft') {
        e.preventDefault();

        if (navigatePostsWithArrows) {
          // Navigate to previous post
          const prevPostId = getPrevPostId();
          if (prevPostId) {
            navigateToPost(prevPostId);
            console.log('[ImagineGodMode] Previous post navigated via arrow key');
          }
        } else {
          // Navigate to previous video (default behavior)
          const prevButton = document.querySelector(
            'button[aria-label="Previous video"]'
          ) as HTMLButtonElement;

          if (prevButton && !prevButton.disabled) {
            prevButton.click();
            console.log('[ImagineGodMode] Previous video clicked via arrow key');
          }
        }
      }

      // Right arrow
      if (e.key === 'ArrowRight') {
        e.preventDefault();

        if (navigatePostsWithArrows) {
          // Navigate to next post
          const nextPostId = getNextPostId();
          if (nextPostId) {
            navigateToPost(nextPostId);
            console.log('[ImagineGodMode] Next post navigated via arrow key');
          }
        } else {
          // Navigate to next video (default behavior)
          const nextButton = document.querySelector(
            'button[aria-label="Next video"]'
          ) as HTMLButtonElement;

          if (nextButton && !nextButton.disabled) {
            nextButton.click();
            console.log('[ImagineGodMode] Next video clicked via arrow key');
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigatePostsWithArrows, getPrevPostId, getNextPostId]);
};
