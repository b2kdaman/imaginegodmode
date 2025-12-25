/**
 * Base modal component with common structure and animations
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { mdiClose } from '@mdi/js';
import { Icon } from '../common/Icon';
import { Z_INDEX } from '@/utils/constants';
import type { ThemeColors } from '@/utils/themeLoader';

interface BaseModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  getThemeColors: () => ThemeColors;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  maxHeight?: string;
  width?: string;
  height?: string;
  padding?: string;
  overlayOpacity?: number;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  disableClose?: boolean;
  footer?: React.ReactNode;
  headerExtra?: React.ReactNode;
}

const maxWidthMap = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  title,
  onClose,
  getThemeColors: _getThemeColors,
  children,
  maxWidth = 'md',
  maxHeight,
  width,
  height,
  padding = 'p-3',
  overlayOpacity = 0.5,
  showCloseButton = true,
  closeOnOverlayClick = true,
  disableClose = false,
  footer,
  headerExtra,
}) => {
  if (!isOpen) {return null;}

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && !disableClose) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (!disableClose) {
      onClose();
    }
  };

  const maxWidthClass = maxWidthMap[maxWidth];

  const modalContent = (
    <div
      className="modal-overlay fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        zIndex: Z_INDEX.MODAL,
      }}
      onClick={handleOverlayClick}
    >
      <div
        className={`modal-content bg-theme-bg-dark/[0.67] backdrop-blur-xl border border-theme-border shadow-theme-shadow rounded-xl ${padding} ${maxWidthClass} w-full mx-4 flex flex-col gap-2`}
        style={{
          ...(width && { width }),
          ...(height && { height }),
          ...(maxHeight && { maxHeight }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <h2 className="text-sm font-semibold text-theme-text-primary">
              {title}
            </h2>
            {headerExtra}
          </div>
          {showCloseButton && (
            <button
              onClick={handleCloseClick}
              disabled={disableClose}
              className="rounded-full p-1 transition-colors flex-shrink-0 text-theme-text-secondary hover:bg-theme-bg-medium hover:text-theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!disableClose) {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disableClose) {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <Icon path={mdiClose} size={0.8} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
