/**
 * Main floating panel component
 */

import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useJobQueueStore } from '@/store/useJobQueueStore';
import { PromptView } from './views/PromptView';
import { OpsView } from './views/OpsView';
import { SettingsView } from './views/SettingsView';
import { HelpView } from './views/HelpView';
import { QueueView } from './views/QueueView';
import { PitView } from './views/PitView';
import { UI_POSITION, Z_INDEX, TIMING } from '@/utils/constants';
import { Tabs } from './inputs/Tabs';
import { PanelControls } from './common/PanelControls';
import { VersionBadge } from './common/VersionBadge';
import { DragHandle } from './common/DragHandle';
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
  const { getThemeColors, getScale, enableThePit, panelPosition, setPanelPosition } = useSettingsStore();
  const { jobs } = useJobQueueStore();
  const { t } = useTranslation();
  const colors = getThemeColors();
  const scale = getScale();
  const isVisible = useUrlVisibility('/imagine');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Auto-switch view based on URL
  const lastUrl = useRef(window.location.href);
  useEffect(() => {
    const checkUrlAndSwitchView = () => {
      const currentUrl = window.location.href;

      // Check if URL changed
      if (currentUrl !== lastUrl.current) {
        lastUrl.current = currentUrl;

        // If on /favorites, switch to ops view
        if (currentUrl.includes('/favorites') && currentView !== 'ops') {
          setCurrentView('ops');
        }
        // If on a post page (/imagine/post/[id]), switch to prompt view
        else if (currentUrl.includes('/imagine/post/') && currentView !== 'prompt') {
          setCurrentView('prompt');
        }
      }
    };

    // Check on mount
    checkUrlAndSwitchView();

    // Check periodically for URL changes
    const interval = setInterval(checkUrlAndSwitchView, TIMING.URL_WATCHER_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [currentView, setCurrentView]);

  // Handle drag move
  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) {
        return;
      }

      const rect = panelRef.current.getBoundingClientRect();
      const newX = e.clientX - dragOffset.x;
      const newBottom = window.innerHeight - (e.clientY - dragOffset.y) - rect.height;

      // Get panel dimensions
      const panelWidth = rect.width;

      // Calculate boundaries (with some padding)
      const minX = 0;
      const maxX = window.innerWidth - panelWidth;
      const minBottom = 0;
      const maxBottom = window.innerHeight - rect.height;

      // Constrain position within boundaries
      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedBottom = Math.max(minBottom, Math.min(maxBottom, newBottom));

      setPanelPosition({ x: constrainedX, y: constrainedBottom });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, setPanelPosition]);

  // Check if panel is fully visible and adjust position if needed
  useEffect(() => {
    const checkAndAdjustPosition = () => {
      if (!panelRef.current || !panelPosition) {
        return;
      }

      const rect = panelRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let needsAdjustment = false;
      let newX = panelPosition.x;
      let newY = panelPosition.y;

      // Account for scale when checking bounds
      // The rect values are already scaled, so we need to work with them directly

      // Check if panel is outside viewport bounds
      // Left edge (panel going off left side)
      if (rect.left < 0) {
        newX = panelPosition.x - rect.left;
        needsAdjustment = true;
      }

      // Right edge (panel going off right side)
      if (rect.right > windowWidth) {
        newX = panelPosition.x - (rect.right - windowWidth);
        needsAdjustment = true;
      }

      // Top edge (panel going off top)
      if (rect.top < 0) {
        newY = panelPosition.y - rect.top;
        needsAdjustment = true;
      }

      // Bottom edge (panel going off bottom)
      if (rect.bottom > windowHeight) {
        newY = panelPosition.y - (rect.bottom - windowHeight);
        needsAdjustment = true;
      }

      // Update position if adjustment is needed
      if (needsAdjustment) {
        setPanelPosition({ x: newX, y: newY });
      }
    };

    // Only check on window resize, not on every position change
    // to avoid feedback loops
    window.addEventListener('resize', checkAndAdjustPosition);

    return () => {
      window.removeEventListener('resize', checkAndAdjustPosition);
    };
  }, [panelPosition, setPanelPosition]);

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

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (!panelRef.current) {
      return;
    }

    const rect = panelRef.current.getBoundingClientRect();

    // If this is the first drag (no panelPosition set), initialize it with current position
    // This prevents jumping when transform origin changes from bottom-right to bottom-left
    if (!panelPosition) {
      const currentX = rect.left;
      const currentY = window.innerHeight - rect.bottom;
      setPanelPosition({ x: currentX, y: currentY });
    }

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  // Calculate position styles
  const getPositionStyles = () => {
    if (panelPosition) {
      return {
        left: `${panelPosition.x}px`,
        bottom: `${panelPosition.y}px`,
        top: 'auto',
        right: 'auto',
      };
    }
    return {
      bottom: bottomPosition,
      right: UI_POSITION.RIGHT,
    };
  };

  return (
    <div
      ref={panelRef}
      className="fixed flex flex-col transition-transform duration-200"
      style={{
        ...getPositionStyles(),
        transform: `scale(${scale})`,
        transformOrigin: panelPosition ? 'bottom left' : 'bottom right',
        zIndex: Z_INDEX.MAIN_PANEL,
        cursor: isDragging ? 'grabbing' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Main container */}
      <div className="flex flex-col items-end gap-2 w-[360px]">
        {/* Version badge above controls */}
        <VersionBadge />

        {/* Panel controls */}
        <PanelControls />

        {/* Content wrapper with expand/collapse animation */}
        {shouldRender && (
          <div
            className="rounded-2xl p-4 shadow-2xl w-full overflow-hidden transition-all duration-300 ease-out relative"
            style={{
              backgroundColor: `${colors.BACKGROUND_DARK}aa`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${colors.BORDER}`,
              maxHeight: isAnimatingIn ? '800px' : '0px',
              opacity: isAnimatingIn ? 1 : 0,
              padding: isAnimatingIn ? '16px' : '0px 16px',
              transform: isAnimatingIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transformOrigin: panelPosition ? 'bottom left' : 'bottom right',
            }}
          >
            {/* Drag handle */}
            <DragHandle
              onMouseDown={handleDragStart}
              tooltipContent={t('help.tooltips.dragPanel')}
            />

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
