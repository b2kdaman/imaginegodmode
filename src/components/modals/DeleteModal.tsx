/**
 * Modal component for bulk deleting posts
 *
 * REFACTORED: Now uses GridSelectionModal base component
 * Previous: 387 lines with duplicated shift-selection, progress bar, selection controls
 * Current: ~120 lines, clean and focused on delete-specific UI
 */

import React, { useState } from 'react';
import { mdiDelete } from '@mdi/js';
import { Icon } from '../common/Icon';
import { LikedPost, ThemeColors } from '@/types';
import { GridSelectionModal } from './shared/GridSelectionModal';
import { ConfirmModal } from './ConfirmModal';

interface DeleteModalProps {
  isOpen: boolean;
  posts: LikedPost[];
  onClose: () => void;
  onConfirm: (selectedPostIds: string[]) => void;
  getThemeColors: () => ThemeColors;
  isProcessing?: boolean;
  processedCount?: number;
  totalCount?: number;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  posts,
  onClose,
  onConfirm,
  getThemeColors,
  isProcessing = false,
  processedCount = 0,
  totalCount = 0,
}) => {
  const colors = getThemeColors();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  const handleDeleteClick = (selectedIds: string[]) => {
    setSelectedPostIds(selectedIds);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false);
    onConfirm(selectedPostIds);
    // Don't close the main modal - let it show processing state
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setSelectedPostIds([]);
  };

  // Safety check for posts
  const safePosts = posts || [];

  return (
    <>
      <GridSelectionModal
        isOpen={isOpen}
        posts={safePosts}
        title={`Delete Posts (${safePosts.length} total)`}
        onClose={onClose}
        onConfirm={handleDeleteClick}
        getThemeColors={getThemeColors}
        isProcessing={isProcessing}
        processedCount={processedCount}
        totalCount={totalCount}
        actionText="Delete"
        actionVariant="danger"
        warningMessage="Warning: Deleting posts is permanent and cannot be undone!"
        getBorderColor={(isSelected) => (isSelected ? colors.DANGER : colors.BORDER)}
        renderOverlay={(_post, isSelected) => (
          <>
            {/* Selection Indicator */}
            {isSelected && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <Icon
                  path={mdiDelete}
                  size={2}
                  color={colors.DANGER}
                />
              </div>
            )}
          </>
        )}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={showConfirmDialog}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete ${selectedPostIds.length} post${selectedPostIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        getThemeColors={getThemeColors}
      />
    </>
  );
};
