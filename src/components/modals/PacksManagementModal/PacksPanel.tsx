/**
 * Left panel component showing list of packs
 * Displays all packs with selection, rename, and delete functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/inputs/Button';
import { PackListItem } from './PackListItem';
import { PacksManagementFooter } from './PacksManagementFooter';
import { usePromptStore } from '@/store/usePromptStore';
import { mdiPlus } from '@mdi/js';
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
  const { packs, packOrder, reorderPacks } = usePromptStore();
  const packNames = packOrder || Object.keys(packs);
  const [isCreating, setIsCreating] = useState(false);
  const [newPackName, setNewPackName] = useState('');

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
        style={{ borderColor: colors.BORDER, height: '44px' }}
      >
        <h3
          className="text-sm font-semibold"
          style={{ color: colors.TEXT_PRIMARY }}
        >
          Packs ({packNames.length})
        </h3>
        <Button
          icon={mdiPlus}
          iconSize={0.6}
          variant="icon"
          onClick={() => setIsCreating(true)}
          tooltip="Create new pack"
        />
      </div>

      {/* Scrollable Pack List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pl-2 pr-3 py-2">
        {/* Create New Pack Input */}
        {isCreating && (
          <div className="mb-2 p-2 rounded-lg border" style={{ borderColor: colors.SUCCESS }}>
            <input
              type="text"
              value={newPackName}
              onChange={(e) => setNewPackName(e.target.value)}
              onBlur={handleCreatePack}
              onKeyDown={handleKeyDown}
              placeholder="New pack name..."
              className="w-full px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: colors.BACKGROUND_MEDIUM,
                color: colors.TEXT_PRIMARY,
                border: `1px solid ${colors.BORDER}`,
              }}
              autoFocus
            />
          </div>
        )}

        {packNames.map((packName, index) => (
          <PackListItem
            key={packName}
            packName={packName}
            index={index}
            promptCount={packs[packName].length}
            onRename={onRenamePack}
            onDelete={onDeletePack}
            onDropPrompt={(promptIndex, sourcePack) =>
              onDropPrompt(packName, promptIndex, sourcePack)
            }
            onPackMove={handlePackMove}
            getThemeColors={getThemeColors}
          />
        ))}
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
    </div>
  );
};
