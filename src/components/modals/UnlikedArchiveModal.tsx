/**
 * Modal component for viewing and re-liking unliked posts from archive
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../inputs/Button';
import { mdiHeart, mdiLoading, mdiDownload, mdiUpload } from '@mdi/js';
import { Icon } from '../common/Icon';
import { UnlikedPost } from '@/utils/storage';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [importError, setImportError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort posts by date (newest first)
  const sortedPosts = [...posts].sort((a, b) => b.unlikedAt - a.unlikedAt);

  // Clear selection when modal closes after processing completes
  useEffect(() => {
    if (!isOpen && !isProcessing) {
      setSelectedIds(new Set());
    }
  }, [isOpen, isProcessing]);

  const toggleSelection = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const currentIndex = sortedPosts.findIndex((p) => p.id === postId);

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
          newSelected.add(sortedPosts[i].id);
        } else {
          newSelected.delete(sortedPosts[i].id);
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
    setSelectedIds(new Set(sortedPosts.map((p) => p.id)));
    trackBulkSelectAll('relike');
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
    trackBulkDeselectAll('relike');
  };

  const handleRelike = () => {
    const selectedPostIds = Array.from(selectedIds);
    trackBulkOperationConfirmed('relike', selectedPostIds.length);
    onRelike(selectedPostIds);
  };

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

    // Format: unliked-archive-YYYY-MM-DD.json
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

        // Validate each post (only check required fields)
        for (const post of data.posts) {
          if (!post.id || typeof post.id !== 'string') {
            setImportError('Invalid file format: post missing id field');
            return;
          }
          if (!post.prompt || typeof post.prompt !== 'string') {
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

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

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

        {/* Progress Bar (shown when processing) */}
        {isProcessing && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1 items-center" style={{ color: colors.TEXT_SECONDARY }}>
              <span className="flex items-center gap-1">
                <Icon path={mdiLoading} size={0.6} className="animate-spin" />
                Re-liking posts
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
          {sortedPosts.length === 0 ? (
            <div
              className="flex items-center justify-center h-full text-sm"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              No unliked posts in archive
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {sortedPosts.map((post) => {
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

      </>
    </BaseModal>
  );
};
