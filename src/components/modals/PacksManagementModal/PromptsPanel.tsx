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
import { useTranslation } from '@/contexts/I18nContext';
import { mdiPackageVariant, mdiCheckboxMultipleMarked, mdiSelectAll, mdiSelectOff, mdiDelete, mdiSwapHorizontal, mdiPlus, mdiMagnify, mdiClose } from '@mdi/js';
import type { PromptsPanelProps } from './types';

export const PromptsPanel: React.FC<PromptsPanelProps> = ({
  onReorderPrompts,
  getThemeColors,
}) => {
  const { t } = useTranslation();
  const colors = getThemeColors();
  const { packs, packOrder, deletePromptsByIndices, movePromptToPack, addPromptToPack } = usePromptStore();
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
  const [emptyPackText, setEmptyPackText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  const packName = selectedPackName || '';
  const prompts = packs[packName] || [];

  // Filter prompts based on search query
  const filteredPrompts = searchQuery.trim()
    ? prompts.filter(prompt =>
        prompt.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : prompts;

  // Use pack order to match the list order in PacksPanel
  const orderedPackNames = packOrder || Object.keys(packs);
  const allPackNames = orderedPackNames.filter(p => p !== packName);

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
    deselectAllPrompts();
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

  const handleEmptyPackTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEmptyPackText(text);

    // If pack is empty and user starts typing, create a prompt
    if (prompts.length === 0 && text.trim()) {
      addPromptToPack(packName, text);
      setEmptyPackText('');
      setStatusMessage('Prompt created');
    }
  };

  const handleToggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery(''); // Clear search when closing
    }
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
        <h3 className="text-base font-semibold truncate flex items-baseline gap-1">
          <span style={{ color: colors.TEXT_PRIMARY }}>{packName}</span>
          <span className="text-xs font-normal" style={{ color: colors.TEXT_SECONDARY }}>
            ({filteredPrompts.length}{searchQuery.trim() ? `/${prompts.length}` : ''} prompt{prompts.length !== 1 ? 's' : ''})
          </span>
          {isSelectionMode && selectedPromptIndices.size > 0 && (
            <span className="text-xs font-normal" style={{ color: colors.SUCCESS }}> - {selectedPromptIndices.size} selected</span>
          )}
        </h3>
        <div className="flex gap-1">
          {!isSelectionMode && (
            <>
              <Button
                icon={mdiPlus}
                iconSize={0.6}
                variant="icon"
                onClick={handleAddPrompt}
                tooltip={t('modals.packsManagement.addPromptTooltip')}
              />
              <Button
                icon={isSearchActive ? mdiClose : mdiMagnify}
                iconSize={0.6}
                variant="icon"
                onClick={handleToggleSearch}
                tooltip={isSearchActive ? 'Close search' : 'Search prompts'}
                style={isSearchActive ? { backgroundColor: `${colors.SUCCESS}40` } : undefined}
              />
            </>
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

      {/* Search Input */}
      {isSearchActive && (
        <div
          className="px-3 py-2 border-b"
          style={{ borderColor: colors.BORDER, backgroundColor: `${colors.BACKGROUND_MEDIUM}80` }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('modals.packsManagement.searchPromptsPlaceholder')}
            className="w-full px-3 py-2 rounded text-sm"
            style={{
              backgroundColor: colors.BACKGROUND_MEDIUM,
              color: colors.TEXT_PRIMARY,
              border: `1px solid ${colors.BORDER}`,
            }}
            autoFocus
          />
        </div>
      )}

      {/* Selection Mode Controls */}
      {isSelectionMode && (
        <div
          className="px-3 py-2 border-b flex items-center gap-2 pr-6"
          style={{ borderColor: colors.BORDER, backgroundColor: `${colors.BACKGROUND_MEDIUM}80` }}
        >
          <Button
            icon={mdiSelectAll}
            iconSize={0.5}
            variant="icon"
            onClick={handleSelectAll}
            tooltip={t('modals.packsManagement.selectAllPromptsTooltip')}
          />
          <Button
            icon={mdiSelectOff}
            iconSize={0.5}
            variant="icon"
            onClick={handleDeselectAll}
            tooltip={t('modals.packsManagement.deselectAllPromptsTooltip')}
          />
          <div className="flex-1" />
          {allPackNames.length > 0 && (
            <>
              <Dropdown
                options={allPackNames.map(p => ({ value: p, label: p }))}
                value={targetPackForMove}
                onChange={setTargetPackForMove}
                placeholder={t('modals.packsManagement.moveToPlaceholder')}
              />
              <Button
                icon={mdiSwapHorizontal}
                iconSize={0.5}
                variant="icon"
                onClick={handleBatchMove}
                tooltip={t('modals.packsManagement.moveSelectedPromptsTooltip')}
                disabled={selectedPromptIndices.size === 0 || !targetPackForMove}
              />
            </>
          )}
          <Button
            icon={mdiDelete}
            iconSize={0.5}
            variant="icon"
            onClick={handleBatchDelete}
            tooltip={t('modals.packsManagement.deletePromptTooltip')}
            disabled={selectedPromptIndices.size === 0}
          />
        </div>
      )}

      {/* Scrollable Prompts List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pl-2 pr-4 py-2">
        {prompts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            <Icon path={mdiPackageVariant} size={2} color={colors.TEXT_SECONDARY} />
            <p className="mt-2 mb-4 text-sm">No prompts in this pack</p>
            <textarea
              value={emptyPackText}
              onChange={handleEmptyPackTextChange}
              placeholder={t('modals.packsManagement.emptyPackPlaceholder')}
              className="w-full max-w-md px-3 py-2 rounded text-sm resize-none custom-scrollbar"
              style={{
                backgroundColor: colors.BACKGROUND_MEDIUM,
                color: colors.TEXT_PRIMARY,
                border: `1px solid ${colors.BORDER}`,
                minHeight: '80px',
              }}
            />
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            <Icon path={mdiMagnify} size={2} color={colors.TEXT_SECONDARY} />
            <p className="mt-2 text-sm">No prompts match your search</p>
          </div>
        ) : (
          filteredPrompts.map((prompt, _index) => {
            // Find the original index in the full prompts array for proper functionality
            const originalIndex = prompts.findIndex(p => p === prompt);
            return (
              <PromptListItem
                key={originalIndex}
                prompt={prompt}
                index={originalIndex}
                packName={packName}
                isDraggable={!searchQuery.trim()}
                onDragStart={setDraggedPromptIndex}
                onDragEnd={() => setDraggedPromptIndex(null)}
                onPromptMove={onReorderPrompts}
                getThemeColors={getThemeColors}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
