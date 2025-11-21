/**
 * Prompt management view component
 */

import React from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PackManager } from './PackManager';
import { RatingSystem } from './RatingSystem';
import { Button } from './Button';
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
} from '@mdi/js';
import { useTranslation } from '@/contexts/I18nContext';
import { trackPromptEdited, trackVideoMakeClicked } from '@/utils/analytics';

export const PromptView: React.FC = () => {
  const {
    currentIndex,
    getCurrentPrompt,
    getCurrentPromptCount,
    updatePromptText,
    updatePromptRating,
    nextPrompt,
    prevPrompt,
    addPrompt,
    removePrompt,
  } = usePromptStore();
  const { getThemeColors } = useSettingsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();

  const currentPrompt = getCurrentPrompt();
  const promptCount = getCurrentPromptCount();

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
    }
  };

  const handleCopyFromPage = () => {
    const textarea = document.querySelector(SELECTORS.TEXTAREA) as HTMLTextAreaElement;
    if (textarea) {
      updatePromptText(textarea.value);
      trackPromptEdited();
    }
  };

  const handlePlayClick = () => {
    // Copy prompt to page
    handleCopyToPage();

    // Track video make action
    trackVideoMakeClicked();

    // Find and click the "Make video" button by aria-label
    setTimeout(() => {
      const makeVideoBtn = document.querySelector(SELECTORS.MAKE_VIDEO_BUTTON) as HTMLElement;
      if (makeVideoBtn) {
        console.log('[ImagineGodMode] Found Make video button:', makeVideoBtn);

        // Dispatch a proper pointer/mouse event sequence to trigger React handlers
        const events = [
          new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }),
          new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true }),
          new PointerEvent('pointerup', { bubbles: true, cancelable: true, composed: true }),
          new MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true }),
          new MouseEvent('click', { bubbles: true, cancelable: true, composed: true })
        ];

        events.forEach(event => makeVideoBtn.dispatchEvent(event));
      } else {
        console.warn('[ImagineGodMode] Make video button not found');
      }
    }, 100);
  };

  return (
    <div className="flex flex-col w-full">
      <PackManager />

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
              onClick={prevPrompt}
              disabled={currentIndex === 0}
              tooltip="Previous prompt (Left arrow)"
            />

            <span className="text-sm" style={{ color: colors.TEXT_SECONDARY }}>
              {currentIndex + 1} / {promptCount}
            </span>

            <Button
              variant="icon"
              icon={mdiChevronRight}
              onClick={nextPrompt}
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
      </div>
    </div>
  );
};
