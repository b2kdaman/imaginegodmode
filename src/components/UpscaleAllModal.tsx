/**
 * Modal component for selecting posts to upscale or like
 */

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { mdiClose, mdiCheckboxMarked, mdiCheckboxBlankOutline } from '@mdi/js';
import { Icon } from './Icon';
import { LikedPost } from '@/types';

interface UpscaleAllModalProps {
  isOpen: boolean;
  posts: LikedPost[];
  mode: 'upscale' | 'like';
  onClose: () => void;
  onConfirm: (selectedPostIds: string[]) => void;
  onImageClick?: (postId: string) => void;
  getThemeColors: () => any;
  isProcessing?: boolean;
  processedCount?: number;
  totalCount?: number;
}

export const UpscaleAllModal: React.FC<UpscaleAllModalProps> = ({
  isOpen,
  posts,
  mode,
  onClose,
  onConfirm,
  onImageClick,
  getThemeColors,
  isProcessing = false,
  processedCount = 0,
  totalCount = 0,
}) => {
  const colors = getThemeColors();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  // Select all posts by default when modal opens
  useEffect(() => {
    if (isOpen && posts.length > 0) {
      setSelectedIds(new Set(posts.map((p) => p.id)));
    }
  }, [isOpen, posts]);

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

  const handleImageClick = (postId: string) => {
    if (onImageClick) {
      onImageClick(postId);
    }
  };

  const selectAll = () => {
    setSelectedIds(new Set(posts.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
  };

  if (!isOpen) return null;

  const title = mode === 'upscale'
    ? `Select Posts to Upscale (${selectedIds.size}/${posts.length})`
    : `Select Posts to Like (${selectedIds.size}/${posts.length})`;

  const confirmButtonText = mode === 'upscale'
    ? `Upscale ${selectedIds.size} Post${selectedIds.size !== 1 ? 's' : ''}`
    : `Like ${selectedIds.size} Post${selectedIds.size !== 1 ? 's' : ''}`;

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      onClick={isProcessing ? undefined : onClose}
    >
      <div
        className="rounded-t-xl p-4 max-w-2xl w-full mx-4 max-h-[400px] flex flex-col"
        style={{
          backgroundColor: colors.BACKGROUND_DARK,
          border: `1px solid ${colors.BORDER}`,
          boxShadow: `0 8px 32px ${colors.SHADOW}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: colors.TEXT_PRIMARY }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full p-1 transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: colors.TEXT_SECONDARY,
              opacity: isProcessing ? 0.5 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
                e.currentTarget.style.color = colors.TEXT_PRIMARY;
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.TEXT_SECONDARY;
              }
            }}
          >
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>

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
                className="h-full transition-all duration-300"
                style={{
                  width: `${totalCount > 0 ? (processedCount / totalCount) * 100 : 0}%`,
                  backgroundColor: colors.SUCCESS,
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
        <div className="flex-1 overflow-y-auto mb-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {posts.map((post) => {
              const isSelected = selectedIds.has(post.id);
              const imageUrl = post.thumbnailImageUrl || post.mediaUrl;

              return (
                <div
                  key={post.id}
                  className="relative aspect-square rounded-lg overflow-hidden transition-all cursor-pointer"
                  style={{
                    border: `2px solid ${
                      isSelected ? colors.SUCCESS : colors.BORDER
                    }`,
                    opacity: isProcessing ? 0.7 : (isSelected ? 1 : 0.6),
                    pointerEvents: isProcessing ? 'none' : 'auto',
                  }}
                  onClick={() => handleImageClick(post.id)}
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

                  {/* Checkbox Overlay */}
                  <button
                    onClick={(e) => toggleSelection(post.id, e)}
                    disabled={isProcessing}
                    className="absolute bottom-1 right-1 rounded-full p-0.5"
                    style={{
                      backgroundColor: isSelected
                        ? colors.SUCCESS
                        : colors.BACKGROUND_MEDIUM,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Icon
                      path={
                        isSelected
                          ? mdiCheckboxMarked
                          : mdiCheckboxBlankOutline
                      }
                      size={0.7}
                      color={isSelected ? '#fff' : colors.TEXT_SECONDARY}
                    />
                  </button>

                  {/* Video Count Badge (if has child videos) */}
                  {post.childPosts && post.childPosts.length > 0 && (
                    <div
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold"
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
        </div>

        {/* Footer */}
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
      </div>
    </div>
  );
};
