/**
 * Main entry point
 */

import { UI } from './ui/ui.js';
import { UrlWatcher } from './watchers/urlWatcher.js';
import { Handlers } from './core/handlers.js';

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

