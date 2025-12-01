/**
 * Modal component for selecting posts to unlike
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiHeartBroken, mdiHeart } from '@mdi/js';
import { Icon } from '../common/Icon';
import { LikedPost } from '@/types';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';

interface UnlikeModalProps {
  isOpen: boolean;
  posts: LikedPost[];
  onClose: () => void;
  onConfirm: (selectedPostIds: string[]) => void;
  onImageClick?: (postId: string) => void;
  getThemeColors: () => any;
  isProcessing?: boolean;
  processedCount?: number;
  totalCount?: number;
}

export const UnlikeModal: React.FC<UnlikeModalProps> = ({
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

  // Deselect all posts by default when modal opens (but not during processing)
  useEffect(() => {
    if (isOpen && !isProcessing) {
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
    // Just toggle selection, don't navigate
    toggleSelection(postId, e);
  };

  const selectAll = () => {
    setSelectedIds(new Set(posts.map((p) => p.id)));
    trackBulkSelectAll('unlike');
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
    trackBulkDeselectAll('unlike');
  };

  const handleConfirm = () => {
    const selectedPostIds = Array.from(selectedIds);
    trackBulkOperationConfirmed('unlike', selectedPostIds.length);
    onConfirm(selectedPostIds);
  };

  const title = `Select Posts to Unlike (${selectedIds.size}/${posts.length})`;
  const confirmButtonText = `Unlike ${selectedIds.size} Post${selectedIds.size !== 1 ? 's' : ''}`;

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
          >
            {isProcessing ? 'Processing...' : 'Cancel'}
          </Button>
          {!isProcessing && (
            <Button
              onClick={handleConfirm}
              className="text-xs"
              disabled={selectedIds.size === 0}
            >
              {confirmButtonText}
            </Button>
          )}
        </div>
      }
    >
      <>
        {/* Progress Bar (shown when processing) */}
        {isProcessing && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: colors.TEXT_SECONDARY }}>
              <span>Processing...</span>
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
          <div className="grid grid-cols-5 gap-2">
            {posts.map((post) => {
              const isSelected = selectedIds.has(post.id);
              const imageUrl = post.thumbnailImageUrl || post.mediaUrl;

              // Count total videos in this post
              const totalVideos = post.childPosts?.filter(cp => cp.mediaType === 'video').length || 0;

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

                  {/* Like/Unlike Indicator */}
                  <button
                    onClick={(e) => toggleSelection(post.id, e)}
                    disabled={isProcessing}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2"
                    style={{
                      backgroundColor: isSelected
                        ? colors.DANGER
                        : colors.SUCCESS,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Icon
                      path={
                        isSelected
                          ? mdiHeartBroken
                          : mdiHeart
                      }
                      size={1.5}
                      color='#fff'
                    />
                  </button>

                  {/* Video Count Badge */}
                  {totalVideos > 0 && (
                    <div
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: colors.BACKGROUND_DARK,
                        color: colors.TEXT_PRIMARY,
                        opacity: 0.9,
                      }}
                    >
                      {totalVideos}v
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </>
    </BaseModal>
  );
};
