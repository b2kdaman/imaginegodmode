/**
 * Modal component for selecting pack to export
 */

import React from 'react';
import { Button } from '../inputs/Button';
import { useTranslation } from '@/contexts/I18nContext';
import { BaseModal } from './BaseModal';

interface PackSelectModalProps {
  isOpen: boolean;
  packs: string[];
  currentPack: string;
  onClose: () => void;
  onSelectPack: (packName: string) => void;
  getThemeColors: () => any;
}

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

  return (
    <BaseModal
      isOpen={isOpen}
      title={t('modals.selectPack.title')}
      onClose={onClose}
      getThemeColors={getThemeColors}
      maxWidth="xs"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose} className="text-xs">
            {t('common.cancel')}
          </Button>
        </div>
      }
    >
      {/* Pack List */}
      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-scroll">
        {packs.map((packName) => (
          <button
            key={packName}
            onClick={() => onSelectPack(packName)}
            className="text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between group text-sm"
            style={{
              backgroundColor:
                packName === currentPack
                  ? colors.BACKGROUND_MEDIUM
                  : colors.BACKGROUND_DARK,
              border: `1px solid ${
                packName === currentPack
                  ? colors.TEXT_SECONDARY
                  : colors.BORDER
              }`,
              color: colors.TEXT_PRIMARY,
            }}
            onMouseEnter={(e) => {
              if (packName !== currentPack) {
                e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
                e.currentTarget.style.borderColor = colors.TEXT_SECONDARY;
              }
            }}
            onMouseLeave={(e) => {
              if (packName !== currentPack) {
                e.currentTarget.style.backgroundColor = colors.BACKGROUND_DARK;
                e.currentTarget.style.borderColor = colors.BORDER;
              }
            }}
          >
            <span className="font-medium truncate">{packName}</span>
            {packName === currentPack && (
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
        ))}
      </div>
    </BaseModal>
  );
};
