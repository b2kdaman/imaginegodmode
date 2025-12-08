/**
 * Right panel component showing prompts from selected pack
 * Displays all prompts with drag-and-drop functionality
 */

import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/inputs/Button';
import { Dropdown } from '@/components/inputs/Dropdown';
import { PromptListItem } from './PromptListItem';
import { usePromptStore } from '@/store/usePromptStore';
import { usePacksManagementStore } from './usePacksManagementStore';
import { mdiPackageVariant, mdiCheckboxMultipleMarked, mdiSelectAll, mdiSelectOff, mdiDelete, mdiSwapHorizontal, mdiPlus } from '@mdi/js';
import type { PromptsPanelProps } from './types';

export const PromptsPanel: React.FC<PromptsPanelProps> = ({
  onReorderPrompts,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const { packs, deletePromptsByIndices, movePromptToPack, addPromptToPack } = usePromptStore();
  const {
    selectedPackName,
    isPackDragging,
    setDraggedPromptIndex,
    isSelectionMode,
    setIsSelectionMode,
    selectedPromptIndices,
    selectAllPrompts,
    deselectAllPrompts,
    setStatusMessage,
  } = usePacksManagementStore();

  const [targetPackForMove, setTargetPackForMove] = useState<string>('');

  const packName = selectedPackName || '';
  const prompts = packs[packName] || [];

  const allPackNames = Object.keys(packs).filter(p => p !== packName);

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
  };

  const handleSelectAll = () => {
    const allIndices = prompts.map((_, i) => i);
    selectAllPrompts(allIndices);
  };

  const handleDeselectAll = () => {
    deselectAllPrompts();
  };

  const handleBatchDelete = () => {
    if (selectedPromptIndices.size === 0) {
      setStatusMessage('No prompts selected');
      return;
    }

    const indices = Array.from(selectedPromptIndices).sort((a, b) => b - a);
    deletePromptsByIndices(packName, indices);
    setStatusMessage(`${indices.length} prompt${indices.length !== 1 ? 's' : ''} deleted`);
  };

  const handleBatchMove = () => {
    if (selectedPromptIndices.size === 0) {
      setStatusMessage('No prompts selected');
      return;
    }

    if (!targetPackForMove) {
      setStatusMessage('Please select a target pack');
      return;
    }

    const indices = Array.from(selectedPromptIndices).sort((a, b) => b - a);

    // Move each prompt (in reverse order to maintain indices)
    indices.forEach(index => {
      movePromptToPack(index, packName, targetPackForMove);
    });

    setStatusMessage(`${indices.length} prompt${indices.length !== 1 ? 's' : ''} moved to "${targetPackForMove}"`);
    setTargetPackForMove('');
  };

  const handleAddPrompt = () => {
    if (!packName) {
      return;
    }
    addPromptToPack(packName, '');
    setStatusMessage('New prompt added');
  };

  return (
    <div
      className="flex flex-col transition-opacity duration-200"
      style={{
        flex: '0 0 66.667%',
        minWidth: 0,
        opacity: isPackDragging ? 0.3 : 1,
        pointerEvents: isPackDragging ? 'none' : 'auto',
      }}
    >
      {/* Header */}
      <div
        className="pl-3 pr-4 border-b flex items-center justify-between gap-2"
        style={{ borderColor: colors.BORDER, height: '50px' }}
      >
        <h3
          className="text-sm font-semibold truncate"
          style={{ color: colors.TEXT_PRIMARY }}
        >
          {packName} ({prompts.length} prompt{prompts.length !== 1 ? 's' : ''})
          {isSelectionMode && selectedPromptIndices.size > 0 && (
            <span style={{ color: colors.SUCCESS }}> - {selectedPromptIndices.size} selected</span>
          )}
        </h3>
        <div className="flex gap-1">
          {!isSelectionMode && (
            <Button
              icon={mdiPlus}
              iconSize={0.6}
              variant="icon"
              onClick={handleAddPrompt}
              tooltip="Add new prompt"
            />
          )}
          <Button
            icon={mdiCheckboxMultipleMarked}
            iconSize={0.6}
            variant="icon"
            onClick={handleToggleSelectionMode}
            tooltip={isSelectionMode ? 'Exit selection mode' : 'Enter selection mode'}
            style={isSelectionMode ? { backgroundColor: `${colors.SUCCESS}40` } : undefined}
          />
        </div>
      </div>

      {/* Selection Mode Controls */}
      {isSelectionMode && (
        <div
          className="px-3 py-2 border-b flex items-center gap-2"
          style={{ borderColor: colors.BORDER, backgroundColor: `${colors.BACKGROUND_MEDIUM}80` }}
        >
          <Button
            icon={mdiSelectAll}
            iconSize={0.5}
            variant="icon"
            onClick={handleSelectAll}
            tooltip="Select all"
          />
          <Button
            icon={mdiSelectOff}
            iconSize={0.5}
            variant="icon"
            onClick={handleDeselectAll}
            tooltip="Deselect all"
          />
          <div className="flex-1" />
          {allPackNames.length > 0 && (
            <>
              <Dropdown
                options={[{ value: '', label: 'Move to...' }, ...allPackNames.map(p => ({ value: p, label: p }))]}
                value={targetPackForMove}
                onChange={setTargetPackForMove}
              />
              <Button
                icon={mdiSwapHorizontal}
                iconSize={0.5}
                variant="icon"
                onClick={handleBatchMove}
                tooltip="Move selected prompts"
                disabled={selectedPromptIndices.size === 0 || !targetPackForMove}
              />
            </>
          )}
          <Button
            icon={mdiDelete}
            iconSize={0.5}
            variant="icon"
            onClick={handleBatchDelete}
            tooltip="Delete selected prompts"
            disabled={selectedPromptIndices.size === 0}
          />
        </div>
      )}

      {/* Scrollable Prompts List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pl-2 pr-4 py-2">
        {prompts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            <Icon path={mdiPackageVariant} size={2} color={colors.TEXT_SECONDARY} />
            <p className="mt-2 text-sm">No prompts in this pack</p>
          </div>
        ) : (
          prompts.map((prompt, index) => (
            <PromptListItem
              key={index}
              prompt={prompt}
              index={index}
              packName={packName}
              isDraggable={true}
              onDragStart={setDraggedPromptIndex}
              onDragEnd={() => setDraggedPromptIndex(null)}
              onPromptMove={onReorderPrompts}
              getThemeColors={getThemeColors}
            />
          ))
        )}
      </div>
    </div>
  );
};
