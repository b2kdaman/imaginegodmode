/**
 * Hook to check if the current URL matches a specific pattern
 * Used to show/hide components based on URL path
 */

import { useState, useEffect, useRef } from 'react';

export const useUrlVisibility = (pathPattern: string): boolean => {
  const [isVisible, setIsVisible] = useState(() => {
    // Initialize with immediate check
    const initialCheck = window.location.pathname.includes(pathPattern);
    console.log('[ImagineGodMode] Initial URL check:', {
      pathname: window.location.pathname,
      pattern: pathPattern,
      visible: initialCheck,
    });
    return initialCheck;
  });

  const lastPathRef = useRef(window.location.pathname);

  useEffect(() => {
    const checkUrl = () => {
      const currentPath = window.location.pathname;
      const shouldShow = currentPath.includes(pathPattern);

      // Only update if path or visibility changed
      if (currentPath !== lastPathRef.current) {
        console.log('[ImagineGodMode] URL changed:', {
          from: lastPathRef.current,
          to: currentPath,
          pattern: pathPattern,
          visible: shouldShow,
        });
        lastPathRef.current = currentPath;
      }

      setIsVisible(shouldShow);
    };

    // Check immediately on mount
    checkUrl();

    // Method 1: Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', checkUrl);

    // Method 2: Listen for pushState/replaceState (SPA navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      checkUrl();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      checkUrl();
    };

    // Method 3: MutationObserver as backup (watches for DOM changes)
    let observer: MutationObserver | null = null;
    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer = new MutationObserver(checkUrl);
      observer.observe(titleElement, {
        childList: true,
        subtree: true,
      });
    }

    // Method 4: Polling as final fallback (checks every 1 second)
    // This ensures we catch URL changes even if other methods fail
    const pollingInterval = setInterval(checkUrl, 1000);

    console.log('[ImagineGodMode] URL visibility monitoring started for pattern:', pathPattern);

    return () => {
      window.removeEventListener('popstate', checkUrl);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      if (observer) {
        observer.disconnect();
      }
      clearInterval(pollingInterval);
      console.log('[ImagineGodMode] URL visibility monitoring stopped');
    };
  }, [pathPattern]);

  return isVisible;
};
