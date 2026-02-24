import React, { useState } from 'react';
import { useAnalyticsStore, PromptAnalyticsEntry } from '@/store/useAnalyticsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/inputs/Button';
import { Icon } from '@/components/common/Icon';
import { mdiChartBar, mdiDelete, mdiContentCopy, mdiTrendingUp, mdiTrendingDown } from '@mdi/js';

export const AnalyticsPanel: React.FC = () => {
  const { entries, getTopPrompts, clearAnalytics } = useAnalyticsStore();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);

  const topPrompts = getTopPrompts(5);
  const totalUsed = entries.reduce((sum, e) => sum + e.timesUsed, 0);
  const totalSuccess = entries.reduce((sum, e) => sum + e.timesSucceeded, 0);
  const totalModerated = entries.reduce((sum, e) => sum + e.timesModerated, 0);
  const successRate = totalUsed > 0 ? Math.round((totalSuccess / totalUsed) * 100) : 0;

  if (entries.length === 0 && !isExpanded) {
    return null;
  }

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getSuccessRate = (entry: PromptAnalyticsEntry): number => {
    if (entry.timesUsed === 0) return 0;
    return Math.round((entry.timesSucceeded / entry.timesUsed) * 100);
  };

  return (
    <div className="mt-3">
      <div
        className="flex items-center justify-between cursor-pointer py-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon path={mdiChartBar} size={0.8} color={colors.TEXT_SECONDARY} />
          <span
            className="text-xs font-medium"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            Analytics ({entries.length} prompts)
          </span>
        </div>
        <span
          className="text-xs"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div
          className="mt-2 rounded-lg p-3"
          style={{
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          {entries.length === 0 ? (
            <p
              className="text-xs text-center py-2"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              No analytics data yet. Use prompts to start tracking.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded" style={{ backgroundColor: `${colors.BACKGROUND_LIGHT}50` }}>
                  <div className="text-lg font-bold" style={{ color: colors.TEXT_PRIMARY }}>{totalUsed}</div>
                  <div className="text-xs" style={{ color: colors.TEXT_SECONDARY }}>Used</div>
                </div>
                <div className="text-center p-2 rounded" style={{ backgroundColor: `${colors.BACKGROUND_LIGHT}50` }}>
                  <div className="text-lg font-bold" style={{ color: colors.SUCCESS || '#4ade80' }}>{totalSuccess}</div>
                  <div className="text-xs" style={{ color: colors.TEXT_SECONDARY }}>Success</div>
                </div>
                <div className="text-center p-2 rounded" style={{ backgroundColor: `${colors.BACKGROUND_LIGHT}50` }}>
                  <div className="text-lg font-bold" style={{ color: colors.DANGER || '#f87171' }}>{totalModerated}</div>
                  <div className="text-xs" style={{ color: colors.TEXT_SECONDARY }}>Moderated</div>
                </div>
              </div>

              <div className="text-center mb-3 p-2 rounded" style={{ backgroundColor: `${colors.BACKGROUND_LIGHT}30` }}>
                <span className="text-xs" style={{ color: colors.TEXT_SECONDARY }}>Success Rate: </span>
                <span className="text-sm font-bold" style={{ color: successRate >= 70 ? (colors.SUCCESS || '#4ade80') : successRate >= 40 ? colors.TEXT_PRIMARY : (colors.DANGER || '#f87171') }}>
                  {successRate}%
                </span>
              </div>

              <div className="mb-2">
                <div className="text-xs font-medium mb-2" style={{ color: colors.TEXT_SECONDARY }}>
                  Top Performing Prompts
                </div>
                <div className="flex flex-col gap-2">
                  {topPrompts.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-2 p-2 rounded"
                      style={{
                        backgroundColor: `${colors.BACKGROUND_LIGHT}50`,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs truncate"
                          style={{ color: colors.TEXT_PRIMARY }}
                          title={entry.text}
                        >
                          {entry.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs flex items-center gap-1" style={{ color: colors.SUCCESS || '#4ade80' }}>
                            <Icon path={mdiTrendingUp} size={0.5} />
                            {entry.timesSucceeded}
                          </span>
                          <span className="text-xs flex items-center gap-1" style={{ color: colors.DANGER || '#f87171' }}>
                            <Icon path={mdiTrendingDown} size={0.5} />
                            {entry.timesModerated}
                          </span>
                          <span className="text-xs" style={{ color: colors.TEXT_SECONDARY }}>
                            {getSuccessRate(entry)}% success
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="icon"
                        icon={mdiContentCopy}
                        onClick={() => handleCopyPrompt(entry.text)}
                        tooltip="Copy prompt"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  icon={mdiDelete}
                  onClick={() => {
                    if (confirm('Clear all analytics data?')) {
                      clearAnalytics();
                    }
                  }}
                  className="text-xs"
                >
                  Clear Data
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
