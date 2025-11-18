/**
 * Application constants
 */

// Version
export const VERSION = '2.1.0';

// UI Layout & Positioning
export const UI_POSITION = {
  BOTTOM: '72px',
  RIGHT: '24px',
  Z_INDEX: '99999',
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

// Theme Colors
export const THEMES = {
  dark: {
    // Backgrounds
    BACKGROUND_DARK: '#1a1a1a',
    BACKGROUND_MEDIUM: '#2a2a2a',
    BACKGROUND_LIGHT: '#3a3a3a',

    // Text
    TEXT_PRIMARY: '#fff',
    TEXT_SECONDARY: '#b0b0b0',
    TEXT_HOVER: '#d0d0d0',

    // UI Elements
    SHADOW: 'rgba(0,0,0,0.4)',
    BORDER: 'rgba(255, 255, 255, 0.2)',

    // Accent Colors
    SUCCESS: '#10b981',

    // Progress & Effects
    PROGRESS_BAR: 'rgba(255, 255, 255, 0.5)',
    GLOW_PRIMARY: 'rgba(255, 255, 255, 0.6)',
    GLOW_SECONDARY: 'rgba(255, 255, 255, 0.4)',
    GLOW_HOVER_PRIMARY: 'rgba(255, 255, 255, 0.8)',
    GLOW_HOVER_SECONDARY: 'rgba(255, 255, 255, 0.6)',
  },
  light: {
    // Backgrounds
    BACKGROUND_DARK: '#f5f5f5',
    BACKGROUND_MEDIUM: '#ffffff',
    BACKGROUND_LIGHT: '#e8e8e8',

    // Text
    TEXT_PRIMARY: '#1a1a1a',
    TEXT_SECONDARY: '#666666',
    TEXT_HOVER: '#333333',

    // UI Elements
    SHADOW: 'rgba(0,0,0,0.15)',
    BORDER: 'rgba(0, 0, 0, 0.2)',

    // Accent Colors
    SUCCESS: '#059669',

    // Progress & Effects
    PROGRESS_BAR: 'rgba(0, 0, 0, 0.3)',
    GLOW_PRIMARY: 'rgba(0, 0, 0, 0.4)',
    GLOW_SECONDARY: 'rgba(0, 0, 0, 0.2)',
    GLOW_HOVER_PRIMARY: 'rgba(0, 0, 0, 0.5)',
    GLOW_HOVER_SECONDARY: 'rgba(0, 0, 0, 0.3)',
  },
  dracula: {
    // Backgrounds - Dracula palette
    BACKGROUND_DARK: '#282a36',   // Dracula background
    BACKGROUND_MEDIUM: '#44475a', // Dracula current line
    BACKGROUND_LIGHT: '#6272a4',  // Dracula comment

    // Text - Dracula palette
    TEXT_PRIMARY: '#f8f8f2',      // Dracula foreground
    TEXT_SECONDARY: '#bd93f9',    // Dracula purple (soft)
    TEXT_HOVER: '#ff79c6',        // Dracula pink

    // UI Elements
    SHADOW: 'rgba(0,0,0,0.5)',
    BORDER: 'rgba(189, 147, 249, 0.3)', // Purple border

    // Accent Colors
    SUCCESS: '#50fa7b',           // Dracula green

    // Progress & Effects - White for progress, Dracula green/cyan for glow
    PROGRESS_BAR: 'rgba(255, 255, 255, 1)',    // White
    GLOW_PRIMARY: 'rgba(80, 250, 123, 0.6)',   // Dracula green
    GLOW_SECONDARY: 'rgba(139, 233, 253, 0.4)', // Dracula cyan
    GLOW_HOVER_PRIMARY: 'rgba(80, 250, 123, 0.8)',
    GLOW_HOVER_SECONDARY: 'rgba(139, 233, 253, 0.6)',
  },
} as const;

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
