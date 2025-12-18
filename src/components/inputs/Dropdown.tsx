/**
 * Reusable custom dropdown component with full theme-aware styling
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from '../common/Icon';
import { mdiChevronDown } from '@mdi/js';
import { Z_INDEX } from '@/utils/constants';
import { useGlowAnimation, useMultiGlowAnimation } from '@/hooks/useGlowAnimation';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  placeholder = '',
}) => {
  const { getThemeColors, getScale } = useSettingsStore();
  const colors = getThemeColors();
  const scale = getScale();
  const baseFontSize = 0.875; // text-sm = 0.875rem (14px)
  const scaledFontSize = baseFontSize * scale;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Glow animations for trigger button and dropdown options
  const triggerGlow = useGlowAnimation({ scaleFactor: 1.02 });
  const optionsGlow = useMultiGlowAnimation();

  // Detect if dropdown is inside a modal by checking parent elements
  const isInsideModal = useMemo(() => {
    if (typeof window === 'undefined') {return false;}
    // Check if any parent has the modal-overlay class
    return !!document.querySelector('.modal-overlay');
  }, []);

  // Get or create portal container with appropriate z-index
  const portalContainer = useMemo(() => {
    const portalId = isInsideModal ? 'imaginegodmode-modal-dropdown-portal' : 'imaginegodmode-dropdown-portal';
    let container = document.getElementById(portalId);
    if (!container) {
      container = document.createElement('div');
      container.id = portalId;
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.zIndex = String(isInsideModal ? Z_INDEX.MODAL_DROPDOWN : Z_INDEX.DROPDOWN);
      container.style.pointerEvents = 'none';
      const appRoot = document.getElementById('imaginegodmode-root');
      if (appRoot) {
        appRoot.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
    }
    return container;
  }, [isInsideModal]);

  // Get selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <style>{triggerGlow.glowStyles}</style>
      <style>{optionsGlow.glowStyles}</style>
      <div className={`relative ${className}`}>
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="pl-3 pr-8 py-2 rounded-full text-sm cursor-pointer focus:outline-none transition-all duration-300 text-left relative block overflow-hidden"
          style={{
            backgroundColor: colors.BACKGROUND_MEDIUM,
            color: colors.TEXT_PRIMARY,
            border: `1px solid ${colors.BORDER}`,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              triggerGlow.handleMouseEnter(e);
              // Override with dropdown-specific colors
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
              e.currentTarget.style.color = colors.TEXT_PRIMARY;
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              triggerGlow.handleMouseLeave(e);
              // Override with dropdown-specific colors
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
              e.currentTarget.style.color = colors.TEXT_PRIMARY;
            }
          }}
        >
          {/* Glow effect for trigger */}
          {!disabled && <triggerGlow.GlowOverlay />}
          <span
            className="relative z-10"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              paddingRight: '8px',
            }}
          >
            {selectedLabel}
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon
              path={mdiChevronDown}
              size={0.6}
              color={colors.TEXT_PRIMARY}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </span>
        </button>
      </div>

      {/* Dropdown Menu - Rendered in Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="rounded-lg shadow-lg overflow-hidden"
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            pointerEvents: 'auto',
            backgroundColor: colors.BACKGROUND_MEDIUM,
            border: `1px solid ${colors.BORDER}`,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full px-3 py-2 text-left cursor-pointer transition-all duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: isSelected ? colors.BACKGROUND_LIGHT : colors.BACKGROUND_MEDIUM,
                  color: isSelected ? colors.TEXT_HOVER || colors.TEXT_PRIMARY : colors.TEXT_PRIMARY,
                  border: 'none',
                  fontSize: `${scaledFontSize}rem`,
                }}
                onMouseEnter={(e) => {
                  optionsGlow.handleMouseEnter(
                    e,
                    option.value,
                    false,
                    {
                      backgroundColor: colors.BACKGROUND_LIGHT,
                      color: colors.TEXT_HOVER || colors.TEXT_PRIMARY,
                    }
                  );
                }}
                onMouseLeave={(e) => {
                  optionsGlow.handleMouseLeave(
                    e,
                    false,
                    isSelected
                      ? {
                          backgroundColor: colors.BACKGROUND_LIGHT,
                          color: colors.TEXT_HOVER || colors.TEXT_PRIMARY,
                        }
                      : {
                          backgroundColor: colors.BACKGROUND_MEDIUM,
                          color: colors.TEXT_PRIMARY,
                        }
                  );
                }}
              >
                {/* Glow effect for options */}
                {optionsGlow.getGlowOverlay(option.value)}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>,
        portalContainer
      )}
    </>
  );
};
