/**
 * Reusable footer button components for modals
 */

import React from 'react';
import { Button } from '../../inputs/Button';
import { mdiLoading } from '@mdi/js';
import type {
  ConfirmFooterProps,
  ActionFooterProps,
  BulkActionFooterProps,
} from '../types/modal.types';
import { getVariantColor } from '../types/modalHelpers';

/**
 * Standard Cancel + Confirm footer
 *
 * Used in confirmation dialogs
 */
export const ConfirmFooter: React.FC<ConfirmFooterProps> = ({
  onCancel,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isProcessing = false,
  confirmDisabled = false,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const confirmColor = getVariantColor(confirmVariant, colors);

  return (
    <div className="flex gap-2 justify-end">
      <Button onClick={onCancel} className="text-xs" disabled={isProcessing}>
        {cancelText}
      </Button>
      <Button
        onClick={onConfirm}
        className="text-xs"
        disabled={confirmDisabled || isProcessing}
        icon={isProcessing ? mdiLoading : undefined}
        iconClassName={isProcessing ? 'animate-spin' : ''}
        style={{
          backgroundColor: confirmColor,
          color: '#fff',
        }}
      >
        {confirmText}
      </Button>
    </div>
  );
};

/**
 * Cancel + Action footer
 *
 * Used for general actions (not confirmations)
 */
export const ActionFooter: React.FC<ActionFooterProps> = ({
  onCancel,
  onAction,
  actionText = 'Continue',
  cancelText = 'Cancel',
  actionDisabled = false,
  isProcessing = false,
  getThemeColors,
}) => {
  const colors = getThemeColors();

  return (
    <div className="flex gap-2 justify-end">
      <Button onClick={onCancel} className="text-xs" disabled={isProcessing}>
        {cancelText}
      </Button>
      <Button
        onClick={onAction}
        className="text-xs"
        disabled={actionDisabled || isProcessing}
        icon={isProcessing ? mdiLoading : undefined}
        iconClassName={isProcessing ? 'animate-spin' : ''}
        style={{
          backgroundColor: colors.GLOW_PRIMARY,
          color: '#fff',
        }}
      >
        {actionText}
      </Button>
    </div>
  );
};

/**
 * Bulk action footer with progress tracking
 *
 * Used in grid selection modals (Delete, Unlike, Upscale, etc.)
 */
export const BulkActionFooter: React.FC<BulkActionFooterProps> = ({
  onClose,
  onConfirm,
  selectedCount,
  actionText,
  actionVariant = 'danger',
  isProcessing = false,
  processedCount = 0,
  totalCount = 0,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const actionColor = getVariantColor(actionVariant, colors);

  const buttonText = selectedCount > 0
    ? `${actionText} ${selectedCount} Post${selectedCount !== 1 ? 's' : ''}`
    : `Select posts to ${actionText.toLowerCase()}`;

  return (
    <div className="flex gap-2 justify-end">
      <Button
        onClick={onClose}
        className="text-xs"
        disabled={isProcessing}
        icon={isProcessing ? mdiLoading : undefined}
        iconClassName={isProcessing ? 'animate-spin' : ''}
      >
        {isProcessing ? `Processing (${processedCount}/${totalCount})` : 'Close'}
      </Button>
      {!isProcessing && (
        <Button
          onClick={onConfirm}
          className="text-xs"
          disabled={selectedCount === 0}
          style={{
            backgroundColor: actionColor,
            color: '#fff',
          }}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};
