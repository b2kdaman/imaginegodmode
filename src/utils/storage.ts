/**
 * Chrome storage wrapper utilities
 */

import { Categories } from '@/types';

const STORAGE_KEY = 'grok-text-items';

export interface StorageData {
  categories: Categories;
  currentCategory: string;
  currentIndex: number;
}

/**
 * Check if the extension context is still valid
 */
const isExtensionContextValid = (): boolean => {
  try {
    // Try to access chrome.runtime.id - if it throws, context is invalidated
    return !!chrome?.runtime?.id;
  } catch {
    return false;
  }
};

/**
 * Get data from chrome.storage.local
 */
export const getStorage = async (): Promise<StorageData | null> => {
  if (!isExtensionContextValid()) {
    console.warn('[GrokGoonify] Extension context invalidated - storage unavailable');
    return null;
  }

  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Extension context invalidated')) {
      console.warn('[GrokGoonify] Extension context invalidated during storage read');
    } else {
      console.error('Failed to get storage:', error);
    }
    return null;
  }
};

/**
 * Set data to chrome.storage.local
 */
export const setStorage = async (data: StorageData): Promise<boolean> => {
  if (!isExtensionContextValid()) {
    // Silently fail when context is invalidated - this is expected after extension reload
    return false;
  }

  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Extension context invalidated')) {
      // Don't log error for expected context invalidation
      return false;
    }
    console.error('Failed to set storage:', error);
    return false;
  }
};

/**
 * Listen to storage changes
 */
export const onStorageChange = (
  callback: (newData: StorageData | null) => void
): (() => void) => {
  if (!isExtensionContextValid()) {
    console.warn('[GrokGoonify] Extension context invalidated - cannot listen to storage changes');
    return () => {}; // Return no-op cleanup function
  }

  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue || null);
    }
  };

  try {
    chrome.storage.onChanged.addListener(listener);
  } catch (error) {
    console.warn('[GrokGoonify] Failed to add storage listener:', error);
    return () => {}; // Return no-op cleanup function
  }

  // Return cleanup function
  return () => {
    try {
      if (isExtensionContextValid()) {
        chrome.storage.onChanged.removeListener(listener);
      }
    } catch {
      // Silently fail if context is invalidated during cleanup
    }
  };
};
