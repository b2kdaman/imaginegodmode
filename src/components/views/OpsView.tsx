/**
 * Ops and media controls view component
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useMediaStore } from '@/store/useMediaStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUpscaleQueueStore } from '@/store/useUpscaleQueueStore';
import { usePostsStore } from '@/store/usePostsStore';
import { getPostIdFromUrl } from '@/utils/helpers';
import { fetchPost, downloadMedia } from '@/utils/messaging';
import { processPostData } from '@/utils/mediaProcessor';
import { fetchPostData } from '@/api/grokApi';
import { Button } from '../inputs/Button';
import { Icon } from '../common/Icon';
import { mdiDownload, mdiImageSizeSelectLarge, mdiCheckCircle, mdiFormatListBulletedSquare, mdiHeartBroken, mdiArchive } from '@mdi/js';
import { useUrlWatcher } from '@/hooks/useUrlWatcher';
import { useBulkUnlike } from '@/hooks/useBulkUnlike';
import { useBulkRelike } from '@/hooks/useBulkRelike';
import { useLikedPostsLoader } from '@/hooks/useLikedPostsLoader';
import { trackMediaDownloaded, trackModalOpened, trackModalClosed } from '@/utils/analytics';
import { UpscaleAllModal } from '../modals/UpscaleAllModal';
import { UnlikeModal } from '../modals/UnlikeModal';
import { UnlikedArchiveModal } from '../modals/UnlikedArchiveModal';
import { UnlikedPost, getUnlikedPosts } from '@/utils/storage';
import { navigateTo } from '@/utils/opsHelpers';
import { STATUS_MESSAGES, NAVIGATION_URLS, LOG_PREFIX } from '@/constants/opsView';

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
  const { getThemeColors } = useSettingsStore();
  const { addToQueue, isProcessing: isQueueProcessing } = useUpscaleQueueStore();
  const { setPosts, setCurrentPostId, ensureCurrentPostInList } = usePostsStore();
  const colors = getThemeColors();

  const [postId, setPostId] = useState<string | null>(null);
  const [isUpscaleAllModalOpen, setIsUpscaleAllModalOpen] = useState(false);
  const [isUnlikeModalOpen, setIsUnlikeModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [unlikedPosts, setUnlikedPosts] = useState<UnlikedPost[]>([]);

  // Custom hooks
  const {
    likedPosts,
    isLoading: isLoadingLikedPosts,
    loadLikedPosts,
  } = useLikedPostsLoader(setStatusText);

  const {
    isProcessing: isProcessingUnlikes,
    processedCount: processedUnlikesCount,
    totalCount: totalUnlikesCount,
    processBulkUnlike,
  } = useBulkUnlike(setStatusText);

  const {
    isProcessing: isProcessingRelikes,
    processedCount: processedRelikesCount,
    totalCount: totalRelikesCount,
    processBulkRelike,
  } = useBulkRelike(setStatusText);

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
        ensureCurrentPostInList(response.data.post as any);
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

  // Auto-fetch on mount
  useEffect(() => {
    handleFetchPost();
    // Load liked posts on mount to populate posts store for navigation
    loadLikedPosts().then((posts) => setPosts(posts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Download media
  const handleDownload = async () => {
    setStatusText(STATUS_MESSAGES.DOWNLOADING);
    const urlStrings = urls.map((m) => m.url);
    const response = await downloadMedia(urlStrings);

    if (response.success) {
      setStatusText(STATUS_MESSAGES.DOWNLOADED(response.data.count));
      trackMediaDownloaded(response.data.count, 'mixed');
    } else {
      setStatusText(STATUS_MESSAGES.DOWNLOAD_FAILED);
    }
  };

  // Add videos to upscale queue
  const handleUpscale = () => {
    if (videoIdsToUpscale.length === 0) {
      setStatusText(STATUS_MESSAGES.NO_VIDEOS);
      return;
    }

    if (!postId) {
      setStatusText(STATUS_MESSAGES.NO_POST_ID);
      return;
    }

    // Add to global queue - it will auto-start processing
    addToQueue(postId, videoIdsToUpscale);
    setStatusText(STATUS_MESSAGES.ADDED_TO_QUEUE(videoIdsToUpscale.length));

    // Clear local upscale list since they're now in queue
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

  // Handle bulk upscale from modal
  const handleBulkUpscale = async (selectedPostIds: string[]) => {
    setIsUpscaleAllModalOpen(false);
    setStatusText(STATUS_MESSAGES.PROCESSING_POSTS(selectedPostIds.length));

    let totalVideosAdded = 0;

    // Process each selected post
    for (const postId of selectedPostIds) {
      try {
        // Fetch full post data
        const postData = await fetchPostData(postId);

        if (postData?.post) {
          // Process post data to extract video IDs that need upscaling
          const processed = processPostData(postData);

          if (processed.videosToUpscale.length > 0) {
            // Add videos to queue
            addToQueue(postId, processed.videosToUpscale);
            totalVideosAdded += processed.videosToUpscale.length;
          }
        }
      } catch (error) {
        console.error(`${LOG_PREFIX} Failed to process post ${postId}:`, error);
      }
    }

    setStatusText(STATUS_MESSAGES.ADDED_VIDEOS_TO_QUEUE(totalVideosAdded, selectedPostIds.length));
  };

  // Handle unlike button click
  const handleUnlikeClick = async () => {
    const posts = await loadLikedPosts();
    setPosts(posts);
    if (posts.length > 0) {
      setIsUnlikeModalOpen(true);
      trackModalOpened('unlike_posts');
    }
  };

  // Handle bulk unlike from modal
  const handleBulkUnlike = async (selectedPostIds: string[]) => {
    setIsUnlikeModalOpen(false);
    await processBulkUnlike(selectedPostIds, likedPosts);
  };

  // Handle image click to navigate to post
  const handleImageClick = (postId: string) => {
    navigateTo(NAVIGATION_URLS.POST(postId));
  };

  // Handle archive button click
  const handleArchiveClick = async () => {
    const posts = await getUnlikedPosts();
    setUnlikedPosts(posts);
    setIsArchiveModalOpen(true);
    trackModalOpened('unliked_archive');
  };

  // Handle re-like from archive
  const handleRelikeFromArchive = async (postIds: string[]) => {
    setIsArchiveModalOpen(false);
    await processBulkRelike(postIds);
  };

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

      {/* Upscale All Liked & Unlike Buttons - always visible */}
      <div className="flex flex-col gap-2 mt-2">
        <Button
          onClick={handleUpscaleAllClick}
          icon={mdiFormatListBulletedSquare}
          disabled={isLoadingLikedPosts}
          className="w-full"
          tooltip="Upscale videos from multiple liked posts"
        >
          {isLoadingLikedPosts ? 'Loading...' : 'Upscale All Liked'}
        </Button>
        <Button
          onClick={handleUnlikeClick}
          icon={mdiHeartBroken}
          disabled={isLoadingLikedPosts}
          className="w-full"
          tooltip="Unlike multiple posts at once"
        >
          {isLoadingLikedPosts ? 'Loading...' : 'Unlike Multiple Posts'}
        </Button>
        <Button
          onClick={handleArchiveClick}
          icon={mdiArchive}
          className="w-full"
          tooltip="View and manage unliked posts archive"
        >
          Unliked Archive
        </Button>
      </div>

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
        onImageClick={handleImageClick}
        getThemeColors={getThemeColors}
      />

      {/* Unlike Modal */}
      <UnlikeModal
        isOpen={isUnlikeModalOpen}
        posts={likedPosts}
        onClose={() => {
          if (!isProcessingUnlikes) {
            setIsUnlikeModalOpen(false);
            trackModalClosed('unlike_posts');
          }
        }}
        onConfirm={handleBulkUnlike}
        onImageClick={handleImageClick}
        getThemeColors={getThemeColors}
        isProcessing={isProcessingUnlikes}
        processedCount={processedUnlikesCount}
        totalCount={totalUnlikesCount}
      />

      {/* Unliked Archive Modal */}
      <UnlikedArchiveModal
        isOpen={isArchiveModalOpen}
        posts={unlikedPosts}
        onClose={() => {
          if (!isProcessingRelikes) {
            setIsArchiveModalOpen(false);
            trackModalClosed('unliked_archive');
          }
        }}
        onRelike={handleRelikeFromArchive}
        getThemeColors={getThemeColors}
        isProcessing={isProcessingRelikes}
        processedCount={processedRelikesCount}
        totalCount={totalRelikesCount}
      />
    </div>
  );
};
