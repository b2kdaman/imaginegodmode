/**
 * Confirmation modal for deleting a pack
 */

import React from 'react';
import { Button } from '../inputs/Button';
import { mdiClose, mdiDelete, mdiAlertCircle } from '@mdi/js';
import { Icon } from '../common/Icon';
import { useTranslation } from '@/contexts/I18nContext';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  packName: string;
  onClose: () => void;
  onConfirm: () => void;
  getThemeColors: () => any;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  packName,
  onClose,
  onConfirm,
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
            {t('modals.confirmDelete.title')}
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

        {/* Warning Icon and Message */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div
            className="rounded-full p-3"
            style={{
              backgroundColor: `${colors.DANGER}20`,
            }}
          >
            <Icon path={mdiAlertCircle} size={1.5} color={colors.DANGER} />
          </div>

          <div className="text-center">
            <p
              className="text-sm mb-2"
              style={{ color: colors.TEXT_PRIMARY }}
            >
              {t('modals.confirmDelete.message', { packName })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={onClose} className="flex-1 text-xs">
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            icon={mdiDelete}
            iconSize={0.7}
            className="flex-1 text-xs"
            style={{
              backgroundColor: colors.DANGER,
              color: '#fff',
            }}
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
};
