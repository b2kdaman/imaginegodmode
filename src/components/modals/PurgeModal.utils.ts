/**
 * Utility functions for PurgeModal
 */

import { ArrowKey, ARROW_KEYS, ARROW_SEQUENCE_LENGTH } from './PurgeModal.constants';

/**
 * Generate a random arrow key sequence
 */
export const generateArrowSequence = (): ArrowKey[] => {
  const sequence: ArrowKey[] = [];
  for (let i = 0; i < ARROW_SEQUENCE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ARROW_KEYS.length);
    sequence.push(ARROW_KEYS[randomIndex]);
  }
  return sequence;
};

/**
 * Check if a key is a valid arrow key
 */
export const isArrowKey = (key: string): key is ArrowKey => {
  return ARROW_KEYS.includes(key as ArrowKey);
};

/**
 * Validate if the user input matches the expected sequence
 */
export const validateSequence = (userInput: ArrowKey[], expectedSequence: ArrowKey[]): boolean => {
  return userInput.every((key, index) => key === expectedSequence[index]);
};

/**
 * Calculate the ascend transform for an arrow box
 */
export const getAscendTransform = (index: number, baseOffset: number, staggerOffset: number): string => {
  return `translateY(-${baseOffset + index * staggerOffset}px)`;
};

/**
 * Calculate the ascend transition delay for staggered animation
 */
export const getAscendDelay = (index: number, staggerDelay: number): string => {
  return `${index * (staggerDelay / 1000)}s`;
};
