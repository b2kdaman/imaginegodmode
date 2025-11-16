/**
 * Prompt management view component
 */

import React from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { CategoryManager } from './CategoryManager';
import { RatingSystem } from './RatingSystem';
import { Icon } from './Icon';
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
          <button
            onClick={prevPrompt}
            disabled={currentIndex === 0}
            className="w-9 h-9 rounded-full bg-grok-gray text-white border border-white/20 hover:bg-grok-light transition-colors disabled:opacity-30 flex items-center justify-center"
          >
            <Icon path={mdiChevronLeft} size={0.8} />
          </button>

          <span className="text-sm text-white/70">
            {currentIndex + 1} / {promptCount}
          </span>

          <button
            onClick={nextPrompt}
            disabled={currentIndex >= promptCount - 1}
            className="w-9 h-9 rounded-full bg-grok-gray text-white border border-white/20 hover:bg-grok-light transition-colors disabled:opacity-30 flex items-center justify-center"
          >
            <Icon path={mdiChevronRight} size={0.8} />
          </button>
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
          <button
            onClick={handleCopyToPage}
            className="flex-1 px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors flex items-center justify-center gap-1"
            title="Copy prompt to page textarea"
          >
            <Icon path={mdiArrowDown} size={0.6} />
            To
          </button>

          <button
            onClick={handleCopyFromPage}
            className="flex-1 px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors flex items-center justify-center gap-1"
            title="Copy from page textarea"
          >
            <Icon path={mdiArrowUp} size={0.6} />
            From
          </button>

          <button
            onClick={() => {
              if (currentPrompt) {
                navigator.clipboard.writeText(currentPrompt.text);
              }
            }}
            className="flex-1 px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors flex items-center justify-center gap-1"
            title="Copy to clipboard"
          >
            <Icon path={mdiContentCopy} size={0.6} />
            Copy
          </button>
        </div>

        {/* Action buttons row 2 */}
        <div className="flex gap-2">
          <button
            onClick={addPrompt}
            className="flex-1 px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors flex items-center justify-center gap-1"
            title="Add new prompt"
          >
            <Icon path={mdiPlus} size={0.6} />
            Add
          </button>

          <button
            onClick={removePrompt}
            disabled={promptCount <= 1}
            className="flex-1 px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors disabled:opacity-30 flex items-center justify-center gap-1"
            title="Remove current prompt"
          >
            <Icon path={mdiMinus} size={0.6} />
            Remove
          </button>

          <button
            onClick={handlePlayClick}
            className="flex-1 px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors flex items-center justify-center gap-1"
            title="Copy prompt and click Make a Video (Ctrl/Cmd+Enter)"
          >
            <Icon path={mdiPlay} size={0.6} />
            Play
          </button>
        </div>
      </div>
    </div>
  );
};
