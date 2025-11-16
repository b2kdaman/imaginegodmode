/**
 * Reusable tabs component with tab-style navigation
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  direction?: 'up' | 'down';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, direction = 'down' }) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const isUp = direction === 'up';

  return (
    <div
      className={`flex gap-1 ${isUp ? 'border-t mt-4' : 'border-b mb-4'}`}
      style={{ borderColor: `${colors.BORDER}` }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-xs transition-colors relative ${
              isActive
                ? isUp
                  ? 'rounded-b-lg'
                  : 'rounded-t-lg'
                : ''
            }`}
            style={{
              backgroundColor: isActive ? colors.BACKGROUND_MEDIUM : 'transparent',
              color: isActive ? colors.TEXT_PRIMARY : colors.TEXT_SECONDARY,
              border: isActive ? `1px solid ${colors.BORDER}` : 'none',
              borderTop: isActive && !isUp ? `1px solid ${colors.BORDER}` : isUp ? 'none' : 'none',
              borderBottom: isActive && isUp ? `1px solid ${colors.BORDER}` : !isUp ? 'none' : 'none',
              marginBottom: !isUp && isActive ? '-1px' : '0',
              marginTop: isUp && isActive ? '-1px' : '0',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = colors.TEXT_HOVER;
                e.currentTarget.style.backgroundColor = `${colors.BACKGROUND_LIGHT}40`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = colors.TEXT_SECONDARY;
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
