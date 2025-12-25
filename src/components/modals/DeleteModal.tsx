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
import { useTranslation } from '@/contexts/I18nContext';

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
  const { t } = useTranslation();
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
        title={t('modals.delete.title', { total: safePosts.length })}
        onClose={onClose}
        onConfirm={handleDeleteClick}
        getThemeColors={getThemeColors}
        isProcessing={isProcessing}
        processedCount={processedCount}
        totalCount={totalCount}
        actionText={t('modals.delete.actionText')}
        actionVariant="danger"
        warningMessage={t('modals.delete.warningMessage')}
        getBorderColor={(isSelected) => (isSelected ? 'var(--theme-danger)' : 'var(--theme-border)')}
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
                  color="var(--theme-danger)"
                />
              </div>
            )}
          </>
        )}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={showConfirmDialog}
        title={t('modals.confirmDeletion.title')}
        message={t('modals.confirmDeletion.message', {
          count: selectedPostIds.length,
          plural: selectedPostIds.length !== 1 ? 's' : ''
        })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        getThemeColors={getThemeColors}
      />
    </>
  );
};
