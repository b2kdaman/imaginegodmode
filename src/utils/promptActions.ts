/**
 * Shared prompt action utilities
 * Used by both PromptView and keyboard shortcuts
 */

import { SELECTORS } from './constants';
import { useSettingsStore } from '@/store/useSettingsStore';

const findPostLink = (targetPath: string): HTMLAnchorElement | null => {
  const links = document.querySelectorAll('a[href]');

  for (const link of links) {
    const href = link.getAttribute('href');

    if (!href) {
      continue;
    }

    try {
      const url = new URL(href, window.location.origin);

      if (url.pathname === targetPath) {
        return link as HTMLAnchorElement;
      }
    } catch {
      continue;
    }
  }

  return null;
};

/**
 * Navigate to a post using the same mechanisms the host app expects.
 * Prefer clicking a real link so the SPA router can intercept it. Fall back
 * to standard browser navigation if no matching link is present.
 */
export const navigateToPost = (postId: string): boolean => {
  const targetPath = `/imagine/post/${postId}`;
  const targetUrl = new URL(targetPath, window.location.origin);
  const matchingLink = findPostLink(targetPath);

  if (matchingLink) {
    console.log('[ImagineGodMode] Navigating to post via link click:', postId);
    matchingLink.click();
    return true;
  }

  console.log('[ImagineGodMode] Navigating to post via location.assign:', postId);
  window.location.assign(targetUrl.toString());
  return true;
};

/**
 * Set textarea value using native setter to bypass React's control
 */
export const setTextareaValue = (element: HTMLElement, value: string): void => {
  if (element.tagName === 'TEXTAREA') {
    const textarea = element as HTMLTextAreaElement;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, value);

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    element.focus();
    document.execCommand('selectAll', false);
    document.execCommand('insertText', false, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
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
 * Apply prompt text with global prefix/suffix to the page textarea and click Make
 */
export const applyPromptAndMake = (
  promptText: string,
  prefix: string = '',
  delay: number = 100
): void => {
  const element = document.querySelector(SELECTORS.TEXTAREA) as HTMLElement | null;

  if (element && promptText) {
    const settings = useSettingsStore.getState();
    const parts: string[] = [];

    // Apply global prefix if enabled
    if (settings.globalPromptPrefixEnabled && settings.globalPromptPrefix.trim()) {
      parts.push(settings.globalPromptPrefix.trim());
    }

    // Apply per-post prefix if provided
    if (prefix.trim()) {
      parts.push(prefix.trim());
    }

    parts.push(promptText);

    // Apply global suffix if enabled
    if (settings.globalPromptSuffixEnabled && settings.globalPromptSuffix.trim()) {
      parts.push(settings.globalPromptSuffix.trim());
    }

    const finalText = parts.join(', ');
    setTextareaValue(element, finalText);

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
