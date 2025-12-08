/**
 * Footer component for Packs Management Modal
 * Contains import/export controls and status messages
 */

import React from 'react';
import { Button } from '@/components/inputs/Button';
import { mdiUpload, mdiDownload, mdiContentCopy } from '@mdi/js';
import { useTranslation } from '@/contexts/I18nContext';
import type { PacksManagementFooterProps } from './types';

export const PacksManagementFooter: React.FC<PacksManagementFooterProps> = ({
  importMode,
  onImportModeChange,
  onImport,
  onExport,
  onCopyGrokPrompt,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Import Mode Selection */}
      <div className="flex items-center gap-4 text-sm">
        <span style={{ color: colors.TEXT_SECONDARY }}>
          {t('settings.importMode')}:
        </span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="add"
            checked={importMode === 'add'}
            onChange={() => onImportModeChange('add')}
            style={{ accentColor: colors.SUCCESS }}
          />
          <span style={{ color: colors.TEXT_PRIMARY }}>
            {t('settings.importModeAdd')}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="replace"
            checked={importMode === 'replace'}
            onChange={() => onImportModeChange('replace')}
            style={{ accentColor: colors.SUCCESS }}
          />
          <span style={{ color: colors.TEXT_PRIMARY }}>
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
          tooltip="Import pack from file or clipboard"
        >
          {t('common.import')}
        </Button>

        <Button
          onClick={onCopyGrokPrompt}
          icon={mdiContentCopy}
          variant="icon"
          tooltip="Copy Grok system prompt for AI-generated packs"
        />

        <Button
          onClick={onExport}
          icon={mdiDownload}
          className="flex-1"
          tooltip="Export selected packs to file"
        >
          {t('common.export')}
        </Button>
      </div>
    </div>
  );
};
