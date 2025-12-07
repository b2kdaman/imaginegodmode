/**
 * Helper utilities for modal system
 */

import type { ModalVariant, ModalConfig, ModalSize } from './modal.types';
import type { ThemeColors } from '@/utils/themeLoader';

/**
 * Generate a unique modal ID
 */
export const generateModalId = (): string => {
  return `modal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create a standardized modal config with defaults
 */
export const createModalConfig = (
  title: string,
  variant: ModalVariant = 'info',
  size: ModalSize = 'md'
): Partial<ModalConfig> => {
  return {
    title,
    variant,
    size,
    closeOnOverlayClick: variant !== 'danger',
    closeOnEscape: true,
    disableClose: false,
    overlayOpacity: 0.7,
    animationDuration: 300,
  };
};

/**
 * Create a confirmation modal config
 */
export const createConfirmConfig = (
  title: string,
  variant: ModalVariant = 'warning'
): Partial<ModalConfig> => {
  return createModalConfig(title, variant, 'xs');
};

/**
 * Get the color for a modal variant
 */
export const getVariantColor = (
  variant: ModalVariant,
  colors: ThemeColors
): string => {
  switch (variant) {
    case 'danger':
      return colors.DANGER;
    case 'warning':
      return colors.DANGER; // Use DANGER for warning as well
    case 'info':
      return colors.GLOW_PRIMARY;
    case 'success':
      return colors.SUCCESS;
    default:
      return colors.GLOW_PRIMARY;
  }
};

/**
 * Get the background color for a modal variant (with transparency)
 */
export const getVariantBackgroundColor = (
  variant: ModalVariant,
  colors: ThemeColors,
  opacity: number = 0.2
): string => {
  const color = getVariantColor(variant, colors);
  // Convert hex to rgba if needed
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

/**
 * Get the appropriate ARIA role for a modal variant
 */
export const getModalRole = (variant: ModalVariant): 'dialog' | 'alertdialog' => {
  return variant === 'danger' || variant === 'warning' ? 'alertdialog' : 'dialog';
};

/**
 * Check if a modal should be closeable based on its state
 */
export const isModalCloseable = (
  disableClose: boolean = false,
  isProcessing: boolean = false
): boolean => {
  return !disableClose && !isProcessing;
};

/**
 * Calculate progress percentage for bulk operations
 */
export const calculateProgress = (
  processedCount: number,
  totalCount: number
): number => {
  if (totalCount === 0) return 0;
  return Math.min(100, Math.round((processedCount / totalCount) * 100));
};

/**
 * Format a progress message for bulk operations
 */
export const formatProgressMessage = (
  processedCount: number,
  totalCount: number,
  operation: string = 'Processing'
): string => {
  return `${operation} ${processedCount} / ${totalCount}`;
};

/**
 * Get focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
};

/**
 * Interpolate parameters into a message string
 * Example: interpolateMessage("Hello {name}!", { name: "World" }) => "Hello World!"
 */
export const interpolateMessage = (
  message: string,
  params?: Record<string, string>
): string => {
  if (!params) return message;

  return Object.entries(params).reduce((msg, [key, value]) => {
    return msg.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }, message);
};
