/**
 * Reusable tabs component with tab-style navigation
 */

import React from 'react';

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
  const isUp = direction === 'up';

  return (
    <div className={`flex gap-1 ${isUp ? 'border-t mt-4' : 'border-b mb-4'} border-white/10`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-xs transition-colors relative ${
              isActive
                ? isUp
                  ? 'bg-grok-gray text-white border-b border-l border-r border-white/20 rounded-b-lg'
                  : 'bg-grok-gray text-white border-t border-l border-r border-white/20 rounded-t-lg'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
            }`}
            style={{
              marginBottom: !isUp && isActive ? '-1px' : '0',
              marginTop: isUp && isActive ? '-1px' : '0',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
