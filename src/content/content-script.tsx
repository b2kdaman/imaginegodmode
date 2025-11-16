/**
 * Content script - injects React app into Grok pages
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '../App';
import { VERSION, UI_COLORS } from '../utils/constants';
import '../index.css';

// Wait for document to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Cool initialization tag
  console.log(
    `%c GrokGoonify v${VERSION} %c by b2kdaman `,
    `background: ${UI_COLORS.BACKGROUND_DARK}; color: ${UI_COLORS.TEXT_PRIMARY}; padding: 4px 8px; border-radius: 3px 0 0 3px; font-weight: bold;`,
    `background: ${UI_COLORS.BACKGROUND_LIGHT}; color: ${UI_COLORS.TEXT_SECONDARY}; padding: 4px 8px; border-radius: 0 3px 3px 0;`
  );

  // Create root container
  const rootId = 'grokgoonify-root';
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
