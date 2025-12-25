/**
 * Reusable tabs component with tab-style navigation
 */

import React from 'react';
import { useMultiGlowAnimation } from '@/hooks/useGlowAnimation';
import { Icon } from '../common/Icon';

export interface Tab {
  id: string;
  label?: string;
  icon?: string;
  badge?: number;
  iconOnly?: boolean;
  tooltip?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  direction?: 'up' | 'down';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, direction = 'down' }) => {
  const isUp = direction === 'up';
  const { glowStyles, handleMouseEnter, handleMouseLeave, getGlowOverlay } = useMultiGlowAnimation();

  return (
    <>
      <style>{glowStyles}</style>
      <div
        className={`flex gap-2 ${isUp ? 'border-t border-theme-border mt-4' : 'border-b border-theme-border mb-4'}`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 px-4 py-2 text-xs transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
                isUp ? 'rounded-b-lg' : 'rounded-t-lg'
              } ${
                isActive
                  ? 'bg-theme-bg-medium text-theme-text-primary border border-theme-border'
                  : 'text-theme-text-secondary'
              } ${
                isActive && !isUp ? 'border-t-theme-border' : ''
              } ${
                isActive && isUp ? 'border-b-theme-border' : ''
              }`}
              style={{
                marginBottom: !isUp && isActive ? '-1px' : '0',
                marginTop: isUp && isActive ? '-1px' : '0',
              }}
              data-tooltip-content={tab.tooltip}
              onMouseEnter={(e) => {
                if (!isActive) {
                  handleMouseEnter(
                    e,
                    tab.id,
                    false,
                    {
                      backgroundColor: `var(--color-bg-light)`,
                      color: `var(--color-text-hover)`,
                    }
                  );
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  handleMouseLeave(
                    e,
                    false,
                    {
                      backgroundColor: 'transparent',
                      color: `var(--color-text-secondary)`,
                    }
                  );
                }
              }}
            >
              {/* Glow effect */}
              {!isActive && getGlowOverlay(tab.id)}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon && (
                  <span className="-mx-1">
                    <Icon path={tab.icon} size={0.8} color={isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'} />
                  </span>
                )}
                {tab.label && <span>{tab.label}</span>}
                {/* Badge - only show when count > 0 */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center px-1 bg-theme-glow-primary text-theme-bg-dark"
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
