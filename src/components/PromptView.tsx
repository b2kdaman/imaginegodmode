/**
 * Prompt management view component
 */

import React from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { CategoryManager } from './CategoryManager';
import { RatingSystem } from './RatingSystem';
import { Button } from './Button';
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

    // Find and click the "Make a Video" button
    setTimeout(() => {
      const makeVideoBtn = Array.from(document.querySelectorAll('button')).find(
        (btn) => btn.textContent?.includes('Make a Video')
      );
      if (makeVideoBtn) {
        makeVideoBtn.click();
      }
    }, 100);
  };

  return (
    <div className="flex flex-col w-full">
      <CategoryManager />

      <div className="flex flex-col gap-3">
        {/* Prompt counter and navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="icon"
            icon={mdiChevronLeft}
            onClick={prevPrompt}
            disabled={currentIndex === 0}
          />

          <span className="text-sm text-white/70">
            {currentIndex + 1} / {promptCount}
          </span>

          <Button
            variant="icon"
            icon={mdiChevronRight}
            onClick={nextPrompt}
            disabled={currentIndex >= promptCount - 1}
          />
        </div>

        {/* Rating system */}
        <div className="flex justify-center">
          <RatingSystem
            rating={currentPrompt?.rating || 0}
            onChange={updatePromptRating}
          />
        </div>

        {/* Prompt textarea */}
        <textarea
          value={currentPrompt?.text || ''}
          onChange={(e) => updatePromptText(e.target.value)}
          placeholder="Enter your prompt..."
          className="w-full h-32 px-3 py-2 rounded-lg bg-grok-gray text-white border border-white/20 text-sm resize-none focus:outline-none focus:border-white/40 custom-scrollbar"
        />

        {/* Action buttons row 1 */}
        <div className="flex gap-2">
          <Button
            onClick={handleCopyToPage}
            icon={mdiArrowDown}
            className="flex-1"
            title="Copy prompt to page textarea"
          >
            To
          </Button>

          <Button
            onClick={handleCopyFromPage}
            icon={mdiArrowUp}
            className="flex-1"
            title="Copy from page textarea"
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
            title="Copy to clipboard"
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
            title="Add new prompt"
          >
            Add
          </Button>

          <Button
            onClick={removePrompt}
            icon={mdiMinus}
            disabled={promptCount <= 1}
            className="flex-1"
            title="Remove current prompt"
          >
            Remove
          </Button>

          <Button
            onClick={handlePlayClick}
            icon={mdiPlay}
            className="flex-1"
            title="Copy prompt and click Make a Video (Ctrl/Cmd+Enter)"
          >
            Play
          </Button>
        </div>
      </div>
    </div>
  );
};
