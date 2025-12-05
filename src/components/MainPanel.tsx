/**
 * Main floating panel component
 */

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PromptView } from './views/PromptView';
import { OpsView } from './views/OpsView';
import { SettingsView } from './views/SettingsView';
import { HelpView } from './views/HelpView';
import { UI_POSITION, Z_INDEX } from '@/utils/constants';
import { Tabs } from './inputs/Tabs';
import { PanelControls } from './common/PanelControls';
import { useUrlVisibility } from '@/hooks/useUrlVisibility';
import { useTranslation } from '@/contexts/I18nContext';

type ViewType = 'prompt' | 'ops' | 'settings' | 'help';

const VIEW_COMPONENTS: Record<ViewType, React.FC> = {
  prompt: PromptView,
  ops: OpsView,
  settings: SettingsView,
  help: HelpView,
};

export const MainPanel: React.FC = () => {
  const { isExpanded, currentView, setCurrentView } = useUIStore();
  const { getThemeColors, getScale } = useSettingsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();
  const scale = getScale();
  const isVisible = useUrlVisibility('/imagine');

  // Don't render if URL doesn't contain /imagine
  if (!isVisible) {
    return null;
  }

  const CurrentView = VIEW_COMPONENTS[currentView as ViewType] || PromptView;

  const tabs = [
    { id: 'prompt', label: t('tabs.prompt') },
    { id: 'ops', label: t('tabs.ops') },
    { id: 'settings', label: t('tabs.settings') },
    { id: 'help', label: t('tabs.help') },
  ];

  return (
    <div
      className="fixed flex flex-col transition-transform duration-200"
      style={{
        bottom: UI_POSITION.BOTTOM,
        right: UI_POSITION.RIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom right',
        zIndex: Z_INDEX.MAIN_PANEL,
      }}
    >
      {/* Main container */}
      <div className="flex flex-col items-end gap-2">
        {/* Panel controls */}
        <PanelControls />

        {/* Content wrapper */}
        <div
          className="rounded-2xl p-4 shadow-2xl w-[320px]"
          style={{
            backgroundColor: `${colors.BACKGROUND_DARK}aa`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${colors.BORDER}`,
            display: isExpanded ? 'block' : 'none',
          }}
        >
          {/* View content */}
          <CurrentView />

          {/* Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={currentView}
            onChange={(tabId) => setCurrentView(tabId as ViewType)}
            direction="up"
          />
        </div>
      </div>
    </div>
  );
};
