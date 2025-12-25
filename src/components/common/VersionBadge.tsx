/**
 * Version badge component displaying extension version and author credit
 */

import React from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { VERSION } from '@/utils/constants';

export const VersionBadge: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-end px-2 py-1 leading-tight rounded-lg bg-theme-bg-dark/[0.67] backdrop-blur-md"
    >
      <span className="text-[10px] font-medium text-theme-text-secondary">
        ImagineGodMode {t('common.version')} {VERSION}
      </span>
      <span className="text-[9px] text-theme-text-secondary/50">
        {t('panel.authorCredit')}
      </span>
    </div>
  );
};
