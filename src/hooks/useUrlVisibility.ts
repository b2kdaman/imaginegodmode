/**
 * Hook to check if the current URL matches a specific pattern
 * Used to show/hide components based on URL path
 */

import { useState, useEffect } from 'react';

export const useUrlVisibility = (pathPattern: string): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkUrl = () => {
      const shouldShow = window.location.pathname.includes(pathPattern);
      setIsVisible(shouldShow);
    };

    // Check on mount
    checkUrl();

    // Listen for URL changes (for SPA navigation)
    const observer = new MutationObserver(checkUrl);
    observer.observe(document.querySelector('title') || document.body, {
      childList: true,
      subtree: true,
    });

    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', checkUrl);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', checkUrl);
    };
  }, [pathPattern]);

  return isVisible;
};
