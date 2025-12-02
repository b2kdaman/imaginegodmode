/**
 * Modal component for bulk deleting posts
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiDelete, mdiLoading, mdiAlertCircle } from '@mdi/js';
import { Icon } from '../common/Icon';
import { LikedPost } from '@/types';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';

interface DeleteModalProps {
  isOpen: boolean;
  posts: LikedPost[];
  onClose: () => void;
  onConfirm: (selectedPostIds: string[]) => void;
  getThemeColors: () => any;
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Clear selection when modal closes after processing completes
  useEffect(() => {
    if (!isOpen && !isProcessing) {
      setSelectedIds(new Set());
    }
  }, [isOpen, isProcessing]);

  const toggleSelection = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const currentIndex = posts.findIndex((p) => p.id === postId);

    // Handle shift-click for batch selection/deselection
    if (e?.shiftKey && lastClickedIndex !== null && currentIndex !== -1) {
      const newSelected = new Set(selectedIds);
      const start = Math.min(lastClickedIndex, currentIndex);
      const end = Math.max(lastClickedIndex, currentIndex);

      // Determine whether to select or deselect based on the current item's state
      const shouldSelect = !selectedIds.has(postId);

      // Apply the same action to all items in the range
      for (let i = start; i <= end; i++) {
        if (shouldSelect) {
          newSelected.add(posts[i].id);
        } else {
          newSelected.delete(posts[i].id);
        }
      }

      setSelectedIds(newSelected);
    } else {
      // Normal click - toggle single item
      const newSelected = new Set(selectedIds);
      if (newSelected.has(postId)) {
        newSelected.delete(postId);
      } else {
        newSelected.add(postId);
      }
      setSelectedIds(newSelected);
    }

    // Update last clicked index
    if (currentIndex !== -1) {
      setLastClickedIndex(currentIndex);
    }
  };

  const handleImageClick = (postId: string, e: React.MouseEvent) => {
    toggleSelection(postId, e);
  };

  const selectAll = () => {
    setSelectedIds(new Set(posts.map((p) => p.id)));
    trackBulkSelectAll('delete');
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
    trackBulkDeselectAll('delete');
  };

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false);
    const selectedPostIds = Array.from(selectedIds);
    trackBulkOperationConfirmed('delete', selectedPostIds.length);
    onConfirm(selectedPostIds);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const title = `Delete Posts (${posts.length} total)`;
  const deleteButtonText = selectedIds.size > 0
    ? `Delete ${selectedIds.size} Post${selectedIds.size !== 1 ? 's' : ''}`
    : 'Select posts to delete';

  return (
    <BaseModal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      getThemeColors={getThemeColors}
      width="90vw"
      maxWidth="full"
      height="85vh"
      maxHeight="800px"
      padding="p-6"
      overlayOpacity={0.7}
      closeOnOverlayClick={!isProcessing}
      disableClose={isProcessing}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            onClick={onClose}
            className="text-xs"
            disabled={isProcessing}
            icon={isProcessing ? mdiLoading : undefined}
            iconClassName={isProcessing ? "animate-spin" : ""}
          >
            {isProcessing ? 'Processing' : 'Close'}
          </Button>
          {!isProcessing && (
            <Button
              onClick={handleDeleteClick}
              className="text-xs"
              disabled={selectedIds.size === 0}
              icon={mdiDelete}
              style={{
                backgroundColor: colors.DANGER,
                color: '#fff',
              }}
            >
              {deleteButtonText}
            </Button>
          )}
        </div>
      }
    >
      <>
        {/* Warning Message */}
        {!isProcessing && (
          <div
            className="mb-3 p-3 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: `${colors.DANGER}20`,
              color: colors.TEXT_PRIMARY,
            }}
          >
            <Icon path={mdiAlertCircle} size={0.8} color={colors.DANGER} />
            <span className="text-xs">
              Warning: Deleting posts is permanent and cannot be undone!
            </span>
          </div>
        )}

        {/* Progress Bar (shown when processing) */}
        {isProcessing && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1 items-center" style={{ color: colors.TEXT_SECONDARY }}>
              <span className="flex items-center gap-1">
                <Icon path={mdiLoading} size={0.6} className="animate-spin" />
                Deleting posts
              </span>
              <span>{processedCount} / {totalCount}</span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.BACKGROUND_MEDIUM }}
            >
              <div
                key={`progress-${processedCount}`}
                className="h-full"
                style={{
                  width: `${totalCount > 0 ? (processedCount / totalCount) * 100 : 0}%`,
                  backgroundColor: colors.DANGER,
                  transition: 'width 0.3s ease-in-out',
                }}
              />
            </div>
          </div>
        )}

        {/* Select All / Deselect All Buttons */}
        {!isProcessing && (
          <div className="flex gap-2 mb-3">
            <Button onClick={selectAll} className="text-xs flex-1">
              Select All
            </Button>
            <Button onClick={deselectAll} className="text-xs flex-1">
              Deselect All
            </Button>
          </div>
        )}

        {/* Posts Grid */}
        <div className="flex-1 overflow-y-scroll mb-3">
          {posts.length === 0 ? (
            <div
              className="flex items-center justify-center h-full text-sm"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              No posts to delete
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {posts.map((post) => {
                const isSelected = selectedIds.has(post.id);
                const imageUrl = post.thumbnailImageUrl || post.mediaUrl;

                return (
                  <div
                    key={post.id}
                    className="relative aspect-square rounded-lg overflow-hidden transition-all cursor-pointer"
                    style={{
                      border: `2px solid ${
                        isSelected ? colors.DANGER : colors.BORDER
                      }`,
                      opacity: isProcessing ? 0.7 : (isSelected ? 1 : 0.6),
                      pointerEvents: isProcessing ? 'none' : 'auto',
                    }}
                    onClick={(e) => handleImageClick(post.id, e)}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isProcessing) {
                        e.currentTarget.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isProcessing) {
                        e.currentTarget.style.opacity = '0.6';
                      }
                    }}
                  >
                    {/* Image */}
                    <img
                      src={imageUrl}
                      alt={post.prompt || 'Post'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

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

                    {/* Child Post Count Badge */}
                    {post.childPosts && post.childPosts.length > 0 && (
                      <div
                        className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: colors.BACKGROUND_DARK,
                          color: colors.TEXT_PRIMARY,
                          opacity: 0.9,
                        }}
                      >
                        {post.childPosts.length}v
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Dialog Overlay */}
        {showConfirmDialog && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
            }}
            onClick={handleCancelDelete}
          >
            <div
              className="rounded-lg p-6 max-w-md mx-4"
              style={{
                backgroundColor: colors.BACKGROUND_MEDIUM,
                border: `1px solid ${colors.BORDER}`,
                boxShadow: `0 4px 20px ${colors.SHADOW}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <div className="flex flex-col items-center gap-4 mb-4">
                <div
                  className="rounded-full p-4"
                  style={{
                    backgroundColor: `${colors.DANGER}20`,
                  }}
                >
                  <Icon path={mdiAlertCircle} size={2} color={colors.DANGER} />
                </div>

                {/* Confirmation Text */}
                <div className="text-center">
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: colors.TEXT_PRIMARY }}
                  >
                    Confirm Deletion
                  </h3>
                  <p
                    className="text-sm mb-1"
                    style={{ color: colors.TEXT_SECONDARY }}
                  >
                    Are you sure you want to permanently delete{' '}
                    <span
                      className="font-bold"
                      style={{ color: colors.DANGER }}
                    >
                      {selectedIds.size} post{selectedIds.size !== 1 ? 's' : ''}
                    </span>
                    ?
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.TEXT_SECONDARY }}
                  >
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCancelDelete}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  icon={mdiDelete}
                  className="flex-1"
                  style={{
                    backgroundColor: colors.DANGER,
                    color: '#fff',
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

      </>
    </BaseModal>
  );
};
