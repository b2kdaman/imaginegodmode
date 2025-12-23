/**
 * Panel controls component with action buttons
 */

import React, { useState, useCallback } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePromptStore } from '@/store/usePromptStore';
import { usePostsStore } from '@/store/usePostsStore';
import { useUpscaleQueueStore } from '@/store/useUpscaleQueueStore';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '../inputs/Button';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { PauseButton } from '../buttons/PauseButton';
import {
  mdiChevronUp,
  mdiChevronDown,
  mdiPlay,
  mdiSkipNext,
  mdiAutorenew,
  mdiChevronDoubleLeft,
  mdiChevronDoubleRight,
  mdiFormatListBulletedSquare,
  mdiTrayFull,
  mdiDatabase
} from '@mdi/js';
import { applyPromptAndMake, applyPromptMakeAndNext, navigateToPost } from '@/utils/promptActions';
import { getPrefix } from '@/utils/storage';
import { getPostIdFromUrl } from '@/utils/helpers';
import { UI_COLORS } from '@/utils/constants';
import { trackVideoMakeClicked, trackMakeAndNextClicked } from '@/utils/analytics';
import { useUpscaleAll } from '@/hooks/useUpscaleAll';
import { UpscaleAllModal } from '../modals/UpscaleAllModal';
import { fetchLikedPosts } from '@/api/grokApi';

export const PanelControls: React.FC = () => {
  const { isExpanded, toggleExpanded, setCurrentView, setExpanded } = useUIStore();
  const { t } = useTranslation();
  const { globalPromptAddonEnabled, globalPromptAddon, rememberPostState, setRememberPostState, getThemeColors } = useSettingsStore();
  const { getCurrentPrompt } = usePromptStore();
  const { getNextPostId, getPrevPostId, setCurrentPostId: setStoreCurrentPostId, setPosts, posts } = usePostsStore();
  const { queue } = useUpscaleQueueStore();
  const { isModalOpen, likedPosts, openModal, closeModal, handleBulkUpscale } = useUpscaleAll();

  const [autoNavigate, setAutoNavigate] = useState(false);
  const [prefix, setPrefix] = useState<string>('');
  const [currentPostId, setCurrentPostId] = useState<string>('');

  // Load prefix when component mounts or URL changes
  const loadPrefixData = useCallback(async () => {
    const postId = getPostIdFromUrl();
    setCurrentPostId(postId || '');
    setStoreCurrentPostId(postId); // Update posts store with current post ID
    if (postId) {
      const storedPrefix = await getPrefix(postId);
      setPrefix(storedPrefix);
    } else {
      setPrefix('');
    }
  }, [setStoreCurrentPostId]);

  React.useEffect(() => {
    loadPrefixData();
    // Listen for URL changes
    const handleUrlChange = () => {
      loadPrefixData();
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [loadPrefixData]);

  // Load liked posts on mount for next/prev navigation
  React.useEffect(() => {
    const loadPosts = async () => {
      if (posts.length === 0) {
        const response = await fetchLikedPosts(1000);
        if (response.posts) {
          setPosts(response.posts);
        }
      }
    };
    loadPosts();
  }, [posts.length, setPosts]);

  // Helper function to construct full prompt text with global addon
  const getFullPromptText = (promptText: string): string => {
    if (globalPromptAddonEnabled && globalPromptAddon.trim()) {
      return `${promptText}, ${globalPromptAddon.trim()}`;
    }
    return promptText;
  };

  // Make action
  const handleMake = () => {
    const currentPrompt = getCurrentPrompt();
    if (!currentPrompt) {
      return;
    }
    trackVideoMakeClicked();
    const fullPromptText = getFullPromptText(currentPrompt.text);
    applyPromptAndMake(fullPromptText, prefix);
  };

  // Make + Next action
  const handleMakeAndNext = () => {
    const currentPrompt = getCurrentPrompt();
    if (!currentPrompt) {
      return;
    }
    const nextPostId = getNextPostId();
    if (!nextPostId) {
      setAutoNavigate(false);
      return;
    }
    trackVideoMakeClicked();
    trackMakeAndNextClicked();
    const fullPromptText = getFullPromptText(currentPrompt.text);
    applyPromptMakeAndNext(fullPromptText, prefix, nextPostId);
  };

  // Previous post action
  const handlePrevPost = () => {
    const prevPostId = getPrevPostId();
    if (!prevPostId) {
      return;
    }
    navigateToPost(prevPostId);
  };

  // Next post action
  const handleNextPost = () => {
    const nextPostId = getNextPostId();
    if (!nextPostId) {
      return;
    }
    navigateToPost(nextPostId);
  };


  const currentPrompt = getCurrentPrompt();
  const isPromptEmpty = !currentPrompt?.text.trim() && !prefix.trim();
  const hasNextPost = !!getNextPostId();
  const hasPrevPost = !!getPrevPostId();

  // Get prompt text for tooltips (truncate if too long)
  const getPromptForTooltip = () => {
    const fullText = getFullPromptText(currentPrompt?.text || '');
    const maxLength = 100;
    if (fullText.length > maxLength) {
      return fullText.substring(0, maxLength) + '...';
    }
    return fullText;
  };

  // Calculate queue count
  const queueCount = queue.filter((item) => item.status === 'pending' || item.status === 'processing').length;

  // Handle queue button click
  const handleQueueClick = () => {
    setCurrentView('queue');
    if (!isExpanded) {
      setExpanded(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <PauseButton />
        <FullscreenButton />

      {/* Remember Pack Per Post button - only show when panel is expanded */}
      {isExpanded && (
        <Button
          variant="icon"
          onClick={() => setRememberPostState(!rememberPostState)}
          icon={mdiDatabase}
          className={`shadow-lg ${rememberPostState ? '!bg-slate-400 !border-slate-400' : ''}`}
          iconColor={rememberPostState ? UI_COLORS.BLACK : undefined}
          tooltip={
            rememberPostState
              ? "Remember Pack Per Post: ON - Each post remembers its pack"
              : "Remember Pack Per Post: OFF - Click to enable"
          }
        />
      )}

      {/* Shortcut buttons - only show when panel is collapsed */}
      {!isExpanded && (
        <>
          {hasPrevPost && (
            <Button
              variant="icon"
              onClick={handlePrevPost}
              icon={mdiChevronDoubleLeft}
              className="shadow-lg"
              tooltip={t('panel.previousPostTooltip')}
            />
          )}
          {hasNextPost && (
            <Button
              variant="icon"
              onClick={handleNextPost}
              icon={mdiChevronDoubleRight}
              className="shadow-lg"
              tooltip={t('panel.nextPostTooltip')}
            />
          )}
          {currentPostId && !isPromptEmpty && (
            <Button
              variant="icon"
              onClick={handleMake}
              icon={mdiPlay}
              iconColor={UI_COLORS.BLACK}
              className="shadow-lg !bg-white !text-black hover:!bg-white/90"
              tooltip={`Make: ${getPromptForTooltip()}`}
            />
          )}
          {hasNextPost && !isPromptEmpty && (
            <Button
              variant="icon"
              onClick={handleMakeAndNext}
              icon={mdiSkipNext}
              iconColor={UI_COLORS.BLACK}
              className="shadow-lg !bg-white !text-black hover:!bg-white/90"
              tooltip={`Make + Next: ${getPromptForTooltip()}`}
            />
          )}
          {currentPostId && (
            <Button
              variant="icon"
              onClick={() => setAutoNavigate(!autoNavigate)}
              icon={mdiAutorenew}
              className={`shadow-lg ${autoNavigate ? '!bg-slate-400 !border-slate-400' : ''}`}
              iconColor={autoNavigate ? UI_COLORS.BLACK : undefined}
              tooltip={t('panel.autoTooltip')}
            />
          )}
          <Button
            variant="icon"
            onClick={openModal}
            icon={mdiFormatListBulletedSquare}
            className="shadow-lg"
            tooltip={t('panel.upscaleAllLikedTooltip')}
          />
        </>
      )}

      {/* Queue button with badge - only show when there are items in queue */}
      {queueCount > 0 && (
        <div className="relative">
          <Button
            variant="icon"
            onClick={handleQueueClick}
            icon={mdiTrayFull}
            className="shadow-lg"
            tooltip={t('tabs.queueTooltip')}
          />
          <div
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg"
            style={{
              backgroundColor: getThemeColors().SUCCESS,
              color: '#fff',
              padding: '0 4px',
            }}
          >
            {queueCount}
          </div>
        </div>
      )}

      <Button
        variant="icon"
        onClick={toggleExpanded}
        icon={isExpanded ? mdiChevronDown : mdiChevronUp}
        iconSize={0.9}
        className="shadow-lg"
        tooltip={isExpanded ? t('panel.collapseTooltip') : t('panel.expandTooltip')}
      />
      </div>

      {/* Upscale All Modal */}
      <UpscaleAllModal
        isOpen={isModalOpen}
        posts={likedPosts}
        mode="upscale"
        onClose={closeModal}
        onConfirm={handleBulkUpscale}
        getThemeColors={getThemeColors}
      />
    </>
  );
};
