/**
 * URL watcher hook - monitors URL changes and resets state
 */

import { useEffect, useRef } from 'react';
import { useMediaStore } from '@/store/useMediaStore';
import { TIMING } from '@/utils/constants';
import { getPostContextKey } from '@/utils/helpers';

export const useUrlWatcher = (onUrlChange?: () => void) => {
  const lastContext = useRef(getPostContextKey());
  const { reset } = useMediaStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const currentContext = getPostContextKey();

      if (currentContext !== lastContext.current) {
        console.log('[ImagineGodMode] Post context changed, resetting state and refetching data');
        reset();
        lastContext.current = currentContext;

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
