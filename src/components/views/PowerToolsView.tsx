import React from 'react';
import { mdiMinus, mdiPlus, mdiRestart } from '@mdi/js';
import { usePowerToolsStore } from '@/store/usePowerToolsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { Button } from '../inputs/Button';

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  id: string;
}) {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const clampedValue = Math.max(min, Math.min(max, value));

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const handleTextChange = (raw: string) => {
    if (raw.trim() === '') {
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="icon"
        icon={mdiMinus}
        iconSize={0.6}
        onClick={() => onChange(clamp(clampedValue - step))}
        disabled={clampedValue <= min}
        className="!w-7 !h-7"
        tooltip="Decrease"
      />
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={clampedValue}
        onChange={(e) => handleTextChange(e.target.value)}
        onBlur={() => onChange(clampedValue)}
        className="w-16 px-2 py-1 rounded-lg text-sm text-center focus:outline-none"
        style={{
          backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
          color: colors.TEXT_PRIMARY,
          border: `1px solid ${colors.BORDER}`,
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)',
        }}
      />
      <Button
        variant="icon"
        icon={mdiPlus}
        iconSize={0.6}
        onClick={() => onChange(clamp(clampedValue + step))}
        disabled={clampedValue >= max}
        className="!w-7 !h-7"
        tooltip="Increase"
      />
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  return (
    <div
      className="px-1 py-1 text-xs flex items-center justify-between"
      style={{
        borderBottom: `1px solid ${colors.BORDER}40`,
      }}
    >
      <span className="text-sm" style={{ color: colors.TEXT_SECONDARY }}>{label}</span>
      <span className="text-sm" style={{ color: colors.TEXT_PRIMARY }}>{value}</span>
    </div>
  );
}

export const PowerToolsView: React.FC = () => {
  const {
    autoRetryEnabled,
    maxRetries,
    cooldownSeconds,
    retryCount,
    retryStatus,
    cooldownRemaining,
    setAutoRetryEnabled,
    setMaxRetries,
    setCooldownSeconds,
    setRetryCount,
    videoGoalTarget,
    videoGoalCurrent,
    videoGoalStatus,
    setVideoGoalTarget,
    setVideoGoalCurrent,
  } = usePowerToolsStore();

  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const progressPercent = Math.min(100, (videoGoalCurrent / Math.max(1, videoGoalTarget)) * 100);
  const statusText = retryStatus !== 'Idle' ? retryStatus : videoGoalStatus;
  const isRetrying = cooldownRemaining > 0;
  const isWatching = autoRetryEnabled && !isRetrying;

  const handleToggle = (enabled: boolean) => {
    setAutoRetryEnabled(enabled);
    if (!enabled) {
      setRetryCount(0);
      setVideoGoalCurrent(0);
    }
  };

  const handleReset = () => {
    setRetryCount(0);
    setVideoGoalCurrent(0);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-scroll custom-scrollbar pr-2">
      <CollapsibleSection
        title="Auto Retry + Video Goal"
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        <div className="flex flex-col gap-3 mt-3">
          <div className="w-full">
            <Button
              onClick={() => handleToggle(!autoRetryEnabled)}
              className="w-full"
              style={autoRetryEnabled ? {
                backgroundColor: colors.GLOW_PRIMARY,
                borderColor: colors.GLOW_PRIMARY,
                color: colors.BACKGROUND_DARK,
              } : undefined}
              tooltip={autoRetryEnabled ? 'Turn auto retry off' : 'Turn auto retry on'}
            >
              Auto Retry: {autoRetryEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>

          {autoRetryEnabled && (
            <>
              <StatPill label="State" value={isRetrying ? `Retrying (${cooldownRemaining}s)` : isWatching ? 'Watching' : 'Off'} />
              <StatPill label="Retries" value={String(retryCount)} />
              <div className="px-1 py-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: colors.TEXT_SECONDARY }}>Progress</span>
                  <span className="text-sm" style={{ color: colors.TEXT_PRIMARY }}>
                    {videoGoalCurrent}/{videoGoalTarget}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ border: `1px solid ${colors.BORDER}55` }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: colors.PROGRESS_BAR,
                    }}
                  />
                </div>
              </div>
              <div className="px-1 py-1 text-sm" style={{ color: colors.TEXT_SECONDARY }}>
                {statusText}
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-2 px-1 py-1">
            <label className="text-sm" style={{ color: colors.TEXT_SECONDARY }} htmlFor="powertools-max-retries">
              Max Retries
            </label>
            <NumberInput id="powertools-max-retries" value={maxRetries} onChange={setMaxRetries} min={1} max={9999} />
          </div>

          <div className="flex items-center justify-between gap-2 px-1 py-1">
            <label className="text-sm" style={{ color: colors.TEXT_SECONDARY }} htmlFor="powertools-cooldown">
              Cooldown
            </label>
            <NumberInput id="powertools-cooldown" value={cooldownSeconds} onChange={setCooldownSeconds} min={1} max={60} />
          </div>

          <div className="flex items-center justify-between gap-2 px-1 py-1">
            <label className="text-sm" style={{ color: colors.TEXT_SECONDARY }} htmlFor="powertools-video-goal">
              Video Goal
            </label>
            <NumberInput id="powertools-video-goal" value={videoGoalTarget} onChange={setVideoGoalTarget} min={1} max={500} />
          </div>

          <div className="flex justify-end">
            <Button
              icon={mdiRestart}
              onClick={handleReset}
              disabled={autoRetryEnabled || (retryCount === 0 && videoGoalCurrent === 0)}
              className="text-xs"
              tooltip="Reset counters"
            >
              Reset Counters
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default PowerToolsView;
