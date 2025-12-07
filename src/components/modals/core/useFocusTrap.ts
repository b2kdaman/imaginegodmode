/**
 * Hook for focus trapping within modals
 */

import { useEffect, useRef } from 'react';
import { getFocusableElements } from '../types/modalHelpers';

interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is enabled
   */
  enabled?: boolean;

  /**
   * Element to restore focus to when the modal closes
   */
  returnFocus?: boolean;

  /**
   * Callback when focus trap is activated
   */
  onActivate?: () => void;

  /**
   * Callback when focus trap is deactivated
   */
  onDeactivate?: () => void;
}

/**
 * Hook that traps focus within a container element
 *
 * Features:
 * - Auto-focus first interactive element on mount
 * - Tab cycling within the container
 * - Shift+Tab reverse cycling
 * - Return focus to trigger element on unmount
 *
 * @param containerRef - Ref to the container element
 * @param options - Focus trap options
 */
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseFocusTrapOptions = {}
) => {
  const {
    enabled = true,
    returnFocus = true,
    onActivate,
    onDeactivate,
  } = options;

  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Store the currently focused element to restore later
    if (returnFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }

    // Focus the first focusable element in the modal
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Call activation callback
    onActivate?.();

    // Cleanup: restore focus when unmounting
    return () => {
      if (returnFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
      onDeactivate?.();
    };
  }, [enabled, returnFocus, containerRef, onActivate, onDeactivate]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: cycle backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: cycle forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [enabled, containerRef]);
};
