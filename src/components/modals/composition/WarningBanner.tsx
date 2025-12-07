/**
 * Reusable warning banner component for modals
 */

import React from 'react';
import { Icon } from '../../common/Icon';
import type { WarningBannerProps } from '../types/modal.types';
import { getVariantBackgroundColor, getVariantColor } from '../types/modalHelpers';

/**
 * Warning banner component
 *
 * Displays a colored banner with an icon and message.
 * Used for warnings, errors, info messages in modals.
 */
export const WarningBanner: React.FC<WarningBannerProps> = ({
  variant,
  icon,
  message,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const variantColor = getVariantColor(variant, colors);
  const backgroundColor = getVariantBackgroundColor(variant, colors, 0.2);

  return (
    <div
      className="mb-3 p-3 rounded-lg flex items-center gap-2"
      style={{
        backgroundColor,
        color: colors.TEXT_PRIMARY,
      }}
    >
      <Icon path={icon} size={0.8} color={variantColor} />
      <span className="text-xs">{message}</span>
    </div>
  );
};
