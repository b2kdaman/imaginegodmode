/**
 * Confirmation modal for deleting a pack
 */

import React from 'react';
import { Button } from '../inputs/Button';
import { mdiDelete, mdiAlertCircle } from '@mdi/js';
import { Icon } from '../common/Icon';
import { useTranslation } from '@/contexts/I18nContext';
import { BaseModal } from './BaseModal';

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

  return (
    <BaseModal
      isOpen={isOpen}
      title={t('modals.confirmDelete.title')}
      onClose={onClose}
      getThemeColors={getThemeColors}
      maxWidth="xs"
      footer={
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
      }
    >
      {/* Warning Icon and Message */}
      <div className="flex flex-col items-center gap-3">
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
    </BaseModal>
  );
};
