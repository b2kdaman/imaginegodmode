/**
 * Event handlers
 */

import { Core } from './core.js';
import { State } from './state.js';
import { UI } from '../ui/ui.js';
import { Download } from '../download/download.js';

export const Handlers = {
    /**
     * Handle download button click
     */
    async download() {
        UI.showDetails();

        // Fetch latest data to ensure we have all available HD URLs
        UI.setStatus('\uD83D\uDD04 Fetching latest data...');
        await Core.fetchAndRender();

        if (!State.lastMediaUrls || State.lastMediaUrls.length === 0) {
            UI.setStatus('\u26A0\uFE0F Nothing to download – no media found');
            return;
        }

        UI.setStatus(`\u2B07 Downloading ${State.lastMediaUrls.length} item(s)...`);
        Download.trigger(State.lastMediaUrls);
    },

    /**
     * Handle upscale button click
     */
    async upscale() {
        UI.showDetails();

        if (State.isUpscaling) {
            UI.setStatus('\u23F3 Already upscaling...');
            return;
        }

        await Core.fetchAndRender();

        if (!State.lastVideoIdsToUpscale || State.lastVideoIdsToUpscale.length === 0) {
            UI.setStatus('\u26A0\uFE0F No videos to upscale (either none or already HD)');
            return;
        }

        await Core.processUpscaleBatch();
    }
};

