/**
 * Shared prompt action utilities
 * Used by both PromptView and keyboard shortcuts
 */

import { SELECTORS } from './constants';

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
