/**
 * Prompt management view component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePostsStore } from '@/store/usePostsStore';
import { PackManager } from '../PackManager';
import { RatingSystem } from '../inputs/RatingSystem';
import { Button } from '../inputs/Button';
import { ConfirmModal } from '../modals/ConfirmModal';
import { SELECTORS } from '@/utils/constants';
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiPlus,
  mdiContentDuplicate,
  mdiPlay,
  mdiArrowDown,
  mdiArrowUp,
  mdiContentCopy,
  mdiSkipNext,
  mdiChevronDoubleRight,
  mdiChevronDoubleLeft,
  mdiAutorenew,
  mdiStop,
  mdiShuffle,
} from '@mdi/js';
import { useTranslation } from '@/contexts/I18nContext';
import {
  trackPromptEdited,
  trackVideoMakeClicked,
  trackPromptCopiedToClipboard,
  trackPromptNavigated,
  trackPromptCopiedToPage,
  trackPromptCopiedFromPage,
  trackMakeAndNextClicked
} from '@/utils/analytics';
import { getPrefix, setPrefix } from '@/utils/storage';
import { getPostIdFromUrl } from '@/utils/helpers';
import { useUrlWatcher } from '@/hooks/useUrlWatcher';
import { useLikedPostsLoader } from '@/hooks/useLikedPostsLoader';
import { NoPostMessage } from '../common/NoPostMessage';
import { applyPromptAndMake, applyPromptMakeAndNext, navigateToPost } from '@/utils/promptActions';

export const PromptView: React.FC = () => {
  const {
    currentPack,
    currentIndex,
    getCurrentPrompt,
    getCurrentPromptCount,
    updatePromptText,
    updatePromptRating,
    nextPrompt,
    prevPrompt,
    addPrompt,
    loadPostState,
    savePostState,
    setCurrentIndex,
  } = usePromptStore();
  const { getThemeColors, rememberPostState, confirmCopyFrom, globalPromptAddonEnabled, globalPromptAddon, listLimit } = useSettingsStore();
  const { getNextPostId, getPrevPostId, setCurrentPostId, setPosts } = usePostsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();

  const currentPrompt = getCurrentPrompt();
  const promptCount = getCurrentPromptCount();

  const [prefix, setLocalPrefix] = useState<string>('');
  const [postId, setPostId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [autoNavigate, setAutoNavigate] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [randomPrompt, setRandomPrompt] = useState(false);

  // Long press state for prompt navigation
  const longPressTimerRef = React.useRef<number | null>(null);
  const longPressIntervalRef = React.useRef<number | null>(null);
  const longPressStartTimeRef = React.useRef<number>(0);
  const isLongPressingRef = React.useRef<boolean>(false);

  // Auto Make + Next timeout ref
  const autoMakeNextTimeoutRef = React.useRef<number | null>(null);

  // Load liked posts hook
  const { loadLikedPosts } = useLikedPostsLoader(() => {});

  // Long press cleanup function
  const stopLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressIntervalRef.current) {
      window.clearTimeout(longPressIntervalRef.current);
      longPressIntervalRef.current = null;
    }
    isLongPressingRef.current = false;
  }, []);

  // Long press handlers for prompt navigation
  const startLongPress = useCallback((direction: 'prev' | 'next') => {
    // Clear any existing timers
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }
    if (longPressIntervalRef.current) {
      window.clearTimeout(longPressIntervalRef.current);
    }

    isLongPressingRef.current = false;
    longPressStartTimeRef.current = Date.now();

    // Start long press after 300ms hold
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressingRef.current = true;
      longPressStartTimeRef.current = Date.now();

      // Calculate interval based on hold duration (starts at 200ms, accelerates to 50ms)
      const navigate = () => {
        const holdDuration = Date.now() - longPressStartTimeRef.current;

        // Navigate
        if (direction === 'prev') {
          if (currentIndex > 0) {
            prevPrompt();
            trackPromptNavigated('prev');
          } else {
            stopLongPress();
            return;
          }
        } else {
          if (currentIndex < promptCount - 1) {
            nextPrompt();
            trackPromptNavigated('next');
          } else {
            stopLongPress();
            return;
          }
        }

        // Accelerate: start slow (200ms), speed up to 50ms over 2 seconds
        let interval = 200;
        if (holdDuration > 2000) {
          interval = 50; // Max speed after 2s
        } else if (holdDuration > 1000) {
          interval = 100; // Medium speed after 1s
        } else if (holdDuration > 500) {
          interval = 150; // Slightly faster after 500ms
        }

        // Clear previous interval and set new one with updated speed
        if (longPressIntervalRef.current) {
          window.clearTimeout(longPressIntervalRef.current);
        }
        longPressIntervalRef.current = window.setTimeout(navigate, interval);
      };

      navigate(); // Start the navigation loop
    }, 300);
  }, [currentIndex, promptCount, prevPrompt, nextPrompt, stopLongPress]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopLongPress();
    };
  }, [stopLongPress]);

  // Load prefix and post state from storage when component mounts or URL changes
  const loadPostData = useCallback(async () => {
    const currentPostId = getPostIdFromUrl();
    setPostId(currentPostId);
    setCurrentPostId(currentPostId); // Update posts store with current post ID

    if (currentPostId) {
      // Load prefix
      const storedPrefix = await getPrefix(currentPostId);
      setLocalPrefix(storedPrefix);

      // Load post state (current pack and index) only if setting is enabled
      if (rememberPostState) {
        await loadPostState(currentPostId);
      }
    } else {
      // Clear prefix if no post ID
      setLocalPrefix('');
    }
  }, [loadPostState, rememberPostState, setCurrentPostId]);

  // Track list limit changes to refetch data
  const [lastListLimit, setLastListLimit] = useState(listLimit);

  // Load post data on mount
  useEffect(() => {
    loadPostData();
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

  // Reload post data when URL changes (navigating to different post)
  useUrlWatcher(loadPostData);

  // Save post state (pack and index) whenever they change, only if setting is enabled
  useEffect(() => {
    if (postId && rememberPostState) {
      savePostState(postId);
    }
  }, [currentPack, currentIndex, postId, savePostState, rememberPostState]);

  // Save prefix to storage whenever it changes
  const handlePrefixChange = async (value: string) => {
    setLocalPrefix(value);

    if (postId) {
      await setPrefix(postId, value);
    }
  };

  const handleCopyToPage = () => {
    const textarea = document.querySelector(SELECTORS.TEXTAREA) as HTMLTextAreaElement;
    if (textarea && currentPrompt) {
      // Set the value using the native setter to bypass React's control
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(textarea, currentPrompt.text);

      // Dispatch both input and change events for compatibility
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      trackPromptCopiedToPage();
    }
  };

  const handleCopyFromPage = () => {
    const textarea = document.querySelector(SELECTORS.TEXTAREA) as HTMLTextAreaElement;
    if (!textarea) {
      return;
    }

    // Show confirmation if current prompt is not empty and setting is enabled
    if (currentPrompt?.text.trim() && confirmCopyFrom) {
      setShowConfirmModal(true);
      return;
    }

    // If empty or confirmation disabled, copy directly (strip addon if present)
    const strippedText = stripGlobalAddon(textarea.value);
    updatePromptText(strippedText);
    trackPromptEdited();
    trackPromptCopiedFromPage();
  };

  const handleConfirmCopyFromPage = () => {
    const textarea = document.querySelector(SELECTORS.TEXTAREA) as HTMLTextAreaElement;
    if (!textarea) {
      return;
    }

    // Strip addon if present before saving
    const strippedText = stripGlobalAddon(textarea.value);
    updatePromptText(strippedText);
    trackPromptEdited();
    trackPromptCopiedFromPage();
    setShowConfirmModal(false);
  };

  const handleDuplicate = () => {
    if (!currentPrompt) {
      return;
    }

    const textToDuplicate = currentPrompt.text;
    const ratingToDuplicate = currentPrompt.rating;

    // Add new prompt (this will move to the new prompt)
    addPrompt();

    // Update the new prompt with the duplicated values
    updatePromptText(textToDuplicate);
    updatePromptRating(ratingToDuplicate);
  };

  // Helper function to construct full prompt text with global addon
  const getFullPromptText = useCallback((promptText: string): string => {
    if (globalPromptAddonEnabled && globalPromptAddon.trim()) {
      return `${promptText}, ${globalPromptAddon.trim()}`;
    }
    return promptText;
  }, [globalPromptAddonEnabled, globalPromptAddon]);

  // Helper function to strip global addon from text
  const stripGlobalAddon = (text: string): string => {
    if (globalPromptAddonEnabled && globalPromptAddon.trim()) {
      const addonText = `, ${globalPromptAddon.trim()}`;
      // Check if text ends with the addon (including comma)
      if (text.endsWith(addonText)) {
        return text.slice(0, -addonText.length).trim();
      }
    }
    return text;
  };

  const handlePlayClick = () => {
    if (!currentPrompt) {
      return;
    }

    // Track video make action
    trackVideoMakeClicked();

    // Apply prompt with prefix, global addon, and click Make button
    const fullPromptText = getFullPromptText(currentPrompt.text);
    applyPromptAndMake(fullPromptText, prefix);
  };

  const stopAutoMakeNext = useCallback(() => {
    if (autoMakeNextTimeoutRef.current) {
      window.clearTimeout(autoMakeNextTimeoutRef.current);
      autoMakeNextTimeoutRef.current = null;
    }
    setAutoNavigate(false);
    setIsAutoRunning(false);
  }, []);

  const handleMakeAndNextClick = useCallback(() => {
    if (!currentPrompt) {
      return;
    }

    const nextPostId = getNextPostId();

    if (!nextPostId) {
      // No next post available
      stopAutoMakeNext();
      return;
    }

    // Track video make action and Make+Next specific action
    trackVideoMakeClicked();
    trackMakeAndNextClicked();

    // Apply prompt with global addon, make video, and navigate to next post
    const fullPromptText = getFullPromptText(currentPrompt.text);
    applyPromptMakeAndNext(fullPromptText, prefix, nextPostId);

    // If random prompt is enabled, select a random prompt from current pack
    if (randomPrompt && promptCount > 0) {
      const randomIndex = Math.floor(Math.random() * promptCount);
      setCurrentIndex(randomIndex);
    }

    // If auto-navigate is enabled, schedule the next iteration
    if (autoNavigate) {
      setIsAutoRunning(true); // Mark auto loop as running
      const delay = 1000 + Math.random() * 500; // Random delay between 1-1.5s
      autoMakeNextTimeoutRef.current = window.setTimeout(() => {
        const hasNextPost = getNextPostId();
        // Re-check if auto-navigate is still enabled and next post exists
        if (autoNavigate && hasNextPost) {
          handleMakeAndNextClick();
        } else {
          // Turn off auto-navigate when reaching the final post
          stopAutoMakeNext();
        }
      }, delay);
    }
  }, [currentPrompt, autoNavigate, randomPrompt, promptCount, prefix, getNextPostId, stopAutoMakeNext, getFullPromptText, setCurrentIndex]);

  // Cleanup auto Make+Next timeout on unmount
  React.useEffect(() => {
    return () => {
      stopAutoMakeNext();
    };
  }, [stopAutoMakeNext]);

  const handlePrevClick = () => {
    const prevPostId = getPrevPostId();

    if (!prevPostId) {
      // No previous post available
      return;
    }

    // Navigate to previous post using soft navigation
    navigateToPost(prevPostId);
  };

  const handleNextClick = () => {
    const nextPostId = getNextPostId();

    if (!nextPostId) {
      // No next post available
      return;
    }

    // Navigate to next post using soft navigation
    navigateToPost(nextPostId);
  };

  // Check if both prompt and prefix are empty
  const isPromptAndPrefixEmpty = !currentPrompt?.text.trim() && !prefix.trim();

  // If no post ID, show a message instead of the prompt content
  if (!postId) {
    return <NoPostMessage subMessage={t('prompt.status.navigateToPost')} />;
  }

  return (
    <div className="flex flex-col w-full">
      <PackManager />

      {/* Prefix input */}
      <div className="mt-3">
        <label
          className="text-xs mb-1 block"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          Prefix (applied when pressing Make)
        </label>
        <input
          type="text"
          value={prefix}
          onChange={(e) => handlePrefixChange(e.target.value)}
          placeholder={t('prompt.prefixPlaceholder')}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none backdrop-blur-xl"
          style={{
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            color: colors.TEXT_PRIMARY,
            border: `1px solid ${colors.BORDER}`,
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
          }}
        />
      </div>

      {/* Prompt textarea */}
      <textarea
        value={currentPrompt?.text || ''}
        onChange={(e) => updatePromptText(e.target.value)}
        placeholder={t('prompt.placeholder')}
        className="w-full h-32 px-3 py-2 rounded-lg text-sm resize-none focus:outline-none custom-scrollbar mt-3 backdrop-blur-xl"
        style={{
          backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
          color: colors.TEXT_PRIMARY,
          border: `1px solid ${colors.BORDER}`,
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)',
        }}
      />

      <div className="flex flex-col gap-3 mt-3">
        {/* Rating and pagination merged */}
        <div className="flex items-center justify-between gap-2">
          {/* Rating on the left */}
          <RatingSystem
            rating={currentPrompt?.rating || 0}
            onChange={updatePromptRating}
          />

          {/* Pagination on the right */}
          <div className="flex items-center gap-2">
            <Button
              variant="icon"
              icon={mdiChevronLeft}
              onClick={() => {
                if (!isLongPressingRef.current) {
                  prevPrompt();
                  trackPromptNavigated('prev');
                }
              }}
              onMouseDown={() => startLongPress('prev')}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              onTouchStart={() => startLongPress('prev')}
              onTouchEnd={stopLongPress}
              disabled={currentIndex === 0}
              tooltip={t('prompt.previousTooltip')}
            />

            <span className="text-sm" style={{ color: colors.TEXT_SECONDARY }}>
              {currentIndex + 1} / {promptCount}
            </span>

            <Button
              variant="icon"
              icon={mdiChevronRight}
              onClick={() => {
                if (!isLongPressingRef.current) {
                  nextPrompt();
                  trackPromptNavigated('next');
                }
              }}
              onMouseDown={() => startLongPress('next')}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              onTouchStart={() => startLongPress('next')}
              onTouchEnd={stopLongPress}
              disabled={currentIndex >= promptCount - 1}
              tooltip={t('prompt.nextTooltip')}
            />
          </div>
        </div>

        {/* Action buttons row 1 */}
        <div className="flex gap-2">
          <Button
            onClick={handleCopyToPage}
            icon={mdiArrowDown}
            className="flex-1"
            tooltip={t('prompt.toTooltip')}
          >
            To
          </Button>

          <Button
            onClick={handleCopyFromPage}
            icon={mdiArrowUp}
            className="flex-1"
            tooltip={t('prompt.fromTooltip')}
          >
            From
          </Button>

          <Button
            onClick={() => {
              if (currentPrompt) {
                navigator.clipboard.writeText(currentPrompt.text);
                trackPromptCopiedToClipboard();
              }
            }}
            icon={mdiContentCopy}
            className="flex-1"
            tooltip={t('prompt.copyTooltip')}
          >
            {t('common.copy')}
          </Button>
        </div>

        {/* Action buttons row 2 */}
        <div className="flex gap-2">
          <Button
            onClick={addPrompt}
            icon={mdiPlus}
            className="flex-1"
            tooltip={t('prompt.addTooltip')}
          >
            {t('common.add')}
          </Button>

          <Button
            onClick={handleDuplicate}
            icon={mdiContentDuplicate}
            className="flex-1"
            tooltip={t('prompt.duplicateTooltip')}
          >
            Duplicate
          </Button>

          <Button
            onClick={handlePlayClick}
            icon={mdiPlay}
            iconColor={colors.BACKGROUND_DARK}
            className="flex-1"
            style={{
              backgroundColor: colors.TEXT_PRIMARY,
              color: colors.BACKGROUND_DARK,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
              e.currentTarget.style.color = colors.BACKGROUND_DARK;
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
              e.currentTarget.style.color = colors.BACKGROUND_DARK;
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            disabled={isPromptAndPrefixEmpty}
            tooltip={t('prompt.makeTooltip')}
          >
            {t('common.make')}
          </Button>
        </div>

        {/* Action buttons row 3 - Post navigation and Make + Next */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 flex justify-between">
            <Button
              variant="icon"
              icon={mdiChevronDoubleLeft}
              onClick={handlePrevClick}
              disabled={!getPrevPostId()}
              tooltip={t('prompt.navigatePreviousPost')}
            />
            <Button
              variant="icon"
              icon={mdiChevronDoubleRight}
              onClick={handleNextClick}
              disabled={!getNextPostId()}
              tooltip={t('prompt.navigateNextPost')}
            />
          </div>

          <div className="col-span-2 flex">
            <Button
              onClick={handleMakeAndNextClick}
              icon={mdiSkipNext}
              iconColor={colors.BACKGROUND_DARK}
              className="!rounded-r-none"
              style={{
                width: '60%',
                backgroundColor: colors.TEXT_PRIMARY,
                color: colors.BACKGROUND_DARK,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.color = colors.BACKGROUND_DARK;
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.color = colors.BACKGROUND_DARK;
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              disabled={!getNextPostId() || isPromptAndPrefixEmpty}
              tooltip={t('prompt.makeAndNextTooltip')}
            >
              Make + Next
            </Button>
            <Button
              variant="icon"
              icon={mdiShuffle}
              onClick={() => setRandomPrompt(!randomPrompt)}
              tooltip="Random: Pick random prompt from pack on next"
              className="!rounded-none !border-l-0"
              style={{
                width: '20%',
                ...(randomPrompt && {
                  backgroundColor: colors.TEXT_PRIMARY,
                  borderColor: colors.TEXT_PRIMARY,
                }),
              }}
              iconColor={randomPrompt ? colors.BACKGROUND_DARK : undefined}
              onMouseEnter={randomPrompt ? (e) => {
                e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.borderColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.opacity = '0.9';
              } : undefined}
              onMouseLeave={randomPrompt ? (e) => {
                e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.borderColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              } : undefined}
            />
            <Button
              variant="icon"
              icon={isAutoRunning ? mdiStop : mdiAutorenew}
              onClick={() => {
                if (isAutoRunning) {
                  // Stop the running auto loop
                  stopAutoMakeNext();
                } else {
                  // Toggle auto-navigate on/off
                  setAutoNavigate(!autoNavigate);
                }
              }}
              tooltip={isAutoRunning ? t('prompt.stopAutoTooltip') : t('prompt.autoMakeNextTooltip')}
              className="!rounded-l-none !border-l-0"
              style={{
                width: '20%',
                ...((autoNavigate || isAutoRunning) && {
                  backgroundColor: colors.TEXT_PRIMARY,
                  borderColor: colors.TEXT_PRIMARY,
                }),
              }}
              iconColor={(autoNavigate || isAutoRunning) ? colors.BACKGROUND_DARK : undefined}
              onMouseEnter={(autoNavigate || isAutoRunning) ? (e) => {
                e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.borderColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.opacity = '0.9';
              } : undefined}
              onMouseLeave={(autoNavigate || isAutoRunning) ? (e) => {
                e.currentTarget.style.backgroundColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.borderColor = colors.TEXT_PRIMARY;
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              } : undefined}
              disabled={!getNextPostId() || isPromptAndPrefixEmpty}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title={t('modals.confirmReplace.title')}
        message={t('modals.confirmReplace.message')}
        confirmText={t('modals.confirmReplace.confirmText')}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCopyFromPage}
        getThemeColors={getThemeColors}
        variant="warning"
      />
    </div>
  );
};
