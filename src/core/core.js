/**
 * Core business logic
 */

import { Utils } from '../lib/utils.js';
import { API } from '../api/api.js';
import { State } from './state.js';
import { UI } from '../ui/ui.js';
import { MediaProcessor } from './mediaProcessor.js';
import { TIMING } from '../constants/constants.js';

export const Core = {
    /**
     * Fetch and render post data
     */
    async fetchAndRender() {
        UI.ensure();

        const postId = Utils.getPostIdFromUrl();
        if (!postId) {
            UI.setStatus('\u274C Could not detect post ID');
            return;
        }

        try {
            const json = await API.fetchPostData(postId);
            window.grokPostData = json;
            console.log('[Grok Media Fetcher] Response:', json);

            const post = json.post || {};
            UI.setStatus('\u2705 Fetched @ ' + Utils.getCurrentTime());

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

            // Enable download button if there's nothing to upscale
            if (processed.videosToUpscale.length === 0) {
                UI.enableDownloadButton();
            }
        } catch (err) {
            console.error('[Grok Media Fetcher] Error:', err);
            UI.setStatus('\u274C Error (see console)');
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

            const delay = Utils.randomDelay(TIMING.UPSCALE_REFETCH_MIN, TIMING.UPSCALE_REFETCH_MAX);
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
        UI.setStatus('\uD83D\uDE80 Upscaling started...');
        UI.disableDownloadButton();

        this.startUpscaleRefetchLoop();

        State.upscaleTimeoutIds.splice(0, State.upscaleTimeoutIds.length);
        // Capture the array and length to avoid race condition with refetch loop
        const videosToUpscale = [...State.lastVideoIdsToUpscale];
        const totalVideos = videosToUpscale.length;
        let accumulatedDelay = 0;

        videosToUpscale.forEach((videoId, idx) => {
            const delay = Utils.randomDelay(TIMING.UPSCALE_DELAY_MIN, TIMING.UPSCALE_DELAY_MAX);
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
                    UI.setStatus('\u2705 Upscale batch finished, fetching results...');

                    // Final fetch to get the upscaled HD URLs
                    setTimeout(async () => {
                        try {
                            await this.fetchAndRender();
                            UI.setStatus('\u2705 Upscale complete with updated media');
                            UI.enableDownloadButton();
                        } catch (e) {
                            console.error('[Grok Media Fetcher] Final fetch error:', e);
                            UI.setStatus('\u2705 Upscale finished (fetch failed)');
                            UI.enableDownloadButton();
                        }
                    }, 2000); // Wait 2 seconds for server to process
                }
            }, accumulatedDelay);

            State.upscaleTimeoutIds.push(timeoutId);
        });
    }
};

