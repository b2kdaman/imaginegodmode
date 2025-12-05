/**
 * Base modal component with common structure and animations
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { mdiClose } from '@mdi/js';
import { Icon } from '../common/Icon';
import { Z_INDEX } from '@/utils/constants';

interface BaseModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  getThemeColors: () => any;
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
  getThemeColors,
  children,
  maxWidth = 'md',
  maxHeight,
  width,
  height,
  padding = 'p-4',
  overlayOpacity = 0.5,
  showCloseButton = true,
  closeOnOverlayClick = true,
  disableClose = false,
  footer,
  headerExtra,
}) => {
  const colors = getThemeColors();

  if (!isOpen) return null;

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
        className={`modal-content rounded-xl ${padding} ${maxWidthClass} w-full mx-4 flex flex-col`}
        style={{
          backgroundColor: colors.BACKGROUND_DARK,
          border: `1px solid ${colors.BORDER}`,
          boxShadow: `0 8px 32px ${colors.SHADOW}`,
          ...(width && { width }),
          ...(height && { height }),
          ...(maxHeight && { maxHeight }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <h2
              className="text-sm font-semibold"
              style={{ color: colors.TEXT_PRIMARY }}
            >
              {title}
            </h2>
            {headerExtra}
          </div>
          {showCloseButton && (
            <button
              onClick={handleCloseClick}
              disabled={disableClose}
              className="rounded-full p-1 transition-colors flex-shrink-0"
              style={{
                backgroundColor: 'transparent',
                color: colors.TEXT_SECONDARY,
                opacity: disableClose ? 0.5 : 1,
                cursor: disableClose ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!disableClose) {
                  e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
                  e.currentTarget.style.color = colors.TEXT_PRIMARY;
                }
              }}
              onMouseLeave={(e) => {
                if (!disableClose) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.TEXT_SECONDARY;
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
          <div className="mt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
