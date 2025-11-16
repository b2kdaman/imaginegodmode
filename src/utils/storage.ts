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
 * Get data from chrome.storage.local
 */
export const getStorage = async (): Promise<StorageData | null> => {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  } catch (error) {
    console.error('Failed to get storage:', error);
    return null;
  }
};

/**
 * Set data to chrome.storage.local
 */
export const setStorage = async (data: StorageData): Promise<boolean> => {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
    return true;
  } catch (error) {
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
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue || null);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};
