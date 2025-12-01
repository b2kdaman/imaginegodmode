/**
 * Shared prompt action utilities
 * Used by both PromptView and keyboard shortcuts
 */

import { SELECTORS } from './constants';

/**
 * Navigate to a post by updating the URL using history.pushState
 * This allows the host React app to handle the navigation without page reload
 */
export const navigateToPost = (postId: string): boolean => {
  const targetUrl = `/imagine/post/${postId}`;

  console.log('[ImagineGodMode] Navigating to post via history.pushState:', postId);

  // Update the URL using history.pushState
  window.history.pushState({}, '', targetUrl);

  // Dispatch a popstate event to notify the React app of the URL change
  window.dispatchEvent(new PopStateEvent('popstate'));

  return true; // Navigation succeeded
};

/**
 * Set textarea value using native setter to bypass React's control
 */
export const setTextareaValue = (textarea: HTMLTextAreaElement, value: string): void => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set;
  nativeInputValueSetter?.call(textarea, value);

  // Dispatch both input and change events for compatibility
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
};

/**
 * Click the Make video button with proper event sequence for React
 */
export const clickMakeVideoButton = (): void => {
  const makeVideoBtn = document.querySelector(SELECTORS.MAKE_VIDEO_BUTTON) as HTMLElement;

  if (makeVideoBtn) {
    console.log('[ImagineGodMode] Found Make video button:', makeVideoBtn);

    // Dispatch a proper pointer/mouse event sequence to trigger React handlers
    const events = [
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }),
      new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true }),
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, composed: true }),
      new MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true }),
      new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }),
    ];

    events.forEach((event) => makeVideoBtn.dispatchEvent(event));
  } else {
    console.warn('[ImagineGodMode] Make video button not found');
  }
};

/**
 * Apply prompt text with optional prefix to the page textarea and click Make
 */
export const applyPromptAndMake = (
  promptText: string,
  prefix: string = '',
  delay: number = 100
): void => {
  const textarea = document.querySelector(SELECTORS.TEXTAREA) as HTMLTextAreaElement;

  if (textarea && promptText) {
    // Apply prefix if it exists
    const finalText = prefix.trim()
      ? `${prefix.trim()}, ${promptText}`.trim()
      : promptText;

    setTextareaValue(textarea, finalText);

    // Click the Make button after a short delay
    setTimeout(() => {
      clickMakeVideoButton();
    }, delay);
  }
};

/**
 * Apply prompt text, click Make, and navigate to next post
 * Uses soft navigation (clicking link) when possible, falls back to hard navigation
 */
export const applyPromptMakeAndNext = (
  promptText: string,
  prefix: string = '',
  nextPostId: string | null,
  delay: number = 100
): void => {
  // First, apply prompt and make
  applyPromptAndMake(promptText, prefix, delay);

  // Then navigate to next post after Make button is clicked
  if (nextPostId) {
    setTimeout(() => {
      navigateToPost(nextPostId);
    }, delay + 1000); // Wait for Make to execute first (1 second buffer)
  }
};
