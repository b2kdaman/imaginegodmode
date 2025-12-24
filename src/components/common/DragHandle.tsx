/**
 * Drag handle component for repositioning the main panel
 */

import React from 'react';
import { Icon } from './Icon';
import { mdiDragHorizontal } from '@mdi/js';
import { useSettingsStore } from '@/store/useSettingsStore';

interface DragHandleProps {
  onMouseDown?: (e: React.MouseEvent) => void;
  tooltipContent?: string;
}

export const DragHandle: React.FC<DragHandleProps> = ({ onMouseDown, tooltipContent }) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 cursor-move flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-200"
      style={{
        color: colors.TEXT_SECONDARY,
      }}
      onMouseDown={onMouseDown}
      data-tooltip-content={tooltipContent}
    >
      <Icon path={mdiDragHorizontal} size={0.7} color={colors.TEXT_SECONDARY} />
    </div>
  );
};
