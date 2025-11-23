/**
 * Message displayed when no post ID is found
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface NoPostMessageProps {
  message?: string;
  subMessage?: string;
}

export const NoPostMessage: React.FC<NoPostMessageProps> = ({
  message = 'No post ID found',
  subMessage = 'Navigate to a post to continue',
}) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  return (
    <div className="flex flex-col w-full items-center justify-center py-8">
      <div
        className="text-sm text-center"
        style={{ color: colors.TEXT_SECONDARY }}
      >
        {message}
      </div>
      <div
        className="text-xs text-center mt-2"
        style={{ color: `${colors.TEXT_SECONDARY}80` }}
      >
        {subMessage}
      </div>
    </div>
  );
};
