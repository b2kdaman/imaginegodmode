/**
 * Main floating panel component
 */

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PromptView } from './PromptView';
import { OpsView } from './OpsView';
import { SettingsView } from './SettingsView';
import { HelpView } from './HelpView';
import { UI_POSITION, VERSION } from '@/utils/constants';
import { Button } from './Button';
import { Tabs } from './Tabs';
import { FullscreenButton } from './FullscreenButton';
import { PauseButton } from './PauseButton';
import { mdiChevronUp, mdiChevronDown } from '@mdi/js';

export const MainPanel: React.FC = () => {
  const { isExpanded, currentView, toggleExpanded, setCurrentView } = useUIStore();
  const { getThemeColors, getScale } = useSettingsStore();
  const colors = getThemeColors();
  const scale = getScale();

  const tabs = [
    { id: 'prompt', label: 'Prompt' },
    { id: 'ops', label: 'Ops' },
    { id: 'settings', label: 'Settings' },
    { id: 'help', label: 'Help' },
  ];

  return (
    <div
      className="fixed z-[99999] flex flex-col transition-transform duration-200"
      style={{
        bottom: UI_POSITION.BOTTOM,
        right: UI_POSITION.RIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom right',
      }}
    >
      {/* Main container */}
      <div className="flex flex-col items-end gap-2">
        {/* Toggle and fullscreen buttons with version */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end px-2 leading-tight">
            <span
              className="text-[10px] font-medium"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              ImagineGodMode {VERSION}
            </span>
            <span
              className="text-[9px]"
              style={{ color: `${colors.TEXT_SECONDARY}80` }}
            >
              by b2kdaman
            </span>
          </div>
          <PauseButton />
          <FullscreenButton />
          <Button
            variant="icon"
            onClick={toggleExpanded}
            icon={isExpanded ? mdiChevronDown : mdiChevronUp}
            iconSize={0.9}
            className="shadow-lg"
            tooltip={isExpanded ? 'Collapse panel' : 'Expand panel'}
          />
        </div>

        {/* Content wrapper */}
        {isExpanded && (
          <div
            className="rounded-2xl p-4 shadow-2xl w-[320px]"
            style={{
              backgroundColor: colors.BACKGROUND_DARK,
              border: `1px solid ${colors.BORDER}`,
            }}
          >
            {/* View content */}
            {currentView === 'prompt' && <PromptView />}
            {currentView === 'ops' && <OpsView />}
            {currentView === 'settings' && <SettingsView />}
            {currentView === 'help' && <HelpView />}

            {/* Tabs */}
            <Tabs
              tabs={tabs}
              activeTab={currentView}
              onChange={(tabId) => setCurrentView(tabId as any)}
              direction="up"
            />
          </div>
        )}
      </div>
    </div>
  );
};
