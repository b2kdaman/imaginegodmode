/**
 * Reusable selection control buttons (Select All / Deselect All)
 */

import React from 'react';
import { Button } from '@/components/inputs/Button';

interface SelectionControlsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const SelectionControls: React.FC<SelectionControlsProps> = ({
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <div className="flex gap-2 mb-3">
      <Button onClick={onSelectAll} className="text-xs flex-1">
        Select All
      </Button>
      <Button onClick={onDeselectAll} className="text-xs flex-1">
        Deselect All
      </Button>
    </div>
  );
};
