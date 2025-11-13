/**
 * Download functionality
 */

import { Utils } from './utils.js';

export const Download = {
    /**
     * Fallback download using anchor element
     * @param {string} url - URL to download
     * @param {string} name - Filename
     */
    fallback(url, name) {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    /**
     * Download using GM_download with fallback
     * @param {string} url - URL to download
     * @param {string} name - Filename
     */
    withGmDownload(url, name) {
        try {
            GM_download({
                url,
                name,
                saveAs: false,
                onerror: (err) => {
                    console.error('[Grok Media Fetcher] GM_download error, fallback triggered:', err);
                    this.fallback(url, name);
                },
            });
        } catch (err) {
            console.error('[Grok Media Fetcher] GM_download threw, fallback triggered:', err);
            this.fallback(url, name);
        }
    },

    /**
     * Trigger downloads for multiple URLs with delays
     * @param {string[]} urls - Array of URLs to download
     */
    trigger(urls) {
        const canUseGm = Utils.canUseGmDownload();
        urls.forEach((url, idx) => {
            setTimeout(() => {
                const name = Utils.extractFilename(url, idx);
                if (canUseGm) {
                    this.withGmDownload(url, name);
                } else {
                    this.fallback(url, name);
                }
            }, idx * 500); // small delay between downloads
        });
    }
};

