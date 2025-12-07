/**
 * Base component for grid-based selection modals
 *
 * Consolidates the pattern used by DeleteModal, UnlikeModal, UpscaleAllModal, UnlikedArchiveModal
 */

import { useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { ProgressBar } from './ProgressBar';
import { SelectionControls } from './SelectionControls';
import { PostGrid, PostGridItem } from './PostGrid';
import { BulkActionFooter } from '../composition/ModalFooterButtons';
import { WarningBanner } from '../composition/WarningBanner';
import { useShiftSelection } from '@/hooks/useShiftSelection';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { mdiAlertCircle } from '@mdi/js';
import type { GridSelectionModalProps, GridItem } from '../types/modal.types';

/**
 * Grid selection modal base component
 *
 * Features:
 * - Built-in shift-selection support
 * - Progress tracking during processing
 * - Select All / Deselect All controls
 * - Configurable grid item rendering
 * - Warning banner support
 * - Analytics tracking
 */
export function GridSelectionModal<T extends GridItem>({
  isOpen,
  posts,
  title,
  onClose,
  onConfirm,
  getThemeColors,
  renderOverlay,
  renderBadges,
  getBorderColor,
  isProcessing = false,
  processedCount = 0,
  totalCount = 0,
  actionText,
  actionVariant = 'danger',
  warningMessage,
  defaultSelectAll = false,
  extraFooterButtons,
  headerExtra,
  onImageClick,
}: GridSelectionModalProps<T>) {
  const colors = getThemeColors();
  const {
    selectedIds,
    toggleSelection,
    selectAll: selectAllIds,
    deselectAll: deselectAllIds,
    clearSelection,
  } = useShiftSelection(posts);

  // Initialize selection when modal opens
  useEffect(() => {
    if (isOpen && !isProcessing) {
      if (defaultSelectAll) {
        selectAllIds();
      } else {
        clearSelection();
      }
    }
  }, [isOpen, isProcessing, defaultSelectAll, selectAllIds, clearSelection]);

  const handleSelectAll = () => {
    selectAllIds();
    trackBulkSelectAll(actionText.toLowerCase());
  };

  const handleDeselectAll = () => {
    deselectAllIds();
    trackBulkDeselectAll(actionText.toLowerCase());
  };

  const handleConfirm = () => {
    const selectedPostIds = Array.from(selectedIds);
    trackBulkOperationConfirmed(actionText.toLowerCase(), selectedPostIds.length);
    onConfirm(selectedPostIds);
  };

  // Convert posts to PostGridItem format
  const safePosts = posts || [];
  const gridItems: PostGridItem[] = safePosts.map((post) => ({
    id: post.id,
    thumbnailImageUrl: post.thumbnailImageUrl,
    mediaUrl: post.mediaUrl,
    prompt: post.prompt,
    videoCount: post.videoCount || 0,
  }));

  const dynamicTitle = title.includes('{count}')
    ? title.replace('{count}', `${selectedIds.size}/${safePosts.length}`)
    : title;

  return (
    <BaseModal
      isOpen={isOpen}
      title={dynamicTitle}
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
      headerExtra={headerExtra}
      footer={
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-2">
            {extraFooterButtons}
          </div>
          <BulkActionFooter
            onClose={onClose}
            onConfirm={handleConfirm}
            selectedCount={selectedIds.size}
            actionText={actionText}
            actionVariant={actionVariant}
            isProcessing={isProcessing}
            processedCount={processedCount}
            totalCount={totalCount}
            getThemeColors={getThemeColors}
          />
        </div>
      }
    >
      <>
        {/* Warning Banner */}
        {!isProcessing && warningMessage && (
          <WarningBanner
            variant={actionVariant}
            icon={mdiAlertCircle}
            message={warningMessage}
            getThemeColors={getThemeColors}
          />
        )}

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
          onItemClick={onImageClick || toggleSelection}
          getBorderColor={getBorderColor}
          colors={colors}
          renderOverlay={(gridPost, isSelected) => {
            // Find the original post to pass to renderOverlay
            const originalPost = safePosts.find((p) => p.id === gridPost.id);
            return originalPost ? renderOverlay(originalPost, isSelected) : null;
          }}
          renderBadges={renderBadges ? (gridPost) => {
            const originalPost = safePosts.find((p) => p.id === gridPost.id);
            return originalPost ? renderBadges(originalPost) : null;
          } : undefined}
        />
      </>
    </BaseModal>
  );
}
