/**
 * Collapsible section component with settings integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from './Icon';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  headerClassName?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  className = '',
  style = {},
  headerClassName = '',
}) => {
  const { collapseSections, getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isCollapsed, setIsCollapsed] = useState(collapseSections);
  const [maxHeight, setMaxHeight] = useState<string>('none');
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with settings store
  useEffect(() => {
    setIsCollapsed(collapseSections);
  }, [collapseSections]);

  // Update max height when collapse state changes or content changes
  useEffect(() => {
    if (contentRef.current) {
      if (!collapseSections || !isCollapsed) {
        // Use a large value instead of 'none' for smooth animation
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      } else {
        setMaxHeight('0px');
      }
    }
  }, [isCollapsed, collapseSections, children]);

  return (
    <div className={className} style={style}>
      {/* Section Header - Conditionally Clickable */}
      <div
        className={`text-xs font-semibold uppercase tracking-wider pb-2 border-b flex items-center justify-between transition-all duration-200 ${
          collapseSections ? 'cursor-pointer hover:opacity-80' : ''
        } ${headerClassName}`}
        style={{
          color: colors.TEXT_SECONDARY,
          borderColor: `${colors.BORDER}40`,
          marginBottom: isCollapsed && collapseSections ? '0' : '12px',
          transition: 'margin-bottom 0.3s ease-in-out',
        }}
        onClick={collapseSections ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <span>{title}</span>
        {collapseSections && (
          <Icon
            path={isCollapsed ? mdiChevronDown : mdiChevronUp}
            size={0.7}
            color={colors.TEXT_SECONDARY}
          />
        )}
      </div>

      {/* Section Content with Animation */}
      <div
        ref={contentRef}
        style={{
          maxHeight: maxHeight,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
          opacity: !collapseSections || !isCollapsed ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};
