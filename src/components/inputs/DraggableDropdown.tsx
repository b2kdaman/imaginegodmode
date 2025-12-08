/**
 * Draggable dropdown component with reorderable options using native HTML5 drag and drop
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from '../common/Icon';
import { mdiChevronDown, mdiDrag } from '@mdi/js';
import { Z_INDEX } from '@/utils/constants';
import { useGlowAnimation } from '@/hooks/useGlowAnimation';

interface DropdownOption {
  value: string;
  label: string;
}

interface DraggableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  onReorder?: (newOrder: string[]) => void;
  disabled?: boolean;
  className?: string;
}

interface ThemeColors {
  BACKGROUND_DARK: string;
  BACKGROUND_MEDIUM: string;
  BACKGROUND_LIGHT: string;
  TEXT_PRIMARY: string;
  TEXT_SECONDARY: string;
  TEXT_HOVER?: string;
}

interface DraggableOptionProps {
  option: DropdownOption;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  colors: ThemeColors;
}

const DraggableOption: React.FC<DraggableOptionProps> = ({
  option,
  index,
  isSelected,
  onClick,
  onMove,
  colors,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(draggedIndex) && draggedIndex !== index) {
      onMove(draggedIndex, index);
    }
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onClick}
      className="w-full px-3 py-2 text-sm text-left transition-all duration-300 flex items-center gap-2"
      style={{
        backgroundColor: isDragOver
          ? colors.BACKGROUND_DARK
          : isSelected
          ? colors.BACKGROUND_LIGHT
          : colors.BACKGROUND_MEDIUM,
        color: isSelected ? colors.TEXT_HOVER || colors.TEXT_PRIMARY : colors.TEXT_PRIMARY,
        border: 'none',
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'pointer',
      }}
    >
      <Icon path={mdiDrag} size={0.5} color={colors.TEXT_SECONDARY} />
      <span className="flex-1">{option.label}</span>
    </button>
  );
};

export const DraggableDropdown: React.FC<DraggableDropdownProps> = ({
  value,
  onChange,
  options: initialOptions,
  onReorder,
  disabled = false,
  className = '',
}) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(initialOptions);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const triggerGlow = useGlowAnimation({ scaleFactor: 1.02 });

  // Update options when initialOptions change
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  // Get or create portal container
  const portalContainer = useMemo(() => {
    const portalId = 'imaginegodmode-draggable-dropdown-portal';
    let container = document.getElementById(portalId);
    if (!container) {
      container = document.createElement('div');
      container.id = portalId;
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.zIndex = String(Z_INDEX.DROPDOWN);
      container.style.pointerEvents = 'none';
      const appRoot = document.getElementById('imaginegodmode-root');
      if (appRoot) {
        appRoot.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
    }
    return container;
  }, []);

  // Get selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption?.label || '';

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

  const moveOption = (dragIndex: number, hoverIndex: number) => {
    const newOptions = [...options];
    const [removed] = newOptions.splice(dragIndex, 1);
    newOptions.splice(hoverIndex, 0, removed);
    setOptions(newOptions);

    // Call onReorder callback with new order
    if (onReorder) {
      onReorder(newOptions.map(opt => opt.value));
    }
  };

  return (
    <>
      <style>{triggerGlow.glowStyles}</style>
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
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
              e.currentTarget.style.color = colors.TEXT_PRIMARY;
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              triggerGlow.handleMouseLeave(e);
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
              e.currentTarget.style.color = colors.TEXT_PRIMARY;
            }
          }}
        >
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
          {options.map((option, index) => (
            <DraggableOption
              key={option.value}
              option={option}
              index={index}
              isSelected={option.value === value}
              onClick={() => handleSelect(option.value)}
              onMove={moveOption}
              colors={colors}
            />
          ))}
        </div>,
        portalContainer
      )}
    </>
  );
};
