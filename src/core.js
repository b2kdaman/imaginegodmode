/**
 * Core business logic
 */

import { Utils } from './utils.js';
import { API } from './api.js';
import { State } from './state.js';
import { UI } from './ui.js';
import { MediaProcessor } from './mediaProcessor.js';

export const Core = {
    /**
     * Fetch and render post data
     */
    async fetchAndRender() {
        UI.ensure();

        const postId = Utils.getPostIdFromUrl();
        if (!postId) {
            UI.setStatus('❌ Could not detect post ID');
            return;
        }

        try {
            const json = await API.fetchPostData(postId);
            window.grokPostData = json;
            console.log('[Grok Media Fetcher] Response:', json);

            const post = json.post || {};
            UI.setStatus('✅ Fetched @ ' + Utils.getCurrentTime());

            const processed = MediaProcessor.processPostData(post);
            State.lastMediaUrls = processed.urls;
            State.lastVideoIdsToUpscale = processed.videosToUpscale;
            State.lastHdVideoCount = processed.hdVideoCount;

            UI.renderMediaInfo(processed);

            if (!State.isUpscaling) {
                State.upscaleTotal = processed.videosToUpscale.length;
                State.upscaleDone = 0;
            }

            UI.setUpscaleInfo(State.upscaleDone, State.upscaleTotal, State.lastHdVideoCount);
        } catch (err) {
            console.error('[Grok Media Fetcher] Error:', err);
            UI.setStatus('❌ Error (see console)');
        }
    },

    /**
     * Start upscale refetch loop
     */
    startUpscaleRefetchLoop() {
        if (State.upscaleRefetchTimeout) return;

        const tick = async () => {
            if (!State.isUpscaling || State.upscaleDone >= State.upscaleTotal) {
                State.upscaleRefetchTimeout = null;
                return;
            }

            try {
                await this.fetchAndRender();
            } catch (e) {
                console.error('[Grok Media Fetcher] Upscale-refetch error:', e);
            }

            const delay = Utils.randomDelay(3000, 5000);
            State.upscaleRefetchTimeout = setTimeout(tick, delay);
        };

        tick();
    },

    /**
     * Process upscale batch
     */
    async processUpscaleBatch() {
        State.isUpscaling = true;
        State.upscaleTotal = State.lastVideoIdsToUpscale.length;
        State.upscaleDone = 0;
        UI.setUpscaleInfo(State.upscaleDone, State.upscaleTotal, State.lastHdVideoCount);
        UI.setStatus('🚀 Upscaling started...');

        this.startUpscaleRefetchLoop();

        State.upscaleTimeoutIds.splice(0, State.upscaleTimeoutIds.length);
        // Capture the array and length to avoid race condition with refetch loop
        const videosToUpscale = [...State.lastVideoIdsToUpscale];
        const totalVideos = videosToUpscale.length;
        let accumulatedDelay = 0;

        videosToUpscale.forEach((videoId, idx) => {
            const delay = Utils.randomDelay(1000, 2000);
            accumulatedDelay += delay;

            const timeoutId = setTimeout(async () => {
                try {
                    await API.upscaleVideo(videoId);
                    State.upscaleDone += 1;
                    UI.setUpscaleInfo(State.upscaleDone, State.upscaleTotal, State.lastHdVideoCount);
                } catch (e) {
                    console.error('[Grok Media Fetcher] Upscale error for', videoId, e);
                }

                // Use captured length instead of global variable to avoid race condition
                if (idx === totalVideos - 1) {
                    State.isUpscaling = false;
                    UI.setStatus('✅ Upscale batch finished');
                }
            }, accumulatedDelay);

            State.upscaleTimeoutIds.push(timeoutId);
        });
    }
};

