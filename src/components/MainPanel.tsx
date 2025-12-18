/**
 * Main floating panel component
 */

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useJobQueueStore } from '@/store/useJobQueueStore';
import { PromptView } from './views/PromptView';
import { OpsView } from './views/OpsView';
import { SettingsView } from './views/SettingsView';
import { HelpView } from './views/HelpView';
import { QueueView } from './views/QueueView';
import { PitView } from './views/PitView';
import { UI_POSITION, Z_INDEX } from '@/utils/constants';
import { Tabs } from './inputs/Tabs';
import { PanelControls } from './common/PanelControls';
import { VersionBadge } from './common/VersionBadge';
import { useUrlVisibility } from '@/hooks/useUrlVisibility';
import { useTranslation } from '@/contexts/I18nContext';
import { isMobileDevice } from '@/utils/deviceDetection';
import { mdiTrayFull, mdiTextBox, mdiCheckboxMultipleMarkedOutline, mdiCog, mdiHelpCircle, mdiFire } from '@mdi/js';

type ViewType = 'prompt' | 'ops' | 'settings' | 'help' | 'queue' | 'pit';

const VIEW_COMPONENTS: Record<ViewType, React.FC> = {
  prompt: PromptView,
  ops: OpsView,
  settings: SettingsView,
  help: HelpView,
  queue: QueueView,
  pit: PitView,
};

export const MainPanel: React.FC = () => {
  const { isExpanded, currentView, setCurrentView } = useUIStore();
  const { getThemeColors, getScale, enableThePit } = useSettingsStore();
  const { jobs } = useJobQueueStore();
  const { t } = useTranslation();
  const colors = getThemeColors();
  const scale = getScale();
  const isVisible = useUrlVisibility('/imagine');

  // Calculate active jobs count (pending + processing)
  const activeJobsCount = jobs.filter((job) => job.status === 'pending' || job.status === 'processing').length;

  // Animation state
  const [shouldRender, setShouldRender] = useState(isExpanded);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousView, setPreviousView] = useState<ViewType>(currentView as ViewType);

  // Handle expand/collapse animation
  useEffect(() => {
    if (isExpanded) {
      // Start with element rendered but in collapsed state
      // Use setTimeout to avoid synchronous setState in effect
      const renderTimer = setTimeout(() => {
        setShouldRender(true);

        // Trigger animation on next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsAnimatingIn(true);
          });
        });
      }, 0);
      return () => clearTimeout(renderTimer);
    } else {
      // Collapse animation
      // Use setTimeout to avoid synchronous setState in effect
      const collapseTimer = setTimeout(() => {
        setIsAnimatingIn(false);

        // Delay unmounting until animation completes
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 300); // Match transition duration
        return () => clearTimeout(timer);
      }, 0);
      return () => clearTimeout(collapseTimer);
    }
  }, [isExpanded]);

  // Handle tab switch animation
  useEffect(() => {
    if (previousView !== currentView) {
      // Use setTimeout to avoid synchronous setState in effect
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setPreviousView(currentView as ViewType);
          setIsTransitioning(false);
        }, 200); // Animation duration
        return () => clearTimeout(timer);
      }, 0);
      return () => clearTimeout(transitionTimer);
    }
  }, [currentView, previousView]);

  // Don't render if URL doesn't contain /imagine
  if (!isVisible) {
    return null;
  }

  const CurrentView = VIEW_COMPONENTS[currentView as ViewType] || PromptView;
  const PreviousViewComponent = VIEW_COMPONENTS[previousView] || PromptView;

  const allTabs = [
    {
      id: 'prompt',
      icon: mdiTextBox,
      iconOnly: true,
      tooltip: t('tabs.prompt')
    },
    {
      id: 'ops',
      icon: mdiCheckboxMultipleMarkedOutline,
      iconOnly: true,
      tooltip: t('tabs.ops')
    },
    {
      id: 'settings',
      icon: mdiCog,
      iconOnly: true,
      tooltip: t('tabs.settings')
    },
    // Queue tab - icon only with badge
    {
      id: 'queue',
      icon: mdiTrayFull,
      badge: activeJobsCount,
      iconOnly: true,
      tooltip: t('tabs.queueTooltip'),
    },
    {
      id: 'help',
      icon: mdiHelpCircle,
      iconOnly: true,
      tooltip: t('tabs.help')
    },
    {
      id: 'pit',
      icon: mdiFire,
      iconOnly: true,
      tooltip: 'The Pit'
    },
  ];

  // Filter tabs based on settings
  const tabs = allTabs.filter(tab => {
    if (tab.id === 'pit') {
      return enableThePit;
    }
    return true;
  });

  // Determine bottom position based on device type
  const bottomPosition = isMobileDevice() ? UI_POSITION.BOTTOM_MOBILE : UI_POSITION.BOTTOM;

  return (
    <div
      className="fixed flex flex-col transition-transform duration-200"
      style={{
        bottom: bottomPosition,
        right: UI_POSITION.RIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom right',
        zIndex: Z_INDEX.MAIN_PANEL,
      }}
    >
      {/* Main container */}
      <div className="flex flex-col items-end gap-2">
        {/* Version badge above controls */}
        <VersionBadge />

        {/* Panel controls */}
        <PanelControls />

        {/* Content wrapper with expand/collapse animation */}
        {shouldRender && (
          <div
            className="rounded-2xl p-4 shadow-2xl w-[360px] overflow-hidden transition-all duration-300 ease-out"
            style={{
              backgroundColor: `${colors.BACKGROUND_DARK}aa`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${colors.BORDER}`,
              maxHeight: isAnimatingIn ? '800px' : '0px',
              opacity: isAnimatingIn ? 1 : 0,
              padding: isAnimatingIn ? '16px' : '0px 16px',
              transform: isAnimatingIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transformOrigin: 'bottom right',
            }}
          >
            {/* View content with transition */}
            <div className="relative">
              {/* Previous view fading out */}
              {isTransitioning && (
                <div
                  className="absolute inset-0 transition-all duration-200 ease-out pointer-events-none"
                  style={{
                    opacity: 0,
                    transform: 'translateX(-20px)',
                  }}
                >
                  <PreviousViewComponent />
                </div>
              )}

              {/* Current view fading in */}
              <div
                className="transition-all duration-200 ease-out"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'translateX(20px)' : 'translateX(0)',
                }}
              >
                <CurrentView />
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              tabs={tabs}
              activeTab={currentView}
              onChange={(tabId) => setCurrentView(tabId as ViewType)}
              direction="up"
            />
          </div>
        )}
      </div>
    </div>
  );
};
