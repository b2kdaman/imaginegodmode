/**
 * Reusable tabs component with tab-style navigation
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
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
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const isUp = direction === 'up';
  const { glowStyles, handleMouseEnter, handleMouseLeave, getGlowOverlay } = useMultiGlowAnimation();

  return (
    <>
      <style>{glowStyles}</style>
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
              className={`flex-1 px-4 py-2 text-xs transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
                isUp ? 'rounded-b-lg' : 'rounded-t-lg'
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
              data-tooltip-id={tab.tooltip ? "app-tooltip" : undefined}
              data-tooltip-content={tab.tooltip}
              data-tooltip-place="top"
              onMouseEnter={(e) => {
                if (!isActive) {
                  handleMouseEnter(
                    e,
                    tab.id,
                    false,
                    {
                      backgroundColor: `${colors.BACKGROUND_LIGHT}40`,
                      color: colors.TEXT_HOVER,
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
                      color: colors.TEXT_SECONDARY,
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
                    <Icon path={tab.icon} size={0.8} color={isActive ? colors.TEXT_PRIMARY : colors.TEXT_SECONDARY} />
                  </span>
                )}
                {tab.label && <span>{tab.label}</span>}
                {/* Badge - only show when count > 0 */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center px-1"
                    style={{
                      backgroundColor: colors.GLOW_PRIMARY,
                      color: colors.BACKGROUND_DARK,
                    }}
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
