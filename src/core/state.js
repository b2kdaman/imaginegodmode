/**
 * State management
 */

// No imports needed for state.js

export const State = {
    lastMediaUrls: [],
    lastVideoIdsToUpscale: [],
    lastHdVideoCount: 0,
    upscaleTotal: 0,
    upscaleDone: 0,
    isUpscaling: false,
    upscaleRefetchTimeout: null,
    upscaleTimeoutIds: [],
    urlWatcherInterval: null,
    lastKnownPostId: null,

    /**
     * Reset state for a new post
     * @param {string|null} newPostId - New post ID or null
     */
    resetForNewPost(newPostId) {
        this.lastMediaUrls = [];
        this.lastVideoIdsToUpscale = [];
        this.lastHdVideoCount = 0;
        this.upscaleTotal = 0;
        this.upscaleDone = 0;
        this.isUpscaling = false;

        if (this.upscaleRefetchTimeout) {
            clearTimeout(this.upscaleRefetchTimeout);
            this.upscaleRefetchTimeout = null;
        }

        while (this.upscaleTimeoutIds.length) {
            const timeoutId = this.upscaleTimeoutIds.pop();
            clearTimeout(timeoutId);
        }
    }
};

