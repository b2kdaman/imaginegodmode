/**
 * Right panel component showing prompts from selected pack
 * Displays all prompts with drag-and-drop functionality
 */

import React from 'react';
import { Icon } from '@/components/common/Icon';
import { PromptListItem } from './PromptListItem';
import { mdiPackageVariant } from '@mdi/js';
import type { PromptsPanelProps } from './types';

export const PromptsPanel: React.FC<PromptsPanelProps> = ({
  packName,
  prompts,
  onDragStart,
  onDragEnd,
  onReorderPrompts,
  getThemeColors,
}) => {
  const colors = getThemeColors();

  // Filter out empty prompts
  const nonEmptyPrompts = prompts.filter(prompt => prompt.text && prompt.text.trim() !== '');

  return (
    <div
      className="flex flex-col"
      style={{ flex: '0 0 66.667%', minWidth: 0 }}
    >
      {/* Header */}
      <div
        className="px-3 border-b flex items-center"
        style={{ borderColor: colors.BORDER, height: '44px' }}
      >
        <h3
          className="text-sm font-semibold truncate"
          style={{ color: colors.TEXT_PRIMARY }}
        >
          {packName} ({nonEmptyPrompts.length} prompt{nonEmptyPrompts.length !== 1 ? 's' : ''})
        </h3>
      </div>

      {/* Scrollable Prompts List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pl-2 pr-3 py-2">
        {nonEmptyPrompts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            <Icon path={mdiPackageVariant} size={2} color={colors.TEXT_SECONDARY} />
            <p className="mt-2 text-sm">No prompts in this pack</p>
          </div>
        ) : (
          nonEmptyPrompts.map((prompt, index) => (
            <PromptListItem
              key={index}
              prompt={prompt}
              index={index}
              packName={packName}
              isDraggable={true}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onPromptMove={onReorderPrompts}
              getThemeColors={getThemeColors}
            />
          ))
        )}
      </div>
    </div>
  );
};
