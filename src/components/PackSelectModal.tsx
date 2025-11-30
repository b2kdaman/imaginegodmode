/**
 * Modal component for selecting pack to export
 */

import React from 'react';
import { Button } from './Button';
import { mdiClose } from '@mdi/js';
import { Icon } from './Icon';
import { useTranslation } from '@/contexts/I18nContext';

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-4 max-w-xs w-full mx-4"
        style={{
          backgroundColor: colors.BACKGROUND_DARK,
          border: `1px solid ${colors.BORDER}`,
          boxShadow: `0 8px 32px ${colors.SHADOW}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: colors.TEXT_PRIMARY }}
          >
            {t('modals.selectPack.title')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: colors.TEXT_SECONDARY,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
              e.currentTarget.style.color = colors.TEXT_PRIMARY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.TEXT_SECONDARY;
            }}
          >
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>

        {/* Pack List */}
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-scroll mb-3">
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

        {/* Footer */}
        <div className="flex justify-end">
          <Button onClick={onClose} className="text-xs">{t('common.cancel')}</Button>
        </div>
      </div>
    </div>
  );
};
