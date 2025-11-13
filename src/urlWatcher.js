/**
 * URL change watcher
 */

import { Utils } from './utils.js';
import { State } from './state.js';
import { UI } from './ui.js';

export const UrlWatcher = {
    /**
     * Start watching for URL changes
     */
    start() {
        if (State.urlWatcherInterval) return;

        State.lastKnownPostId = Utils.getPostIdFromUrl();
        this.resetForNewPost(State.lastKnownPostId);

        State.urlWatcherInterval = setInterval(() => {
            const current = Utils.getPostIdFromUrl();
            if (current !== State.lastKnownPostId) {
                State.lastKnownPostId = current;
                this.resetForNewPost(current);
            }
        }, 500);
    },

    /**
     * Reset state for new post
     * @param {string|null} newPostId - New post ID or null
     */
    resetForNewPost(newPostId) {
        State.resetForNewPost(newPostId);
        UI.clearLinksWrap();
        UI.setUpscaleInfo(0, 0, 0);
        UI.hideDetails();

        if (newPostId) {
            UI.setStatus('Ready');
        } else {
            UI.setStatus('Waiting for post…');
        }
    }
};

