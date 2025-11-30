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
import { fetchLikedPosts, fetchUnlikedPosts, fetchPostData, likePost, DEFAULT_POST_FETCH_LIMIT } from '@/api/grokApi';
import { Button } from './Button';
import { Icon } from './Icon';
import { mdiDownload, mdiImageSizeSelectLarge, mdiCheckCircle, mdiFormatListBulletedSquare, mdiHeartOutline } from '@mdi/js';
import { useUrlWatcher } from '@/hooks/useUrlWatcher';
import { trackMediaDownloaded } from '@/utils/analytics';
import { NoPostMessage } from './NoPostMessage';
import { UpscaleAllModal } from './UpscaleAllModal';
import { LikedPost } from '@/types';

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
  const { setPosts, setCurrentPostId } = usePostsStore();
  const colors = getThemeColors();

  const [postId, setPostId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUpscaleAllModalOpen, setIsUpscaleAllModalOpen] = useState(false);
  const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [unlikedPosts, setUnlikedPosts] = useState<LikedPost[]>([]);
  const [isLoadingLikedPosts, setIsLoadingLikedPosts] = useState(false);
  const [isLoadingUnlikedPosts, setIsLoadingUnlikedPosts] = useState(false);
  const [isProcessingLikes, setIsProcessingLikes] = useState(false);
  const [processedLikesCount, setProcessedLikesCount] = useState(0);
  const [totalLikesCount, setTotalLikesCount] = useState(0);

  // Fetch post data
  const handleFetchPost = useCallback(async () => {
    const currentPostId = getPostIdFromUrl();
    setPostId(currentPostId);
    setCurrentPostId(currentPostId); // Update posts store with current post ID
    console.log('[ImagineGodMode] Post ID:', currentPostId);

    if (!currentPostId) {
      return;
    }

    setStatusText('Fetching post data...');
    console.log('[ImagineGodMode] Fetching post:', currentPostId);

    const response = await fetchPost(currentPostId);
    console.log('[ImagineGodMode] Fetch response:', response);

    if (response.success && response.data) {
      const processed = processPostData(response.data);
      console.log('[ImagineGodMode] Processed data:', processed);

      // Extract userId from post data
      if (response.data?.post?.userId) {
        setUserId(response.data.post.userId);
        console.log('[ImagineGodMode] User ID:', response.data.post.userId);
      }

      setMediaUrls(processed.mediaUrls);
      setVideoIdsToUpscale(processed.videosToUpscale);
      setHdVideoCount(processed.hdVideoCount);
      setStatusText(
        `Found ${processed.urls.length} media (${processed.hdVideoCount} HD videos)`
      );
    } else {
      console.error('[ImagineGodMode] Fetch failed:', response);
      setStatusText('Failed to fetch post data');
    }
  }, [setMediaUrls, setVideoIdsToUpscale, setHdVideoCount, setStatusText, setCurrentPostId]);

  // Watch for URL changes and refetch data
  useUrlWatcher(handleFetchPost);

  // Auto-fetch on mount
  useEffect(() => {
    handleFetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Download media
  const handleDownload = async () => {
    setStatusText('Downloading...');
    const urlStrings = urls.map((m) => m.url);
    const response = await downloadMedia(urlStrings);

    if (response.success) {
      setStatusText(`Downloaded ${response.data.count} files`);
      trackMediaDownloaded(response.data.count, 'mixed');
    } else {
      setStatusText('Download failed');
    }
  };

  // Add videos to upscale queue
  const handleUpscale = () => {
    if (videoIdsToUpscale.length === 0) {
      setStatusText('No videos to upscale');
      return;
    }

    if (!postId) {
      setStatusText('No post ID found');
      return;
    }

    // Add to global queue - it will auto-start processing
    addToQueue(postId, videoIdsToUpscale);
    setStatusText(`Added ${videoIdsToUpscale.length} videos to queue`);

    // Clear local upscale list since they're now in queue
    setVideoIdsToUpscale([]);
  };

  // Fetch liked posts for Upscale All
  const handleUpscaleAllClick = async () => {
    setIsLoadingLikedPosts(true);
    try {
      const response = await fetchLikedPosts(DEFAULT_POST_FETCH_LIMIT);
      setLikedPosts(response.posts || []);
      setPosts(response.posts || []); // Update posts store
      setIsUpscaleAllModalOpen(true);
    } catch (error) {
      console.error('[ImagineGodMode] Failed to fetch liked posts:', error);
      setStatusText('Failed to fetch liked posts');
    } finally {
      setIsLoadingLikedPosts(false);
    }
  };

  // Handle bulk upscale from modal
  const handleBulkUpscale = async (selectedPostIds: string[]) => {
    setIsUpscaleAllModalOpen(false);
    setStatusText(`Processing ${selectedPostIds.length} posts...`);

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
        console.error(`[ImagineGodMode] Failed to process post ${postId}:`, error);
      }
    }

    setStatusText(
      `Added ${totalVideosAdded} videos from ${selectedPostIds.length} posts to queue`
    );
  };

  // Fetch unliked posts for Show Unliked
  const handleShowUnlikedClick = async () => {
    setIsLoadingUnlikedPosts(true);
    try {
      const response = await fetchUnlikedPosts(DEFAULT_POST_FETCH_LIMIT, userId || undefined);
      setUnlikedPosts(response.posts || []);
      setPosts(response.posts || []); // Update posts store
      setIsLikeModalOpen(true);
    } catch (error) {
      console.error('[ImagineGodMode] Failed to fetch unliked posts:', error);
      setStatusText('Failed to fetch unliked posts');
    } finally {
      setIsLoadingUnlikedPosts(false);
    }
  };

  // Handle bulk like from modal with progress
  const handleBulkLike = async (selectedPostIds: string[]) => {
    setIsProcessingLikes(true);
    setProcessedLikesCount(0);
    setTotalLikesCount(selectedPostIds.length);

    let successCount = 0;

    // Process each selected post with delay
    for (let i = 0; i < selectedPostIds.length; i++) {
      const postId = selectedPostIds[i];

      try {
        await likePost(postId);
        successCount++;
      } catch (error) {
        console.error(`[ImagineGodMode] Failed to like post ${postId}:`, error);
      }

      setProcessedLikesCount(i + 1);

      // Add 1-2 second delay between calls (except for last one)
      if (i < selectedPostIds.length - 1) {
        const delay = 1000 + Math.random() * 1000; // Random 1-2 seconds
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    setIsProcessingLikes(false);
    setIsLikeModalOpen(false);
    setStatusText(`Liked ${successCount} of ${selectedPostIds.length} posts`);
  };

  // Handle image click to navigate to post
  const handleImageClick = (postId: string) => {
    window.location.href = `https://grok.com/imagine/post/${postId}`;
  };

  // Check if all videos are HD
  const allVideosHD = urls.length > 0 && videoIdsToUpscale.length === 0 && hdVideoCount > 0;

  // If no post ID, show a message
  if (!postId) {
    return <NoPostMessage subMessage="Navigate to a post to manage media" />;
  }

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

      {/* Action buttons */}
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

      {/* Upscale All / Show Unliked Buttons */}
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
          onClick={handleShowUnlikedClick}
          icon={mdiHeartOutline}
          disabled={isLoadingUnlikedPosts}
          className="w-full"
          tooltip="Like multiple unliked posts"
        >
          {isLoadingUnlikedPosts ? 'Loading...' : 'Show Unliked'}
        </Button>
      </div>

      {/* Upscale All Modal */}
      <UpscaleAllModal
        isOpen={isUpscaleAllModalOpen}
        posts={likedPosts}
        mode="upscale"
        onClose={() => setIsUpscaleAllModalOpen(false)}
        onConfirm={handleBulkUpscale}
        onImageClick={handleImageClick}
        getThemeColors={getThemeColors}
      />

      {/* Like Modal */}
      <UpscaleAllModal
        isOpen={isLikeModalOpen}
        posts={unlikedPosts}
        mode="like"
        onClose={() => {
          if (!isProcessingLikes) {
            setIsLikeModalOpen(false);
          }
        }}
        onConfirm={handleBulkLike}
        onImageClick={handleImageClick}
        getThemeColors={getThemeColors}
        isProcessing={isProcessingLikes}
        processedCount={processedLikesCount}
        totalCount={totalLikesCount}
      />
    </div>
  );
};
