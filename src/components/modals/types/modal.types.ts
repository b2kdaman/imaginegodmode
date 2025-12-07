/**
 * TypeScript type definitions for the modal system
 */

import type { ThemeColors } from '@/utils/themeLoader';

/**
 * Modal variant types for different contexts
 */
export type ModalVariant = 'danger' | 'warning' | 'info' | 'success';

/**
 * Modal size options
 */
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal role types for accessibility
 */
export type ModalRole = 'dialog' | 'alertdialog';

/**
 * Base configuration for all modals
 */
export interface ModalConfig {
  id?: string;
  title: string;
  variant?: ModalVariant;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  disableClose?: boolean;
  overlayOpacity?: number;
  animationDuration?: number;
}

/**
 * State tracking for bulk operations (delete, unlike, etc.)
 */
export interface BulkOperationState {
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
}

/**
 * Modal instance in the modal stack
 */
export interface ModalStackItem {
  id: string;
  component: React.ReactNode;
  config: ModalConfig;
  onClose: () => void;
  zIndex: number;
}

/**
 * Context value for modal management
 */
export interface ModalContextValue {
  modals: ModalStackItem[];
  openModal: (config: ModalConfig, component: React.ReactNode) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
  getZIndex: (id: string) => number;
  isModalOpen: (id: string) => boolean;
  getTopModal: () => ModalStackItem | null;
}

/**
 * Base props for all modal components
 */
export interface BaseModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  getThemeColors: () => ThemeColors;
  children: React.ReactNode;

  // Size and layout
  maxWidth?: ModalSize;
  maxHeight?: string;
  width?: string;
  height?: string;
  padding?: string;

  // Behavior
  overlayOpacity?: number;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  disableClose?: boolean;

  // Content slots
  footer?: React.ReactNode;
  headerExtra?: React.ReactNode;

  // Accessibility
  id?: string;
  role?: ModalRole;
  ariaLabel?: string;
  ariaDescribedBy?: string;

  // Advanced features
  focusTrapEnabled?: boolean;
  closeOnEscape?: boolean;
  stackIndex?: number;
  animationDuration?: number;
}

/**
 * Props for confirmation modals
 */
export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
  getThemeColors: () => ThemeColors;
  variant?: ModalVariant;
  messageParams?: Record<string, string>;
}

/**
 * Props for footer button components
 */
export interface ConfirmFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ModalVariant;
  isProcessing?: boolean;
  confirmDisabled?: boolean;
  getThemeColors: () => ThemeColors;
}

export interface ActionFooterProps {
  onCancel: () => void;
  onAction: () => void;
  actionText?: string;
  cancelText?: string;
  actionDisabled?: boolean;
  isProcessing?: boolean;
  getThemeColors: () => ThemeColors;
}

export interface BulkActionFooterProps extends BulkOperationState {
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  actionText: string;
  actionVariant?: ModalVariant;
  getThemeColors: () => ThemeColors;
}

/**
 * Props for warning banner component
 */
export interface WarningBannerProps {
  variant: ModalVariant;
  icon: string;
  message: string;
  getThemeColors: () => ThemeColors;
}

/**
 * Props for validation display component
 */
export interface ValidationDisplayProps {
  isValid: boolean;
  error?: string;
  successContent?: React.ReactNode;
  getThemeColors: () => ThemeColors;
}

/**
 * Grid item for post grids
 */
export interface GridItem {
  id: string;
  thumbnailImageUrl?: string;
  mediaUrl: string;
  prompt?: string;
  videoCount?: number;
}

/**
 * Props for GridSelectionModal base component
 */
export interface GridSelectionModalProps<T extends GridItem> {
  isOpen: boolean;
  posts: T[];
  title: string;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  getThemeColors: () => ThemeColors;

  // Grid configuration
  renderOverlay: (post: T, isSelected: boolean) => React.ReactNode;
  renderBadges?: (post: T) => React.ReactNode;
  getBorderColor: (isSelected: boolean) => string;

  // Processing state
  isProcessing?: boolean;
  processedCount?: number;
  totalCount?: number;

  // Footer configuration
  actionText: string;
  actionVariant?: ModalVariant;

  // Optional features
  warningMessage?: string;
  defaultSelectAll?: boolean;
  extraFooterButtons?: React.ReactNode;
  headerExtra?: React.ReactNode;

  // Image click handler (for navigation, etc.)
  onImageClick?: (postId: string, e: React.MouseEvent) => void;
}
