/**
 * Pack management component
 */

import React, { useState, useRef, useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from './inputs/Button';
import { Dropdown } from './inputs/Dropdown';
import { ConfirmDeleteModal } from './modals/ConfirmDeleteModal';
import { SearchModal } from './modals/SearchModal';
import { mdiPlus, mdiClose, mdiCheck, mdiDelete, mdiMagnify } from '@mdi/js';
import { useTranslation } from '@/contexts/I18nContext';

export const PackManager: React.FC = () => {
  const {
    packs,
    currentPack,
    setCurrentPack,
    addPack,
    deletePack,
  } = usePromptStore();
  const { getThemeColors } = useSettingsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();

  const [isAdding, setIsAdding] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const packNames = Object.keys(packs);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddPack = () => {
    if (newPackName.trim()) {
      addPack(newPackName.trim());
      setNewPackName('');
      setIsAdding(false);
    }
  };

  const handleDeletePack = () => {
    if (packNames.length <= 1) return;
    deletePack(currentPack);
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      {!isAdding ? (
        <>
          <Button
            onClick={() => setShowSearchModal(true)}
            icon={mdiMagnify}
            iconSize={0.7}
            variant="icon"
            tooltip={t('packManager.searchTooltip')}
            className="flex-shrink-0"
          />

          <Dropdown
            value={currentPack}
            onChange={(value) => setCurrentPack(value)}
            options={packNames.map((name) => ({
              value: name,
              label: name,
            }))}
            className="flex-1 min-w-0"
          />

          <Button
            onClick={() => setIsAdding(true)}
            icon={mdiPlus}
            iconSize={0.7}
            variant="icon"
            tooltip={t('packManager.addPackTooltip')}
            className="flex-shrink-0"
          />

          <Button
            onClick={() => setShowDeleteModal(true)}
            icon={mdiDelete}
            iconSize={0.7}
            variant="icon"
            disabled={packNames.length <= 1}
            tooltip={
              packNames.length <= 1
                ? t('packManager.cannotDeleteLast')
                : t('packManager.deletePackTooltip')
            }
            className="flex-shrink-0"
          />
        </>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            value={newPackName}
            onChange={(e) => setNewPackName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddPack();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewPackName('');
              }
            }}
            placeholder={t('packManager.packNamePlaceholder')}
            className="flex-1 px-3 py-2 rounded-full text-sm focus:outline-none"
            style={{
              backgroundColor: colors.BACKGROUND_MEDIUM,
              color: colors.TEXT_PRIMARY,
              border: `1px solid ${colors.BORDER}`,
            }}
          />

          <Button
            onClick={handleAddPack}
            icon={mdiCheck}
            iconSize={0.7}
            variant="icon"
            tooltip={t('common.add')}
            className="flex-shrink-0"
          />

          <Button
            onClick={() => {
              setIsAdding(false);
              setNewPackName('');
            }}
            icon={mdiClose}
            iconSize={0.7}
            variant="icon"
            tooltip={t('common.cancel')}
            className="flex-shrink-0"
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        packName={currentPack}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePack}
        getThemeColors={getThemeColors}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        getThemeColors={getThemeColors}
      />
    </div>
  );
};
