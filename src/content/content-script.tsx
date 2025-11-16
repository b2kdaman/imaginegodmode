/**
 * Content script - injects React app into Grok pages
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '../App';
import '../index.css';

// Wait for document to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('[GrokGoonify] Initializing Chrome extension...');

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

  console.log('[GrokGoonify] Extension loaded successfully');
}
