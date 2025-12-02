/**
 * Cross-browser API polyfill
 * Provides a unified interface for both Chrome and Firefox extension APIs
 * Both browsers support MV3, so we just need to handle the namespace difference
 */

// Firefox uses 'browser' namespace, Chrome uses 'chrome'
// Both return promises in MV3, so the API is very similar
export const browserAPI = (typeof browser !== 'undefined' ? browser : chrome) as typeof chrome;

// Type augmentation for Firefox's 'browser' global
declare global {
  const browser: typeof chrome | undefined;
}

export default browserAPI;
