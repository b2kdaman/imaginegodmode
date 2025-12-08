/**
 * Pack management component
 */

import React, { useState } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from './inputs/Button';
import { DraggableDropdown } from './inputs/DraggableDropdown';
import { SearchModal } from './modals/SearchModal';
import { PacksManagementModal } from './modals/PacksManagementModal/PacksManagementModal';
import { mdiMagnify, mdiPackageVariant } from '@mdi/js';
import { useTranslation } from '@/contexts/I18nContext';

export const PackManager: React.FC = () => {
  const {
    packOrder,
    currentPack,
    setCurrentPack,
    reorderPacks,
  } = usePromptStore();
  const { getThemeColors } = useSettingsStore();
  const { t } = useTranslation();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPacksModal, setShowPacksModal] = useState(false);

  const packNames = packOrder;


  return (
    <div className="flex items-center gap-2 mb-3">
      <Button
        onClick={() => setShowSearchModal(true)}
        icon={mdiMagnify}
        iconSize={0.7}
        variant="icon"
        tooltip={t('packManager.searchTooltip')}
        className="flex-shrink-0"
      />

      <DraggableDropdown
        value={currentPack}
        onChange={(value) => setCurrentPack(value)}
        options={packNames.map((name) => ({
          value: name,
          label: name,
        }))}
        onReorder={(newOrder) => reorderPacks(newOrder)}
        className="flex-1 min-w-0"
      />

      <Button
        onClick={() => setShowPacksModal(true)}
        icon={mdiPackageVariant}
        iconSize={0.7}
        variant="icon"
        tooltip="Manage packs and prompts"
        className="flex-shrink-0"
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        getThemeColors={getThemeColors}
      />

      {/* Packs Management Modal */}
      <PacksManagementModal
        isOpen={showPacksModal}
        onClose={() => setShowPacksModal(false)}
        getThemeColors={getThemeColors}
      />
    </div>
  );
};
