/**
 * Main entry point
 */

import { UI } from './ui.js';
import { UrlWatcher } from './urlWatcher.js';
import { Handlers } from './handlers.js';

function init() {
    UI.ensure();
    UI.attachHandlers(Handlers);
    UrlWatcher.start();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

