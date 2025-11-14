/**
 * Application constants
 */

// Version
export const VERSION = '1.4';

// UI Layout & Positioning
export const UI_POSITION = {
    BOTTOM: '72px',
    RIGHT: '24px',
    Z_INDEX: '99999',
};

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
};

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
    BORDER_RADIUS: '999px',
    BORDER_RADIUS_MEDIUM: '16px',
    BORDER_RADIUS_SMALL: '8px',
    MAX_WIDTH_DETAILS: '280px',
};

// UI Colors
export const UI_COLORS = {
    BACKGROUND_DARK: '#1a1a1a',
    BACKGROUND_MEDIUM: '#2a2a2a',
    BACKGROUND_LIGHT: '#3a3a3a',
    TEXT_PRIMARY: '#fff',
    TEXT_SECONDARY: '#b0b0b0',
    TEXT_HOVER: '#d0d0d0',
    SHADOW: 'rgba(0,0,0,0.4)',
    BORDER: 'rgba(255, 255, 255, 0.2)',
};

// UI Transitions
export const UI_TRANSITION = {
    DURATION: '0.2s',
    EASING: 'ease',
};

// Timing & Delays
export const TIMING = {
    URL_WATCHER_INTERVAL: 500, // ms
    DOWNLOAD_DELAY: 500, // ms between downloads
    UPSCALE_REFETCH_MIN: 3000, // ms
    UPSCALE_REFETCH_MAX: 5000, // ms
    UPSCALE_DELAY_MIN: 1000, // ms
    UPSCALE_DELAY_MAX: 2000, // ms
};

// URL Parsing
export const URL_CONFIG = {
    POST_ID_INDEX: 2, // Expected path: ["imagine", "post", "<id>"]
};

// API Endpoints
export const API_ENDPOINTS = {
    POST_GET: '/rest/media/post/get',
    VIDEO_UPSCALE: '/rest/media/video/upscale',
};

// Media Types
export const MEDIA_TYPES = {
    VIDEO: 'MEDIA_POST_TYPE_VIDEO',
};

// Default Values
export const DEFAULTS = {
    STATUS_READY: 'Ready',
    STATUS_WAITING: 'Waiting for post…',
    MEDIA_FILENAME_PREFIX: 'media_',
};

