/**
 * Validation display component for form modals
 */

import React from 'react';
import { Icon } from '../../common/Icon';
import { mdiAlertCircle, mdiCheckCircle } from '@mdi/js';
import type { ValidationDisplayProps } from '../types/modal.types';

/**
 * Validation display component
 *
 * Shows validation errors or success content
 * Used in ImportPackModal and other forms
 */
export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  isValid,
  error,
  successContent,
  getThemeColors,
}) => {
  const colors = getThemeColors();

  if (!isValid && error) {
    return (
      <div
        className="p-3 rounded-lg flex items-start gap-2 text-theme-text-primary"
        style={{
          backgroundColor: `${colors.DANGER}20`,
        }}
      >
        <Icon path={mdiAlertCircle} size={0.8} color={colors.DANGER} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-xs font-semibold mb-1" style={{ color: colors.DANGER }}>
            Validation Error
          </div>
          <div className="text-xs text-theme-text-secondary">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (isValid && successContent) {
    return (
      <div
        className="p-3 rounded-lg flex items-start gap-2 text-theme-text-primary"
        style={{
          backgroundColor: `${colors.SUCCESS}20`,
        }}
      >
        <Icon path={mdiCheckCircle} size={0.8} color={colors.SUCCESS} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {successContent}
        </div>
      </div>
    );
  }

  return null;
};
