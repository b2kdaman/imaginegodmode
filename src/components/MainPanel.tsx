/**
 * Main floating panel component
 */

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { PromptView } from './PromptView';
import { OpsView } from './OpsView';
import { UI_POSITION } from '@/utils/constants';
import { Button } from './Button';
import { Tabs } from './Tabs';
import { mdiChevronUp, mdiChevronDown } from '@mdi/js';

export const MainPanel: React.FC = () => {
  const { isExpanded, currentView, toggleExpanded, setCurrentView } = useUIStore();

  const tabs = [
    { id: 'prompt', label: 'Prompt' },
    { id: 'ops', label: 'Ops' },
  ];

  return (
    <div
      className="fixed z-[99999] flex flex-col"
      style={{
        bottom: UI_POSITION.BOTTOM,
        right: UI_POSITION.RIGHT,
      }}
    >
      {/* Main container */}
      <div className="flex flex-col items-end gap-2">
        {/* Toggle button */}
        <Button
          variant="icon"
          onClick={toggleExpanded}
          icon={isExpanded ? mdiChevronDown : mdiChevronUp}
          iconSize={0.9}
          className="bg-grok-dark shadow-lg"
          title={isExpanded ? 'Collapse panel' : 'Expand panel'}
        />

        {/* Content wrapper */}
        {isExpanded && (
          <div className="bg-grok-dark border border-white/20 rounded-2xl p-4 shadow-2xl w-[320px]">
            {/* Tabs */}
            <Tabs
              tabs={tabs}
              activeTab={currentView}
              onChange={(tabId) => setCurrentView(tabId as any)}
            />

            {/* View content */}
            {currentView === 'prompt' ? <PromptView /> : <OpsView />}
          </div>
        )}
      </div>
    </div>
  );
};
