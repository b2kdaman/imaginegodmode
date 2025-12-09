/**
 * Application constants
 */

// Version - injected from package.json via Vite define
export const VERSION = __APP_VERSION__;

// UI Layout & Positioning
export const UI_POSITION = {
  BOTTOM: '72px',
  BOTTOM_MOBILE: '16px',  // Lower offset for mobile devices
  RIGHT: '24px',
  Z_INDEX: '99999',
} as const;

// Z-Index Hierarchy
// Extension content should layer above the page but not interfere with browser UI
// Proper stacking ensures overlays work correctly in all contexts
export const Z_INDEX = {
  // Base layer
  MAIN_PANEL: 10000,        // Main floating panel (base layer)
  VIDEO_PROGRESS: 10100,    // Video progress bar (above main panel)

  // Interactive overlays for main panel
  DROPDOWN: 10200,          // Dropdown menus (above main panel content)
  TOOLTIP: 10300,           // Tooltips (above dropdowns)

  // Modal layer (highest priority for user interaction)
  MODAL: 10400,             // Modal overlay (above everything else)
  MODAL_DROPDOWN: 10500,    // Dropdowns inside modals (above modal content)
  MODAL_TOOLTIP: 10600,     // Tooltips inside modals (highest priority)
} as const;

// UI Spacing
export const UI_SPACING = {
  GAP_SMALL: '4px',
  GAP_MEDIUM: '6px',
  GAP_LARGE: '8px',
  GAP_XLARGE: '12px',
  PADDING_SMALL: '4px',
  PADDING_MEDIUM: '8px',
  PADDING_LARGE: '12px',
  PADDING_XLARGE: '16px',
  MARGIN_SMALL: '2px',
  MARGIN_MEDIUM: '8px',
} as const;

// UI Sizing
export const UI_SIZE = {
  FONT_SIZE_SMALL: '11px',
  FONT_SIZE_MEDIUM: '12px',
  FONT_SIZE_NORMAL: '13px',
  FONT_SIZE_LARGE: '14px',
  FONT_SIZE_XLARGE: '18px',
  FONT_SIZE_XXLARGE: '20px',
  MIN_HEIGHT: '36px',
  MIN_WIDTH: '36px',
  ICON_BUTTON_SIZE: '36px',
  BORDER_RADIUS: '999px',
  BORDER_RADIUS_MEDIUM: '16px',
  BORDER_RADIUS_SMALL: '8px',
  MAX_WIDTH_DETAILS: '280px',
} as const;

// Theme Colors (now loaded from public/themes.json)
// See src/utils/themeLoader.ts for theme loading logic

// Static Colors (same across themes)
export const UI_COLORS = {
  // Accent Colors
  DANGER: '#ff4444',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TEXT_BLACK: '#000000',
  TEXT_WHITE: '#FFFFFF',
} as const;

// UI Transitions
export const UI_TRANSITION = {
  DURATION: '0.2s',
  EASING: 'ease',
} as const;

// Timing & Delays
export const TIMING = {
  URL_WATCHER_INTERVAL: 500, // ms
  DOWNLOAD_DELAY: 500, // ms between downloads
  UPSCALE_REFETCH_MIN: 3000, // ms
  UPSCALE_REFETCH_MAX: 5000, // ms
  UPSCALE_DELAY_MIN: 1000, // ms
  UPSCALE_DELAY_MAX: 2000, // ms
  // Spin delays
  SPIN_ERROR_MSG_TIMEOUT: 2000, // ms - timeout for error message display
  SPIN_AFTER_ITEM_CLICK: 1000, // ms - wait after clicking list item for UI update
  SPIN_RETRY_RUN_BUTTON: 1000, // ms - wait before retrying to find run button
  SPIN_AFTER_BACK_CLICK: 1000, // ms - wait after clicking Back button
  SPIN_AFTER_NAVIGATION: 1000, // ms - wait after navigation following Back click
  SPIN_COMPLETION_CHECK_INTERVAL: 500, // ms - interval to check run button completion
  SPIN_COMPLETION_FINAL_WAIT: 1000, // ms - extra wait when percentage reaches 100%
  SPIN_COMPLETION_MAX_TIMEOUT: 300000, // ms - max timeout per item (5 minutes)
} as const;

// URL Parsing
export const URL_CONFIG = {
  POST_ID_INDEX: 2, // Expected path: ["imagine", "post", "<id>"]
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  POST_GET: '/rest/media/post/get',
  POST_LIST: '/rest/media/post/list',
  POST_LIKE: '/rest/media/post/like',
  POST_UNLIKE: '/rest/media/post/unlike',
  POST_DELETE: '/rest/media/post/delete',
  VIDEO_UPSCALE: '/rest/media/video/upscale',
} as const;

// Media Types
export const MEDIA_TYPES = {
  VIDEO: 'MEDIA_POST_TYPE_VIDEO',
} as const;

// Default Values
export const DEFAULTS = {
  STATUS_READY: 'Ready',
  STATUS_WAITING: 'Waiting for post…',
  MEDIA_FILENAME_PREFIX: 'media_',
} as const;

// DOM Selectors
export const SELECTORS = {
  MAKE_VIDEO_BUTTON: 'button[aria-label="Make video"]',
  TEXTAREA: 'textarea',
  VIDEO_ELEMENT: 'video',
  FULLSCREEN_BUTTON: '[title*="fullscreen" i]',
  FULLSCREEN_BUTTON_ALT: 'button[aria-label*="fullscreen" i]',
  PLAY_PAUSE_BUTTON: '[title*="play" i], [title*="pause" i]',
} as const;
