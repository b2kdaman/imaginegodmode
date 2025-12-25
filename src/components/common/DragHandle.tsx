/**
 * Drag handle component for repositioning the main panel
 */

import React from 'react';
import { Icon } from './Icon';
import { mdiDragHorizontal } from '@mdi/js';

interface DragHandleProps {
  onMouseDown?: (e: React.MouseEvent) => void;
  tooltipContent?: string;
}

export const DragHandle: React.FC<DragHandleProps> = ({ onMouseDown, tooltipContent }) => {
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 cursor-move flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-200 text-theme-text-secondary"
      onMouseDown={onMouseDown}
      data-tooltip-content={tooltipContent}
    >
      <Icon path={mdiDragHorizontal} size={0.7} color="var(--color-text-secondary)" />
    </div>
  );
};
