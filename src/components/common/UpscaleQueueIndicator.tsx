/**
 * Minimal upscale queue indicator component
 * Shows queue status above minimize/fullscreen buttons
 */

import React, { useState } from 'react';
import { useUpscaleQueueStore } from '@/store/useUpscaleQueueStore';
import { Icon } from './Icon';
import { mdiTrayFull, mdiClose, mdiCheck, mdiLoading, mdiAlertCircle } from '@mdi/js';
import { UI_COLORS } from '@/utils/constants';

export const UpscaleQueueIndicator: React.FC = () => {
  const {
    queue,
    isProcessing,
    batchProgress,
    completedInCurrentBatch,
    isDownloading,
    clearCompleted,
    clearAll,
    stopProcessing,
    startProcessing,
  } = useUpscaleQueueStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const pendingCount = queue.filter((item) => item.status === 'pending').length;
  const processingCount = queue.filter((item) => item.status === 'processing').length;
  const completedCount = queue.filter((item) => item.status === 'completed').length;
  const failedCount = queue.filter((item) => item.status === 'failed').length;
  const totalCount = queue.length;

  // Don't render if queue is empty
  if (totalCount === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icon path={mdiCheck} size={0.5} color="var(--color-success)" />;
      case 'processing':
        return <Icon path={mdiLoading} size={0.5} color="var(--color-glow-primary)" className="animate-spin" />;
      case 'failed':
        return <Icon path={mdiAlertCircle} size={0.5} color={UI_COLORS.DANGER} />;
      default:
        return <span className="w-2 h-2 rounded-full bg-theme-text-secondary" />;
    }
  };

  return (
    <div className="relative">
      {/* Main button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors relative bg-theme-bg-medium/[0.67] border border-theme-border backdrop-blur-xl hover:bg-theme-bg-light/[0.67]"
        data-tooltip-content={`Upscale Queue: ${processingCount + pendingCount} pending`}
      >
        <Icon path={mdiTrayFull} size={0.7} color="var(--color-text-secondary)" />

        {/* Badge */}
        <span
          className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 bg-theme-glow-primary text-theme-bg-dark ${isProcessing ? 'animate-pulse' : ''}`}
        >
          {processingCount + pendingCount}
        </span>
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg shadow-xl overflow-hidden bg-theme-bg-dark border border-theme-border">
          {/* Header */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-theme-border">
            <span className="text-xs font-medium text-theme-text-primary">
              Upscale Queue
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded hover:opacity-70"
            >
              <Icon path={mdiClose} size={0.5} color="var(--color-text-secondary)" />
            </button>
          </div>

          {/* Progress info */}
          {isProcessing && (
            <div className="px-3 py-2 border-b border-theme-border">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-theme-text-secondary">
                  Processing batch: {completedInCurrentBatch}/{Math.min(processingCount, 15)}
                </span>
                <span className="text-theme-glow-primary">{Math.round(batchProgress)}%</span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden bg-theme-bg-medium">
                <div
                  className="h-full transition-all duration-300 bg-theme-glow-primary"
                  style={{
                    width: `${batchProgress}%`,
                  }}
                />
              </div>
              {isDownloading && (
                <div className="text-[10px] mt-1 flex items-center gap-1 text-theme-success">
                  <Icon path={mdiLoading} size={0.5} className="animate-spin" />
                  Downloading completed videos
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="px-3 py-2 flex gap-3 text-[10px] border-b border-theme-border">
            <span className="text-theme-text-secondary">
              <span className="text-theme-text-primary">{pendingCount}</span> pending
            </span>
            <span className="text-theme-text-secondary">
              <span className="text-theme-glow-primary">{processingCount}</span> processing
            </span>
            <span className="text-theme-text-secondary">
              <span className="text-theme-success">{completedCount}</span> done
            </span>
            {failedCount > 0 && (
              <span className="text-theme-text-secondary">
                <span style={{ color: UI_COLORS.DANGER }}>{failedCount}</span> failed
              </span>
            )}
          </div>

          {/* Queue list */}
          <div className="max-h-48 overflow-y-scroll">
            {queue.slice(0, 20).map((item) => (
              <div
                key={item.videoId}
                className="px-3 py-1.5 flex items-center gap-2 text-[10px] border-b border-theme-border/[0.13]"
              >
                {getStatusIcon(item.status)}
                <span className="flex-1 truncate font-mono text-theme-text-secondary">
                  {item.videoId.slice(0, 12)}...
                </span>
                <span className="text-[9px] opacity-50 text-theme-text-secondary">
                  {item.status}
                </span>
              </div>
            ))}
            {queue.length > 20 && (
              <div className="px-3 py-1.5 text-[10px] text-center text-theme-text-secondary">
                +{queue.length - 20} more items
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-3 py-2 flex gap-2 border-t border-theme-border">
            {isProcessing ? (
              <button
                onClick={stopProcessing}
                className="flex-1 px-2 py-1 rounded text-[10px] transition-colors bg-theme-bg-medium text-theme-text-secondary border border-theme-border"
              >
                Pause
              </button>
            ) : (
              pendingCount > 0 && (
                <button
                  onClick={startProcessing}
                  className="flex-1 px-2 py-1 rounded text-[10px] transition-colors bg-theme-glow-primary text-theme-bg-dark"
                >
                  Resume
                </button>
              )
            )}
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="flex-1 px-2 py-1 rounded text-[10px] transition-colors bg-theme-bg-medium text-theme-text-secondary border border-theme-border"
              >
                Clear Done
              </button>
            )}
            <button
              onClick={() => {
                clearAll();
                setIsExpanded(false);
              }}
              className="px-2 py-1 rounded text-[10px] transition-colors bg-theme-bg-medium border border-theme-border"
              style={{ color: UI_COLORS.DANGER }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
