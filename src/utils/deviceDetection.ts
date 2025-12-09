/**
 * Device detection utilities
 */

/**
 * Detects if the current device is mobile (iOS, Android, or mobile user agent)
 */
export const isMobileDevice = (): boolean => {
  // Check for iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Check for Android
  const isAndroid = /Android/.test(navigator.userAgent);

  // Check for mobile user agent patterns
  const isMobileUA = /Mobile|Tablet/.test(navigator.userAgent);

  // Check for touch support combined with small screen
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  return isIOS || isAndroid || isMobileUA || (hasTouchScreen && isSmallScreen);
};
