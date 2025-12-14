/**
 * Main App component
 */

import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { MainPanel } from './components/MainPanel';
import { usePromptStore } from './store/usePromptStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useUserStore } from './store/useUserStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useArrowKeyNavigation } from './hooks/useArrowKeyNavigation';
import { useVideoProgress } from './hooks/useVideoProgress';
import { I18nProvider } from './contexts/I18nContext';
import { initAnalytics } from './utils/analytics';
import { Z_INDEX } from './utils/constants';

export const App: React.FC = () => {
  const { loadFromStorage } = usePromptStore();
  const { loadThemes, hideUnsave } = useSettingsStore();
  const { loadUserId } = useUserStore();

  // Initialize data from storage and load themes
  useEffect(() => {
    loadFromStorage();
    loadThemes();
    loadUserId();
    initAnalytics();
  }, [loadFromStorage, loadThemes, loadUserId]);

  // Apply CSS rule to hide Unsave button when setting is enabled (global effect)
  useEffect(() => {
    const styleId = 'hide-unsave-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (hideUnsave) {
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = 'button[aria-label="Unsave"] { display: none !important; }';
    } else {
      if (styleElement) {
        styleElement.remove();
      }
    }

    return () => {
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, [hideUnsave]);

  // Apply custom tooltip positioning styles to keep tooltips at top with proper horizontal adjustment
  useEffect(() => {
    const styleId = 'tooltip-positioning-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      /* Ensure tooltips always stay at the top and handle horizontal overflow gracefully */
      .react-tooltip[data-tooltip-place="top"] {
        /* Prevent tooltip from flipping to bottom */
        max-width: 20rem !important;
      }

      /* Allow tooltip content to adjust horizontally while arrow stays centered on trigger element */
      .react-tooltip {
        /* The tooltip will shift horizontally when near screen edges */
        /* This is handled by floating-ui's shift middleware automatically */
        /* We just ensure the tooltip doesn't get clipped */
        white-space: normal;
        word-wrap: break-word;
      }

      /* The arrow position is calculated by floating-ui to stay centered on the trigger element */
      /* Even when the tooltip shifts horizontally, the arrow will remain properly positioned */
      .react-tooltip-arrow {
        /* Arrow positioning is dynamically calculated */
        /* No additional styles needed - floating-ui handles this */
      }
    `;

    return () => {
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, []);

  // Set up keyboard shortcuts
  useKeyboardShortcuts();

  // Set up arrow key navigation
  useArrowKeyNavigation();

  // Set up video progress watcher (button glow + progress bar)
  useVideoProgress();

  return (
    <I18nProvider>
      <MainPanel />
      <Tooltip
        id="app-tooltip"
        className="!text-xs !max-w-[20rem]"
        style={{ zIndex: Z_INDEX.MODAL_TOOLTIP }}
        place="top"
        offset={10}
        positionStrategy="fixed"
        float={false}
      />
    </I18nProvider>
  );
};
