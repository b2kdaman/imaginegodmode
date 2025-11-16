/**
 * Prompt management view component
 */

import React from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CategoryManager } from './CategoryManager';
import { RatingSystem } from './RatingSystem';
import { Button } from './Button';
import { UI_COLORS } from '@/utils/constants';
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
  const colors = getThemeColors();

  const currentPrompt = getCurrentPrompt();
  const promptCount = getCurrentPromptCount();

  const handleCopyToPage = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea && currentPrompt) {
      textarea.value = currentPrompt.text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleCopyFromPage = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      updatePromptText(textarea.value);
    }
  };

  const handlePlayClick = () => {
    // Copy prompt to page
    handleCopyToPage();

    // Find and click the "Make a video" button by aria-label
    setTimeout(() => {
      const makeVideoBtn = document.querySelector('button[aria-label="Make a video"]') as HTMLButtonElement;
      if (makeVideoBtn) {
        makeVideoBtn.click();
      }
    }, 100);
  };

  return (
    <div className="flex flex-col w-full">
      <CategoryManager />

      {/* Prompt textarea */}
      <textarea
        value={currentPrompt?.text || ''}
        onChange={(e) => updatePromptText(e.target.value)}
        placeholder="Enter your prompt..."
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
            tooltip="Copy prompt to page textarea"
          >
            To
          </Button>

          <Button
            onClick={handleCopyFromPage}
            icon={mdiArrowUp}
            className="flex-1"
            tooltip="Copy from page textarea"
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
            tooltip="Copy to clipboard"
          >
            Copy
          </Button>
        </div>

        {/* Action buttons row 2 */}
        <div className="flex gap-2">
          <Button
            onClick={addPrompt}
            icon={mdiPlus}
            className="flex-1"
            tooltip="Add new prompt"
          >
            Add
          </Button>

          <Button
            onClick={removePrompt}
            icon={mdiMinus}
            disabled={promptCount <= 1}
            className="flex-1"
            tooltip="Remove current prompt"
          >
            Remove
          </Button>

          <Button
            onClick={handlePlayClick}
            icon={mdiPlay}
            iconColor={UI_COLORS.BLACK}
            className="flex-1 !bg-white !text-black hover:!bg-white/90"
            tooltip="Copy prompt and click Make a Video (Ctrl/Cmd+Enter)"
          >
            Make
          </Button>
        </div>
      </div>
    </div>
  );
};
