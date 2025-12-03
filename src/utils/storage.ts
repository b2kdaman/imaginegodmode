/**
 * Chrome and Firefox storage wrapper utilities
 */

import { Packs, PromptItem } from '@/types';
import { browserAPI } from './browserAPI';

const STORAGE_KEY = 'grok-text-items';
const PREFIX_STORAGE_KEY = 'grok-prompt-prefixes';
const POST_STATE_STORAGE_KEY = 'grok-post-states';
const UNLIKED_POSTS_STORAGE_KEY = 'grok-unliked-posts';

export interface StorageData {
  packs: Packs;
  currentPack: string;
  currentIndex: number;
}

export interface PrefixStorageData {
  [postId: string]: string;
}

export interface PostState {
  currentPack: string;
  currentIndex: number;
}

export interface PostStateStorageData {
  [postId: string]: PostState;
}

export interface UnlikedPost {
  id: string;
  prompt: string;
  thumbnailImageUrl?: string;
  mediaUrl: string;
  unlikedAt: number; // timestamp
  childPostCount?: number; // number of child posts (videos)
}

export interface UnlikedPostsStorageData {
  posts: UnlikedPost[];
}

export interface PerUserUnlikedPostsStorageData {
  [userId: string]: UnlikedPost[];
}

/**
 * Check if the extension context is still valid
 */
const isExtensionContextValid = (): boolean => {
  try {
    // Try to access browserAPI.runtime.id - if it throws, context is invalidated
    return !!chrome?.runtime?.id;
  } catch {
    return false;
  }
};

/**
 * Get data from browserAPI.storage.local
 */
export const getStorage = async (): Promise<StorageData | null> => {
  if (!isExtensionContextValid()) {
    console.warn('[ImagineGodMode] Extension context invalidated - storage unavailable');
    return null;
  }

  try {
    const result = await browserAPI.storage.local.get(STORAGE_KEY);
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
 * Set data to browserAPI.storage.local
 */
export const setStorage = async (data: StorageData): Promise<boolean> => {
  if (!isExtensionContextValid()) {
    // Silently fail when context is invalidated - this is expected after extension reload
    return false;
  }

  try {
    await browserAPI.storage.local.set({ [STORAGE_KEY]: data });
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
    browserAPI.storage.onChanged.addListener(listener);
  } catch (error) {
    console.warn('[ImagineGodMode] Failed to add storage listener:', error);
    return () => {}; // Return no-op cleanup function
  }

  // Return cleanup function
  return () => {
    try {
      if (isExtensionContextValid()) {
        browserAPI.storage.onChanged.removeListener(listener);
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

/**
 * Get prefix for a specific post ID
 */
export const getPrefix = async (postId: string): Promise<string> => {
  if (!isExtensionContextValid()) {
    console.warn('[ImagineGodMode] Extension context invalidated - prefix storage unavailable');
    return '';
  }

  try {
    const result = await browserAPI.storage.local.get(PREFIX_STORAGE_KEY);
    const prefixes: PrefixStorageData = result[PREFIX_STORAGE_KEY] || {};
    return prefixes[postId] || '';
  } catch (error) {
    console.error('Failed to get prefix:', error);
    return '';
  }
};

/**
 * Set prefix for a specific post ID
 */
export const setPrefix = async (postId: string, prefix: string): Promise<boolean> => {
  if (!isExtensionContextValid()) {
    return false;
  }

  try {
    const result = await browserAPI.storage.local.get(PREFIX_STORAGE_KEY);
    const prefixes: PrefixStorageData = result[PREFIX_STORAGE_KEY] || {};
    prefixes[postId] = prefix;
    await browserAPI.storage.local.set({ [PREFIX_STORAGE_KEY]: prefixes });
    return true;
  } catch (error) {
    console.error('Failed to set prefix:', error);
    return false;
  }
};

/**
 * Get post state (current pack and index) for a specific post ID
 */
export const getPostState = async (postId: string): Promise<PostState | null> => {
  if (!isExtensionContextValid()) {
    console.warn('[ImagineGodMode] Extension context invalidated - post state storage unavailable');
    return null;
  }

  try {
    const result = await browserAPI.storage.local.get(POST_STATE_STORAGE_KEY);
    const states: PostStateStorageData = result[POST_STATE_STORAGE_KEY] || {};
    return states[postId] || null;
  } catch (error) {
    console.error('Failed to get post state:', error);
    return null;
  }
};

/**
 * Set post state (current pack and index) for a specific post ID
 */
export const setPostState = async (postId: string, state: PostState): Promise<boolean> => {
  if (!isExtensionContextValid()) {
    return false;
  }

  try {
    const result = await browserAPI.storage.local.get(POST_STATE_STORAGE_KEY);
    const states: PostStateStorageData = result[POST_STATE_STORAGE_KEY] || {};
    states[postId] = state;
    await browserAPI.storage.local.set({ [POST_STATE_STORAGE_KEY]: states });
    return true;
  } catch (error) {
    console.error('Failed to set post state:', error);
    return false;
  }
};

/**
 * Migrate old storage format to per-user format
 * @param userId - Current user ID to assign old data to
 * @returns true if migration was performed, false otherwise
 */
const migrateUnlikedPostsStorage = async (userId: string): Promise<boolean> => {
  if (!isExtensionContextValid()) {
    return false;
  }

  try {
    const result = await browserAPI.storage.local.get(UNLIKED_POSTS_STORAGE_KEY);
    const data = result[UNLIKED_POSTS_STORAGE_KEY];

    // Check if old format exists (has 'posts' array at root level)
    if (data && Array.isArray(data.posts)) {
      console.log('[Storage] Migrating old unliked posts format to per-user format for userId:', userId);

      // Convert to new format: assign old posts to current user
      const newData: PerUserUnlikedPostsStorageData = {
        [userId]: data.posts
      };

      await browserAPI.storage.local.set({
        [UNLIKED_POSTS_STORAGE_KEY]: newData
      });

      console.log('[Storage] Migration completed. Migrated', data.posts.length, 'posts to userId:', userId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Storage] Failed to migrate unliked posts:', error);
    return false;
  }
};

/**
 * Get all unliked posts from storage for a specific user
 * @param userId - User ID to get posts for (optional - if not provided, returns empty array)
 */
export const getUnlikedPosts = async (userId?: string): Promise<UnlikedPost[]> => {
  if (!isExtensionContextValid()) {
    console.warn('[ImagineGodMode] Extension context invalidated - unliked posts storage unavailable');
    return [];
  }

  if (!userId) {
    console.warn('[Storage] No userId provided to getUnlikedPosts');
    return [];
  }

  try {
    const result = await browserAPI.storage.local.get(UNLIKED_POSTS_STORAGE_KEY);
    const data = result[UNLIKED_POSTS_STORAGE_KEY];

    // Check if old format exists and migrate
    if (data && Array.isArray(data.posts)) {
      await migrateUnlikedPostsStorage(userId);
      // Re-fetch after migration
      const migratedResult = await browserAPI.storage.local.get(UNLIKED_POSTS_STORAGE_KEY);
      const migratedData: PerUserUnlikedPostsStorageData = migratedResult[UNLIKED_POSTS_STORAGE_KEY] || {};
      return migratedData[userId] || [];
    }

    // New format: per-user storage
    const perUserData: PerUserUnlikedPostsStorageData = data || {};
    return perUserData[userId] || [];
  } catch (error) {
    console.error('Failed to get unliked posts:', error);
    return [];
  }
};

/**
 * Add unliked posts to storage for a specific user
 * @param posts - Posts to add
 * @param userId - User ID to add posts for (required)
 */
export const addUnlikedPosts = async (posts: UnlikedPost[], userId?: string): Promise<boolean> => {
  if (!isExtensionContextValid()) {
    return false;
  }

  if (!userId) {
    console.warn('[Storage] No userId provided to addUnlikedPosts');
    return false;
  }

  try {
    const existingPosts = await getUnlikedPosts(userId);
    const existingIds = new Set(existingPosts.map(p => p.id));

    // Only add posts that don't already exist
    const newPosts = posts.filter(p => !existingIds.has(p.id));

    if (newPosts.length === 0) {
      return true; // Nothing to add
    }

    const updatedPosts = [...existingPosts, ...newPosts];

    // Get existing data for all users
    const result = await browserAPI.storage.local.get(UNLIKED_POSTS_STORAGE_KEY);
    const allUserData: PerUserUnlikedPostsStorageData = result[UNLIKED_POSTS_STORAGE_KEY] || {};

    // Update only this user's posts
    allUserData[userId] = updatedPosts;

    await browserAPI.storage.local.set({
      [UNLIKED_POSTS_STORAGE_KEY]: allUserData
    });
    return true;
  } catch (error) {
    console.error('Failed to add unliked posts:', error);
    return false;
  }
};

/**
 * Remove unliked posts from storage by IDs for a specific user
 * @param postIds - Post IDs to remove
 * @param userId - User ID to remove posts for (required)
 */
export const removeUnlikedPosts = async (postIds: string[], userId?: string): Promise<boolean> => {
  if (!isExtensionContextValid()) {
    return false;
  }

  if (!userId) {
    console.warn('[Storage] No userId provided to removeUnlikedPosts');
    return false;
  }

  try {
    const existingPosts = await getUnlikedPosts(userId);
    const idsToRemove = new Set(postIds);
    const updatedPosts = existingPosts.filter(p => !idsToRemove.has(p.id));

    // Get existing data for all users
    const result = await browserAPI.storage.local.get(UNLIKED_POSTS_STORAGE_KEY);
    const allUserData: PerUserUnlikedPostsStorageData = result[UNLIKED_POSTS_STORAGE_KEY] || {};

    // Update only this user's posts
    allUserData[userId] = updatedPosts;

    await browserAPI.storage.local.set({
      [UNLIKED_POSTS_STORAGE_KEY]: allUserData
    });
    return true;
  } catch (error) {
    console.error('Failed to remove unliked posts:', error);
    return false;
  }
};

/**
 * Clear all unliked posts from storage for a specific user
 * @param userId - User ID to clear posts for (required)
 */
export const clearUnlikedPosts = async (userId?: string): Promise<boolean> => {
  if (!isExtensionContextValid()) {
    return false;
  }

  if (!userId) {
    console.warn('[Storage] No userId provided to clearUnlikedPosts');
    return false;
  }

  try {
    // Get existing data for all users
    const result = await browserAPI.storage.local.get(UNLIKED_POSTS_STORAGE_KEY);
    const allUserData: PerUserUnlikedPostsStorageData = result[UNLIKED_POSTS_STORAGE_KEY] || {};

    // Clear only this user's posts
    allUserData[userId] = [];

    await browserAPI.storage.local.set({
      [UNLIKED_POSTS_STORAGE_KEY]: allUserData
    });
    return true;
  } catch (error) {
    console.error('Failed to clear unliked posts:', error);
    return false;
  }
};
