/**
 * Reusable selection control buttons (Select All / Deselect All)
 */

import React from 'react';
import { Button } from '@/components/inputs/Button';
import { useTranslation } from '@/contexts/I18nContext';

interface SelectionControlsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const SelectionControls: React.FC<SelectionControlsProps> = ({
  onSelectAll,
  onDeselectAll,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 mb-3">
      <Button onClick={onSelectAll} className="text-xs flex-1">
        {t('common.selectAll')}
      </Button>
      <Button onClick={onDeselectAll} className="text-xs flex-1">
        {t('common.deselectAll')}
      </Button>
    </div>
  );
};
