/**
 * Modal component for viewing and re-liking unliked posts from archive
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../inputs/Button';
import { mdiClose, mdiHeart } from '@mdi/js';
import { Icon } from '../common/Icon';
import { UnlikedPost } from '@/utils/storage';

interface UnlikedArchiveModalProps {
  isOpen: boolean;
  posts: UnlikedPost[];
  onClose: () => void;
  onRelike: (selectedPostIds: string[]) => void;
  getThemeColors: () => any;
  isProcessing?: boolean;
  processedCount?: number;
  totalCount?: number;
}

export const UnlikedArchiveModal: React.FC<UnlikedArchiveModalProps> = ({
  isOpen,
  posts,
  onClose,
  onRelike,
  getThemeColors,
  isProcessing = false,
  processedCount = 0,
  totalCount = 0,
}) => {
  const colors = getThemeColors();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

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
    // Toggle selection instead of navigating
    toggleSelection(postId, e);
  };

  const selectAll = () => {
    setSelectedIds(new Set(posts.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleRelike = () => {
    onRelike(Array.from(selectedIds));
  };

  if (!isOpen) return null;

  const title = `Unliked Posts Archive (${posts.length} total)`;
  const relikeButtonText = selectedIds.size > 0
    ? `Re-like ${selectedIds.size} Post${selectedIds.size !== 1 ? 's' : ''}`
    : 'Select posts to re-like';

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      onClick={isProcessing ? undefined : onClose}
    >
      <div
        className="rounded-xl p-6 flex flex-col"
        style={{
          backgroundColor: colors.BACKGROUND_DARK,
          border: `1px solid ${colors.BORDER}`,
          boxShadow: `0 8px 32px ${colors.SHADOW}`,
          width: '90vw',
          maxWidth: '1344px',
          height: '85vh',
          maxHeight: '800px',
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
              <span>Re-liking posts...</span>
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
                  backgroundColor: colors.SUCCESS,
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
              No unliked posts in archive
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
                        isSelected ? colors.SUCCESS : colors.BORDER
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
                          path={mdiHeart}
                          size={2}
                          color={colors.SUCCESS}
                        />
                      </div>
                    )}

                    {/* Unliked Date Badge */}
                    <div
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: colors.BACKGROUND_DARK,
                        color: colors.TEXT_SECONDARY,
                        opacity: 0.9,
                      }}
                    >
                      {formatDate(post.unlikedAt)}
                    </div>

                    {/* Child Post Count Badge */}
                    {post.childPostCount !== undefined && post.childPostCount > 0 && (
                      <div
                        className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: colors.BACKGROUND_DARK,
                          color: colors.TEXT_PRIMARY,
                          opacity: 0.9,
                        }}
                      >
                        {post.childPostCount}v
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end">
          <Button
            onClick={onClose}
            className="text-xs"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Close'}
          </Button>
          {!isProcessing && (
            <Button
              onClick={handleRelike}
              className="text-xs"
              disabled={selectedIds.size === 0}
              icon={mdiHeart}
            >
              {relikeButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
