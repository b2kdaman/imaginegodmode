/**
 * Modal component for selecting posts to unlike
 */

import React, { useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiHeartBroken, mdiHeart, mdiLoading } from '@mdi/js';
import { Icon } from '../common/Icon';
import { LikedPost, ThemeColors } from '@/types';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';
import { ProgressBar } from './shared/ProgressBar';
import { SelectionControls } from './shared/SelectionControls';
import { PostGrid, PostGridItem } from './shared/PostGrid';
import { useShiftSelection } from '@/hooks/useShiftSelection';

interface UnlikeModalProps {
  isOpen: boolean;
  posts: LikedPost[];
  onClose: () => void;
  onConfirm: (selectedPostIds: string[]) => void;
  getThemeColors: () => ThemeColors;
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
  const {
    selectedIds,
    toggleSelection,
    selectAll: selectAllIds,
    deselectAll: deselectAllIds,
    clearSelection,
  } = useShiftSelection(posts);

  // Deselect all posts by default when modal opens (but not during processing)
  useEffect(() => {
    if (isOpen && !isProcessing) {
      clearSelection();
    }
  }, [isOpen, isProcessing, clearSelection]);

  const handleSelectAll = () => {
    selectAllIds();
    trackBulkSelectAll('unlike');
  };

  const handleDeselectAll = () => {
    deselectAllIds();
    trackBulkDeselectAll('unlike');
  };

  const handleConfirm = () => {
    const selectedPostIds = Array.from(selectedIds);
    trackBulkOperationConfirmed('unlike', selectedPostIds.length);
    onConfirm(selectedPostIds);
  };

  // Convert LikedPost to PostGridItem
  const safePosts = posts || [];
  const gridItems: PostGridItem[] = safePosts.map(post => ({
    id: post.id,
    thumbnailImageUrl: post.thumbnailImageUrl,
    mediaUrl: post.mediaUrl,
    prompt: post.prompt,
    videoCount: post.childPosts?.filter(cp => cp.mediaType === 'video').length || 0,
  }));

  const title = `Select Posts to Unlike (${selectedIds.size}/${safePosts.length})`;
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
            icon={isProcessing ? mdiLoading : undefined}
            iconClassName={isProcessing ? "animate-spin" : ""}
          >
            {isProcessing ? 'Processing' : 'Cancel'}
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
        {/* Progress Bar */}
        {isProcessing && (
          <ProgressBar
            processedCount={processedCount}
            totalCount={totalCount}
            label="Processing"
            backgroundColor={colors.BACKGROUND_MEDIUM}
            progressColor={colors.DANGER}
            textColor={colors.TEXT_SECONDARY}
          />
        )}

        {/* Selection Controls */}
        {!isProcessing && (
          <SelectionControls
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        )}

        {/* Posts Grid */}
        <PostGrid
          posts={gridItems}
          selectedIds={selectedIds}
          isProcessing={isProcessing}
          onItemClick={toggleSelection}
          getBorderColor={(isSelected) => isSelected ? colors.DANGER : colors.BORDER}
          colors={colors}
          renderOverlay={(post, isSelected) => (
            <button
              onClick={(e) => toggleSelection(post.id, e)}
              disabled={isProcessing}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2"
              style={{
                backgroundColor: isSelected ? colors.DANGER : colors.SUCCESS,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              <Icon
                path={isSelected ? mdiHeartBroken : mdiHeart}
                size={1.5}
                color='#fff'
              />
            </button>
          )}
        />
      </>
    </BaseModal>
  );
};
