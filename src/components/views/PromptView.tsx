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
import { NoPostMessage } from '../common/NoPostMessage';
import { applyPromptAndMake, applyPromptMakeAndNext } from '@/utils/promptActions';

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
  const { getThemeColors, rememberPostState } = useSettingsStore();
  const { getNextPostId, setCurrentPostId } = usePostsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();

  const currentPrompt = getCurrentPrompt();
  const promptCount = getCurrentPromptCount();

  const [prefix, setLocalPrefix] = useState<string>('');
  const [postId, setPostId] = useState<string | null>(null);

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
  }, [loadPostData]);

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
    if (textarea) {
      updatePromptText(textarea.value);
      trackPromptEdited();
      trackPromptCopiedFromPage();
    }
  };

  const handlePlayClick = () => {
    if (!currentPrompt) return;

    // Track video make action
    trackVideoMakeClicked();

    // Apply prompt with prefix and click Make button
    applyPromptAndMake(currentPrompt.text, prefix);
  };

  const handleMakeAndNextClick = () => {
    if (!currentPrompt) return;

    const nextPostId = getNextPostId();

    if (!nextPostId) {
      // No next post available
      return;
    }

    // Track video make action and Make+Next specific action
    trackVideoMakeClicked();
    trackMakeAndNextClicked();

    // Apply prompt, make video, and navigate to next post
    applyPromptMakeAndNext(currentPrompt.text, prefix, nextPostId);
  };

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
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{
            backgroundColor: colors.BACKGROUND_MEDIUM,
            color: colors.TEXT_PRIMARY,
            border: `1px solid ${colors.BORDER}`,
          }}
        />
      </div>

      {/* Prompt textarea */}
      <textarea
        value={currentPrompt?.text || ''}
        onChange={(e) => updatePromptText(e.target.value)}
        placeholder={t('prompt.placeholder')}
        className="w-full h-32 px-3 py-2 rounded-lg text-sm resize-none focus:outline-none custom-scrollbar mt-3"
        style={{
          backgroundColor: colors.BACKGROUND_MEDIUM,
          color: colors.TEXT_PRIMARY,
          border: `1px solid ${colors.BORDER}`,
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
            tooltip={t('prompt.makeTooltip')}
          >
            {t('common.make')}
          </Button>
        </div>

        {/* Action buttons row 3 - Make + Next */}
        <div className="flex gap-2">
          <Button
            onClick={handleMakeAndNextClick}
            icon={mdiSkipNext}
            iconColor={UI_COLORS.BLACK}
            className="w-full !bg-white !text-black hover:!bg-white/90"
            disabled={!getNextPostId()}
            tooltip="Make video and navigate to next post"
          >
            Make + Next
          </Button>
        </div>
      </div>
    </div>
  );
};
