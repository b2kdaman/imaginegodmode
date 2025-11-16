/**
 * Reusable button component with consistent styling
 */

import React from 'react';
import { Icon } from './Icon';
import { useSettingsStore } from '@/store/useSettingsStore';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'icon';
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  tooltip?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  icon,
  iconSize = 0.6,
  iconColor,
  tooltip,
  className = '',
  children,
  disabled,
  style,
  ...props
}) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const baseStyles = 'rounded-full transition-colors flex items-center justify-center';
  const variantStyles = {
    default: 'px-3 py-2 text-xs disabled:opacity-30',
    icon: 'w-9 h-9 disabled:opacity-30',
  };

  // Default icon color is theme text secondary
  const finalIconColor = iconColor || colors.TEXT_SECONDARY;

  const buttonStyle = {
    backgroundColor: colors.BACKGROUND_MEDIUM,
    color: colors.TEXT_SECONDARY,
    border: `1px solid ${colors.BORDER}`,
    ...style,
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      style={buttonStyle}
      data-tooltip-id={tooltip ? 'app-tooltip' : undefined}
      data-tooltip-content={tooltip}
      onMouseEnter={(e) => {
        if (!disabled && !className.includes('!bg-white')) {
          e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
          e.currentTarget.style.color = colors.TEXT_HOVER;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !className.includes('!bg-white')) {
          e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
          e.currentTarget.style.color = colors.TEXT_SECONDARY;
        }
      }}
      {...props}
    >
      {icon && <Icon path={icon} size={variant === 'icon' ? 0.8 : iconSize} color={finalIconColor} />}
      {children && (
        <span className={icon ? 'ml-1' : ''}>
          {children}
        </span>
      )}
    </button>
  );
};
