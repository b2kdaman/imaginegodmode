/**
 * Generic confirmation modal
 */

import React from 'react';
import { Button } from '../inputs/Button';
import { mdiAlertCircle, mdiCheck } from '@mdi/js';
import { Icon } from '../common/Icon';
import { useTranslation } from '@/contexts/I18nContext';
import { BaseModal } from './BaseModal';
import { ThemeColors } from '@/types';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
  getThemeColors: () => ThemeColors;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onClose,
  onConfirm,
  getThemeColors,
  variant = 'warning',
}) => {
  const colors = getThemeColors();
  const { t } = useTranslation();

  const variantColor = variant === 'danger' ? colors.DANGER :
                       variant === 'warning' ? colors.DANGER :
                       colors.GLOW_PRIMARY;

  return (
    <BaseModal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      getThemeColors={getThemeColors}
      maxWidth="xs"
      footer={
        <div className="flex gap-2">
          <Button onClick={onClose} className="flex-1 text-xs">
            {cancelText || t('common.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            icon={mdiCheck}
            iconSize={0.7}
            className="flex-1 text-xs"
            style={{
              backgroundColor: variantColor,
              color: '#fff',
            }}
          >
            {confirmText || t('common.confirm')}
          </Button>
        </div>
      }
    >
      {/* Warning Icon and Message */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="rounded-full p-3"
          style={{
            backgroundColor: `${variantColor}20`,
          }}
        >
          <Icon path={mdiAlertCircle} size={1.5} color={variantColor} />
        </div>

        <div className="text-center">
          <p
            className="text-sm mb-2"
            style={{ color: colors.TEXT_PRIMARY }}
          >
            {message}
          </p>
        </div>
      </div>
    </BaseModal>
  );
};
