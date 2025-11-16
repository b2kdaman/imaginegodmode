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

      // Ctrl/Cmd + Enter: Click "Make a Video" button
      if (modifierKey && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        const makeVideoBtn = Array.from(document.querySelectorAll('button')).find(
          (btn) => btn.textContent?.includes('Make a Video')
        );

        if (makeVideoBtn) {
          makeVideoBtn.click();
        }
      }

      // Ctrl/Cmd + Shift + Enter: Copy prompt and click "Make a Video"
      if (modifierKey && e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();

        const currentPrompt = getCurrentPrompt();
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;

        if (textarea && currentPrompt) {
          textarea.value = currentPrompt.text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));

          setTimeout(() => {
            const makeVideoBtn = Array.from(document.querySelectorAll('button')).find(
              (btn) => btn.textContent?.includes('Make a Video')
            );

            if (makeVideoBtn) {
              makeVideoBtn.click();
            }
          }, 100);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [getCurrentPrompt]);
};
