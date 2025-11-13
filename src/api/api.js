/**
 * API functions for fetching data from Grok
 */

import { API_ENDPOINTS } from '../constants/constants.js';

export const API = {
    /**
     * Fetch post data from Grok API
     * @param {string} postId - Post ID to fetch
     * @returns {Promise<Object>} Post data
     */
    async fetchPostData(postId) {
        const res = await fetch(API_ENDPOINTS.POST_GET, {
            method: 'POST',
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
            },
            body: JSON.stringify({ id: postId }),
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        return res.json();
    },

    /**
     * Upscale a video
     * @param {string} videoId - Video ID to upscale
     * @returns {Promise<Object|null>} Upscale response
     */
    async upscaleVideo(videoId) {
        const res = await fetch(API_ENDPOINTS.VIDEO_UPSCALE, {
            method: 'POST',
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
            },
            body: JSON.stringify({ videoId }),
        });

        if (!res.ok) {
            throw new Error(`Upscale HTTP ${res.status}`);
        }

        const json = await res.json().catch(() => null);
        console.log('[Grok Media Fetcher] Upscale response for', videoId, json);
        return json;
    }
};

