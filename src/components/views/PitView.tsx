/**
 * The Pit view component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePitStore } from '@/store/usePitStore';
import { usePostsStore } from '@/store/usePostsStore';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useMediaStore } from '@/store/useMediaStore';
import { Button } from '../inputs/Button';
import { Toggle } from '../inputs/Toggle';
import { Dropdown } from '../inputs/Dropdown';
import { Icon } from '../common/Icon';
import { getPostIdFromUrl } from '@/utils/helpers';
import { fetchPost } from '@/utils/messaging';
import { processPostData } from '@/utils/mediaProcessor';
import { useUrlWatcher } from '@/hooks/useUrlWatcher';
import { useLikedPostsLoader } from '@/hooks/useLikedPostsLoader';
import { generateVideo } from '@/api/grokApi';
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiFire,
  mdiLoading,
} from '@mdi/js';

export const PitView: React.FC = () => {
  const {
    selectedPostId,
    manualMode,
    manualPrompt,
    selectedPack,
    selectedPromptIndex,
    tries,
    stopOnFirstSuccess,
    setSelectedPostId,
    setManualMode,
    setManualPrompt,
    setSelectedPack,
    setSelectedPromptIndex,
    setTries,
    setStopOnFirstSuccess,
  } = usePitStore();

  const { posts, setPosts, setCurrentPostId, ensureCurrentPostInList } = usePostsStore();
  const { packOrder, packs } = usePromptStore();
  const { getThemeColors } = useSettingsStore();
  const { setMediaUrls, setVideoIdsToUpscale, setHdVideoCount } = useMediaStore();
  const colors = getThemeColors();

  // Status text state for loading feedback
  const [statusText, setStatusText] = useState('');

  // Load liked posts
  const {
    isLoading: isLoadingLikedPosts,
    loadLikedPosts,
  } = useLikedPostsLoader(setStatusText);

  // Local state for post navigation
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [_postId, setPostId] = useState<string | null>(null);

  // Image loading state
  const [imageLoading, setImageLoading] = useState(true);

  // Churn loading state
  const [isChurning, setIsChurning] = useState(false);

  // Progress tracking state
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [succeededCount, setSucceededCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch post data (similar to OpsView)
  const handleFetchPost = useCallback(async () => {
    const currentPostId = getPostIdFromUrl();
    setPostId(currentPostId);
    setCurrentPostId(currentPostId); // Update posts store with current post ID

    if (!currentPostId) {
      return;
    }

    const response = await fetchPost(currentPostId);

    if (response.success && response.data) {
      const processed = processPostData(response.data);

      // Ensure current post is in the posts list for navigation
      if (response.data?.post) {
        ensureCurrentPostInList(response.data.post);
      }

      setMediaUrls(processed.mediaUrls);
      setVideoIdsToUpscale(processed.videosToUpscale);
      setHdVideoCount(processed.hdVideoCount);
    }
  }, [setMediaUrls, setVideoIdsToUpscale, setHdVideoCount, setCurrentPostId, ensureCurrentPostInList]);

  // Watch for URL changes and refetch data
  useUrlWatcher(handleFetchPost);

  // Auto-fetch on mount
  useEffect(() => {
    handleFetchPost();
    // Load liked posts on mount to populate posts store for navigation
    loadLikedPosts().then((posts) => setPosts(posts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize selected post when posts are available
  useEffect(() => {
    if (posts.length > 0 && !selectedPostId) {
      setSelectedPostId(posts[0].id);
      setCurrentPostIndex(0);
    }
  }, [posts, selectedPostId, setSelectedPostId]);

  // Update selected post when navigating
  const handlePrevPost = () => {
    if (currentPostIndex > 0) {
      setImageLoading(true);
      const newIndex = currentPostIndex - 1;
      setCurrentPostIndex(newIndex);
      setSelectedPostId(posts[newIndex].id);
    }
  };

  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      setImageLoading(true);
      const newIndex = currentPostIndex + 1;
      setCurrentPostIndex(newIndex);
      setSelectedPostId(posts[newIndex].id);
    }
  };

  // Get current post
  const currentPost = posts[currentPostIndex];

  // Get image URL for preview
  const getImageUrl = () => {
    if (!currentPost) {
      return '';
    }
    return currentPost.thumbnailImageUrl || currentPost.mediaUrl;
  };

  // Get prompts from selected pack
  const getPackPrompts = () => {
    return packs[selectedPack] || [];
  };

  const packPrompts = getPackPrompts();
  const currentPackPrompt = packPrompts[selectedPromptIndex];

  // Handle pack prompt navigation
  const handlePrevPrompt = () => {
    if (selectedPromptIndex > 0) {
      setSelectedPromptIndex(selectedPromptIndex - 1);
    }
  };

  const handleNextPrompt = () => {
    if (selectedPromptIndex < packPrompts.length - 1) {
      setSelectedPromptIndex(selectedPromptIndex + 1);
    }
  };

  // Helper function to add delay between requests
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Handle churn click - generate videos
  const handleChurn = async () => {
    if (!selectedPostId) {
      console.error('No post selected');
      return;
    }

    const prompt = manualMode ? manualPrompt : currentPackPrompt?.text;
    if (!prompt) {
      console.error('No prompt available');
      return;
    }

    setIsChurning(true);
    // Reset progress counters and error message
    setCurrentAttempt(0);
    setSucceededCount(0);
    setFailedCount(0);
    setErrorMessage('');

    try {
      console.log('[PitView] Churning videos:', {
        postId: selectedPostId,
        prompt,
        tries,
        stopOnFirstSuccess,
      });

      let succeeded = 0;
      let failed = 0;

      // Always execute sequentially to avoid parallel API calls
      for (let i = 0; i < tries; i++) {
        // Add delay between requests (1-2 seconds), except for first request
        if (i > 0) {
          const delayMs = 1000 + Math.random() * 1000; // Random delay between 1-2 seconds
          console.log(`[PitView] Waiting ${Math.round(delayMs)}ms before next request...`);
          await delay(delayMs);
        }

        setCurrentAttempt(i + 1);

        try {
          console.log(`[PitView] Sending request ${i + 1}/${tries}`);
          const result = await generateVideo(selectedPostId, prompt);
          console.log(`[PitView] Request ${i + 1}/${tries} completed:`, result);

          succeeded++;
          setSucceededCount(succeeded);

          // Stop on first success if enabled
          if (stopOnFirstSuccess) {
            console.log('[PitView] Success achieved, stopping early');
            break;
          }
        } catch (error) {
          console.error(`[PitView] Request ${i + 1}/${tries} failed:`, error);
          failed++;
          setFailedCount(failed);

          // Check if this is a 403 error - if so, stop immediately
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (errorMsg.includes('403')) {
            console.error('[PitView] Received 403 error - stopping churn process');
            setErrorMessage('403 Forbidden - Authentication required. Please refresh the page.');
            break;
          }
        }
      }

      console.log('[PitView] Churn completed:', {
        total: tries,
        success: succeeded || succeededCount,
        failed: failed || failedCount,
      });
    } catch (error) {
      console.error('[PitView] Churn error:', error);
    } finally {
      setIsChurning(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Status text */}
      {statusText && (
        <div className="text-sm text-center mb-3" style={{ color: colors.TEXT_SECONDARY }}>
          {statusText}
        </div>
      )}

      {/* Post Selector */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Button
          variant="icon"
          icon={mdiChevronLeft}
          onClick={handlePrevPost}
          disabled={posts.length === 0 || currentPostIndex === 0}
          tooltip="Previous post"
        />

        {/* Image Preview */}
        <div
          className="w-1/2 rounded-lg overflow-hidden relative"
          style={{
            height: '120px',
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          {posts.length === 0 ? (
            <div
              className="w-full h-full flex items-center justify-center text-sm"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              No posts loaded
            </div>
          ) : getImageUrl() ? (
            <>
              {imageLoading && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: `${colors.BACKGROUND_MEDIUM}aa` }}
                >
                  <div className="animate-spin">
                    <Icon
                      path={mdiLoading}
                      size={1.2}
                      color={colors.TEXT_SECONDARY}
                    />
                  </div>
                </div>
              )}
              <img
                src={getImageUrl()}
                alt="Post preview"
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-sm"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              No preview available
            </div>
          )}
        </div>

        <Button
          variant="icon"
          icon={mdiChevronRight}
          onClick={handleNextPost}
          disabled={posts.length === 0 || currentPostIndex >= posts.length - 1}
          tooltip="Next post"
        />
      </div>

      {/* Post counter */}
      {posts.length > 0 && (
        <div className="text-xs text-center mb-3" style={{ color: colors.TEXT_SECONDARY }}>
          {currentPostIndex + 1} / {posts.length}
          {isLoadingLikedPosts && ' (loading more...)'}
        </div>
      )}

      {/* Loading indicator when no posts yet */}
      {posts.length === 0 && isLoadingLikedPosts && (
        <div className="text-xs text-center mb-3 flex items-center justify-center gap-2" style={{ color: colors.TEXT_SECONDARY }}>
          <Icon path={mdiLoading} size={0.5} className="animate-spin" />
          <span>Loading liked posts...</span>
        </div>
      )}

      {/* Manual Mode Toggle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <label
          className="text-sm cursor-pointer"
          style={{ color: colors.TEXT_PRIMARY }}
          htmlFor="manual-mode-toggle"
        >
          Manual Prompt
        </label>
        <Toggle
          id="manual-mode-toggle"
          checked={manualMode}
          onChange={setManualMode}
        />
      </div>

      {/* Conditional Prompt Input */}
      {manualMode ? (
        // Manual Prompt Textarea
        <textarea
          value={manualPrompt}
          onChange={(e) => setManualPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="w-full h-20 px-3 py-2 rounded-lg text-sm resize-none focus:outline-none custom-scrollbar mb-3 backdrop-blur-xl"
          style={{
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            color: colors.TEXT_PRIMARY,
            border: `1px solid ${colors.BORDER}`,
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
          }}
        />
      ) : (
        // Pack Mode
        <div className="flex flex-col gap-3 mb-3">
          {/* Pack Dropdown */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              Pack
            </label>
            <Dropdown
              value={selectedPack}
              onChange={setSelectedPack}
              options={packOrder.map((name) => ({
                value: name,
                label: name,
              }))}
              className="w-full"
            />
          </div>

          {/* Prompt Display and Navigation */}
          {packPrompts.length > 0 ? (
            <>
              <div
                className="w-full px-3 py-2 rounded-lg text-sm min-h-[80px] max-h-[80px] overflow-y-auto custom-scrollbar backdrop-blur-xl"
                style={{
                  backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {currentPackPrompt?.text || ''}
              </div>

              {/* Prompt Navigation */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="icon"
                  icon={mdiChevronLeft}
                  onClick={handlePrevPrompt}
                  disabled={selectedPromptIndex === 0}
                  tooltip="Previous prompt"
                />

                <span className="text-sm" style={{ color: colors.TEXT_SECONDARY }}>
                  {selectedPromptIndex + 1} / {packPrompts.length}
                </span>

                <Button
                  variant="icon"
                  icon={mdiChevronRight}
                  onClick={handleNextPrompt}
                  disabled={selectedPromptIndex >= packPrompts.length - 1}
                  tooltip="Next prompt"
                />
              </div>
            </>
          ) : (
            <div
              className="w-full px-3 py-2 rounded-lg text-sm text-center"
              style={{
                backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
                color: colors.TEXT_SECONDARY,
                border: `1px solid ${colors.BORDER}`,
              }}
            >
              No prompts in this pack
            </div>
          )}
        </div>
      )}

      {/* Tries Input */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <label
          className="text-sm"
          style={{ color: colors.TEXT_PRIMARY }}
          htmlFor="tries-input"
        >
          Tries
        </label>
        <input
          id="tries-input"
          type="number"
          min={1}
          max={10}
          value={tries}
          onChange={(e) => setTries(Number(e.target.value))}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none backdrop-blur-xl"
          style={{
            width: '80px',
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            color: colors.TEXT_PRIMARY,
            border: `1px solid ${colors.BORDER}`,
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
          }}
        />
      </div>

      {/* Stop on First Success Toggle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <label
          className="text-sm cursor-pointer"
          style={{ color: colors.TEXT_PRIMARY }}
          htmlFor="stop-on-success-toggle"
        >
          Stop on First Success
        </label>
        <Toggle
          id="stop-on-success-toggle"
          checked={stopOnFirstSuccess}
          onChange={setStopOnFirstSuccess}
        />
      </div>

      {/* Progress Display */}
      {isChurning && (
        <div
          className="px-3 py-2 rounded-lg text-sm mb-3 backdrop-blur-xl"
          style={{
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            color: colors.TEXT_PRIMARY,
            border: `1px solid ${colors.BORDER}`,
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span style={{ color: colors.TEXT_SECONDARY }}>Progress:</span>
              <span className="font-medium">
                {currentAttempt} / {tries}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: colors.TEXT_SECONDARY }}>Succeeded:</span>
              <span className="font-medium text-green-500">{succeededCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: colors.TEXT_SECONDARY }}>Failed:</span>
              <span className="font-medium text-red-500">{failedCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          className="px-3 py-2 rounded-lg text-sm mb-3 backdrop-blur-xl"
          style={{
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            color: '#ff4444',
            border: `1px solid #ff4444`,
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Churn Button */}
      <Button
        onClick={handleChurn}
        icon={isChurning ? mdiLoading : mdiFire}
        className="w-full !bg-white !text-black hover:!bg-white/90"
        disabled={true}
        tooltip="Under construction"
      >
        {isChurning ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin">
              <Icon path={mdiLoading} size={0.7} color="currentColor" />
            </div>
            Churning...
          </div>
        ) : (
          'Churn'
        )}
      </Button>

      {/* Under construction message */}
      <div className="text-xs text-center mt-2" style={{ color: colors.TEXT_SECONDARY }}>
        Under construction
      </div>
    </div>
  );
};
