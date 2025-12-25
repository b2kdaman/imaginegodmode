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

  if (!root) {
    root = document.createElement('div');
    root.id = rootId;
    document.body.appendChild(root);
  }

  // Create React root and render app
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
