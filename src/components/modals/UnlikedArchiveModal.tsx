/**
 * Modal component for viewing and re-liking unliked posts from archive
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../inputs/Button';
import { mdiHeart, mdiLoading, mdiDownload, mdiUpload } from '@mdi/js';
import { Icon } from '../common/Icon';
import { UnlikedPost } from '@/utils/storage';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';
import { ProgressBar } from './shared/ProgressBar';
import { SelectionControls } from './shared/SelectionControls';
import { PostGrid, PostGridItem } from './shared/PostGrid';
import { useShiftSelection } from '@/hooks/useShiftSelection';

interface UnlikedArchiveModalProps {
  isOpen: boolean;
  posts: UnlikedPost[];
  onClose: () => void;
  onRelike: (selectedPostIds: string[]) => void;
  onImport?: (posts: UnlikedPost[]) => void;
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
  onImport,
  getThemeColors,
  isProcessing = false,
  processedCount = 0,
  totalCount = 0,
}) => {
  const colors = getThemeColors();
  const [importError, setImportError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort posts by date (newest first)
  const sortedPosts = [...posts].sort((a, b) => b.unlikedAt - a.unlikedAt);

  const {
    selectedIds,
    toggleSelection,
    selectAll: selectAllIds,
    deselectAll: deselectAllIds,
    clearSelection,
  } = useShiftSelection(sortedPosts);

  // Clear selection when modal closes after processing completes
  useEffect(() => {
    if (!isOpen && !isProcessing) {
      clearSelection();
    }
  }, [isOpen, isProcessing, clearSelection]);

  const handleSelectAll = () => {
    selectAllIds();
    trackBulkSelectAll('relike');
  };

  const handleDeselectAll = () => {
    deselectAllIds();
    trackBulkDeselectAll('relike');
  };

  const handleRelike = () => {
    const selectedPostIds = Array.from(selectedIds);
    trackBulkOperationConfirmed('relike', selectedPostIds.length);
    onRelike(selectedPostIds);
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Export archive to JSON
  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      posts: posts,
      count: posts.length,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `unliked-archive-${dateStr}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import archive from JSON file
  const handleImportClick = () => {
    setImportError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Validate structure
        if (!data.posts || !Array.isArray(data.posts)) {
          setImportError('Invalid file format: missing posts array');
          return;
        }

        // Validate each post
        for (const post of data.posts) {
          if (!post.id || typeof post.id !== 'string') {
            setImportError('Invalid file format: post missing id field');
            return;
          }
          if (post.prompt === undefined || typeof post.prompt !== 'string') {
            setImportError('Invalid file format: post missing prompt field');
            return;
          }
          if (!post.mediaUrl || typeof post.mediaUrl !== 'string') {
            setImportError('Invalid file format: post missing mediaUrl field');
            return;
          }
          if (post.unlikedAt === undefined || typeof post.unlikedAt !== 'number') {
            setImportError('Invalid file format: post missing unlikedAt field');
            return;
          }
        }

        // Call import handler
        if (onImport) {
          onImport(data.posts);
          setImportError('');
        }
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to parse file');
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read file');
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Convert UnlikedPost to PostGridItem
  const gridItems: PostGridItem[] = sortedPosts.map(post => ({
    id: post.id,
    thumbnailImageUrl: post.thumbnailImageUrl,
    mediaUrl: post.mediaUrl,
    prompt: post.prompt,
    videoCount: post.childPostCount,
  }));

  const title = `Unliked Posts Archive (${posts.length} total)`;
  const relikeButtonText = selectedIds.size > 0
    ? `Re-like ${selectedIds.size} Post${selectedIds.size !== 1 ? 's' : ''}`
    : 'Select posts to re-like';

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
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              className="text-xs"
              disabled={isProcessing || posts.length === 0}
              icon={mdiDownload}
            >
              Export
            </Button>
            {onImport && (
              <Button
                onClick={handleImportClick}
                className="text-xs"
                disabled={isProcessing}
                icon={mdiUpload}
              >
                Import
              </Button>
            )}
          </div>
          <div className="flex gap-2">
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
      }
    >
      <>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Import Error Message */}
        {importError && (
          <div
            className="mb-3 p-2 rounded text-xs"
            style={{
              backgroundColor: colors.BACKGROUND_MEDIUM,
              color: colors.DANGER || '#ff4444',
              border: `1px solid ${colors.DANGER || '#ff4444'}`,
            }}
          >
            {importError}
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <ProgressBar
            processedCount={processedCount}
            totalCount={totalCount}
            label="Re-liking posts"
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
        {sortedPosts.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-sm"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            No unliked posts in archive
          </div>
        ) : (
          <PostGrid
            posts={gridItems}
            selectedIds={selectedIds}
            isProcessing={isProcessing}
            onItemClick={toggleSelection}
            getBorderColor={(isSelected) => isSelected ? colors.SUCCESS : colors.BORDER}
            colors={colors}
            renderOverlay={(_post, isSelected) => (
              isSelected ? (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                  <Icon
                    path={mdiHeart}
                    size={2}
                    color={colors.SUCCESS}
                  />
                </div>
              ) : null
            )}
            renderBadges={(post) => {
              const unlikedPost = sortedPosts.find(p => p.id === post.id);
              if (!unlikedPost) return null;

              return (
                <div
                  className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                  style={{
                    backgroundColor: colors.BACKGROUND_DARK,
                    color: colors.TEXT_SECONDARY,
                    opacity: 0.9,
                  }}
                >
                  {formatDate(unlikedPost.unlikedAt)}
                </div>
              );
            }}
          />
        )}
      </>
    </BaseModal>
  );
};
