/**
 * Modal component for selecting pack(s) to export
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../inputs/Button';
import { useTranslation } from '@/contexts/I18nContext';
import { BaseModal } from './BaseModal';
import { Icon } from '../common/Icon';
import { mdiPackageVariant, mdiCheckboxMarked, mdiCheckboxBlankOutline, mdiSelectAll, mdiSelect } from '@mdi/js';

interface PackSelectModalProps {
  isOpen: boolean;
  packs: string[];
  currentPack: string;
  onClose: () => void;
  onSelectPack: (packNames: string[]) => void;
  getThemeColors: () => any;
}

export const EXPORT_ALL_KEY = '__EXPORT_ALL__';

export const PackSelectModal: React.FC<PackSelectModalProps> = ({
  isOpen,
  packs,
  currentPack,
  onClose,
  onSelectPack,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const { t } = useTranslation();
  const [selectedPacks, setSelectedPacks] = useState<Set<string>>(new Set());
  const [isExportHovered, setIsExportHovered] = useState(false);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPacks(new Set());
    }
  }, [isOpen]);

  const togglePack = (packName: string) => {
    const newSelection = new Set(selectedPacks);
    if (newSelection.has(packName)) {
      newSelection.delete(packName);
    } else {
      newSelection.add(packName);
    }
    setSelectedPacks(newSelection);
  };

  const selectAll = () => {
    setSelectedPacks(new Set(packs));
  };

  const deselectAll = () => {
    setSelectedPacks(new Set());
  };

  const handleExport = () => {
    if (selectedPacks.size > 0) {
      onSelectPack(Array.from(selectedPacks));
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      title={t('modals.selectPack.title')}
      onClose={onClose}
      getThemeColors={getThemeColors}
      maxWidth="xs"
      footer={
        <div className="flex justify-between items-center w-full">
          <Button onClick={onClose} className="text-xs">
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedPacks.size === 0}
            className="text-xs"
            style={{
              backgroundColor: selectedPacks.size > 0
                ? (isExportHovered ? colors.ACCENT : colors.SUCCESS)
                : undefined,
              color: selectedPacks.size > 0 ? '#fff' : undefined,
              opacity: selectedPacks.size === 0 ? 0.5 : 1,
              cursor: selectedPacks.size === 0 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={() => setIsExportHovered(true)}
            onMouseLeave={() => setIsExportHovered(false)}
          >
            {t('common.export')} {selectedPacks.size > 0 && `(${selectedPacks.size})`}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Select All / Deselect All Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={selectAll}
            icon={mdiSelectAll}
            className="flex-1 text-xs"
            tooltip={t('modals.selectPack.selectAll')}
          >
            {t('modals.selectPack.selectAll')}
          </Button>
          <Button
            onClick={deselectAll}
            icon={mdiSelect}
            className="flex-1 text-xs"
            tooltip={t('modals.selectPack.deselectAll')}
          >
            {t('modals.selectPack.deselectAll')}
          </Button>
        </div>

        {/* Pack List with Checkboxes */}
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-scroll">
          {packs.map((packName) => {
            const isSelected = selectedPacks.has(packName);
            const isCurrent = packName === currentPack;

            return (
              <button
                key={packName}
                onClick={() => togglePack(packName)}
                className="text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 group text-sm"
                style={{
                  backgroundColor: isSelected
                    ? colors.BACKGROUND_MEDIUM
                    : colors.BACKGROUND_DARK,
                  border: `1px solid ${
                    isSelected ? colors.SUCCESS : colors.BORDER
                  }`,
                  color: colors.TEXT_PRIMARY,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = colors.TEXT_SECONDARY;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = colors.BACKGROUND_DARK;
                    e.currentTarget.style.borderColor = colors.BORDER;
                  }
                }}
              >
                {/* Checkbox */}
                <Icon
                  path={isSelected ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
                  size={0.8}
                  color={isSelected ? colors.SUCCESS : colors.TEXT_SECONDARY}
                />

                {/* Pack Icon */}
                <Icon path={mdiPackageVariant} size={0.7} color={colors.TEXT_SECONDARY} />

                {/* Pack Name */}
                <span className="font-medium truncate flex-1">{packName}</span>

                {/* Current Badge */}
                {isCurrent && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0"
                    style={{
                      backgroundColor: colors.SUCCESS,
                      color: '#fff',
                    }}
                  >
                    {t('common.current')}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection Summary */}
        {selectedPacks.size > 0 && (
          <div
            className="text-xs text-center p-2 rounded-lg"
            style={{
              backgroundColor: `${colors.SUCCESS}20`,
              color: colors.TEXT_PRIMARY,
              border: `1px solid ${colors.SUCCESS}`,
            }}
          >
            {t('modals.selectPack.selectedCount', { count: selectedPacks.size })}
          </div>
        )}
      </div>
    </BaseModal>
  );
};
