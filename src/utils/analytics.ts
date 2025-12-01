/**
 * Google Analytics 4 (GA4) implementation using Measurement Protocol
 * Analytics is always enabled - no opt-out option
 */

import { v4 as uuidv4 } from 'uuid';
import { VERSION } from './constants';

// GA4 Configuration
const GA4_MEASUREMENT_ID = 'G-VQDV962F8P';
const GA4_API_SECRET = 'xR8FlDL2T6abvy3LcOWedA';
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

const CLIENT_ID_KEY = 'ga_client_id';
const SESSION_ID_KEY = 'ga_session_id';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Get or create a unique client ID for this installation
 */
const getClientId = (): string => {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  return clientId;
};

/**
 * Get or create a session ID
 */
const getSessionId = (): string => {
  const now = Date.now();
  const storedSession = localStorage.getItem(SESSION_ID_KEY);

  if (storedSession) {
    try {
      const { id, timestamp } = JSON.parse(storedSession);

      // Check if session is still valid
      if (now - timestamp < SESSION_TIMEOUT) {
        // Update timestamp
        localStorage.setItem(SESSION_ID_KEY, JSON.stringify({ id, timestamp: now }));
        return id;
      }
    } catch (e) {
      // Invalid stored session, create new one
    }
  }

  // Create new session
  const newSessionId = Date.now().toString();
  localStorage.setItem(SESSION_ID_KEY, JSON.stringify({ id: newSessionId, timestamp: now }));
  return newSessionId;
};

/**
 * Send event to GA4 using Measurement Protocol
 */
const sendToGA4 = async (events: AnalyticsEvent[]): Promise<void> => {
  try {
    const clientId = getClientId();
    const sessionId = getSessionId();

    const payload = {
      client_id: clientId,
      events: events.map(event => ({
        name: event.name,
        params: {
          ...event.params,
          session_id: sessionId,
          engagement_time_msec: 100,
        },
      })),
    };

    // Send to GA4
    await fetch(GA4_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Silently fail - don't block user experience
    console.error('[Analytics] Failed to send event:', error);
  }
};

/**
 * Initialize analytics
 */
export const initAnalytics = (): void => {
  // Ensure client ID exists
  getClientId();

  // Track extension loaded
  trackEvent('extension_loaded', {
    version: VERSION,
  });
};

/**
 * Track a custom event
 */
export const trackEvent = (eventName: string, params?: Record<string, string | number | boolean>): void => {
  sendToGA4([{ name: eventName, params }]);
};

/**
 * Track page/view change
 */
export const trackPageView = (view: string): void => {
  trackEvent('page_view', {
    page_title: view,
    page_location: view,
  });
};

/**
 * Track prompt actions
 */
export const trackPromptCreated = (): void => {
  trackEvent('prompt_created');
};

export const trackPromptEdited = (): void => {
  trackEvent('prompt_edited');
};

export const trackPromptDeleted = (): void => {
  trackEvent('prompt_deleted');
};

export const trackPromptRated = (rating: number): void => {
  trackEvent('prompt_rated', { rating });
};

export const trackPromptSearched = (queryLength: number, resultCount: number): void => {
  trackEvent('prompt_searched', {
    query_length: queryLength,
    result_count: resultCount,
  });
};

/**
 * Track pack actions
 */
export const trackPackCreated = (): void => {
  trackEvent('pack_created');
};

export const trackPackDeleted = (): void => {
  trackEvent('pack_deleted');
};

export const trackPackSwitched = (_packName: string): void => {
  // Don't send actual pack name (privacy), just track the action
  trackEvent('pack_switched');
};

export const trackPackExported = (promptCount: number): void => {
  trackEvent('pack_exported', { prompt_count: promptCount });
};

export const trackPackImported = (mode: 'add' | 'replace', promptCount: number): void => {
  trackEvent('pack_imported', {
    import_mode: mode,
    prompt_count: promptCount,
  });
};

/**
 * Track media operations
 */
export const trackVideoUpscaled = (count: number, success: boolean): void => {
  trackEvent('video_upscaled', {
    count,
    success,
  });
};

export const trackMediaDownloaded = (count: number, type: string): void => {
  trackEvent('media_downloaded', {
    count,
    media_type: type,
  });
};

export const trackAutoDownloadToggled = (enabled: boolean): void => {
  trackEvent('auto_download_toggled', { enabled });
};

export const trackRememberPostStateToggled = (enabled: boolean): void => {
  trackEvent('remember_post_state_toggled', { enabled });
};

export const trackSimpleShortcutToggled = (enabled: boolean): void => {
  trackEvent('simple_shortcut_toggled', { enabled });
};

export const trackHideUnsaveToggled = (enabled: boolean): void => {
  trackEvent('hide_unsave_toggled', { enabled });
};

/**
 * Track settings changes
 */
export const trackThemeChanged = (theme: string): void => {
  trackEvent('theme_changed', { theme });
};

export const trackSizeChanged = (size: string): void => {
  trackEvent('size_changed', { size });
};

export const trackLanguageChanged = (language: string): void => {
  trackEvent('language_changed', { language });
};

/**
 * Track errors
 */
export const trackError = (errorType: string, context?: string): void => {
  trackEvent('error_occurred', {
    error_type: errorType,
    context: context || 'unknown',
  });
};

/**
 * Track video generation
 */
export const trackVideoMakeClicked = (): void => {
  trackEvent('video_make_clicked');
};

export const trackVideoGenerationComplete = (success: boolean): void => {
  trackEvent('video_generation_complete', { success });
};

/**
 * Track modal operations
 */
export const trackModalOpened = (modalType: string): void => {
  trackEvent('modal_opened', { modal_type: modalType });
};

export const trackModalClosed = (modalType: string): void => {
  trackEvent('modal_closed', { modal_type: modalType });
};

/**
 * Track prompt interactions
 */
export const trackPromptCopiedToClipboard = (): void => {
  trackEvent('prompt_copied_to_clipboard');
};

export const trackPromptNavigated = (direction: 'next' | 'prev'): void => {
  trackEvent('prompt_navigated', { direction });
};

export const trackPromptCopiedToPage = (): void => {
  trackEvent('prompt_copied_to_page');
};

export const trackPromptCopiedFromPage = (): void => {
  trackEvent('prompt_copied_from_page');
};

export const trackMakeAndNextClicked = (): void => {
  trackEvent('make_and_next_clicked');
};

/**
 * Track bulk operations
 */
export const trackBulkSelectAll = (operationType: string): void => {
  trackEvent('bulk_select_all', { operation_type: operationType });
};

export const trackBulkDeselectAll = (operationType: string): void => {
  trackEvent('bulk_deselect_all', { operation_type: operationType });
};

export const trackBulkOperationConfirmed = (operationType: string, count: number): void => {
  trackEvent('bulk_operation_confirmed', {
    operation_type: operationType,
    item_count: count,
  });
};

export const trackBulkOperationCompleted = (operationType: string, successCount: number, totalCount: number): void => {
  trackEvent('bulk_operation_completed', {
    operation_type: operationType,
    success_count: successCount,
    total_count: totalCount,
  });
};

/**
 * Track video player controls
 */
export const trackVideoPlayPause = (action: 'play' | 'pause', method: 'button' | 'keyboard'): void => {
  trackEvent('video_play_pause', { action, method });
};

export const trackVideoFullscreen = (method: 'button' | 'keyboard'): void => {
  trackEvent('video_fullscreen', { method });
};

/**
 * Track keyboard shortcuts
 */
export const trackKeyboardShortcut = (shortcut: string, action: string): void => {
  trackEvent('keyboard_shortcut_used', { shortcut, action });
};
