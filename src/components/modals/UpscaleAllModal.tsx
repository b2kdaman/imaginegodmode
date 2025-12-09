/**
 * Modal component for selecting posts to upscale or like
 */

import React, { useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiCheckboxMarked, mdiCheckboxBlankOutline, mdiLoading } from '@mdi/js';
import { Icon } from '../common/Icon';
import { LikedPost, ThemeColors } from '@/types';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';
import { ProgressBar } from './shared/ProgressBar';
import { SelectionControls } from './shared/SelectionControls';
import { PostGrid, PostGridItem } from './shared/PostGrid';
import { useShiftSelection } from '@/hooks/useShiftSelection';
import { useTranslation } from '@/contexts/I18nContext';

interface UpscaleAllModalProps {
  isOpen: boolean;
  posts: LikedPost[];
  mode: 'upscale' | 'like';
  onClose: () => void;
  onConfirm: (selectedPostIds: string[]) => void;
  getThemeColors: () => ThemeColors;
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
  getThemeColors,
  isProcessing = false,
  processedCount = 0,
  totalCount = 0,
}) => {
  const colors = getThemeColors();
  const { t } = useTranslation();
  const {
    selectedIds,
    toggleSelection,
    selectAll: selectAllIds,
    deselectAll: deselectAllIds,
    setSelectedIds,
  } = useShiftSelection(posts);

  // Select all posts by default when modal opens
  useEffect(() => {
    if (isOpen && posts.length > 0) {
      setSelectedIds(new Set(posts.map((p) => p.id)));
    }
  }, [isOpen, posts, setSelectedIds]);

  const handleSelectAll = () => {
    selectAllIds();
    trackBulkSelectAll(mode);
  };

  const handleDeselectAll = () => {
    deselectAllIds();
    trackBulkDeselectAll(mode);
  };

  const handleConfirm = () => {
    const selectedPostIds = Array.from(selectedIds);
    trackBulkOperationConfirmed(mode, selectedPostIds.length);
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

  const title = mode === 'upscale'
    ? t('modals.upscale.title', { selected: selectedIds.size, total: safePosts.length })
    : t('modals.like.title', { selected: selectedIds.size, total: safePosts.length });

  const confirmButtonText = mode === 'upscale'
    ? t('modals.upscale.actionText', { count: selectedIds.size, plural: selectedIds.size !== 1 ? 's' : '' })
    : t('modals.like.actionText', { count: selectedIds.size, plural: selectedIds.size !== 1 ? 's' : '' });

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
            {isProcessing ? t('common.processing') : t('common.cancel')}
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
            label={t('common.processing')}
            backgroundColor={colors.BACKGROUND_MEDIUM}
            progressColor={colors.SUCCESS}
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
          getBorderColor={(isSelected) => isSelected ? colors.SUCCESS : colors.BORDER}
          colors={colors}
          renderOverlay={(post, isSelected) => (
            <button
              onClick={(e) => toggleSelection(post.id, e)}
              disabled={isProcessing}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2"
              style={{
                backgroundColor: isSelected ? colors.SUCCESS : colors.BACKGROUND_MEDIUM,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              <Icon
                path={isSelected ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
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
