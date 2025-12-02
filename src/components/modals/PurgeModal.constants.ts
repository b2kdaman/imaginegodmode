/**
 * Constants for PurgeModal
 */

export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export const ARROW_KEYS: ArrowKey[] = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

export const ARROW_LABELS: Record<ArrowKey, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
};

export const ARROW_SEQUENCE_LENGTH = 6;

export const ANIMATION_TIMINGS = {
  PRESS_ANIMATION_DURATION: 200, // ms
  ASCEND_ANIMATION_DURATION: 600, // ms
  ASCEND_STAGGER_DELAY: 50, // ms per item
  COMPLETION_DELAY: 600, // ms before showing success
  ERROR_RESET_DELAY: 500, // ms before resetting after error
  SEQUENCE_TIMEOUT: 5000, // ms - total time allowed for sequence
} as const;

export const ANIMATION_TRANSFORMS = {
  PRESS_SCALE: 1.2,
  PRESS_ROTATION: 5, // degrees
  ICON_PRESS_SCALE: 1.1,
  ASCEND_BASE_OFFSET: 100, // px
  ASCEND_STAGGER_OFFSET: 20, // px per item
} as const;

export const ANIMATION_CUBIC_BEZIER = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
