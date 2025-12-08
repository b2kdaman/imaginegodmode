/**
 * Individual prompt item component
 * Supports drag-and-drop for moving prompts between packs
 */

import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { mdiDrag, mdiStar, mdiStarOutline } from '@mdi/js';
import type { PromptListItemProps } from './types';

export const PromptListItem: React.FC<PromptListItemProps> = ({
  prompt,
  index,
  packName,
  isDraggable,
  onDragStart,
  onDragEnd,
  onPromptMove,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const [isDragging, setIsDragging] = useState(false);
  const [isPromptDragOver, setIsPromptDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }

    console.log('[DnD] Starting prompt drag:', { index, packName });
    setIsDragging(true);
    onDragStart(index);

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'prompt',
      promptIndex: index,
      sourcePack: packName,
    }));
    // Also set plain text as fallback
    e.dataTransfer.setData('text/plain', `prompt:${index}:${packName}`);
  };

  const handleDragEnd = () => {
    console.log('[DnD] Ending prompt drag');
    setIsDragging(false);
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsPromptDragOver(true);
  };

  const handleDragLeave = () => {
    setIsPromptDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPromptDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      if (data.type === 'prompt' && data.sourcePack === packName) {
        // Prompt reordering within the same pack
        const { promptIndex } = data;
        console.log('[DnD] Drop prompt on prompt:', { dragIndex: promptIndex, hoverIndex: index });
        if (onPromptMove && promptIndex !== index) {
          onPromptMove(promptIndex, index);
        }
      }
    } catch (error) {
      console.error('[DnD] Failed to parse drop data:', error);
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="p-3 mb-2 rounded-lg transition-all"
      style={{
        backgroundColor: isPromptDragOver
          ? `${colors.TEXT_SECONDARY}20`
          : colors.BACKGROUND_DARK,
        border: `1px solid ${
          isPromptDragOver ? colors.TEXT_SECONDARY : colors.BORDER
        }`,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDraggable ? 'move' : 'default',
      }}
    >
      <div className="flex items-start gap-2">
        <Icon path={mdiDrag} size={0.7} color={colors.TEXT_SECONDARY} />

        <div className="flex-1 min-w-0">
          <p
            className="text-sm line-clamp-2"
            style={{ color: colors.TEXT_PRIMARY }}
          >
            {prompt.text || (
              <em style={{ color: colors.TEXT_SECONDARY }}>Empty prompt</em>
            )}
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                path={star <= prompt.rating ? mdiStar : mdiStarOutline}
                size={0.5}
                color={
                  star <= prompt.rating ? '#fbbf24' : colors.TEXT_SECONDARY
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
