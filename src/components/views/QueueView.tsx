/**
 * Queue view component - shows upscale queue management
 */

import React from 'react';
import { useUpscaleQueueStore } from '@/store/useUpscaleQueueStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from '../common/Icon';
import { Button } from '../inputs/Button';
import { mdiCheck, mdiLoading, mdiAlertCircle } from '@mdi/js';
import { UI_COLORS } from '@/utils/constants';

export const QueueView: React.FC = () => {
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

  const pendingCount = queue.filter((item) => item.status === 'pending').length;
  const processingCount = queue.filter((item) => item.status === 'processing').length;
  const completedCount = queue.filter((item) => item.status === 'completed').length;
  const failedCount = queue.filter((item) => item.status === 'failed').length;
  const totalCount = queue.length;

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

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-base opacity-50" style={{ color: colors.TEXT_SECONDARY }}>
          Queue is empty
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="pb-3">
        <h2 className="text-base font-medium" style={{ color: colors.TEXT_PRIMARY }}>
          Upscale Queue
        </h2>
      </div>

      {/* Progress info */}
      {isProcessing && (
        <div className="mb-3 pb-3" style={{ borderBottom: `1px solid ${colors.BORDER}` }}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: colors.TEXT_SECONDARY }}>
              Processing batch: {completedInCurrentBatch}/{Math.min(processingCount, 15)}
            </span>
            <span style={{ color: colors.GLOW_PRIMARY }}>{Math.round(batchProgress)}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
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
            <div className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.SUCCESS }}>
              <Icon path={mdiLoading} size={0.6} className="animate-spin" />
              Downloading completed videos
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div
        className="mb-3 pb-3 flex gap-3 text-xs"
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
      <div className="max-h-64 overflow-y-auto mb-3">
        {queue.slice(0, 20).map((item) => (
          <div
            key={item.videoId}
            className="py-2 flex items-center gap-2 text-xs"
            style={{ borderBottom: `1px solid ${colors.BORDER}20` }}
          >
            {getStatusIcon(item.status)}
            <span
              className="flex-1 truncate font-mono"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              {item.videoId.slice(0, 16)}...
            </span>
            <span
              className="text-[10px] opacity-50"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              {item.status}
            </span>
          </div>
        ))}
        {queue.length > 20 && (
          <div
            className="py-2 text-xs text-center"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            +{queue.length - 20} more items
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isProcessing ? (
          <Button onClick={stopProcessing} className="flex-1">
            Pause
          </Button>
        ) : (
          pendingCount > 0 && (
            <Button
              onClick={startProcessing}
              className="flex-1 !bg-white"
              style={{
                backgroundColor: colors.GLOW_PRIMARY,
                color: colors.BACKGROUND_DARK,
              }}
            >
              Resume
            </Button>
          )
        )}
        {completedCount > 0 && (
          <Button onClick={clearCompleted} className="flex-1">
            Clear Done
          </Button>
        )}
        <Button
          onClick={clearAll}
          className="opacity-50"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};
