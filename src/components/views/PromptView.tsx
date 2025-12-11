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
import { UI_COLORS, SELECTORS } from '@/utils/constants';
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiPlus,
  mdiMinus,
  mdiPlay,
  mdiArrowDown,
  mdiArrowUp,
  mdiContentCopy,
  mdiSkipNext,
  mdiChevronDoubleRight,
  mdiChevronDoubleLeft,
  mdiAutorenew,
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
    removePrompt,
    loadPostState,
    savePostState,
  } = usePromptStore();
  const { getThemeColors, rememberPostState, confirmCopyFrom } = useSettingsStore();
  const { getNextPostId, getPrevPostId, setCurrentPostId, setPosts } = usePostsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();

  const currentPrompt = getCurrentPrompt();
  const promptCount = getCurrentPromptCount();

  const [prefix, setLocalPrefix] = useState<string>('');
  const [postId, setPostId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [autoNavigate, setAutoNavigate] = useState(false);

  // Load liked posts hook
  const { loadLikedPosts } = useLikedPostsLoader(() => {});

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

  // Load post data on mount
  useEffect(() => {
    loadPostData();
    // Load liked posts on mount to populate posts store for navigation
    loadLikedPosts().then((posts) => setPosts(posts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // If empty or confirmation disabled, copy directly
    updatePromptText(textarea.value);
    trackPromptEdited();
    trackPromptCopiedFromPage();
  };

  const handleConfirmCopyFromPage = () => {
    const textarea = document.querySelector(SELECTORS.TEXTAREA) as HTMLTextAreaElement;
    if (!textarea) {
      return;
    }

    updatePromptText(textarea.value);
    trackPromptEdited();
    trackPromptCopiedFromPage();
    setShowConfirmModal(false);
  };

  const handlePlayClick = () => {
    if (!currentPrompt) {
      return;
    }

    // Track video make action
    trackVideoMakeClicked();

    // Apply prompt with prefix and click Make button
    applyPromptAndMake(currentPrompt.text, prefix);
  };

  const handleMakeAndNextClick = () => {
    if (!currentPrompt) {
      return;
    }

    const nextPostId = getNextPostId();

    if (!nextPostId) {
      // No next post available
      setAutoNavigate(false); // Stop auto-navigation if no next post
      return;
    }

    // Track video make action and Make+Next specific action
    trackVideoMakeClicked();
    trackMakeAndNextClicked();

    // Apply prompt, make video, and navigate to next post
    applyPromptMakeAndNext(currentPrompt.text, prefix, nextPostId);

    // If auto-navigate is enabled, schedule the next iteration
    if (autoNavigate) {
      const delay = 1000 + Math.random() * 500; // Random delay between 1-1.5s
      setTimeout(() => {
        // Re-check if auto-navigate is still enabled and next post exists
        if (autoNavigate && getNextPostId()) {
          handleMakeAndNextClick();
        }
      }, delay);
    }
  };

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
    return <NoPostMessage subMessage="Navigate to a post to manage prompts" />;
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
          placeholder="Enter prefix text..."
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
                prevPrompt();
                trackPromptNavigated('prev');
              }}
              disabled={currentIndex === 0}
              tooltip="Previous prompt (Left arrow)"
            />

            <span className="text-sm" style={{ color: colors.TEXT_SECONDARY }}>
              {currentIndex + 1} / {promptCount}
            </span>

            <Button
              variant="icon"
              icon={mdiChevronRight}
              onClick={() => {
                nextPrompt();
                trackPromptNavigated('next');
              }}
              disabled={currentIndex >= promptCount - 1}
              tooltip="Next prompt (Right arrow)"
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
            onClick={removePrompt}
            icon={mdiMinus}
            disabled={promptCount <= 1}
            className="flex-1"
            tooltip={t('prompt.removeTooltip')}
          >
            {t('common.remove')}
          </Button>

          <Button
            onClick={handlePlayClick}
            icon={mdiPlay}
            iconColor={UI_COLORS.BLACK}
            className="flex-1 !bg-white !text-black hover:!bg-white/90"
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
              tooltip="Navigate to previous post"
            />
            <Button
              variant="icon"
              icon={mdiChevronDoubleRight}
              onClick={handleNextClick}
              disabled={!getNextPostId()}
              tooltip="Navigate to next post"
            />
          </div>

          <div className="col-span-2 flex gap-2">
            <Button
              onClick={handleMakeAndNextClick}
              icon={mdiSkipNext}
              iconColor={UI_COLORS.BLACK}
              className="flex-1 !bg-white !text-black hover:!bg-white/90"
              disabled={!getNextPostId() || isPromptAndPrefixEmpty}
              tooltip="Make video and navigate to next post"
            >
              Make + Next
            </Button>
            <Button
              variant="icon"
              icon={mdiAutorenew}
              onClick={() => setAutoNavigate(!autoNavigate)}
              tooltip="Auto: Automatically repeat Make + Next with 1-1.5s delay"
              className={autoNavigate ? '!bg-slate-400 !border-slate-400' : ''}
              iconColor={autoNavigate ? UI_COLORS.BLACK : undefined}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Replace Prompt Text?"
        message="This will replace the current prompt text. Are you sure you want to continue?"
        confirmText="Replace"
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCopyFromPage}
        getThemeColors={getThemeColors}
        variant="warning"
      />
    </div>
  );
};
