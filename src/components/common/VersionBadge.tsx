/**
 * Version badge component displaying extension version and author credit
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/contexts/I18nContext';
import { VERSION } from '@/utils/constants';

export const VersionBadge: React.FC = () => {
  const { getThemeColors } = useSettingsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();

  return (
    <div
      className="flex flex-col items-end px-2 py-1 leading-tight rounded-lg"
      style={{
        backgroundColor: `${colors.BACKGROUND_DARK}aa`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <span
        className="text-[10px] font-medium"
        style={{ color: colors.TEXT_SECONDARY }}
      >
        ImagineGodMode {t('common.version')} {VERSION}
      </span>
      <span
        className="text-[9px]"
        style={{ color: `${colors.TEXT_SECONDARY}80` }}
      >
        {t('panel.authorCredit')}
      </span>
    </div>
  );
};
