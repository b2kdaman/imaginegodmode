/**
 * Reusable progress bar component for bulk operations
 */

import React from 'react';
import { Icon } from '@/components/common/Icon';
import { mdiLoading } from '@mdi/js';

interface ProgressBarProps {
  processedCount: number;
  totalCount: number;
  label: string;
  backgroundColor: string;
  progressColor: string;
  textColor: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  processedCount,
  totalCount,
  label,
  backgroundColor,
  progressColor,
  textColor,
}) => {
  return (
    <div className="mb-3">
      <div
        className="flex justify-between text-xs mb-1 items-center"
        style={{ color: textColor }}
      >
        <span className="flex items-center gap-1">
          <Icon path={mdiLoading} size={0.6} className="animate-spin" />
          {label}
        </span>
        <span>{processedCount} / {totalCount}</span>
      </div>
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor }}
      >
        <div
          key={`progress-${processedCount}`}
          className="h-full transition-[width]"
          style={{
            width: `${totalCount > 0 ? (processedCount / totalCount) * 100 : 0}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>
    </div>
  );
};
