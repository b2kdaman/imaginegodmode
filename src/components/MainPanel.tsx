/**
 * Main floating panel component
 */

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { PromptView } from './PromptView';
import { StatusView } from './StatusView';
import { UI_POSITION } from '@/utils/constants';
import { Button } from './Button';
import { mdiChevronUp, mdiChevronDown } from '@mdi/js';

export const MainPanel: React.FC = () => {
  const { isExpanded, currentView, toggleExpanded, setCurrentView } = useUIStore();

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
            {/* View switcher */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="view-switcher"
                onClick={() => setCurrentView('prompt')}
                isActive={currentView === 'prompt'}
                className="flex-1"
              >
                Prompt
              </Button>

              <Button
                variant="view-switcher"
                onClick={() => setCurrentView('status')}
                isActive={currentView === 'status'}
                className="flex-1"
              >
                Status
              </Button>
            </div>

            {/* View content */}
            {currentView === 'prompt' ? <PromptView /> : <StatusView />}
          </div>
        )}
      </div>
    </div>
  );
};
