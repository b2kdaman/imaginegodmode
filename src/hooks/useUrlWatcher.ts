/**
 * URL watcher hook - monitors URL changes and resets state
 */

import { useEffect, useRef } from 'react';
import { useMediaStore } from '@/store/useMediaStore';
import { TIMING } from '@/utils/constants';

export const useUrlWatcher = (onUrlChange?: () => void) => {
  const lastUrl = useRef(window.location.href);
  const { reset } = useMediaStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const currentUrl = window.location.href;

      if (currentUrl !== lastUrl.current) {
        console.log('[GrokGoonify] URL changed, resetting state and refetching data');
        reset();
        lastUrl.current = currentUrl;

        // Trigger refetch callback if provided
        if (onUrlChange) {
          onUrlChange();
        }
      }
    }, TIMING.URL_WATCHER_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [reset, onUrlChange]);
};
