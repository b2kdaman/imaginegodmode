/**
 * Left panel component showing list of packs
 * Displays all packs with selection, rename, and delete functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/inputs/Button';
import { BaseModal } from '../BaseModal';
import { PackListItem } from './PackListItem';
import { PacksManagementFooter } from './PacksManagementFooter';
import { usePromptStore } from '@/store/usePromptStore';
import { usePacksManagementStore } from './usePacksManagementStore';
import { mdiPlus, mdiCheckboxMultipleMarked, mdiSelectAll, mdiSelectOff, mdiDelete, mdiCheck, mdiClose } from '@mdi/js';
import type { PacksPanelProps } from './types';

export const PacksPanel: React.FC<PacksPanelProps> = ({
  onAddPack,
  onRenamePack,
  onDeletePack,
  onDropPrompt,
  importMode,
  onImportModeChange,
  onImport,
  onExport,
  onCopyGrokPrompt,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const { packs, packOrder, reorderPacks, deletePacksByNames } = usePromptStore();
  const {
    isPackSelectionMode,
    setIsPackSelectionMode,
    selectedPackNames,
    selectAllPacks,
    deselectAllPacks,
    setStatusMessage,
    setSelectedPackName,
  } = usePacksManagementStore();
  const packNames = packOrder || Object.keys(packs);
  const [isCreating, setIsCreating] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handlePackMove = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) {
      return;
    }

    const newOrder = [...packNames];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);

    reorderPacks(newOrder);
  };

  const handleCreatePack = () => {
    const trimmedName = newPackName.trim();
    if (trimmedName) {
      onAddPack(trimmedName);
      setNewPackName('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreatePack();
    } else if (e.key === 'Escape') {
      setNewPackName('');
      setIsCreating(false);
    }
  };

  const handleTogglePackSelectionMode = () => {
    setIsPackSelectionMode(!isPackSelectionMode);
  };

  const handleSelectAllPacks = () => {
    selectAllPacks(packNames);
  };

  const handleDeselectAllPacks = () => {
    deselectAllPacks();
  };

  const handleBatchDeletePacks = () => {
    if (selectedPackNames.size === 0) {
      setStatusMessage('No packs selected');
      return;
    }

    setIsDeleteConfirmOpen(true);
  };

  const confirmBatchDeletePacks = () => {
    const packsToDelete = Array.from(selectedPackNames);
    deletePacksByNames(packsToDelete);

    // Select first remaining pack or Default if all deleted
    const remainingPacks = packNames.filter(p => !selectedPackNames.has(p));
    const nextPack = remainingPacks.length > 0 ? remainingPacks[0] : 'Default';
    setSelectedPackName(nextPack);

    setStatusMessage(`${packsToDelete.length} pack${packsToDelete.length !== 1 ? 's' : ''} deleted`);
    setIsDeleteConfirmOpen(false);
  };

  const cancelBatchDeletePacks = () => {
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div
      className="flex flex-col"
      style={{
        flex: '0 0 33.333%',
        minWidth: 0,
        borderRight: `1px solid ${colors.BORDER}`,
      }}
    >
      {/* Header */}
      <div
        className="px-3 border-b flex items-center justify-between gap-2"
        style={{ borderColor: colors.BORDER, height: '50px' }}
      >
        <h3
          className="text-sm font-semibold"
          style={{ color: colors.TEXT_PRIMARY }}
        >
          Packs ({packNames.length})
          {isPackSelectionMode && selectedPackNames.size > 0 && (
            <span style={{ color: colors.SUCCESS }}> - {selectedPackNames.size} selected</span>
          )}
        </h3>
        <div className="flex gap-1">
          {!isPackSelectionMode && (
            <Button
              icon={mdiPlus}
              iconSize={0.6}
              variant="icon"
              onClick={() => setIsCreating(true)}
              tooltip="Create new pack"
            />
          )}
          <Button
            icon={mdiCheckboxMultipleMarked}
            iconSize={0.6}
            variant="icon"
            onClick={handleTogglePackSelectionMode}
            tooltip={isPackSelectionMode ? 'Exit selection mode' : 'Enter selection mode'}
            style={isPackSelectionMode ? { backgroundColor: `${colors.SUCCESS}40` } : undefined}
          />
        </div>
      </div>

      {/* Selection Mode Controls */}
      {isPackSelectionMode && (
        <div
          className="px-3 pr-3 py-2 border-b flex items-center gap-2"
          style={{ borderColor: colors.BORDER, backgroundColor: `${colors.BACKGROUND_MEDIUM}80` }}
        >
          <Button
            icon={mdiSelectAll}
            iconSize={0.5}
            variant="icon"
            onClick={handleSelectAllPacks}
            tooltip="Select all packs"
          />
          <Button
            icon={mdiSelectOff}
            iconSize={0.5}
            variant="icon"
            onClick={handleDeselectAllPacks}
            tooltip="Deselect all packs"
          />
          <div className="flex-1" />
          <Button
            icon={mdiDelete}
            iconSize={0.5}
            variant="icon"
            onClick={handleBatchDeletePacks}
            tooltip="Delete selected packs"
            disabled={selectedPackNames.size === 0}
          />
        </div>
      )}

      {/* Scrollable Pack List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pl-2 pr-3 py-2">
        {/* Create New Pack Input */}
        {isCreating && (
          <div className="mb-2 p-2 rounded-lg" style={{ backgroundColor: colors.BACKGROUND_DARK, border: `1px solid ${colors.BORDER}` }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPackName}
                onChange={(e) => setNewPackName(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                placeholder="New pack name..."
                className="flex-1 px-1 rounded text-sm"
                style={{
                  backgroundColor: 'transparent',
                  color: colors.TEXT_PRIMARY,
                  border: 'none',
                  outline: 'none',
                }}
                autoFocus
              />
              <Button
                icon={mdiCheck}
                iconSize={0.5}
                variant="icon"
                onClick={handleCreatePack}
                tooltip="Create"
              />
              <Button
                icon={mdiClose}
                iconSize={0.5}
                variant="icon"
                onClick={() => {
                  setNewPackName('');
                  setIsCreating(false);
                }}
                tooltip="Cancel"
              />
            </div>
          </div>
        )}

        {packNames.map((packName, index) => {
          const nonEmptyCount = packs[packName].filter(prompt => prompt.text && prompt.text.trim() !== '').length;
          return (
            <PackListItem
              key={packName}
              packName={packName}
              index={index}
              promptCount={nonEmptyCount}
              onRename={onRenamePack}
              onDelete={onDeletePack}
              onDropPrompt={(promptIndex, sourcePack) =>
                onDropPrompt(packName, promptIndex, sourcePack)
              }
              onPackMove={handlePackMove}
              getThemeColors={getThemeColors}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className="pr-3">
        <PacksManagementFooter
          importMode={importMode}
          onImportModeChange={onImportModeChange}
          onImport={onImport}
          onExport={onExport}
          onCopyGrokPrompt={onCopyGrokPrompt}
          getThemeColors={getThemeColors}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <BaseModal
          isOpen={true}
          title="Confirm Delete"
          onClose={cancelBatchDeletePacks}
          getThemeColors={getThemeColors}
          maxWidth="sm"
        >
          <div className="flex flex-col gap-4">
            <p style={{ color: colors.TEXT_PRIMARY }}>
              Are you sure you want to delete <strong>{selectedPackNames.size} pack{selectedPackNames.size !== 1 ? 's' : ''}</strong>?
              {Array.from(selectedPackNames).some(name => packs[name]?.length > 0) && (
                <>
                  <br /><br />
                  This will delete:
                  <ul className="list-disc ml-5 mt-2">
                    {Array.from(selectedPackNames).map(name => (
                      <li key={name}>
                        <strong>{name}</strong> ({packs[name]?.length || 0} prompt{packs[name]?.length !== 1 ? 's' : ''})
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={cancelBatchDeletePacks}
                variant="default"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBatchDeletePacks}
                variant="default"
                style={{
                  backgroundColor: colors.DANGER,
                  color: '#fff',
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
};
