/**
 * Content script - injects React app into Grok pages
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '../App';
import { VERSION } from '../utils/constants';
import '../index.css';

/**
 * Auto-click "Continue with web" button to bypass mobile app prompts
 */
function autoContinueWithWeb() {
  const maxAttempts = 10;
  let attempts = 0;

  const tryClick = () => {
    attempts++;

    // Try to find the button by text content
    const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
    const continueButton = buttons.find(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('continue with web') ||
             text.includes('use web version') ||
             text.includes('continue to web');
    });

    if (continueButton) {
      console.log('[ImagineGodMode] Auto-clicking "Continue with web" button');
      (continueButton as HTMLElement).click();
      return true;
    }

    // Retry if not found and under max attempts
    if (attempts < maxAttempts) {
      setTimeout(tryClick, 500);
    }

    return false;
  };

  // Start trying immediately
  tryClick();
}

// Wait for document to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {

  // Cool initialization tag
  console.log(
    `%c ImagineGodMode v${VERSION} %c by b2kdaman `,
    `background: #1a1a1a; color: #ffffff; padding: 4px 8px; border-radius: 3px 0 0 3px; font-weight: bold;`,
    `background: #3a3a3a; color: #b0b0b0; padding: 4px 8px; border-radius: 0 3px 3px 0;`
  );

  // Auto-click "Continue with web" button if present
  autoContinueWithWeb();

  // Create root container
  const rootId = 'imaginegodmode-root';
  let root = document.getElementById(rootId);
  let reactRoot: ReactDOM.Root | null = null;

  const mountApp = () => {
    console.log('[ImagineGodMode] Mounting app...');

    // Check if root exists and is attached to DOM
    if (!root || !document.body.contains(root)) {
      console.log('[ImagineGodMode] Root element missing or detached, recreating...');
      root = document.createElement('div');
      root.id = rootId;
      document.body.appendChild(root);
      console.log('[ImagineGodMode] Root element reattached to body');
    }

    // Create React root and render app (only if not already created)
    if (!reactRoot) {
      reactRoot = ReactDOM.createRoot(root);
      reactRoot.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('[ImagineGodMode] React app rendered');
    }
  };

  // Initial mount
  mountApp();

  // Monitor for root element removal and reattach if needed
  const bodyObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Check if our root was removed
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        const wasRemoved = Array.from(mutation.removedNodes).some(
          (node) => node instanceof Element && node.id === rootId
        );

        if (wasRemoved) {
          console.warn('[ImagineGodMode] Root element was removed from DOM, reattaching...');
          // Small delay to let any page operations complete
          setTimeout(mountApp, 100);
        }
      }
    }
  });

  // Observe body for child removals
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: false, // Only watch direct children of body
  });

  // Also periodically check if root is still attached (backup mechanism)
  setInterval(() => {
    const currentRoot = document.getElementById(rootId);
    if (!currentRoot || !document.body.contains(currentRoot)) {
      console.warn('[ImagineGodMode] Periodic check: root element missing, reattaching...');
      mountApp();
    }
  }, 5000); // Check every 5 seconds

  console.log('[ImagineGodMode] Initialization complete with reattachment protection');
}
