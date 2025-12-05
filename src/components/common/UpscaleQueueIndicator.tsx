/**
 * Minimal upscale queue indicator component
 * Shows queue status above minimize/fullscreen buttons
 */

import React, { useState } from 'react';
import { useUpscaleQueueStore } from '@/store/useUpscaleQueueStore';
import { useSettingsStore } from '@/store/useSettingsStore';
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
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

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
        return <Icon path={mdiCheck} size={0.5} color={colors.SUCCESS} />;
      case 'processing':
        return <Icon path={mdiLoading} size={0.5} color={colors.GLOW_PRIMARY} className="animate-spin" />;
      case 'failed':
        return <Icon path={mdiAlertCircle} size={0.5} color={UI_COLORS.DANGER} />;
      default:
        return <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.TEXT_SECONDARY }} />;
    }
  };

  return (
    <div className="relative">
      {/* Main button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors relative"
        style={{
          backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
          border: `1px solid ${colors.BORDER}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        data-tooltip-id="app-tooltip"
        data-tooltip-content={`Upscale Queue: ${processingCount + pendingCount} pending`}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.BACKGROUND_LIGHT}aa`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.BACKGROUND_MEDIUM}aa`;
        }}
      >
        <Icon path={mdiTrayFull} size={0.7} color={colors.TEXT_SECONDARY} />

        {/* Badge */}
        <span
          className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${isProcessing ? 'animate-pulse' : ''}`}
          style={{
            backgroundColor: colors.GLOW_PRIMARY,
            color: colors.BACKGROUND_DARK,
          }}
        >
          {processingCount + pendingCount}
        </span>
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div
          className="absolute bottom-full right-0 mb-2 w-64 rounded-lg shadow-xl overflow-hidden"
          style={{
            backgroundColor: colors.BACKGROUND_DARK,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          {/* Header */}
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${colors.BORDER}` }}
          >
            <span className="text-xs font-medium" style={{ color: colors.TEXT_PRIMARY }}>
              Upscale Queue
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded hover:opacity-70"
            >
              <Icon path={mdiClose} size={0.5} color={colors.TEXT_SECONDARY} />
            </button>
          </div>

          {/* Progress info */}
          {isProcessing && (
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${colors.BORDER}` }}>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span style={{ color: colors.TEXT_SECONDARY }}>
                  Processing batch: {completedInCurrentBatch}/{Math.min(processingCount, 15)}
                </span>
                <span style={{ color: colors.GLOW_PRIMARY }}>{Math.round(batchProgress)}%</span>
              </div>
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.BACKGROUND_MEDIUM }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${batchProgress}%`,
                    backgroundColor: colors.GLOW_PRIMARY,
                  }}
                />
              </div>
              {isDownloading && (
                <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: colors.SUCCESS }}>
                  <Icon path={mdiLoading} size={0.5} className="animate-spin" />
                  Downloading completed videos
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div
            className="px-3 py-2 flex gap-3 text-[10px]"
            style={{ borderBottom: `1px solid ${colors.BORDER}` }}
          >
            <span style={{ color: colors.TEXT_SECONDARY }}>
              <span style={{ color: colors.TEXT_PRIMARY }}>{pendingCount}</span> pending
            </span>
            <span style={{ color: colors.TEXT_SECONDARY }}>
              <span style={{ color: colors.GLOW_PRIMARY }}>{processingCount}</span> processing
            </span>
            <span style={{ color: colors.TEXT_SECONDARY }}>
              <span style={{ color: colors.SUCCESS }}>{completedCount}</span> done
            </span>
            {failedCount > 0 && (
              <span style={{ color: colors.TEXT_SECONDARY }}>
                <span style={{ color: UI_COLORS.DANGER }}>{failedCount}</span> failed
              </span>
            )}
          </div>

          {/* Queue list */}
          <div className="max-h-48 overflow-y-scroll">
            {queue.slice(0, 20).map((item) => (
              <div
                key={item.videoId}
                className="px-3 py-1.5 flex items-center gap-2 text-[10px]"
                style={{ borderBottom: `1px solid ${colors.BORDER}20` }}
              >
                {getStatusIcon(item.status)}
                <span
                  className="flex-1 truncate font-mono"
                  style={{ color: colors.TEXT_SECONDARY }}
                >
                  {item.videoId.slice(0, 12)}...
                </span>
                <span
                  className="text-[9px] opacity-50"
                  style={{ color: colors.TEXT_SECONDARY }}
                >
                  {item.status}
                </span>
              </div>
            ))}
            {queue.length > 20 && (
              <div
                className="px-3 py-1.5 text-[10px] text-center"
                style={{ color: colors.TEXT_SECONDARY }}
              >
                +{queue.length - 20} more items
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className="px-3 py-2 flex gap-2"
            style={{ borderTop: `1px solid ${colors.BORDER}` }}
          >
            {isProcessing ? (
              <button
                onClick={stopProcessing}
                className="flex-1 px-2 py-1 rounded text-[10px] transition-colors"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_SECONDARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Pause
              </button>
            ) : (
              pendingCount > 0 && (
                <button
                  onClick={startProcessing}
                  className="flex-1 px-2 py-1 rounded text-[10px] transition-colors"
                  style={{
                    backgroundColor: colors.GLOW_PRIMARY,
                    color: colors.BACKGROUND_DARK,
                  }}
                >
                  Resume
                </button>
              )
            )}
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="flex-1 px-2 py-1 rounded text-[10px] transition-colors"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_SECONDARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Clear Done
              </button>
            )}
            <button
              onClick={() => {
                clearAll();
                setIsExpanded(false);
              }}
              className="px-2 py-1 rounded text-[10px] transition-colors"
              style={{
                backgroundColor: colors.BACKGROUND_MEDIUM,
                color: UI_COLORS.DANGER,
                border: `1px solid ${colors.BORDER}`,
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
