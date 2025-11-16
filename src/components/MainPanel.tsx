/**
 * Main floating panel component
 */

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { PromptView } from './PromptView';
import { StatusView } from './StatusView';
import { UI_POSITION } from '@/utils/constants';
import { Icon } from './Icon';
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
        <button
          onClick={toggleExpanded}
          className="w-9 h-9 rounded-full bg-grok-dark text-white border border-white/20 hover:bg-grok-gray transition-colors shadow-lg flex items-center justify-center"
          title={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          <Icon path={isExpanded ? mdiChevronDown : mdiChevronUp} size={0.9} />
        </button>

        {/* Content wrapper */}
        {isExpanded && (
          <div className="bg-grok-dark border border-white/20 rounded-2xl p-4 shadow-2xl w-[320px]">
            {/* View switcher */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCurrentView('prompt')}
                className={`flex-1 px-3 py-2 rounded-full text-xs transition-colors ${
                  currentView === 'prompt'
                    ? 'bg-grok-light text-white border border-white/20'
                    : 'bg-grok-gray text-white/50 border border-white/10 hover:text-white/70'
                }`}
              >
                Prompt
              </button>

              <button
                onClick={() => setCurrentView('status')}
                className={`flex-1 px-3 py-2 rounded-full text-xs transition-colors ${
                  currentView === 'status'
                    ? 'bg-grok-light text-white border border-white/20'
                    : 'bg-grok-gray text-white/50 border border-white/10 hover:text-white/70'
                }`}
              >
                Status
              </button>
            </div>

            {/* View content */}
            {currentView === 'prompt' ? <PromptView /> : <StatusView />}
          </div>
        )}
      </div>
    </div>
  );
};
