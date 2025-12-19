/**
 * Ops and media controls view component
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useMediaStore } from '@/store/useMediaStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useJobQueueStore } from '@/store/useJobQueueStore';
import { usePostsStore } from '@/store/usePostsStore';
import { useUserStore } from '@/store/useUserStore';
import { getPostIdFromUrl } from '@/utils/helpers';
import { fetchPost } from '@/utils/messaging';
import { processPostData } from '@/utils/mediaProcessor';
import { Button } from '../inputs/Button';
import { Icon } from '../common/Icon';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { mdiDownload, mdiImageSizeSelectLarge, mdiCheckCircle, mdiFormatListBulletedSquare, mdiHeart, mdiLoading /*, mdiDelete */ } from '@mdi/js';
import { useUrlWatcher } from '@/hooks/useUrlWatcher';
// import { useBulkDelete } from '@/hooks/useBulkDelete';
import { useLikedPostsLoader } from '@/hooks/useLikedPostsLoader';
import { trackMediaDownloaded, trackModalOpened, trackModalClosed } from '@/utils/analytics';
import { UpscaleAllModal } from '../modals/UpscaleAllModal';
import { LikeManagementModal } from '../modals/LikeManagementModal';
import { DownloadAllModal } from '../modals/DownloadAllModal';
// import { DeleteModal } from '../modals/DeleteModal';
import { UnlikedPost, getUnlikedPosts, addUnlikedPosts } from '@/utils/storage';
import { STATUS_MESSAGES, LOG_PREFIX } from '@/constants/opsView';

export const OpsView: React.FC = () => {
  const {
    urls,
    videoIdsToUpscale,
    hdVideoCount,
    statusText,
    setMediaUrls,
    setVideoIdsToUpscale,
    setHdVideoCount,
    setStatusText,
  } = useMediaStore();
  const { getThemeColors, listLimit } = useSettingsStore();
  const { addJob, isProcessing: isQueueProcessing } = useJobQueueStore();
  const { setPosts, setCurrentPostId, ensureCurrentPostInList } = usePostsStore();
  const { userId } = useUserStore();
  const colors = getThemeColors();

  const [postId, setPostId] = useState<string | null>(null);
  const [isUpscaleAllModalOpen, setIsUpscaleAllModalOpen] = useState(false);
  const [isDownloadAllModalOpen, setIsDownloadAllModalOpen] = useState(false);
  const [isLikeManagementModalOpen, setIsLikeManagementModalOpen] = useState(false);
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [unlikedPosts, setUnlikedPosts] = useState<UnlikedPost[]>([]);

  // Custom hooks
  const {
    likedPosts,
    isLoading: isLoadingLikedPosts,
    loadLikedPosts,
  } = useLikedPostsLoader(setStatusText);

  // Note: useBulkUnlike and useBulkRelike are no longer needed
  // Unlike/Relike operations now use the job queue system

  // const {
  //   isProcessing: isProcessingDeletes,
  //   processedCount: processedDeletesCount,
  //   totalCount: totalDeletesCount,
  //   processBulkDelete,
  // } = useBulkDelete(setStatusText);

  // Fetch post data
  const handleFetchPost = useCallback(async () => {
    const currentPostId = getPostIdFromUrl();
    setPostId(currentPostId);
    setCurrentPostId(currentPostId); // Update posts store with current post ID
    console.log(`${LOG_PREFIX} Post ID:`, currentPostId);

    if (!currentPostId) {
      return;
    }

    setStatusText(STATUS_MESSAGES.FETCHING);
    console.log(`${LOG_PREFIX} Fetching post:`, currentPostId);

    const response = await fetchPost(currentPostId);
    console.log(`${LOG_PREFIX} Fetch response:`, response);

    if (response.success && response.data) {
      const processed = processPostData(response.data);
      console.log(`${LOG_PREFIX} Processed data:`, processed);

      // Ensure current post is in the posts list for navigation
      if (response.data?.post) {
        ensureCurrentPostInList(response.data.post);
      }

      setMediaUrls(processed.mediaUrls);
      setVideoIdsToUpscale(processed.videosToUpscale);
      setHdVideoCount(processed.hdVideoCount);
      setStatusText(STATUS_MESSAGES.FOUND_MEDIA(processed.urls.length, processed.hdVideoCount));
    } else {
      console.error(`${LOG_PREFIX} Fetch failed:`, response);
      setStatusText(STATUS_MESSAGES.FETCH_FAILED);
    }
  }, [setMediaUrls, setVideoIdsToUpscale, setHdVideoCount, setStatusText, setCurrentPostId, ensureCurrentPostInList]);

  // Watch for URL changes and refetch data
  useUrlWatcher(handleFetchPost);

  // Track list limit changes to refetch data
  const [lastListLimit, setLastListLimit] = useState(listLimit);

  // Auto-fetch on mount
  useEffect(() => {
    handleFetchPost();
    // Load liked posts on mount to populate posts store for navigation
    loadLikedPosts().then((posts) => setPosts(posts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when list limit changes and view becomes active
  useEffect(() => {
    if (lastListLimit !== listLimit) {
      setLastListLimit(listLimit);
      // Refetch liked posts with new limit
      loadLikedPosts().then((posts) => setPosts(posts));
    }
  }, [listLimit, lastListLimit, loadLikedPosts, setPosts]);

  // Download media - create download job
  const handleDownload = () => {
    if (urls.length === 0) {
      setStatusText('No media to download');
      return;
    }

    if (!postId) {
      setStatusText('No post ID found');
      return;
    }

    // Extract filename from URL for each item
    const downloadItems = urls.map((item) => {
      const urlParts = item.url.split('/');
      const filenameWithQuery = urlParts[urlParts.length - 1];
      const filename = filenameWithQuery.split('?')[0] || `media_${Date.now()}`;
      return {
        url: item.url,
        filename,
      };
    });

    // Create download job - will auto-start processing
    addJob({
      type: 'download',
      totalItems: downloadItems.length,
      data: {
        type: 'download',
        postIds: [postId],
        items: downloadItems,
      },
    });
    setStatusText(`Added download job: ${urls.length} file${urls.length === 1 ? '' : 's'}`);
    trackMediaDownloaded(urls.length, 'mixed');

    // Clear local media URLs since they're now in queue
    setMediaUrls([]);
  };

  // Add videos to upscale job
  const handleUpscale = () => {
    if (videoIdsToUpscale.length === 0) {
      setStatusText(STATUS_MESSAGES.NO_VIDEOS);
      return;
    }

    if (!postId) {
      setStatusText(STATUS_MESSAGES.NO_POST_ID);
      return;
    }

    // Create upscale job - will auto-start processing
    addJob({
      type: 'upscale',
      totalItems: videoIdsToUpscale.length,
      data: {
        type: 'upscale',
        postIds: [postId],
        videoIds: videoIdsToUpscale,
      },
    });
    setStatusText(`Added upscale job: ${videoIdsToUpscale.length} video${videoIdsToUpscale.length === 1 ? '' : 's'}`);

    // Clear local upscale list since they're now in job
    setVideoIdsToUpscale([]);
  };

  // Fetch liked posts for Upscale All
  const handleUpscaleAllClick = async () => {
    const posts = await loadLikedPosts();
    setPosts(posts);
    if (posts.length > 0) {
      setIsUpscaleAllModalOpen(true);
      trackModalOpened('upscale_all');
    }
  };

  // Handle bulk upscale from modal - creates processing job
  const handleBulkUpscale = async (selectedPostIds: string[]) => {
    setIsUpscaleAllModalOpen(false);

    // Create processing job that will fetch posts and create upscale job
    addJob({
      type: 'process-for-upscale',
      totalItems: selectedPostIds.length,
      data: {
        type: 'process-for-upscale',
        postIds: selectedPostIds,
      },
    });

    setStatusText(`Added processing job: ${selectedPostIds.length} post${selectedPostIds.length === 1 ? '' : 's'}`);
  };

  // Fetch liked posts for Download All
  const handleDownloadAllClick = async () => {
    const posts = await loadLikedPosts();
    setPosts(posts);
    if (posts.length > 0) {
      setIsDownloadAllModalOpen(true);
      trackModalOpened('download_all');
    }
  };

  // Handle bulk download from modal - creates download job
  const handleBulkDownload = async (selectedPostIds: string[]) => {
    setIsDownloadAllModalOpen(false);

    // Get the selected posts
    const selectedPosts = likedPosts.filter((post) => selectedPostIds.includes(post.id));

    // Collect all media URLs from selected posts
    const downloadItems: { url: string; filename: string }[] = [];

    for (const post of selectedPosts) {
      // Add main media
      if (post.mediaUrl) {
        const urlParts = post.mediaUrl.split('/');
        const filenameWithQuery = urlParts[urlParts.length - 1];
        const filename = filenameWithQuery.split('?')[0] || `media_${post.id}`;
        downloadItems.push({
          url: post.mediaUrl,
          filename,
        });
      }

      // Add child posts (videos)
      if (post.childPosts && post.childPosts.length > 0) {
        for (const childPost of post.childPosts) {
          if (childPost.mediaUrl) {
            const urlParts = childPost.mediaUrl.split('/');
            const filenameWithQuery = urlParts[urlParts.length - 1];
            const filename = filenameWithQuery.split('?')[0] || `media_${childPost.id}`;
            downloadItems.push({
              url: childPost.mediaUrl,
              filename,
            });
          }
        }
      }
    }

    // Create download job
    if (downloadItems.length > 0) {
      addJob({
        type: 'download',
        totalItems: downloadItems.length,
        data: {
          type: 'download',
          postIds: selectedPostIds,
          items: downloadItems,
        },
      });
      setStatusText(`Added download job: ${downloadItems.length} file${downloadItems.length === 1 ? '' : 's'} from ${selectedPostIds.length} post${selectedPostIds.length === 1 ? '' : 's'}`);
      trackMediaDownloaded(downloadItems.length, 'mixed');
    }
  };

  // Handle manage likes button click - opens unified modal
  const handleManageLikesClick = async () => {
    const liked = await loadLikedPosts();
    const archived = await getUnlikedPosts(userId ?? undefined);
    setPosts(liked);
    setUnlikedPosts(archived);
    if (liked.length > 0 || archived.length > 0) {
      setIsLikeManagementModalOpen(true);
      trackModalOpened('like_management');
    }
  };

  // Handle bulk unlike from modal - creates an unlike job
  const handleBulkUnlike = async (selectedPostIds: string[]) => {
    setIsLikeManagementModalOpen(false);

    // Get the full post data for the selected posts
    const selectedPosts = likedPosts.filter((post) => selectedPostIds.includes(post.id));

    // Create unlike job
    addJob({
      type: 'unlike',
      totalItems: selectedPostIds.length,
      data: {
        type: 'unlike',
        postIds: selectedPostIds,
        posts: selectedPosts,
      },
    });

    setStatusText(`Added unlike job: ${selectedPostIds.length} post${selectedPostIds.length === 1 ? '' : 's'}`);
  };

  // Handle re-like from archive - creates a relike job
  const handleRelikeFromArchive = async (postIds: string[]) => {
    setIsLikeManagementModalOpen(false);

    // Create relike job
    addJob({
      type: 'relike',
      totalItems: postIds.length,
      data: {
        type: 'relike',
        postIds,
      },
    });

    setStatusText(`Added relike job: ${postIds.length} post${postIds.length === 1 ? '' : 's'}`);
  };

  // Handle import archive
  const handleImportArchive = async (importedPosts: UnlikedPost[]) => {
    await addUnlikedPosts(importedPosts, userId ?? undefined);

    // Refresh the archive list
    const posts = await getUnlikedPosts(userId ?? undefined);
    setUnlikedPosts(posts);

    setStatusText(`Imported ${importedPosts.length} posts to archive`);
    setTimeout(() => setStatusText(''), 3000);
  };

  // // Handle delete button click - HIDDEN FOR NOW
  // const handleDeleteClick = async () => {
  //   const posts = await loadLikedPosts();
  //   setPosts(posts);
  //   if (posts.length > 0) {
  //     setIsDeleteModalOpen(true);
  //     trackModalOpened('delete_posts');
  //   }
  // };

  // // Handle bulk delete from modal - HIDDEN FOR NOW
  // const handleBulkDelete = async (selectedPostIds: string[]) => {
  //   await processBulkDelete(selectedPostIds);
  //   // Modal will close after processing completes
  // };

  // Check if all videos are HD
  const allVideosHD = urls.length > 0 && videoIdsToUpscale.length === 0 && hdVideoCount > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Status text */}
      <div className="text-sm text-center flex items-center justify-center gap-2" style={{ color: colors.TEXT_SECONDARY }}>
        {allVideosHD && (
          <Icon path={mdiCheckCircle} size={0.7} color={colors.SUCCESS} />
        )}
        <span>{statusText}</span>
      </div>


      {/* Media info */}
      {urls.length > 0 && (
        <div
          className="text-xs text-center"
          style={{ color: `${colors.TEXT_SECONDARY}80` }}
        >
          {urls.length} media files • {hdVideoCount} HD videos
        </div>
      )}

      {/* Action buttons - only show if post exists */}
      {postId && (
        <div className="flex gap-2">
          <Button
            onClick={handleUpscale}
            icon={mdiImageSizeSelectLarge}
            disabled={videoIdsToUpscale.length === 0}
            className="flex-1"
            tooltip={isQueueProcessing ? 'Add to upscale queue' : 'Upscale videos to HD quality'}
          >
            {isQueueProcessing ? 'Add to Queue' : 'Upscale'}
          </Button>

          <Button
            onClick={handleDownload}
            icon={mdiDownload}
            disabled={urls.length === 0 || videoIdsToUpscale.length > 0}
            className="flex-1"
            tooltip={
              videoIdsToUpscale.length > 0
                ? 'Upscale all videos to HD first'
                : 'Download all media files'
            }
          >
            Download
          </Button>
        </div>
      )}

      {/* Bulk Actions Panel - Modern Glassy Design */}
      <CollapsibleSection
        title="Bulk Actions"
        className="mt-4 rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        {/* Safe Actions Group */}
        <div className="flex flex-col gap-2 mb-3 mt-3">
          <Button
            onClick={handleUpscaleAllClick}
            icon={isLoadingLikedPosts ? mdiLoading : mdiFormatListBulletedSquare}
            iconClassName={isLoadingLikedPosts ? "animate-spin" : ""}
            disabled={isLoadingLikedPosts}
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            tooltip="Upscale videos from multiple liked posts"
          >
            {isLoadingLikedPosts ? 'Loading' : 'Upscale All Liked'}
          </Button>

          <Button
            onClick={handleDownloadAllClick}
            icon={isLoadingLikedPosts ? mdiLoading : mdiDownload}
            iconClassName={isLoadingLikedPosts ? "animate-spin" : ""}
            disabled={isLoadingLikedPosts}
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            tooltip="Download all media from multiple liked posts"
          >
            {isLoadingLikedPosts ? 'Loading' : 'Download All Liked'}
          </Button>

          <Button
            onClick={handleManageLikesClick}
            icon={isLoadingLikedPosts ? mdiLoading : mdiHeart}
            iconClassName={isLoadingLikedPosts ? "animate-spin" : ""}
            disabled={isLoadingLikedPosts}
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            tooltip="Unlike posts or re-like from archive"
          >
            {isLoadingLikedPosts ? 'Loading' : 'Manage Likes'}
          </Button>
        </div>

        {/* Divider */}
        {/* <div
          className="h-px my-3"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${colors.BORDER}50 50%, transparent 100%)` }}
        /> */}

        {/* Destructive Action - HIDDEN FOR NOW */}
        {/* <div>
          <Button
            onClick={handleDeleteClick}
            icon={isLoadingLikedPosts ? mdiLoading : mdiDelete}
            iconClassName={isLoadingLikedPosts ? "animate-spin" : ""}
            disabled={isLoadingLikedPosts}
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            tooltip="Delete multiple posts permanently"
            style={{
              backgroundColor: colors.DANGER,
              color: '#fff',
            }}
          >
            {isLoadingLikedPosts ? 'Loading' : 'Delete Multiple Posts'}
          </Button>
        </div> */}
      </CollapsibleSection>

      {/* Upscale All Modal */}
      <UpscaleAllModal
        isOpen={isUpscaleAllModalOpen}
        posts={likedPosts}
        mode="upscale"
        onClose={() => {
          setIsUpscaleAllModalOpen(false);
          trackModalClosed('upscale_all');
        }}
        onConfirm={handleBulkUpscale}
        getThemeColors={getThemeColors}
      />

      {/* Download All Modal */}
      <DownloadAllModal
        isOpen={isDownloadAllModalOpen}
        posts={likedPosts}
        onClose={() => {
          setIsDownloadAllModalOpen(false);
          trackModalClosed('download_all');
        }}
        onConfirm={handleBulkDownload}
        getThemeColors={getThemeColors}
      />

      {/* Like Management Modal (unified Unlike + Archive) */}
      <LikeManagementModal
        isOpen={isLikeManagementModalOpen}
        onClose={() => {
          setIsLikeManagementModalOpen(false);
          trackModalClosed('like_management');
        }}
        getThemeColors={getThemeColors}
        likedPosts={likedPosts}
        onUnlike={handleBulkUnlike}
        archivedPosts={unlikedPosts}
        onRelike={handleRelikeFromArchive}
        onImportArchive={handleImportArchive}
      />

      {/* Delete Modal - HIDDEN FOR NOW */}
      {/* <DeleteModal
        isOpen={isDeleteModalOpen}
        posts={likedPosts}
        onClose={() => {
          if (!isProcessingDeletes) {
            setIsDeleteModalOpen(false);
            trackModalClosed('delete_posts');
          }
        }}
        onConfirm={handleBulkDelete}
        getThemeColors={getThemeColors}
        isProcessing={isProcessingDeletes}
        processedCount={processedDeletesCount}
        totalCount={totalDeletesCount}
      /> */}
    </div>
  );
};
