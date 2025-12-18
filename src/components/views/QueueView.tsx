/**
 * Queue view component - shows unified job queue management
 */

import React from 'react';
import { useJobQueueStore } from '@/store/useJobQueueStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from '../common/Icon';
import { Button } from '../inputs/Button';
import {
  mdiCheck,
  mdiLoading,
  mdiAlertCircle,
  mdiImageSizeSelectLarge,
  mdiDownload,
  mdiHeartBroken,
  mdiHeart,
  mdiDelete,
  mdiCog,
} from '@mdi/js';
import { UI_COLORS } from '@/utils/constants';
import { JobType } from '@/types';

// Icon and label mapping for job types
const JOB_TYPE_INFO: Record<JobType, { icon: string; label: string; color?: string }> = {
  'process-for-upscale': { icon: mdiCog, label: 'Processing Posts' },
  upscale: { icon: mdiImageSizeSelectLarge, label: 'Upscaling' },
  download: { icon: mdiDownload, label: 'Downloading' },
  unlike: { icon: mdiHeartBroken, label: 'Unliking', color: UI_COLORS.DANGER },
  relike: { icon: mdiHeart, label: 'Re-liking' },
  'purge-liked': { icon: mdiDelete, label: 'Purging Liked Posts', color: UI_COLORS.DANGER },
  'purge-archive': { icon: mdiDelete, label: 'Purging Archive', color: UI_COLORS.DANGER },
  'purge-packs': { icon: mdiDelete, label: 'Purging Packs', color: UI_COLORS.DANGER },
};

export const QueueView: React.FC = () => {
  const {
    jobs,
    isProcessing,
    clearCompleted,
    clearAll,
    stopProcessing,
    startProcessing,
  } = useJobQueueStore();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const pendingJobs = jobs.filter((job) => job.status === 'pending');
  const processingJobs = jobs.filter((job) => job.status === 'processing');
  const completedJobs = jobs.filter((job) => job.status === 'completed');
  const failedJobs = jobs.filter((job) => job.status === 'failed');

  const pendingCount = pendingJobs.length;
  const completedCount = completedJobs.length;
  const failedCount = failedJobs.length;
  const totalCount = jobs.length;

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

  const getJobDescription = (job: typeof jobs[0]): string => {
    const info = JOB_TYPE_INFO[job.type];
    const itemText = job.totalItems === 1 ? 'item' : 'items';
    return `${info.label} ${job.totalItems} ${itemText}`;
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
          Job Queue
        </h2>
      </div>

      {/* Current job progress */}
      {processingJobs.length > 0 && processingJobs[0] && (
        <div className="mb-3 pb-3" style={{ borderBottom: `1px solid ${colors.BORDER}` }}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: colors.TEXT_SECONDARY }}>
              {getJobDescription(processingJobs[0])}
            </span>
            <span style={{ color: colors.GLOW_PRIMARY }}>{Math.round(processingJobs[0].progress)}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.BACKGROUND_MEDIUM }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${processingJobs[0].progress}%`,
                backgroundColor: colors.GLOW_PRIMARY,
              }}
            />
          </div>
          <div className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.TEXT_SECONDARY }}>
            Processing: {processingJobs[0].processedItems}/{processingJobs[0].totalItems}
          </div>
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
        {processingJobs.length > 0 && (
          <span style={{ color: colors.TEXT_SECONDARY }}>
            <span style={{ color: colors.GLOW_PRIMARY }}>{processingJobs.length}</span> processing
          </span>
        )}
        <span style={{ color: colors.TEXT_SECONDARY }}>
          <span style={{ color: colors.SUCCESS }}>{completedCount}</span> done
        </span>
        {failedCount > 0 && (
          <span style={{ color: colors.TEXT_SECONDARY }}>
            <span style={{ color: UI_COLORS.DANGER }}>{failedCount}</span> failed
          </span>
        )}
      </div>

      {/* Jobs list */}
      <div className="max-h-64 overflow-y-auto mb-3">
        {jobs.slice(0, 20).map((job) => {
          const info = JOB_TYPE_INFO[job.type];

          return (
            <div
              key={job.id}
              className="py-2 flex items-start gap-2 text-xs"
              style={{ borderBottom: `1px solid ${colors.BORDER}20` }}
            >
              {/* Status icon */}
              <div className="pt-0.5">{getStatusIcon(job.status)}</div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon
                    path={info.icon}
                    size={0.6}
                    color={info.color || colors.TEXT_PRIMARY}
                  />
                  <span
                    className="font-medium truncate"
                    style={{ color: colors.TEXT_PRIMARY }}
                  >
                    {getJobDescription(job)}
                  </span>
                </div>

                {/* Progress bar for processing jobs */}
                {job.status === 'processing' && (
                  <div
                    className="w-full h-1 rounded-full overflow-hidden mt-1"
                    style={{ backgroundColor: colors.BACKGROUND_MEDIUM }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${job.progress}%`,
                        backgroundColor: colors.GLOW_PRIMARY,
                      }}
                    />
                  </div>
                )}

                {/* Error message for failed jobs */}
                {job.status === 'failed' && job.error && (
                  <div
                    className="text-[10px] mt-1 opacity-70"
                    style={{ color: UI_COLORS.DANGER }}
                  >
                    {job.error}
                  </div>
                )}
              </div>

              {/* Status text */}
              <span
                className="text-[10px] opacity-50 whitespace-nowrap"
                style={{ color: colors.TEXT_SECONDARY }}
              >
                {job.status === 'processing'
                  ? `${job.processedItems}/${job.totalItems}`
                  : job.status}
              </span>
            </div>
          );
        })}
        {jobs.length > 20 && (
          <div
            className="py-2 text-xs text-center"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            +{jobs.length - 20} more jobs
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
