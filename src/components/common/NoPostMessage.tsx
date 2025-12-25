/**
 * Message displayed when no post ID is found
 */

import React from 'react';

interface NoPostMessageProps {
  message?: string;
  subMessage?: string;
}

export const NoPostMessage: React.FC<NoPostMessageProps> = ({
  message = 'No post ID found',
  subMessage = 'Navigate to a post to continue',
}) => {
  return (
    <div className="flex flex-col w-full items-center justify-center py-8">
      <div className="text-sm text-center text-theme-text-secondary">
        {message}
      </div>
      <div className="text-xs text-center mt-2 text-theme-text-secondary/50">
        {subMessage}
      </div>
    </div>
  );
};
