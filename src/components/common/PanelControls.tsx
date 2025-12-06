/**
 * Panel controls component with version badge and action buttons
 */

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '../inputs/Button';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { PauseButton } from '../buttons/PauseButton';
import { VersionBadge } from './VersionBadge';
import { mdiChevronUp, mdiChevronDown } from '@mdi/js';

export const PanelControls: React.FC = () => {
  const { isExpanded, toggleExpanded } = useUIStore();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <VersionBadge />
      <PauseButton />
      <FullscreenButton />
      <Button
        variant="icon"
        onClick={toggleExpanded}
        icon={isExpanded ? mdiChevronDown : mdiChevronUp}
        iconSize={0.9}
        className="shadow-lg"
        tooltip={isExpanded ? t('panel.collapseTooltip') : t('panel.expandTooltip')}
      />
    </div>
  );
};
