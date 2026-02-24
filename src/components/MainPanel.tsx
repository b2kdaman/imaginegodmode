/**
 * Main floating panel component
 */
import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePowerToolsStore } from '@/store/usePowerToolsStore';
import { PromptView } from './views/PromptView';
import { OpsView } from './views/OpsView';
import { SettingsView } from './views/SettingsView';
import { HelpView } from './views/HelpView';
import { PitView } from './views/PitView';
import { QueueView } from './views/QueueView';
import { PowerToolsView } from './views/PowerToolsView';
import { UI_POSITION, Z_INDEX, TIMING } from '@/utils/constants';
import { Tabs } from './inputs/Tabs';
import { PanelControls } from './common/PanelControls';
import { VersionBadge } from './common/VersionBadge';
import { DragHandle } from './common/DragHandle';
import { useAutoRetry } from '@/hooks/useAutoRetry';
import { useUrlVisibility } from '@/hooks/useUrlVisibility';
import { useTranslation } from '@/contexts/I18nContext';
import { isMobileDevice } from '@/utils/deviceDetection';
import { mdiTextBox, mdiCheckboxMultipleMarkedOutline, mdiCog, mdiHelpCircle, mdiFire, mdiWrench } from '@mdi/js';

type ViewType = 'prompt' | 'ops' | 'settings' | 'help' | 'queue' | 'pit' | 'powertools';

const VIEW_COMPONENTS: Record<ViewType, React.FC> = {
  prompt: PromptView,
  ops: OpsView,
  settings: SettingsView,
  help: HelpView,
  queue: QueueView,
  pit: PitView,
  powertools: PowerToolsView,
};

export const MainPanel: React.FC = () => {
  const { isExpanded, currentView, setCurrentView } = useUIStore();
  const { getThemeColors, getScale, enableThePit, panelPosition, setPanelPosition, resetPanelPosition, panelSize, setPanelSize } = useSettingsStore();
  const { autoRetryEnabled, cooldownRemaining } = usePowerToolsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();
  const scale = getScale();
  const isVisible = useUrlVisibility('/imagine');
  useAutoRetry();

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Animation state
  const [shouldRender, setShouldRender] = useState(isExpanded);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousView, setPreviousView] = useState<ViewType>(currentView as ViewType);

  // Handle expand/collapse animation
  useEffect(() => {
    if (isExpanded) {
      const renderTimer = setTimeout(() => {
        setShouldRender(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsAnimatingIn(true);
          });
        });
      }, 0);
      return () => clearTimeout(renderTimer);
    } else {
      const collapseTimer = setTimeout(() => {
        setIsAnimatingIn(false);
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 300);
        return () => clearTimeout(timer);
      }, 0);
      return () => clearTimeout(collapseTimer);
    }
  }, [isExpanded]);

  // Handle tab switch animation
  useEffect(() => {
    if (previousView !== currentView) {
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setPreviousView(currentView as ViewType);
          setIsTransitioning(false);
        }, 200);
        return () => clearTimeout(timer);
      }, 0);
      return () => clearTimeout(transitionTimer);
    }
  }, [currentView, previousView]);

  // Auto-switch view based on URL — but never away from powertools
  const lastUrl = useRef(window.location.href);
  useEffect(() => {
    const checkUrlAndSwitchView = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl.current) {
        lastUrl.current = currentUrl;

        // Don't auto-switch if user is on powertools tab
        if (currentView === 'powertools') { return; }

        if (currentUrl.includes('/favorites') && currentView !== 'ops') {
          setCurrentView('ops');
        } else if (currentUrl.includes('/imagine/post/') && currentView !== 'prompt') {
          setCurrentView('prompt');
        }
      }
    };
    checkUrlAndSwitchView();
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
      const panelWidth = rect.width;
      const minX = 0;
      const maxX = window.innerWidth - panelWidth;
      const minBottom = 0;
      const maxBottom = window.innerHeight - rect.height;
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

  // Handle resize
  useEffect(() => {
    if (!isResizing) {
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = resizeStart.y - e.clientY;
      const newWidth = Math.max(280, Math.min(600, resizeStart.width + deltaX));
      const newHeight = Math.max(300, Math.min(900, resizeStart.height + deltaY));
      setPanelSize({ width: newWidth, height: newHeight });
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, setPanelSize]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentWidth = panelSize?.width || 360;
    const currentHeight = panelSize?.height || 500;
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: currentWidth,
      height: currentHeight,
    });
    setIsResizing(true);
  };

  // Check on mount if panel position is out of bounds and reset if needed
  useEffect(() => {
    if (!panelPosition) {
      return;
    }
    if (!panelRef.current) {
      return;
    }
    const rect = panelRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isCompletelyOutOfBounds =
      rect.right < 0 ||
      rect.left > windowWidth ||
      rect.bottom < 0 ||
      rect.top > windowHeight;
    if (isCompletelyOutOfBounds) {
      console.warn('[Imagine God Mode] Panel is completely out of bounds, resetting to default position');
      resetPanelPosition();
    }
  }, [panelPosition, resetPanelPosition]);

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
      if (rect.left < 0) {
        newX = panelPosition.x - rect.left;
        needsAdjustment = true;
      }
      if (rect.right > windowWidth) {
        newX = panelPosition.x - (rect.right - windowWidth);
        needsAdjustment = true;
      }
      if (rect.top < 0) {
        newY = panelPosition.y - rect.top;
        needsAdjustment = true;
      }
      if (rect.bottom > windowHeight) {
        newY = panelPosition.y - (rect.bottom - windowHeight);
        needsAdjustment = true;
      }
      if (needsAdjustment) {
        setPanelPosition({ x: newX, y: newY });
      }
    };
    window.addEventListener('resize', checkAndAdjustPosition);
    return () => {
      window.removeEventListener('resize', checkAndAdjustPosition);
    };
  }, [panelPosition, setPanelPosition]);

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
    {
      id: 'powertools',
      icon: mdiWrench,
      iconOnly: true,
      tooltip: 'Power Tools'
    },
  ];

  const tabs = allTabs.filter(tab => {
    if (tab.id === 'pit') {
      return enableThePit;
    }
    return true;
  });

  const bottomPosition = isMobileDevice() ? UI_POSITION.BOTTOM_MOBILE : UI_POSITION.BOTTOM;

  const handleDragStart = (e: React.MouseEvent) => {
    if (!panelRef.current) {
      return;
    }
    const rect = panelRef.current.getBoundingClientRect();
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
      <div 
        className="flex flex-col items-end gap-2"
        style={{ width: panelSize?.width || 360 }}
      >
        <VersionBadge />
        <PanelControls />
        {shouldRender && (
          <div
            className="rounded-2xl p-4 shadow-2xl w-full overflow-hidden transition-all duration-300 ease-out relative"
            style={{
              backgroundColor: `${colors.BACKGROUND_DARK}aa`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${colors.BORDER}`,
              maxHeight: isAnimatingIn ? (panelSize?.height || 500) : '0px',
              opacity: isAnimatingIn ? 1 : 0,
              padding: isAnimatingIn ? '16px' : '0px 16px',
              transform: isAnimatingIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transformOrigin: panelPosition ? 'bottom left' : 'bottom right',
            }}
          >
            <DragHandle
              onMouseDown={handleDragStart}
              tooltipContent={t('help.tooltips.dragPanel')}
            />
            <div className="relative" style={{ maxHeight: (panelSize?.height || 500) - 120, overflowY: 'auto' }}>
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
            <Tabs
              tabs={tabs}
              activeTab={currentView}
              onChange={(tabId) => setCurrentView(tabId as ViewType)}
              direction="up"
            />
            <div
              className="flex items-center justify-center gap-1.5 mt-1 cursor-pointer"
              onClick={() => {
                const store = usePowerToolsStore.getState();
                store.setAutoRetryEnabled(!store.autoRetryEnabled);
              }}
              title={autoRetryEnabled ? 'Auto Retry ON - Click to disable' : 'Auto Retry OFF - Click to enable'}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: autoRetryEnabled ? '#22c55e' : '#ef4444',
                  boxShadow: autoRetryEnabled ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
                }}
              />
              {cooldownRemaining > 0 && autoRetryEnabled && (
                <span className="text-[10px] font-mono" style={{ color: colors.TEXT_SECONDARY }}>
                  {cooldownRemaining}s
                </span>
              )}
            </div>
            {/* Resize handle */}
            <div
              onMouseDown={handleResizeStart}
              className="absolute bottom-1 right-1 w-4 h-4 cursor-sw-resize opacity-50 hover:opacity-100 transition-opacity"
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '0 0 12px 12px',
                borderColor: `transparent transparent ${colors.TEXT_SECONDARY} transparent`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
