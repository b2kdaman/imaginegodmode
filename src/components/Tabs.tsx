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
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-1 border-b border-white/10 mb-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-xs transition-colors relative ${
              isActive
                ? 'bg-grok-gray text-white border-t border-l border-r border-white/20 rounded-t-lg'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
            }`}
            style={{
              marginBottom: isActive ? '-1px' : '0',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
