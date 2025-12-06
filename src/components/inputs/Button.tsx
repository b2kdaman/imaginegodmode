/**
 * Reusable button component with consistent styling
 */

import React from 'react';
import { Icon } from '../common/Icon';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGlowAnimation } from '@/hooks/useGlowAnimation';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'icon';
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  iconClassName?: string;
  tooltip?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  icon,
  iconSize = 0.6,
  iconColor,
  iconClassName = '',
  tooltip,
  className = '',
  children,
  disabled,
  style,
  ...props
}) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const { glowStyles, handleMouseEnter, handleMouseLeave, GlowOverlay } = useGlowAnimation();

  const baseStyles = 'rounded-full transition-all duration-300 flex items-center justify-center relative overflow-hidden';
  const variantStyles = {
    default: 'px-3 py-2 text-xs disabled:opacity-30',
    icon: 'w-9 h-9 disabled:opacity-30',
  };

  // Default icon color is theme text secondary
  const finalIconColor = iconColor || colors.TEXT_SECONDARY;

  const buttonStyle = {
    backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
    color: colors.TEXT_SECONDARY,
    border: `1px solid ${colors.BORDER}`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    ...style,
  };

  return (
    <>
      <style>{glowStyles}</style>
      <button
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled}
        style={buttonStyle}
        data-tooltip-id={tooltip ? 'app-tooltip' : undefined}
        data-tooltip-content={tooltip}
        onMouseEnter={(e) => {
          if (!disabled && !className.includes('!bg-white')) {
            handleMouseEnter(e);
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !className.includes('!bg-white')) {
            handleMouseLeave(e);
          }
        }}
        {...props}
      >
        {/* Glow light run effect overlay */}
        {!disabled && <GlowOverlay />}

        {/* Content wrapper for z-index control */}
        <span className="relative z-10 flex items-center justify-center">
          {icon && <Icon path={icon} size={variant === 'icon' ? 0.8 : iconSize} color={finalIconColor} className={iconClassName} />}
          {children && (
            <span className={icon ? 'ml-1' : ''}>
              {children}
            </span>
          )}
        </span>
      </button>
    </>
  );
};
