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

/**
 * Export data structure for import/export
 */
export interface ExportData {
  version: string;
  exportDate: string;
  categoryName: string;
  prompts: PromptItem[];
}

/**
 * Export single category to JSON file
 */
export const exportCategory = (categoryName: string, prompts: PromptItem[]): void => {
  const exportData: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    categoryName,
    prompts,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Format: grokgoonify-category-CategoryName-YYYY-MM-DD.json
  const dateStr = new Date().toISOString().split('T')[0];
  const safeCategoryName = categoryName.replace(/[^a-z0-9]/gi, '_');
  a.download = `grokgoonify-category-${safeCategoryName}-${dateStr}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Validate import data structure (per-category)
 */
const validateImportData = (data: unknown): data is ExportData => {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (typeof obj.version !== 'string') return false;
  if (typeof obj.exportDate !== 'string') return false;
  if (typeof obj.categoryName !== 'string' || obj.categoryName.trim() === '') return false;
  if (!Array.isArray(obj.prompts)) return false;

  const prompts = obj.prompts as unknown[];

  // Validate each prompt
  for (const prompt of prompts) {
    if (!prompt || typeof prompt !== 'object') return false;
    const p = prompt as Record<string, unknown>;

    if (typeof p.text !== 'string') return false;
    if (typeof p.rating !== 'number') return false;
    if (p.rating < 0 || p.rating > 5) return false;
  }

  return true;
};

/**
 * Import category from JSON file
 */
export const importCategory = (
  file: File,
  mode: 'add' | 'replace',
  currentCategories: Categories
): Promise<{
  success: boolean;
  categoryName?: string;
  prompts?: PromptItem[];
  categories?: Categories;
  error?: string
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate structure
        if (!validateImportData(data)) {
          resolve({ success: false, error: 'Invalid file format' });
          return;
        }

        let resultCategories: Categories = { ...currentCategories };

        if (mode === 'replace') {
          // Replace: overwrite category if exists, otherwise add new
          resultCategories[data.categoryName] = data.prompts;
        } else {
          // Add: only add if category doesn't exist
          if (!resultCategories[data.categoryName]) {
            resultCategories[data.categoryName] = data.prompts;
          } else {
            resolve({
              success: false,
              error: `Category "${data.categoryName}" already exists. Use Replace mode to overwrite.`
            });
            return;
          }
        }

        resolve({
          success: true,
          categoryName: data.categoryName,
          prompts: data.prompts,
          categories: resultCategories
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to parse file',
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
};
