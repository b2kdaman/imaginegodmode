/**
 * Individual pack item component
 * Supports inline renaming, deletion, and drag-and-drop target
 */

import React, { useState } from 'react';
import { Button } from '@/components/inputs/Button';
import { Icon } from '@/components/common/Icon';
import { usePromptStore } from '@/store/usePromptStore';
import { usePacksManagementStore } from './usePacksManagementStore';
import { mdiPencil, mdiDelete, mdiDrag, mdiEmoticonSadOutline, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiCheck, mdiClose } from '@mdi/js';
import type { PackListItemProps } from './types';

export const PackListItem: React.FC<PackListItemProps> = ({
  packName,
  index,
  promptCount,
  onRename,
  onDelete,
  onDropPrompt,
  onPackMove,
  getThemeColors,
}) => {
  const { currentPack } = usePromptStore();
  const {
    selectedPackName,
    setSelectedPackName,
    setIsPackDragging,
    isPackSelectionMode,
    selectedPackNames,
    togglePackSelection,
  } = usePacksManagementStore();
  const isSelected = packName === selectedPackName;
  const isCurrent = packName === currentPack;
  const isPackSelected = selectedPackNames.has(packName);
  const isDraggable = true;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(packName);
  const [isPromptDragOver, setIsPromptDragOver] = useState(false);
  const [isPackDragOver, setIsPackDragOver] = useState(false);
  const [isLocalPackDragging, setIsLocalPackDragging] = useState(false);
  const colors = getThemeColors();

  // Pack reordering drag handlers
  const handlePackDragStart = (e: React.DragEvent) => {
    if (!isDraggable || isEditing || index === undefined) {
      e.preventDefault();
      return;
    }

    console.log('[DnD] Starting pack drag:', { packName, index });
    setIsLocalPackDragging(true);
    setIsPackDragging(true);

    // Restrict to vertical-only dragging by setting effectAllowed to 'move'
    e.dataTransfer.effectAllowed = 'move';

    // Create custom drag image to indicate vertical-only movement
    const dragElement = e.currentTarget as HTMLElement;
    const clone = dragElement.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.width = dragElement.offsetWidth + 'px';
    clone.style.opacity = '0.8';
    document.body.appendChild(clone);
    e.dataTransfer.setDragImage(clone, 0, 0);
    setTimeout(() => document.body.removeChild(clone), 0);

    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'pack',
      packIndex: index,
    }));
    // Also set plain text as fallback
    e.dataTransfer.setData('text/plain', `pack:${index}`);
  };

  const handlePackDragEnd = () => {
    console.log('[DnD] Ending pack drag');
    setIsLocalPackDragging(false);
    setIsPackDragging(false);
  };

  // Prompt drop on pack handlers
  const handlePromptDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Check if this is a pack or prompt being dragged
    // We can't access getData during dragover, so check types
    const types = e.dataTransfer.types;
    if (types.includes('application/json')) {
      // Could be either pack or prompt, show default feedback
      setIsPackDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsPromptDragOver(false);
    setIsPackDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPromptDragOver(false);
    setIsPackDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      if (data.type === 'pack') {
        // Pack reordering
        const { packIndex } = data;
        console.log('[DnD] Drop pack on pack:', { dragIndex: packIndex, hoverIndex: index });
        if (onPackMove && packIndex !== index && index !== undefined) {
          onPackMove(packIndex, index);
        }
      } else {
        // Prompt drop on pack
        const { promptIndex, sourcePack } = data;
        console.log('[DnD] Drop prompt on pack:', { packName, promptIndex, sourcePack });
        if (sourcePack !== packName) {
          onDropPrompt(promptIndex, sourcePack);
        }
      }
    } catch (error) {
      console.error('[DnD] Failed to parse drop data:', error);
    }
  };

  const handleRename = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== packName) {
      onRename(packName, trimmedName);
    }
    setIsEditing(false);
    setEditName(packName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditName(packName);
      setIsEditing(false);
    }
  };

  const handlePackClick = () => {
    if (isEditing) {
      return;
    }
    if (isPackSelectionMode) {
      togglePackSelection(packName);
    } else {
      setSelectedPackName(packName);
    }
  };

  return (
    <div
      draggable={!isPackSelectionMode && isDraggable && !isEditing}
      onDragStart={handlePackDragStart}
      onDragEnd={handlePackDragEnd}
      onDragOver={handlePromptDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="p-2 mb-1 rounded-lg transition-all"
      style={{
        backgroundColor: isPackSelected
          ? `${colors.SUCCESS}20`
          : isSelected
          ? colors.BACKGROUND_MEDIUM
          : isPromptDragOver
          ? `${colors.SUCCESS}20`
          : isPackDragOver
          ? `${colors.TEXT_SECONDARY}20`
          : colors.BACKGROUND_DARK,
        border: `1px solid ${
          isPackSelected
            ? colors.SUCCESS
            : isPromptDragOver
            ? colors.SUCCESS
            : isPackDragOver
            ? colors.TEXT_SECONDARY
            : isSelected
            ? colors.TEXT_SECONDARY
            : colors.BORDER
        }`,
        opacity: isLocalPackDragging ? 0.5 : 1,
        cursor: isEditing ? 'text' : isPackSelectionMode ? 'pointer' : isDraggable ? 'ns-resize' : 'pointer',
      }}
      onClick={handlePackClick}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            className="flex-1 px-1 rounded text-sm"
            style={{
              backgroundColor: 'transparent',
              color: colors.TEXT_PRIMARY,
              border: 'none',
              outline: 'none',
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            icon={mdiCheck}
            iconSize={0.5}
            variant="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleRename();
            }}
            tooltip="Save"
          />
          <Button
            icon={mdiClose}
            iconSize={0.5}
            variant="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditName(packName);
              setIsEditing(false);
            }}
            tooltip="Cancel"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          {isPackSelectionMode ? (
            <Icon
              path={isPackSelected ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
              size={0.8}
              color={isPackSelected ? colors.SUCCESS : colors.TEXT_SECONDARY}
            />
          ) : (
            isDraggable && (
              <Icon path={mdiDrag} size={0.6} color={colors.TEXT_SECONDARY} />
            )
          )}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div
              className="font-medium text-sm truncate"
              style={{ color: colors.TEXT_PRIMARY }}
            >
              {packName}
            </div>
            {promptCount === 0 ? (
              <Icon path={mdiEmoticonSadOutline} size={0.6} color={colors.TEXT_SECONDARY} />
            ) : (
              <div
                className="flex items-center justify-center text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5"
                style={{
                  backgroundColor: colors.SUCCESS,
                  color: '#fff',
                }}
              >
                {promptCount}
              </div>
            )}
          </div>

          {!isPackSelectionMode && (
            <div className="flex items-center gap-1">
              {isCurrent && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: colors.SUCCESS,
                    color: '#fff',
                  }}
                >
                  Current
                </span>
              )}

              <Button
                icon={mdiPencil}
                iconSize={0.5}
                variant="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              tooltip="Rename pack"
            />

              <Button
                icon={mdiDelete}
                iconSize={0.5}
                variant="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(packName);
                }}
                tooltip="Delete pack"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
