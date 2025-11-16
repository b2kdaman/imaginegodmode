/**
 * Reusable button component with consistent styling
 */

import React from 'react';
import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'icon' | 'view-switcher';
  icon?: string;
  iconSize?: number;
  isActive?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  icon,
  iconSize = 0.6,
  isActive = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'rounded-full transition-colors flex items-center justify-center';

  const variantStyles = {
    default:
      'px-3 py-2 bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-gray-hover disabled:opacity-30',
    icon: 'w-9 h-9 bg-grok-gray text-white border border-white/20 hover:bg-grok-gray-hover disabled:opacity-30',
    'view-switcher': isActive
      ? 'px-3 py-2 bg-grok-light text-white border border-white/20 text-xs'
      : 'px-3 py-2 bg-grok-gray text-white/50 border border-white/10 text-xs hover:text-white/70',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <Icon path={icon} size={variant === 'icon' ? 0.8 : iconSize} />}
      {children && (
        <span className={icon ? 'ml-1' : ''}>
          {children}
        </span>
      )}
    </button>
  );
};
