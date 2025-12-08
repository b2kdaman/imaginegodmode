/**
 * Individual prompt item component
 * Supports drag-and-drop for moving prompts between packs
 */

import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/inputs/Button';
import { usePromptStore } from '@/store/usePromptStore';
import { usePacksManagementStore } from './usePacksManagementStore';
import { mdiDrag, mdiStar, mdiStarOutline, mdiPencil, mdiDelete, mdiCheck, mdiClose, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiContentDuplicate } from '@mdi/js';
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
  const { deletePromptByIndex, updatePromptByIndex, duplicatePromptByIndex } = usePromptStore();
  const { isSelectionMode, selectedPromptIndices, togglePromptSelection, setStatusMessage } = usePacksManagementStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isPromptDragOver, setIsPromptDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(prompt.text);

  const isSelected = selectedPromptIndices.has(index);

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

  const handleEditClick = () => {
    setEditText(prompt.text);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== prompt.text) {
      updatePromptByIndex(packName, index, editText.trim());
      setStatusMessage('Prompt updated');
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(prompt.text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deletePromptByIndex(packName, index);
    setStatusMessage('Prompt deleted');
  };

  const handleDuplicate = () => {
    duplicatePromptByIndex(packName, index);
    setStatusMessage('Prompt duplicated');
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePromptSelection(index);
  };

  return (
    <div
      draggable={!isSelectionMode && !isEditing && isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="p-3 mb-2 rounded-lg transition-all"
      style={{
        backgroundColor: isSelected
          ? `${colors.SUCCESS}20`
          : isPromptDragOver
          ? `${colors.TEXT_SECONDARY}20`
          : colors.BACKGROUND_DARK,
        border: `1px solid ${
          isSelected
            ? colors.SUCCESS
            : isPromptDragOver
            ? colors.TEXT_SECONDARY
            : colors.BORDER
        }`,
        opacity: isDragging ? 0.5 : 1,
        cursor: isSelectionMode ? 'pointer' : isDraggable && !isEditing ? 'move' : 'default',
      }}
      onClick={isSelectionMode ? handleCheckboxClick : undefined}
    >
      <div className="flex items-start gap-2">
        {/* Selection Checkbox or Drag Handle */}
        {isSelectionMode ? (
          <Icon
            path={isSelected ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
            size={0.8}
            color={isSelected ? colors.SUCCESS : colors.TEXT_SECONDARY}
          />
        ) : (
          !isEditing && <Icon path={mdiDrag} size={0.7} color={colors.TEXT_SECONDARY} />
        )}

        <div className="flex-1 min-w-0">
          {isEditing ? (
            /* Edit Mode */
            <div className="flex flex-col gap-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-2 py-1 rounded text-sm resize-none custom-scrollbar"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: 'none',
                  outline: 'none',
                  minHeight: '60px',
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="flex gap-1 justify-end">
                <Button
                  icon={mdiCheck}
                  iconSize={0.6}
                  variant="icon"
                  onClick={handleSaveEdit}
                  tooltip="Save"
                />
                <Button
                  icon={mdiClose}
                  iconSize={0.6}
                  variant="icon"
                  onClick={handleCancelEdit}
                  tooltip="Cancel"
                />
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              <p
                className="text-sm line-clamp-2 break-words"
                style={{ color: colors.TEXT_PRIMARY, wordBreak: 'break-word', overflowWrap: 'break-word' }}
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
            </>
          )}
        </div>

        {/* Action Buttons (only show when not in selection mode and not editing) */}
        {!isSelectionMode && !isEditing && (
          <div className="flex gap-1">
            <Button
              icon={mdiPencil}
              iconSize={0.6}
              variant="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick();
              }}
              tooltip="Edit prompt"
            />
            <Button
              icon={mdiContentDuplicate}
              iconSize={0.6}
              variant="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate();
              }}
              tooltip="Duplicate prompt"
            />
            <Button
              icon={mdiDelete}
              iconSize={0.6}
              variant="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              tooltip="Delete prompt"
            />
          </div>
        )}
      </div>
    </div>
  );
};
