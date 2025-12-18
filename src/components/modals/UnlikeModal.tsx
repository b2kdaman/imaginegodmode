/**
 * Modal component for selecting posts to unlike
 */

import React, { useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiHeartBroken, mdiHeart } from '@mdi/js';
import { Icon } from '../common/Icon';
import { LikedPost, ThemeColors } from '@/types';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';
import { SelectionControls } from './shared/SelectionControls';
import { PostGrid, PostGridItem } from './shared/PostGrid';
import { useShiftSelection } from '@/hooks/useShiftSelection';
import { useTranslation } from '@/contexts/I18nContext';

interface UnlikeModalProps {
  isOpen: boolean;
  posts: LikedPost[];
  onClose: () => void;
  onConfirm: (selectedPostIds: string[]) => void;
  getThemeColors: () => ThemeColors;
}

export const UnlikeModal: React.FC<UnlikeModalProps> = ({
  isOpen,
  posts,
  onClose,
  onConfirm,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const { t } = useTranslation();
  const {
    selectedIds,
    toggleSelection,
    selectAll: selectAllIds,
    deselectAll: deselectAllIds,
    clearSelection,
  } = useShiftSelection(posts);

  // Deselect all posts by default when modal opens
  useEffect(() => {
    if (isOpen) {
      clearSelection();
    }
  }, [isOpen, clearSelection]);

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

  const title = t('modals.unlike.title', {
    selected: selectedIds.size,
    total: safePosts.length
  });
  const confirmButtonText = t('modals.unlike.actionText', {
    count: selectedIds.size,
    plural: selectedIds.size !== 1 ? 's' : ''
  });

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
      closeOnOverlayClick={true}
      disableClose={false}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            onClick={onClose}
            className="text-xs"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            className="text-xs"
            disabled={selectedIds.size === 0}
          >
            {confirmButtonText}
          </Button>
        </div>
      }
    >
      <>
        {/* Selection Controls */}
        <SelectionControls
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />

        {/* Posts Grid */}
        <PostGrid
          posts={gridItems}
          selectedIds={selectedIds}
          isProcessing={false}
          onItemClick={toggleSelection}
          getBorderColor={(isSelected) => isSelected ? colors.DANGER : colors.BORDER}
          colors={colors}
          renderOverlay={(post, isSelected) => (
            <button
              onClick={(e) => toggleSelection(post.id, e)}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2"
              style={{
                backgroundColor: isSelected ? colors.DANGER : colors.SUCCESS,
                cursor: 'pointer',
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
