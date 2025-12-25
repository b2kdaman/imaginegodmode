/**
 * Chrome Storage API Polyfill for iOS WKWebView
 *
 * This polyfill mocks the chrome.storage.local API by communicating with
 * Swift via WKWebView message handlers. The Swift side stores data in UserDefaults.
 */

(function() {
  'use strict';

  // Generate unique IDs for async requests
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Store pending callbacks for async operations
  const pendingCallbacks = new Map();

  // Create the chrome namespace if it doesn't exist
  if (typeof window.chrome === 'undefined') {
    window.chrome = {};
  }

  // Mock chrome.runtime API (minimal implementation)
  if (typeof window.chrome.runtime === 'undefined') {
    window.chrome.runtime = {
      id: 'ios-app-wrapper',
      getManifest: () => ({
        version: '2.11.0',
        name: 'ImagineGodMode iOS'
      }),
      onMessage: {
        addListener: () => {
          console.warn('[ChromePolyfill] chrome.runtime.onMessage not fully implemented in iOS');
        }
      },
      sendMessage: (message, callback) => {
        console.warn('[ChromePolyfill] chrome.runtime.sendMessage not fully implemented in iOS');
        if (callback) callback({ success: false, error: 'Not implemented' });
      }
    };
  }

  // Mock chrome.storage.onChanged API
  const storageChangeListeners = [];

  window.chrome.storage = {
    onChanged: {
      addListener: function(callback) {
        if (typeof callback === 'function') {
          storageChangeListeners.push(callback);
          console.log('[ChromePolyfill] Storage change listener added. Total listeners:', storageChangeListeners.length);
        }
      },
      removeListener: function(callback) {
        const index = storageChangeListeners.indexOf(callback);
        if (index > -1) {
          storageChangeListeners.splice(index, 1);
          console.log('[ChromePolyfill] Storage change listener removed. Total listeners:', storageChangeListeners.length);
        }
      },
      hasListener: function(callback) {
        return storageChangeListeners.indexOf(callback) > -1;
      }
    },
    local: {
      /**
       * Get items from storage
       * @param {string|string[]|object|null} keys - Keys to retrieve
       * @param {function} callback - Callback function(result)
       */
      get: function(keys, callback) {
        const requestId = generateId();

        // Normalize keys to array
        let normalizedKeys = null;
        if (keys === null || keys === undefined) {
          normalizedKeys = null; // Get all
        } else if (typeof keys === 'string') {
          normalizedKeys = [keys];
        } else if (Array.isArray(keys)) {
          normalizedKeys = keys;
        } else if (typeof keys === 'object') {
          // Default values object - extract keys
          normalizedKeys = Object.keys(keys);
        }

        console.log('[ChromePolyfill] storage.get called with keys:', normalizedKeys);

        // Store callback
        if (callback) {
          pendingCallbacks.set(requestId, {
            type: 'get',
            callback,
            defaultValues: (typeof keys === 'object' && !Array.isArray(keys)) ? keys : null
          });
        }

        // Send message to Swift
        try {
          if (!window.webkit || !window.webkit.messageHandlers || !window.webkit.messageHandlers.chromeStorage) {
            console.error('[ChromePolyfill] webkit.messageHandlers.chromeStorage not available!');
            if (callback) {
              pendingCallbacks.delete(requestId);
              callback({});
            }
            return;
          }

          window.webkit.messageHandlers.chromeStorage.postMessage({
            type: 'storage.get',
            id: requestId,
            keys: normalizedKeys
          });
          console.log('[ChromePolyfill] storage.get message sent to Swift');
        } catch (error) {
          console.error('[ChromePolyfill] Failed to send storage.get message:', error);
          if (callback) {
            pendingCallbacks.delete(requestId);
            callback({});
          }
        }
      },

      /**
       * Set items in storage
       * @param {object} items - Object with key-value pairs
       * @param {function} callback - Callback function()
       */
      set: function(items, callback) {
        const requestId = generateId();

        console.log('[ChromePolyfill] storage.set called with items:', Object.keys(items || {}));

        // Store callback and items for change notification
        if (callback) {
          pendingCallbacks.set(requestId, {
            type: 'set',
            callback,
            items: items
          });
        } else {
          // Store items even without callback for change notification
          pendingCallbacks.set(requestId, {
            type: 'set',
            items: items
          });
        }

        // Send message to Swift
        try {
          if (!window.webkit || !window.webkit.messageHandlers || !window.webkit.messageHandlers.chromeStorage) {
            console.error('[ChromePolyfill] webkit.messageHandlers.chromeStorage not available!');
            if (callback) {
              pendingCallbacks.delete(requestId);
              callback();
            }
            return;
          }

          window.webkit.messageHandlers.chromeStorage.postMessage({
            type: 'storage.set',
            id: requestId,
            data: items
          });
          console.log('[ChromePolyfill] storage.set message sent to Swift');
        } catch (error) {
          console.error('[ChromePolyfill] Failed to send storage.set message:', error);
          if (callback) {
            pendingCallbacks.delete(requestId);
            callback();
          }
        }
      },

      /**
       * Remove items from storage
       * @param {string|string[]} keys - Keys to remove
       * @param {function} callback - Callback function()
       */
      remove: function(keys, callback) {
        const requestId = generateId();

        // Normalize keys to array
        const normalizedKeys = Array.isArray(keys) ? keys : [keys];

        // Store callback
        if (callback) {
          pendingCallbacks.set(requestId, {
            type: 'remove',
            callback
          });
        }

        // Send message to Swift
        try {
          window.webkit.messageHandlers.chromeStorage.postMessage({
            type: 'storage.remove',
            id: requestId,
            keys: normalizedKeys
          });
        } catch (error) {
          console.error('[ChromePolyfill] Failed to send storage.remove message:', error);
          if (callback) {
            pendingCallbacks.delete(requestId);
            callback();
          }
        }
      },

      /**
       * Clear all items from storage
       * @param {function} callback - Callback function()
       */
      clear: function(callback) {
        const requestId = generateId();

        // Store callback
        if (callback) {
          pendingCallbacks.set(requestId, {
            type: 'clear',
            callback
          });
        }

        // Send message to Swift
        try {
          window.webkit.messageHandlers.chromeStorage.postMessage({
            type: 'storage.clear',
            id: requestId
          });
        } catch (error) {
          console.error('[ChromePolyfill] Failed to send storage.clear message:', error);
          if (callback) {
            pendingCallbacks.delete(requestId);
            callback();
          }
        }
      },

      /**
       * Get bytes in use (not implemented, returns 0)
       * @param {string|string[]|null} keys - Keys to check
       * @param {function} callback - Callback function(bytesInUse)
       */
      getBytesInUse: function(keys, callback) {
        if (callback) {
          setTimeout(() => callback(0), 0);
        }
      }
    }
  };

  // Mock chrome.downloads API
  window.chrome.downloads = {
    /**
     * Download a file
     * @param {object} options - Download options (url, filename, saveAs)
     * @param {function} callback - Callback function(downloadId)
     */
    download: function(options, callback) {
      const requestId = generateId();

      // Store callback
      if (callback) {
        pendingCallbacks.set(requestId, {
          type: 'download',
          callback
        });
      }

      // Send message to Swift
      try {
        window.webkit.messageHandlers.chromeDownloads.postMessage({
          type: 'download.start',
          id: requestId,
          url: options.url,
          filename: options.filename || null,
          saveAs: options.saveAs || false
        });
      } catch (error) {
        console.error('[ChromePolyfill] Failed to send download message:', error);
        if (callback) {
          pendingCallbacks.delete(requestId);
          callback(-1); // Error ID
        }
      }
    }
  };

  // Handler for responses from Swift
  window.__chromeStorageResponse = function(response) {
    const { id, success, data, error } = response;

    console.log('[ChromePolyfill] Received response from Swift:', { id, success, dataKeys: data ? Object.keys(data) : [], error });

    if (!pendingCallbacks.has(id)) {
      console.warn('[ChromePolyfill] Received response for unknown request:', id);
      return;
    }

    const pendingRequest = pendingCallbacks.get(id);
    const { type, callback, defaultValues, items } = pendingRequest;
    pendingCallbacks.delete(id);

    switch (type) {
      case 'get':
        if (callback) {
          if (success) {
            // Merge with default values if provided
            const result = defaultValues ? { ...defaultValues, ...data } : data;
            callback(result);
          } else {
            console.error('[ChromePolyfill] Storage get failed:', error);
            callback(defaultValues || {});
          }
        }
        break;

      case 'set':
        if (success && items) {
          // Notify storage change listeners
          const changes = {};
          for (const key in items) {
            changes[key] = {
              newValue: items[key],
              oldValue: undefined // We don't track old values in this implementation
            };
          }

          // Trigger listeners asynchronously
          setTimeout(() => {
            storageChangeListeners.forEach(listener => {
              try {
                listener(changes, 'local');
              } catch (e) {
                console.error('[ChromePolyfill] Error in storage change listener:', e);
              }
            });
          }, 0);
        }

        if (!success) {
          console.error(`[ChromePolyfill] Storage ${type} failed:`, error);
        }

        if (callback) {
          callback();
        }
        break;

      case 'remove':
      case 'clear':
        if (!success) {
          console.error(`[ChromePolyfill] Storage ${type} failed:`, error);
        }
        if (callback) {
          callback();
        }
        break;

      default:
        console.warn('[ChromePolyfill] Unknown response type:', type);
    }
  };

  // Handler for download responses from Swift
  window.__chromeDownloadResponse = function(response) {
    const { id, success, downloadId, error } = response;

    if (!pendingCallbacks.has(id)) {
      console.warn('[ChromePolyfill] Received download response for unknown request:', id);
      return;
    }

    const { callback } = pendingCallbacks.get(id);
    pendingCallbacks.delete(id);

    if (!callback) return;

    if (success) {
      callback(downloadId);
    } else {
      console.error('[ChromePolyfill] Download failed:', error);
      callback(-1); // Error ID
    }
  };

  // Check if we have webkit message handlers available
  const hasWebKitBridge = typeof window.webkit !== 'undefined' &&
                          window.webkit.messageHandlers &&
                          window.webkit.messageHandlers.chromeStorage;

  if (!hasWebKitBridge) {
    console.warn('[ChromePolyfill] ⚠️ Swift bridge not available, falling back to localStorage');

    // Create localStorage-based fallback for iOS WKWebView
    window.chrome.storage.local = {
      get: function(keys, callback) {
        try {
          const result = {};
          const normalizedKeys = keys === null || keys === undefined ?
            Object.keys(localStorage).filter(k => k.startsWith('chrome_storage_')) :
            (Array.isArray(keys) ? keys : (typeof keys === 'string' ? [keys] : Object.keys(keys)));

          if (normalizedKeys === null) {
            // Get all keys
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('chrome_storage_')) {
                const cleanKey = key.replace('chrome_storage_', '');
                try {
                  result[cleanKey] = JSON.parse(localStorage.getItem(key));
                } catch {
                  result[cleanKey] = localStorage.getItem(key);
                }
              }
            }
          } else {
            // Get specific keys
            normalizedKeys.forEach(key => {
              const storageKey = 'chrome_storage_' + key;
              const value = localStorage.getItem(storageKey);
              if (value !== null) {
                try {
                  result[key] = JSON.parse(value);
                } catch {
                  result[key] = value;
                }
              }
            });
          }

          console.log('[ChromePolyfill] localStorage.get result:', Object.keys(result));
          if (callback) callback(result);
        } catch (error) {
          console.error('[ChromePolyfill] localStorage.get error:', error);
          if (callback) callback({});
        }
      },

      set: function(items, callback) {
        try {
          for (const key in items) {
            const storageKey = 'chrome_storage_' + key;
            localStorage.setItem(storageKey, JSON.stringify(items[key]));
          }
          console.log('[ChromePolyfill] localStorage.set saved:', Object.keys(items));

          // Trigger storage change listeners
          setTimeout(() => {
            const changes = {};
            for (const key in items) {
              changes[key] = { newValue: items[key] };
            }
            storageChangeListeners.forEach(listener => {
              try {
                listener(changes, 'local');
              } catch (e) {
                console.error('[ChromePolyfill] Error in storage change listener:', e);
              }
            });
          }, 0);

          if (callback) callback();
        } catch (error) {
          console.error('[ChromePolyfill] localStorage.set error:', error);
          if (callback) callback();
        }
      },

      remove: function(keys, callback) {
        try {
          const normalizedKeys = Array.isArray(keys) ? keys : [keys];
          normalizedKeys.forEach(key => {
            const storageKey = 'chrome_storage_' + key;
            localStorage.removeItem(storageKey);
          });
          if (callback) callback();
        } catch (error) {
          console.error('[ChromePolyfill] localStorage.remove error:', error);
          if (callback) callback();
        }
      },

      clear: function(callback) {
        try {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chrome_storage_')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          if (callback) callback();
        } catch (error) {
          console.error('[ChromePolyfill] localStorage.clear error:', error);
          if (callback) callback();
        }
      },

      getBytesInUse: function(keys, callback) {
        if (callback) setTimeout(() => callback(0), 0);
      }
    };
  }

  // Test localStorage availability
  let localStorageWorks = false;
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    localStorageWorks = testValue === 'test';
    console.log('[ChromePolyfill] localStorage test:', localStorageWorks ? '✓ Working' : '✗ Failed');
  } catch (error) {
    console.error('[ChromePolyfill] localStorage test error:', error);
  }

  // Verify the API is accessible
  if (typeof window.chrome !== 'undefined' && window.chrome.storage) {
    console.log('[ChromePolyfill] ✓ Loaded for iOS');
    console.log('[ChromePolyfill] Storage backend:', hasWebKitBridge ? 'Swift UserDefaults' : 'WKWebView localStorage');
    console.log('[ChromePolyfill] localStorage available:', localStorageWorks);

    // If neither backend is working, warn loudly
    if (!hasWebKitBridge && !localStorageWorks) {
      console.error('[ChromePolyfill] ⚠️⚠️⚠️ CRITICAL: No storage backend available! Data will not persist!');
    }

    // Test that chrome.storage.local.get works
    console.log('[ChromePolyfill] Testing chrome.storage.local.get...');
    window.chrome.storage.local.get(null, function(result) {
      console.log('[ChromePolyfill] ✓ chrome.storage.local.get test successful, keys:', Object.keys(result));
    });

    // Add a global inspector for debugging
    window.__inspectStorage = function() {
      console.log('=== Storage Inspector ===');
      console.log('Backend:', hasWebKitBridge ? 'Swift UserDefaults' : 'WKWebView localStorage');

      if (!hasWebKitBridge && localStorageWorks) {
        console.log('localStorage keys:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('chrome_storage_')) {
            console.log(' -', key, '=', localStorage.getItem(key)?.substring(0, 100) + '...');
          }
        }
      }

      window.chrome.storage.local.get(null, function(data) {
        console.log('chrome.storage.local data:', data);
        console.log('Total keys:', Object.keys(data).length);
      });
      console.log('========================');
    };

    console.log('[ChromePolyfill] 💡 Debug tip: Run window.__inspectStorage() in console to inspect storage');
  } else {
    console.error('[ChromePolyfill] ✗ Failed to create chrome.storage API');
  }
})();
