/**
 * Minimal job queue indicator component
 * Shows queue status above minimize/fullscreen buttons
 */

import React, { useState } from 'react';
import { useJobQueueStore } from '@/store/useJobQueueStore';
import { Icon } from './Icon';
import {
  mdiTrayFull,
  mdiClose,
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

// Icon mapping for job types
const JOB_TYPE_ICONS: Record<JobType, string> = {
  'process-for-upscale': mdiCog,
  upscale: mdiImageSizeSelectLarge,
  download: mdiDownload,
  unlike: mdiHeartBroken,
  relike: mdiHeart,
  'purge-liked': mdiDelete,
  'purge-archive': mdiDelete,
  'purge-packs': mdiDelete,
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
  'process-for-upscale': 'Processing',
  upscale: 'Upscale',
  download: 'Download',
  unlike: 'Unlike',
  relike: 'Relike',
  'purge-liked': 'Purge Liked',
  'purge-archive': 'Purge Archive',
  'purge-packs': 'Purge Packs',
};

export const JobQueueIndicator: React.FC = () => {
  const {
    jobs,
    isProcessing,
    clearCompleted,
    clearAll,
    stopProcessing,
    startProcessing,
  } = useJobQueueStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const pendingJobs = jobs.filter((job) => job.status === 'pending');
  const processingJobs = jobs.filter((job) => job.status === 'processing');
  const completedJobs = jobs.filter((job) => job.status === 'completed');
  const failedJobs = jobs.filter((job) => job.status === 'failed');

  const pendingCount = pendingJobs.length;
  const processingCount = processingJobs.length;
  const completedCount = completedJobs.length;
  const failedCount = failedJobs.length;
  const totalCount = jobs.length;

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

  const activeJobsCount = processingCount + pendingCount;

  return (
    <div className="relative">
      {/* Main button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors relative bg-theme-bg-medium/[0.67] border border-theme-border backdrop-blur-xl hover:bg-theme-bg-light/[0.67]"
        data-tooltip-content={`Job Queue: ${activeJobsCount} active job${activeJobsCount === 1 ? '' : 's'}`}
      >
        <Icon path={mdiTrayFull} size={0.7} color="var(--color-text-secondary)" />

        {/* Badge */}
        <span
          className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 bg-theme-glow-primary text-theme-bg-dark ${isProcessing ? 'animate-pulse' : ''}`}
        >
          {activeJobsCount}
        </span>
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg shadow-xl overflow-hidden bg-theme-bg-dark border border-theme-border">
          {/* Header */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-theme-border">
            <span className="text-xs font-medium text-theme-text-primary">
              Job Queue
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded hover:opacity-70"
            >
              <Icon path={mdiClose} size={0.5} color="var(--color-text-secondary)" />
            </button>
          </div>

          {/* Progress info for current job */}
          {processingJobs.length > 0 && processingJobs[0] && (
            <div className="px-3 py-2 border-b border-theme-border">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-theme-text-secondary">
                  {JOB_TYPE_LABELS[processingJobs[0].type]}: {processingJobs[0].processedItems}/{processingJobs[0].totalItems}
                </span>
                <span className="text-theme-glow-primary">{Math.round(processingJobs[0].progress)}%</span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden bg-theme-bg-medium">
                <div
                  className="h-full transition-all duration-300 bg-theme-glow-primary"
                  style={{
                    width: `${processingJobs[0].progress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="px-3 py-2 flex gap-3 text-[10px] border-b border-theme-border">
            <span className="text-theme-text-secondary">
              <span className="text-theme-text-primary">{pendingCount}</span> pending
            </span>
            {processingCount > 0 && (
              <span className="text-theme-text-secondary">
                <span className="text-theme-glow-primary">{processingCount}</span> processing
              </span>
            )}
            <span className="text-theme-text-secondary">
              <span className="text-theme-success">{completedCount}</span> done
            </span>
            {failedCount > 0 && (
              <span className="text-theme-text-secondary">
                <span style={{ color: UI_COLORS.DANGER }}>{failedCount}</span> failed
              </span>
            )}
          </div>

          {/* Jobs list */}
          <div className="max-h-48 overflow-y-scroll">
            {jobs.slice(0, 10).map((job) => (
              <div
                key={job.id}
                className="px-3 py-1.5 flex items-center gap-2 text-[10px] border-b border-theme-border/[0.13]"
              >
                {getStatusIcon(job.status)}
                <Icon
                  path={JOB_TYPE_ICONS[job.type]}
                  size={0.5}
                  color="var(--color-text-secondary)"
                />
                <span className="flex-1 truncate text-theme-text-secondary">
                  {JOB_TYPE_LABELS[job.type]} ({job.totalItems})
                </span>
                {job.status === 'processing' && (
                  <span className="text-[9px] text-theme-glow-primary">
                    {Math.round(job.progress)}%
                  </span>
                )}
              </div>
            ))}
            {jobs.length > 10 && (
              <div className="px-3 py-1.5 text-[10px] text-center text-theme-text-secondary">
                +{jobs.length - 10} more jobs
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
