/**
 * Utility functions
 */

export const Utils = {
    /**
     * Extract post ID from current URL
     * @returns {string|null} Post ID or null if not found
     */
    getPostIdFromUrl() {
        const parts = window.location.pathname.split('/').filter(Boolean);
        // expected: ["imagine", "post", "<id>"]
        return parts[2] || null;
    },

    /**
     * Extract filename from URL
     * @param {string} url - URL to extract filename from
     * @param {number} fallbackIndex - Fallback index if filename can't be extracted
     * @returns {string} Filename
     */
    extractFilename(url, fallbackIndex = 0) {
        const clean = url.split('?')[0];
        return clean.split('/').filter(Boolean).pop() || `media_${fallbackIndex + 1}`;
    },

    /**
     * Pick the best download URL from a media object
     * @param {Object} obj - Media object
     * @returns {string|null} Best available URL or null
     */
    pickDownloadUrl(obj) {
        return obj && (obj.hdMediaUrl || obj.mediaUrl || obj.thumbnailImageUrl || null);
    },

    /**
     * Create a random delay between min and max milliseconds
     * @param {number} min - Minimum delay in ms
     * @param {number} max - Maximum delay in ms
     * @returns {number} Random delay
     */
    randomDelay(min, max) {
        return min + Math.random() * (max - min);
    },

    /**
     * Format time string
     * @returns {string} Current time as locale string
     */
    getCurrentTime() {
        return new Date().toLocaleTimeString();
    },

    /**
     * Check if GM_download is available
     * @returns {boolean} True if GM_download is available
     */
    canUseGmDownload() {
        return typeof GM_download === 'function';
    }
};

