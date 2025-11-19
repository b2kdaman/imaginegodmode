/**
 * Chrome storage wrapper utilities
 */

import { Packs } from '@/types';

const STORAGE_KEY = 'grok-text-items';

export interface StorageData {
  packs: Packs;
  currentPack: string;
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
    console.warn('[ImagineGodMode] Extension context invalidated - storage unavailable');
    return null;
  }

  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Extension context invalidated')) {
      console.warn('[ImagineGodMode] Extension context invalidated during storage read');
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
    console.warn('[ImagineGodMode] Extension context invalidated - cannot listen to storage changes');
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
    console.warn('[ImagineGodMode] Failed to add storage listener:', error);
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
  packName: string;
  prompts: PromptItem[];
}

/**
 * Export single pack to JSON file
 */
export const exportPack = (packName: string, prompts: PromptItem[]): void => {
  const exportData: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    packName,
    prompts,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Format: imaginegodmode-pack-PackName-YYYY-MM-DD.json
  const dateStr = new Date().toISOString().split('T')[0];
  const safePackName = packName.replace(/[^a-z0-9]/gi, '_');
  a.download = `imaginegodmode-pack-${safePackName}-${dateStr}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Validate import data structure (per-pack)
 */
const validateImportData = (data: unknown): data is ExportData => {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (typeof obj.version !== 'string') return false;
  if (typeof obj.exportDate !== 'string') return false;
  if (typeof obj.packName !== 'string' || obj.packName.trim() === '') return false;
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
 * Import pack from JSON file
 */
export const importPack = (
  file: File,
  mode: 'add' | 'replace',
  currentPacks: Packs
): Promise<{
  success: boolean;
  packName?: string;
  prompts?: PromptItem[];
  packs?: Packs;
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

        let resultPacks: Packs = { ...currentPacks };

        if (mode === 'replace') {
          // Replace: overwrite pack if exists, otherwise add new
          resultPacks[data.packName] = data.prompts;
        } else {
          // Add: only add if pack doesn't exist
          if (!resultPacks[data.packName]) {
            resultPacks[data.packName] = data.prompts;
          } else {
            resolve({
              success: false,
              error: `Pack "${data.packName}" already exists. Use Replace mode to overwrite.`
            });
            return;
          }
        }

        resolve({
          success: true,
          packName: data.packName,
          prompts: data.prompts,
          packs: resultPacks
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
