/**
 * Footer component for Packs Management Modal
 * Contains import/export controls and status messages
 */

import React from 'react';
import { Button } from '@/components/inputs/Button';
import { mdiUpload, mdiContentCopy } from '@mdi/js';
import { useTranslation } from '@/contexts/I18nContext';
import type { PacksManagementFooterProps } from './types';

export const PacksManagementFooter: React.FC<PacksManagementFooterProps> = ({
  importMode,
  onImportModeChange,
  onImport,
  onExport,
  onCopyGrokPrompt,
  getThemeColors: _getThemeColors,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Import Mode Selection */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-theme-text-secondary">
          {t('settings.importMode')}:
        </span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="add"
            checked={importMode === 'add'}
            onChange={() => onImportModeChange('add')}
            style={{ accentColor: 'var(--theme-success)' }}
          />
          <span className="text-theme-text-primary">
            {t('settings.importModeAdd')}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="replace"
            checked={importMode === 'replace'}
            onChange={() => onImportModeChange('replace')}
            style={{ accentColor: 'var(--theme-success)' }}
          />
          <span className="text-theme-text-primary">
            {t('settings.importModeReplace')}
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onImport}
          icon={mdiUpload}
          className="flex-1"
          tooltip={t('modals.packsManagement.importTooltip')}
        >
          {t('common.import')}
        </Button>

        <Button
          onClick={onCopyGrokPrompt}
          icon={mdiContentCopy}
          variant="icon"
          tooltip={t('modals.packsManagement.copyPromptTooltip')}
        />

        <Button
          onClick={onExport}
          icon={mdiUpload}
          className="flex-1"
          tooltip={t('modals.packsManagement.exportTooltip')}
        >
          {t('common.export')}
        </Button>
      </div>
    </div>
  );
};
