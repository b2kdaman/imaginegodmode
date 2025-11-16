/**
 * Global arrow key navigation hook
 * Simulates clicks on Previous/Next video buttons
 */

import { useEffect } from 'react';

export const useArrowKeyNavigation = () => {
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

      // Left arrow - Previous video
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevButton = document.querySelector(
          'button[aria-label="Previous video"]'
        ) as HTMLButtonElement;

        if (prevButton && !prevButton.disabled) {
          prevButton.click();
          console.log('[GrokGoonify] Previous video clicked via arrow key');
        }
      }

      // Right arrow - Next video
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextButton = document.querySelector(
          'button[aria-label="Next video"]'
        ) as HTMLButtonElement;

        if (nextButton && !nextButton.disabled) {
          nextButton.click();
          console.log('[GrokGoonify] Next video clicked via arrow key');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
