/**
 * Hook for modal enter/exit animations
 */

import { useState, useEffect } from 'react';

interface UseModalAnimationOptions {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Animation duration in milliseconds
   */
  duration?: number;

  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void;
}

interface ModalAnimationState {
  /**
   * Whether the modal should be rendered in the DOM
   */
  shouldRender: boolean;

  /**
   * Whether the modal is in the entering state
   */
  isEntering: boolean;

  /**
   * Whether the modal is in the exiting state
   */
  isExiting: boolean;
}

/**
 * Hook that manages modal animations
 *
 * Handles:
 * - Delayed unmounting (wait for exit animation)
 * - Enter/exit animation states
 * - Animation timing
 *
 * @param options - Animation options
 * @returns Animation state
 */
export const useModalAnimation = (
  options: UseModalAnimationOptions
): ModalAnimationState => {
  const { isOpen, duration = 300, onAnimationComplete } = options;

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Opening: render immediately and trigger enter animation
      setShouldRender(true);

      // Slight delay before starting animation (allows browser to render)
      requestAnimationFrame(() => {
        setIsEntering(true);
      });

      // End enter animation
      const enterTimer = setTimeout(() => {
        setIsEntering(false);
        onAnimationComplete?.();
      }, duration);

      return () => clearTimeout(enterTimer);
    } else if (shouldRender) {
      // Closing: trigger exit animation, then unmount
      setIsEntering(false);
      setIsExiting(true);

      // Wait for exit animation, then unmount
      const exitTimer = setTimeout(() => {
        setIsExiting(false);
        setShouldRender(false);
        onAnimationComplete?.();
      }, duration);

      return () => clearTimeout(exitTimer);
    }
  }, [isOpen, shouldRender, duration, onAnimationComplete]);

  return {
    shouldRender,
    isEntering,
    isExiting,
  };
};
