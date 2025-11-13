/**
 * Event handlers
 */

import { Core } from './core.js';
import { State } from './state.js';
import { UI } from './ui.js';
import { Download } from './download.js';

export const Handlers = {
    /**
     * Handle fetch button click
     */
    async fetch() {
        await Core.fetchAndRender();
        UI.showDetails();
    },

    /**
     * Handle download button click
     */
    download() {
        UI.showDetails();

        if (!State.lastMediaUrls || State.lastMediaUrls.length === 0) {
            UI.setStatus('⚠️ Nothing to download – press Fetch first');
            return;
        }

        UI.setStatus(`⬇ Downloading ${State.lastMediaUrls.length} item(s)...`);
        Download.trigger(State.lastMediaUrls);
    },

    /**
     * Handle upscale button click
     */
    async upscale() {
        UI.showDetails();

        if (State.isUpscaling) {
            UI.setStatus('⏳ Already upscaling...');
            return;
        }

        await Core.fetchAndRender();

        if (!State.lastVideoIdsToUpscale || State.lastVideoIdsToUpscale.length === 0) {
            UI.setStatus('⚠️ No videos to upscale (either none or already HD)');
            return;
        }

        await Core.processUpscaleBatch();
    },

    /**
     * Handle more button click (toggle details)
     */
    toggleDetails() {
        UI.ensure();
        UI.elements.details.style.display =
            UI.elements.details.style.display === 'none' ? 'block' : 'none';
    }
};

