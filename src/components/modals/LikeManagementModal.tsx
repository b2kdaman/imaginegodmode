/**
 * Unified modal component for managing likes and unliked archive
 * Combines Unlike and UnlikedArchive functionality with tabbed interface
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from '../inputs/Button';
import { mdiHeart, mdiHeartBroken, mdiDownload, mdiUpload, mdiArchive } from '@mdi/js';
import { Icon } from '../common/Icon';
import { LikedPost, ThemeColors } from '@/types';
import { UnlikedPost } from '@/utils/storage';
import { trackBulkSelectAll, trackBulkDeselectAll, trackBulkOperationConfirmed } from '@/utils/analytics';
import { BaseModal } from './BaseModal';
import { SelectionControls } from './shared/SelectionControls';
import { PostGrid, PostGridItem } from './shared/PostGrid';
import { Tabs, Tab } from '../inputs/Tabs';
import { useShiftSelection } from '@/hooks/useShiftSelection';
import { useTranslation } from '@/contexts/I18nContext';

interface LikeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  getThemeColors: () => ThemeColors;

  // Liked Posts Tab
  likedPosts: LikedPost[];
  onUnlike: (selectedPostIds: string[]) => void;

  // Archive Tab
  archivedPosts: UnlikedPost[];
  onRelike: (selectedPostIds: string[]) => void;
  onImportArchive?: (posts: UnlikedPost[]) => void;

  // Optional initial tab
  initialTab?: 'liked' | 'archive';
}

export const LikeManagementModal: React.FC<LikeManagementModalProps> = ({
  isOpen,
  onClose,
  getThemeColors,
  likedPosts,
  onUnlike,
  archivedPosts,
  onRelike,
  onImportArchive,
  initialTab = 'liked',
}) => {
  const { t } = useTranslation();

  // Tab state
  const [activeTab, setActiveTab] = useState<'liked' | 'archive'>(initialTab);

  // Archive-specific state
  const [importError, setImportError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort archive posts by date (newest first)
  const sortedArchivedPosts = useMemo(
    () => [...archivedPosts].sort((a, b) => b.unlikedAt - a.unlikedAt),
    [archivedPosts]
  );

  // Independent selection states for each tab
  const likedSelection = useShiftSelection(likedPosts);
  const archiveSelection = useShiftSelection(sortedArchivedPosts);

  // Clear all selections and errors when modal opens
  useEffect(() => {
    if (isOpen) {
      likedSelection.clearSelection();
      archiveSelection.clearSelection();
      if (importError) {
        setImportError('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, importError]);

  // Update active tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen && activeTab !== initialTab) {
      setActiveTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTab]);

  // --- Liked Posts Tab Handlers ---

  const handleSelectAllLiked = () => {
    likedSelection.selectAll();
    trackBulkSelectAll('unlike');
  };

  const handleDeselectAllLiked = () => {
    likedSelection.deselectAll();
    trackBulkDeselectAll('unlike');
  };

  const handleUnlike = () => {
    const selectedPostIds = Array.from(likedSelection.selectedIds);
    trackBulkOperationConfirmed('unlike', selectedPostIds.length);
    onUnlike(selectedPostIds);
  };

  // --- Archive Tab Handlers ---

  const handleSelectAllArchive = () => {
    archiveSelection.selectAll();
    trackBulkSelectAll('relike');
  };

  const handleDeselectAllArchive = () => {
    archiveSelection.deselectAll();
    trackBulkDeselectAll('relike');
  };

  const handleRelike = () => {
    const selectedPostIds = Array.from(archiveSelection.selectedIds);
    trackBulkOperationConfirmed('relike', selectedPostIds.length);
    onRelike(selectedPostIds);
  };

  // Format date for archive badges
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
      posts: archivedPosts,
      count: archivedPosts.length,
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
    if (!file) {
      return;
    }

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
        if (onImportArchive) {
          onImportArchive(data.posts);
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

  // --- Tab Configuration ---

  const tabs: Tab[] = [
    {
      id: 'liked',
      label: t('modals.likeManagement.tabs.liked'),
      icon: mdiHeart,
      badge: likedPosts.length,
    },
    {
      id: 'archive',
      label: t('modals.likeManagement.tabs.archive'),
      icon: mdiArchive,
      badge: archivedPosts.length,
    },
  ];

  // --- Data Transformation ---

  const likedGridItems: PostGridItem[] = likedPosts.map(post => ({
    id: post.id,
    thumbnailImageUrl: post.thumbnailImageUrl,
    mediaUrl: post.mediaUrl,
    prompt: post.prompt,
    videoCount: post.childPosts?.filter(cp => cp.mediaType === 'video').length || 0,
  }));

  const archiveGridItems: PostGridItem[] = sortedArchivedPosts.map(post => ({
    id: post.id,
    thumbnailImageUrl: post.thumbnailImageUrl,
    mediaUrl: post.mediaUrl,
    prompt: post.prompt,
    videoCount: post.childPostCount,
  }));

  // --- Dynamic Title and Button Text ---

  const getTitle = () => {
    if (activeTab === 'liked') {
      return t('modals.unlike.title', {
        selected: likedSelection.selectedIds.size,
        total: likedPosts.length
      });
    } else {
      return t('modals.unlikedArchive.title', { total: archivedPosts.length });
    }
  };

  const getActionButtonText = () => {
    if (activeTab === 'liked') {
      return t('modals.unlike.actionText', {
        count: likedSelection.selectedIds.size,
        plural: likedSelection.selectedIds.size !== 1 ? 's' : ''
      });
    } else {
      return archiveSelection.selectedIds.size > 0
        ? t('modals.unlikedArchive.actionText', {
            count: archiveSelection.selectedIds.size,
            plural: archiveSelection.selectedIds.size !== 1 ? 's' : ''
          })
        : t('modals.unlikedArchive.selectPrompt');
    }
  };

  // --- Render Content Based on Active Tab ---

  const renderTabContent = () => {
    if (activeTab === 'liked') {
      // Liked Posts Tab Content
      return (
        <>
          <SelectionControls
            onSelectAll={handleSelectAllLiked}
            onDeselectAll={handleDeselectAllLiked}
          />

          <PostGrid
            posts={likedGridItems}
            selectedIds={likedSelection.selectedIds}
            isProcessing={false}
            onItemClick={likedSelection.toggleSelection}
            getBorderColor={(isSelected) => isSelected ? 'var(--theme-danger)' : 'var(--theme-border)'}
            colors={getThemeColors()}
            renderOverlay={(post, isSelected) => (
              <>
                {/* Colored overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: isSelected
                      ? 'color-mix(in srgb, var(--theme-danger) 20%, transparent)'
                      : 'rgba(0, 0, 0, 0.5)',
                  }}
                />
                {/* Icon button */}
                <button
                  onClick={(e) => likedSelection.toggleSelection(post.id, e)}
                  className="absolute bottom-2 right-2 rounded-full p-2"
                  style={{
                    backgroundColor: isSelected ? 'var(--theme-danger)' : 'var(--theme-success)',
                    cursor: 'pointer',
                    opacity: 0.5,
                  }}
                >
                  <Icon
                    path={isSelected ? mdiHeartBroken : mdiHeart}
                    size={1.5}
                    color='#fff'
                  />
                </button>
              </>
            )}
          />
        </>
      );
    } else {
      // Archive Tab Content
      return (
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
              className="mb-3 p-2 rounded text-xs bg-theme-bg-medium text-theme-danger border border-theme-danger"
            >
              {importError}
            </div>
          )}

          <SelectionControls
            onSelectAll={handleSelectAllArchive}
            onDeselectAll={handleDeselectAllArchive}
          />

          {sortedArchivedPosts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-theme-text-secondary">
              {t('modals.unlikedArchive.noPostsMessage')}
            </div>
          ) : (
            <PostGrid
              posts={archiveGridItems}
              selectedIds={archiveSelection.selectedIds}
              isProcessing={false}
              onItemClick={archiveSelection.toggleSelection}
              getBorderColor={(isSelected) => isSelected ? 'var(--theme-success)' : 'var(--theme-border)'}
              colors={getThemeColors()}
              renderOverlay={(_post, isSelected) => (
                <>
                  {/* Colored overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: isSelected
                        ? 'color-mix(in srgb, var(--theme-success) 20%, transparent)'
                        : 'rgba(0, 0, 0, 0.5)',
                    }}
                  />
                  {/* Heart icon when selected */}
                  {isSelected && (
                    <div className="absolute bottom-2 right-2 pointer-events-none" style={{ opacity: 0.5 }}>
                      <Icon
                        path={mdiHeart}
                        size={2}
                        color="var(--theme-success)"
                      />
                    </div>
                  )}
                </>
              )}
              renderBadges={(post) => {
                const unlikedPost = sortedArchivedPosts.find(p => p.id === post.id);
                if (!unlikedPost) {
                  return null;
                }

                return (
                  <div
                    className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-theme-bg-dark text-theme-text-secondary"
                    style={{ opacity: 0.9 }}
                  >
                    {formatDate(unlikedPost.unlikedAt)}
                  </div>
                );
              }}
            />
          )}
        </>
      );
    }
  };

  // --- Footer with Conditional Buttons ---

  const renderFooter = () => {
    return (
      <div className="flex gap-2 justify-between">
        {/* Left side - Archive-only buttons */}
        {activeTab === 'archive' ? (
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              className="text-xs"
              disabled={archivedPosts.length === 0}
              icon={mdiDownload}
            >
              {t('common.export')}
            </Button>
            {onImportArchive && (
              <Button
                onClick={handleImportClick}
                className="text-xs"
                icon={mdiUpload}
              >
                {t('common.import')}
              </Button>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Right side - Common buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onClose}
            className="text-xs"
          >
            {t('common.close')}
          </Button>
          <Button
            onClick={activeTab === 'liked' ? handleUnlike : handleRelike}
            className="text-xs"
            disabled={
              activeTab === 'liked'
                ? likedSelection.selectedIds.size === 0
                : archiveSelection.selectedIds.size === 0
            }
            icon={activeTab === 'liked' ? undefined : mdiHeart}
          >
            {getActionButtonText()}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      title={getTitle()}
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
      footer={renderFooter()}
    >
      <>
        {/* Tabs Navigation */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as 'liked' | 'archive')}
        />

        {/* Tab Content */}
        {renderTabContent()}
      </>
    </BaseModal>
  );
};
