/**
 * Modal component for selecting posts to download all media
 */

import React, { useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiDownload } from '@mdi/js';
import { LikedPost, ThemeColors } from '@/types';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';
import { SelectionControls } from './shared/SelectionControls';
import { PostGrid, PostGridItem } from './shared/PostGrid';
import { useShiftSelection } from '@/hooks/useShiftSelection';
import { useTranslation } from '@/contexts/I18nContext';

interface DownloadAllModalProps {
  isOpen: boolean;
  posts: LikedPost[];
  onClose: () => void;
  onConfirm: (selectedPostIds: string[]) => void;
  getThemeColors: () => ThemeColors;
}

export const DownloadAllModal: React.FC<DownloadAllModalProps> = ({
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
    trackBulkSelectAll('download');
  };

  const handleDeselectAll = () => {
    deselectAllIds();
    trackBulkDeselectAll('download');
  };

  const handleConfirm = () => {
    const selectedPostIds = Array.from(selectedIds);
    trackBulkOperationConfirmed('download', selectedPostIds.length);
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

  const title = t('modals.download.title', { selected: selectedIds.size, total: safePosts.length });
  const confirmButtonText = t('modals.download.actionText', {
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
            icon={mdiDownload}
          >
            {confirmButtonText}
          </Button>
        </div>
      }
    >
      <>
        {/* Warning Message */}
        <div
          className="mb-3 p-3 rounded text-xs"
          style={{
            backgroundColor: `${colors.BACKGROUND_MEDIUM}`,
            color: colors.TEXT_SECONDARY,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          {t('modals.download.warningMessage')}
        </div>

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
          getBorderColor={(isSelected) => isSelected ? colors.SUCCESS : colors.BORDER}
          colors={colors}
          renderOverlay={(_post, isSelected) => (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: isSelected
                  ? `${colors.SUCCESS}33`
                  : 'rgba(0, 0, 0, 0.5)',
              }}
            />
          )}
        />
      </>
    </BaseModal>
  );
};
