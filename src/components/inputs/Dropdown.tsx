/**
 * Reusable custom dropdown component with full theme-aware styling
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from '../common/Icon';
import { mdiChevronDown } from '@mdi/js';

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
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
}) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption?.label || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    <div ref={dropdownRef} className={`relative ${className}`} style={{ width: '200px' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="pl-3 pr-8 py-2 rounded-full text-sm cursor-pointer focus:outline-none transition-colors text-left relative block"
        style={{
          backgroundColor: colors.BACKGROUND_MEDIUM,
          color: colors.TEXT_PRIMARY,
          border: `1px solid ${colors.BORDER}`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
          }
        }}
      >
        {selectedLabel}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon
            path={mdiChevronDown}
            size={0.6}
            color={colors.TEXT_PRIMARY}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
          style={{
            backgroundColor: colors.BACKGROUND_MEDIUM,
            border: `1px solid ${colors.BORDER}`,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className="w-full px-3 py-2 text-sm text-left cursor-pointer transition-colors"
              style={{
                backgroundColor: option.value === value ? colors.BACKGROUND_LIGHT : colors.BACKGROUND_MEDIUM,
                color: option.value === value ? colors.TEXT_HOVER || colors.TEXT_PRIMARY : colors.TEXT_PRIMARY,
                border: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
                e.currentTarget.style.color = colors.TEXT_HOVER || colors.TEXT_PRIMARY;
              }}
              onMouseLeave={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
                  e.currentTarget.style.color = colors.TEXT_PRIMARY;
                } else {
                  e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
                  e.currentTarget.style.color = colors.TEXT_HOVER || colors.TEXT_PRIMARY;
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
